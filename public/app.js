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
let celebrationTimer;
let dance;
let celebrations = 0;
function celebrate() {
  celebrations += 1;
  clearTimeout(celebrationTimer);
  if (dance) dance.cancel();
  $('mascot').classList.add('visible');
  $('cheer').textContent = ['MÅÅÅL!', 'SÅDAN!', 'JAAAA!'][(celebrations - 1) % 3];
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const direction = celebrations % 2 ? 1 : -1;
    dance = $('lars').animate([
      { transform: 'translateY(35px) rotate(-9deg) scale(.85)', offset: 0 },
      { transform: `translateY(-30px) rotate(${8 * direction}deg) scale(1.04)`, offset: .2 },
      { transform: 'translateY(0) rotate(-5deg) scale(1.03,.96)', offset: .38 },
      { transform: `translateY(-18px) rotate(${-7 * direction}deg) scale(.99,1.02)`, offset: .57 },
      { transform: 'translateY(0) rotate(5deg)', offset: .75 },
      { transform: 'translateY(0) rotate(0)', offset: 1 }
    ], { duration: 1100, easing: 'ease-in-out' });
    $('score').animate([{transform:'scale(1)'},{transform:'scale(1.035)'},{transform:'scale(1)'}], {duration:240});
  }
  celebrationTimer = setTimeout(() => $('mascot').classList.remove('visible'), 2000);
}
function addGoal() {
  if ($('editor').open) return;
  if (storageAvailable) score = readScore();
  if (score < Number.MAX_SAFE_INTEGER) { saveScore(score + 1); celebrate(); }
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
