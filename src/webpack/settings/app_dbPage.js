import {MDCDrawer} from "@material/drawer";

const Handlebars = require("handlebars");
import "../handlebarsHelpers";

import {apiHandler} from "../apiHandlers/apiHandler";

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



var DbPage = function(type, args) {
    let self = Page.apply(this, args);
    (type === undefined || typeof(type) !== "string") ? self.type = undefined : self.type = type;
    self.url = "/webpack/templates/settings/db.hbs";
    self.entries = undefined;
    self.page = undefined;
    self.dataVersion = 0;
    self.refreshInterval = undefined;
    self.snackbar = undefined;
    //get current entries
    let context = {};
    //render html
}


DbPage.prototype.hide = function(){
    this.active = false;
    clearInterval(this.refeshInterval);
}

DbPage.prototype.show = function(options){
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
DbPage.prototype.buildHtml = function(url, context){
    let self = this;

    //get db contents for selected type
    let dataPromise;
    let paths = {};
    switch(self.type) {
        case undefined:
            console.error("Failed to create db page: Type is undefined. This is most likely due to wrong page instantiation arguments.");
            dataPromise = new Promise(function(resolve, reject){
                reject("type is undefined");
            })
            break;
        case "tasks":
            dataPromise = request("/api/v1/task");
            paths = {
                get: {url: "/api/v1/task/:id", method: "GET"},
                add: {url: "/api/v1/task/add", method: "POST"},
                update: {url: "/api/v1/task/update/:id", method: "POST"},
                remove: {url: "/api/v1/task/remove/:id", method: "DELETE"},
            }
            break;
        case "tracks":
            dataPromise = request("/api/v1/track");
            paths = {
                get: {url: "/api/v1/track/:id", method: "GET"},
                add: {url: "/api/v1/track/add", method: "POST"},
                update: {url: "/api/v1/track/update/:id", method: "POST"},
                remove: {url: "/api/v1/track/remove/:id", method: "DELETE"},
            }
            break;

    }

    dataPromise.then(function(ajaxData){
        return $.get(url, function (data) {
            context.dbItems = ajaxData;
            context.paths = paths;
            console.log("settings template found");
            var template = Handlebars.compile(data);
            //reset page content
            let pageContainer = $("#page-container");
            pageContainer.empty();
            pageContainer.append(template(context));
            self.page = document.getElementById("db-page");
            self.dataTableContainer = document.getElementById("db-container");
            self.snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));

            //hook button actions
            $(".dbItem-delete-button").click(function(){
                request(replaceId(paths.remove.url, this.dataset.id), paths.remove.method)
                    .done(function(result){
                        location.reload();
                    })
                    .fail(function(jqxhr, textstatus, error){
                        let message = "Error " + jqxhr.status +": " + jqxhr.responseText;
                        let options = {
                            timeout: -1,
                            closeOnEscape: true,
                            actionButton: {
                                display: true,
                                text: "Nagut",
                            }
                        }
                        self.showSnackbar(message, options);
                    });
            })
        });
    })
}


DbPage.prototype.showSnackbar = function(message, options) {
    let self = this;
    let snackbar = self.snackbar;
    let defaultOptions = {
        timeout: 4000,
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
            snackbar = bar;
        }
        else {
            return false;
        }
    }
    snackbar.close();
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


function request(url, method, data){
    if (method === undefined) method = "GET";
    return $.ajax({
        url: url,
        // make put for safety reasons :-)
        type: method,
        contentType: "application/json; charset=UTF-8",
        dataType: 'json',
        data: JSON.stringify(data),
    });
}

function replaceId(url, id) {
    //replaces :id in an string with the given id
    const regex = /:id/i;
    return url.replace(regex, id);
}
export {DbPage};