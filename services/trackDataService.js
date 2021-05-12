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
    getLastOfAllTypes,
    clearAll,
};

/**
 * Gets all users
 */
async function getAll(args) {
    let filter = args.filter;
    let sort= args.sort;
    let query
    if (filter===undefined || filter.filter === undefined || filter.value === undefined) {
        query = TrackData.find();
    }
    else {
        let filterObj = {};
        filterObj[filter.filter] = filter.value;
        query = TrackData.find(filterObj);
    }

    if(sort === undefined) {
        return query;
    }
    else {
        return query.sort(sort);
    }
}

async function getByTrack(track, filter) {
    if (filter===undefined || filter.filter === undefined || filter.value === undefined) {
        return TrackData.find({"track.id": track.id});
    }
    else {
        let filterObj = {
            "track.id": track.id,
        };
        filterObj[filter.filter] = filter.value;
        // return TrackData.find({isSwitched: true});
        return TrackData.find(filterObj);
    }

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

    let total = counters.b + counters.m + counters.a;

    let returnObject = {
        track: track.id,
        counters: counters,
        total: total,
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
        switchObj = object.switch;
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
        return TrackData.findOneAndRemove({"type": type, "track.id": trackId, "isSwitched": isSwitched, "switch.originalType": switchObj.originalType}).sort("-timestamp");
    }
    else {
        // return TrackData.findOneAndRemove({"type": type, "track.id": trackId, "isSwitched": isSwitched}).sort("-timestamp");
        return TrackData.findOneAndRemove({"type": type, "track.id": trackId, "isSwitched": isSwitched}).sort("-timestamp");
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

async function getLastOfAllTypes(track, filter) {
    let b, m, a;


    if (filter===undefined || filter.filter === undefined || filter.value === undefined) {
        b = await TrackData.findOne({"track.id": track.id, "type": 1}).sort('-timestamp');
        m = await TrackData.findOne({"track.id": track.id, "type": 2}).sort('-timestamp');
        a = await TrackData.findOne({"track.id": track.id, "type": 3}).sort('-timestamp');
    }
    else {
        let filter1 = {
            "type": 1,
            "track.id": track.id,
        };
        let filter2 = {
            "type": 2,
            "track.id": track.id,
        };
        let filter3 = {
            "type": 3,
            "track.id": track.id,
        };
        filter1[filter.filter] = filter.value;
        filter2[filter.filter] = filter.value;
        filter3[filter.filter] = filter.value;
        // return TrackData.find({isSwitched: true});
        b = await TrackData.findOne(filter1).sort('-timestamp');
        m = await TrackData.findOne(filter1).sort('-timestamp');
        a = await TrackData.findOne(filter1).sort('-timestamp');
    }

    return {b: b,m: m, a: a};

}

async function clearAll() {
    return TrackData.remove({});
}