const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// create instance of Schema
var trackDataSchema = new Schema({
    type: {
        type: Number,
        required: true,
    },
    track: {
        id: {
            type: Schema.Types.ObjectId
        },
        trackId: {
            type: Number,
        },
        name: {
            type: String,
        }
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true,
    },
    isSwitched: {
        type: Boolean,
        default: false,
    },
    switch: {
        originalType: {
            type: Number,
        }
    }
})

trackDataSchema.virtual("name").get(function(){
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

trackDataSchema.virtual("switch.originalTypeName").get(function(){
    let typeString = "";
    switch(this.switch.originalType) {
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

trackDataSchema.virtual("switch.newTypeName").get(function(){
    let typeString = "";
    switch(this.switch.newType) {
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

trackDataSchema.virtual("switch.newType").get(function(){
    return this.type;
})

trackDataSchema.set('toJSON', { virtuals: true, getters: true });

module.exports = mongoose.model('trackData', trackDataSchema);
