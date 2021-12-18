const db = require('../schemes/mongo');

const Archive = db.archive;
const settingsService = require('./settingsService');
const trackService = require('./trackService');
const trackDataService = require('./trackDataService');
const checkinDataService = require('./dataService');
const archiveService = require('./archiveService');

const dateTransformer = require('../helpers/dateTransformer');

module.exports = {
    get,
    getByDate,
    getById,
    getOverview,
    getDayStats,
    getWeekStats,
    getMonthStats,
    getArchiveStats,
    getDayStatsFromArchive,
};


var DayStatsManager = function(){
    let self = this;
    this.generatedTimestamp = Date.now();
    this.stats = null;
    this.isValid = function(){
        return (this.generatedTimestamp > (Date.now()-300000)); //not older than 5 minutes
    }
    this.getStats = function(){
        if(this.stats === null  || this.stats === undefined || !this.isValid()) {
            return this.updateStats()
        }
        else {
            return new Promise(function(resolve, reject){
                resolve(self.stats)
            });
        }
    }

    this.updateStats = function(){
        return new Promise(function(resolve, reject){
            generateDayStats()
                .then(function(jsonData){
                    self.stats = jsonData.stats;
                    self.generatedTimestamp = Date.now();
                    console.log("Statistic data updated.")
                    resolve(jsonData.stats)
                })
        })
    }
    return this;
};
var ArchiveDataManager = function(daysFromNow){
    let self = this;
    this.daysFromNow = daysFromNow;
    this.generatedTimestamp = Date.now();
    this.data = null;
    this.isValid = function(){
        return (new Date(this.generatedTimestamp).getDate() === new Date().getDate()); //update if day changed
    }
    this.getData = function(){
        if(this.data === null  || this.data === undefined || !this.isValid()) {
            return this.updateData()
        }
        else {
            return new Promise(function(resolve, reject){
                self.updateCurrentDay()
                    .then(function(today){
                        resolve(self.data)
                    })

            });
        }
    }

    this.updateCurrentDay = function(){
        let self = this;
        return new Promise(function(resolve, reject){
            updateTodayArchiveStats(self.data)
                .then(function(data){
                    self.generatedTimestamp = Date.now();
                    resolve(data);
                })
        })
    }

    this.updateData = function(){
        return new Promise(function(resolve, reject){
            getArchiveStatsCalendary(self.daysFromNow)
                .then(function(data){
                    self.data = data;
                    self.generatedTimestamp = Date.now();
                    console.log("Archive data updated.")
                    resolve(data);
                })
        })
    }
    return this;
};

let dayStatsManager = new DayStatsManager();
let weekDataManager = new ArchiveDataManager(7);
let monthDataManager = new ArchiveDataManager(31);

/**
 * Gets all archive documents
 */
async function get() {
    return getById();
}

async function getById(id) {
    let archive, trackData, checkinData, date;
    if(id === undefined) {
        //get current

        /*
        code for mongo >3.2
         */

        const trackDataPromise = trackDataService.getAll({sort: {"timestamp": 1}});
        const checkinDataPromise = checkinDataService.getAll({sort: {"timestamp":1}});

        /*
        code for mongo 2.6
       */
        // TODO: Update mongo on pi to >3.2 and re-enable query sorting.

        // const trackDataPromise = trackDataService.getAll();
        // const checkinDataPromise = checkinDataService.getAll();


        //sort track and checkin data by timestamp
        // trackData.sort(function(first, second){
        //     return first.timestamp - second.timestamp;
        // })
        //
        // checkinData.sort(function(first, second){
        //     return first.timestamp - second.timestamp;
        // })


        const data = await Promise.all([trackDataPromise, checkinDataPromise]);
        trackData = data[0];
        checkinData = data[1];
        date = dateTransformer.transformDateTimeString(Date.now()).date;

    }
    else {
        archive = await Archive.findById(id);
        trackData = archive.data.trackDatas;
        checkinData = archive.data.checkinDatas;
        date = archive.date;
    }

    let archiveData = {
        date: date,
        trackData: trackData,
        checkinData: checkinData,
    }

    let output = parseDataToOutputFormat(archiveData);
    return output;
}

