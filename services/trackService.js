const db = require('../schemes/mongo');

const Track = db.track;
const settingsService = require('./settingsService');

module.exports = {
    get,
    getById,
    add,
    remove,
    update,
};

/**
 * Gets all users
 */
async function get() {
    return Track.find();
}

async function getById(id) {
    return Track.findById(id);
}

async function add(trackObject) {
    //validate
    if (trackObject === undefined) {
        throw new Error("empty payload");
    }
    if(trackObject.trackId === undefined) {
        throw new Error("Invalid arguments received: trackId is undefined");
    }
    if(trackObject.name === undefined) {
        throw new Error("Invalid arguments received: name is undefined");
    }

    //create new object
    let track = {
        trackId: trackObject.trackId,
        name: trackObject.name,
    }

    let trackDbObject = new Track(track);
    await trackDbObject.save();
    return trackDbObject;
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
    return Track.findByIdAndRemove(id);
}



async function update(id, trackObject) {
    if(trackObject === undefined ||id === undefined) {
       throw new Error("Failed to update track: Invalid arguments received")
    }
    //find current entry
    let track = await Track.findById(id);
    // copy trackObject properties to user
    Object.assign(track, trackObject);
    //save to db
    return track.save();
}