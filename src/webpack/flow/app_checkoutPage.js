import {MDCDrawer} from "@material/drawer";

const Handlebars = require("handlebars");
import "../handlebarsHelpers";
import {apiHandler} from "../apiHandlers/apiHandler";
import {apiFlowHandler} from "../apiHandlers/apiFlowHandler";
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

var CheckoutPage = function(args){
    let self = Page.apply(this, args);
    self.url = "/webpack/templates/flow/checkout_page2.hbs";
    self.entries = undefined;
    self.bannerEntry = undefined;
    self.page = undefined;
    self.dataVersion = 0;
    self.track = args.track;
    self.banner = $.get("/webpack/templates/flow/banner.hbs");
    self.dataTable = $.get("/webpack/templates/flow/dataTable.hbs");
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
     * @param options {{forceUpdateBanner: boolean}}
     * @returns {ContextObject}
     */
    self.buildContext = function(result, options){

        let defaultOptions = {
            forceUpdateBanner: false,
        }
        options = (options === undefined) ? {}: options;
        options = Object.assign(defaultOptions, options);

        /**
         * @type {ContextObject} context
         */
        let context = {
            isEmpty: true,
            updateBanner: false,
            entries: result,
            track: self.track,
        }

        if(result !== undefined && result.length !== 0) {
            context.isEmpty = false;
            //check if at least on entry was present
            if (self.entries !== undefined && self.entries.length !== 0) {
                //check if first entry changed
                if (self.bannerEntry.id !== result[0].id) {
                    context.updateBanner = true;
                }
            }
            else {
                context.updateBanner = true;
            }
        }
        else {
            context.isEmpty = true;
            context.updateBanner = true;
        }
        if(options.forceUpdateBanner) context.updateBanner = true;
        return context;
    }

}

CheckoutPage.prototype.hide = function(){
    this.active = false;
    clearInterval(this.refeshInterval);
}

CheckoutPage.prototype.show = function(options){
    let self = this;
    return new Promise(function(resolve, reject){
        if(self.active) {
            self.refresh(self,options);
            resolve();
        }
        apiFlowHandler.getByTrack(self.track.id)
            .done(function(result, textStatus, jqXHR){
                let context = self.buildContext(result, options);
                self.entries = context.entries;
                self.initialize = self.buildHtml(self.url, context);
                self.active = true;
                //enable refresh
                clearInterval(self.refeshInterval);
                self.refeshInterval = setInterval(self.refresh, 1000, self);
            })
        resolve();
    })

}

CheckoutPage.prototype.refresh = function(self, options){

    console.log("refreshing page");
    //check if this page is active
    if (!self.active){
        return null;
    }
    apiFlowHandler.getCheckoutDataVersion(self.track.id)
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

CheckoutPage.prototype.update = function(options){
    let self = this;
    return apiFlowHandler.getByTrack(self.track.id)
        .done(function(result){
            let context = self.buildContext(result, options);
            if(context.updateBanner) {
                //refreshing banner
                console.log("refreshing banner");
                let bannerArg = undefined;
                if(!context.isEmpty) bannerArg = context.entries[0];
                self.showBanner(bannerArg);
            }
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
CheckoutPage.prototype.buildHtml = function(url, context){
    let self = this;
    return $.get(url, function (data) {
        console.log("template found");
        var template = Handlebars.compile(data);
        //reset page content
        let pageContainer = $("#page-container");
        pageContainer.empty();
        pageContainer.append(template(context));
        self.page = document.getElementById("checkout-page");
        self.dataTableContainer = document.getElementById("checkout-container");
        self.bannerWrapper = document.getElementById("banner-wrapper");
        self.snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));
        // const buttonRipple = new MDCRipple(document.querySelector('.mdc-button'));
        // const list = new MDCList(document.querySelector('.mdc-list'));
        // const listItemRipples = list.listElements.map((listItemEl) => new MDCRipple(listItemEl));
        //create banner
        self.showBanner(context.entries[0])
        self.buildDataTable(context);
    });
}

/**
 *
 * @param context {ContextObject}
 */
CheckoutPage.prototype.buildDataTable = function(context){
    let self = this;

    self.dataTable.then(function(data){
        var template = Handlebars.compile(data);
        self.dataTableContainer.innerHTML=template(context);
        const dataTable = new MDCDataTable(document.querySelector('.mdc-data-table'));
        $(".checkout-table-row").click(function(){
            //read id from dataset
            let id = this.dataset.entryid;
            if(!id) {
                console.error("Could not find corresponding row id.")
                return false;
            }
            //find corresponding entry
            //disabled until put into use TODO: create second banner on bottom of page to modifiy and directly call choosen entries
            // apiFlowHandler.getCheckoutEntry(id)
            //     .done(function(result){
            //         self.showBanner(result)
            //     });
        })

    });

}

/**
 *
 * @param entry {CheckinDataSchemeObject || undefined}
 */
CheckoutPage.prototype.showBanner = function(entry){
    let self = this;
    if(entry === undefined) {
        self.bannerWrapper.innerHTML = "";
        return
    }
    self.bannerEntry = entry;
    self.banner.then(function(data){
        //we need current entry as context
        let context = {entry: entry, track: self.track};
        var template = Handlebars.compile(data);
        self.bannerWrapper.innerHTML = template(context);
        const banner = new MDCBanner(document.querySelector('.mdc-banner'));
        let options = {
            forceUpdateBanner: true,
        }

        banner.foundation.handlePrimaryActionClick = function(){
            //handle current entry
            apiFlowHandler.checkout(entry)
                .done(function(result){
                    self.update(options);
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
                    self.showSnackbar(message, options)
                });

        }
        banner.foundation.handleSecondaryActionClick = function(e){
            //find current id
            let id = entry.id;
            apiFlowHandler.redraw(id, {
                onSuccess: function(result){
                    self.update(options);
                },
            });

        }
        banner.open();

        $(window).on('resize', function () {
            banner.layout();
        });
    });
}

CheckoutPage.prototype.showSnackbar = function(message, options) {
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


export {CheckoutPage};

var Banner = function(){
    let self = this;
    self.template = $.get("/webpack/templates/flow/checkout/banner.hbs");


    return this;
}