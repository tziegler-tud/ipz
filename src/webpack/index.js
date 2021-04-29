import {preloader} from "./preloader";
import {Navigation} from "./app_navigation";
import {Sidesheet} from "./app_sidesheet";
import {CheckinPage, CheckoutPage} from "./app_pages";
import {transformDateTimeString} from "./helpers";
import "./handlebarsHelpers";
const Handlebars = require("handlebars");
var $ = require( "jquery" );

var phone = window.matchMedia("only screen and (max-device-width: 400px)");
var tablet = window.matchMedia("only screen and (max-device-width: 1280px)");

$(window).on('load',function() {
    console.log("finished loading, hiding preloader");
    // let plr = new preloader();
    // setTimeout(plr.hide,0);
});

let sidesheet;


let nav = new Navigation(
    {
        pageData: {
            navTitle: "Check In - Vorkontrolle",
            date: transformDateTimeString(Date.now()).date,
            time: transformDateTimeString(Date.now()).time("hh:mm:ss"),
        },
    },
    {
        clock: ".navigation-clock",
        sidesheet: true,
        nav1: {
            onclick: function(){
            }
        },
        nav2: {
            onclick: function(){
                checkoutPage.hide();
                checkinPage.show();
                nav.setTitle("Check In - Vorkontrolle");
                sidesheet.setContent("checkin", checkinPage, {show: false});

            }
        },
        nav3: {
            onclick: function(){
                checkoutPage.show();
                nav.setTitle("Wartebereich 1 - Aufruf");
                sidesheet.setContent("wb1", checkoutPage, {show: false});
            }
        }
    },
);

let checkinPage = new CheckinPage();
let checkoutPage = new CheckoutPage();
checkinPage.show().done(function(){
    sidesheet = new Sidesheet("checkin", checkinPage, {});
    if (phone.matches || tablet.matches) {
        checkinPage.focus({click: true});
    }
});
nav.initialize
    .done(function(){
        nav.setAction("mdc-top-app-bar-action1", function(e, args){
            sidesheet.toggle();
        })
    });

if (!(phone.matches || tablet.matches)) {
    $(window).one("MDCDrawer:opened", function(){
        checkinPage.focus()
    });
}

