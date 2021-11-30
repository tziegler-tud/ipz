const db = require('../../schemes/mongo');

const CheckinData = db.checkinData;
const Version = db.version;
const TrackData = db.trackData;

const settingsService = require('../settingsService');
const trackService = require('../trackService');

module.exports = {
    getAll,
    getCheckoutData,
    getByTrack,
    getAllTracks,
    getCheckoutEntry,
    getCheckoutDataVersion,
    getDisplayDataVersion,
    redraw,
    add,
    checkout,
    updateVersions,
};

/**
 * Gets all users
 */
async function getAll() {
    return CheckinData.find();
}

async function getByTrack(trackId, sort) {
    let settings = await settingsService.getCheckoutSettings();
    let currentSort = settings.sorting.property;
    if (sort === undefined || sort === "default") {
        sort = currentSort;
    } else {
        if (typeof (sort) !== "string") {
            throw new Error("Failed to get sorted data: Unknown sorting argument given.");
        }
        if (sort === "queueNumber") {
            sort = "queueNumber";
        }
        if (sort === "data") {
            // return CheckinData.find({"currentStatus.status": 0}).sort({"data.0": 1});
            sort = "data.0";
        }
        if (sort === "timestamp") {
            sort = "currentStatus.timestamp";
        }
    }
    let sortObject = {};
    sortObject[sort] = 1;
    return CheckinData.find({"currentStatus.status": 0, track: trackId}).sort(sortObject);
}

/**
 *
 * returns all entries currently in queue, grouped by tracks
 *
 * @param sort
 * @returns {Promise<*>}
 */
async function getAllTracks(sort) {
    let settings = await settingsService.getCheckoutSettings();
    let currentSort = settings.sorting.property;

    return new Promise(function(resolve, reject){
        if (sort === undefined || sort === "default") {
            sort = currentSort;
        } else {
            if (typeof (sort) !== "string") {
                reject("Failed to get sorted data: Unknown sorting argument given.");
            }
            if (sort === "queueNumber") {
                sort = "queueNumber";
            }
            if (sort === "data") {
                // return CheckinData.find({"currentStatus.status": 0}).sort({"data.0": 1});
                sort = "data.0";
            }
            if (sort === "timestamp") {
                sort = "currentStatus.timestamp";
            }
        }
        let sortObject = {};
        sortObject[sort] = 1;
        CheckinData.find({"currentStatus.status": 0}).sort(sortObject)
            .then(function(data){
                //group by tracks
                let result = [];
                let tracks = trackService.get()
                    .then(function(tracks){
                        tracks.forEach(function(track){
                            let trackArray = data.filter(function(entry){
                                return entry.track.toString() === track.id;
                            })
                            result.push({track: track, data: trackArray});
                        })
                        resolve(result);
                    })
            })
    })

}

async function getCheckoutData(sort) {
    let settings = await settingsService.getCheckoutSettings();
    let currentSort = settings.sorting.property;
    if (sort === undefined || sort === "default") {
        sort = currentSort;
    } else {
        if (typeof (sort) !== "string") {
            throw new Error("Failed to get sorted data: Unknown sorting argument given.");
        }
        if (sort === "queueNumber") {
            sort = "queueNumber";
        }
        if (sort === "data") {
            // return CheckinData.find({"currentStatus.status": 0}).sort({"data.0": 1});
            sort = "data.0";
        }
        if (sort === "timestamp") {
            sort = "currentStatus.timestamp";
        }
    }
    let sortObject = {};
    sortObject[sort] = 1;
    return CheckinData.find({"currentStatus.status": 0}).sort(sortObject);

}

async function getCheckoutEntry(id) {
    return CheckinData.findById(id);
}

async function getCheckoutDataVersion(trackId) {
    //lets assume trackId is valid to save time. if it fails, we will investigate.

    return new Promise(function(resolve, reject){
        Version.findOne({label: "checkout", track: trackId})
            .then(function(result){
                if(result !== null) {
                    resolve(result)
                }
                else {
                    //no matching version file found. Lets see if the trackId is correct:
                    trackService.getById(trackId)
                        .then(function(track){
                            if(track) {
                                //trackId is valid, lets generate a new version file for this track:
                                console.log("no version file found. Generating new version history...")
                                let version = new Version({
                                    label: "checkout",
                                    track: track.id,
                                    version: 1,
                                    timestamp: Date.now(),
                                });
                                version.save()
                                    .then(function(version){
                                        resolve(version);
                                    })
                            }
                            else {
                                //trackId is invalid, lets reject this request
                                reject("Invalid track id");
                            }
                        })
                        .catch(err => reject(err))
                }
            })
            .catch(function(err){
                reject(err);
            })
    });
}

