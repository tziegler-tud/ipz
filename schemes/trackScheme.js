const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// create instance of Schema
var trackSchema = new Schema({
    trackId: {
        type: Number,
    },
    name: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
})

trackSchema.set('toJSON', { virtuals: true, getters: true });

module.exports = mongoose.model('track', trackSchema);
