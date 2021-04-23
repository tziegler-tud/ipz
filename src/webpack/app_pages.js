const Handlebars = require("handlebars");
import "./handlebarsHelpers";
import {apiHandler} from "./apiHandler";
var $ = require( "jquery" );
import {MDCRipple} from '@material/ripple';
import {MDCSnackbar} from '@material/snackbar';
import {MDCList} from '@material/list';
import {MDCDataTable} from '@material/data-table';
import {MDCBanner} from '@material/banner';

var phone = window.matchMedia("only screen and (max-width: 50em)");

/**
 *
 * @constructor
 * @abstract
 */

var Page = function(args){
    if (this.constructor === Page) {
        throw new Error("page.js: Can't instantiate abstract class!");
    }
    let self = this;
    self.url = "";
    self.test = "test";
    self.active = false;

    self.activate = function(){
        self.active = true;
    }
    self.deactivate = function(){
        self.active = false;
    }
    let abstractHandler = function(resolve, reject) {
        console.warn("page.js: abstract promise handler cannot be called directly.");
        reject();
    }
    // self.initialize = new Promise(abstractHandler);
    return self;
}

Page.prototype.buildHtml = function(url, context){

}

/**
 *
 * @returns {CheckinPage}
 * @constructor
 */
var CheckinPage = function(args){
    let self = Page.apply(this, args);
    self.url = "/webpack/templates/checkin_page.hbs";
    self.inputAmount = 1;
    self.primaryInputElement = null;
    self.snackbar = undefined;
    console.log(self.test);

    self.submitPage = function(){
        let numberArray = [];
        //find active inputs
        $(".numberinput-element").each(function(i){
            numberArray.push($(this).val());
        })
        //numberArray length must match inputAmount
        if(self.inputAmount !== numberArray.length) {
            console.error("Failed to read input data: invalid number of input elements found. Assumed: " + self.inputAmount + " , but found: " + numberArray.length);
            return;
        }
        /**
         *
         * @type {Checkin-ApiHandlerCallback}
         */
        let callback = {
            onSuccess: function (result) {
                let numberString = "";
                if (result) {
                    if (result.data) {
                        numberString = result.data.toString();
                    }
                }
                let message = "Wartenummer " + numberString + " hinzugefügt"
                //reset page
                self.show({
                    snackbar: {
                        show: true,
                        message: message,
                    }
                })
            },
            onFail: function (error) {
                self.showSnackbar(error)
            }
        }

        apiHandler.checkin(self.inputAmount, numberArray, callback);
    }
    return self;
}

CheckinPage.prototype.showSnackbar = function(message) {
    let self = this;
    let snackbar = self.snackbar;
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
    snackbar.open()
}
CheckinPage.prototype.show = function(options){
    let self = this;
    let context = {};

    //render html
    return this.buildHtml(self.url, context, options);
}

CheckinPage.prototype.buildHtml = function(url, context, options){
    let self = this;
    let defaultOptions = {
        snackbar: {
            show: false,
            message: "",
        }
    }
    options = (options === undefined) ? {}: options;
    options = Object.assign(defaultOptions, options);
    return $.get(url, function (data) {
        console.log("template found");
        var template = Handlebars.compile(data);
        //reset page content
        self.inputAmount = 1;
        let pageContainer = $("#page-container");
        pageContainer.empty();
        pageContainer.append(template(context));
        self.primaryInputElement = document.getElementById("numberinput-container--primary");
        self.lastInputElement = self.primaryInputElement;
        const buttonRipple = new MDCRipple(document.querySelector('.mdc-button'));
        const addBtn = document.getElementById("add-button");
        const submitBtn = document.getElementById("submit-button");
        self.snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));
        if(options.snackbar.show) {
            self.showSnackbar(options.snackbar.message);
        }
        submitBtn.addEventListener("click", function(){
            self.submitPage();
        })
        addBtn.addEventListener("click", function(){
            if(self.inputAmount === 1) self.primaryInputElement.classList.remove("hide-label");
            self.inputAmount++;
            console.log("Input added. Total amount is now: " + self.inputAmount);
            let inputContainer = document.createElement("div");
            inputContainer.classList.add("numberinput-container", "additional");
            let input = document.createElement("input");
            input.id = "numberinput-element--" + self.inputAmount;
            input.classList.add("numberinput-element");
            input.type = "text";
            input.autocomplete="off";
            input.maxLength = 4;
            let label = document.createElement("label");
            label.for = "numberinput-element--" + self.inputAmount;
            label.innerHTML = self.inputAmount;
            let removeBtn = document.createElement("button");
            removeBtn.classList.add("clear-btn", "mdc-button");
            removeBtn.innerHTML = '<span class="mdc-button__ripple"></span><i class="material-icons mdc-button__icon" aria-hidden="true">clear</i><span class="mdc-button__label"></span>'
            removeBtn.addEventListener("click", function(){
                if (self.lastInputElement === inputContainer) {
                    self.lastInputElement = $(inputContainer).prev(".numberinput-container")[0];
                }
                else {
                    $(inputContainer).nextAll(".numberinput-container").each(function(){
                       label = $(this).children("label")[0];
                       label.innerHTML = label.innerHTML - 1;
                    });
                }
                inputContainer.remove();
                self.inputAmount--;
                console.log("Input added. Total amount is now: " + self.inputAmount);
            });
            inputContainer.append(label, input, removeBtn);
            $(self.lastInputElement).after(inputContainer);
            self.lastInputElement = inputContainer;
        })
    });
}