async function getDisplayDataVersion(trackId) {
    //lets assume trackId is valid to save time. if it fails, we will investigate.
    return new Promise(function(resolve, reject){
        Version.findOne({label: "display"})
            .then(function(result){
                if(result !== null) {
                    resolve(result)
                }
                else {
                    console.log("no version file found. Generating new version history...")
                    let version = new Version({
                        label: "display",
                        version: 1,
                        timestamp: Date.now(),
                    });
                    version.save()
                        .then(function(version){
                            resolve(version);
                        })
                }
            })
            .catch(function(err){
                reject(err);
            })
    });
}

async function redraw(id, minutes) {
    if (!id) {
        throw new Error("invalid id");
    }
    if (!minutes) {
        throw new Error("invalid redraw time");
    }
    //find entry
    let dbEntry = await CheckinData.findById(id)
    if(!dbEntry) {
        throw new Error("Could not find entry with id: " + id);
    }
    //check if status is 0
    if (!dbEntry.currentStatus){
        throw new Error("Failed to read entry status");
    }

    //change current status to 1
    let newTimestamp = addMinutes(dbEntry.currentStatus.timestamp, minutes);
    dbEntry.currentStatus = {
        status: 0,
        text: "WB1 - Zurückgestellt",
        timestamp: newTimestamp,
    }
    dbEntry.statusHistory.push(dbEntry.currentStatus)

    updateVersions(dbEntry.track)
    await dbEntry.save();
    return dbEntry;
}


async function add(track, amount, data, queueNumber) {
    //validate
    if (data.length === 0){
        throw new Error("data cannot be empty.");
    }
    //remove whitespace
    let trimmed = data.map(function(el){
        el.number.trim();
        return el;
    })
    //sort by numbers
    trimmed.sort((a, b) => a.number - b.number);
    if(queueNumber === undefined) {
        queueNumber = Date.now();
    }

    //find associated track
    return new Promise(function(resolve, reject){
        trackService.getById(track)
            .then(function(track){
                //get checkout version
                    updateVersions(track);
                    //create new object
                    let checkinDataObject = {
                        track: track.id,
                        amount: amount,
                        data: trimmed,
                        queueNumber: queueNumber,
                        currentStatus: {
                            status: 0,
                            text: "WB1",
                            timestamp: Date.now(),
                        },
                        statusHistory: [],
                    }
                    checkinDataObject.statusHistory.push(checkinDataObject.currentStatus);

                    let checkinData = new CheckinData(checkinDataObject);
                    checkinData.save()
                        .then(result => resolve(result))
                        .catch(err => reject(err))
                })
    });



}

async function checkout(entry) {

    //find entry
    let dbEntry = await CheckinData.findById(entry.id)
    if(!dbEntry) {
        throw new Error("Could not find entry with id: " + id);
    }
    //check if status is 0
    if (!dbEntry.currentStatus){
        throw new Error("Checkout failed: Failed to read entry status");
    }
    else {
        if (dbEntry.currentStatus.status !== 0) {
            throw new Error("Checkout failed: Entry is not in status 'WB1'");
        }
    }

    //change current status to 1
    dbEntry.currentStatus = {
        status: 1,
        text: "Impfung erfolgt",
        timestamp: Date.now(),
    }
    dbEntry.statusHistory.push(dbEntry.currentStatus)

    updateVersions(dbEntry.track);
    return dbEntry.save();
}


async function setVersionNumber(number, track) {

    //if track === undefined, update all versions
    if(track === undefined) {
        let versions = await Version.find({label: "checkout"});
        if(!versions){
            console.log("no version file found. Aborting operation")
        }
        else {
            //check if multiple versions were found
            if (Array.isArray(versions)){
                versions.forEach(function(el){
                    if (number === undefined){
                        el.version++;
                    }
                    else {
                        el.version = number;
                    }
                })
            }
            else {
                if (number === undefined){
                    version.version++;
                }
                else {
                    version.version = number;
                }
            }
        }
        return versions.save();
    }
    else {
        let version = await Version.findOne({label: "checkout", track: track});
        if(!version){
            console.log("no version file found. Generating new version history...")
            version = new Version({
                label: "checkout",
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

}

function updateVersions(track){
    if(track.id === undefined) track = {id: track};
    Version.findOne({label: "checkout"})
        .then(function(version){
            if(!version){
                console.log("no version file found. Generating new version history...")
                version = new Version({
                    label: "checkout",
                    version: 1,
                    track: track.id,
                    timestamp: Date.now(),
                });
            }
            else {
                version.version++;
            }
            version.save();
        })
    Version.findOne({label: "display"})
        .then(function(displayVersion){
            if(!displayVersion){
                console.log("no display version file found. Generating new version history...")
                displayVersion = new Version({
                    label: "display",
                    version: 1,
                    timestamp: Date.now(),
                });
            }
            else {
                displayVersion.version++;
            }
            displayVersion.save();
        })
}

function addMinutes(date, minutes) {
    return new Date(date + minutes*60000).getTime();
}

