const cypress = require('cypress');

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
