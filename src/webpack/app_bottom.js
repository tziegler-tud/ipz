const Handlebars = require("handlebars");
import {transformDateTimeString} from "./helpers";
import {MDCSnackbar} from "@material/snackbar";
import {MDCTabBar} from '@material/tab-bar';
import {MDCTabIndicator} from '@material/tab-indicator';
var $ = require( "jquery" );

var phone = window.matchMedia("only screen and (max-device-width: 400px)");
var tablet = window.matchMedia("only screen and (max-device-width: 1280px)");

/**
 *
 * @param type {String} Type of bottom. Valid types are: ["checkin", "wb1", "strecke"]
 * @param options {Object}
 * @param activePage {Page}
 * @returns {Bottom}
 * @constructor
 */
var Bottom = function(type, activePage, options){
    let self = this;
    let url;
    self.active = false;
    var applyArgs = function(options){
        let defaults = {
            containerId: "bottom-container",
        }
        options = (options === undefined) ? {}: options;
        return Object.assign(defaults, options);
    };
    //options
    self.options = applyArgs(options);
    self.container = document.getElementById(self.options.containerId);
    if(!self.container) {
        //try again later
        $(window).on("load", function(){
            self.container = document.getElementById(self.options.containerId);
            self.setContent(type, activePage, options);
        })
    }
    else {
        self.setContent(type, activePage, options);
    }
    return self;
}

/**
 *
 * @param type {String} Type of bottom bar. Valid types are: ["checkin", "wb1", "strecke"]
 * @param options {Object}
 * @param activePage {Page}
 */
Bottom.prototype.setContent = function(type, activePage, options){
    let self = this;
    let defaultOptions = {
        show: false,
    }
    options = (options === undefined) ? {}: options;
    options = Object.assign(defaultOptions, options);
    let url;
    switch(type){
        case "checkin":
            url = "/webpack/templates/bottom/bottom-checkin.hbs";
            self.createCheckinPage(activePage, options);
            break;
        case "wb1":
            url = "/webpack/templates/bottom/bottom-wb1.hbs";
            self.createWb1Page(activePage, options);
            break;
        case "strecke":
            url = "/webpack/templates/bottom/bottom-track.hbs";
            self.createTrackPage(activePage, options);
            break;
        default:

            break;
    }
    let context = {};
}

/**
 *
 * @param activePage
 * @param options
 */
Bottom.prototype.createCheckinPage = function(activePage, options){

}

/**
 *
 * @param activePage
 * @param options
 */
Bottom.prototype.createWb1Page = function(activePage, options){

}


/**
 *
 * @param activePage
 * @param options
 */
Bottom.prototype.createTrackPage = function(activePage, options){
    let self = this;
    let url = "/webpack/templates/bottom/bottom-track.hbs";
    let context = {

    };
    $.get(url, function (data) {
        var template = Handlebars.compile(data);
        self.container.innerHTML = template(context);

        /**
         * bottom nav
         */

        const bottomTabs = new MDCTabBar(document.querySelector('.mdc-tab-bar'));
        const tabIndicator = new MDCTabIndicator(document.querySelector('.mdc-tab-indicator'));
        bottomTabs.listen("MDCTabBar:activated", function(event){
            let detail = event.detail;
            let index = detail.index;
            console.log(index + " activated");
        });
    });
}


Bottom.prototype.show = function(){
    this.active = true;
    this.container.classList.add("bottom-active");
      return true;
}

Bottom.prototype.hide = function(){
    this.active = false;
    this.container.classList.remove("bottom-active");
    return false;
}

Bottom.prototype.toggle = function(){
    if(this.active) return this.hide();
    else {return this.show()}
}

export {Bottom}