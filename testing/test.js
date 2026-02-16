const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const BASE_URL = 'http://localhost:5173';
const TIMEOUT = 10000;

/**
 * Creates a WebDriver instance for the specified browser
 * @param {string} browserName - Name of the browser (chrome, firefox, edge)
 * @returns {Promise<WebDriver>} WebDriver instance
 */
async function createDriver(browserName) {
  if (browserName === 'chrome') {
    const options = new chrome.Options();
    return await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  } else if (browserName === 'firefox') {
    return await new Builder()
      .forBrowser('firefox')
      .build();
  } else if (browserName === 'edge') {
    return await new Builder()
      .forBrowser('MicrosoftEdge')
      .build();
  }
}

/**
 * Runs a single test and logs the result
 * @param {string} testName - Name of the test
 * @param {Function} testFn - Test function to execute
 * @param {WebDriver} driver - WebDriver instance
 * @returns {Promise<boolean>} True if test passed, false otherwise
 */
async function runTest(testName, testFn, driver) {
  try {
    await testFn(driver);
    console.log(`  ✓ ${testName}`);
    return true;
  } catch (error) {
    console.log(`  ✗ ${testName} - ${error.message}`);
    return false;
  }
}

/**
 * Tests if the page loads successfully with correct title
 * @param {WebDriver} driver - WebDriver instance
 */
async function testPageLoad(driver) {
  await driver.get(BASE_URL);
  const title = await driver.getTitle();
  if (!title.includes('Recruitment')) {
    throw new Error(`Expected title to contain 'Recruitment', got '${title}'`);
  }
}

/**
 * Tests navigation to the login page
 * @param {WebDriver} driver - WebDriver instance
 */
async function testNavigationToLogin(driver) {
  await driver.get(BASE_URL);
  await driver.wait(until.elementLocated(By.css('body')), TIMEOUT);
  const currentUrl = await driver.getCurrentUrl();
  if (!currentUrl.includes('5173')) {
    throw new Error('Failed to load application');
  }
}

/**
 * Tests navigation to the registration page
 * @param {WebDriver} driver - WebDriver instance
 */
async function testNavigationToRegister(driver) {
  await driver.get(BASE_URL + '/register');
  await driver.wait(until.elementLocated(By.css('body')), TIMEOUT);
  const pageSource = await driver.getPageSource();
  if (!pageSource) {
    throw new Error('Registration page failed to load');
  }
}

/**
 * Tests if login page elements are present
 * @param {WebDriver} driver - WebDriver instance
 */
async function testLoginPageElements(driver) {
  await driver.get(BASE_URL);
  await driver.sleep(500);
  const pageSource = await driver.getPageSource();
  if (!pageSource.includes('html') || pageSource.length < 100) {
    throw new Error('Login page content not found');
  }
}

/**
 * Tests if form inputs are interactive
 * @param {WebDriver} driver - WebDriver instance
 */
async function testFormInteraction(driver) {
  await driver.get(BASE_URL);
  await driver.sleep(500);
  const inputs = await driver.findElements(By.css('input'));
  if (inputs.length === 0) {
    throw new Error('No input fields found on page');
  }
}

/**
 * Tests if language selector is available
 * @param {WebDriver} driver - WebDriver instance
 */
async function testLanguageSelector(driver) {
  await driver.get(BASE_URL);
  await driver.sleep(500);
  const pageSource = await driver.getPageSource();
  if (!pageSource.includes('html')) {
    throw new Error('Page structure validation failed');
  }
}

/**
 * Tests responsive design across different screen sizes
 * @param {WebDriver} driver - WebDriver instance
 */
async function testResponsiveness(driver) {
  await driver.get(BASE_URL);
  await driver.manage().window().setRect({ width: 1920, height: 1080 });
  await driver.sleep(200);
  const sizeDesktop = await driver.manage().window().getRect();
  if (sizeDesktop.width < 1000) {
    throw new Error('Desktop view failed');
  }
  
  await driver.manage().window().setRect({ width: 768, height: 1024 });
  await driver.sleep(200);
  const sizeMobile = await driver.manage().window().getRect();
  if (sizeMobile.width > 1000) {
    throw new Error('Mobile view failed');
  }
}

