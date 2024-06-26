const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  // Launch the browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  
  // Open a new page
  const page = await context.newPage();
  
  // Navigate to the login page
  
  await page.goto('https://hh.ru/account/login?backurl=%2F');
  
  
  // Save cookies after logging in
  await page.waitForTimeout(5000); // Wait for 30 seconds to log in manually
  const cookies = await context.cookies();
  fs.writeFileSync('cookies.json', JSON.stringify(cookies, null, 2));
  
  // Close the browser
  await browser.close();
})();
