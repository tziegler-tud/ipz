const db = require('../schemes/mongo');

const Archive = db.archive;
const TrackData = db.trackData;
const CheckinData = db.checkinData;
const settingsService = require('./settingsService');
const trackService = require('./trackService');
const trackDataService = require('./trackDataService');
const checkinDataService = require('./dataService');

const dateTransformer = require('../helpers/dateTransformer');

module.exports = {
    get,
    getById,
    add,
    remove,
    update,
    archiveCurrentDay,
    resetCurrentDay,
    restoreDay,
};

/**
 * Gets all archive documents
 */
async function get() {
    return Archive.find();
}

async function getById(id) {
    return Archive.findById(id);
}

async function add(ArchiveObject) {
    //validate
    if (ArchiveObject === undefined) {
        throw new Error("empty payload");
    }
    if (ArchiveObject.timestamp === undefined) {
        throw new Error("empty payload");
    }

    //create new object

    let ArchiveDbObject = new Archive(ArchiveObject);
    await ArchiveDbObject.save();
    return ArchiveDbObject;
}

/**
 *
 * @param id {ObjectId}
 * @returns {Promise<*>}
 */
async function remove(id) {
    if(id === undefined) {
        throw new Error("Invalid arguments received: id is empty.");
    }
    return Archive.findByIdAndRemove(id);
}



async function update(id, ArchiveObject) {
    if(ArchiveObject === undefined ||id === undefined) {
        throw new Error("Failed to update Archive: Invalid arguments received")
    }
    //find current entry
    let archive = await Archive.findById(id);
    // copy ArchiveObject properties to user
    Object.assign(archive, ArchiveObject);
    //save to db
    return archive.save();
}

async function archiveCurrentDay() {
    //validate

    //check if archive entry for current day exists
    let today = dateTransformer.transformDateTimeString(Date.now()).date;
    let todaysArchive = await Archive.findOne({"date": today});


    /*
    Careful: sorting limits results to 1000 documents in mongo 2.6. To prevent this for now, we must retrieve the data unsorted and do a custom sorting.
     This is a major setback in performance, but acceptable as this happens only once a day at midnight.
     TODO: Update Mongo version on rasperry pi to >3.2 (64bit) and let mongo sort the data
     */

    /*
    code for mongo >3.2
    */
    // let args = {
    //     sort: {"timestamp": 1},
    // }
    //
    // //create new object
    // let trackData = await trackDataService.getAll(args);
    // let checkinData = await checkinDataService.getAll(args);
    // let tracks = await trackService.get();
    // let settings = await settingsService.get();

    /*
    code for mongo 2.6
     */
    let trackData = await trackDataService.getAll();
    let checkinData = await checkinDataService.getAll();
    let tracks = await trackService.get();
    let settings = await settingsService.get();

    //sort track and checkin data by timestamp
    trackData.sort(function(first, second){
        return first.timestamp - second.timestamp;
    })

    checkinData.sort(function(first, second){
        return first.timestamp - second.timestamp;
    })




    let ArchiveObject = {
        timestamp: Date.now(),
        date: today,
        data: {
            checkindatas: checkinData,
            trackDatas: trackData,
            tracks: tracks,
            settings: settings,
        }
    }

    if(!todaysArchive) {
        //create new archive document

        let ArchiveDbObject = new Archive(ArchiveObject);
        await ArchiveDbObject.save();
        return ArchiveDbObject;
    }
    else {
        //update todays document
        Object.assign(todaysArchive, ArchiveObject);
        return todaysArchive.save();
    }

}

async function resetCurrentDay() {
    // copy ArchiveObject properties to user
    trackDataService.clearAll();
    checkinDataService.clearAll();
}

async function restoreDay(dateString) {
    let archive, trackData, checkinData;
    if(dateString === undefined || dateString === "current") {
        return false;
    }
    else {
        //get by date
        archive = await Archive.findOne({"date": dateString});
        trackData = archive.data.trackDatas;
        checkinData = archive.data.checkindatas;
    }

    //drop current trackdatas and checkindatas
    await trackDataService.clearAll();
    await checkinDataService.clearAll();

    let current = new Date();
    trackData.forEach(function(trackDataEntry){
        let date = new Date(trackDataEntry.timestamp);
        date.setDate(current.getDate());
        date.setMonth(current.getMonth());
        date.setFullYear(current.getFullYear());
        let dbObj = new TrackData(trackDataEntry);
        return dbObj.save();
    })
    checkinData.forEach(function(trackDataEntry){
        let date = new Date(trackDataEntry.timestamp);
        date.setDate(current.getDate());
        date.setMonth(current.getMonth());
        date.setFullYear(current.getFullYear());
        let dbObj = new CheckinData(trackDataEntry);
        return dbObj.save();
    })

}