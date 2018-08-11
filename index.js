module.exports = {
  name: 'lesshint-lint-junit-reporter',
  report: function report(results) {
    const resultsByfiles = {};
    let output = '';

    results.forEach((result) => {
      if (typeof resultsByfiles[result.fullPath] === 'undefined') {
        resultsByfiles[result.fullPath] = [];
      }

      resultsByfiles[result.fullPath].push(result);
    });

    Object.keys(resultsByfiles).forEach((file) => {
      const count = resultsByfiles[file].length;

      output += `<testsuite package="org.lesshint" time="0" tests="${count}" errors="${count}" name="${file}">`;

      resultsByfiles[file].forEach((result) => {
        const message = result.message.replace(/"/g, '&quot;');

        output += `<testcase time="0" name="org.lesshint.${result.linter}">`;
        output += `<failure message="${message}">`;
        output += `<![CDATA[line ${result.line}, col ${result.column}, ${message}. (${result.linter})]]>`;
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
