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

    self.submitPage = function(type){

        apiHandler.checkin(type)
            .done(function(result){
                let typeString = "";
                if (result) {
                    if (result.name) {
                        typeString = result.name;
                    }
                }
                let message = typeString + "hinzugefügt"
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

CheckinPage.prototype.showSnackbar = function(message, options) {
    let self = this;
    let snackbar = self.snackbar;
    let defaultOptions = {
        timeout: 3000,
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
        self.pageContainer = $("#page-container");
        self.pageContainer.empty();
        self.pageContainer.append(template(context));
        self.primaryInputContainer = document.getElementById("numberinput-container--primary");
        //choosing-item event handlers
        $(".choosing-item").on("click", function(){
            let type = parseInt(this.dataset.type)
            let name = "";
            switch(type) {
                case 0:
                    name = "nicht angegeben";
                    break;
                case 1:
                    name ="BionTech";
                    break;
                case 2:
                    name ="Moderna";
                    break;
                case 3:
                    name ="Astrazenecca";
                    break;
            }
            apiHandler.checkin(type);
            let message = "Eintrag hinzugefügt: " + name;
            self.showSnackbar(message);


        })

        self.snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));
        if(options.snackbar.show) {
            self.showSnackbar(options.snackbar.message);
        }

    });
}

export {CheckinPage};