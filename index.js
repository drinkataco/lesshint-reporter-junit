module.exports = {
  name: 'lesshint-lint-junit-reporter',
  report: function report(results) {
    const resultsByfiles = {};
    let output = '';

    results.forEach((result) => {
      const error = {
        line: result.line,
        col: result.column,
        message: result.message.replace(/"/g, '&quot;'),
        key: result.linter,
      };

      if (typeof resultsByfiles[result.file] === 'undefined') {
        resultsByfiles[result.file] = [];
      }

      resultsByfiles[result.file].push(error);
    });

    Object.keys(resultsByfiles).forEach((file) => {
      const count = resultsByfiles[file].length;

      output += `<testsuite package="org.lesshint" time="0" tests="${count}" errors="${count}" name="${file}">`;

      resultsByfiles[file].forEach((result) => {
        output += `<testcase time="0" name="org.lesshint.${result.key}">`;
        output += `<failure message="${result.message}">`;
        output += `<![CDATA[line ${result.line}, col ${result.col}, ${result.message} (${result.key})]]>`;
        output += '</failure>';
        output += '</testcase>';
      });

      output += '</testsuite>';
    });

    if (output !== '') {
      console.log('<?xml version="1.0" encoding="utf-8"?>');
      console.log('<testsuites>');
      console.log(output);
      console.log('</testsuites>');
    }
  },
};
