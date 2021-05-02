import {MDCList} from "@material/list";
import {MDCTopAppBar} from "@material/top-app-bar";
import {MDCDrawer} from "@material/drawer";
import {MDCRipple} from "@material/ripple";
import {MDCSwitch} from '@material/switch';

import {apiHandler} from "./apiHandler";

const Handlebars = require("handlebars");
import {transformDateTimeString} from "./helpers";
var $ = require( "jquery" );

var phone = window.matchMedia("only screen and (max-device-width: 400px)");
var tablet = window.matchMedia("only screen and (max-device-width: 1280px)");

/**
 *
 * @param type {String}
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
        case "wb1":
            url = "/webpack/templates/sidesheet/sidesheet-wb1.hbs";
            self.createWb1Page(activePage, options);
            break;
        default:
            url = "/webpack/templates/sidesheet/sidesheet-checkin.hbs";
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
        let list = new MDCList(document.querySelector('.sidesheet .mdc-deprecated-list'));
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
Sidesheet.prototype.createWb1Page = function(activePage, options){
    let self = this;
    let url = "/webpack/templates/sidesheet/sidesheet-wb1.hbs";
    let context = {};
    $.get(url, function (data) {
        var template = Handlebars.compile(data);
        self.container.innerHTML = template(context);
        const switchControl = new MDCSwitch(document.querySelector('.mdc-switch'));
        //setup sorting select element
        let sort = document.getElementById("wb1-select-sort");
        apiHandler.getCheckoutSorting()
            .done(function(result){
                //find corresponding option
                sort.value=result.property;

            })
        let cancelBtn = document.getElementById("sidesheet-cancel-button-element")
        cancelBtn.addEventListener("click", function(){
            self.hide();
        })
        $(sort).on("change", function(){
            let val = sort.value;
            //request new data
            apiHandler.setCheckoutSorting({sort: val, direction: 1})
                .done(function(){
                    //update page
                })
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