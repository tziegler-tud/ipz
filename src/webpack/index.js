import {preloader} from "./preloader";
import {Navigation} from "./app_navigation";
import {Sidesheet} from "./app_sidesheet";
import {transformDateTimeString} from "./helpers";

import "./handlebarsHelpers";
const Handlebars = require("handlebars");
var $ = require( "jquery" );

var phone = window.matchMedia("only screen and (max-device-width: 800px)");
var tablet = window.matchMedia("only screen and (max-device-width: 1280px)");

$(window).on('load',function() {
    console.log("finished loading, hiding preloader");
    // let plr = new preloader();
    // setTimeout(plr.hide,0);

    let nav = new Navigation(
        {
            pageData: {
                navTitle: "ImpfApp Dresden - Startseite",
                date: transformDateTimeString(Date.now()).date,
                time: transformDateTimeString(Date.now()).time("hh:mm:ss"),
            },
        },
        {
            clock: ".navigation-clock",
            sidesheet: false,
            open: false,
        },
    );
});

