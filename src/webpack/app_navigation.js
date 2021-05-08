import {MDCList} from "@material/list";
import {MDCTopAppBar} from "@material/top-app-bar";
import {MDCDrawer} from "@material/drawer";
import {MDCRipple} from "@material/ripple";
const Handlebars = require("handlebars");
import {transformDateTimeString} from "./helpers";
var $ = require( "jquery" );

var phone = window.matchMedia("only screen and (max-width: 600px)");
var tablet = window.matchMedia("only screen and (min-width: 600px) and (max-width: 1280px)");

/**
 *
 * @param context
 * @param options
 * @returns function {Navigation}
 * @constructor
 */
var Navigation = function(context, options){
    let self = this;
    let url;

    if (phone.matches || tablet.matches) url = '/webpack/templates/navigation-mobile.hbs';
    else url = '/webpack/templates/navigation.hbs';

    var applyArgs = function(options){
        let defaults = {
            clock: undefined,
            sidesheet: false,
            activeElement: undefined,

        }
        options = (options === undefined) ? {}: options;
        return Object.assign(defaults, options);
    };
    //options
    self.options = applyArgs(options);



    //load drawer template and attach to body
    self.initialize = new Promise((resolve, reject) => {

        $.get(url, function (data) {
            console.log("template found");
            var template = Handlebars.compile(data);

            //find tracks to build nav
            self.getTracks().done(function(result) {
                context.tracks = result;
                $(".app-wrapper").prepend(template(context));

                const topAppBarElement = document.querySelector('.mdc-top-app-bar');
                const topAppBar = new MDCTopAppBar(topAppBarElement);
                const drawer = MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));
                const listEl = document.querySelector('.mdc-drawer .mdc-deprecated-list');
                const mainContentEl = document.querySelector('.app-content-container');
                self.navigationElements = document.getElementsByClassName("navigation-element");

                if (options.activeElement !== undefined){
                    self.setActiveElement(options.activeElement);
                }

                if (options.clock !== undefined){
                    setInterval(function() {
                        $(options.clock).text(transformDateTimeString(Date.now()).time("hh:mm:ss"));
                    }, 1000);
                }
                listEl.addEventListener('click', (event) => {
                    // mainContentEl.querySelector('input, button').focus();
                });

                document.body.addEventListener('MDCDrawer:closed', () => {
                    // mainContentEl.querySelector('input, button').focus();
                });
                // const buttonRipple = new MDCRipple(document.querySelector('.mdc-button'));

                topAppBar.setScrollTarget(mainContentEl);
                topAppBar.listen('MDCTopAppBar:nav', () => {
                    drawer.open = !drawer.open;
                });

                if (!(phone.matches || tablet.matches)) {
                    //open drawer intially on desktop screen sizes
                    drawer.open = true;

                }

                self.drawer = drawer;
                self.topAppBar = topAppBar;

                self.adjustWrapper(topAppBar);
                $(window).on('resize', function () {
                    self.adjustWrapper(topAppBar);
                });
                resolve();
            });
        });
    });

    return self;
}

Navigation.prototype.setAction = function(id, action, args){
    if(!id || typeof(action) !== "function"){
        console.error("Can't set action: invalid parameters.");
    }
    //find action element
    let el = document.getElementById(id);
    if (el === undefined) {
        console.error("Failed to add action: Element with ID: " + id + "not found");
        return false;
    }
    el.addEventListener("click", function(e){
        action(e, args);
    })
}
/**
 * Sets the title text of the top app bar
 * @param text {String} new title text
 *
 */
Navigation.prototype.setTitle = function(text){
    let title = document.getElementById("nav-title");
    title.innerHTML = text;
}

Navigation.prototype.setActiveElement = function(domId){
    //find in navigation elements
    const el = this.navigationElements.namedItem(domId);
    el.classList.add("mdc-deprecated-list-item--activated");
}

Navigation.prototype.adjustWrapper = function(topAppBar){
    //get viewport height
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    //get height of top navigation and topbar element
    let navHeight = topAppBar.foundation.adapter.getTopAppBarHeight();
    $(".app-content-container").css({
        height: (vh - navHeight) + "px",
        "padding-top": navHeight + "px"
    })
}

Navigation.prototype.getTracks = function(){
    return $.get("/api/v1/track");
}

export {Navigation}