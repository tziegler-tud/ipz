import {preloader} from "./preloader";
import "./pushhandler";

import {Navigation} from "./app_navigation";
import {Sidesheet} from "./app_sidesheet";
import {Bottom} from "./bottom/app_bottom";
import {StreckePage} from "./strecke/app_streckePage";
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

    let track = window.args.strecke;
    let trackId = window.args.strecke.id

    if (track === undefined) {
        throw new Error("failed to initialize Strecke: No information received");
    } else {
        if (trackId === undefined) {
            throw new Error("failed to initialize Strecke: Invalid parameters received");
        } else {
            //find track
            $.get("/api/v1/track/" + trackId, function (result) {
                buildPage(result)
            })
        }
    }
});

function buildPage(track){
    let sidesheet;
    let bottomTabs;

    let streckeDomId = "app-link-strecke--" + track.id;
    let streckeTitle = window.args.title;
    let nav = new Navigation(
        {
            pageData: {
                navTitle: streckeTitle,
                date: transformDateTimeString(Date.now()).date,
                time: transformDateTimeString(Date.now()).time("hh:mm:ss"),
            },
        },
        {
            clock: ".navigation-clock",
            sidesheet: true,
            activeElement: streckeDomId,
            topbar: true,
            topbarClasses: ["trackColor--"+track.name]
        },
    );

    let streckePage = new StreckePage(track);
    streckePage.show({tabs: true}).done(function(){
        sidesheet = new Sidesheet("strecke", streckePage, {});
        bottomTabs =  new Bottom("strecke", streckePage, {})


    });

    nav.initialize
        .then(function(){
            nav.setAction("mdc-top-app-bar-action1", function(e, args){
                sidesheet.toggle();
            })
        });
}
