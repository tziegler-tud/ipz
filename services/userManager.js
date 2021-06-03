const db = require('../schemes/mongo');
const bcrypt = require('bcrypt');
const User = db.user;
const settingsService = require('./settingsService');

module.exports = {
    get,
    getById,
    getByUsername,
    add,
    remove,
    update,
};

/**
 * Gets all users
 */
async function get() {
    return User.find();
}

async function getById(id) {
    return User.findById(id);
}

async function getByUsername(name) {
    return User.findOne({username: name});
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