var CheckoutPage = function(args){
    let self = Page.apply(this, args);
    self.url = "/webpack/templates/checkout_page2.hbs";
    self.entries = undefined;
    self.page = undefined;
    self.dataVersion = 0;
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
     * @returns {ContextObject}
     */
   self.buildContext = function(result){

       /**
         * @type {ContextObject} context
         */
        let context = {
            isEmpty: true,
            updateBanner: false,
            entries: result,
        }

        if(result !== undefined && result.length !== 0) {
            context.isEmpty = false;
            //check if at least on entry was present
            if (self.entries !== undefined && self.entries.length !== 0) {
                //check if first entry changed
                if (self.entries[0].id !== result[0].id) {
                    context.updateBanner = true;
                }
            }
            else {
                context.updateBanner = true;
            }
        }
        else {
            context.isEmpty = true;
        }
        return context;
    }

}

CheckoutPage.prototype.hide = function(){
    this.active = false;
    clearInterval(this.refeshInterval);
}

CheckoutPage.prototype.show = function(){
    let self = this;
    if(self.active) return;
    apiHandler.getCheckoutData()
        .done(function(result, textStatus, jqXHR){
            let context = self.buildContext(result);
            self.entries = context.entries;
            self.initialize = self.buildHtml(self.url, context);
            self.active = true;
            //enable refresh
            clearInterval(self.refeshInterval);
            self.refeshInterval = setInterval(self.refresh, 1000, self);
        })
}

CheckoutPage.prototype.refresh = function(self){
    console.log("refreshing page");
    //check if this page is active
    if (!self.active){
        return
    }
    else {

    }
    apiHandler.getCheckoutDataVersion()
        .done(function(result){
            if(result.version === self.dataVersion){
                //version matches, nothing to update
                console.log("nothing to update");
            }
            else {
                //if version does not match, get fresh server content
                if(self.active){
                    console.log("update found, rebuilding for version: " + result.version);
                    self.dataVersion = result.version;
                    apiHandler.getCheckoutData()
                        .done(function(result){
                            let context = self.buildContext(result);
                            if(context.updateBanner) {
                                //refreshing banner
                                console.log("refreshing banner");
                                self.showBanner(context.entries[0])
                            }
                            self.buildDataTable(context)
                            self.entries = context.entries;
                        })
                }
            }
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
    $.get("/webpack/templates/dataTable.hbs", function (data) {
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
            apiHandler.getCheckoutEntry(id)
                .done(function(result){
                    self.showBanner(result)
            });
        })

    });

}

/**
 *
 * @param entry {CheckinDataSchemeObject}
 */
CheckoutPage.prototype.showBanner = function(entry){
    let self = this;
    if(entry === undefined) {
        self.bannerWrapper.innerHTML = "";
        return
    }
    $.get("/webpack/templates/banner.hbs", function (data) {
        //we need current entry as context
        let context = entry;
        var template = Handlebars.compile(data);
        self.bannerWrapper.innerHTML = template(context);
        const banner = new MDCBanner(document.querySelector('.mdc-banner'));
        banner.foundation.handlePrimaryActionClick = function(){
            //handle current entry
            apiHandler.checkout(entry, {
                onSuccess: function(result){
                    console.log(result);
                    self.show();
                },
            });

        }
        banner.foundation.handleSecondaryActionClick = function(e){
            //find current id
            let id = entry.id;
            apiHandler.redraw(id, {
                onSuccess: function(result){
                    console.log(result);
                    self.show();
                },
            });

        }
        banner.open();

        $(window).on('resize', function () {
            banner.layout();
        });
    });
}

export {CheckinPage, CheckoutPage};