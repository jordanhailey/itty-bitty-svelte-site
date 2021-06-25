import {compress as syncCompress, decompress as syncDecompress} from "./lzma-min";
type SyncCompressionFnType = (str:string|ArrayBufferLike, mode?:ModeType, onFinish?:OnFinishType, onProgress?:OnProgressType) => number[]|void;
type AsyncCompressionFnType = (str:string|ArrayBufferLike, mode?:ModeType, onFinish?:OnFinishType, onProgress?:OnProgressType) => Promise<string>;
type AsyncCompression_I = (str:string) => Promise<string>;
type SyncDecompressionFnType = (byte_arr:ArrayBufferLike|string, onFinish?:OnFinishType, onProgress?:OnProgressType) => string|void;
type AsyncDecompressionFnType = (byte_arr:ArrayBufferLike|string, onFinish?:OnFinishType, onProgress?:OnProgressType) => Promise<string>;
type AsyncDecompression_I = (byte_arr:string) => Promise<string>;
type WorkerFnType = () => Worker;
type ModeType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type OnFinishType = (res:unknown,err:unknown) => void;
type OnProgressType = (percentage:number) => void;
export interface LZMA_I {
  compress:AsyncCompression_I;
  decompress:AsyncDecompression_I;
  worker:WorkerFnType;
}
interface LZMA_GENERATOR_I {
  compress:SyncCompressionFnType;
  decompress:SyncDecompressionFnType;
  worker:WorkerFnType;
}

class LZMAInstanceGenerator implements LZMA_GENERATOR_I {
  compress:SyncCompressionFnType;
  decompress:SyncDecompressionFnType;
  worker:WorkerFnType;
  constructor(path_to_worker:string){
    this.compress = syncCompress;
    this.decompress = syncDecompress;
    this.worker = () => {
      let wkr = null;
      try {
        if (typeof Worker !== "undefined"){
          wkr = new Worker(path_to_worker)
        }
      } catch (error) {
        console.error(error)
      } finally {
        return wkr
      }
    }
  }
}

let globalObj = undefined;
let LZMA_INSTANCE;

export const connectLZMAWorker = ():LZMA_I => {
  globalObj = globalObj ? globalObj : window || global;
  if (!LZMA_INSTANCE && globalObj.LZMA) {
    LZMA_INSTANCE = globalObj.LZMA;console.log("LZMA Web Worker connecting")
  }
  const API = LZMA_INSTANCE ? LZMA_INSTANCE : LZMAInstanceGenerator;
  if (!LZMA_INSTANCE) LZMA_INSTANCE = typeof API === "function" ? new API("./lzma_worker.js") : API;
  const {compress:c,decompress:d,worker:w} = LZMA_INSTANCE;
  const worker = typeof w === "function" ? w() : w;
  const compress = worker ? compressionCall(c,false) : compressionCall(c,true);
  const decompress = worker ? decompressionCall(d,false) : decompressionCall(d,true);
  return {compress,decompress,worker};
}

function compressionCall(compressionFn:SyncCompressionFnType|AsyncCompressionFnType,sync:Boolean) {
  return (str=""):Promise<string> => {
    return new Promise (async(resolve,reject)=>{
      try {
        if (sync) {
          const res = compressionFn(str,9);
          resolve(fromArrayBufferToBase64(res));
        }
        else compressionFn(str,9,(res:number[],err)=>{err ? reject(err) : resolve(fromArrayBufferToBase64(res))});
      } catch (error) {
        reject(error)
      }
    })
  }
}

function decompressionCall(decompressionFn:SyncDecompressionFnType|AsyncDecompressionFnType,sync:Boolean){
  return (byte_arr:ArrayBufferLike|Int8Array|string):Promise<string> => {
    let b = typeof byte_arr === "string" ? fromBase64ToInt8Array(byte_arr) : byte_arr;
    return new Promise (async(resolve,reject)=>{
      try {
        if (!b) reject("No buffer assigned for decompression");
        if (sync) {
          const res = decompressionFn(b);
          resolve(typeof res === "string" ? res : "");

        }
        else decompressionFn(b,(res:string,err)=>{err ? reject(err) : resolve(res)})
      } catch (error) {
        reject(error)
      }
    })
  }
}

function fromArrayBufferToBase64(buffer){
  let binaryOut = "";
  let byte_arr = new Uint8Array(buffer);
  const length = byte_arr.length;
  for (let i=0;i<length;i++){
      binaryOut += String.fromCharCode(byte_arr[i]);
  }
  return globalObj ? globalObj.btoa(binaryOut) : btoa(binaryOut);
}

function fromBase64ToInt8Array(str){
  let binary = globalObj ? globalObj.atob(str) : atob(str);
  let length = binary.length;
  let buffer = new Int8Array(length);
  for (let i = 0; i < length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer;
}

// polyfills for atob and btoa https://github.com/MaxArt2501/base64-js/blob/master/base64.js

const  b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    // Regular expression to check formal correctness of base64 encoded strings
    b64re = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;

function btoa(string) {
    string = String(string);
    var bitmap, a, b, c,
        result = "", i = 0,
        rest = string.length % 3; // To determine the final padding

    for (; i < string.length;) {
        if ((a = string.charCodeAt(i++)) > 255
                || (b = string.charCodeAt(i++)) > 255
                || (c = string.charCodeAt(i++)) > 255)
            throw new TypeError("Failed to execute 'btoa' on 'Window': The string to be encoded contains characters outside of the Latin1 range.");

        bitmap = (a << 16) | (b << 8) | c;
        result += b64.charAt(bitmap >> 18 & 63) + b64.charAt(bitmap >> 12 & 63)
                + b64.charAt(bitmap >> 6 & 63) + b64.charAt(bitmap & 63);
    }

    // If there's need of padding, replace the last 'A's with equal signs
    return rest ? result.slice(0, rest - 3) + "===".substring(rest) : result;
};

function atob(string) {
  // atob can work with strings with whitespaces, even inside the encoded part,
  // but only \t, \n, \f, \r and ' ', which can be stripped.
  string = String(string).replace(/[\t\n\f\r ]+/g, "");
  if (!b64re.test(string))
      throw new TypeError("Failed to execute 'atob' on 'Window': The string to be decoded is not correctly encoded.");

  // Adding the padding if missing, for semplicity
  string += "==".slice(2 - (string.length & 3));
  var bitmap, result = "", r1, r2, i = 0;
  for (; i < string.length;) {
      bitmap = b64.indexOf(string.charAt(i++)) << 18 | b64.indexOf(string.charAt(i++)) << 12
              | (r1 = b64.indexOf(string.charAt(i++))) << 6 | (r2 = b64.indexOf(string.charAt(i++)));

      result += r1 === 64 ? String.fromCharCode(bitmap >> 16 & 255)
              : r2 === 64 ? String.fromCharCode(bitmap >> 16 & 255, bitmap >> 8 & 255)
              : String.fromCharCode(bitmap >> 16 & 255, bitmap >> 8 & 255, bitmap & 255);
  }
  return result;
};
