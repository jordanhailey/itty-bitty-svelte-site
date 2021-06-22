<script lang="ts" context="module">
  type AppStateType = {
    inflate?: Record<string,unknown>,
  };
</script>
<script lang="ts">
  import Editor from "$lib/Editor.svelte";
  import {connectLZMAWorker} from "./lzma-worker-interface"
  export let state = undefined as AppStateType;
  $:editorConfig= undefined as Record<string,unknown>;

  /**
   * @param node HTMLElement chained with the [`use:action` Element directive](https://svelte.dev/docs#use_action)
   * @param MountedState Action parameters defaulting to the state object derived from the path route handler
   */
  function appContextWrapper(node,MountedState) {
    const lzma = connectLZMAWorker(window);
    const compressionTestInput = "Hello World";
    lzma.compress(compressionTestInput,6,(cRes,cErr)=>{
      console.log("Compression input:",compressionTestInput)
      if (cErr) console.error(cErr)
      console.log({compressionOutput:cRes})
      lzma.decompress(cRes,(dRes,dErr)=>{
        if (dErr) console.error(dErr)
        console.log({decompressionOutput:dRes})
      })
    })
    let {inflate:{search:appMode,hash:hashToDecode}} = MountedState;
    if (!hashToDecode?.substr(1)) console.log("Default State",{node,appMode})
    else console.log("TODO: Inflate Fragment",{node,appMode})
    editorConfig = {
      mode:appMode?.replace(/\?|[/]/g,""),
    }
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
