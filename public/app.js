const $ = (id) => document.getElementById(id);
const storageKey = 'll-score-v1';
const validScore = (value) => Number.isSafeInteger(value) && value >= 0 ? value : 0;
let storageAvailable = true;
function readScore() {
  try {
    return validScore(Number(localStorage.getItem(storageKey) ?? localStorage.getItem('ll-demo') ?? 0));
  } catch {
    storageAvailable = false;
    return 0;
  }
}
let score = readScore();
function render() {
  const formatted = score.toLocaleString('da-DK');
  $('score').textContent = formatted;
  // Keep long totals fully visible on the display.
  $('score').style.fontSize = formatted.length > 5 ? `min(${145 / formatted.length}vw, 44vh)` : '';
  $('storage-warning').hidden = storageAvailable;
}
function saveScore(value) {
  score = value;
  try { localStorage.setItem(storageKey, String(score)); storageAvailable = true; }
  catch { storageAvailable = false; }
  render();
}
function addGoal() {
  if ($('editor').open) return;
  if (storageAvailable) score = readScore();
  if (score < Number.MAX_SAFE_INTEGER) saveScore(score + 1);
}
$('goal').addEventListener('click', addGoal);
document.addEventListener('keydown', (event) => {
  if ($('editor').open || event.code !== 'Space' || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.target !== $('goal') && (/INPUT|TEXTAREA|SELECT|BUTTON|A/.test(event.target.tagName) || event.target.isContentEditable)) return;
  event.preventDefault();
  if (!event.repeat) addGoal();
});
$('edit').addEventListener('click', () => {
  if (storageAvailable) score = readScore();
  $('amount').value = score;
  $('editor').showModal();
  $('amount').focus();
  $('amount').select();
});
$('cancel').addEventListener('click', () => $('editor').close());
$('edit-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const value = $('amount').valueAsNumber;
  if (!Number.isSafeInteger(value) || value < 0) return;
  saveScore(value);
  $('editor').close();
});
window.addEventListener('storage', (event) => {
  if (event.key === storageKey || event.key === null) { score = readScore(); render(); }
});
render();
