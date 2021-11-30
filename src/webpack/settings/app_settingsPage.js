import {MDCDrawer} from "@material/drawer";

const Handlebars = require("handlebars");
import "../handlebarsHelpers";

import {apiArchiveHandler} from "../apiHandlers/apiArchiveHandler";
import {Page} from "../app_page";
var $ = require( "jquery" );
import {MDCRipple} from '@material/ripple';
import {MDCSnackbar} from '@material/snackbar';
import {MDCList} from '@material/list';
import {MDCDataTable} from '@material/data-table';
import {MDCBanner} from '@material/banner';
import {MDCTextField} from '@material/textfield';
import {MDCTextFieldIcon} from '@material/textfield/icon';

var phone = window.matchMedia("only screen and (max-width: 50em)");



var SettingsPage = function(args) {
    let self = Page.apply(this, args);
    self.url = "/webpack/templates/settings/settings.hbs";
    self.entries = undefined;
    self.page = undefined;
    self.dataVersion = 0;
    self.refreshInterval = undefined;
    //get current entries
    let context = {};
    //render html
}


SettingsPage.prototype.hide = function(){
    this.active = false;
    clearInterval(this.refeshInterval);
}

SettingsPage.prototype.show = function(options){
    let self = this;
    if(self.active) {
        self.refresh(self,options);
        return;
    }
    let context = {}
    self.buildHtml(self.url, context);
}

/**
 *
 * @param url {String}
 * @param context {ContextObject}
 * @returns {*}
 */
SettingsPage.prototype.buildHtml = function(url, context){
    let self = this;
    if (window.sysinfo === undefined) {
        window.sysinfo = {
            version: "unset",
            updated: null,
            branch: "unset",
        }
    }
    window.sysinfo.updated = parseInt(window.sysinfo.updated);
    context.sysinfo = window.sysinfo;
    context.sysinfo.uptime = format(window.sysinfo.uptime);
    return $.get(url, function (data) {
        console.log("settings template found");
        var template = Handlebars.compile(data);
        //reset page content
        let pageContainer = $("#page-container");
        pageContainer.empty();
        pageContainer.append(template(context));
        self.page = document.getElementById("settings-page");
        self.dataTableContainer = document.getElementById("settings-container");
        self.snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));

    });
}


SettingsPage.prototype.showSnackbar = function(message, options) {
    let self = this;
    let snackbar = self.snackbar;
    let defaultOptions = {
        timeout: 5000,
        closeOnEscape: false,
        actionButton: {
            display: false,
            text: "",
        }
    }
    options = (options === undefined) ? {}: options;
    options = Object.assign(defaultOptions, options);
    if (!snackbar) {
        //try to find snackbar
        let bar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));
        if(bar) {
            self.snackbar = bar;
        }
        else {
            return false;
        }
    }
    snackbar.labelText = message;
    snackbar.timeoutMs = options.timeout;
    snackbar.closeOnEscape = options.closeOnEscape;
    if(options.actionButton.display) {
        snackbar.root.classList.add("show-action");
        snackbar.actionButtonText = options.actionButton.text;
    }
    else {
        snackbar.root.classList.remove("show-action");
    }
    snackbar.open()
}
export {SettingsPage};


function format(upSeconds){
    function pad(s){
        return (s < 10 ? '0' : '') + s;
    }
    var hours = Math.floor(upSeconds / (60*60));
    var minutes = Math.floor(upSeconds % (60*60) / 60);
    var seconds = Math.floor(upSeconds % 60);

    return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
}