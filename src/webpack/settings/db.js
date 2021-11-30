import {preloader} from "../preloader";
import {Navigation} from "../app_navigation";
import {Sidesheet} from "../app_sidesheet";
import {DbPage} from "./app_dbPage";
import {transformDateTimeString} from "../helpers";
import "../handlebarsHelpers";
const Handlebars = require("handlebars");
var $ = require( "jquery" );

var phone = window.matchMedia("only screen and (max-device-width: 800px)");
var tablet = window.matchMedia("only screen and (max-device-width: 1280px)");

$(window).on('load',function() {
    console.log("finished loading, hiding preloader");
    // let plr = new preloader();
    // setTimeout(plr.hide,0);
});

let sidesheet;


let nav = new Navigation(
    {
        user: window.user,
        pageData: {
            navTitle: "Datenbankverwaltung",
            date: transformDateTimeString(Date.now()).date,
            time: transformDateTimeString(Date.now()).time("hh:mm:ss"),
        },
    },
    {
        clock: ".navigation-clock",
        sidesheet: true,
        activeElement: "app-link-management",
    },
);

let tasksPage = new DbPage("tasks");
let tracksPage = new DbPage("tracks");
if (window.dbPageType === undefined) window.dbPageType = "tasks";

switch(window.dbPageType){
    case "tasks":
        tasksPage.show();
        break;
    case "tracks":
        tracksPage.show();
        break;
}

//     .done(function(){
//     sidesheet = new Sidesheet("checkin", managementPage, {});
// });


nav.initialize
    .then(function(){
        nav.setAction("mdc-top-app-bar-action1", function(e, args){
            sidesheet.toggle();
        })
        let subpage = nav.addSubpage("settings",  {user: window.user}, true, "app-link-settings", true);
        subpage.init
            .then(function(){})
    });
