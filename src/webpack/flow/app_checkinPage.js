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

/**
 *
 * @returns {CheckinPage}
 * @constructor
 */
var CheckinPage = function(args){
    if (args === undefined) args = {}
    let self = Page.apply(this, args);
    self.url = "/webpack/templates/flow/checkin_page.hbs";
    self.inputAmount = 1;
    self.primaryInputElement = null;
    self.primaryInputContainer = null;
    self.snackbar = undefined;
    self.track = args.track;
    self.trackPrefix = (args.prefix === undefined ? args.track.name : args.prefix);
    console.log(self.test);

    self.submitPage = function(){
        let numberArray = [];
        //find active inputs
        $(".numberinput-element").each(function(i){
            numberArray.push({number: self.trackPrefix+$(this).val(), details: {type: 0, number: 0}});
        })
        //numberArray length must match inputAmount
        if(self.inputAmount !== numberArray.length) {
            console.error("Failed to read input data: invalid number of input elements found. Assumed: " + self.inputAmount + " , but found: " + numberArray.length);
            return;
        }

        apiFlowHandler.checkin(self.track.id, self.inputAmount, numberArray)
            .done(function(result){
                let numberString = "";
                if (result) {
                    if (result.data) {
                        numberString = "";
                        result.data.forEach(function (el) {
                            numberString = numberString + el.number.toString()
                        });
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
    let context = {
        trackPrefix: self.trackPrefix,
    };

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
        const interactionLists = document.querySelectorAll('.interactions-list');
        let mdcInteractionLists = [];
        interactionLists.forEach(function(el){
            mdcInteractionLists.push(new MDCList(el));
        })
        // const actionlist = new MDCList(document.querySelector('.interactions-list'));
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



export {CheckinPage};