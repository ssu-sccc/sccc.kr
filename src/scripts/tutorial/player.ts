export function player(root: HTMLElement, length: () => number, render: (step: number) => void) {
  let step = 0, timer: ReturnType<typeof setInterval> | undefined;
  const get = <T extends HTMLElement>(s: string) => root.querySelector<T>(s)!;
  const stop = () => { if (timer) clearInterval(timer); timer = undefined; get('[data-play]').textContent = '재생'; };
  const draw = () => {
    get<HTMLInputElement>('[data-progress]').max = String(length() - 1);
    get<HTMLInputElement>('[data-progress]').value = String(step);
    get('[data-step]').textContent = `${step + 1} / ${length()}`;
    get<HTMLButtonElement>('[data-prev]').disabled = step === 0;
    get<HTMLButtonElement>('[data-next]').disabled = step === length() - 1;
    render(step);
  };
  const move = (n: number) => { step = Math.max(0, Math.min(length() - 1, n)); draw(); };
  get('[data-reset]').onclick = () => { stop(); move(0); };
  get('[data-prev]').onclick = () => { stop(); move(step - 1); };
  get('[data-next]').onclick = () => { stop(); move(step + 1); };
  get<HTMLInputElement>('[data-progress]').oninput = e => { stop(); move(Number((e.target as HTMLInputElement).value)); };
  get('[data-play]').onclick = () => {
    if (timer) return stop();
    if (step === length() - 1) move(0);
    get('[data-play]').textContent = '일시정지';
    timer = setInterval(() => { move(step + 1); if (step === length() - 1) stop(); }, 1250);
  };
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('pagehide', stop);
  return { reset: () => { stop(); move(0); }, draw };
}
