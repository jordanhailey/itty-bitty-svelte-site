export const connectLZMAWorker = (window) => {
  /** TODO: Perhaps create function to create a blob and build worker from blob
   *  if the window is somehow unavailable, try->Window...catch->createBlob?
   */
  if (!window) throw "Window expected, unable to initialize";
  const {compress,decompress,worker} = new window.LZMA("/lzma/lzma_worker.js");
  return {compress,decompress,worker:worker()};
}
