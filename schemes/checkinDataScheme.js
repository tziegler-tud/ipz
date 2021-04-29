const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// create instance of Schema
var checkinDataSchema = new Schema({
    amount: {
        type: Number,
        default: 1,
    },
    data: [
        {
            type: Number
        },
    ],
    queueNumber: {
        type: Number,
        required: true,
    },
    currentStatus: {
        status: {
            type: Number,
            default: 0,
        },
        text: {
            type: String,
        },
        timestamp: {

        }
    },
    statusHistory: [{
        status: {
            type: String,
        },
        text: {
            type: String,
        },
        timestamp: {

        }
    }]
})

checkinDataSchema.set('toJSON', { virtuals: true, getters: true });

module.exports = mongoose.model('checkinData', checkinDataSchema);
