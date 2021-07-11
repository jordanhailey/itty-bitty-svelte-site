import { derived, writable } from "svelte/store";
import type { Writable, Readable, Updater } from "svelte/store";
const {subscribe,update} = writable(new Map());

update(mapObj=>{
  mapObj.set("title","")
  mapObj.set("lzmaB64","")
  mapObj.set("editable",[true,null])
  return mapObj
})

class fragmentUpdateError extends Error {}

export const fragment = {
  subscribe,
  updateTitle:(title:string) => (update(mapObj=>{mapObj.set("title",title);return mapObj;})),
  updateCompressed:(lzmaB64:string) => (update(mapObj=>{mapObj.set("lzmaB64",lzmaB64);return mapObj;})),
  updateEditable:(editable:boolean, pass:string) => {
    let errs = [];
    if (typeof pass == "object" && pass !== null) errs.push(new fragmentUpdateError("Unable to set object as password: "+JSON.stringify({pass})))
    else if (pass === "") errs.push(new fragmentUpdateError("Unable to set empty password: "+JSON.stringify({pass})))
    else if (pass === undefined) pass = null;
    else pass = `${pass}`;
    if (errs.length>0) throw errs;
    return update(mapObj=>{mapObj.set("editable",[Boolean(editable),pass]);return mapObj;})
  },
}

export const getFormattedFragment = (store)=>{
  return derived(store,(fS:fMap)=>{
      const title = fS.get("title");
      const lzmaB64 = fS.get("lzmaB64");
      const editable = fS.get("editable");
      return `${editable?.[0] ? "" : editable?.[1] ? editable[1]+"|" : "" }${title}${lzmaB64 ? "/?"+lzmaB64 : ""}`
  })
}
export const formattedFragment = getFormattedFragment(fragment)


type fMap = Map<string,string|string[]>
interface CustomDerivedStore extends Readable<string|string[]> {
  set?:Writable<string>["set"]
  update?:Updater<string>
}

const initFragmentTitle = (store):CustomDerivedStore => {
  const drvd:CustomDerivedStore = derived(store,((fS:fMap)=>(fS.get("title"))));
  drvd.set = (str:string)=>(store.updateTitle(str)),
  drvd.update = (str:string)=>(store.updateTitle(str))
  return drvd;
}

export const fragmentTitle = initFragmentTitle(fragment);

const initFragmentLZMAB6 = (store):CustomDerivedStore => {
  const drvd:CustomDerivedStore = derived(store,((fS:fMap)=>(fS.get("lzmaB64"))));
  drvd.set = (str:string)=>(store.updateCompressed(str)),
  drvd.update = (str:string)=>(store.updateCompressed(str))
  return drvd;
}

export const fragmentLZMAB64 = initFragmentLZMAB6(fragment)


export const changeFragment = (...args:Record<string,string|string[]>[]) => {
  if (args[0] === null) {
    return update((mapObj)=>{
      mapObj.set("title","");
      mapObj.set("lzmaB64","");
      mapObj.set("editable",[true,null]);
      return mapObj
    })
  }
  const changes = {title:null,lzmaB64:null,editable:null};
  args.map(arg=>{
    let {title,lzmaB64,editable} = arg;
    let key,newVal;
    if (typeof title === "string") {
      key = "title"
      newVal = title || ""
      // title change
    } else if (typeof lzmaB64 === "string") {
      key = "lzmaB64"
      newVal = lzmaB64 || "";
      // compression change
    } else if (typeof editable === "string") {
      key = "editable"
      newVal = editable || [true,null];
      // editable change
    }
    changes[key] = newVal
  })
  update((mapObj)=>{
    if (changes.title !== null) mapObj.set("title", changes.title);
    if (changes.lzmaB64 !== null) mapObj.set("lzmaB64", changes.lzmaB64);
    if (changes.editable !== null) mapObj.set("editable", changes.editable);
    return mapObj
  })
}
