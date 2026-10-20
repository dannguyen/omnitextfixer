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

function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function compareText() {
  const original = $('#diff-original').value;
  const changed = $('#diff-changed').value;
  if (!original && !changed) return showError('Add text to both sides before comparing.');
  const parts = Diff.diffLines(original, changed);
  let originalLine = 1;
  let changedLine = 1;
  const output = parts.map((part) => {
    const prefix = part.added ? '+' : part.removed ? '−' : ' ';
    const className = part.added ? 'diff-added' : part.removed ? 'diff-removed' : 'diff-unchanged';
    return part.value.split('\n').map((line, index, lines) => {
      if (index === lines.length - 1 && line === '') return '';
      const oldNumber = part.added ? '' : originalLine++;
      const newNumber = part.removed ? '' : changedLine++;
      return `<span class="${className} diff-line"><span class="diff-gutter">${String(oldNumber).padStart(4, ' ')} | ${String(newNumber).padStart(4, ' ')}</span>${prefix} ${escapeHtml(line)}</span>`;
    }).filter(Boolean).join('');
  }).join('');
  $('#diff-result').innerHTML = output;
  $('#diff-result-wrap').classList.remove('hidden');
}
$('#compare-btn').addEventListener('click', compareText);
$('#clear-diff').addEventListener('click', () => {
  $('#diff-original').value = '';
  $('#diff-changed').value = '';
  $('#diff-result-wrap').classList.add('hidden');
  $('#diff-original').focus();
});

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

let selectedMark = '';
document.querySelectorAll('.mark-button').forEach((button) => button.addEventListener('click', () => {
  selectedMark = button.dataset.mark;
  $('#selected-mark').textContent = selectedMark;
  $('#mark-preview').classList.remove('hidden');
  document.querySelectorAll('.mark-button').forEach((markButton) => markButton.classList.toggle('selected', markButton === button));
}));
$('#copy-mark').addEventListener('click', async () => {
  if (!selectedMark) return;
  try {
    await navigator.clipboard.writeText(selectedMark);
    $('#copy-mark').textContent = 'Copied!';
    setTimeout(() => $('#copy-mark').textContent = 'Copy', 1200);
  } catch { showError('Copy is unavailable in this browser.'); }
});
