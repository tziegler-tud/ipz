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



var ListPage = function(args){
    let self = Page.apply(this, args);
    self.url = "/webpack/templates/list.hbs";
    self.entries = undefined;
    self.page = undefined;
    self.dataVersion = 0;
    self.refreshInterval = undefined;
    //get current entries
    let context = {};
    //render html

    /**
     * @typedef {Object} ContextObject
     *
     * @property {boolean} isEmpty true if no entries were found
     * @property {boolean} updateBanner true if first entry differs from previous set
     * @property {CheckinDataSchemeObject[]} entries checkout data array
     */

    /**
     *
     * creates a context object from the api response
     *
     * @param result {CheckinDataSchemeObject[]}
     * @param options {Object}
     * @returns {ContextObject}
     */
    self.buildContext = function(result, options){

        let defaultOptions = {
        }
        options = (options === undefined) ? {}: options;
        options = Object.assign(defaultOptions, options);

        /**
         * @type {ContextObject} context
         */
        let context = {
            isEmpty: true,
            entries: result,
        }

        if(result !== undefined && result.length !== 0) {
            context.isEmpty = false;
            //check if at least on entry was present
        }
        else {
            context.isEmpty = true;
        }
        return context;
    }

}

ListPage.prototype.hide = function(){
    this.active = false;
    clearInterval(this.refeshInterval);
}

ListPage.prototype.show = function(options){
    let self = this;
    if(self.active) {
        self.refresh(self,options);
        return;
    }
    apiHandler.getCheckoutData()
        .done(function(result, textStatus, jqXHR){
            let context = self.buildContext(result, options);
            self.entries = context.entries;
            self.initialize = self.buildHtml(self.url, context);
            self.active = true;
            //enable refresh
            clearInterval(self.refeshInterval);
            self.refeshInterval = setInterval(self.refresh, 1000, self);
            return self.initialize;
        })
}

ListPage.prototype.refresh = function(self, options){

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

ListPage.prototype.update = function(options){
    let self = this;
    return apiHandler.getCheckoutData()
        .done(function(result){
            let context = self.buildContext(result, options);
            self.buildDataTable(context)
            self.entries = context.entries;
        })
}

/**
 *
 * @param url {String}
 * @param context {ContextObject}
 * @returns {*}
 */
ListPage.prototype.buildHtml = function(url, context){
    let self = this;
    return $.get(url, function (data) {
        console.log("template found");
        var template = Handlebars.compile(data);
        //reset page content
        let pageContainer = $("#page-container");
        pageContainer.empty();
        pageContainer.append(template(context));
        self.page = document.getElementById("management-page");
        self.dataTableContainer = document.getElementById("management-container");
        self.snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));
        self.buildDataTable(context);
    });
}

/**
 *
 * @param context {ContextObject}
 */
ListPage.prototype.buildDataTable = function(context){
    let self = this;
    $.get("/webpack/templates/dataTable.hbs", function (data) {
        var template = Handlebars.compile(data);
        self.dataTableContainer.innerHTML=template(context);
        const dataTable = new MDCDataTable(document.querySelector('.mdc-data-table'));
        $(".checkout-table-row").click(function(){

        })

    });

}


ListPage.prototype.showSnackbar = function(message, options) {
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
export {ListPage};