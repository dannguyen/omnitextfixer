const $ = (selector) => document.querySelector(selector);

const urlInput = $('#url-input');
const formatInput = $('#format-input');
const errorToast = $('#error-toast');
let toastTimer;

function showError(message) {
  errorToast.textContent = message;
  errorToast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => errorToast.classList.remove('show'), 2800);
}

function showResult(wrapper, output, value) {
  output.textContent = value;
  wrapper.classList.remove('hidden');
}

$('#encode-btn').addEventListener('click', () => {
  if (!urlInput.value) return showError('Add some text to encode first.');
  showResult($('#url-result-wrap'), $('#url-result'), encodeURIComponent(urlInput.value));
});
$('#decode-btn').addEventListener('click', () => {
  if (!urlInput.value) return showError('Add an encoded URL to decode first.');
  try { showResult($('#url-result-wrap'), $('#url-result'), decodeURIComponent(urlInput.value)); }
  catch { showError('That text contains an invalid URL encoding.'); }
});

function clearField(input, wrapper) { input.value = ''; wrapper.classList.add('hidden'); input.focus(); }
$('#clear-url').addEventListener('click', () => clearField(urlInput, $('#url-result-wrap')));
$('#clear-format').addEventListener('click', () => clearField(formatInput, $('#format-result-wrap')));

function indentUnit() { const selected = $('#indent-select').value; return selected === 'tab' ? '\t' : ' '.repeat(Number(selected)); }
function prettyHtml(source) {
  let formatted = source.replace(/>\s*</g, '><').replace(/></g, '>\n<');
  const lines = formatted.split('\n'); let depth = 0;
  return lines.map((line) => {
    const trimmed = line.trim();
    if (/^<\/(?!html)/.test(trimmed) || /^<\//.test(trimmed)) depth = Math.max(depth - 1, 0);
    const result = indentUnit().repeat(depth) + trimmed;
    if (/^<([a-zA-Z][^/>]*[^/])>$/.test(trimmed) && !/^<(input|meta|link|img|br|hr)\b/i.test(trimmed) && !/^<!/.test(trimmed)) depth += 1;
    return result;
  }).join('\n');
}

function formatCode() {
  const raw = formatInput.value.trim(); if (!raw) return showError('Paste some code to prettify first.');
  const type = $('#format-select').value; let pretty;
  try {
    if (type === 'json') pretty = JSON.stringify(JSON.parse(raw), null, indentUnit());
    else pretty = prettyHtml(raw);
  } catch { return showError(`That ${type.toUpperCase()} is not valid enough to format.`); }
  const code = $('#format-result code');
  const grammar = type === 'json' ? Prism.languages.json : Prism.languages.markup;
  code.innerHTML = Prism.highlight(pretty, grammar, type);
  $('#format-result-wrap').classList.remove('hidden');
}
$('#format-btn').addEventListener('click', formatCode);
formatInput.addEventListener('keydown', (event) => { if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') formatCode(); });

document.querySelectorAll('.copy-button').forEach((button) => button.addEventListener('click', async () => {
  const target = $('#' + button.dataset.copyTarget);
  const value = target.tagName === 'PRE' ? target.textContent : target.textContent;
  try { await navigator.clipboard.writeText(value); button.textContent = 'Copied!'; setTimeout(() => button.textContent = 'Copy', 1200); }
  catch { showError('Copy is unavailable in this browser.'); }
}));
