<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  export let editor, isBubbleMenu=undefined;
  const cssHeadingClasses = ['heading','h-1','h-2','h-3','h-4','h-5','h-6']
  let toolbar:any, activeDescendant = "", toolbarOptions:any;
  const iA:any = {
    blockquote: false,
    bulletList: false,
    codeBlock: false,
    hardBreak: false,
    heading: {any:false},
    horizontalRule: false,
    listItem: false,
    orderedList: false,
    paragraph: false,
    text: false,
    bold:false,
    underline:false,
    code:false,
    italic:false,
    strike:false,
  }

  $: {
    // refresh active classes on each transaction
    let e = editor;
    iA.heading = {
      any: e.isActive("heading"),
      h1: e.isActive("heading",{level:1}),
      h2: e.isActive("heading",{level:2}),
      h3: e.isActive("heading",{level:3}),
      h4: e.isActive("heading",{level:4}),
      h5: e.isActive("heading",{level:5}),
      h6: e.isActive("heading",{level:6}),
    };
    iA.bold = e.isActive("bold");
    iA.italic = e.isActive("italic");
    iA.strike = e.isActive("strike");
    iA.paragraph = e.isActive("paragraph");
    iA.code = e.isActive("code");
    iA.horizontalRule = e.isActive("horizontalRule");
    iA.bulletList = e.isActive("bulletList");
    iA.orderedList = e.isActive("orderedList");
    iA.listItem = e.isActive("listItem");
  }

  // Listen for keyboard shortcut to access toolbar TODO: document shortcuts
  onMount(()=>{
    if (toolbar?.id == "main_toolbar") window.addEventListener("keydown",moveFocusToToolbar)
  })
  onDestroy(()=>{
    if (toolbar?.id == "main_toolbar") window.removeEventListener("keydown",moveFocusToToolbar)
  })

  function showSelectedHeading(edtr,event?:any, next?:boolean){
    /**
     * By passing in the editor object on (edtr), with each change this function
     * is re-ran on the respective elements, modifying their behavior
    */
    let shiftClicked = event?.shiftKey; // shiftclick will inverse the toggle direction
    let idx = 0;
    let toggleDirection = (i)=> {
      if (!shiftClicked) {
        return i == 6 ? 6 : i+1
      } else return i == 1 ? 1 : i == 0 ? 6 : i-1;
    }
    const {any,h1,h2,h3,h4,h5,h6} = iA.heading
    if (!any) return next ? toggleDirection(idx) : cssHeadingClasses[idx]
    if (h1) idx = 1;
    else if (h2) idx = 2;
    else if (h3) idx = 3;
    else if (h4) idx = 4;
    else if (h5) idx = 5;
    else if (h6) idx = 6;
    return next ? toggleDirection(idx) : cssHeadingClasses[idx]
  }

  function handleKeyNav(prev,next){
    return (e) => {
      const {key} = e;
      if (prev && (key === "ArrowLeft" || key === "ArrowUp")) prev.focus()
      else if (next && (key === "ArrowRight" || key === "ArrowDown")) next.focus()
    }
  }

  function becomesActiveDescendant(e){
    const el = document.activeElement;
    activeDescendant = document.activeElement.parentElement.id;
    let prev = el.previousElementSibling;
    let next = el.nextElementSibling;
    const elKeyNavHander = (handleKeyNav(prev,next))
    el.addEventListener("keydown",elKeyNavHander);
    el.addEventListener("blur",()=>{
      el.removeEventListener("keydown",elKeyNavHander);
      if (activeDescendant === document.activeElement.parentElement.id) activeDescendant = ""
    })
  }

  function moveFocusToToolbar(e) {
    const {key,metaKey} = e
    if (!metaKey) return
    if (key.toLowerCase() !== "p") return
    e.preventDefault()
    if (toolbarOptions.contains(document.activeElement)) editor.chain().focus().run()
    else toolbarOptions.firstChild.focus()
  }

</script>

<svelte:head>
  <link href="https://cdn.jsdelivr.net/npm/remixicon@2.5.0/fonts/remixicon.css" rel="stylesheet">
</svelte:head>

<p id="toolbar_desc" class="sr-only">
  You are on the toolbar, Navigate to other buttons using the Tab or the Arrow keys. Use the Escape key to return to the editor.
  Selecting clicking an (with Space or Enter key) item will move focus from the toolbar and into the Editor at your last
  cursor position.
