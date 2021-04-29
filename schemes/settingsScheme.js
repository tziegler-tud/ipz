const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// create instance of Schema
var settingsSchema = new Schema({
    timestamp: {
        type: Date,
        default: Date.now(),
    },
    checkinSettings: {

    },
    checkoutSettings: {
        sorting: {
            property: {
                type: String,
                default: "queueNumber",
            },
            direction: {
                type: Number,
                default: 1,
            }
        }
    }
})

settingsSchema.set('toJSON', { virtuals: true, getters: true });

module.exports = mongoose.model('settings', settingsSchema);
