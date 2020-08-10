//1 Parking lot registration module
//2 staticly fix capacities and price rates
//3 parking allotment module
//4 parking accounting module
//5 reports module

'use strict';

const bodyParser = require('body-parser'),
  express = require('express')
var app = express();
app.set('port', process.env.PORT || 6453);
app.set('view engine', 'ejs');
app.use(bodyParser.json({limit: '50mb'}));
var redis = require("redis");
var Promise = require("bluebird");

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

var client = redis.createClient({
    retry_strategy: function (options) {
        if (options.error && options.error.code === 'ECONNREFUSED') {
            // End reconnecting on a specific error and flush all commands with a individual error
            return new Error('The server refused the connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            // End reconnecting after a specific timeout and flush all commands with a individual error
            return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
            // End reconnecting with built in error
            return undefined;
        }
        // reconnect after
        return Math.min(options.attempt * 100, 3000);
    }
});

// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });

client.on("error", function (err) {
    console.log("Error " + err);
});
client.on("connect", function (connect) {
    console.log("Redis connected " );
});

var registrationRoute = require('./routes/registration.js')(client);
var allotmentRoute = require('./routes/allotment.js')(client);
var rateCalculatorRoute = require('./routes/ratecalculator.js')(client);

app.use('/registerclient', registrationRoute);
app.use('/allotmentroute', allotmentRoute);
app.use('/calculatedueroute', rateCalculatorRoute);

app.listen('6453',function(){
  console.log('https app is running on port : ', '6453');
});