const UserService = require("./userService");
const bcrypt = require('bcrypt');

const db = require('../schemes/mongo');
const Authenticator = db.authenticator;

class UserManager {
    constructor() {
        let self = this;
        this.defaultDecay =  300000; //in ms
        console.log("initializing user runtime service...\n");
        //might wanna do smt here later
        this.activeUsers = [];
        this.registeredUsers = [];
        UserService.get()
            .then(users => {
                users.forEach(function(user){
                    self.registeredUsers.push({user: user, connect: false, decay: false});
                });
            })
        //load authentication information from database
        console.log("user runtime service initialized succesfully.");
    }

    connect(user, task){
        if (task === undefined) task = {}
        let i = this.activeUsers.findIndex(active => active.user.id === user.id);
        if (i === -1) {
            let userObj = {user: user, connect: Date.now(), decay: Date.now() + this.defaultDecay, currentTask: task};
            // user.connect = Date.now();
            // user.decay = Date.now() + this.defaultDecay;
            this.activeUsers.push(userObj);
            console.log("user " + user.username + " connected");
            setTimeout(this.decayUser, this.defaultDecay, userObj, this);
            return true;
        }
        else {
            this.refreshIndex(i);
            this.setActiveTask(this.activeUsers[i], task)
            return true;
        }

    }

    disconnect(user, reason){
        //TODO: set Timeout
        let i = this.activeUsers.findIndex(active => active.user.id === user.id);
        if (i === -1) {
            console.log("Failed to disconnect user " + user.username + ": user is not connected");
            return false;
        }
        else {
            this.activeUsers.splice(i,1);
            let msg = "user " + user.username + " disconnected.";
            if (typeof(reason) === "string"){
                msg = msg + " Reason: " + reason;
            }
            console.log(msg);
            return true;
        }
    }

    refresh(user, task){

        let i = this.activeUsers.findIndex(active => active.id === user.id);
        if (i === -1) {
            this.connect(user);
            return true;
        }
        else {
            this.activeUsers[i].decay = Date.now() + this.defaultDecay;
            if(task !== undefined) this.setActiveTask(this.activeUsers[i], task)
            return true;
        }
    }

    refreshIndex(index){
        this.activeUsers[index].decay = Date.now() + this.defaultDecay;
        return true;
    }

    decayUser(userObj, self){
        console.log(Date.now())
        if (Date.now() > userObj.decay){
            let reason = "decayed due to inactivity";
            self.disconnect(userObj.user, reason);
        }
        else {
            setTimeout(self.decayUser, self.defaultDecay, userObj, self)
        }
    }

    getRegisteredUsers(){
        let self = this;
        return new Promise(function(resolve, reject){
            resolve(self.registeredUsers);
        });
    }

    getConnectedUsers(){
        let self = this;
        return new Promise(function(resolve, reject){
            resolve(self.activeUsers);
        });
    }

    getById(id){
        let self = this;
        return new Promise(function(resolve, reject){
            let userObj = self.registeredUsers.find(userObj => userObj.user.id === id)
            if(userObj) {
                resolve(userObj);
            }
            else reject("User not found.");

        });
    }

    setActiveTask(userObj, task) {
        userObj.currentTask = task;
        return userObj;
    }
}

let userManager = new UserManager();

module.exports = userManager;