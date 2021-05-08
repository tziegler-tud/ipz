const db = require('../schemes/mongo');

const TrackData = db.trackData;
const Version = db.version;

const settingsService = require('./settingsService');

module.exports = {
    getAll,
    getByTrack,
    getTrackDataVersion,
    getCounts,
    add,
    remove,
    updateVersion,
};

/**
 * Gets all users
 */
async function getAll() {
    return TrackData.find();
}

async function getByTrack(track) {
    return TrackData.find({"track.id": track.id});
}

async function getCounts(track) {
    let data;
    if(track === undefined) {
        //find all tracks
        track = 0;
        data = await TrackData.find();
    }
    else {
        data = await TrackData.find({"track.id": track.id});
    }
    //count them
    let counters = {
        b: 0,
        m: 0,
        a: 0,
    }
    counters.b = data.reduce(function(n, element) {
        return n + (element.type === 1);
    }, 0);
    counters.m = data.reduce(function(n, element) {
        return n + (element.type === 2);
    }, 0);
    counters.a = data.reduce(function(n, element) {
        return n + (element.type === 3);
    }, 0);

    let returnObject = {
        track: track.id,
        counters: counters,
    }

    return returnObject;
}



async function getTrackDataVersion(track) {
    let trackId;
    if(track === undefined) {
        //find all tracks
        trackId = 0;
    }
    else {
        trackId = track.id;
    }
    return Version.findOne({label: "track"+trackId});
}

async function add(object) {
    //validate
    if (object === undefined) {
        throw new Error("empty payload");
    }
    if(object.type === undefined) {
        throw new Error("Invalid arguments received: Type is undefined");
    }
    if(object.track === undefined) {
        throw new Error("Invalid arguments received: Track is undefined");
    }

    let isSwitched = object.isSwitched;
    let switchObj = {};
    if(isSwitched) {
        switchObj.originalType = object.originalType;
    }

    //get checkout version
    let label = "track"+object.track.id;
    let version = await Version.findOne({label: label});
    if(!version){
        console.log("no version file found. Generating new version history...")
       version = new Version({
            label: label,
            version: 1,
            timestamp: Date.now(),
        });
    }
    else {
        version.version++;
    }
    version.save();
    //create new object
    let trackDataObject = {
        type: object.type,
        track: object.track,
        isSwitched: isSwitched,
        switch: switchObj,
    }

    //check if numbers are already registered
    // CheckinData.find({ data: data })
    let trackData = new TrackData(trackDataObject);
    await trackData.save();
    return trackData;
}

/**
 * @param type {Integer}
 * @param trackId {ObjectId}
 * @param args {{isSwitched: Boolean, originalType: Integer}}
 * @returns {Promise<*>}
 */
async function remove(type, trackId, args) {

    if(type === undefined) {
        throw new Error("Invalid arguments received: Type is undefined");
    }

    if(trackId === undefined) {
        throw new Error("Invalid arguments received: Track is undefined");
    }

    let isSwitched = args.isSwitched;
    if (isSwitched === undefined) isSwitched = false;
    let switchObj = {};
    if(isSwitched) {
        switchObj.originalType = args.originalType;
    }

    //get version
    let label = "track"+trackId;
    let version = await Version.findOne({label: label});
    if(!version){
        console.log("no version file found. Generating new version history...")
        version = new Version({
            label: label,
            version: 1,
            timestamp: Date.now(),
        });
    }
    else {
        version.version++;
    }
    version.save();

    //delete last entry
    if (isSwitched) {
        return TrackData.findOneAndRemove({"type": type, "track.id": trackId, "isSwitched": isSwitched, "switch.originalType": switchObj.originalType});
    }
    else {
        return TrackData.findOneAndRemove({"type": type, "track.id": trackId, "isSwitched": isSwitched});
    }
}



async function updateVersion(track, number) {
    if(track === undefined || track.id === undefined) {
        //find all tracks
        track = {id: 0, name: "ALL"};
    }

    //get checkout version
    let label = "track"+track.id;

    let version = await Version.findOne({label: label});
    if(!version){
        console.log("no version file found. Generating new version history...")
        version = new Version({
            label: label,
            version: 1,
            timestamp: Date.now(),
        });
    }
    else {
        if (number === undefined){
            version.version++;
        }
        else {
            version.version = number;
        }
    }
    return version.save();
}