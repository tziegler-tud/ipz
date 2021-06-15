const UserService = require("./userService");
const TaskService = require("./taskService");
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
        let offlineTask = {name: "offline"};
        UserService.get()
            .then(users => {
                users.forEach(function(user){
                    self.registeredUsers.push({user: user, active: false, connect: false, decay: false, currentTask: offlineTask});
                });
            })
        //load authentication information from database
        console.log("user runtime service initialized succesfully.");
    }

    connect(user, task){
        if (task === undefined) task = {name: "nicht angegeben"}
        let i = this.registeredUsers.findIndex(active => active.user.id === user.id);
        if (i === -1) {
            //user not found. something went wrong
            let tag = (user.username === undefined) ? ((user.id=== undefined) ? "undefined" : user.id) : user.username;
            console.error("Failed to connect user "+ tag + ": User not found");
            return false;
        }
        else {
            if (!this.registeredUsers[i].active){
                this.registeredUsers[i] = {user: user, active: true, connect: Date.now(), decay: Date.now() + this.defaultDecay, currentTask: task};
                console.log("user " + user.username + " connected");
                setTimeout(this.decayUser, this.defaultDecay, this.registeredUsers[i], this);
                return true;
            }
            else {
                this.refreshIndex(i);
                this.setActiveTask(this.registeredUsers[i], task)
                return true;
            }
        }
    }

    disconnect(user, reason){
        //TODO: set Timeout
        let i = this.registeredUsers.findIndex(active => active.user.id === user.id);
        if (i === -1) {
            let tag = (user.username === undefined) ? ((user.id=== undefined) ? "undefined" : user.id) : user.username;
            console.log("Failed to disconnect user " + tag + ": user not found");
            return false;
        }
        else {
            if (!this.registeredUsers[i].active){
                console.log("Failed to disconnect user " + user.username + ": user is not connected.");
                return false;
            }
            else {
                this.registeredUsers[i].active = false;
                let msg = "user " + user.username + " disconnected.";
                if (typeof(reason) === "string"){
                    msg = msg + " Reason: " + reason;
                }
                console.log(msg);
                return true;
            }
        }
    }

    refresh(user, task){

        let i = this.registeredUsers.findIndex(active => active.user.id === user.id);
        if (i === -1) {
            let tag = (user.username === undefined) ? ((user.id=== undefined) ? "undefined" : user.id) : user.username;
            console.log("Failed to refresh user " + tag + ": user not found.");
            return false;
        }
        else {
            if (this.registeredUsers[i].active) {
                this.registeredUsers[i].decay = Date.now() + this.defaultDecay;
                if (task !== undefined) this.setActiveTask(this.registeredUsers[i], task)
                return true;
            }
            else {
                this.connect(user);
                return true;
            }
        }
    }

    refreshIndex(index){
        this.registeredUsers[index].decay = Date.now() + this.defaultDecay;
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
            let active = self.registeredUsers.filter(userObj => userObj.active === true)
            resolve(active);
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

    getActiveUserById(id){
        return this.getById(id);
    }

    setActiveTask(userObj, task) {
        userObj.currentTask = task;
        return userObj;
    }

    registerPushSubscription(user, subscription) {
        let self = this;
        return new Promise(function(resolve, reject) {
            //add subscription to active user runtime object
            //1. refresh user
            self.refresh(user)
            //2. get user runtime object
            self.getActiveUserById(user.id)
                .then(function (userObj) {
                    //assign subscription
                    userObj.subscription = subscription;
                    resolve(userObj);
                })
                .catch(err=>reject(err))
        })
    }
}

let userManager = new UserManager();

module.exports = userManager;