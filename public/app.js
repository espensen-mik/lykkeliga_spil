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
let personal = 0;
function updateStorageStatus() {
  $('connection').textContent = storageAvailable ? 'Gemt i denne browser' : 'Gemmes ikke';
  $('demo-note').textContent = storageAvailable
    ? 'Målene gemmes i denne browser på denne computer. Brug samme browser og adresse næste gang. Rydder du browserdata, forsvinder tælleren.'
    : 'Browseren tillader ikke lokal lagring. Du kan tælle mål, men de forsvinder, når siden lukkes eller genindlæses.';
}
function render() {
  $('score').textContent = score.toLocaleString('da-DK');
  const target = (Math.floor(score / 1000) + 1) * 1000;
  $('milestone').textContent = `${target.toLocaleString('da-DK')} mål`;
  $('remaining').textContent = `${(target - score).toLocaleString('da-DK')} mål til næste jubelbrøl`;
  $('progress').style.width = `${score / target * 100}%`;
  const track = document.querySelector('[role="progressbar"]');
  track.setAttribute('aria-valuemax', target);
  track.setAttribute('aria-valuenow', score);
}
function celebrate() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  $('score').classList.remove('pop');
  void $('score').offsetWidth;
  $('score').classList.add('pop');
  for (let i = 0; i < 24; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti';
    piece.style.cssText = `--x:${(Math.random() - .5) * 650}px;--y:${(Math.random() - .65) * 600}px;--r:${Math.random() * 720}deg;background:${['#ef492d', '#e7ef9a', '#203a32'][i % 3]}`;
    $('celebration').append(piece);
    setTimeout(() => piece.remove(), 1000);
  }
}
function addGoal() {
  if (score >= Number.MAX_SAFE_INTEGER) return;
  // Read the latest saved value if another tab has counted a goal.
  if (storageAvailable) score = Math.max(score, readScore());
  score += 1;
  try { localStorage.setItem(storageKey, String(score)); }
  catch { storageAvailable = false; }
  personal += 1;
  render();
  updateStorageStatus();
  $('personal').textContent = personal.toLocaleString('da-DK');
  $('feedback').textContent = ['JAAAA! Endnu et mål til holdet.', 'SÅDAN! Ét mål tættere på rekorden.', 'MÅÅÅL! Sammen løfter vi tallet.'][personal % 3];
  celebrate();
}
$('goal').addEventListener('click', addGoal);
document.addEventListener('keydown', (event) => {
  if (event.code !== 'Space' || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.target !== $('goal') && (/INPUT|TEXTAREA|SELECT|BUTTON|A/.test(event.target.tagName) || event.target.isContentEditable)) return;
  event.preventDefault();
  if (!event.repeat) addGoal();
});
window.addEventListener('storage', (event) => {
  if (event.key === storageKey || event.key === null) {
    score = readScore();
    render();
    updateStorageStatus();
  }
});
$('demo-note').hidden = false;
$('goal').disabled = false;
render();
updateStorageStatus();