/**
 * gets statistics for the day specified by the date parameter
 * @param dateString {String} the date to query. must be of form "DD.MM.YYYY" or "current"
 * @returns {Promise<*>}
 */
async function getByDate(dateString) {
    let archive, trackData, checkinData;
    if(dateString === undefined || dateString === "current") {
        return getById();
    }
    else {
        //get by date
        archive = await Archive.findOne({"date": dateString});
        trackData = archive.data.trackDatas.sort(function(a,b){
            return a.timestamp - b.timestamp;
        });
        checkinData = archive.data.checkindatas.sort(function(a,b){
            if(a.timestamp === undefined){
                return a.currentStatus.timestamp - b.currentStatus.timestamp;
            }
            else {
                return a.timestamp - b.timestamp;
            }

        });
    }

    let archiveData = {
        date: dateString,
        trackData: trackData,
        checkinData: checkinData,
    }

    let output = parseDataToOutputFormat(archiveData);
    return output;
}


function parseDataToOutputFormat(archiveData){

    //transform trackData to Array of objects: [{x: Date, y:count}]
    let trackStatisticData = archiveData.trackData.map(function(trackEntry, index){
        // let trackDate = new Date(trackEntry.timestamp);
        let trackDate = parseToMilliseconds(trackEntry.timestamp);
        let trackValue = trackEntry.type;
        return {x: trackDate, y:index+1 }
    })

    //transform checkinData to Array of objects: [{x: Date, y:count}]
    let checkinStatisticData;
    //check if checkinDatas are still in old format
    if (archiveData.checkinData.length > 0){
        if(archiveData.checkinData[0].currentStatus !== undefined){
            //old format
            checkinStatisticData = archiveData.checkinData.map(function(entry, index){
                // let checkinDate = new Date(entry.currentStatus.timestamp);
                let checkinDate = parseToMilliseconds(entry.currentStatus.timestamp);
                let checkinValue = entry.type;
                return {x: checkinDate, y:index+1 }
            })

        }
        else {
            checkinStatisticData = archiveData.checkinData.map(function(entry, index){
                // let checkinDate = new Date(entry.timestamp);
                let checkinDate = parseToMilliseconds(entry.timestamp);
                let checkinValue = entry.type;
                return {x: checkinDate, y:index+1 }
            })
        }
    }
    // return {timestamps: timestamps, values: values}
    return {
        date: archiveData.date,
        trackData: trackStatisticData,
        checkinData: checkinStatisticData
    }

    // let timestamps = trackDatas.map(function(trackEntry){
    //     return new Date(trackEntry.timestamp);
    // })
    // let values = trackDatas.map(function(trackEntry, index) {
    //     return index;
    // })

}

async function getOverview() {
    //get today
    let todayPromise = trackDataService.getCounts();
    let archiveDataPromise = Archive.find({}).sort("-timestamp");
    //wait for promises to resolve
    const data = await Promise.all([todayPromise, archiveDataPromise]);
    let today = data[0];
    let archiveData = data[1];

    //return dates and totals
    let entries = [];
    entries.push({
        date: dateTransformer.transformDateTimeString(new Date()).date,
        total: today.total,
        current: true,
    })
    archiveData.forEach(function(archiveElement){
        entries.push({
            date: archiveElement.date,
            total: archiveElement.data.trackDatas.length,
            current: false,
            archiveId: archiveElement.id,
        })
    })
    return entries;
}

async function getDayStats(){
    //always update total count and current average
    const trackData = await trackDataService.getAll();
    let currentAverage = getCurrentAverage(trackData);
    let totals = await trackDataService.getCounts();
    let jsonStats = undefined;

    let jsonData = {
        raw: {
            tracks: trackData,
            // checkin: checkinData,
        },
        stats: {
            total: {
                all: totals.total,
                b: totals.counters.b,
                m: totals.counters.m,
                a: totals.counters.a,
                j: totals.counters.j,
            },
        }

    }
    //update todays stats if not present or older than 5 Minutes
    jsonStats = await dayStatsManager.getStats();
    jsonData.stats.average = jsonStats.average;
    return jsonData;
}

