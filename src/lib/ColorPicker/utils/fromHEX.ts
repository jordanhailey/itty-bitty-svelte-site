import {rgbToHsl} from "./fromRGB"

export function hexToHsl(hex):number[] {
  const [r,g,b,a] = hexToRgb(hex)
  return rgbToHsl(r,g,b,a)
}

class InputTooShortError extends Error {};
class OutOfRangeError extends Error {};

//https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
export function hexToRgb(hex):number[] {
  hex = formatHex(hex)
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); //JH
  const output = result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
    a: 1
  } : null;
  if (!output) throw new Error(`Something went wrong trying to convert ${hex} to RGB`)
  const {r,g,b,a} = output;
  return [r,g,b,a]
}

const outOfHexRangeTest = (char) => /[^0-9a-f]/i.test(char)

export function formatHex(inputHex) {
  let hex = inputHex.replace(/#/g,"")
  try {
    if (hex.length < 3 || hex.length > 6 ) {
      throw new InputTooShortError(`Improper formatting, cannot format hex: #${hex}`)
    }
    if (hex.length > 3 && hex.length < 6) hex = hex.substr(0,3);
    if (hex.length == 3 || hex.length == 6) {
      hex = hex.match(/./g).map(char=>{
        if (outOfHexRangeTest(char)) throw new OutOfRangeError(`'${char}' is not within the hexidecimal range '0-9a-f'`);
        return hex.length == 6 ? `${char}` : `${char}${char}`;
      }).join("")
    }
  } catch (error) {
    if (error instanceof InputTooShortError) hex = "FFFFFF";
    if (error instanceof OutOfRangeError) hex = "FFFFFF";
  } finally {
    return `${hex}`
  }
}
