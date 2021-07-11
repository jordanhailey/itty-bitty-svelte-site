<script lang="ts">
  import Toolbar from "./Toolbar.svelte"
  import { onMount, onDestroy } from 'svelte';
  import { Editor as TipTapEditor } from '@tiptap/core';
  import StarterKit from '@tiptap/starter-kit';
  import BubbleMenu from '@tiptap/extension-bubble-menu';
  export let content = "";
  let editorContainer:any, editor:any, bubbleMenu:any, element:any, escapeMovesToEditor:Function;
  onMount(() => {
      editor = new TipTapEditor({
        autofocus: true,
        content: content,
        element: element,
        extensions: [
          StarterKit.configure({
            heading: {
              levels: [1,2,3,4,5,6],
            },
          }),
          BubbleMenu.configure({
            element: bubbleMenu,
            tippyOptions: {
              interactive: true,
            }
          }),
        ],
        onTransaction: (e) => {
          const {transaction} = e
          const {before} = transaction
          // force re-render so `editor.isActive` works as expected
          editor = editor
          content = editor.state.doc.textContent ?  editor.getHTML() : ""
          if (!/#/.test(before.textContent) && !editor.state.doc.textContent && editor.isActive("heading")) {
            editor.chain().focus().setParagraph().run() // reset from heading to paragraph
          }
        },
      });
      escapeMovesToEditor = moveFocusToEditor("Escape",editor)
      editorContainer.addEventListener("keydown",escapeMovesToEditor) // Quick and dirty override to move focus from toolbar to the editor
  })

  onDestroy(() => {
    editorContainer.removeEventListener("keydown",escapeMovesToEditor)
    if (editor) editor.destroy()
  })

  function moveFocusToEditor(keyName,edtr) {
    return (e)=>{
      const {key} = e;
      if (key !== keyName) return
      let pos = edtr?.state?.selection?.ranges?.[0].$from.pos
      let posEnd = edtr?.state?.selection?.ranges?.[0].$to.pos
      if (pos && posEnd) edtr?.chain().focus(posEnd).run()
      else edtr.chain().focus("start").run()
    }
  }
</script>
<div class="editor_container" bind:this={editorContainer}>
    {#if editor}
      <Toolbar {editor}/>
    {/if}
    <div class="bubble-menu" bind:this={bubbleMenu}>
      {#if editor}
        <Toolbar {editor} isBubbleMenu={true}/>
      {/if}
    </div>
	<div class="editor_text_entry" bind:this={element} />
</div>
