const db = require('../schemes/mongo');

const CheckinData = db.checkinData;
const Version = db.version;

module.exports = {
    getAll,
    getCheckoutData,
    getCheckoutEntry,
    getCheckoutDataVersion,
    redraw,
    add,
    checkout,
    updateVersion,
};

/**
 * Gets all users
 */
async function getAll() {
    return CheckinData.find();
}

async function getCheckoutData(sort) {
    if (sort === undefined) return CheckinData.find({"currentStatus.status": 0}).sort({'currentStatus.timestamp': 1});
    else {
        if (typeof(sort) !== "string") {
            throw new Error("Failed to get sorted data: Unknown sorting argument given.");
        }
        let sortProperty;
        if(sort === "queueNumber"){
            return CheckinData.find({"currentStatus.status": 0}).sort({queueNumber: 1});
        }
        if(sort === "data"){
            return CheckinData.find({"currentStatus.status": 0}).sort({"data.0": 1});
        }
        if(sort === "timestamp"){
            return CheckinData.find({"currentStatus.status": 0}).sort({"currentStatus.timestamp": 1});
        }
    }
}

async function getCheckoutEntry(id) {
    return CheckinData.findById(id);
}

async function getCheckoutDataVersion() {
    return Version.findOne({label: "checkout"});
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


async function add(amount, data, queueNumber) {
    //validate
    if (data.length === 0){
        throw new Error("data cannot be empty.");
    }
    //check with regex to contain only numbers
    var reg = new RegExp('^\\d+$');
    //remove whitespace
    let trimmed = data.map(function(el){
        el.trim();
        if(!reg.test(el)) {
            throw new Error("Failed to parse data: Invalid characters")
        }
        return el;
    })
    //sort by numbers
    trimmed.sort();
    if(queueNumber === undefined) {
        queueNumber = trimmed[0];
    }

    //get checkout version
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
    //create new object
    let checkinDataObject = {
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

    //check if numbers are already registered
    // CheckinData.find({ data: data })
    let checkinData = new CheckinData(checkinDataObject);
    await checkinData.save();
    return checkinData;
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

