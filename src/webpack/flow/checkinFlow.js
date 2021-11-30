import {preloader} from "../preloader";
import "../pushhandler";
import {Navigation} from "../app_navigation";
import {Sidesheet} from "../app_sidesheet";
import {CheckinPage} from "./app_checkinPage";
import {transformDateTimeString} from "../helpers";
import "../handlebarsHelpers";
import {Bottom} from "../bottom/app_bottom";
const Handlebars = require("handlebars");
var $ = require( "jquery" );

var phone = window.matchMedia("only screen and (max-device-width: 800px)");
var tablet = window.matchMedia("only screen and (max-device-width: 1280px)");

$(window).on('load',function() {
    console.log("finished loading, hiding preloader");
    let plr = new preloader();


    let sidesheet, bottomTabs;
    let track = window.args.track;


    let nav = new Navigation(
        {
            user: window.user,
            pageData: {
                navTitle: "Checkin - " + track.name,
                date: transformDateTimeString(Date.now()).date,
                time: transformDateTimeString(Date.now()).time("hh:mm:ss"),
            },
        },
        {
            clock: ".navigation-clock",
            sidesheet: true,
            activeElement: "app-link-checkin--" + track.id,
        },
    );

    let checkinPage = new CheckinPage({track: track});

    checkinPage.show().then(function(){
        plr.hide();
        sidesheet = new Sidesheet("checkin", checkinPage, {});
        if (phone.matches || tablet.matches) {
            checkinPage.focus({click: true});
        }
    });
    nav.initialize
        .then(function(){
            nav.setAction("mdc-top-app-bar-action1", function(e, args){
                sidesheet.toggle();
            })
        });
});
