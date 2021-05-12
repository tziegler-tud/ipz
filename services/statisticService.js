const db = require('../schemes/mongo');

const Archive = db.archive;
const settingsService = require('./settingsService');
const trackService = require('./trackService');
const trackDataService = require('./trackDataService');
const checkinDataService = require('./dataService');

const dateTransformer = require('../helpers/dateTransformer');

module.exports = {
    get,
    getByDate,
    getById,
};

/**
 * Gets all archive documents
 */
async function get() {
    return getById();
}

async function getById(id) {
    let archive, trackData, checkinData, date;
    if(id === undefined) {
        //get current
        const trackDataPromise = trackDataService.getAll();
        const checkinDataPromise = checkinDataService.getAll();
        const data = await Promise.all([trackDataPromise, checkinDataPromise]);
        trackData = data[0];
        checkinData = data[1];
        date = dateTransformer.transformDateTimeString(Date.now()).date;

    }
    else {
        archive = await Archive.findById(id);
        trackData = archive.data.trackDatas;
        checkinData = archive.data.checkinDatas;
        date = archive.date;
    }

    let archiveData = {
        date: date,
        trackData: trackData,
        checkinData: checkinData,
    }

    let output = parseDataToOutputFormat(archiveData);
    return output;
}

/**
 * gets statistics for the day specified by the date parameter
 * @param dateString {String} the date to query. must be of form "DD.MM.YYYY" or "current"
 * @returns {Promise<*>}
 */
async function getByDate(dateString) {
    let archive, trackData, checkinData;
    if(dateString === undefined || dateString === "current") {
        return getById();
    }
    else {
        //get by date
        archive = await Archive.findOne({"date": dateString});
        trackData = archive.data.trackDatas;
        checkinData = archive.data.checkindatas;
    }

    let archiveData = {
        date: dateString,
        trackData: trackData,
        checkinData: checkinData,
    }

    let output = parseDataToOutputFormat(archiveData);
    return output;
}


function parseDataToOutputFormat(archiveData){

    //transform trackData to Array of objects: [{x: Date, y:count}]
    let trackStatisticData = archiveData.trackData.map(function(trackEntry, index){
        let trackDate = new Date(trackEntry.timestamp);
        let trackValue = trackEntry.type;
        return {x: trackDate, y:index }
    })

    //transform checkinData to Array of objects: [{x: Date, y:count}]
    let checkinStatisticData;
    //check if checkinDatas are still in old format
    if (archiveData.checkinData.length > 0){
        if(archiveData.checkinData[0].currentStatus !== undefined){
            //old format
            checkinStatisticData = archiveData.checkinData.map(function(entry, index){
                let checkinDate = new Date(entry.currentStatus.timestamp);
                let checkinValue = entry.type;
                return {x: checkinDate, y:index }
            })

        }
        else {
            checkinStatisticData = archiveData.checkinData.map(function(entry, index){
                let checkinDate = new Date(entry.timestamp);
                let checkinValue = entry.type;
                return {x: checkinDate, y:index }
            })
        }
    }
    // return {timestamps: timestamps, values: values}
    return {
        date: archiveData.date,
        trackData: trackStatisticData,
        checkinData: checkinStatisticData
    }

    // let timestamps = trackDatas.map(function(trackEntry){
    //     return new Date(trackEntry.timestamp);
    // })
    // let values = trackDatas.map(function(trackEntry, index) {
    //     return index;
    // })

}