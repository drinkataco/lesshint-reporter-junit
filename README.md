# lesshint-reporter-junit

[![Build Status](https://travis-ci.org/drinkataco/lesshint-reporter-junit.svg?branch=master)](https://travis-ci.org/drinkataco/lesshint-reporter-junit)[![npm version](https://badge.fury.io/js/lesshint-reporter-junit.svg)](https://badge.fury.io/js/lesshint-reporter-junit)


A [lesshint](https://github.com/lesshint/lesshint) [reporter](https://github.com/lesshint/lesshint/blob/master/lib/lesshint.js#reporters) to generate junit compatible reports.

## Installation
Run the following command from the command line

```
yarn add --dev lesshint-reporter-junit
```

## Usage
Use [lesshint](https://github.com/lesshint/lesshint) with `-r` or `--reporter` option:

```bash
lesshint --reporter lesshint-reporter-junit file.less
```
