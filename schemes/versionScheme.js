const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// create instance of Schema
var versionSchema = new Schema({
    label: {
        type: String,
        required: true,
    },
    track: {
        type: Schema.Types.ObjectId,
        ref: "task"
    },
    version: {
        type: Number,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now(),
    }
})

versionSchema.set('toJSON', { virtuals: true, getters: true });

module.exports = mongoose.model('version', versionSchema);
