import { test as setup } from '@playwright/test';
import { loginThroughUi } from './helpers/ui.ts';
import { resetMock } from './helpers/mock.ts';

const storagePath = 'e2e/.auth/user.json';

setup('authenticate through login', async ({ page }) => {
  await resetMock('ready');
  await loginThroughUi(page);
  await page.context().storageState({ path: storagePath });
});
