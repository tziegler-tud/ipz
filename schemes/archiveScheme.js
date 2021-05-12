const mongoose = require('mongoose');
const dateTransformer = require('../helpers/dateTransformer');
const Schema = mongoose.Schema;


// create instance of Schema
var archiveSchema = new Schema({
    timestamp: {
        type: Date,
        default: Date.now,
    },
    date: {
        type: String,
        default: dateTransformer.transformDateTimeString(this.timestamp).date,
    },
    data: {
        trackDatas: [{

        }],
        checkindatas: [{

        }]

    }
})


archiveSchema.set('toJSON', { virtuals: true, getters: true });

module.exports = mongoose.model('archive', archiveSchema);
