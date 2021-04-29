import {MDCDrawer} from "@material/drawer";

const Handlebars = require("handlebars");
import "./handlebarsHelpers";
import {apiHandler} from "./apiHandler";
var $ = require( "jquery" );
import {MDCRipple} from '@material/ripple';
import {MDCSnackbar} from '@material/snackbar';
import {MDCList} from '@material/list';
import {MDCDataTable} from '@material/data-table';
import {MDCBanner} from '@material/banner';
import {MDCTextField} from '@material/textfield';
import {MDCTextFieldIcon} from '@material/textfield/icon';

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
    self.primaryInputContainer = null;
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

        apiHandler.checkin(self.inputAmount, numberArray)
            .done(function(result){
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
    return self;
}

CheckinPage.prototype.focus = function(options){
    let self = this;
    let defaultOptions = {
        click: false,
    }
    options = (options === undefined) ? {}: options;
    options = Object.assign(defaultOptions, options);
    self.primaryInputElement.focus();
}

CheckinPage.prototype.showSnackbar = function(message, options) {
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
        self.inputUniqueId = 1;
        self.pageContainer = $("#page-container");
        self.pageContainer.empty();
        self.pageContainer.append(template(context));
        self.primaryInputContainer = document.getElementById("numberinput-container--primary");
        const input = new MDCTextField(document.querySelector('.mdc-text-field'));
        const actionlist = new MDCList(document.querySelector('.interactions-list'));
        self.primaryInputElement = input;
        input.focus();
        self.lastInputContainer = self.primaryInputContainer;
        const buttonRipple = new MDCRipple(document.querySelector('.mdc-button'));
        const addBtn = document.getElementById("add-button");
        const submitBtn = document.getElementById("submit-button");
        self.snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));
        self.pageContainer.on('keyup', (e) => {
            if (e.isDefaultPrevented()) {
                return; // Do nothing if the event was already processed
            }
            if(e.key === "Enter") {
                self.submitPage();
                // Cancel the default action to avoid it being handled twice
                e.preventDefault();
            }
        });
        if(options.snackbar.show) {
            self.showSnackbar(options.snackbar.message);
        }
        submitBtn.addEventListener("click", function(){
            self.submitPage();
        })
        addBtn.addEventListener("click", function(){
            if(self.inputAmount === 1) self.primaryInputContainer.classList.remove("hide-label");
            self.inputAmount++;
            self.inputUniqueId++;
            console.log("Input added. Total amount is now: " + self.inputAmount);
            let inputContainer = document.createElement("div");
            inputContainer.classList.add("numberinput-container", "additional");
            inputContainer.innerHTML = '<label id="mdc-text-field--' + self.inputUniqueId +'" class="mdc-text-field mdc-text-field--outlined">' +
                '                           <span class="mdc-notched-outline">\n' +
                '                               <span class="mdc-notched-outline__leading"></span>\n' +
                '                               <span class="mdc-notched-outline__notch">\n' +
                '                                   <span class="mdc-floating-label" id="numberinput-label--'+self.inputUniqueId + '">Wartenummer</span>\n' +
                '                               </span>\n' +
                '                               <span class="mdc-notched-outline__trailing"></span>\n' +
                '                           </span>' +
                '                           <input id="numberinput-element--' + self.inputUniqueId + '" autocomplete="off" class="numberinput-element mdc-text-field__input" type="number" maxlength="4" aria-labelledby="numberinput-label--'+self.inputUniqueId + '">' +
                '                           <span class="numberinput-counter-label mdc-text-field__affix mdc-text-field__affix--prefix">'+self.inputAmount+'</span>' +
                '                       </label>'
            let removeBtn = document.createElement("button");
            removeBtn.classList.add("clear-btn", "mdc-button", "mdc-button--outlined");
            removeBtn.innerHTML = '<span class="mdc-button__ripple"></span><i class="material-icons mdc-button__icon" aria-hidden="true">clear</i>'
            removeBtn.addEventListener("click", function(){
                if (self.lastInputContainer === inputContainer) {
                    self.lastInputContainer = $(inputContainer).prev(".numberinput-container")[0];
                }
                else {
                    $(inputContainer).nextAll(".numberinput-container").each(function(){
                       let label = $(this).find(".numberinput-counter-label")[0];
                       label.innerHTML = label.innerHTML - 1;
                    });
                }
                inputContainer.remove();
                self.inputAmount--;
                if(self.inputAmount === 1) self.primaryInputContainer.classList.add("hide-label");
                console.log("Input added. Total amount is now: " + self.inputAmount);
            });
            // inputContainer.append(label, input, removeBtn);
            // inputContainer.prepend(label);
            inputContainer.append(removeBtn);
            $(self.lastInputContainer).after(inputContainer);
            const input = new MDCTextField(document.querySelector('#mdc-text-field--' + self.inputUniqueId));
            input.focus();
            self.lastInputContainer = inputContainer;
        })
    });
}

var CheckoutPage = function(args){
    let self = Page.apply(this, args);
    self.url = "/webpack/templates/checkout_page2.hbs";
    self.entries = undefined;
    self.bannerEntry = undefined;
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
        })
}

CheckoutPage.prototype.refresh = function(self, options){

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

CheckoutPage.prototype.update = function(options){
    let self = this;
    return apiHandler.getCheckoutData()
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
 * @param entry {CheckinDataSchemeObject || undefined}
 */
CheckoutPage.prototype.showBanner = function(entry){
    let self = this;
    if(entry === undefined) {
        self.bannerWrapper.innerHTML = "";
        return
    }
    self.bannerEntry = entry;
    $.get("/webpack/templates/banner.hbs", function (data) {
        //we need current entry as context
        let context = entry;
        var template = Handlebars.compile(data);
        self.bannerWrapper.innerHTML = template(context);
        const banner = new MDCBanner(document.querySelector('.mdc-banner'));
        let options = {
            forceUpdateBanner: true,
        }

        banner.foundation.handlePrimaryActionClick = function(){
            //handle current entry
            apiHandler.checkout(entry)
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
            apiHandler.redraw(id, {
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

export {CheckinPage, CheckoutPage};