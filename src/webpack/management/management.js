import {preloader} from "../preloader";
import {Navigation} from "../app_navigation";
import {Sidesheet} from "../app_sidesheet";
import {ManagementModulePage} from "./app_managementModulePage";
import {transformDateTimeString} from "../helpers";
import "../handlebarsHelpers";
import {Bottom} from "../app_bottom";
const Handlebars = require("handlebars");
var $ = require( "jquery" );

var phone = window.matchMedia("only screen and (max-device-width: 400px)");
var tablet = window.matchMedia("only screen and (max-device-width: 1280px)");

$(window).on('load',function() {
    console.log("finished loading, hiding preloader");
    // let plr = new preloader();
    // setTimeout(plr.hide,0);
});

let sidesheet, bottomTabs;


let nav = new Navigation(
    {
        pageData: {
            navTitle: "Management",
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

let pages  = [];
let managementDashboardPage = new ManagementModulePage("dashboard");
let managementTracksPage = new ManagementModulePage("tracks");
let managementStatisticsPage = new ManagementModulePage("statistics");

pages.push(managementDashboardPage);
pages.push(managementTracksPage);
pages.push(managementStatisticsPage);

managementDashboardPage.show({tabs: true})
    .done(function(){
        // sidesheet = new Sidesheet("checkin", managementPage, {});
        bottomTabs =  new Bottom("management", managementDashboardPage, {})
    });

nav.initialize
    .then(function(){
        nav.setAction("mdc-top-app-bar-action1", function(e, args){
            // sidesheet.toggle();
        })
        let subpage = nav.addSubpage("management", {}, true, "app-link-management", true);
        subpage.init
            .then(function(){
                nav.setAction("nav-management-subpage--dashboard", function(e, args) {
                    nav.setActiveElement("nav-management-subpage--dashboard");
                    pages.forEach(function(page){
                        if (page.active){
                            page.hide();
                        }
                    })
                    managementDashboardPage.show({tabs: true})
                        .done(function(){
                            // sidesheet = new Sidesheet("checkin", managementPage, {});
                            bottomTabs =  new Bottom("management", managementDashboardPage, {})
                        });
                })
                nav.setAction("nav-management-subpage--tracks", function(e, args) {
                    nav.setActiveElement("nav-management-subpage--tracks");
                    pages.forEach(function(page){
                        if (page.active){
                            page.hide();
                        }
                    })
                    managementTracksPage.show({tabs: true})
                        .then(function(){
                            // sidesheet = new Sidesheet("checkin", managementPage, {});
                            //bottoms are initialized inside Page.show
                            // bottomTabs =  new Bottom("management-tracks", managementTracksPage, {})
                        });
                })
                nav.setAction("nav-management-subpage--statistics", function(e, args) {
                    nav.setActiveElement("nav-management-subpage--statistics");
                    pages.forEach(function(page){
                        if (page.active){
                            page.hide();
                        }
                    })
                    managementStatisticsPage.show({tabs: true})
                        .done(function(){
                            // sidesheet = new Sidesheet("checkin", managementPage, {});
                            bottomTabs =  new Bottom("management", managementStatisticsPage, {})
                        });
                })
            })
    });

