const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// create instance of Schema
var roleSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    isDefault: {
        type: Boolean,
        default: false,
    }
})

roleSchema.set('toJSON', { virtuals: true, getters: true });

module.exports = mongoose.model('role', roleSchema);
