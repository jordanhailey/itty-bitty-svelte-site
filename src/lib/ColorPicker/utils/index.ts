import {rgbToHex,rgbToHsl,formatRGB} from "./fromRGB";
import {hslToHex,hslToRgb,formatHSL} from "./fromHSL";
import {hexToHsl,hexToRgb,formatHex} from "./fromHEX";

type ContstructorType = {rgb?:number[],hsl?:number[],hex?:string}

export class ColorConstructor {
  rgb:number[]
  hsl:number[]
  hex:string
  constructor({hsl,rgb,hex}:ContstructorType) {
    this.rgb = rgb ? formatRGB(rgb) : hex ? formatRGB(hexToRgb(hex)) : hsl ? formatRGB(hslToRgb(...hsl)) : null
    this.hsl = hsl ? formatHSL(hsl) : hex ? formatHSL(hexToHsl(hex)) : rgb ? formatHSL(rgbToHsl(...rgb)) : null;
    this.hex = hex ? formatHex(hex) : rgb ? formatHex(rgbToHex(...rgb)) : hsl ? formatHex(hslToHex(...hsl)) : null;
  }
  update({hsl,rgb,hex}:ContstructorType) {
    this.rgb = rgb ? formatRGB(rgb) : hex ? formatRGB(hexToRgb(hex)) : hsl ? formatRGB(hslToRgb(...formatHSL(hsl,true))) : null
    this.hsl = hsl ? formatHSL(hsl) : hex ? formatHSL(hexToHsl(hex)) : rgb ? formatHSL(rgbToHsl(...rgb)) : null;
    this.hex = hex ? formatHex(hex) : rgb ? formatHex(rgbToHex(...rgb)) : hsl ? formatHex(hslToHex(...formatHSL(hsl,true))) : null;
  }
}
