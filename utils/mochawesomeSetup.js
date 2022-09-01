const { merge } = require('mochawesome-merge');
const generator = require('mochawesome-report-generator');
const file_system = require('fs-extra');

module.exports = function reportGeneratorSetup(files_directory) {
  return file_system
    .remove('mochawesome-report')
    .then(() => merge({ files: [files_directory] }))
    .then((r) => generator.create(r));
};
