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
    displayname: {
        type: String,
        default: this.username,
    },
    deviceType: {
        type: "String",
        default: "unset",
    },
    allowedTasks: [
        {
            type: Schema.Types.ObjectId,
            ref: "task"
        }
    ],
    role: {
        type: Schema.Types.ObjectId,
        ref: "role"
    }
})

userSchema.virtual("name").get(function() {
   if (this.displayname === undefined) return this.username;
   return this.displayname;
});

userSchema.set("usePushEach", true);
userSchema.set('toJSON', { virtuals: true, getters: true });

module.exports = mongoose.model('user', userSchema);
