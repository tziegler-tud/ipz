const passport =        require('passport');
const LocalStrategy =   require('passport-local').Strategy;
const TaskService = require("../services/taskService");
const UserService = require("../services/userService");
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

passport.use(

    // @louis I made the login function async because of performance reasons. An attacker could spam the login and this would block the server due to a synchronous (blocking) bcrypt call!
    new LocalStrategy(
        {
            usernameField: 'username',
            passwordField: 'password',
        }, async (username, password, done) => {

            //find user
            const user = await UserService.getByUsername(username);
            // TODO: When done with debugging we should remove this message as any user can now try out random usernames until he finally gets the message "wrong password". This is a security risk!
            if (user == null) {
                console.log("Username not found. :-(");
                return done(null, false, { message: "No user with the given username exists" });
            }

            // check the password
            if(username === user._doc.username && await bcrypt.compare(password, user._doc.hash)) {
                console.log('password ok');
                return done(null, user);
            } else {
                console.log('login failed');
                return done(null, false, { message: "The given password does not match the username" });

            }
            // if (task == null) {
            //     console.log('login failed: task not found');
            //     return done(null, false, { message: "Failed to serialize: Task not found" });
            // }

            //create a new temporary user
            //
            // if (task.requiresAuthentication) {
            //     // check the password
            //     if(await bcrypt.compare(password, task.hash)) {
            //         console.log('password ok');
            //         return done(null, user);
            //     } else {
            //         console.log('login failed');
            //         return done(null, false, { message: "authentication for task " + task.name + " failed" });
            //     }
            // }
            // else {
            //     return done(null, user);
            // }
        }
    )

);

// tell passport how to serialize the user
passport.serializeUser((user, done) => {
    console.log('Inside serializeUser callback. User id is save to the session file store here');
    done(null, user._doc._id);
});


passport.deserializeUser((id, done) => {
    UserService.getById(id)
        .then(user => user ? done(null, user): done(null, false))
        .catch(err => console.log(err))
});

module.exports = passport;