async function generateDayStats() {
    //get today
    let trackData, checkinData;
    const trackDataPromise = trackDataService.getAll({sort: "timestamp"});

    // const checkinDataPromise = checkinDataService.getAll();

    const data = await Promise.all([trackDataPromise]);
    trackData = data[0];

    //get data
    let totals = await trackDataService.getCounts();
    //calculate averages
    let totalAverage = getTotalAverage(trackData);

    let perHour = averagesByHours(trackData);

    let currentAverage = getCurrentAverage(trackData);


    // average by tracks
    let tracks = await trackService.get();
    let byTracks = [];

    await Promise.all(tracks.map(async (track) => {
        let data = await trackDataService.getByTrack(track)
        let perHour = averagesByHours(data);
        byTracks.push({track: track, data: data, averages: perHour});
    }));

    byTracks.sort(function(a,b){
        return (a.track.name < b.track.name) ? -1 : 1;
    })




    let jsonData = {
        date: new Date(),
        raw: {
            tracks: trackData,
            // checkin: checkinData,
        },
        stats: {
            total: {
                all: totals.total,
                b: totals.counters.b,
                m: totals.counters.m,
                a: totals.counters.a,
                j: totals.counters.j,
            },
            average: {
                total: totalAverage,
                perHour: perHour,
                current: currentAverage,
                byTracks: byTracks
            }
        }

    }
    return jsonData;


}

async function getDayStatsFromArchive(dateString) {
    //get today
    let archive, trackData, checkinData;
    if(dateString === undefined || dateString === "current") {
        return generateDayStats();
    }
    else {
        //get by date
        archive = await Archive.findOne({"date": dateString});
        trackData = archive.data.trackDatas.sort(function(a,b){
            return a.timestamp - b.timestamp;
        });
        checkinData = archive.data.checkindatas.sort(function(a,b){
            if(a.timestamp === undefined){
                return a.currentStatus.timestamp - b.currentStatus.timestamp;
            }
            else {
                return a.timestamp - b.timestamp;
            }

        });
    }

    let archiveData = {
        date: dateString,
        trackData: trackData,
        checkinData: checkinData,
        tracks: archive.data.tracks,
    }


    //get data
    let totals = count(trackData);
    //calculate averages
    let totalAverage = getTotalAverage(trackData);

    let perHour = averagesByHours(trackData);

    let currentAverage = getCurrentAverage(trackData);


    // average by tracks
    let tracks = archiveData.tracks;
    let byTracks = [];

    if(tracks === undefined || tracks.length === 0) {
        //re-generate tracks from data
        tracks = [];
        trackData.forEach(function(trackDataEntry){
            let i = tracks.findIndex(function(trackElement){
                return trackDataEntry.track.id.toString() === trackElement.id.toString();
            });

            if (i === -1) {
                //add track
                tracks.push(trackDataEntry.track);
            }
        })

    }

    tracks.forEach(function(track){
        // let data = trackData.filter(function(trackDataElement){
        //     return (trackDataElement.track.id.equals(track.id))
        // });
        trackDataService.getByTrack(track)
            .then(function(data){
                let perHour = averagesByHours(data);
                byTracks.push({track: track, data: data, averages: perHour});
            })
    })

    byTracks.sort(function(a,b){
        return (a.track.name < b.track.name) ? -1 : 1;
    })




    let jsonData = {
        date: archiveData.date,
        raw: {
            tracks: trackData,
            checkin: checkinData,
        },
        stats: {
            total: {
                all: totals.total,
                b: totals.counters.b,
                m: totals.counters.m,
                a: totals.counters.a,
                j: totals.counters.j,
            },
            average: {
                total: totalAverage,
                perHour: perHour,
                current: currentAverage,
                byTracks: byTracks
            }
        }

    }
    return jsonData;
}


function parseToMilliseconds(dateRepresentation) {
    //date can be either milliseconds, ISOString or Date object
    switch(typeof(dateRepresentation)){
        case "number":
            //date is in milliseconds
            return dateRepresentation;
        case "string":
            //date is in ISOFormat
            return Date.parse(dateRepresentation);
        case "object":
            return dateRepresentation.getTime();
    }
}

