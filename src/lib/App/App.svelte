<script lang="ts">
  import {
    checkIfHashRequiresDecoding,
    editors,
    renderEditor,
    curriedEditorRegistration,
    connectLZMAWorker,
    changeFragment,
    formattedFragment
  } from "./modules";
  import type { AppStateType, LZMA_I } from "./modules";
  import Editor from "$lib/Editor/Editor.svelte";
import { tick } from "svelte";

  export let state = {} as AppStateType;
  let compress:LZMA_I["compress"],
      decompress:LZMA_I["decompress"],
      worker:LZMA_I["worker"];

  // Trigger compression on editor change
  $:{ if(typeof $editors.get("main") === "string") {
    const str = $editors.get("main");
    const sentTime=Date.now();
    if (editorConfig != undefined) {
      if (str) {
        compress(str)
          .then((output:string)=>{
            let msElapsed = Date.now() - sentTime;
            changeFragment({lzmaB64:output})
            tick()
            history.replaceState(null,"tweetable",`#${$formattedFragment}`) // Change browser history
            return {str,output,sentTime,msElapsed}
          })
          .catch((err:ErrorEvent) =>{throw new Error(`Something went wrong compressing ${str}. ${err}`)})
      } else {
        changeFragment(null)
        if (!$formattedFragment) history.pushState(null,"tweetable",`#${$formattedFragment}`) // Change browser history
      }
    }
  }}

  const registerEditor = curriedEditorRegistration(editors);

  $:editorConfig = undefined as Record<string,unknown>;

  /**
   * @param node HTMLElement chained with the [`use:action` Element directive](https://svelte.dev/docs#use_action)
   * @param mountedState Action parameters defaulting to the state object derived from the path route handler
   */
  function appContextWrapper(_,mountedState) {
    const {compress:c,decompress:d,worker:w} = connectLZMAWorker();
    [compress,decompress,worker] = [c,d,w]; // hoisting destructured variables to component's global variables
    const {inflate:{hash}} = mountedState;
    let eCfg:Record<string,unknown> = {};
    const toDecode = checkIfHashRequiresDecoding(hash);
    if (!toDecode) {
      eCfg.editorContent = registerEditor("main") // hardcoding main id, in the future if more editors are required, this can be refactored
      editorConfig = eCfg;
    }
    else {
      decompress(toDecode)
      .then(decodedStr => {
          eCfg.editorContent = registerEditor("main",decodedStr) // hardcoding main id, in the future if more editors are required, this can be refactored
          editorConfig = eCfg;
        })
        .catch((err:ErrorEvent)=>{throw err})
        .finally(()=>{/**Editor is loaded*/})
    }
  }
</script>
<div use:appContextWrapper={state} id="app-container" class="container">
  {#if editorConfig}
    {#await renderEditor(editorConfig) then cfg}
    <Editor configuration={cfg}/>
    {:catch error}
    {error}
    {/await}
  {:else}
  <!-- TODO: Fallback for no JS?? -->
  {/if}
</div>

<style>
  .container {
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: 100%;
  }
</style>
