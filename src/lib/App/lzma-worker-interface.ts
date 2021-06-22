type compressionFnType = (string:string|ArrayBufferLike, mode:modeType, onFinish?:onFinishType, onProgress?:onProgressType) => void;
type decompressionFnType = (buffer:ArrayBufferLike|string, onFinish?:onFinishType, onProgress?:onProgressType) => void;
type modeType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type onFinishType = (res:unknown,err:unknown) => void;
type onProgressType = (percentage:number) => void;

export const connectLZMAWorker = (window) => {
  /** TODO: Perhaps create function to create a blob and build worker from blob
   *  if the window is somehow unavailable, try->Window...catch->createBlob?
   */
  if (!window) throw "Window expected, unable to initialize";
  const {compress:c,decompress:d,worker:w} = new window.LZMA("/lzma/lzma_worker.js");
  const compress = asyncCompressionCall(c);
  const decompress = asyncDecompressionCall(d);
  return {compress,decompress,worker:w()};
}

function asyncCompressionCall(compressionFn:compressionFnType):Function {
  return (string=""):Promise<string> => {
    return new Promise (async(resolve,reject)=>{
      try {
        compressionFn(string,9,(res:number[],err)=>{err ? reject(err) : resolve(fromArrayBufferToBase64(res))});
      } catch (error) {
        reject(error)
      }
    })
  }
}

function asyncDecompressionCall(decompressionFn:decompressionFnType){
  return (buffer:ArrayBufferLike|Int8Array|string):Promise<string> => {
    let b = typeof buffer === "string" ? fromBase64ToInt8Array(buffer) : buffer;
    return new Promise (async(resolve,reject)=>{
      try {
        if (!b) reject("No buffer assigned for decompression");
        decompressionFn(b,(res:string,err)=>{err ? reject(err) : resolve(res)})
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
  return window ? window.btoa(binaryOut) : btoa(binaryOut);
}

function fromBase64ToInt8Array(str){
  let binary = window ? window.atob(str) : atob(str);
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
