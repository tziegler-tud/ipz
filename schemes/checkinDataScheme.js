const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// create instance of Schema
var checkinDataSchema = new Schema({
    type: {
        type: Number,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    }
})

checkinDataSchema.virtual("name").get(function(){
    let typeString = "";
    switch(this.type) {
        case 1:
            typeString ="BionTech";
            break;
        case 2:
            typeString ="Moderna";
            break;
        case 3:
            typeString ="Astrazeneca";
            break;
        default:
            typeString = "nicht angegeben";
            break;
    }
    return typeString;
})

checkinDataSchema.set('toJSON', { virtuals: true, getters: true });

module.exports = mongoose.model('checkinData', checkinDataSchema);
