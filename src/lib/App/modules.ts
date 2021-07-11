export { connectLZMAWorker } from "./lzma-api";
export type { LZMA_I } from "./lzma-api";
export { changeFragment, formattedFragment } from "./fragmentStore";
import { derived, writable } from "svelte/store";
import type { Writable } from "svelte/store";

export type AppStateType = {
  inflate?: {
    search?: string;
    hash?: string;
  }
};

export function checkIfHashRequiresDecoding(urlFragment:string):false|string {
  // Determine if decoding is required before initializing Editor
  /** TODO: Make this safer! This check can cause a 'train wreck', add tests for the (de)compression formulas
   * and refactor to ensure proper enocoding is being passed into the atob/btoa functions
  */
  let len = "/?".length, idx = urlFragment?.indexOf("/?");
  const toDecode = idx>=0 ? urlFragment?.substr(idx+len) : "";
  if (!toDecode) return false
  else return toDecode
}

/**
 * @param config Editor configuration
*/
export function renderEditor(cfg:Record<string,unknown>) {
  /**
   * TODO: Future idea - consider making the app default to a form so
   * that it can *somewhat* work without JS enabled. In which case this function should then
   * call to destroy / disable the form and mount the reactive editor in it's place.
  */
  return new Promise((resolve,reject)=>{
    try {
      // Only allow objects through to Editor
      if (cfg == null || cfg == undefined || Array.isArray(cfg) || Object.keys(cfg).length===0) throw "Config Error";
      resolve(cfg)
    } catch (err) {
      reject(err)
    }
  })
}


export function curriedEditorRegistration(editorStore:Writable<Map<string,string>>) {
  return function registerEditor(id:string,decodedStr="") {
    const manageThisEditor = mapStoreUpdater(editorStore)(id);
    manageThisEditor(decodedStr);
    const derivedStore = derived(editorStore,(storeState:Map<string,string>)=>{
      return storeState.get(id);
    })
    // @ts-ignore This is barking about the derived editorStore (Readable type) does not support the `set` property */
    derivedStore.set = (v:string) => manageThisEditor(v);
    return derivedStore
  }
}
/** registerEditor curried utility function */
function mapStoreUpdater (editorStore) {
  let savedState = "";
  return (id:string) => {
    return (v = "") => {
      if (v === savedState) return
      savedState = v;
      editorStore.update((storeState:Map<string,string>) => {
        storeState.set(id,v) // This is the Map set() method, not writable svelte store set() method
        return storeState
      })
    }
  }
}

export const editors = writable(new Map());
