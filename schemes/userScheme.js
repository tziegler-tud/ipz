const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// create instance of Schema
var userSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    hash: {
        type: "String",
        required: true,
    },
    allowedTasks: [
        {
            type: Schema.Types.ObjectId,
            ref: "task"
        }
    ]
})

userSchema.set('toJSON', { virtuals: true, getters: true });

module.exports = mongoose.model('user', userSchema);
