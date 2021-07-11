function toFixedIfNecessary( value, dp ){
  return +parseFloat(value).toFixed( dp );
}

/**
 * src: https://stackoverflow.com/a/9493060
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   {number}  r       The red color value
 * @param   {number}  g       The green color value
 * @param   {number}  b       The blue color value
 * @param   {number}  a       The opacity value between 0-1
 * @return  {Array}           The HSL representation
 */
 export function rgbToHsl(r=0, g=0, b=0, a=1){
   r /= 255, g /= 255, b /= 255;
   var max = Math.max(r, g, b), min = Math.min(r, g, b);
   var h:number, s:number, l:number = (max + min) / 2;
   if(max == min){
     h = s = 0; // achromatic
    }else{
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max){
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h = Math.floor((h/6) * 360);
      s = toFixedIfNecessary(s * 100,1);
      l = toFixedIfNecessary(l * 100,1);
  }
  return [h, s, l, a];
}

//https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function componentToHex(c:number) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

export function rgbToHex(r=0, g=0, b=0) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}


export function formatRGB(rgb:number[]) {
  if (rgb.length<3 || rgb.length>4 ) throw new Error(`Improper formatting, cannot format rgb(a):${rgb}`)
  const formatted = rgb.length === 4 ? rgb : [...rgb,1]
  return formatted
}
