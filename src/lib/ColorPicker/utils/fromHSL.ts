import {rgbToHex} from "./fromRGB"

/**
* src: https://stackoverflow.com/a/9493060
* Converts an HSL color value to RGB. Conversion formula
* adapted from http://en.wikipedia.org/wiki/HSL_color_space.
* Assumes h, s, and l are contained in the set [0, 1] and
* returns r, g, and b in the set [0, 255].
*
* @param   {number}  h       The hue
* @param   {number}  s       The saturation
* @param   {number}  l       The lightness
* @param   {number}  a       The opacity value between 0-1
* @return  {Array}           The RGB representation
*/
export function hslToRgb(h=0, s=1, l=0.5, a=1):number[]{
  if (typeof h !== "number" || typeof s !== "number" || typeof l !== "number") throw new Error(`Something went wrong, unable to convert hue:${h} saturation:${s} lightness:${l} to a rgb color`)
  var r:number, g:number, b:number;
  if(s == 0){
    r = g = b = l; // achromatic
  }else{
      var hue2rgb = function hue2rgb(p:number, q:number, t:number) {
          if(t < 0) t += 1;
          if(t > 1) t -= 1;
          if(t < 1/6) return p + (q - p) * 6 * t;
          if(t < 1/2) return q;
          if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
      }

      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + (1.0/3.0));
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - (1.0/3.0));
    }
    const output = [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), a]
    output.map(n=>{
      if(isNaN(n)) throw new Error(`Something went wrong, unable to convert hue:${h} saturation:${s} lightness:${l} to a rgb color`)
    })
  return output;
}


/**
* src: https://stackoverflow.com/questions/36721830/convert-hsl-to-rgb-and-hex
* @param   {number}  h       The hue
* @param   {number}  s       The saturation
* @param   {number}  l       The lightness
* @return  {Array}           The HEX representation
*/
export function hslToHex(h=0, s=0, l=0):string {
  const [r,g,b,a] = hslToRgb(h,s,l)
  return rgbToHex(r,g,b)
}

export function formatHSL(hsl:number[],adapt=false) {
  if (hsl.length<3 || hsl.length>4 ) throw new Error(`Improper formatting, cannot format hsl(a):${hsl}`)
  let [h,s,l,a] = hsl
  h = formatHue(h,adapt)
  s = formatSaturtion(s,adapt)
  l = formatLightness(l,adapt)
  hsl = [h,s,l]
  return a!==undefined ? [...hsl,a] : [...hsl,1]
}

const formatHue = (h,between0And1=true) => {
  h = h > 360 ? h % 360 : h; /*Only allow 0-360deg*/
  if (between0And1) h = h / 360;
  return h;
}
const formatLightness = (l,fromPercentage=true) => {
  if (fromPercentage) l = l / 100;
  return l;
}
const formatSaturtion = (s,fromPercentage=true) => {
  if (fromPercentage) s = s / 100;
  return s;
}
