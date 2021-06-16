const UserService = require("./userService");
const TaskService = require("./taskService");
const bcrypt = require('bcrypt');

const db = require('../schemes/mongo');
const Authenticator = db.authenticator;

const webpush = require('web-push');

/**
 * @typedef User
 * @property {String} username username used for login and identification
 * @property {String} name displayed name. this can be different from username
 * @property {String} id user id
 * @property {Task[]} allowedTasks array of allowed tasks
 */

class UserManager {
    constructor() {
        let self = this;
        this.defaultDecay =  180000; //in ms
        console.log("initializing user runtime service...\n");
        //might wanna do smt here later
        this.activeUsers = [];
        this.registeredUsers = [];
        self.undefinedTask = {name: "Hat sich verirrt"};
        self.offlineTask = {name: "offline"};
        self.inactiveTask = {name: "inaktiv"};
        UserService.get()
            .then(users => {
                users.forEach(function(user){
                    self.registeredUsers.push({user: user, active: 0, connect: false, decay: false, currentTask: self.offlineTask}); //active: 0 = offline, 1 = inactive, 2 = online
                });
                console.log("user runtime service initialized successfully.");
            })
        //load authentication information from database

    }

    update(){
        let self = this;
        return new Promise(function(resolve, reject){
            UserService.get()
                .then(users => {
                    self.registeredUsers = []
                    users.forEach(function(user){
                        self.registeredUsers.push({user: user, active: 0, connect: false, decay: false, currentTask: self.offlineTask});
                    });
                    resolve(self.registeredUsers)
                })
                .catch(function(err){
                    console.error("Failed to update userManager: Could not get current user list from database.")
                    console.log("UserManager: Aborting update, everything is left as it was before...")
                    reject(err)
                })
        })
    }

    /**
     * sets the users to active state with the default decay applying. Use this method when the user starts a new session or has been disconnected.
     *
     * @param user {User}
     * @param task {Task}
     * @returns {Promise} resolved if connection was successful
     */
    connect(user, task) {
        let self = this;
        return new Promise(function (resolve, reject) {
            let i = self.registeredUsers.findIndex(active => active.user.id === user.id);
            if (i === -1) {
                //user not found. something went wrong
                let tag = (user.username === undefined) ? ((user.id === undefined) ? "undefined" : user.id) : user.username;
                let message = "Failed to connect user " + tag + ": User not found"
                console.error(message);
                reject(message);
            } else {
                if (self.registeredUsers[i].active === 0) {
                    // self.registeredUsers[i].user = user;
                    self.registeredUsers[i].active = 2;
                    self.registeredUsers[i].connect = Date.now();
                    self.registeredUsers[i].decay = Date.now() + self.defaultDecay;
                    console.log("user " + user.username + " connected");
                    setTimeout(self.decayUser, self.defaultDecay + 1, self.registeredUsers[i], self);
                } else {
                    self.refreshIndex(i);
                }
                //finally, set task and resolve
                self.setActiveTask(i, task);
                resolve(user)
            }
        })
    }

    /**
     * removes the active state from the user. PushSubscription is preserved during server runtime.
     * @param user {User}
     * @param reason {String} Message to log
     * @returns {Promise} resolved if connection was successful
     */

    disconnect(user, reason){
        let self = this;
        return new Promise(function (resolve, reject) {
            //TODO: set Timeout
            let i = this.registeredUsers.findIndex(active => active.user.id === user.id);
            if (i === -1) {
                let tag = (user.username === undefined) ? ((user.id === undefined) ? "undefined" : user.id) : user.username;
                let message = "Failed to disconnect user " + tag + ": user not found"
                console.log(message);
                reject(message);
            } else {
                if (this.registeredUsers[i].active === 0) {
                    let message = "Failed to disconnect user " + user.username + ": user is not connected.";
                    console.log(message);
                    reject(message);
                } else {
                    this.registeredUsers[i].active = 0;
                    this.registeredUsers[i].currentTask = self.offlineTask;
                    let msg = "user " + user.username + " disconnected.";
                    if (typeof (reason) === "string") {
                        msg = msg + " Reason: " + reason;
                    }
                    console.log(msg);
                    resolve(user);
                }
            }
        })
    }

