'use strict';
const proteinChunkCache=new Map();
async function loadProteinValues(key){
 if(!Number.isInteger(key)||key<0)throw Error('Invalid protein identifier.');
 const chunk=Math.floor(key/128);
 if(!proteinChunkCache.has(chunk)){
  const promise=(async()=>{
   const r=await fetch('data/proteins/chunk'+String(chunk).padStart(3,'0')+'.bin');
   if(!r.ok)throw Error('Could not load protein measurements. Check that the data folder was uploaded.');
   const bytes=new Uint8Array(await r.arrayBuffer());let decoded;
   if(bytes[0]===31&&bytes[1]===139){
    if(typeof DecompressionStream==='undefined')throw Error('Please use a current Chrome, Safari, Firefox, or Edge browser for compressed protein data.');
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    decoded=await new Response(stream).text();
   }else decoded=new TextDecoder().decode(bytes);
   return JSON.parse(decoded);
  })();
  proteinChunkCache.set(chunk,promise);
  promise.catch(()=>proteinChunkCache.delete(chunk));
  if(proteinChunkCache.size>8)proteinChunkCache.delete(proteinChunkCache.keys().next().value);
 }
 const block=await proteinChunkCache.get(chunk),values=block[String(key)];
 if(!Array.isArray(values))throw Error('Protein measurements are unavailable.');
 return values;
}
