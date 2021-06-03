const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// create instance of Schema
var taskSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    isAllowed: {
        type: Boolean,
        default: true,
    },
    requiresAuthentication: {
        type: Boolean,
        default: false,
    },
    hash: {
        type: "String",
    }
})

taskSchema.set('toJSON', { virtuals: true, getters: true });

module.exports = mongoose.model('task', taskSchema);
