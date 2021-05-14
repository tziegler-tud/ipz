import {MDCDrawer} from "@material/drawer";

const Handlebars = require("handlebars");
import "./handlebarsHelpers";
import {apiHandler} from "./apiHandlers/apiHandler";
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
 * @typedef Tab
 * @property {HTMLElement} element Dom Container of the tab. Class transitions are applied to this element.
 * @property {function} activate activates the tab
 * @property {function} deactivate deactivates the tab. this is usually called by the activate function, and you might not want to call this directly.
 */

/**
 * @abstract
 * @returns {Promise<Tab[]>}
 */
Page.prototype.getTabNavigationInterface = function(){
    /**
     * abstract function
     * concrete page class implements this function
     */
}

export {Page};