    /**
     * extends the users active state by the default decay. use this method to keep the user in an active state. setting a new task is optional, if left out user will keep current task assigned.
     *
     * @param user {User}
     * @param task {Task}
     * @returns {Promise} resolved if connection was successful
     */
    refresh(user, task){
        let self = this;
        return new Promise(function (resolve, reject) {
            let i = self.registeredUsers.findIndex(active => active.user.id === user.id);
            if (i === -1) {
                let tag = (user.username === undefined) ? ((user.id === undefined) ? "undefined" : user.id) : user.username;
                let message = "Failed to refresh user " + tag + ": user not found."
                console.log(message);
                reject(message);
            } else {
                if (self.registeredUsers[i].active === 2) {
                    self.registeredUsers[i].decay = Date.now() + self.defaultDecay;
                    if (task !== undefined) self.setActiveTask(i, task);
                    console.log("refreshing user " + user.username);
                    resolve(user)
                } else {
                    if (self.registeredUsers[i].active === 1) {
                        self.registeredUsers[i].active = 2;
                        self.registeredUsers[i].decay = Date.now() + self.defaultDecay;
                        if (task !== undefined) self.setActiveTask(i, task);
                        console.log("reactivating user " + user.username);
                        setTimeout(self.decayUser, self.defaultDecay + 1, self.registeredUsers[i], self);
                        resolve(user);
                    }
                    return self.connect(user, task);
                }
            }
        })
    }

    refreshIndex(index){
        console.log("refreshing user " + this.registeredUsers[index].user.username);
        this.registeredUsers[index].decay = Date.now() + this.defaultDecay;
        this.registeredUsers[index].active = 2;
        return true;
    }

    decayUser(userObj, self){
        if (Date.now() > userObj.decay){
            let reason = "decayed due to inactivity";
            let i = self.registeredUsers.findIndex(active => active.user.id === userObj.user.id);
            // self.setActiveTask(i, self.inactiveTask);
            self.registeredUsers[i].active = 1;
            console.log("user " + userObj.user.username + " " + reason);
        }
        else {
            setTimeout(self.decayUser, self.defaultDecay, userObj, self)
        }

        // function sendDecayWarning(){
        //     //request activity state with push message
        //     let payload = {
        //         data: {
        //             type: "request",
        //             details: "activityreport",
        //             payload: {},
        //             user: userObj.user,
        //         }
        //     }
        //     self.sendPushNotification(userObj, payload);
        // }
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

    setActiveTask(index, task) {
        let self = this;
        if (task === undefined) task = self.undefinedTask;
        if (self.registeredUsers[index] === undefined ) throw new Error("Failed to set Task: user index out of bounds.")
        if (task.name !== undefined) {
            self.registeredUsers[index].currentTask = task;
        }
        else {
            if (typeof(task) === 'string') {
                //get by name
                TaskService.getByName(task).then(function(task){
                    self.registeredUsers[index].currentTask = task
                    return task;
                })
                    .catch(function(err){
                        console.error("failed to find task. Falling back to undefined")
                        self.registeredUsers[index].currentTask = self.undefinedTask;
                        return self.undefinedTask;
                    })
            }
        }
        return self.registeredUsers[index];
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

    sendPushNotification(userObj, payload) {
        let sub = userObj.subscription;
        if (sub === undefined) return false;
        let pushSubscription = {
            "endpoint":sub.endpoint,
            "keys": {
                "p256dh":sub.token,
                "auth": sub.auth
            } // end keys
        }; // end pushSubscription

        // MAGIC!
        webpush.sendNotification(pushSubscription,JSON.stringify(payload));
        console.log("server sent notification to user " + userObj.user.username);
    }
}

let userManager = new UserManager();

module.exports = userManager;