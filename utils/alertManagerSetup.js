const axios = require('axios');

module.exports = function alertManagerSetup(results) {
  console.log(results);
  axios
    .post(
      'https://hooks.slack.com/services/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',
      {
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: 'Synthetic Monitor test results',
              emoji: true,
            },
          },
          {
            type: 'divider',
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*login v1 | should display account id is required*',
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*_PASSED_*',
            },
          },
          {
            type: 'divider',
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*login v1 | should display invalid account id*',
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*_FAILED_*',
            },
          },
          {
            type: 'divider',
          },
        ],
      }
    )
    .catch((error) => console.log(error));
};
