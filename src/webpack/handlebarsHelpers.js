const Handlebars = require("handlebars");
import {transformDateTimeString} from "./helpers";

Handlebars.registerHelper('transformDateTimeString', function(dateString, format) {
    return new Handlebars.SafeString(transformDateTimeString(dateString, format).dateTime);
});

Handlebars.registerHelper('transformTimeString', function(dateString, format) {
    return new Handlebars.SafeString(transformDateTimeString(dateString, format).time("hh:mm"));
});