const db = require('../schemes/mongo');
const bcrypt = require('bcrypt');
const Role = db.role;

module.exports = {
    get,
    getById,
    getByName,
    getDefaultRole,
    add,
    remove,
    update,
};

/**
 * Gets all users
 */
async function get() {
    return Role.find();
}

async function getById(id) {
    return Role.findById(id);
}

async function getByName(name) {
    return Role.find({name: name});
}

async function getDefaultRole(){
    //find default role in database.
    let defRole = await Role.findOne({isDefault: true});
    if (!defRole){
        //default role not found in database, create a new one
        console.warn("No default role present in database. Lets create a new one...");
        let newDefaultRole = {
            name: "Anderes",
            isDefault: true,
        }
        let defaultRole = new Role(newDefaultRole);
        defaultRole.save();
        defRole = defaultRole;
    }
    //return default role
    return defRole;
}

async function add(roleObject) {
    //validate
    if (roleObject === undefined) {
        throw new Error("empty payload");
    }
    if(roleObject.name === undefined) {
        throw new Error("Invalid arguments received: name is undefined");
    }

    //create new object

    let roleDbObject = new Role(roleObject);
    await roleDbObject.save();
    return roleDbObject;
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
    return Role.findByIdAndRemove(id);
}



async function update(id, roleObject) {
    if(roleObject === undefined ||id === undefined) {
       throw new Error("Failed to update task: Invalid arguments received")
    }
    //find current entry
    let role = await Role.findById(id);
    // copy taskObject properties to user
    Object.assign(role, roleObject);
    //save to db
    return role.save();
}