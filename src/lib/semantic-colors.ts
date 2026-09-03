export const SAFE_OPAQUE_HEX_COLOR = /^#[0-9a-f]{6}$/i;

const HSL_CHANNELS =
  /^([+-]?(?:\d+(?:\.\d+)?|\.\d+))(?:deg)?(?:\s+|,\s*)([+-]?(?:\d+(?:\.\d+)?|\.\d+))%(?:\s+|,\s*)([+-]?(?:\d+(?:\.\d+)?|\.\d+))%(?:\s*\/\s*(1(?:\.0+)?|100%))?$/i;

const toHexChannel = (channel: number) =>
  Math.round(Math.min(1, Math.max(0, channel)) * 255)
    .toString(16)
    .padStart(2, '0');

export function hslChannelsToHex(value: string): string | null {
  const normalized = value
    .trim()
    .replace(/^hsl\(\s*/i, '')
    .replace(/\s*\)$/i, '');
  const match = HSL_CHANNELS.exec(normalized);
  if (!match) return null;

  const hue = Number(match[1]);
  const saturation = Number(match[2]);
  const lightness = Number(match[3]);
  if (
    !Number.isFinite(hue) ||
    !Number.isFinite(saturation) ||
    !Number.isFinite(lightness) ||
    saturation < 0 ||
    saturation > 100 ||
    lightness < 0 ||
    lightness > 100
  ) {
    return null;
  }

  const h = ((hue % 360) + 360) % 360;
  const s = saturation / 100;
  const l = lightness / 100;
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const secondary = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
  const offset = l - chroma / 2;

  let red = 0;
  let green = 0;
  let blue = 0;

  if (h < 60) {
    red = chroma;
    green = secondary;
  } else if (h < 120) {
    red = secondary;
    green = chroma;
  } else if (h < 180) {
    green = chroma;
    blue = secondary;
  } else if (h < 240) {
    green = secondary;
    blue = chroma;
  } else if (h < 300) {
    red = secondary;
    blue = chroma;
  } else {
    red = chroma;
    blue = secondary;
  }

  return `#${toHexChannel(red + offset)}${toHexChannel(
    green + offset
  )}${toHexChannel(blue + offset)}`;
}

export function toOpaqueHexColor(value: string): string | null {
  const normalized = value.trim();
  if (SAFE_OPAQUE_HEX_COLOR.test(normalized)) {
    return normalized.toLowerCase();
  }

  const shortHex = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(normalized);
  if (shortHex) {
    return `#${shortHex
      .slice(1)
      .map(channel => channel.repeat(2))
      .join('')
      .toLowerCase()}`;
  }

  return hslChannelsToHex(normalized);
}

export function getReactFlowMarkerColor(value: string): string | null {
  return SAFE_OPAQUE_HEX_COLOR.test(value) ? value.toLowerCase() : null;
}