function getTotalAverage(trackData){
    if(trackData === undefined || trackData.length === 0) return 0;
    //get distance between data points
    let first = trackData[0];
    let last = trackData[trackData.length-1];
    let timeDiff = last.timestamp - first.timestamp; // in ms
    let timeDiffHours = timeDiff / 3600000; //in Hours
    let valDiff = trackData.length;
    return Math.floor(valDiff / timeDiffHours); //entries per hour
}

function getCurrentAverage(trackData) {
    let timediff = 900000; //15min back
    let currentDate = new Date();
    let minDate = new Date(currentDate.getTime() - timediff);
    let currentData = findMinMax(trackData, minDate, currentDate);
    return averageMs(currentData, timediff)
}

function averageOneHour(trackData){
    //get distance between data points
    let valDiff = trackData.length;
    return Math.floor(valDiff); //entries per hour
}

function averageMs(trackData, timeDiff) {
    let timeDiffHours = timeDiff / 3600000; //in Hours
    let valDiff = trackData.length;
    return Math.floor(valDiff / timeDiffHours); //entries per hour
}

function averagesByHours(trackData) {
    //averages per hour
    //group data by hours. Always start at 00 min

    let timeOffsetMs = 1800000; // 15min = 900000

    if(trackData === undefined || trackData.length === 0) return [0]
    //lets look at the first entry.
    let firstEntry = trackData[0];
    let firstTimestamp = firstEntry.timestamp;
    if(!(firstTimestamp instanceof Date)) firstTimestamp = new Date(firstTimestamp);
    //transform to date Object
    let firstDate = new Date(firstTimestamp.getTime() - timeOffsetMs);
    let firstHour = firstDate.getHours();
    let firstMinute = 0;
    if (firstDate.getMinutes() < 30) {
        firstHour = firstHour -1;
        firstMinute = 30;
    }
    firstDate.setHours(firstHour);
    firstDate.setMinutes(firstMinute);
    firstDate.setSeconds(0);
    firstDate.setMilliseconds(0);

    //lets look at the last entry.
    let lastEntry = trackData[trackData.length-1];
    let lastTimestamp = lastEntry.timestamp;
    if(!(lastTimestamp instanceof Date)) lastTimestamp = new Date(lastTimestamp);

    //transform to date Object
    let lastDateTime = Math.min(new Date().getTime(), lastTimestamp.getTime() + timeOffsetMs);
    let lastDate = new Date(lastDateTime);
    // let lastHour = lastDate.getHours() + 1;
    // let lastMinute = 0;
    //
    // lastDate.setHours(lastHour);
    // lastDate.setMinutes(lastMinute);
    lastDate.setSeconds(0);
    lastDate.setMilliseconds(0);

    //now, find all entry in the current hour
    let averagePerHourArray = [];
    var currentDate = new Date(firstDate.getTime());


    //increase hour by 1 and check if less or equal last date
    while (currentDate.getTime() <= lastDate.getTime()){
        // let currentEndDate = new Date(currentDate.getTime() + 3600000); //add 1 hour = 3600000ms
        let currentEndDate = new Date(currentDate.getTime() + timeOffsetMs); //add 15 min = 900000ms
        if(currentEndDate > new Date()) currentEndDate = new Date();
        // let currentHourData = findCurrentHour(trackData, currentDate);
        let currentHourData = findMinMax(trackData, currentDate, currentEndDate);
        //calculate average
        let currentHourAverage = averageMs(currentHourData, timeOffsetMs);
        averagePerHourArray.push({x: currentEndDate.getTime(), y: currentHourAverage});
        currentDate.setTime(currentDate.getTime()+timeOffsetMs);
    }

    return averagePerHourArray;

    function findCurrentHour(trackData, firstDate){
        //get max timestamp in ms
        let maxDate = new Date(firstDate.getTime());
        maxDate.setHours(firstDate.getHours() + 1);
        let maxDateMs = maxDate.getTime();
        let minDateMs = firstDate.getTime();

        //now, get all entries up to that timestamp
        let hourArray = trackData.filter(function(entry){
            return entry.timestamp < maxDateMs && entry.timestamp >= minDateMs;
        })
        return hourArray;
    }
}

