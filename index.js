/**
 * Additions for writing files borrowed/inspired by lesshint-lint-xml-reporter
 * https://github.com/llaumgui/lesshint-lint-xml-reporter
 * which also borrowed from gulp-jshint-xml-file-reporter
 * https://github.com/lourenzo/gulp-jshint-xml-file-reporter
 */
'use strict';

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

/**
 * Creates the output dir
 * @param {String} filePath
 * @param cb
 */
var createDirectory = (filePath, cb) => {
    var dirname = path.dirname(filePath);

    mkdirp(dirname, function (err) {
        if (!err) {
            cb();
        } else {
            console.error('Error creating directory: ', err);
        }
    });
};

var reset = () => {
    exports.out = [];
};
reset();

/**
 * Formats result into junit testcase format
 * @param {Object} result
 */
var formatTestcase = (result) => {
  const message = result.message.replace(/"/g, '&quot;');
  return `
    <testcase time="0" name="org.lesshint.${result.linter}">
      <failure message="${message}">
        <![CDATA[line ${result.line}, col ${result.column}, ${message} (${result.linter})]]>
      </failure>
    </testcase>`;
};

exports.name = 'lesshint-lint-junit-reporter';

/**
 * Processes results into a junit report.
 * @param {Array} results
 */
exports.report = (results) => {
  const resultsByfiles = {};
  let output = '';

  // Grab each result and key by file name
  results.forEach((result) => {
    if (typeof resultsByfiles[result.fullPath] === 'undefined') {
      resultsByfiles[result.fullPath] = [];
    }

    resultsByfiles[result.fullPath].push(result);
  });

  // Group testcase by file name
  Object.keys(resultsByfiles).forEach((file) => {
    const count = resultsByfiles[file].length;
    let suite = resultsByfiles[file].map(formatTestcase).join('');
    output += `
  <testsuite package="org.lesshint" time="0" tests="${count}" errors="${count}" name="${file}">${suite}
  </testsuite>`;
  });

  if (output !== '') {
    let xml = `<?xml version="1.0" encoding="utf-8"?>
<testsuites>
  ${output}
</testsuites>`;
    exports.out.push(xml);
  }
};

/**
 * Writes output to file if filePath is defined. Otherwise it outputs to console.log
 * @param {String} filePath
 */
exports.writeOut = (filePath) => {
    if (typeof filePath === 'string') {
      return () => {
          createDirectory(filePath, () => {
              var outStream = fs.createWriteStream(filePath);
              outStream.write(exports.out[0]);
              reset();
          });
      };
    }
    else {
      return () => {
        console.log(exports.out[0]);
        reset();
      };
    }
};