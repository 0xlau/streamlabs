import {
  clickGoLive,
  prepareToGoLive,
  submit,
  waitForSettingsWindowLoaded,
} from '../../helpers/modules/streaming';
import {
  clickIfDisplayed,
  focusChild,
  focusMain,
  isDisplayed,
  waitForDisplayed,
} from '../../helpers/modules/core';
import { logIn } from '../../helpers/modules/user';
import { toggleDualOutputMode, toggleDisplay } from '../../helpers/modules/dual-output';
import { test, useWebdriver, TExecutionContext } from '../../helpers/webdriver';
import { releaseUserInPool } from '../../helpers/webdriver/user';

useWebdriver();

/**
 * Toggle Dual Output Video Settings
 */
test('User must be logged in to use Dual Output', async (t: TExecutionContext) => {
  await toggleDualOutputMode(false);
  await focusChild();
  t.true(await isDisplayed('form#login-modal', { timeout: 1000 }));
});

test('Dual output checkbox toggles Dual Output mode', async (t: TExecutionContext) => {
  const user = await logIn();

  await toggleDualOutputMode();
  await focusMain();
  t.true(await isDisplayed('div#vertical-display'));

  await toggleDualOutputMode();
  await focusMain();
  t.false(await isDisplayed('div#vertical-display'));

  await releaseUserInPool(user);
});

test('Cannot toggle Dual Output in Studio Mode', async (t: TExecutionContext) => {
  const { app } = t.context;
  const user = await logIn();
  await toggleDualOutputMode();

  // attempt toggle studio mode from side nav
  await focusMain();
  await (await app.client.$('.side-nav .icon-studio-mode-3')).click();
  t.true(await isDisplayed('div=Cannot toggle Studio Mode in Dual Output Mode.'));

  await releaseUserInPool(user);
});

test('Dual Output Selective Recording is Horizontal Only', async (t: TExecutionContext) => {
  const { app } = t.context;
  const user = await logIn();
  await toggleDualOutputMode();
  await focusMain();
  await (await app.client.$('[data-name=sourcesControls] .icon-smart-record')).click();

  // Check that selective recording icon is active
  await (await app.client.$('.icon-smart-record.active')).waitForExist();

  t.false(await isDisplayed('div#vertical-display'));

  await releaseUserInPool(user);
});

/**
 * Dual Output Go Live
 */

test('Dual Output Go Live Non-Ultra', async t => {
  // non-ultra user
  const user = await logIn('twitch', { prime: false });
  await toggleDualOutputMode();
  await prepareToGoLive();
  await clickGoLive();
  await waitForSettingsWindowLoaded();

  await waitForDisplayed('[data-test=non-ultra-switcher]');

  // cannot use dual output mode with only one platform linked
  await submit();
  await waitForDisplayed(
    'div=To use Dual Output you must stream to at least one horizontal and one vertical platform.',
  );

  await releaseUserInPool(user);
  t.pass();
});

test('Dual Output Go Live Ultra', async (t: TExecutionContext) => {
  // test going live with ultra
  const user = await logIn('twitch', { multistream: true });
  await toggleDualOutputMode();
  await prepareToGoLive();
  await clickGoLive();
  await waitForSettingsWindowLoaded();

  await waitForDisplayed('[data-test=ultra-switcher]');

  // cannot use dual output mode with all platforms assigned to one display
  await submit();
  await waitForDisplayed(
    'div=To use Dual Output you must stream to at least one horizontal and one vertical platform.',
  );

  await releaseUserInPool(user);
  t.pass();
});

/**
 * Dual Output Sources
 */

test('Dual output display toggles', async (t: TExecutionContext) => {
  const user = await logIn();
  await toggleDualOutputMode();
  await focusMain();

  t.true(await isDisplayed('div#dual-output-header'));

  // check permutations of toggling on and off the displays
  await clickIfDisplayed('i#horizontal-display-toggle');
  t.false(await isDisplayed('div#horizontal-display'));
  t.true(await isDisplayed('div#vertical-display'));

  await toggleDisplay('vertical', true);
  t.false(await isDisplayed('div#horizontal-display'));
  t.false(await isDisplayed('div#vertical-display'));

  await toggleDisplay('horizontal');
  t.true(await isDisplayed('div#horizontal-display'));
  t.false(await isDisplayed('div#vertical-display'));

  await toggleDisplay('vertical');
  t.true(await isDisplayed('div#horizontal-display'));
  t.true(await isDisplayed('div#vertical-display'));

  await toggleDisplay('vertical');
  t.true(await isDisplayed('div#horizontal-display'));
  t.false(await isDisplayed('div#vertical-display'));

  await toggleDisplay('horizontal');
  t.false(await isDisplayed('div#horizontal-display'));
  t.false(await isDisplayed('div#vertical-display'));

  await toggleDisplay('vertical');
  t.false(await isDisplayed('div#horizontal-display'));
  t.true(await isDisplayed('div#vertical-display'));

  await toggleDisplay('horizontal');
  t.true(await isDisplayed('div#horizontal-display'));
  t.true(await isDisplayed('div#vertical-display'));

  await releaseUserInPool(user);
});
