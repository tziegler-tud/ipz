const db = require('../schemes/mongo');

const Archive = db.archive;
const settingsService = require('./settingsService');
const trackService = require('./trackService');
const trackDataService = require('./trackDataService');
const checkinDataService = require('./dataService');
const archiveService = require('./archiveService');

const dateTransformer = require('../helpers/dateTransformer');

module.exports = {
    get,
    getByDate,
    getById,
    getOverview,
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
        const trackDataPromise = trackDataService.getAll({sort: {"timestamp": 1}});
        const checkinDataPromise = checkinDataService.getAll({sort: {"timestamp":1}});
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
        trackData = archive.data.trackDatas.sort(function(a,b){
            return a.timestamp - b.timestamp;
        });
        checkinData = archive.data.checkindatas.sort(function(a,b){
            if(a.timestamp === undefined){
                return a.currentStatus.timestamp - b.currentStatus.timestamp;
            }
            else {
                return a.timestamp - b.timestamp;
            }

        });
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
        // let trackDate = new Date(trackEntry.timestamp);
        let trackDate = parseToMilliseconds(trackEntry.timestamp);
        let trackValue = trackEntry.type;
        return {x: trackDate, y:index+1 }
    })

    //transform checkinData to Array of objects: [{x: Date, y:count}]
    let checkinStatisticData;
    //check if checkinDatas are still in old format
    if (archiveData.checkinData.length > 0){
        if(archiveData.checkinData[0].currentStatus !== undefined){
            //old format
            checkinStatisticData = archiveData.checkinData.map(function(entry, index){
                // let checkinDate = new Date(entry.currentStatus.timestamp);
                let checkinDate = parseToMilliseconds(entry.currentStatus.timestamp);
                let checkinValue = entry.type;
                return {x: checkinDate, y:index+1 }
            })

        }
        else {
            checkinStatisticData = archiveData.checkinData.map(function(entry, index){
                // let checkinDate = new Date(entry.timestamp);
                let checkinDate = parseToMilliseconds(entry.timestamp);
                let checkinValue = entry.type;
                return {x: checkinDate, y:index+1 }
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

async function getOverview() {
    //get today
    let todayPromise = trackDataService.getCounts();
    let archiveDataPromise = Archive.find({}).sort("-timestamp");
    //wait for promises to resolve
    const data = await Promise.all([todayPromise, archiveDataPromise]);
    let today = data[0];
    let archiveData = data[1];

    //return dates and totals
    let entries = [];
    entries.push({
        date: dateTransformer.transformDateTimeString(new Date()).date,
        total: today.total,
        current: true,
    })
    archiveData.forEach(function(archiveElement){
        entries.push({
            date: archiveElement.date,
            total: archiveElement.data.trackDatas.length,
            current: false,
        })
    })
    return entries;
}

function parseToMilliseconds(dateRepresentation) {
    //date can be either milliseconds, ISOString or Date object
    switch(typeof(dateRepresentation)){
        case "number":
            //date is in milliseconds
            return dateRepresentation;
        case "string":
            //date is in ISOFormat
            return Date.parse(dateRepresentation);
        case "object":
            return dateRepresentation.getTime();
    }
}
