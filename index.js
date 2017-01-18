var instantly = require('instantly');
var fs = require('fs');
var express = require('express');
var eventsource = require('express-eventsource');
var app = express();
var router = express.Router();
var sse = eventsource({
    connections: 2
});
var broadcast = sse.sender('message');

app.set('view engine', 'ejs');
app.set('views', __dirname);

// Enable CORS
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

router.use(sse.middleware());

app.use('/sse', router);

app.get('/', function (req, res) {
    res.send('###### GET received')
});

app.listen(3200, function () {
    console.log('Running on http://localhost:3200');
});

var InstantReporter = function (baseReporterDecorator, config, logger, helper, formatError) {
    var httpConfig = config.httpReporter || {};

    baseReporterDecorator(this);

    this.adapters = [function (msg) {
        process.stdout.write.bind(process.stdout)(msg + '\r\n');
    }];

    this.onRunStart = function (browsers) {
        broadcast({
            type: 'run-start',
            browsers: JSON.stringify(browsers)
        });
    }

    this.onBrowserStart = function (browser, info) {
        broadcast({
            type: 'browser-start',
            browser: JSON.stringify(browser),
            info: JSON.stringify(info)
        });
    }

    this.specSuccess = function (browser, result) {
        broadcast({
            type: 'spec-success',
            browser: JSON.stringify(browser),
            result: JSON.stringify(result)
        });
    }

    this.specFailure = function (browser, result) {
        broadcast({
            type: 'spec-fail',
            browser: JSON.stringify(browser),
            result: JSON.stringify(result)
        });
    }

    this.specSkipped = function (browser, result) {
        broadcast({
            type: 'spec-skipped',
            browser: JSON.stringify(browser),
            result: JSON.stringify(result)
        });
    }

    this.onSpecComplete = function (browser, result) {
        broadcast({
            type: 'spec-complete',
            browser: JSON.stringify(browser),
            result: JSON.stringify(result)
        });
    }

    this.onBrowserComplete = function (browser) {
        broadcast({
            type: 'spec-complete',
            browser: JSON.stringify(browser)
        });
    }

    this.onBrowserError = function (browser, error) {
        broadcast({
            type: 'spec-complete',
            browser: JSON.stringify(browser),
            error: JSON.stringify(error)
        });
    }

    this.onBrowserLog = function (browser, log, type) {
        broadcast({
            type: 'spec-complete',
            browser: JSON.stringify(browser),
            log: JSON.stringify(log),
            type: JSON.stringify(type)
        });
    }

    this.onRunComplete = function (browsers, results) {
        broadcast({
            type: 'run-complete',
            browsers: JSON.stringify(browsers),
            results: JSON.stringify(results)
        });
    }
};

InstantReporter.$inject = ['baseReporterDecorator', 'config', 'logger', 'helper', 'formatError'];

module.exports = {
    'reporter:instant': ['type', InstantReporter]
};
