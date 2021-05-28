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

Handlebars.registerHelper('add', function (x, y) {
    return x+y;
});