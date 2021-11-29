var transformDateTimeString = function(dateString, format) {
    format = (format === undefined || typeof(format !== "String")) ? "text" : format;
    let weekDays = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag",  "Freitag", "Samstag"];
    var myDate = new Date(dateString);
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

    return {
        dateTime: dateTime,
        dateTimeExtended: dateTimeExtended,
        date: date,
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

module.exports = {
    transformDateTimeString};