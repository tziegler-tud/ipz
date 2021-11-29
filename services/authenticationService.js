const UserService = require("./userService");
const bcrypt = require('bcrypt');

const db = require('../schemes/mongo');
const Authenticator = db.authenticator;

class AuthService {
    constructor() {
        let self = this;
        console.log("initializing authentication service...\n");
        //might wanna do smt here later
        this.authenticators = {};
        //load authentication information from database
        Authenticator.find()
            .then(function(authenticators){
                if (authenticators.length === 0) {
                    console.warn("No authenticators found. Creating default authenticator.");
                    self.addAuthenticator("admin", "admin")
                        .then(function(result){
                            console.log("authentication service initialized succesfully.");
                        })
                }
                else {
                    console.log("Authentication settings found. Applying...");
                    //load authenticators
                    authenticators.forEach(function(authenticator){
                        self.authenticators[authenticator.name] = authenticator.hash;
                    })
                    console.log("authentication service initialized succesfully.");
                }
            });
    }

    async authenticate(password, authenticationName){
        let auth = this.authenticators[authenticationName];
        if (auth === undefined) {
            let msg = "Authentication as " + authenticationName + " failed: no matching authenticator found.";
            console.log(msg);
            throw new Error(msg);
        }
        if (await bcrypt.compare(password, auth)){
            console.log("Authentication as " + authenticationName + " successful.")
            return true;
        }
        else {
            let msg = "Authentication as " + authenticationName + " failed: password is wrong."
            console.log(msg);
            throw new Error(msg);
        }
    }

    async addAuthenticator(password, authenticationName){
        let self = this;
        const salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(password, salt);
        let auth = new Authenticator({name: authenticationName, hash: hash});
        auth.save()
            .then(function(result){
                console.log("authenticator " + authenticationName + " added successfully.");
                self.authenticators[authenticationName] = hash;
            });

    }

    async get(){
        return Authenticator.find().select("-hash");
    }

    async getById(id){
        return Authenticator.findById(id).select("-hash");
    }

    async getByName(name){
        return Authenticator.find({name: name}).select("-hash");
    }

    async update(id, authObject){
        let auth = await Authenticator.findById(id);
        if (auth === null) {
            return false;
        }
        Object.assign(auth, authObject);
        return auth.save();
    }

    async remove(id){
        return Authenticator.findByIdAndRemove(id);
    }
}

let authService = new AuthService();

module.exports = authService;