const $ = (id) => document.getElementById(id);
const demo = ['localhost', '127.0.0.1'].includes(location.hostname);
const read = (key) => { try { return Math.max(0, Number(localStorage.getItem(key)) || 0); } catch { return 0; } };
const save = (key, value) => { try { localStorage.setItem(key, String(value)); } catch { /* Storage can be disabled. */ } };
let personal = read('ll-personal');
let score = 0;
let busy = false;
let pendingId = null;
let connected = false;
$('personal').textContent = personal.toLocaleString('da-DK');
function render(value) {
  score = value;
  $('score').textContent = score.toLocaleString('da-DK');
  const target = (Math.floor(score / 1000) + 1) * 1000;
  $('milestone').textContent = `${target.toLocaleString('da-DK')} mål`;
  $('remaining').textContent = `${(target - score).toLocaleString('da-DK')} mål til næste fælles jubelbrøl`;
  $('progress').style.width = `${score / target * 100}%`;
  const track = document.querySelector('[role="progressbar"]');
  track.setAttribute('aria-valuemax', target);
  track.setAttribute('aria-valuenow', score);
}
async function request(method = 'GET', id) {
  const response = await fetch('/api/score', { method, cache: 'no-store', headers: id ? { 'Idempotency-Key': id } : {} });
  if (!response.ok) throw new Error('Offline');
  const result = await response.json();
  if (!Number.isSafeInteger(result.score) || result.score < 0) throw new Error('Invalid score');
  return result.score;
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
async function addGoal() {
  if (busy || !connected) return;
  busy = true;
  $('goal').disabled = true;
  pendingId ||= crypto.randomUUID();
  try {
    const next = demo ? read('ll-demo') + 1 : await request('POST', pendingId);
    if (demo) save('ll-demo', next);
    pendingId = null;
    render(Math.max(score, next));
    personal += 1;
    save('ll-personal', personal);
    $('personal').textContent = personal.toLocaleString('da-DK');
    $('feedback').textContent = ['JAAAA! Det mål er med i fællesskabet.', 'SÅDAN! Ét mål mere til hele ligaen.', 'MÅÅÅL! Sammen løfter vi rekorden.'][personal % 3];
    celebrate();
  } catch {
    $('feedback').textContent = 'Ingen forbindelse. Tryk igen for at prøve samme mål.';
  } finally {
    busy = false;
    $('goal').disabled = false;
  }
}
$('goal').addEventListener('click', addGoal);
document.addEventListener('keydown', (event) => {
  if (event.code !== 'Space' || event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT|BUTTON|A/.test(event.target.tagName) || event.target.isContentEditable) return;
  event.preventDefault();
  if (!event.repeat) addGoal();
});
async function sync() {
  if (busy || document.hidden) return;
  try {
    render(demo ? read('ll-demo') : Math.max(score, await request()));
    connected = true;
    $('connection').textContent = demo ? 'Lokal demo' : '● Fælles tæller';
    $('goal').disabled = false;
  } catch {
    $('connection').textContent = 'Ingen forbindelse';
    if (!connected) $('feedback').textContent = 'Den fælles tæller er ikke tilgængelig. Vi prøver igen om lidt.';
  }
}
$('demo-note').hidden = !demo;
sync();
setInterval(sync, 5000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) sync(); });
