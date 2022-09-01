const express = require('express');
const serveIndex = require('serve-index');
const path = require('path');
const file_system = require('fs-extra');
const helmet = require('helmet');
const cypressSetup = require('./utils/cypressSetup');
const reportGenerator = require('./utils/mochawesomeSetup');
const alertManager = require('./utils/alertManagerSetup');
const rateLimit = require('express-rate-limit');

// file deepcode ignore UseCsurfForExpress: <Cross-site request forgery is not a possible threat since this is an internal tool
// added this here to supress snyk warnings, however using helmet middleware for basic recommended setup>
const app = express();
app.use(helmet());

// this is the time interval between any 2 runs of any continous monitoring,
// should be set via env variables
const WAITING_TIME = process.env.WAITING_TIME_INTERVAL || 5;
const PORT = process.env.PORT || 8080;
const SPECS_REGEX =
  process.env.SPECS_REGEX || __dirname + '/cypress/e2e/*-spec.cy.js';

// Rate Limit Middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * cypressSetup can be used an interface to setup and run cypress test behaviour
 */
const { runCypressTests } = cypressSetup();

// this will be used to store test results Cypress object for the current run,
// ideally this should be going to a DB
let CURRENT_SUMMARY = { runs: [] };

// this object will be used to seed the notification message to external service
let coreTestSummary = [];

// Setup the default route, this is can later be leveraged by a react app to show a basic UI instead of raw JSON
// @todo: Enhance this endpoint and create a simple react UI to consume this endpoint
app.get('/', (req, res) => {
  // deepcode ignore ContentTypeNoCharset: <NA>
  res.setHeader('content-type', 'application/json');
  const baseUrl = req.protocol + '://' + req.get('Host');
  const result = monitorReportStatus(CURRENT_SUMMARY, baseUrl);
  res.send(JSON.stringify(result, null, 4));
});

//apply rate limitter middleware
app.use('/status', apiLimiter);

app.use('/status', serveIndex(__dirname + '/mochawesome-report'));
app.use('/status', express.static(__dirname + '/mochawesome-report'));

app.use(
  '/healthcheck',
  require('express-healthcheck')({
    healthy: function () {
      return { everything: 'is ok' };
    },
  })
);

app.listen(PORT, () => {
  console.log(`Synthetic tests running on port ${PORT}`);
});

const monitorReportStatus = (results, baseUrl) => {
  const tests = [];
  // if this is not the first run
  //use the results data to do simple formating
  if (results.runs) {
    results.runs.forEach((run) => {
      const videoLink =
        baseUrl + '/videos/' + run.video.split('/').slice(-1)[0];

      run.tests.forEach((test) => {
        const title = test.title.join(' | ');
        const state = test.state;
        tests.push({ title, state, videoLink });
      });
    });
  }

  return {
    lastRun: {
      totalSuites: CURRENT_SUMMARY.totalSuites,
      totalTests: CURRENT_SUMMARY.totalTests,
      totalFailed: CURRENT_SUMMARY.totalFailed,
      totalPassed: CURRENT_SUMMARY.totalPassed,
      totalPending: CURRENT_SUMMARY.totalPending,
      totalSkipped: CURRENT_SUMMARY.totalSkipped,
      metaInfo: {
        startedAt: CURRENT_SUMMARY.startedTestsAt,
        endedAt: CURRENT_SUMMARY.endedTestsAt,
        totalDuration: CURRENT_SUMMARY.totalDuration,
      },
      tests,
    },
    statusPageLink: baseUrl + '/status/mochawesome.html',
  };
};

function timedInterval(mins) {
  return new Promise((resolve) => {
    setTimeout(resolve, 1000 * 60 * mins);
  });
}

async function syntheticMonitorServer() {
  while (true) {
    console.log('Running tests...');
    try {
      // deepcode ignore PromiseNotCaughtNode: <NA>
      await file_system
        .remove(__dirname + '/cypress/results')
        .then(() => runCypressTests(SPECS_REGEX))
        .then((summary) => (CURRENT_SUMMARY = summary))
        .then(() => reportGenerator(__dirname + '/cypress/results/*.json'))
        .then(() => alertManager(coreTestSummary));
    } catch (error) {
      console.log('Check the error', error);
    }
    await timedInterval(WAITING_TIME);
  }
}

syntheticMonitorServer();
