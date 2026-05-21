import { chromium } from '/Users/end40387/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 800 });

// Login page
await page.goto('http://localhost:5175/login');
await page.waitForLoadState('networkidle');
await page.screenshot({ path: '/tmp/mantine-01-login.png', fullPage: true });
console.log('Login page captured');

// Try to log in
await page.fill('input[type="email"]', 'admin@salon-demo.com');
await page.fill('input[type="password"]', 'password123');
await page.click('button[type="submit"]');
await page.waitForTimeout(3000);
await page.screenshot({ path: '/tmp/mantine-02-after-login.png', fullPage: true });
console.log('After login URL:', page.url());

const url = page.url();
if (!url.includes('/login')) {
  // Appointments page screenshot
  await page.screenshot({ path: '/tmp/mantine-03-appointments.png', fullPage: true });
  
  // Navigate to services
  await page.click('text=Services', { timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/tmp/mantine-04-services.png', fullPage: true });
  
  // Toggle dark mode
  const themeToggle = page.locator('[aria-label*="theme"], [aria-label*="dark"], [aria-label*="color"]').first();
  if (await themeToggle.count() > 0) {
    await themeToggle.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/tmp/mantine-05-dark.png', fullPage: true });
  }
} else {
  console.log('Still on login page - auth may have failed');
}

await browser.close();
console.log('Done');
