import katex from 'katex';

/** Fail the build on invalid TeX; never publish a red error or raw formula. */
export function renderMath(tex, displayMode = false) {
  return katex.renderToString(tex, {
    displayMode,
    output: 'htmlAndMathml',
    throwOnError: true,
    strict: 'error',
    trust: false,
  });
}

/** The labs use only authored TeX and validated numeric / lowercase input. */
export function inlineMath(tex) {
  return `<span class="t-math-inline">${renderMath(tex)}</span>`;
}
