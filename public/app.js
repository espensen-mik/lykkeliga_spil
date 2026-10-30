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
let animations = [];
let sceneBag = [];
let lastScene = -1;
const scenes = [
  { name: 'jubelhop', image: 1, duration: 1250, poses: [
    [0, 'translateY(18px) scale(.94,1.04)'], [.12, 'translateY(24px) scale(1.08,.88)'],
    [.38, 'translateY(-52px) rotate(-5deg) scale(.97,1.04)'], [.63, 'translateY(5px) rotate(2deg) scale(1.07,.91)'],
    [.78, 'translateY(-10px) rotate(-1deg) scale(.99,1.02)'], [1, 'none']] },
  { name: 'sejrspump', image: 3, duration: 1150, poses: [
    [0, 'translateY(22px) rotate(-8deg) scale(.92)'], [.22, 'translateY(-12px) rotate(5deg) scale(1.07)'],
    [.42, 'translateY(2px) rotate(-3deg) scale(.99)'], [.6, 'translateY(-8px) rotate(3deg) scale(1.035)'],
    [.8, 'rotate(-1deg)'], [1, 'none']] },
  { name: 'glaedesdans', image: 2, duration: 1450, poses: [
    [0, 'translateX(-20px) rotate(-6deg) scale(.94)'], [.2, 'translateX(13px) rotate(7deg) scale(1.03)'],
    [.4, 'translateX(-12px) rotate(-6deg)'], [.59, 'translateX(8px) rotate(4deg)'],
    [.77, 'translateX(-4px) rotate(-2deg)'], [1, 'none']] },
  { name: 'klapsalve', image: 4, duration: 1250, poses: [
    [0, 'translateY(20px) scale(.9)'], [.22, 'translateY(-6px) scale(1.045)'],
    [.38, 'scale(.98,1.015) rotate(-2deg)'], [.52, 'scale(1.035,.98) rotate(2deg)'],
    [.67, 'scale(.99,1.01) rotate(-1deg)'], [.81, 'scale(1.015,.99)'], [1, 'none']] },
  { name: 'kaempekram', image: 5, duration: 1400, poses: [
    [0, 'translateY(25px) scale(.78) rotate(-4deg)'], [.34, 'translateY(-8px) scale(1.1) rotate(2deg)'],
    [.56, 'translateY(2px) scale(.975) rotate(-1deg)'], [.76, 'scale(1.025)'], [1, 'none']] }
 ];
