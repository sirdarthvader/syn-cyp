const { defineConfig } = require('cypress');

module.exports = defineConfig({
  projectId: 'fdxsmf',
  env: {
    sandbox: {
      baseUrl: 'https://sandbox.copilot.fabric.inc',
      accountId: '2611869846',
    },
  },

  experimentalSessionSupport: true,
  viewportHeight: 800,
  viewportWidth: 1500,
  responseTimeout: 30000,
  defaultCommandTimeout: 5000,
  requestTimeout: 10000,
  watchForFileChanges: false,

  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'cypress/results',
    overwrite: false,
    html: false,
    json: true,
  },

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      // require('cypress-mochawesome-reporter/plugin')(on);
    },
  },
});
