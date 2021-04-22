const Handlebars = require("handlebars");
import "./handlebarsHelpers";
import {apiHandler} from "./apiHandler";
var $ = require( "jquery" );
import {MDCRipple} from '@material/ripple';
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
        let callback = {
            onSuccess: function(){
                //reset page
                self.show()
            }
        }
        apiHandler.checkin(self.inputAmount, numberArray, callback);
    }
    return self;
}

CheckinPage.prototype.show = function(){
    let self = this;
    let context = {};

    //render html
    return this.buildHtml(self.url, context);
}

CheckinPage.prototype.buildHtml = function(url, context){
    let self = this;
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
    self.entries = null;
    self.page = undefined;
    self.dataVersion = 0;
    //get current entries
    let context = {};
    //render html

}

CheckoutPage.prototype.hide = function(){
    this.active = false;
    clearInterval(this.refeshInterval);
}

CheckoutPage.prototype.show = function(){
    let self = this;
    apiHandler.getCheckoutData()
        .done(function(result){
            let context = {
                entries: result,
            }
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
                            let context = {
                                entries: result,
                            }
                            //check if first entry changed
                            if(self.entries[0].id !== context.entries[0].id){
                                //refreshing banner
                                console.log("refreshing banner");
                                self.showBanner(context.entries[0])
                            }
                            self.buildDataTable(context.entries);
                            self.entries = context.entries;
                        })

                }
            }
        })
}
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
        let firstEntry = context.entries[0];
        self.showBanner(firstEntry);
        self.buildDataTable(context.entries)
    });
}

CheckoutPage.prototype.buildDataTable = function(entries){
    let self = this;
    $.get("/webpack/templates/dataTable.hbs", function (data) {
        var template = Handlebars.compile(data);
        let context = {
            entries: entries,
        }
        self.dataTableContainer.innerHTML=template(context);
        const dataTable = new MDCDataTable(document.querySelector('.mdc-data-table'));

    });

}
CheckoutPage.prototype.showBanner = function(entry){
    let self = this;
    if(entry === undefined) {
        self.bannerWrapper.innerHTML = "";
        return
    }
    console.log("i am here");
    $.get("/webpack/templates/banner.hbs", function (data) {
        //we need current entry as context
        let context = entry;
        console.log(entry);
        console.log("i am there");
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
        banner.open();

        $(window).on('resize', function () {
            banner.layout();
        });
    });
}

export {CheckinPage, CheckoutPage};