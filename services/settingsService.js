const db = require('../schemes/mongo');

const Settings = db.settings;
const Version = db.version;

module.exports = {
    initialize,
    get,
    update,
    reset,
    getCheckinSettings,
    getCheckoutSettings,
    updateCheckinSettings,
    updateCheckoutSettings,
};

let defaults = {

}

async function initialize(){
    console.log("Initializing settings service...")
    let settings = await Settings.findOne();
    if(settings) console.log("Settings found. Ready to go.")
    else {
        console.log("No settings found. Creating new settings from defaults.")
        let newSettings = new Settings(defaults);
        newSettings.save()
            .then(function(){
                console.log("Successfully created settings object. Ready to go.")
            })
            .catch(function(err){
                let msg = "Failed to create settings object. This is bad.";
                console.error(msg);
                throw new Error(err);
            })
    }
}
/**
 * Gets all users
 */
async function get() {
    return Settings.findOne();
}

async function getCheckoutSettings() {
    let settings = await Settings.findOne();
    if(!settings) throw new Error("unable to read settings from database.");
    return settings.checkoutSettings;
}

async function getCheckinSettings() {
    let settings = await Settings.findOne();
    if(!settings) throw new Error("unable to read settings from database.");
    return settings.checkinSettings;
}

async function update(settingsObject) {
    let settings = await Settings.findOne();
    if(!settings) throw new Error("unable to read settings from database.");
    settings = settingsObject;
    settings.save();
}

async function reset() {
    await Settings.deleteMany();
    let settings = new Settings(defaults);
    settings.save();
}

async function updateCheckinSettings(checkinSettingsObject) {
    let settings = await Settings.findOne();
    if(!settings) throw new Error("unable to read settings from database.");
    settings.checkinSettings = checkinSettingsObject;
    settings.save();
}

async function updateCheckoutSettings(checkoutSettingsObject) {
    let settings = await Settings.findOne();
    if(!settings) throw new Error("unable to read settings from database.");
    settings.checkoutSettings = checkoutSettingsObject;
    settings.save();
}

