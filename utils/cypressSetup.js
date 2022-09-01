const cypress = require('cypress');
const globby = require('globby');
// Config to be set via environment variables
module.exports = function cypressSetup() {
  const runCypressTests = (specs) => {
    return cypress.run({
      config: {
        video: true,
      },
      spec: specs,
    });
  };

  return {
    runCypressTests,
  };
};
