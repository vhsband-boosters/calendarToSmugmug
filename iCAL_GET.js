/*
*  Description: This node.js program will connect to the VHS Band Charms
*  Calendar feed and pull events from the calendar.
*  
*  It then filters events based on the set of keywords listed in the
*  'triggerWords' array, *  and writes them to the file photo_events.txt 
*  in the current directory. Any event that does not contain the trigger 
*  keywords are written to the skipped_events.txt file. Both file write 
*  operations are in append mode, so delete the files before running if you
*  want to start from scratch.
*
*  The Calendar feed returns dates as both a string and Date type, and the 
*  program supports both date forms.
*
*  Date         Name                Description
*  ===========  ==================  ==========================================
*  11-Jun-2017  Nader Askari        Written
*  17-Jun-2017  Nader Askari        Use Promises to handle async functions
*/
var ical = require('node-ical');
var fs = require('fs');
var async = require('async');

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

var triggerWords = ["football", "party", "marching", "contest", "tmea", "region", "concert", "banquet", "march-a-thon!", "spring trip"];
var url = "https://www.charmsoffice.com/charms/calsync.asp?s=VandegriftHSBand";

// All the events that have one of the pertinent keywords in their summary 
// description will be written to this file.
//
var photoWriteStream = fs.createWriteStream("./photo_events.txt", {
    flags: 'a' // append mode
});

//
//
var skippedWriteStream = fs.createWriteStream("./skipped_events.txt", {
    flags: 'a'
});

// Converts the iCal string repersentation of date into a Date object
//
var stringToDate = function (icalString) {
    var strYear = icalString.substr(0, 4);
    var strMonth = parseInt(icalString.substr(4, 2), 10) - 1;
    var strDay = icalString.substr(6, 2);
    var strHour = icalString.substr(9, 2);
    var strMin = icalString.substr(11, 2);
    var strSec = icalString.substr(13, 2);

    var outputDate = new Date(strYear, strMonth, strDay, strHour, strMin, strSec);

    return outputDate;
}

// Normalize string representation of types
//
var toType = function (object) {
    return ({}).toString.call(object).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}

// Combines date fields into a single string
//
var toDateResultString = function (dateObject) {
    return dateObject.getFullYear() + ", " +
        months[dateObject.getMonth()] + ", " +
        dateObject.getDate() + " T: " +
        dateObject.getHours() + ":" +
        dateObject.getMinutes();
}

function outputResultCounts(recordsRead, photoEvents, skippedEvents) {
    console.log("Number of records read: " + recordsRead);
    console.log("Number of photo events: " + photoEvents);
    console.log("Number of skipped events: " + skippedEvents);
}

// This function will read all of the iCal events on the specified url
// and generate two files, one for possible photo events, the other the
// skipped events.
//
function gatherEvents(url) {

    // Return a new promise.
    return new Promise(function (resolve, reject) {

        ical.fromURL(url, {}, function (err, data) {

            if (err) {
                return reject(err)
            }

            var keywordMatched = false;
            var recordsRead = 0;
            var photoEvents = 0;
            var skippedEvents = 0;

            for (var k in data) {

                recordsRead++;

                if (data.hasOwnProperty(k)) {

                    // Grab a hold of each incoming event entry
                    var entry = data[k];

                    // Reset keyword flag for counting skipped events
                    //
                    keywordMatched = false;

                    // Filter entries that don't have one of the keywords we're looking for.
                    //
                    for (var ii = 0; ii < triggerWords.length; ii++) {

                        // Normalize all entries to lower case for lookup
                        //
                        if (entry.summary.toLowerCase().search(triggerWords[ii]) != -1) {
                            // If the event start date/time is a string element, convert it
                            // to date format.
                            //
                            var theDate;

                            if (toType(entry.start) === "string") {
                                theDate = stringToDate(entry.start);
                            }
                            else if (toType(entry.start) === "date") {
                                theDate = entry.start;
                            }
                            else {
                                // We can only handle string and Date types.
                                //
                                continue;
                            }

                            var resultString = toDateResultString(theDate) + " E: " + entry.summary;

                            photoWriteStream.write(resultString + "\n");

                            photoEvents++;
                            keywordMatched = true;

                            break;
                        }
                    }

                    if (!keywordMatched) {
                        // Doesn't contain our keyword, skip it.
                        //
                        skippedWriteStream.write(entry.summary + "\n");
                        skippedEvents++;
                    }
                }
            }
            resolve([recordsRead, photoEvents, skippedEvents]);

        });
    });
}

// Collect the data and then output the summary counts. Files
// are written to disk.
//
gatherEvents(url).then(function (response) {
    outputResultCounts(response[0], response[1], response[2]);
}, function (error) {
    console.error("Failed!", error);
});