// The new poses share the established soft motion patterns.
[
  ['sejrstegn', 6, 1], ['stjerneskud', 7, 0], ['hjertehaender', 8, 4],
  ['knaejubel', 9, 0], ['sejrsdans', 10, 2]
].forEach(([name, image, motion]) => scenes.push({ ...scenes[motion], name, image }));
// Load each original illustration once so scene changes stay immediate.
const mascotImages = scenes.map((scene) => {
  const image = new Image();
  image.src = `/mascots/lykkelars-${scene.image}.png`;
  return image;
});
function nextScene() {
  if (!sceneBag.length) {
    sceneBag = scenes.map((_, index) => index);
    for (let i = sceneBag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [sceneBag[i], sceneBag[j]] = [sceneBag[j], sceneBag[i]];
    }
    if (sceneBag[sceneBag.length - 1] === lastScene) [sceneBag[0], sceneBag[sceneBag.length - 1]] = [sceneBag[sceneBag.length - 1], sceneBag[0]];
  }
  lastScene = sceneBag.pop();
  return scenes[lastScene];
}
function celebrate() {
  const scene = nextScene();
  clearTimeout(celebrationTimer);
  animations.forEach((animation) => animation.cancel());
  animations = [];
  $('mascot').classList.add('visible');
  $('mascot').dataset.scene = scene.name;
  $('pose').src = mascotImages[lastScene].src;
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    animations.push($('lars').animate(scene.poses.map(([offset, transform]) => ({ offset, transform, easing: 'cubic-bezier(.22,.7,.25,1)' })), { duration: scene.duration, fill: 'both' }));
    animations.push($('score').animate([{transform:'scale(1)'},{transform:'scale(1.025)',offset:.35},{transform:'scale(1)'}], {duration:360,easing:'ease-out'}));
  }
  celebrationTimer = setTimeout(() => $('mascot').classList.remove('visible'), 2600);
}
let milestoneParticles = [];
let lastSmallEffect = null;
function clearMilestone() {
  milestoneParticles.forEach(({ element, animation }) => { animation.cancel(); element.remove(); });
  milestoneParticles = [];
  $('milestone-effects').removeAttribute('data-effect');
}
function celebrateMilestone(total) {
  if (total <= 0 || total % 10 !== 0) return;
  clearMilestone();
  const choices = ['stars', 'confetti', 'streamers', 'hearts'].filter((effect) => effect !== lastSmallEffect);
  const effect = total % 100 === 0 ? 'fireworks' : choices[Math.floor(Math.random() * choices.length)];
  if (effect !== 'fireworks') lastSmallEffect = effect;
  const layer = $('milestone-effects');
  layer.dataset.effect = effect;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#ef492d', '#e8b449', '#009b8d', '#203a32'];
  const count = { stars: 16, confetti: 42, streamers: 24, hearts: 28, fireworks: 64 }[effect];
  for (let i = 0; i < count; i++) {
    const element = document.createElement('span');
    element.className = `milestone-particle ${effect}`;
    element.style.color = colors[i % colors.length];
    element.style.backgroundColor = ['confetti', 'streamers'].includes(effect) ? colors[i % colors.length] : 'transparent';
    element.textContent = effect === 'stars' ? '✦' : effect === 'hearts' ? '♥' : '';
    let frames;
    let duration = 1400;
    let delay = i * 12;
    if (effect === 'confetti' || effect === 'streamers') {
      element.style.left = `${10 + Math.random() * 80}%`;
      element.style.top = '-24px';
      const drift = (Math.random() - .5) * 230;
      const spin = (Math.random() - .5) * 900;
      frames = [
        { transform: 'translate(0,-20px) rotate(0)', opacity: 0 },
        { opacity: 1, offset: .1 },
        { transform: `translate(${drift}px,75vh) rotate(${spin}deg)`, opacity: 0 }
      ];
      duration = effect === 'streamers' ? 2300 : 1900;
    } else if (effect === 'hearts') {
      element.style.left = `${12 + Math.random() * 76}%`;
      element.style.bottom = '8%';
      frames = [
        { transform: 'translateY(20px) scale(.5)', opacity: 0 },
        { opacity: .85, offset: .15 },
        { transform: `translate(${(Math.random() - .5) * 130}px,-60vh) rotate(${(Math.random() - .5) * 40}deg) scale(1.1)`, opacity: 0 }
      ];
      duration = 2100;
    } else {
      const burst = Math.floor(i / 16);
      element.style.left = effect === 'fireworks' ? `${[22, 78, 35, 65][burst]}%` : '50%';
      element.style.top = effect === 'fireworks' ? `${[30, 34, 65, 60][burst]}%` : '45%';
      const angle = (i % 16) / 16 * Math.PI * 2;
      const radius = effect === 'fireworks' ? 90 + Math.random() * 60 : 110 + Math.random() * 100;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      frames = [
        { transform: 'translate(-50%,-50%) scale(.15)', opacity: 0 },
        { opacity: 1, offset: .1 },
        { transform: `translate(calc(-50% + ${x}px),calc(-50% + ${y}px)) rotate(100deg) scale(1)`, opacity: .9, offset: .6 },
        { transform: `translate(calc(-50% + ${x * 1.15}px),calc(-50% + ${y + 45}px)) rotate(140deg) scale(.5)`, opacity: 0 }
      ];
      if (effect === 'fireworks') { element.style.backgroundColor = colors[i % colors.length]; delay = burst * 210; }
    }
    layer.append(element);
    const animation = element.animate(frames, { duration, delay, easing: 'cubic-bezier(.16,.65,.35,1)', fill: 'both' });
    const particle = { element, animation };
    milestoneParticles.push(particle);
    animation.finished.then(() => {
      element.remove();
      milestoneParticles = milestoneParticles.filter((item) => item !== particle);
    }).catch(() => {});
  }
}

function addGoal() {
  if ($('editor').open) return;
  if (storageAvailable) score = readScore();
  if (score < Number.MAX_SAFE_INTEGER) { saveScore(score + 1); celebrate(); celebrateMilestone(score); }
}
$('goal').addEventListener('click', addGoal);
document.addEventListener('keydown', (event) => {
  if ($('editor').open || event.code !== 'Space' || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.target !== $('goal') && (/INPUT|TEXTAREA|SELECT|BUTTON|A/.test(event.target.tagName) || event.target.isContentEditable)) return;
  event.preventDefault();
  if (!event.repeat) addGoal();
});
$('edit').addEventListener('click', () => {
  clearMilestone();
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
