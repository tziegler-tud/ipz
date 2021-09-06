import {MDCList} from "@material/list";
import {MDCTopAppBar} from "@material/top-app-bar";
import {MDCDrawer} from "@material/drawer";
import {MDCRipple} from "@material/ripple";
import {MDCSwitch} from '@material/switch';

import {apiHandler} from "./apiHandlers/apiHandler";

const Handlebars = require("handlebars");
import {transformDateTimeString} from "./helpers";
var $ = require( "jquery" );

var phone = window.matchMedia("only screen and (max-device-width: 800px)");
var tablet = window.matchMedia("only screen and (max-device-width: 1280px)");

/**
 *
 * @param type {String} Type of sidesheet. Valid types are: ["checkin", "wb1", "strecke"]
 * @param options {Object}
 * @param activePage {Page}
 * @returns {Sidesheet}
 * @constructor
 */
var Sidesheet = function(type, activePage, options){
    let self = this;
    let url;
    self.active = false;
    var applyArgs = function(options){
        let defaults = {
            containerId: "sidesheet-container",
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
 * @param type {String} Type of sidesheet. Valid types are: ["checkin", "wb1", "strecke"]
 * @param options {Object}
 * @param activePage {Page}
 */
Sidesheet.prototype.setContent = function(type, activePage, options){
    let self = this;
    let defaultOptions = {
        show: false,
    }
    options = (options === undefined) ? {}: options;
    options = Object.assign(defaultOptions, options);
    let url;
    switch(type){
        case "checkin":
            url = "/webpack/templates/sidesheet/sidesheet-checkin.hbs";
            self.createCheckinPage(activePage, options);
            break;
        case "management":
            url = "/webpack/templates/sidesheet/sidesheet-management.hbs";
            self.createManagementPage(activePage, options);
            break;
        case "apotheke":
            url = "/webpack/templates/sidesheet/sidesheet-apotheke.hbs";
            self.createApothekePage(activePage, options);
            break;

        case "strecke":
            url = "/webpack/templates/sidesheet/sidesheet-track.hbs";
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
Sidesheet.prototype.createCheckinPage = function(activePage, options){
    let self = this;
    let url = "/webpack/templates/sidesheet/sidesheet-checkin.hbs";
    let context = {};
    $.get(url, function (data) {
        var template = Handlebars.compile(data);
        self.container.innerHTML = template(context);

        const switchControl = new MDCSwitch(document.querySelector('.mdc-switch'));
        let soundSwitch = document.getElementById("sound-switch");
        soundSwitch.addEventListener("change", function(e){
            if(this.checked) {
                //enable sound
                activePage.setSound(true);
            }
            else {
                activePage.setSound(false)
            }
        })

        let cancelBtn = document.getElementById("sidesheet-cancel-button-element")
        cancelBtn.addEventListener("click", function(){
            self.hide();
        })
        if(!options.show) self.hide();
    });
}

/**
 *
 * @param activePage
 * @param options
 */
Sidesheet.prototype.createManagementPage = function(activePage, options){
    let self = this;
    let url = "/webpack/templates/sidesheet/sidesheet-management.hbs";
    let context = {
        title: "Einstellungen - Teamleiter-Modul"
    };
    $.get(url, function (data) {
        var template = Handlebars.compile(data);
        self.container.innerHTML = template(context);
        const switches = [].map.call(document.querySelectorAll(".mdc-switch"), function(el) {
            let s = new MDCSwitch(el);
        });

        let reloadButton = document.getElementById("button-reload");
        reloadButton.addEventListener("click", function(){
            //reload page
            location.reload();
        })

        let refreshSwitch = document.getElementById("refresh-switch");
        refreshSwitch.addEventListener("change", function(e){
            if(this.checked) {
                //enable sound
                activePage.enableRefresh();
            }
            else {
                activePage.disableRefresh();
            }
        })

        let cancelBtn = document.getElementById("sidesheet-cancel-button-element")
        cancelBtn.addEventListener("click", function(){
            self.hide();
        })

        if(!options.show) self.hide();
    });
}


/**
 *
 * @param activePage
 * @param options
 */
Sidesheet.prototype.createApothekePage = function(activePage, options){
    let self = this;
    let url = "/webpack/templates/sidesheet/sidesheet-management.hbs";
    let context = {
        title: "Einstellungen - Apotheke"
    };
    $.get(url, function (data) {
        var template = Handlebars.compile(data);
        self.container.innerHTML = template(context);
        const switches = [].map.call(document.querySelectorAll(".mdc-switch"), function(el) {
            let s = new MDCSwitch(el);
        });

        let reloadButton = document.getElementById("button-reload");
        reloadButton.addEventListener("click", function(){
            //reload page
            location.reload();
        })

        let refreshSwitch = document.getElementById("refresh-switch");
        refreshSwitch.addEventListener("change", function(e){
            if(this.checked) {
                //enable sound
                activePage.enableRefresh();
            }
            else {
                activePage.disableRefresh();
            }
        })

        let cancelBtn = document.getElementById("sidesheet-cancel-button-element")
        cancelBtn.addEventListener("click", function(){
            self.hide();
        })

        if(!options.show) self.hide();
    });
}


/**
 *
 * @param activePage
 * @param options
 */
Sidesheet.prototype.createTrackPage = function(activePage, options){
    let self = this;
    let url = "/webpack/templates/sidesheet/sidesheet-track.hbs";
    let context = {
        title: "Einstellungen - Impfstrecke"
    };
    $.get(url, function (data) {
        var template = Handlebars.compile(data);
        self.container.innerHTML = template(context);
        const switchControl = new MDCSwitch(document.querySelector('.mdc-switch'));

        let soundSwitch = document.getElementById("sound-switch");
        soundSwitch.addEventListener("change", function(e){
            if(this.checked) {
                //enable sound
                activePage.setSound(true);
            }
            else {
                activePage.setSound(false)
            }
        })


        let cancelBtn = document.getElementById("sidesheet-cancel-button-element")
        cancelBtn.addEventListener("click", function(){
            self.hide();
        })
        if(!options.show) self.hide();
    });
}


Sidesheet.prototype.show = function(){
    this.active = true;
    this.container.classList.add("sidesheet-active");
      return true;
}

Sidesheet.prototype.hide = function(){
    this.active = false;
    this.container.classList.remove("sidesheet-active");
    return false;
}

Sidesheet.prototype.toggle = function(){
    if(this.active) return this.hide();
    else {return this.show()}
}

export {Sidesheet}