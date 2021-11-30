import {preloader} from "./preloader";
import {Navigation} from "./app_navigation";
import {Sidesheet} from "./app_sidesheet";
import {transformDateTimeString} from "./helpers";

import "./handlebarsHelpers";
import {IndexPage} from "./index/app_indexPage";
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

    let indexPage = new IndexPage();
    indexPage.show()
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

});

