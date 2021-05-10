const db = require('../schemes/mongo');

const Archive = db.archive;
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
    let Archive = await Archive.findById(id);
    // copy ArchiveObject properties to user
    Object.assign(Archive, ArchiveObject);
    //save to db
    return Archive.save();
}

async function archiveCurrentDay() {
    //validate

    //check if archive entry for current day exists
    let today = dateTransformer.transformDateTimeString(Date.now()).date;
    let todaysArchive = await Archive.findOne({"date": today});

    //create new object
    let trackData = await trackDataService.getAll();
    let checkinData = await checkinDataService.getAll();
    let tracks = await trackService.get();
    let settings = await settingsService.get();

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