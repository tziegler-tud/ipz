const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// create instance of Schema
var checkinDataSchema = new Schema({
    track: {
        type: Schema.Types.ObjectId,
        ref: "track",
        required: true,
    },
    amount: {
        type: Number,
        default: 1,
    },
    data: [
        {
            number: {
                type: String
            },
            details: {
                type: {
                    type: Number,
                },
                number: {
                    type: Number,
                }
            }
        },
    ],
    queueNumber: {
        type: String,
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
    }],
})

// checkinDataSchema.virtual("typeName").get(function(){
//     let typeString = "";
//     switch(this.type) {
//         case 1:
//             typeString ="BionTech";
//             break;
//         case 2:
//             typeString ="Moderna";
//             break;
//         case 3:
//             typeString ="Johnson";
//             break;
//         default:
//             typeString = "nicht angegeben";
//             break;
//     }
//     return typeString;
// })

checkinDataSchema.set('toJSON', { virtuals: true, getters: true });

module.exports = mongoose.model('checkinData', checkinDataSchema);
