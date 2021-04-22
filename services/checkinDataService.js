const db = require('../schemes/mongo');

const CheckinData = db.checkinData;
const Version = db.version;

module.exports = {
    getAll,
    getCheckoutData,
    getCheckoutDataVersion,
    add,
    checkout,
};

/**
 * Gets all users
 */
async function getAll() {
    return CheckinData.find();
}

async function getCheckoutData() {
    return CheckinData.find({"currentStatus.status": 0});
}

async function getCheckoutDataVersion() {
    return Version.findOne({label: "checkout"});
}


async function add(amount, data) {
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
        data: data,
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

