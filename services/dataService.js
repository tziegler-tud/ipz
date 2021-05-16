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
    clearAll,
    getLastOfAllTypes,
};

/**
 * Gets all users
 */
async function getAll(args) {
    let defaults = {
    }
    args = (args === undefined) ? {}: args;
    args = Object.assign(defaults, args);

    let filter = args.filter;
    let sort= args.sort;
    let query;
    if (filter===undefined || filter.filter === undefined || filter.value === undefined) {
        query = CheckinData.find();
    }
    else {
        let filterObj = {};
        filterObj[filter.filter] = filter.value;
        query = CheckinData.find(filterObj);
    }

    if(sort === undefined) {
        return query;
    }
    else {
        return query.sort(sort);
    }
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
    let data1 = CheckinData.count({"type": 1});
    let data2 = CheckinData.count({"type": 2});
    let data3 = CheckinData.count({"type": 3});

    //wait for query to finish
    const data = await Promise.all([data1, data2, data3]);
    //count them

    let counters = {
        b: data[0],
        m: data[1],
        a: data[2]
    }
    let total = data[0] + data[1] + data[2];

    let returnObject = {
        status: options.status,
        counters: counters,
        total: total,
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
    // let version = await Version.findOne({label: "wb2"});
    // if(!version){
    //     console.log("no version file found. Generating new version history...")
    //    version = new Version({
    //         label: "wb2",
    //         version: 1,
    //         timestamp: Date.now(),
    //     });
    // }
    // else {
    //     version.version++;
    // }
    // version.save();
    //create new object
    let checkinDataObject = {
        type: object.type,
        timestamp: Date.now(),
    }

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

    if(args.type === undefined) {
        throw new Error("Invalid arguments received: Type is undefined");
    }

    //get checkout version
    // let version = await Version.findOne({label: "wb2"});
    // if(!version){
    //     console.log("no version file found. Generating new version history...")
    //     version = new Version({
    //         label: "wb2",
    //         version: 1,
    //         timestamp: Date.now(),
    //     });
    // }
    // else {
    //     version.version++;
    // }
    // version.save();

    //delete last entry

    // return CheckinData.findOneAndRemove({"type": type}).sort({"currentStatus.timestamp": -1});
    return CheckinData.findOneAndRemove({"type": type}).sort({"timestamp": -1});
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

async function clearAll() {
    return CheckinData.remove({});
}


async function getLastOfAllTypes(filter) {
    let b, m, a;


    if (filter===undefined || filter.filter === undefined || filter.value === undefined) {
        b = await CheckinData.findOne({"type": 1}).sort({'currentStatus.timestamp': -1});
        m = await CheckinData.findOne({"type": 2}).sort({'currentStatus.timestamp': -1});
        a = await CheckinData.findOne({"type": 3}).sort({'currentStatus.timestamp': -1});
    }
    else {
        let filter1 = {
            "type": 1,
        };
        let filter2 = {
            "type": 2,
        };
        let filter3 = {
            "type": 3,
        };
        filter1[filter.filter] = filter.value;
        filter2[filter.filter] = filter.value;
        filter3[filter.filter] = filter.value;
        // return TrackData.find({isSwitched: true});
        b = await CheckinData.findOne(filter1).sort({'currentStatus.timestamp': -1});
        m = await CheckinData.findOne(filter1).sort({'currentStatus.timestamp': -1});
        a = await CheckinData.findOne(filter1).sort({'currentStatus.timestamp': -1});
    }

    return {b: b,m: m, a: a};

}
