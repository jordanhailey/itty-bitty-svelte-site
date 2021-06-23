<script lang="ts" context="module">
  type AppStateType = {
    inflate?: Record<string,unknown>,
  };
</script>
<script lang="ts">
  import Editor from "$lib/Editor.svelte";
  import {connectLZMAWorker} from "./lzma-worker-interface"
  export let state = undefined as AppStateType;
  import { writable } from "svelte/store";
  const appMessages = writable([]);
  $:editorConfig= undefined as Record<string,unknown>;

  $: {
    /**
     * TODO: Depending on complexity, I may export a function to send messages
     * directly to appContextWrapper and a handler, similar to the inferface of
     * plugins like Redux. For now. Just logging the messages is fine.
    */
    // Log and dismiss messages as they come in
    if ($appMessages.length>0) appMessages.update(msgs=>msgs.filter(msg => console.log({appMessage:msg,time:Date.now()})))
  }

  let compress:Function,
    decompress:Function,
    worker:{terminate?:VoidFunction,onmessage?:VoidFunction,postmessage?:VoidFunction};

  /**
   * @param node HTMLElement chained with the [`use:action` Element directive](https://svelte.dev/docs#use_action)
   * @param MountedState Action parameters defaulting to the state object derived from the path route handler
   */
  function appContextWrapper(node,MountedState) {
    const {compress:c,decompress:d,worker:w} = connectLZMAWorker(window);
    [compress,decompress,worker] = [c,d,w]; // hoisting destructured variables to component's global variables
    const {inflate:{search:appMode,hash:hashToDecode}} = MountedState;
    const editorCfg = {
      state:{
        mode:appMode?.replace(/\?|[/]/g,""),
      },
      curriedCompressionCaller: (node:HTMLElement) => {
        let src = node instanceof HTMLElement ? node : undefined;
        return async function requestStringCompression(str:string) {
          const compressionOutput = await compress(str)
            .then((output:string)=>{
              appMessages.update(s=>[...s,{source:src,CompressionEvent:{output:output,input:str}}]);
              return output;
            })
            .catch((err:ErrorEvent) =>{appMessages.update(s=>[...s,{source:src,CompressionEvent:{error:err,input:str}}])});
          if (!compressionOutput) throw `Something went wrong compressing ${str}`;
          return compressionOutput;
        }
      }
    }
    if (hashToDecode?.substr(1)) {
      let len = "/?".length, idx = hashToDecode?.indexOf("/?"),
        base64Fragment = hashToDecode?.substr(idx>=0 ? idx+len : 0);
      if (base64Fragment) {
        decompress(base64Fragment)
          .then(decodedStr => {
            editorCfg.state = Object.assign(editorCfg.state,{
                decoded:decodedStr,
                encoded:base64Fragment
            })
          })
          .catch(err=>{console.error(err)})
      }
    }
    editorConfig = editorCfg;
  }

  /**
   * @param config Editor configuration
   */
  function renderEditor(cfg) {
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
        // reject(err)
        resolve({})
      }
    })
  }
</script>
<div use:appContextWrapper={state} id="app-container">
  App Container
  {#if editorConfig}
    {#await renderEditor(editorConfig)}
    Loading Editor...
    {:then cfg}
    <Editor configuration={cfg}/>
    {:catch error}
    {error}
    {/await}
  {:else}
    Building Config...
  {/if}
</div>
