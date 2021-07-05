
var preloader = function(){
    var plr = {};
    var self = document.getElementById("preloader");


    plr.show = function(){
        self.classList.add("preloader-active");
        self.classList.remove("preloader-hidden");
    }
    plr.hide = function(){
        self.classList.remove("preloader-active");
        self.classList.add("preloader-hidden");
    };
    plr.show();
    return plr;
};

export {preloader};