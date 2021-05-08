var transformDateTimeString = function(dateString, format) {
    format = (format === undefined || typeof(format !== "String")) ? "text" : format;
    var myDate = new Date(dateString);
    var month = (myDate.getMonth()+ 1).toString().length < 2 ? "0"+(myDate.getMonth()+ 1).toString() : (myDate.getMonth()+ 1).toString();
    var day = myDate.getDate().toString().length < 2 ? "0"+myDate.getDate().toString() : myDate.getDate().toString();

    var hours = myDate.getHours().toString().length < 2 ? "0"+myDate.getHours().toString() : myDate.getHours().toString();
    var minutes = myDate.getMinutes().toString().length < 2 ? "0"+myDate.getMinutes().toString() : myDate.getMinutes().toString();
    var seconds = myDate.getSeconds().toString().length < 2 ? "0"+myDate.getSeconds().toString() : myDate.getSeconds().toString();

    var date =  day + "." + month + "." + myDate.getFullYear()
    var time =  hours + ":" + minutes;
    var dateTime =  date + " " + time;
    return {
        dateTime: dateTime,
        date: date,
        time: function (format) {
            switch(format) {
                case "hh:mm:ss":
                    return hours + ":" + minutes + ":" + seconds;
                case "hh:mm":
                    return time
            }
        },
    };
}

/**
 *
 * @param args {Object}
 * @returns {Counter}
 * @constructor
 */
let Counter = function(args) {
    let defaultArgs = {
        start: 0,
        min: null,
        max: null,
        step: 1,
    }
    args = (args === undefined) ? {}: args;
    args = Object.assign(defaultArgs, args);

    /**
     * @type {Integer} count
     */
    this.count = args.start;
    this.start = args.start;
    this.min = args.min;
    this.max = args.max;
    this.step = args.step;

    /**
     *
     * @returns {*}
     */
    this.get = function(){
        return this.count;
    }

    /**
     *
     * @returns {boolean|Integer}
     */
    this.increase = function(){
        this.current = this.count;
        this.count = this.count + this.step;
        if(this.max !== null){
            if(this.count > this.max){
                console.warn("Counter: Max exceeded.");
                this.count = this.current;
                return false;
            }
        }
        return this.count;
    }

    /**
     *
     * @returns {boolean|Integer}
     */
    this.decrease = function(){
        this.current = this.count;
        this.count = this.count - this.step;
        if(this.min !== null){
            if(this.count < this.min){
                console.warn("Counter: Min exceeded.");
                this.count = this.current;
                return false;
            }
        }
        return this.count;
    }

    /**
     *
     * @param val
     * @returns {boolean|Integer}
     */
    this.set = function(val) {
        let value = parseInt(val);
        if (this.max !== null && value > this.max) {
            return false;
        }
        else {
            if (this.min !== null && value < this.min) {
                console.warn("Counter: Min exceeded.");
                return false;
            }
            else {
                this.count = value;
                return this.count;
            }
        }
    }

    /**
     *
     * @returns {Integer}
     */
    this.reset = function(){
        this.count = this.start;
        return this.count;
    }
    return this;
}

export {transformDateTimeString, Counter}