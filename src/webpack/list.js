import {preloader} from "./preloader";
import {Navigation} from "./app_navigation";
import {Sidesheet} from "./app_sidesheet";
import {ListPage} from "./app_listPage";
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

            }
        },
        nav3: {
            onclick: function(){

            }
        }
    },
);

let listPage = new ListPage();
listPage.show()
//     .done(function(){
//     sidesheet = new Sidesheet("checkin", managementPage, {});
// });

nav.initialize
    .done(function(){
        nav.setAction("mdc-top-app-bar-action1", function(e, args){
            sidesheet.toggle();
        })
    });

