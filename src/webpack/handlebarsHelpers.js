const Handlebars = require("handlebars");
import {transformDateTimeString} from "./helpers";

Handlebars.registerHelper('transformDateTimeString', function(dateString, format) {
    return new Handlebars.SafeString(transformDateTimeString(dateString, format).dateTime);
});

Handlebars.registerHelper('transformTimeString', function(dateString, format) {
    return new Handlebars.SafeString(transformDateTimeString(dateString, format).time("hh:mm"));
});

Handlebars.registerHelper('checklength', function (v1, v2, options) {
    'use strict';
    if (v1.length>v2) {
        return options.fn(this);
    }
    return options.inverse(this);
});

Handlebars.registerHelper('greaterThan', function (v1, v2, options) {
    'use strict';
    if (v1>v2) {
        return options.fn(this);
    }
    return options.inverse(this);
});

Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});



Handlebars.registerHelper('add', function (x, y) {
    return x+y;
});


Handlebars.registerHelper('timeFromNow', function (x) {
    return Date.now() + x;
});

Handlebars.registerHelper('userHasRole', function (user, role) {
    //handle populated and non-populated cases

    if (user.role === undefined) return false;
    let userRoleId = (user.role.id === undefined) ? user.role : user.role.id;
    let roleId = (role.id === undefined) ? role : role.id;
    return (userRoleId === roleId);
});

Handlebars.registerHelper("navEntryAllowed", function(taskName, allowedTasks){
    //find whether allowedTasks contains an entry with the given name. Note that this is not save, i.e. make sure Tasks have unique names
    let index = allowedTasks.findIndex(task => task.name === taskName);
    return (index > -1)
})