function findMinMax(trackData, minDate, maxDate){
    //get max timestamp in ms
    let maxDateMs = maxDate.getTime();
    let minDateMs = minDate.getTime();

    //now, get all entries up to that timestamp
    let hourArray = trackData.filter(function(entry){
        return entry.timestamp < maxDateMs && entry.timestamp >= minDateMs;
    })
    return hourArray;
}

async function getWeekStats(){
    return weekDataManager.getData();
}

async function getMonthStats(){
    return monthDataManager.getData();
}



async function updateTodayArchiveStats(data){
    let today = await trackDataService.getCounts();
    let labels = data.labels;

    data.datasets.b.first[labels.length-1] = today.counters.b.first;
    data.datasets.m.first[labels.length-1] = today.counters.m.first;
    data.datasets.a.first[labels.length-1] = today.counters.a.first;
    data.datasets.j.first[labels.length-1] = today.counters.j.first;
    data.datasets.b.second[labels.length-1] = today.counters.b.second;
    data.datasets.m.second[labels.length-1] = today.counters.m.second;
    data.datasets.a.second[labels.length-1] = today.counters.a.second;
    data.datasets.j.second[labels.length-1] = today.counters.j.second;
    data.datasets.b.booster[labels.length-1] = today.counters.b.booster;
    data.datasets.m.booster[labels.length-1] = today.counters.m.booster;

    return data;

}
async function getArchiveStats(daysFromToday, daysAhead, startDateString){
    let today, archiveData, currentDate;
    if(daysAhead === undefined) daysAhead = 0;
    if (startDateString === undefined || startDateString === "current") {
        //get today
        let todayPromise = trackDataService.getCounts();
        let archiveDataPromise = Archive.find({}).sort("-timestamp");
        //wait for promises to resolve
        const data = await Promise.all([todayPromise, archiveDataPromise]);
        today = data[0];
        archiveData = data[1];
        currentDate = dateTransformer.transformDateTimeString(new Date()).date;
    }
    else {
        //find start Date in archive
        let startDateArchive = await Archive.findOne({"date": startDateString});
        today = count(startDateArchive.data.trackDatas);
        archiveData = await Archive.find({timestamp: { $lt : new Date(startDateArchive.timestamp)}}).sort("-timestamp");
        currentDate = startDateArchive.date;
    }

    //return dates and totals
    let entries = [];
    let labels = [];
    entries.push({
        date: currentDate,
        counts: today,
        current: true,
    })
    labels.push(currentDate)
    let weekData = archiveData.slice(0,daysFromToday);
    weekData.forEach(function(archiveElement){
        //calc counts
        let counts = count(archiveElement.data.trackDatas);
        entries.push({
            date: archiveElement.date,
            counts: counts,
            current: false,
        })
        labels.push(archiveElement.date)
    })

    //reverse to preserve chronological order
    entries.reverse();
    labels.reverse();

    //aggregate by type and first/second
    let datasets = aggregateByType(entries, labels);

    return {
        labels: labels,
        datasets: datasets,
    };

}

