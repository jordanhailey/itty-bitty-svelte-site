<script>
  export let configuration = undefined;
  /**
   * @param node HTMLElement chained with the [`use:action` Element directive](https://svelte.dev/docs#use_action)
   * @param config Action parameters with app assigned configuration
   */
  function editorFunctionality(node,config) {
    console.log("TODO: Initialize Editor",{node,config});
  }
</script>
<div use:editorFunctionality={configuration} id="editor-container">
  Editor Container
</div>
