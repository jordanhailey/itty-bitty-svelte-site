<script lang="ts" context="module">
  import type {Load} from "@sveltejs/kit";
  export const load:Load = async({context}) => {
    const output = {props:{state:{inflate:undefined,editors:undefined}}}
    try {
      if (context.err) throw context.err
      output.props.state.inflate = context.inflate
    } catch (err) {
      console.error(err);
    } finally {
      return output;
    }
  };
</script>
<script lang="ts">
  import App from "$lib/App/App.svelte";
  export let state = {};
</script>
<App {state}/>
