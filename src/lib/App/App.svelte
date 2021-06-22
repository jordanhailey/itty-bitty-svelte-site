<script lang="ts">
  import Editor from "../Editor.svelte";
  export let state = undefined;
  $:renderedEditor = undefined;

  /**
   * @param node HTMLElement chained with the [`use:action` Element directive](https://svelte.dev/docs#use_action)
   * @param MountedState Action parameters defaulting to the state object derived from the path route handler
   */
  function appContextWrapper(node,MountedState=state) {
    let {inflate:{search:appMode,hash:hashToDecode}} = MountedState;
    if (!hashToDecode.substr(1)) console.log("Default State",{node,appMode})
    else console.log("TODO: Inflate Fragment",{node,appMode})
    const editorCfg = {
      mode:appMode.replace(/\?|[/]/g,""),
    }
    renderEditor(editorCfg)
  }

  /**
   * @param config Editor configuration
   */
  function renderEditor(config=undefined) {
    console.log("Rendering Editor")
    return new Promise((resolve,_)=>{
      try {
        if (config) renderedEditor = config
      } catch (err) {
        console.error(err)
      } finally {
        resolve(config)
      }
    })
  }
</script>
<div use:appContextWrapper={state} id="app-container">
  App Container
  {#if renderedEditor}
  <Editor configuration={renderedEditor}/>
  {:else}
  Rendering Editor...
  {/if}
</div>
