import { connectLZMAWorker } from "./lzma-api";
const randomWords =["The sky", "above", "the port","was", "the color of television", "tuned", "to", "a dead channel", ".", "All", "this happened", "more or less","." ,"I", "had", "the story", "bit by bit", "from various people", "and", "as generally", "happens", "in such cases", "each time", "it", "was", "a different story","." ,"It", "was", "a pleasure", "to", "burn"];
let input;

let expectedCompressed,expectedDecompressed;

const logError = (err,str=input) => {throw {error:err,input:str}}

beforeAll(async ()=>{
  let {compress,decompress} = connectLZMAWorker();
  // Set random test string
  let text:string|string[] = [];
  let x = 50 * Math.floor(Math.random() * randomWords.length);
  let wC = x
  x = x > 1000 ? 1000 : x;
  while(--x) text.push(randomWords[Math.floor(Math.random() * randomWords.length)]);
  input = text.join(" ").replace(/ \./g,".")
  expectedCompressed = await compress(input).catch(err=>logError(err))
  expectedDecompressed = await decompress(expectedCompressed).catch(err=>logError(err))
  console.log({wordCount:wC,inputLength:input.length,compressedLength:expectedCompressed.length})
})

describe("LZMA functions",()=>{
  test('compression functions return a promise that resolves to a string',async ()=>{
    let {compress} = connectLZMAWorker()
    return compress(input)
      .then(c=>{
        expect(typeof c === "string").toBe(true)
        expect(c).not.toBe(input)
      })
      .catch(err=>logError(err))
  });

  test('compression function output is consistent',async ()=>{
    let {compress} = connectLZMAWorker();
    let output1 = await compress(input).catch(err=>logError(err));
    let output2 = await compress(input).catch(err=>logError(err));
    expect(output1).toBe(expectedCompressed);
    expect(output2).toBe(expectedCompressed);
  });

  test(`decompression function can decompress the output of the compression
  function; it also returns a promise that resolves to a string which matches
  the input argument of the compression function`,async ()=>{
    let {compress,decompress} = connectLZMAWorker()
    return compress(input)
    .then(c=>(decompress(c)))
    .then(d=>{expect(d).toBe(input)})
    .catch(err=>logError(err))
  });

  test('decompression function output is consistent',async ()=>{
    let {compress,decompress} = connectLZMAWorker();
    let c = await compress(input).catch(err=>logError(err));
    let output1 = await decompress(c).catch(err=>logError(err));
    let output2 = await decompress(c).catch(err=>logError(err));
    expect(output1).toBe(expectedDecompressed);
    expect(output2).toBe(expectedDecompressed);
  });
})
