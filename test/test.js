/* eslint-env mocha */
const assert = require('assert');
const sinon = require('sinon');
const xml2js = require('xml2js');
const fs = require('fs');
const { stdout } = require('test-console');

const junitReporter = require('../index');

const exampleResults = [
  {
    column: 5,
    file: 'test.less',
    fullPath:
     '/src/views/test.less',
    line: 4,
    linter: 'universalSelector',
    message: 'The universal selector shouldn\'t be used.',
    position: 55,
    severity: 'warning',
    source: '    * {',
  },
  {
    column: 17,
    file: 'test.less',
    fullPath:
     '/src/views/test.less',
    line: 5,
    linter: 'zeroUnit',
    message: 'Unit should not be omitted on zero values.',
    position: 75,
    severity: 'warning',
    source: '        margin: 0;',
  },
  {
    column: 9,
    file: 'anotherfile.less',
    fullPath:
     '/src/views/anotherfile.less',
    line: 6,
    linter: 'propertyOrdering',
    message: 'Property ordering is not alphabetized',
    position: 86,
    severity: 'warning',
    source: '        background-color: @primaryColor;',
  },
];

// Capture exit process method

describe('JUNIT Reporter', () => {
  it('It should parse errors and throw exit code', (done) => {
    sinon.stub(process, 'exit');
    const inspect = stdout.inspect();

    junitReporter.report(exampleResults);

    inspect.restore();

    // Start by checking the exist code so we can restore process.exit
    assert.ok(process.exit.calledWith(1));
    process.exit.restore();
    const response = inspect.output;

    assert.ok(response.length > 0);

    xml2js.parseString(response, (e, r) => {
      const { testsuite } = r.testsuites;

      const testFile = testsuite[0];
      const anotherFile = testsuite[1];

      assert.ok(testFile.$.name, '/src/views/test.less');
      assert.ok(testFile.$.package === 'org.lesshint');
      assert.ok(testFile.$.errors === '2');
      assert.ok(testFile.testcase.length === parseInt(testFile.$.errors, 10));

      assert.ok(anotherFile.$.name === '/src/views/anotherfile.less');
      assert.ok(anotherFile.$.package === 'org.lesshint');
      assert.ok(anotherFile.$.errors === '1');
      assert.ok(anotherFile.testcase.length === parseInt(anotherFile.$.errors, 10));

      assert.ok(testFile.testcase[0].failure[0]._.trim() === 'line 4, col 5, The universal selector shouldn\'t be used. (universalSelector)');
      assert.ok(testFile.testcase[1].failure[0]._.trim() === 'line 5, col 17, Unit should not be omitted on zero values. (zeroUnit)');
      assert.ok(anotherFile.testcase[0].failure[0]._.trim() === 'line 6, col 9, Property ordering is not alphabetized (propertyOrdering)');

      done();
    });
  });

  it('It should not throw an exit code when no errors', (done) => {
    sinon.stub(process, 'exit');
    const inspect = stdout.inspect();

    junitReporter.report([]);

    inspect.restore();
    // Start by checking the exist code so we can restore process.exit
    assert.ok(!process.exit.called);
    process.exit.restore();

    const response = inspect.output;

    assert.ok(response.length === 0);

    done();
  });

  it('It should be able to write to file', (done) => {
    sinon.stub(process, 'exit');
    const filename = 'junit.xml';
    const inspect = stdout.inspect();

    junitReporter.report(exampleResults);
    const output = junitReporter.out[0];

    const writeOut = junitReporter.writeOut(filename);
    writeOut();

    inspect.restore();
    process.exit.restore();

    // Wait 100 ms before checking if file exists, as writeOut is asynchronous
    setTimeout(() => {
      assert.ok(fs.existsSync(filename));
      // Assert that the file contets match the output
      assert.ok(fs.readFileSync(filename, { encoding: 'utf-8' }) === output);
      // writeOut should have reset the junitReporter.out array
      assert.ok(junitReporter.out[0] === undefined);
      // Then delete the file
      fs.unlinkSync(filename);
    }, 100);
    done();
  });
});
