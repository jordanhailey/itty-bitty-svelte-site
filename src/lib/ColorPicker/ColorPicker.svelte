<script>
import { tick } from "svelte";

  import {ColorConstructor} from "./utils";
  let color = new ColorConstructor({hex:"#FFF"});
  let opacity = color.hsl[3];
  let {rgb,hsl} = color
  let [rgbRInput, rgbGInput, rgbBInput] = rgb;
  let [hslHInput, hslSInput, hslLInput] = hsl;
  let hex = color.hex;

  function updateColor (type) {
    if (type == "rgb") color.update({rgb:[rgbRInput, rgbGInput, rgbBInput, opacity]})
    else if (type == "hsl") color.update({hsl:[hslHInput, hslSInput, hslLInput, opacity]})
    else color.update({hex:hex})
    color = color
    rgb = color.rgb;
    hsl = color.hsl;
    [rgbRInput, rgbGInput, rgbBInput] = rgb;
    [hslHInput, hslSInput, hslLInput] = hsl;
    hex = color.hex;
  }

</script>
<!-- <pre>{JSON.stringify({rgb:[rgbRInput, rgbGInput, rgbBInput, opacity],hsl:[hslHInput, hslSInput, hslLInput, opacity],hex},null,2)}</pre> -->
<form on:submit|preventDefault="">
  <fieldset>
    <label>R:{rgbRInput}
      <input type="range" min="0" max="255" step="1" bind:value={rgbRInput} on:change={()=>{updateColor("rgb")}} />
    </label>
    <label>G:{rgbGInput}
      <input type="range" min="0" max="255" step="1" bind:value={rgbGInput} on:change={()=>{updateColor("rgb")}}  />
    </label>
    <label>B:{rgbBInput}
      <input type="range" min="0" max="255" step="1" bind:value={rgbBInput} on:change={()=>{updateColor("rgb")}}  />
    </label>
    <label>A:{opacity}
      <input type="range" min="0" max="1" step="0.01" bind:value={opacity} on:change={()=>{updateColor("rgb")}}  />
    </label>
  </fieldset>
  <fieldset>
    <label>H:{hslHInput}
      <input type="range" min="0" max="360" step="1" bind:value={hslHInput} on:change={()=>{updateColor("hsl")}}  />
    </label>
    <label>S:{hslSInput}
      <input type="range" min="0" max="100" step="0.1" bind:value={hslSInput} on:change={()=>{updateColor("hsl")}}  />
    </label>
    <label>L:{hslLInput}
      <input type="range" min="0" max="100" step="0.1" bind:value={hslLInput} on:change={()=>{updateColor("hsl")}}  />
    </label>
    <label>A:{opacity}
      <input type="range" min="0" max="1" step="0.01" bind:value={opacity} on:change={()=>{updateColor("hsl")}}  />
    </label>
  </fieldset>
  <fieldset>
    <label>HEX: #
      <input type="text" bind:value={hex} on:change={()=>{updateColor("hex")}}  />
    </label>
  </fieldset>
</form>
