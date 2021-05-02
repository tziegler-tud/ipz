import {MDCDrawer} from "@material/drawer";

const Handlebars = require("handlebars");
import "./handlebarsHelpers";
import {apiHandler} from "./apiHandler";
import {Page} from "./app_page";
var $ = require( "jquery" );
import {MDCRipple} from '@material/ripple';
import {MDCSnackbar} from '@material/snackbar';
import {MDCList} from '@material/list';
import {MDCDataTable} from '@material/data-table';
import {MDCBanner} from '@material/banner';
import {MDCTextField} from '@material/textfield';
import {MDCTextFieldIcon} from '@material/textfield/icon';

var phone = window.matchMedia("only screen and (max-width: 50em)");



var ManagementPage = function(args){
    let self = Page.apply(this, args);
    self.url = "/webpack/templates/management.hbs";
    self.entries = undefined;
    self.page = undefined;
    self.dataVersion = 0;
    self.refreshInterval = undefined;
    //get current entries
    //render html

}

ManagementPage.prototype.hide = function(){
    this.active = false;
    clearInterval(this.refeshInterval);
}

ManagementPage.prototype.show = function(options){
    let self = this;
    if(self.active) {
        self.refresh(self,options);
        return;
    }
    apiHandler.getCheckinCounts()
        .done(function(result, textStatus, jqXHR){
            let context = {
                counters: {
                    b: result.counters.b,
                    m: result.counters.m,
                    a: result.counters.a,
                }
            }
            self.initialize = self.buildHtml(self.url, context);
            self.active = true;
            //enable refresh
            clearInterval(self.refeshInterval);
            self.refeshInterval = setInterval(self.refresh, 1000, self);
            return self.initialize;
        })
}

ManagementPage.prototype.refresh = function(self, options){

    console.log("refreshing page");
    //check if this page is active
    if (!self.active){
        return null;
    }
    apiHandler.getCheckoutDataVersion()
        .done(function(result){
            if(!result){
                console.log("failed to obtain version information. Rebuilding...");
                return self.update(options);
            }
            if(result.version === self.dataVersion){
                //version matches, nothing to update
                console.log("nothing to update");
            }
            else {
                //if version does not match, get fresh server content
                console.log("update found, rebuilding for version: " + result.version);
                self.dataVersion = result.version;
                return self.update(options);

            }
        })
        .fail(function(result){
            console.error(result);
            console.log("failed to obtain version information. Rebuilding...");
            return self.update(options);
        });
}

ManagementPage.prototype.update = function(options){
    let self = this;

    apiHandler.getCheckinCounts()
        .done(function(result, textStatus, jqXHR) {
            let context = {
                counters: {
                    b: result.counters.b,
                    m: result.counters.m,
                    a: result.counters.a,
                }
            }
            self.initialize = self.buildHtml(self.url, context);
            self.active = true;
            //enable refresh
            clearInterval(self.refeshInterval);
            self.refeshInterval = setInterval(self.refresh, 1000, self);
            return self.initialize;
        })

    // return apiHandler.getCheckinCounts()
    //     .done(function(result){
    //         //
    //         // //update counters
    //         self.counters.b.innerHTML = result.counters.b;
    //         self.counters.m.innerHTML = result.counters.m;
    //         self.counters.a.innerHTML = result.counters.a;
    //     })
}

/**
 *
 * @param url {String}
 * @param context {Object}
 * @returns {*}
 */
ManagementPage.prototype.buildHtml = function(url, context){
    let self = this;
    return $.get(url, function (data) {
        console.log("template found");
        var template = Handlebars.compile(data);
        //reset page content
        let pageContainer = $("#page-container");
        pageContainer.empty();
        pageContainer.append(template(context));
        self.page = document.getElementById("management-page");
        self.snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));
    });
}



ManagementPage.prototype.showSnackbar = function(message, options) {
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
export {ManagementPage};