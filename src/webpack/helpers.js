var transformDateTimeString = function(dateString, format, parseDelimiter) {
    format = (format === undefined || typeof(format !== "String")) ? "text" : format;
    parseDelimiter = (parseDelimiter === undefined) ? "." : parseDelimiter;
    let weekDays = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag",  "Freitag", "Samstag"];
    var myDate = new Date(dateString);

    //validate
    if (!validateDate(myDate)){
        //try parsing
        myDate = parseDate(dateString, parseDelimiter);
        if(!validateDate(myDate)) {
            console.error("failed to parse date string: invalid data")
            return {};
        }
    }
    var month = (myDate.getMonth()+ 1).toString().length < 2 ? "0"+(myDate.getMonth()+ 1).toString() : (myDate.getMonth()+ 1).toString();
    var day = myDate.getDate().toString().length < 2 ? "0"+myDate.getDate().toString() : myDate.getDate().toString();

    var hours = myDate.getHours().toString().length < 2 ? "0"+myDate.getHours().toString() : myDate.getHours().toString();
    var minutes = myDate.getMinutes().toString().length < 2 ? "0"+myDate.getMinutes().toString() : myDate.getMinutes().toString();
    var seconds = myDate.getSeconds().toString().length < 2 ? "0"+myDate.getSeconds().toString() : myDate.getSeconds().toString();

    var date =  day + "." + month + "." + myDate.getFullYear()
    var time =  hours + ":" + minutes;
    var dateTime =  date + " " + time;
    let dow = weekDays[myDate.getDay()];
    var dateTimeExtended = dow + ", " + dateTime;
    var dateExtended = dow + ", " + date;

    return {
        raw: myDate,
        dateTime: dateTime,
        dateTimeExtended: dateTimeExtended,
        date: date,
        dateExtended: dateExtended,
        time: function (timeFormat) {
            switch(timeFormat) {
                case "hh:mm:ss":
                    return hours + ":" + minutes + ":" + seconds;
                case "hh:mm":
                    return time
            }
        },
    };
}

function parseDate(dateString, parseDelimiter) {
    parseDelimiter = (parseDelimiter === undefined) ? "." : parseDelimiter;
    var dateParts = dateString.split(parseDelimiter);
    // month is 0-based, that's why we need dataParts[1] - 1
    return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
}

function validateDate(myDate) {
    //validate
    if (Object.prototype.toString.call(myDate) === "[object Date]") {
        // it is a date
        if (isNaN(myDate.getTime())) {  // d.valueOf() could also work
            // date is not valid
            return false;
        } else {
            // date is valid
            return true;
        }
    } else {
        // not a date
        return false;

    }
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