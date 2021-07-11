<script lang="ts">
  import TipTap from "./TipTap.svelte"
  export let configuration = undefined;
  let content = undefined;
  /**
   * @param node HTMLElement chained with the [`use:action` Element directive](https://svelte.dev/docs#use_action)
   * @param config Action parameters with app assigned configuration
   */
  function editorFunctionality(node,config) {
    // console.log({config});
    const {editorContent} = config;
    content = editorContent;
  }
</script>
<div use:editorFunctionality={configuration} class="container">
  {#if content !== undefined}
  <TipTap bind:content={$content}/>
  {/if}
</div>

<style>
  :root {
    --border-radius: 8px;
  }
  .container {
    display: flex;
  }
  :global(.container > .editor_container) {
    flex: 1 auto;
    display: flex;
    flex-direction: column;
    position: relative;
  }
  :global(.container > .editor_container .toolbar){
    border-radius: var(--border-radius);
    border: 0;
  }
  :global(.container > .editor_container .toolbar.main){
    position: sticky;
    top: -0.25rem;
    width: 100%;
    z-index: 1;
  }
  :global(.container > .editor_container > .editor_text_entry) {
    flex: 1 auto;
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  :global(.container > .editor_container > .editor_text_entry > .ProseMirror),
  :global(.container > .editor_container > .editor_text_entry > .ProseMirror-focused) {

    padding: 1.25rem;
    border: 3px solid;
    outline: none;
    border-radius: var(--border-radius);
    flex: 1 auto;
    max-width: 90vw;
    margin: 0;
  }
  :global(.container > .editor_container > .editor_text_entry > * > :first-child) {
    margin-top: 0;
  }
  :global(.container > .editor_container > .editor_text_entry > * > :last-child) {
    margin-bottom: 0;
  }
</style>
