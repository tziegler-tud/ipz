import {preloader} from "./preloader";
import {Navigation} from "./app_navigation"
var $ = require( "jquery" );

$(window).on('load',function() {
    console.log("finished loading, hiding preloader");
    let plr = new preloader();
    setTimeout(plr.hide,0);

});

let nav = new Navigation({
    pageData: {
        title: "Test",
        name: "Test"
    },
});