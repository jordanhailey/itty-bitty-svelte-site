import {ColorConstructor} from "./index"

describe("ColorConstructor can create color values from an rgb array in the format [r,g,b,(a)]",()=>{
  test("rgb(0,255,255) is hsla(180,1,0.5,1) and #00ffff",()=>{
    const color = new ColorConstructor({rgb:[0,255,255]})
    expect(color.rgb).toEqual([0,255,255,1])
    expect(color.hsl).toEqual([180,1,0.5,1])
  })
})
describe("ColorConstructor can create color values from an hsl array in the format [h,s,l,(a)]",()=>{
  test("hsl(100,0.3,0.7) is rgb(171,201,156) and #abc99c",()=>{
    const color = new ColorConstructor({hsl:[100,0.3,0.7]})
    expect(color.rgb).toEqual([171,201,156,1])
    expect(color.hex).toBe("#abc99c")
  })
})
describe("ColorConstructor can create color values from 3 or 6 character length hex values",()=>{
  test("#fef is rgb(255, 238, 255) and hsl(300, 100, 97)",()=>{
    const color = new ColorConstructor({hex:"#fef"})
    expect(color)
  })
})
