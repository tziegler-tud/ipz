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
    self.drawer = null;

    if (phone.matches || tablet.matches) url = '/webpack/templates/navigation/navigation-mobile.hbs';
    else url = '/webpack/templates/navigation/navigation.hbs';

    self.mainElementUrl = '/webpack/templates/navigation/subpage-main.hbs';


    var applyArgs = function(options){
        let defaults = {
            clock: undefined,
            sidesheet: false,
            activeElement: undefined,
            open: true,
            topbar: true,

        }
        options = (options === undefined) ? {}: options;
        return Object.assign(defaults, options);
    };
    //options
    self.options = applyArgs(options);

    //load drawer template and attach to body
    self.initialize = new Promise((resolve, reject) => {

        $.get(url, function (data) {
            console.log("navigation container template found");
            var template = Handlebars.compile(data);

            $(".app-wrapper").prepend(template(context));

            const drawer = MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));
            const mainContentEl = document.querySelector('.app-content-container');
            self.navigationElements = document.getElementsByClassName("navigation-element");
            const topAppBarElement = document.querySelector('.mdc-top-app-bar');
            self.subpageContainer = document.querySelector('.subpage-container');
            self.subpageHandler = new SubpageHandler(self.subpageContainer);

            if (self.options.topbar) {
                const topAppBar = new MDCTopAppBar(topAppBarElement);
                topAppBar.setScrollTarget(mainContentEl);
                topAppBar.listen('MDCTopAppBar:nav', () => {
                    drawer.open = !drawer.open;
                });
                self.topAppBar = topAppBar;
            }
            else {
                topAppBarElement.classList.add("topbar--disabled");
            }

            document.body.addEventListener('MDCDrawer:closed', () => {
                // mainContentEl.querySelector('input, button').focus();
            });
            // const buttonRipple = new MDCRipple(document.querySelector('.mdc-button'));



            if (!(phone.matches || tablet.matches)) {
                //open drawer initially on desktop screen sizes
                drawer.open = self.options.open;
            }

            self.drawer = drawer;


            self.adjustWrapper(self.topAppBar);
            $(window).on('resize', function () {
                self.adjustWrapper(self.topAppBar);
            });


            //find tracks to build main element
            self.getTracks().done(function(result) {
                context.tracks = result;
                $.get(self.mainElementUrl, function (data) {
                    var template = Handlebars.compile(data);
                    self.subpageHandler.addMain(context)
                        .then(function(){
                            const listEl = document.querySelector('.mdc-drawer .mdc-deprecated-list');
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
                            resolve();
                        })

                });
            });
        });
    });

    return self;
}



Navigation.prototype.setAction = function(id, action, args){
    let self = this;
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
        action(e, args, self);
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
    let navHeight = 0;
    if (this.options.topbar){
        navHeight = topAppBar.foundation.adapter.getTopAppBarHeight();
    }
    $(".app-content-container").css({
        height: (vh - navHeight) + "px",
        "padding-top": navHeight + "px"
    })
}

Navigation.prototype.getTracks = function(){
    return $.get("/api/v1/track");
}

Navigation.prototype.show = function(){
    this.drawer.open = true;
}

Navigation.prototype.hide = function(){
    this.drawer.open = false;
}

Navigation.prototype.toggle = function(){
    this.drawer.open = !this.drawer.open;
}

Navigation.prototype.addSubpage = function(type, context, show, navElementId){
    //proxies to subpageHandler
    this.subpageHandler.addSubpage(type, context, show, navElementId);
}

let SubpageHandler = function(subpageContainer){
    let self = this;
    let counter = 0;
    self.subpageContainer = subpageContainer;


    /**
     *
      * @type {Subpage[]}
     */
    this.subpages = [];

    /**
     * @type {Subpage}
     */
    this.main = null;

    this.current = undefined;

    this.addMain = function(context){
        return new Promise(function(resolve, reject){
            let id = 0;
            let main = new Subpage(0,"main", context);
            main.init
                .then(function(html){
                    appendSubpage(main, html);
                    self.main = main;
                    self.current = main;
                    main.show();
                    resolve();
                })
                .catch(err => reject(err));
        })
    }

    this.addSubpage = function(type, context, show, navElementId){
        //create new id
        counter++;
        let subpage = new Subpage(counter, type, context);
        subpage.init
            .then(function(html){
               appendSubpage(subpage, html);
                if(show) {
                    self.showSubpage(subpage.id)
                }
                //hook event listener to show main
                $(".navigation-subpage-mainlink").on("click", function(){
                    self.showMain();
                })

                //hook event listener to show subpage, if any
                let link = document.getElementById(navElementId);
                if (link !== undefined) {
                    link.addEventListener("click", function(e){
                        e.preventDefault();
                        self.showSubpage(subpage.id);
                    })
                }
            })

    }
    this.showMain = function(){
        this.current.hide();
        //show main page
        this.main.show();
        this.current = this.main;
    }
    this.showSubpage = function(subpageId){
        //find subpage in Array
        let page = this.subpages.find(page => page.id === subpageId);
        //hide current
        this.current.hide();
        //show subpage
        page.show();
        this.current = page;
        return true;
    }

    function appendSubpage(subpage, html){
        //append html to subpageContainer
        self.subpageContainer.append(html);
        self.subpages.push(subpage);
        console.log("added subpage: " + subpage.title);
    }
    return this;
}

/**
 * @typedef {Object} Subpage
 * @property {Number} id subpage id
 */

/**
 *
 * @param id {Number}
 * @param type {String}
 * @param context {Object}
 * @returns {Subpage}
 * @constructor
 */
let Subpage = function(id, type, context){
    let self = this;
    self.id = id;
    self.title = "";
    let subpageUrl;
    switch (type) {
        case "statistics":
            subpageUrl = '/webpack/templates/navigation/subpage-statistics.hbs';
            this.title = "statistics";
            break;
        default:
            //main
            subpageUrl = '/webpack/templates/navigation/subpage-main.hbs'
            this.title = "main";
            break;
    }
    //load template
    this.init = new Promise(function(resolve, reject){
        $.get(subpageUrl, function (data) {
            console.log("subpage template found");
            var template = Handlebars.compile(data);
            let subpageWrapper = document.createElement("div");
            subpageWrapper.id = "navigation-subpage-"+id;
            subpageWrapper.classList.add("navigation-subpage");
            subpageWrapper.classList.add("navigation-subpage-" + self.title);
            subpageWrapper.innerHTML = template(context);
            self.container = subpageWrapper;

            resolve(subpageWrapper);
        })
    })

    this.show = function(){
        this.container.classList.add("navigation-subpage--active");
    }
    this.hide = function(){
        this.container.classList.remove("navigation-subpage--active");
    }
    this.getContainer = function(){
        return this.container;
    }
    return this;
}

export {Navigation}