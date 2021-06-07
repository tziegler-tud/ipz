const Handlebars = require("handlebars");
import "../handlebarsHelpers";

import {apiStatisticsHandler} from "../apiHandlers/apiStatisticsHandler";
import {Page} from "../app_page";
var $ = require( "jquery" );

import {MDCRipple} from "@material/ripple";
import {MDCSwitch} from '@material/switch';


var phone = window.matchMedia("only screen and (max-width: 50em)");



var DevicePage = function(args, context) {
    let self = Page.apply(this, args);
    self.url = "/webpack/templates/device.hbs";
    self.entries = undefined;
    self.page = undefined;
    //get current entries
    self.context = (context === undefined) ? {} : context;
    //render html
}


DevicePage.prototype.hide = function(){
    this.active = false;

}

DevicePage.prototype.show = function(options){
    let self = this;
    let context = self.context;
    if (context.user === undefined){
        if (window.user !== undefined) context.user = window.user;
        else context.user = {username: "undefined"}
    }
    return self.buildHtml(self.url, context);
}

DevicePage.prototype.buildHtml = function(url, context){
    let self = this;
    return new Promise(function(resolve, reject){
        $.get(url, function (templateData) {
            console.log("device template found");
            var template = Handlebars.compile(templateData);
            //reset page content
            let pageContainer = $("#page-container");
            pageContainer.empty();
            pageContainer.append(template(context));
            self.page = document.getElementById("device-page");
            self.dataTableContainer = document.getElementById("device-container");

            // const switchControls = document.querySelectorAll(".mdc-switch").map(function(switch){
            //     new MDCSwitch(switch);
            // })


            resolve();
        })
    })
}

export {DevicePage};