</p>
<div bind:this={toolbar} id={ isBubbleMenu ? "bubble_menu_toolbar" : "main_toolbar"} class="toolbar" tabindex="-1" class:main={!isBubbleMenu} class:bubble_menu={isBubbleMenu}>
  <div bind:this={toolbarOptions} aria-labelledby="toolbar_desc" class="toolbar_options">
      <button
        data-selected={iA.paragraph ? "true" : "false"}
        id={isBubbleMenu ? "toggle_paragraph_bubble" : "toggle_paragraph_toolbar"}
        class="main_only"
        on:focus={becomesActiveDescendant}
        title="Toggle Paragraph"
        aria-label="Toggle Paragraph button."
        on:click={() => editor.chain().focus().setParagraph().run()}
        >
        <i class={`ri-paragraph`}></i>
      </button>
      <button
        data-selected={iA.heading.any ? "true" : "false"}
        id={isBubbleMenu ? "toggle_heading_bubble" : "toggle_heading_toolbar"}
        class="main_only"
        on:focus={becomesActiveDescendant}
        title="Toggle Heading"
        aria-label="Toggle Heading button."
        on:click={(e) => editor.chain().focus().toggleHeading({ level: showSelectedHeading(editor,e,true) }).run()}
        >
        <i class={`ri-${showSelectedHeading(editor)}`}></i>
      </button>
      <button
        data-selected={iA.bold ? "true" : "false"}
        id={isBubbleMenu ? "toggle_bold_bubble" : "toggle_bold_toolbar"}
        class="inline_change hide_xs_mobile"
        on:focus={becomesActiveDescendant}
        title="Toggle Bold"
        aria-label="Toggle Bold button."
        on:click={editor.chain().focus().toggleBold().run()}>
        <i class="ri-bold"></i>
      </button>
      <button
        data-selected={iA.italic ? "true" : "false"}
        id={isBubbleMenu ? "toggle_italic_bubble" : "toggle_italic_toolbar"}
        class="inline_change hide_xs_mobile"
        on:focus={becomesActiveDescendant}
        title="Toggle Italic"
        aria-label="Toggle Italic button."
        on:click={editor.chain().focus().toggleItalic().run()}>
        <i class="ri-italic"></i>
      </button>
      <button
        data-selected={iA.strike ? "true" : "false"}
        id={isBubbleMenu ? "toggle_strike_bubble" : "toggle_strike_toolbar"}
        class="inline_change hide_xs_mobile"
        on:focus={becomesActiveDescendant}
        title="Toggle Strike"
        aria-label="Toggle Strike button."
        on:click={editor.chain().focus().toggleStrike().run()}>
        <i class="ri-strikethrough"></i>
      </button>
      <button
        data-selected={iA.code ? "true" : "false"}
        id={isBubbleMenu ? "toggle_code_formatting_bubble" : "toggle_code_formatting_toolbar"}
        class="main_only inline_change"
        on:focus={becomesActiveDescendant}
        title="Toggle Code"
        aria-label="Toggle Code button."
        on:click={editor.chain().focus().toggleCode().run()}>
        <i class="ri-code-line"></i>
      </button>
      {#if isBubbleMenu !== true}
      <button
        data-selected={iA.hardBreak ? "true" : "false"}
        id={isBubbleMenu ? "create_hard_break_bubble" : "create_hard_break_toolbar"}
        class="main_only"
        on:focus={becomesActiveDescendant}
        title="Create Hard Break"
        aria-label="Create Hard Break button."
        on:click={editor.chain().focus().setHardBreak().run()}>
        <i>{`<br>`}</i>
      </button>
      <button
        data-selected={iA.horizontalRule ? "true" : "false"}
        id={isBubbleMenu ? "create_horizontal_rule_bubble"  : "create_horizontal_rule_toolbar"}
        class="main_only hide_xs_mobile"
        on:focus={becomesActiveDescendant}
        title="Create Horizontal Rule"
        aria-label="Create Horizontal Rule button."
        on:click={editor.chain().focus().setHorizontalRule().run()}>
        <i class="ri-separator"></i>
      </button>
      {/if}
      <button
        data-selected={iA.bulletList ? "true" : "false"}
        id={isBubbleMenu ? "toggle_unordered_list_bubble" : "toggle_unordered_list_toolbar"}
        class="main_only"
        on:focus={becomesActiveDescendant}
        title="Toggle Unordered List"
        aria-label="Toggle Unordered List button."
        on:click={editor.chain().focus().toggleBulletList().run()}>
        <i class="ri-list-unordered"></i>
      </button>
      <button
        data-selected={iA.orderedList ? "true" : "false"}
        id={isBubbleMenu ? "toggle_ordered_list_bubble" : "toggle_ordered_list_toolbar"}
        class="main_only"
        on:focus={becomesActiveDescendant}
        title="Toggle Ordered List"
        aria-label="Toggle Ordered List button."
        on:click={editor.chain().focus().toggleOrderedList().run()}>
        <i class="ri-list-ordered"></i>
      </button>
      <button
        class="toggle_only main_only"
        data-selected={(iA.bulletList || iA.orderedList) ? "true" : "false"}
        id={isBubbleMenu ? "unindent_list_item_bubble" : "unindent_list_item_toolbar"}
        on:focus={becomesActiveDescendant}
        disabled={!iA.listItem}
        title="Unindent List Item"
        aria-label="Remove one level of Indentation button."
        on:click={()=>{
          if (!iA.listItem) editor.chain().focus().run()
          else editor.chain().focus().liftListItem('listItem').run()
        }
        }>
        <i class="ri-indent-decrease"></i>
      </button>
      <button
        class="toggle_only main_only"
        data-selected={(iA.bulletList || iA.orderedList) ? "true" : "false"}
        id={isBubbleMenu ? "indent_list_item_bubble" : "indent_list_item_toolbar"}
        on:focus={becomesActiveDescendant}
        disabled={!iA.listItem}
        title="Indent List Item"
        aria-label="Add one level of Indentation button."
        on:click={()=>{
          if (!iA.listItem) editor.chain().focus().run()
          else editor.chain().focus().sinkListItem('listItem').run()
        }
        }>
        <i class="ri-indent-increase"></i>
      </button>
    <div tabindex="0" on:focus={toolbarOptions.firstChild.focus()}></div>
    </div>
</div>

<style>
  .sr-only {
    position:absolute;
    width:1px;
    height:1px;
    overflow:hidden;
    top:100%;
  }
  .toolbar.bubble_menu {
    width: fit-content;
  }
  .bubble_menu .main_only {
    display: none;
  }
  .bubble_menu .main_only.inline_change {
    /* reset  .bubble_menu .main_only rule */
    display: inherit;
  }

  .toolbar {
    list-style: none;
    display: flex;
    flex-flow: row wrap;
    padding: 0.5rem 16px;
    margin: 0;
    opacity: 0.8;
		display: flex;
    backdrop-filter: blur(8px);
		background-color: #0A0A0A;
		border-radius: 8px;
		transition: visibility 0.1s ease, opacity 0.1s ease;
	}
  .toolbar_options {
    display: flex;
    flex-flow: row wrap;
  }
  .toolbar button:first-child {
    margin-left: 0;
    margin-right: 4px;
    padding-left: 4px;
  }
  .toolbar button + button {
    margin: 0 4px;
  }
  .toolbar button:last-child {
    margin-right: 0;
    padding-right: 4px;
  }

	.toolbar button {
    padding: 8px 8px;
    margin: 0 8px;
		border: none;
		background: none;
		color: #FFF;
		font-weight: 600;
		opacity: 0.7;
		margin: 0;
	}


  button[data-selected="true"],
  button:active[data-selected="true"] {
    background-color: #0A0A0A;
    color: white;
  }
  .toolbar button:hover,
  .toolbar button:focus,
	.toolbar button[data-selected="true"],
	.toolbar button:active[data-selected="true"] {
		opacity: 1;
    text-decoration: underline;
	}
  .toolbar button:hover i,
  .toolbar button:focus i {
    transform: scale(1.2);
    font-weight: 600;
  }

  .toolbar button.toggle_only,
  .toolbar button.toggle_only:focus,
  .toolbar button.toggle_only:active {
    text-decoration: none;
  }
  .toolbar button.toggle_only:disabled i,
  .toolbar button.toggle_only:disabled i {
    transform: unset;
  }
  .toolbar button.toggle_only:disabled {
    opacity: 0.4;
  }

  button {
    display: grid;
    font-size: 0.9rem;
    line-height: 1rem;
  }
  button > * {
    display: flex;
    justify-content: center;
    align-items: center;
    transition: transform 250ms ease-in-out;
  }
  i {
    font-size: 16px;
  }

  @media screen and (max-width:600px) {
    .toolbar .hide_xs_mobile {
      display: none;
    }
    .toolbar.bubble_menu .hide_xs_mobile {
      display: inherit;
    }
    button {
      flex: 1 0 0;
    }
  }
</style>
