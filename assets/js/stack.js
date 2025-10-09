const ICON = (name, variant='original') =>
  `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${name}/${name}-${variant}.svg`;

const STACKS = [
  { label:'VS Code',     src: ICON('vscode','original') },
  { label: 'Python',     src: ICON('python','original') },
  { label: 'NumPy',      src: ICON('numpy','original') },
  { label: 'PyTorch',    src: ICON('pytorch','original') },
  {label: 'Anaconda', src: ICON('anaconda','original')},
  { label: 'Unity',      src: ICON('unity','original') },
  { label: 'HTML5',      src: ICON('html5','original') },
  { label: 'CSS3',       src: ICON('css3','original') },
  { label: 'JavaScript', src: ICON('javascript','original') },
  { label: 'Blender',    src: ICON('blender','original') },
  { label: 'Vercel',     src: ICON('vercel','original') },
  { label:'TensorFlow',     src: ICON('tensorflow','original') },
  { label:'C#',          src: ICON('csharp','original') },
  { label:'UnrealEngine',     src: ICON('unrealengine','original') },
  { label:'Visual Studio', src: ICON('visualstudio','plain') }

];


const grid = document.getElementById('stackGrid');
grid.innerHTML = STACKS.map(s => `
  <div class="stack-item" title="${s.label}">
    <img loading="lazy" src="${s.src}" alt="${s.label}">
    <span>${s.label}</span>
  </div>
`).join('');
