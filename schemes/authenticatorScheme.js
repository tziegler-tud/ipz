const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// create instance of Schema
var authenticatorSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    hash: {
        type: String,
        required: true,
    }
})

authenticatorSchema.set('toJSON', { virtuals: true, getters: true });

module.exports = mongoose.model('authenticator', authenticatorSchema);
