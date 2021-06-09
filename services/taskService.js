const db = require('../schemes/mongo');
const bcrypt = require('bcrypt');
const Task = db.task;
const settingsService = require('./settingsService');

module.exports = {
    get,
    getById,
    getByName,
    add,
    remove,
    update,
    getByIdWithHash,
    getByNameWithHash,
};

/**
 * Gets all users
 */
async function get() {
    return Task.find();
}

async function getById(id) {
    return Task.findById(id).select("-hash");
}

async function getByName(name) {
    return Task.find({name: name}).select("-hash");
}

async function getByIdWithHash(id) {
    return Task.findById(id);
}

async function getByNameWithHash(name) {
    return Task.find({name: name});
}

async function add(taskObject) {
    //validate
    if (taskObject === undefined) {
        throw new Error("empty payload");
    }
    if(taskObject.name === undefined) {
        throw new Error("Invalid arguments received: name is undefined");
    }

    //create new object

    let taskDbObject = new Task(taskObject);
    if (taskObject.password) {
        const salt = await bcrypt.genSalt(10);
        taskDbObject.hash = await bcrypt.hash(taskObject.password, salt);
    }
    await taskDbObject.save();
    return taskDbObject;
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
    return Task.findByIdAndRemove(id);
}



async function update(id, taskObject) {
    if(taskObject === undefined ||id === undefined) {
       throw new Error("Failed to update task: Invalid arguments received")
    }
    //find current entry
    let task = await Task.findById(id);
    // copy taskObject properties to user
    Object.assign(task, taskObject);
    //save to db
    return task.save();
}