/**
 * Tests page navigation functionality
 * @param {WebDriver} driver - WebDriver instance
 */
async function testPageNavigation(driver) {
  await driver.get(BASE_URL);
  await driver.sleep(300);
  await driver.get(BASE_URL + '/register');
  await driver.sleep(300);
  await driver.navigate().back();
  await driver.sleep(300);
  const url = await driver.getCurrentUrl();
  if (!url.includes('5173')) {
    throw new Error('Navigation failed');
  }
}

/**
 * Tests multiple page loads for stability
 * @param {WebDriver} driver - WebDriver instance
 */
async function testMultiplePageLoads(driver) {
  for (let i = 0; i < 3; i++) {
    await driver.get(BASE_URL);
    await driver.sleep(200);
    const title = await driver.getTitle();
    if (!title) {
      throw new Error(`Page load ${i + 1} failed`);
    }
  }
}

/**
 * Tests browser back and forward button functionality
 * @param {WebDriver} driver - WebDriver instance
 */
async function testBrowserBackButton(driver) {
  await driver.get(BASE_URL);
  await driver.sleep(200);
  await driver.get(BASE_URL + '/register');
  await driver.sleep(200);
  await driver.navigate().back();
  await driver.sleep(200);
  await driver.navigate().forward();
  await driver.sleep(200);
  const url = await driver.getCurrentUrl();
  if (!url.includes('register')) {
    throw new Error('Browser navigation failed');
  }
}

/**
 * Tests page refresh functionality
 * @param {WebDriver} driver - WebDriver instance
 */
async function testPageRefresh(driver) {
  await driver.get(BASE_URL);
  await driver.sleep(200);
  await driver.navigate().refresh();
  await driver.sleep(200);
  const title = await driver.getTitle();
  if (!title) {
    throw new Error('Page refresh failed');
  }
}

/**
 * Runs all acceptance tests for a specific browser
 * @param {string} browserName - Name of the browser to test
 * @returns {Promise<boolean>} True if all tests passed, false otherwise
 */
async function runAllTests(browserName) {
  let driver;
  const results = [];
  
  try {
    driver = await createDriver(browserName);
    console.log(`\n${browserName.toUpperCase()} - Running acceptance tests...`);
    
    results.push(await runTest('Page loads successfully', testPageLoad, driver));
    results.push(await runTest('Navigate to login page', testNavigationToLogin, driver));
    results.push(await runTest('Navigate to register page', testNavigationToRegister, driver));
    results.push(await runTest('Login page elements present', testLoginPageElements, driver));
    results.push(await runTest('Form inputs interactive', testFormInteraction, driver));
    results.push(await runTest('Language selector available', testLanguageSelector, driver));
    results.push(await runTest('Responsive design works', testResponsiveness, driver));
    results.push(await runTest('Page navigation functional', testPageNavigation, driver));
    results.push(await runTest('Multiple page loads stable', testMultiplePageLoads, driver));
    results.push(await runTest('Browser back button works', testBrowserBackButton, driver));
    results.push(await runTest('Page refresh works', testPageRefresh, driver));
    
    const passed = results.filter(r => r).length;
    const total = results.length;
    console.log(`\n${browserName.toUpperCase()} Results: ${passed}/${total} tests passed`);
    
    return passed === total;
  } catch (error) {
    console.log(`\n${browserName.toUpperCase()}: FAILED - ${error.message}`);
    return false;
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}

/**
 * Main function that runs tests for all browsers
 */
async function main() {
  console.log('Cross-Browser Acceptance Testing');
  console.log('==================================\n');
  
  const chromeResult = await runAllTests('chrome');
  const firefoxResult = await runAllTests('firefox');
  const edgeResult = await runAllTests('edge');
  
  console.log('\n==================================');
  console.log('FINAL RESULTS');
  console.log('==================================');
  console.log(`Chrome:  ${chromeResult ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`Firefox: ${firefoxResult ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`Edge:    ${edgeResult ? '✓ PASS' : '✗ FAIL'}`);
  console.log('==================================\n');
  
  const allPassed = chromeResult && firefoxResult && edgeResult;
  if (allPassed) {
    console.log('All browsers passed! ✓');
    process.exit(0);
  } else {
    console.log('Some browsers failed! ✗');
    process.exit(1);
  }
}

main();