async function getArchiveStatsCalendary(daysFromToday, daysAhead, startDateString){
    let today, archiveData, currentDate, d;
    if(daysAhead === undefined) daysAhead = 0;
    if (startDateString === undefined || startDateString === "current") {
        //get today
        today = await trackDataService.getCounts();
        currentDate = dateTransformer.transformDateTimeString(new Date()).date;
        d = new Date();
    }
    else {
        //find start Date in archive
        let startDateArchive = await Archive.findOne({"date": startDateString});
        today = count(startDateArchive.data.trackDatas);
        currentDate = startDateArchive.date;
        d = new Date(startDateArchive.timestamp);
    }

    let entries = [];
    let archiveEntries = new Array(daysFromToday);
    let dataPromises = new Array(daysFromToday);
    let meta = new Array(daysFromToday);

    for(var i=0; i<daysFromToday; i++){
        let localDate = new Date(d);
        localDate.setDate(d.getDate()-(i+1));
        let index = i;
        let dateString = dateTransformer.transformDateTimeString(localDate).date;
        meta[index] = ({index: index, localDate: localDate, dateString: dateString});
        dataPromises[index] = (Archive.findOne({date: dateString}));
    }
    //return dates and totals
    let labels = [];
    entries.push({
        date: currentDate,
        counts: today,
        current: true,
    })
    labels.push(currentDate);

    return new Promise(function(resolve, reject) {
        Promise.all(dataPromises).then(function (data) {
            data.forEach(function (archiveData, index) {
                if (archiveData) {
                    archiveEntries[index] = archiveData;
                } else {
                    //no data found in archive for that date. create empty resonse
                    archiveEntries[index] = {
                        timestamp: meta[index].localDate,
                        date: meta[index].dateString,
                        data: {
                            trackDatas: [],
                            checkindatas: [],
                            tracks: []
                        }
                    }
                }
            })

            archiveEntries.forEach(function (archiveElement) {
                //calc counts
                let counts = count(archiveElement.data.trackDatas);
                entries.push({
                    date: archiveElement.date,
                    counts: counts,
                    current: false,
                })
                labels.push(archiveElement.date)
            })

            //reverse to preserve chronological order
            entries.reverse();
            labels.reverse();

            //aggregate by type and first/second
            let datasets = aggregateByType(entries, labels);

            let returnEl = {
                labels: labels,
                datasets: datasets,
            };
            resolve(returnEl);
        })
            .catch(function(err){
                reject(err);
            })
    })
}

function count(data){
    //count them
    let counters = {
        b: {first: 0, second: 0, booster: 0},
        m: {first: 0, second: 0, booster: 0},
        a: {first: 0, second: 0},
        j: {first: 0, second: 0},
    }
    counters.b.first = data.reduce(function(n, element) {
        return n + (element.type === 1 && (element.second === false || element.second === undefined) && (element.booster === false || element.booster === undefined));
    }, 0);
    counters.b.second = data.reduce(function(n, element) {
        return n + (element.type === 1 && element.second === true && (element.booster === false || element.booster === undefined));
    }, 0);
    counters.b.booster = data.reduce(function(n, element) {
        return n + (element.type === 1 && element.booster === true);
    }, 0);
    counters.m.first = data.reduce(function(n, element) {
        return n + (element.type === 2  && (element.second === false || element.second === undefined) && (element.booster === false || element.booster === undefined));
    }, 0);
    counters.m.second = data.reduce(function(n, element) {
        return n + (element.type === 2  && element.second === true && (element.booster === false || element.booster === undefined));
    }, 0);
    counters.m.booster = data.reduce(function(n, element) {
        return n + (element.type === 2  && element.booster === true);
    }, 0);
    counters.a.first = data.reduce(function(n, element) {
        return n + (element.type === 3  && (element.second === false || element.second === undefined));
    }, 0);
    counters.a.second = data.reduce(function(n, element) {
        return n + (element.type === 3  && element.second === true);
    }, 0);
    counters.j.first = data.reduce(function(n, element) {
        return n + (element.type === 4   && element.second === false || element.second === undefined);
    }, 0);
    counters.j.second = data.reduce(function(n, element) {
        return n + (element.type === 4   && element.second === true);
    }, 0);

    let total = counters.b.first + counters.b.second + counters.b.booster + counters.m.first + counters.m.second + counters.m.booster + counters.a.first + counters.a.second + counters.j.first + counters.j.second;

    return {counters: counters, total: total};
}

function aggregateByType(entries, labels){
    let data = {
        b: {
            first: [],
            second: [],
            booster: [],
        },
        m: {
            first: [],
            second: [],
            booster: []
        },
        a: {
            first: [],
            second: []
        },
        j: {
            first: [],
            second: [],
        }
    }
    entries.forEach(function(entry){
        data.b.first.push(entry.counts.counters.b.first)
        data.b.second.push(entry.counts.counters.b.second)
        data.b.booster.push(entry.counts.counters.b.booster)
        data.m.first.push(entry.counts.counters.m.first)
        data.m.second.push(entry.counts.counters.m.second)
        data.m.booster.push(entry.counts.counters.m.booster)
        data.a.first.push(entry.counts.counters.a.first)
        data.a.second.push(entry.counts.counters.a.second)
        data.j.first.push(entry.counts.counters.j.first)
        data.j.second.push(entry.counts.counters.j.second)
    })

    return data;
}