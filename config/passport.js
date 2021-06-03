const passport =        require('passport');
const LocalStrategy =   require('passport-local').Strategy;
const TaskService = require("../services/taskService");
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

passport.use(

    // @louis I made the login function async because of performance reasons. An attacker could spam the login and this would block the server due to a synchronous (blocking) bcrypt call!
    new LocalStrategy(
        {
            usernameField: 'task',
            passwordField: 'password',
        }, async (taskName, password, done) => {

            //find task
            let task = await TaskService.getByName(taskName);

            if (task == null) {
                console.log('login failed: task not found');
                return done(null, false, { message: "Failed to serialize: Task not found" });
            }

            //create a new temporary user
           let user = {
                id: uuidv4(),
                login: Date.now(),
                task: task,
            }

            if (task.requiresAuthentication) {
                // check the password
                if(await bcrypt.compare(password, task.hash)) {
                    console.log('password ok');
                    return done(null, user);
                } else {
                    console.log('login failed');
                    return done(null, false, { message: "authentication for task " + task.name + " failed" });
                }
            }
            else {
                return done(null, user);
            }
        }
    )

);

// tell passport how to serialize the user
passport.serializeUser((user, done) => {
    console.log('Inside serializeUser callback. User id is save to the session file store here');
    done(null, user.id);
});


passport.deserializeUser((id, done) => {
    userService.getById(id)
        .then(user => user ? done(null, user): done(null, false))
        .catch(err => console.log(err))
});

module.exports = passport;