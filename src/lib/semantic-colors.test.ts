import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  getReactFlowMarkerColor,
  hslChannelsToHex,
  toOpaqueHexColor,
} from './semantic-colors.ts';

describe('hslChannelsToHex', () => {
  it('normalizes hues outside the standard range', () => {
    assert.equal(hslChannelsToHex('hsl(-60 100% 50%)'), '#ff00ff');
    assert.equal(hslChannelsToHex('420 100% 50%'), '#ffff00');
  });

  it('converts every RGB color sector', () => {
    assert.deepEqual(
      [0, 60, 120, 180, 240, 300].map(hue =>
        hslChannelsToHex(`${hue} 100% 50%`)
      ),
      ['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff']
    );
  });

  it('converts zero-saturation colors to grayscale', () => {
    assert.equal(hslChannelsToHex('217 0% 50%'), '#808080');
    assert.equal(hslChannelsToHex('0 0% 100%'), '#ffffff');
  });

  it('rejects malformed and translucent values', () => {
    for (const value of [
      '',
      'hsl(nope)',
      'hsl(10 101% 50%)',
      'hsl(10 50% -1%)',
      'hsl(10 50% 50% / 0.5)',
      'hsla(10, 50%, 50%, 0.5)',
    ]) {
      assert.equal(hslChannelsToHex(value), null, value);
    }
  });
});

describe('toOpaqueHexColor', () => {
  it('normalizes full and shorthand opaque hex colors', () => {
    assert.equal(toOpaqueHexColor(' #A1B2C3 '), '#a1b2c3');
    assert.equal(toOpaqueHexColor('#AbC'), '#aabbcc');
  });

  it('rejects malformed and translucent colors', () => {
    for (const value of [
      '#abcd',
      '#11223380',
      'rgba(1, 2, 3, 0.5)',
      'transparent',
      'not-a-color',
    ]) {
      assert.equal(toOpaqueHexColor(value), null, value);
    }
  });
});

describe('getReactFlowMarkerColor', () => {
  it('allows only ReactFlow-safe opaque six-digit hex colors', () => {
    assert.equal(getReactFlowMarkerColor('#A1B2C3'), '#a1b2c3');
    assert.equal(getReactFlowMarkerColor('#abc'), null);
    assert.equal(getReactFlowMarkerColor('#11223380'), null);
    assert.equal(getReactFlowMarkerColor('hsl(0 100% 50%)'), null);
    assert.equal(getReactFlowMarkerColor('var(--chart-1)'), null);
  });
});
