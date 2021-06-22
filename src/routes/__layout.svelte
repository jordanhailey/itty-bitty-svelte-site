<script lang="ts" context="module">
  import type {Load} from "@sveltejs/kit";
  /**
   * @type {import('@sveltejs/kit').Load}
   */
  export const load:Load = async (loading) => {
    const {context} = loading
    return new Promise(async (resolve,_)=>{
      try {
        if (typeof window !== "undefined") {
          if (typeof window == "object" && (Array.isArray(window) || window == null)) null;
          else {
            const {search,hash} = window.location;
            context.inflate={search,hash}
          }
        }
      } catch (err) {
        context.err=err;
      } finally {
        resolve({context});
      }
    })
  }
</script>
<slot/>
