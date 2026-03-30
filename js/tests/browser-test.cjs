#!/usr/bin/env node

const statik = require('node-static');
const process = require('process');
const { chromium,  webkit, firefox} = require('playwright');

const ip = 'localhost';
const port = 8000;
let server = null;

// Setup static web server for testing browser version
console.log('\nSetting up local static server at http://'+ip+':'+port+'/tests');
const file = new statik.Server('.');
server = require('http').createServer(function (request, response) {
  request.addListener('end', function () {
    file.serve(request, response);
  }).resume();
}).listen(port);

if (process.argv.includes('-m')) {
  console.log('Waiting for manual test to start...');
} else {
  (async () => {
    console.log('Launching playright..');
    let startTime = new Date();
    let browser = null;
    // on MacOS use webkit instead of chromium
    if (process.platform === 'darwin') {
      browser = await webkit.launch();
    } else if (process.platform === 'win32') {
      browser = await chromium.launch();
    } else {
      browser = await firefox.launch();
    }
    const context = await browser.newContext();
    const page = await context.newPage();
    page.on('console', msg => {
      if (msg.type() === 'log') console.log(`PAGE LOG: ${msg.text()}`);
      if (msg.type() === 'error') console.log(`PAGE ERR: ${msg.text()}`);
      if (msg.type() === 'warning') console.log(`PAGE WARN: ${msg.text()}`);
    });
    await page.goto(`http://${ip}:${port}/tests`, {waitUntil: 'networkidle'});
    await page.waitForSelector('.jasmine-overall-result', {timeout: 60000});
    // Check how many tests passed and failed and print the results
    // Get the test seed, and print how many tests passed and failed
    const seed = await page.evaluate(() => {
      const seedElement = document.querySelector('.jasmine-seed-bar').children[0];
      return seedElement ? seedElement.textContent : 'N/A';
    });
    const results = await page.evaluate(() => {
      const summary = document.querySelector('.jasmine-symbol-summary');
      const passed = summary.querySelectorAll('.jasmine-passed').length;
      const failed = summary.querySelectorAll('.jasmine-failed').length;
      return { passed, failed };
    });
    if (results.failed > 0) {
      const failedTests = await page.evaluate(() => {
        const failedTestElements = document.querySelectorAll('.jasmine-failed');
        const failedTestNames = [];
        failedTestElements.forEach(el => {
          const testDescription = el.querySelector('.jasmine-description')
          if (testDescription) {
            const testName = Array.from(testDescription.querySelectorAll('a')).map(a => a.textContent).join(' > ');
            failedTestNames.push(testName);
          }
        });
        return failedTestNames;
      });
      console.log('Failed Tests:');
      if (failedTests) failedTests.forEach(testName => console.log(`- ${testName}`));
    }
    console.log(`Test Seed: ${seed}`);
    console.log(`Passed: ${results.passed}, Failed: ${results.failed}`);

    await page.waitForTimeout(1000);
    await browser.close();
    console.log(`Browser test Complete [${new Date() - startTime} ms]`);

    if(server) server.close();
    if (results.failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  })();
}


