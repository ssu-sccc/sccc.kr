import {experimentFrames} from '../../lib/tutorial/dp.mjs';
import {player} from './player';
document.querySelectorAll<HTMLElement>('[data-dp-lab]').forEach(root=>{
  const kind=root.dataset.dpLab!;
  let frames=experimentFrames(kind);
  const option=root.querySelector<HTMLSelectElement>('[data-dp-option]');
  const state=root.querySelector<HTMLSelectElement>('[data-dp-state]');
  const view=root.querySelector<HTMLElement>('[data-dp-view]')!;
  const status=root.querySelector<HTMLElement>('[data-dp-status]')!;
  const control=player(root,()=>frames.length,step=>{
    view.innerHTML=frames[step].html;
    status.textContent=frames[step].status;
    if(state)state.value=String(step);
  });
  option?.addEventListener('change',()=>{frames=experimentFrames(kind,option.value);control.reset();});
  state?.addEventListener('change',()=>{
    const range=root.querySelector<HTMLInputElement>('[data-progress]')!;
    range.value=state.value;range.dispatchEvent(new Event('input',{bubbles:true}));
  });
  control.draw();
});
