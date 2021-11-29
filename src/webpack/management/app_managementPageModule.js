import {MDCDrawer} from "@material/drawer";

const Handlebars = require("handlebars");
import "../handlebarsHelpers";
import {apiHandler} from "../apiHandlers/apiHandler";
import {Page} from "../app_page";
var $ = require( "jquery" );
import {MDCRipple} from '@material/ripple';
import {MDCSnackbar} from '@material/snackbar';
import {MDCList} from '@material/list';
import {MDCDataTable} from '@material/data-table';
import {MDCBanner} from '@material/banner';
import {MDCTextField} from '@material/textfield';
import {MDCTextFieldIcon} from '@material/textfield/icon';
import {Dashboard} from "../dashboard/dashboard";

var phone = window.matchMedia("only screen and (max-width: 50em)");



var ManagementPageModule = function(modulePage, type, buildFunc, buildArgs, args){
    let self = this;
    self.modulePage = modulePage;
    self.type = type;
    self.buildFunc = buildFunc;
    self.buildArgs = buildArgs;
    self.args = args;
}

ManagementPageModule.prototype.buildModule = function(buildArgs){
    let self = this;
    if (buildArgs === undefined) buildArgs = self.buildArgs;
    return this.buildFunc(buildArgs, self.modulePage);
}

ManagementPageModule.prototype.refresh = function(buildArgs){
    //rebuild the module
    return this.buildModule(buildArgs);
}

ManagementPageModule.prototype.show = function(){
    //display this module



}

export {ManagementPageModule};