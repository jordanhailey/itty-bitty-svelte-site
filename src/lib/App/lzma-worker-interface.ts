type compressionFnType = (string:string|ArrayBufferLike, mode:modeType, onFinish?:onFinishType, onProgress?:onProgressType) => void;
type decompressionFnType = (buffer:ArrayBufferLike, onFinish?:onFinishType, onProgress?:onProgressType) => void;
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
  return (string=""):Promise<number[]> => {
    return new Promise (async(resolve,reject)=>{
      try {
        compressionFn(string,9,(res:number[],err)=>{err ? reject(err) : resolve(res)});
      } catch (error) {
        reject(error)
      }
    })
  }
}

function asyncDecompressionCall(decompressionFn:decompressionFnType){
  return (buffer:ArrayBufferLike):Promise<string> => {
    return new Promise (async(resolve,reject)=>{
      try {
        if (!buffer) reject("No buffer assigned for decompression");
        decompressionFn(buffer,(res:string,err)=>{err ? reject(err) : resolve(res)})
      } catch (error) {
        reject(error)
      }
    })
  }
}
