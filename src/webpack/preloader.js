
var preloader = function(){
    var plr = {};
    let labels = ["Impfstoff wird aufgezogen...", "Aufklärungsbögen werden kopiert...", "Tablets werden verteilt...", "Stühle werden ausgerichtet...", "Vials werden gezählt...", "Wasserspender wird nachgefüllt", "Desi-Spender wird aufgefüllt"]
    var self = document.getElementById("preloader");

    plr.show = function(){
        //set random label
        let label = document.getElementById("preloader-label");
        label.innerHTML = labels[Math.floor(Math.random()*labels.length)];
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