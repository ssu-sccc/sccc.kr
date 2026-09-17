import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {experimentOptions,experimentFrames} from '../src/lib/tutorial/dp.mjs';

// Execute the actual browser controller and shared player, with a small DOM/timer harness.
// This tests control behavior without adding a browser dependency to the project.
const require=createRequire(import.meta.url);
const astroRequire=createRequire(require.resolve('astro/package.json'));
const viteRequire=createRequire(astroRequire.resolve('vite'));
const {build}=viteRequire('esbuild');
const bundle=await build({entryPoints:['src/scripts/tutorial/dp.ts'],bundle:true,write:false,format:'iife',platform:'browser'});

class Element {
  value='0';textContent='';innerHTML='';disabled=false;listeners={};
  addEventListener(type,fn){(this.listeners[type]??=[]).push(fn);}
  dispatchEvent(event){event.target=this;this[`on${event.type}`]?.(event);for(const fn of this.listeners[event.type]??[])fn(event);return true;}
  click(){if(!this.disabled)this.dispatchEvent({type:'click'});}
}
function root(kind){
  const elements=Object.fromEntries(['reset','prev','next','play','progress','step','dp-view','dp-status'].map(k=>[`[data-${k}]`,new Element()]));
  if(experimentOptions[kind].length>1)elements['[data-dp-option]']=new Element();
  if(kind==='tsp')elements['[data-dp-state]']=new Element();
  return {dataset:{dpLab:kind},elements,querySelector:selector=>elements[selector]??null};
}
test('All controls drive the actual frames: next/previous/range/reset/play/pause/options/state picker',()=>{
  const roots=Object.keys(experimentOptions).map(root),timers=new Map(),events={};let timerId=0;
  const document={hidden:false,querySelectorAll:()=>roots,addEventListener:(type,fn)=>(events[type]??=[]).push(fn)};
  const window={addEventListener:()=>{}};
  vm.runInNewContext(bundle.outputFiles[0].text,{document,window,Event:class {constructor(type){this.type=type;}},setInterval:fn=>{timers.set(++timerId,fn);return timerId;},clearInterval:id=>timers.delete(id)});
  for(const r of roots){
    const e=name=>r.elements[`[data-${name}]`],frames=experimentFrames(r.dataset.dpLab),length=frames.length;
    assert.equal(e('dp-view').innerHTML,frames[0].html);
    assert.equal(e('prev').disabled,true);
    e('next').click();assert.equal(e('dp-view').innerHTML,frames[1].html);
    e('prev').click();assert.equal(e('progress').value,'0');
    e('progress').value=String(length-1);e('progress').dispatchEvent({type:'input'});
    assert.equal(e('next').disabled,true);assert.equal(e('dp-status').textContent,frames.at(-1).status);
    e('play').click();assert.equal(e('progress').value,'0');assert.equal(e('play').textContent,'일시정지');
    for(const fn of [...timers.values()])fn();assert.equal(e('progress').value,'1');
    e('play').click();assert.equal(timers.size,0);
    e('play').click();for(let i=0;i<length;i++)for(const fn of [...timers.values()])fn();
    assert.equal(e('next').disabled,true);assert.equal(timers.size,0);
    e('reset').click();assert.equal(e('progress').value,'0');
    if(e('dp-option'))for(const [option] of experimentOptions[r.dataset.dpLab]){
      e('dp-option').value=option;e('dp-option').dispatchEvent({type:'change'});
      const expected=experimentFrames(r.dataset.dpLab,option);
      assert.equal(e('progress').max,String(expected.length-1));assert.equal(e('dp-view').innerHTML,expected[0].html);
      e('next').click();assert.equal(e('dp-view').innerHTML,expected[1].html);
    }
    if(e('dp-state')){
      const step=frames.findIndex(f=>f.state.mask===5&&f.state.v===2);
      e('dp-state').value=String(step);e('dp-state').dispatchEvent({type:'change'});
      assert.equal(e('dp-view').innerHTML,frames[step].html);
      e('next').click();assert.equal(e('dp-state').value,String(step+1));
    }
    e('play').click();document.hidden=true;for(const fn of events.visibilitychange)fn();
    assert.equal(timers.size,0);document.hidden=false;
  }
});
