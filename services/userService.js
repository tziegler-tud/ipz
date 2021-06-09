const db = require('../schemes/mongo');
const bcrypt = require('bcrypt');
const User = db.user;
const Task = db.task;
const Role = db.role;
const settingsService = require('./settingsService');

module.exports = {
    get,
    getById,
    getByIdWithHash,
    getByUsername,
    getByUsernameWithHash,
    add,
    remove,
    update,
    addTask,
    removeTask,
    setUserRole,

};

/**
 * Gets all users
 */
async function get() {
    return User.find().select("-hash");
}

async function getById(id) {
    return User.findById(id).populate("allowedTasks", "-hash").select("-hash");
}

async function getByIdWithHash(id) {
    return User.findById(id).populate("allowedTasks", "-hash");
}

async function getByUsername(name) {
    return User.findOne({username: name}).populate("allowedTasks", "-hash").select("-hash");
}

async function getByUsernameWithHash(name) {
    return User.findOne({username: name}).populate("allowedTasks", "-hash");
}

async function add(userObject) {
    //validate
    if (userObject === undefined) {
        throw new Error("empty payload");
    }
    if(userObject.username === undefined) {
        throw new Error("Invalid arguments received: username is undefined");
    }

    //create new object

    let userDbObject = new User(userObject);
    if (userObject.password) {
        const salt = await bcrypt.genSalt(10);
        userDbObject.hash = await bcrypt.hash(userObject.password, salt);
    }
    await userDbObject.save();
    return userDbObject;
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
    return User.findByIdAndRemove(id);
}



async function update(id, userObject) {
    if(userObject === undefined ||id === undefined) {
       throw new Error("Failed to update user: Invalid arguments received")
    }
    //find current entry
    let user = await User.findById(id);
    // copy userObject properties to user
    Object.assign(user, userObject);
    //save to db
    return user.save();
}


async function addTask (id, taskId){
    //find current entry
    let user = await User.findById(id);
    if (user === undefined) throw new Error("User not found.");

    let task = await Task.findById(taskId);
    if (!task) throw new Error('Task not found');

    //check if user already has userGroup assigned
    if(user.allowedTasks.includes(taskId)){
        console.log("User " + user.username + " already has allowed task " + task.name + " assigned.");
        return user;
    }
    user.allowedTasks.push(task._id);
    await user.save();
    return user;
}

async function removeTask (id, taskId) {
    let user = await User.findById(id);
    if (user === undefined) throw new Error("User not found.");
    let index = user.allowedTasks.indexOf(taskId);
    if (index === -1) {
        throw new Error("Task not found.");
    }
    else {
        user.allowedTasks.splice(index, 1);
    }
    //update user
    user.save();
    return user;
}


async function setUserRole (id, roleId){
    //find current entry
    let user = await User.findById(id);
    if (user === undefined) throw new Error("User not found.");

    let role = await Role.findById(roleId);
    if (!role) throw new Error('Role not found');

    user.role = role;
    await user.save();
    return user;
}