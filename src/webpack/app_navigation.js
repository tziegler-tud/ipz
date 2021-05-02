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
            nav1: {
                onclick: function(e){
                    return e;
                }
            },
            nav2: {
                onclick: function(e){
                    return e;
                }
            },
            nav3: {
                onclick: function(e){
                    return e;
                }
            }
        }
        options = (options === undefined) ? {}: options;
        return Object.assign(defaults, options);
    };
    //options
    self.options = applyArgs(options);



    //load drawer template and attach to body
    self.initialize = $.get(url, function (data) {
        console.log("template found");
        var template = Handlebars.compile(data);
        // $(".app-drawer-container").prepend(template(context));
        $(".app-wrapper").prepend(template(context));

        const topAppBarElement = document.querySelector('.mdc-top-app-bar');
        const topAppBar = new MDCTopAppBar(topAppBarElement);
        const drawer = MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));
        const listEl = document.querySelector('.mdc-drawer .mdc-deprecated-list');
        const mainContentEl = document.querySelector('.app-content-container');
        const navEntry1 = document.getElementById("app-link-page1");
        const navEntry2 = document.getElementById("app-link-page2");
        const navEntry3 = document.getElementById("app-link-page3");

        //hook nav events
        // navEntry1.addEventListener("click", function(e){
        //     options.nav1.onclick(e);
        // });
        navEntry2.addEventListener("click", function(e){
            options.nav2.onclick(e);
            if (phone.matches || tablet.matches) drawer.open = false;
        });
        navEntry3.addEventListener("click", function(e){
            options.nav3.onclick(e);
            if (phone.matches || tablet.matches) drawer.open = false;
        });


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

export {Navigation}