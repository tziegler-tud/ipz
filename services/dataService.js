const db = require('../schemes/mongo');

const CheckinData = db.checkinData;
const Version = db.version;

const settingsService = require('./settingsService');

module.exports = {
    getAll,
    getCheckoutData,
    getCheckoutEntry,
    getCheckoutDataVersion,
    getCounts,
    add,
    remove,
    checkout,
    updateVersion,
};

/**
 * Gets all users
 */
async function getAll() {
    return CheckinData.find();
}

async function getCheckoutData() {
    let settings = await settingsService.getCheckoutSettings();
    return CheckinData.find({"currentStatus.status": 0});

}

async function getCounts(args) {
    let options = {status: 0}
    if(args !== undefined) {
        if(args.status) {
            options.status = args.status;
        }
    }
    let data = await CheckinData.find({"currentStatus.status": options.status});
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
        status: options.status,
        counters: counters,
    }

    return returnObject;
}

async function getCheckoutEntry(id) {
    return CheckinData.findById(id);
}

async function getCheckoutDataVersion() {
    return Version.findOne({label: "wb2"});
}


async function add(object) {
    //validate
    if (object === undefined) {
        throw new Error("empty payload");
    }
    if(object.type === undefined) {
        throw new Error("Invalid arguments received: Type is undefined");
    }

    //get checkout version
    let version = await Version.findOne({label: "wb2"});
    if(!version){
        console.log("no version file found. Generating new version history...")
       version = new Version({
            label: "wb2",
            version: 1,
            timestamp: Date.now(),
        });
    }
    else {
        version.version++;
    }
    version.save();
    //create new object
    let checkinDataObject = {
        type: object.type,
        currentStatus: {
            status: 0,
            text: "WB2",
            timestamp: Date.now(),
        },
        statusHistory: [],
    }
    checkinDataObject.statusHistory.push(checkinDataObject.currentStatus);

    //check if numbers are already registered
    // CheckinData.find({ data: data })
    let checkinData = new CheckinData(checkinDataObject);
    await checkinData.save();
    return checkinData;
}


async function remove(args) {

    if(args === undefined) {
        throw new Error("Invalid arguments received: Payload is empty.");
    }
    let type = args.type;
    let amount = args.amount;

    if(args.type === undefined) {
        throw new Error("Invalid arguments received: Type is undefined");
    }

    //get checkout version
    let version = await Version.findOne({label: "wb2"});
    if(!version){
        console.log("no version file found. Generating new version history...")
        version = new Version({
            label: "wb2",
            version: 1,
            timestamp: Date.now(),
        });
    }
    else {
        version.version++;
    }
    version.save();

    //delete last entry
    return CheckinData.findOneAndRemove({"currentStatus.status": 0, "type": type});
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
        text: "CheckIn erfolgt",
        timestamp: Date.now(),
    }
    dbEntry.statusHistory.push(dbEntry.currentStatus)

    let version = await Version.findOne({label: "checkout"});
    if(!version){
        console.log("no version file found. Generating new version history...")
        version = new Version({
            label: "checkout",
            version: 1,
            timestamp: Date.now(),
        });
    }
    else {
        version.version++;
    }
    version.save();
    await dbEntry.save();
    return dbEntry;
}


async function updateVersion(number) {
    let version = await Version.findOne({label: "checkout"});
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

function addMinutes(date, minutes) {
    return new Date(date + minutes*60000).getTime();
}

