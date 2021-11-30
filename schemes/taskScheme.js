const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// create instance of Schema
var taskSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        default: "unset",
    },
    url: {
        type: "String"
    },
    isAllowed: {
        type: Boolean,
        default: true,
    },
    requiresAuthentication: {
        type: Boolean,
        default: false,
    },
    daily: {
        type: Boolean,
        required: true,
        default: false,
    }
})

taskSchema.set('toJSON', { virtuals: true, getters: true });

module.exports = mongoose.model('task', taskSchema);
