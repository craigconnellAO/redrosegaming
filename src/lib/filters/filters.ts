import { Filter, FilterContext } from './types';

export const dogFilter: Filter = {
  id: 'dog',
  name: 'Puppy Dog',
  description: 'Dog nose and ears that follow your face',
  emoji: '🐕',
  draw: (ctx: FilterContext) => {
    if (!ctx.face) return;

    const face = ctx.face;
    const leftEar = face.landmarks.leftEar;
    const rightEar = face.landmarks.rightEar;
    const nose = face.landmarks.nose;

    // Brown dog ears
    ctx.ctx.fillStyle = '#8B4513';
    ctx.ctx.beginPath();
    ctx.ctx.ellipse(leftEar.x, leftEar.y, 25, 45, -0.3, 0, Math.PI * 2);
    ctx.ctx.fill();
    ctx.ctx.beginPath();
    ctx.ctx.ellipse(rightEar.x, rightEar.y, 25, 45, 0.3, 0, Math.PI * 2);
    ctx.ctx.fill();

    // Inner ear pink
    ctx.ctx.fillStyle = '#FFB6C1';
    ctx.ctx.beginPath();
    ctx.ctx.ellipse(leftEar.x, leftEar.y - 10, 12, 25, -0.3, 0, Math.PI * 2);
    ctx.ctx.fill();
    ctx.ctx.beginPath();
    ctx.ctx.ellipse(rightEar.x, rightEar.y - 10, 12, 25, 0.3, 0, Math.PI * 2);
    ctx.ctx.fill();

    // Black dog nose
    ctx.ctx.fillStyle = '#000000';
    ctx.ctx.beginPath();
    ctx.ctx.ellipse(nose.x, nose.y + 10, 20, 18, 0, 0, Math.PI * 2);
    ctx.ctx.fill();

    // Nose shine
    ctx.ctx.fillStyle = '#333333';
    ctx.ctx.beginPath();
    ctx.ctx.ellipse(nose.x - 8, nose.y + 5, 6, 5, 0, 0, Math.PI * 2);
    ctx.ctx.fill();
  },
};

export const catFilter: Filter = {
  id: 'cat',
  name: 'Kitty Cat',
  description: 'Cat ears, whiskers, and pink nose',
  emoji: '🐱',
  draw: (ctx: FilterContext) => {
    if (!ctx.face) return;

    const face = ctx.face;
    const leftEar = face.landmarks.leftEar;
    const rightEar = face.landmarks.rightEar;
    const nose = face.landmarks.nose;

    // Pink cat ears (triangles)
    ctx.ctx.fillStyle = '#FFB6C1';
    ctx.ctx.beginPath();
    ctx.ctx.moveTo(leftEar.x, leftEar.y - 20);
    ctx.ctx.lineTo(leftEar.x - 15, leftEar.y - 50);
    ctx.ctx.lineTo(leftEar.x + 10, leftEar.y - 20);
    ctx.ctx.closePath();
    ctx.ctx.fill();

    ctx.ctx.beginPath();
    ctx.ctx.moveTo(rightEar.x, rightEar.y - 20);
    ctx.ctx.lineTo(rightEar.x + 15, rightEar.y - 50);
    ctx.ctx.lineTo(rightEar.x - 10, rightEar.y - 20);
    ctx.ctx.closePath();
    ctx.ctx.fill();

    // Inner ear white
    ctx.ctx.fillStyle = '#FFFFFF';
    ctx.ctx.beginPath();
    ctx.ctx.moveTo(leftEar.x, leftEar.y - 20);
    ctx.ctx.lineTo(leftEar.x - 8, leftEar.y - 38);
    ctx.ctx.lineTo(leftEar.x + 5, leftEar.y - 20);
    ctx.ctx.closePath();
    ctx.ctx.fill();

    ctx.ctx.beginPath();
    ctx.ctx.moveTo(rightEar.x, rightEar.y - 20);
    ctx.ctx.lineTo(rightEar.x + 8, rightEar.y - 38);
    ctx.ctx.lineTo(rightEar.x - 5, rightEar.y - 20);
    ctx.ctx.closePath();
    ctx.ctx.fill();

    // Pink nose (triangle)
    ctx.ctx.fillStyle = '#FF69B4';
    ctx.ctx.beginPath();
    ctx.ctx.moveTo(nose.x, nose.y + 5);
    ctx.ctx.lineTo(nose.x - 10, nose.y + 15);
    ctx.ctx.lineTo(nose.x + 10, nose.y + 15);
    ctx.ctx.closePath();
    ctx.ctx.fill();

    // Whiskers
    ctx.ctx.strokeStyle = '#000000';
    ctx.ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const offsetY = nose.y - 5 + i * 8;
      ctx.ctx.beginPath();
      ctx.ctx.moveTo(nose.x, offsetY);
      ctx.ctx.lineTo(nose.x - 50, offsetY);
      ctx.ctx.stroke();

      ctx.ctx.beginPath();
      ctx.ctx.moveTo(nose.x, offsetY);
      ctx.ctx.lineTo(nose.x + 50, offsetY);
      ctx.ctx.stroke();
    }
  },
};

export const sparkleFilter: Filter = {
  id: 'sparkle',
  name: 'Sparkle Magic',
  description: 'Magical sparkles around your eyes and aura',
  emoji: '✨',
  draw: (ctx: FilterContext) => {
    if (!ctx.face) return;

    const face = ctx.face;
    const leftEye = face.landmarks.leftEye;
    const rightEye = face.landmarks.rightEye;
    const forehead = face.landmarks.forehead;

    const drawStar = (x: number, y: number, size: number, rotation: number) => {
      ctx.ctx.save();
      ctx.ctx.translate(x, y);
      ctx.ctx.rotate(rotation);
      ctx.ctx.fillStyle = '#FFD700';
      ctx.ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const r = i % 2 === 0 ? size : size / 2;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) ctx.ctx.moveTo(px, py);
        else ctx.ctx.lineTo(px, py);
      }
      ctx.ctx.closePath();
      ctx.ctx.fill();
      ctx.ctx.restore();
    };

    const time = ctx.timestamp / 1000;

    // Stars around left eye
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const dist = 40 + Math.sin(time + i) * 10;
      const x = leftEye.x + Math.cos(angle) * dist;
      const y = leftEye.y + Math.sin(angle) * dist;
      drawStar(x, y, 6 + Math.sin(time * 2 + i) * 2, time * 2 + i);
    }

    // Stars around right eye
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const dist = 40 + Math.sin(time + i + 1) * 10;
      const x = rightEye.x + Math.cos(angle) * dist;
      const y = rightEye.y + Math.sin(angle) * dist;
      drawStar(x, y, 6 + Math.sin(time * 2 + i + 1) * 2, time * 2 + i + 1);
    }

    // Halo around head
    ctx.ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
    ctx.ctx.lineWidth = 3;
    ctx.ctx.beginPath();
    ctx.ctx.arc(forehead.x, forehead.y - 50, 80, 0, Math.PI * 2);
    ctx.ctx.stroke();
  },
};

export const flowerCrownFilter: Filter = {
  id: 'flower-crown',
  name: 'Flower Crown',
  description: 'Beautiful flowers crown your head',
  emoji: '👑',
  draw: (ctx: FilterContext) => {
    if (!ctx.face) return;

    const face = ctx.face;
    const forehead = face.landmarks.forehead;

    const colors = ['#FF69B4', '#FFD700', '#FF6347', '#90EE90', '#87CEEB'];
    const petals = 8;

    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2;
      const x = forehead.x + Math.cos(angle) * 70;
      const y = forehead.y - 80 + Math.sin(angle) * 30;

      ctx.ctx.fillStyle = colors[i % colors.length];
      ctx.ctx.beginPath();
      ctx.ctx.ellipse(x, y, 15, 20, angle, 0, Math.PI * 2);
      ctx.ctx.fill();
    }

    // Gold center
    ctx.ctx.fillStyle = '#FFD700';
    ctx.ctx.beginPath();
    ctx.ctx.arc(forehead.x, forehead.y - 70, 12, 0, Math.PI * 2);
    ctx.ctx.fill();
  },
};

export const starEyesFilter: Filter = {
  id: 'star-eyes',
  name: 'Star Eyes',
  description: 'Dazzling star-shaped eyes',
  emoji: '⭐',
  draw: (ctx: FilterContext) => {
    if (!ctx.face) return;

    const face = ctx.face;
    const leftEye = face.landmarks.leftEye;
    const rightEye = face.landmarks.rightEye;

    const drawStarEye = (x: number, y: number) => {
      ctx.ctx.fillStyle = '#FFD700';
      ctx.ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const r = i % 2 === 0 ? 22 : 9;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) ctx.ctx.moveTo(x + px, y + py);
        else ctx.ctx.lineTo(x + px, y + py);
      }
      ctx.ctx.closePath();
      ctx.ctx.fill();

      // Inner dark
      ctx.ctx.fillStyle = '#333333';
      ctx.ctx.beginPath();
      ctx.ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.ctx.fill();
    };

    drawStarEye(leftEye.x, leftEye.y);
    drawStarEye(rightEye.x, rightEye.y);
  },
};

export const theaterMakeupFilter: Filter = {
  id: 'theater-makeup',
  name: 'Theater Makeup',
  description: 'Dramatic rosy cheeks and eye makeup',
  emoji: '🎭',
  draw: (ctx: FilterContext) => {
    if (!ctx.face) return;

    const face = ctx.face;
    const centerX = face.x + face.width / 2;
    const centerY = face.y + face.height / 2;
    const leftEye = face.landmarks.leftEye;
    const rightEye = face.landmarks.rightEye;

    // Rosy cheeks
    ctx.ctx.fillStyle = 'rgba(255, 182, 193, 0.6)';
    ctx.ctx.beginPath();
    ctx.ctx.arc(centerX - 60, centerY + 40, 35, 0, Math.PI * 2);
    ctx.ctx.fill();
    ctx.ctx.beginPath();
    ctx.ctx.arc(centerX + 60, centerY + 40, 35, 0, Math.PI * 2);
    ctx.ctx.fill();

    // Eye makeup arcs
    ctx.ctx.strokeStyle = '#000000';
    ctx.ctx.lineWidth = 3;
    ctx.ctx.beginPath();
    ctx.ctx.arc(leftEye.x, leftEye.y, 30, 0, Math.PI, true);
    ctx.ctx.stroke();

    ctx.ctx.beginPath();
    ctx.ctx.arc(rightEye.x, rightEye.y, 30, 0, Math.PI, true);
    ctx.ctx.stroke();

    // Lip color
    ctx.ctx.fillStyle = '#FF1493';
    const mouth = face.landmarks.mouth;
    ctx.ctx.beginPath();
    ctx.ctx.ellipse(mouth.x, mouth.y + 20, 25, 15, 0, 0, Math.PI * 2);
    ctx.ctx.fill();
  },
};

export const neonOutlineFilter: Filter = {
  id: 'neon-outline',
  name: 'Neon Glow',
  description: 'Cyberpunk neon outline around face',
  emoji: '🌆',
  draw: (ctx: FilterContext) => {
    if (!ctx.face) return;

    const face = ctx.face;
    const centerX = face.x + face.width / 2;
    const centerY = face.y + face.height / 2;

    const colors = ['#00FF00', '#FF00FF', '#00FFFF', '#FFFF00'];
    const time = ctx.timestamp / 500;
    const colorIdx = Math.floor(time) % colors.length;

    // Glowing outline
    for (let i = 3; i > 0; i--) {
      ctx.ctx.strokeStyle = colors[colorIdx];
      ctx.ctx.globalAlpha = 0.3 / i;
      ctx.ctx.lineWidth = i * 3;
      ctx.ctx.beginPath();
      ctx.ctx.ellipse(centerX, centerY, face.width / 2 + 20, face.height / 2 + 30, 0, 0, Math.PI * 2);
      ctx.ctx.stroke();
    }

    ctx.ctx.globalAlpha = 1;
    ctx.ctx.strokeStyle = colors[colorIdx];
    ctx.ctx.lineWidth = 3;
    ctx.ctx.beginPath();
    ctx.ctx.ellipse(centerX, centerY, face.width / 2 + 20, face.height / 2 + 30, 0, 0, Math.PI * 2);
    ctx.ctx.stroke();
  },
};

export const heartsTrailFilter: Filter = {
  id: 'hearts-trail',
  name: 'Floating Hearts',
  description: 'Floating hearts around your face',
  emoji: '💝',
  draw: (ctx: FilterContext) => {
    if (!ctx.face) return;

    const face = ctx.face;
    const time = ctx.timestamp / 1000;

    const drawHeart = (x: number, y: number, size: number) => {
      ctx.ctx.fillStyle = '#FF1493';
      ctx.ctx.beginPath();
      ctx.ctx.moveTo(x, y + size / 4);
      ctx.ctx.bezierCurveTo(x - size / 2, y - size / 4, x - size, y, x - size / 2, y + size / 2);
      ctx.ctx.bezierCurveTo(x - size / 4, y + size / 1.5, x, y + size, x, y + size);
      ctx.ctx.bezierCurveTo(x, y + size, x + size / 4, y + size / 1.5, x + size / 2, y + size / 2);
      ctx.ctx.bezierCurveTo(x + size, y, x + size / 2, y - size / 4, x, y + size / 4);
      ctx.ctx.fill();
    };

    // Hearts floating around face
    for (let i = 0; i < 6; i++) {
      const angle = ((time * 0.5 + (i / 6) * Math.PI * 2) % (Math.PI * 2));
      const distance = 100 + Math.sin(time + i) * 20;
      const x = face.x + face.width / 2 + Math.cos(angle) * distance;
      const y = face.y + Math.sin(angle) * distance;
      const scale = 0.7 + Math.sin(time * 2 + i) * 0.3;

      ctx.ctx.globalAlpha = Math.max(0, Math.cos(time + i));
      drawHeart(x, y, 12 * scale);
    }
    ctx.ctx.globalAlpha = 1;
  },
};

export const pixelFaceFilter: Filter = {
  id: 'pixel-face',
  name: '8-Bit Pixel',
  description: '8-bit pixelated face effect',
  emoji: '👾',
  draw: (ctx: FilterContext) => {
    if (!ctx.face) return;

    const face = ctx.face;
    const leftEye = face.landmarks.leftEye;
    const rightEye = face.landmarks.rightEye;
    const blockSize = 12;

    const colors = ['#FF00FF', '#00FFFF', '#FFFF00', '#FF0000'];

    // Pixelated eyes
    for (let i = 0; i < 2; i++) {
      const eyeX = i === 0 ? leftEye.x : rightEye.x;
      const eyeY = leftEye.y;

      for (let py = 0; py < 3; py++) {
        for (let px = 0; px < 4; px++) {
          ctx.ctx.fillStyle = colors[(py + px + i) % colors.length];
          ctx.ctx.fillRect(eyeX - 24 + px * blockSize, eyeY - 30 + py * blockSize, blockSize - 1, blockSize - 1);
        }
      }
    }

    // Pixelated mouth
    ctx.ctx.fillStyle = '#FF0000';
    for (let px = 0; px < 5; px++) {
      ctx.ctx.fillRect(mouth.x - 30 + px * blockSize, mouth.y + 30, blockSize - 1, blockSize - 1);
    }
  },
};

export const rainbowFilterAura: Filter = {
  id: 'rainbow-aura',
  name: 'Rainbow Aura',
  description: 'Glowing rainbow aura around face',
  emoji: '🌈',
  draw: (ctx: FilterContext) => {
    if (!ctx.face) return;

    const face = ctx.face;
    const centerX = face.x + face.width / 2;
    const centerY = face.y + face.height / 2;
    const time = ctx.timestamp / 1000;

    // Draw rainbow rings
    for (let ring = 0; ring < 7; ring++) {
      const hue = (ring / 7 * 360 + time * 50) % 360;
      ctx.ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.ctx.lineWidth = 4;
      ctx.ctx.globalAlpha = 0.7 - ring * 0.08;
      ctx.ctx.beginPath();
      ctx.ctx.ellipse(centerX, centerY, face.width / 2 + ring * 15, face.height / 2 + 30 + ring * 15, 0, 0, Math.PI * 2);
      ctx.ctx.stroke();
    }

    ctx.ctx.globalAlpha = 1;
  },
};

export const allFilters: Filter[] = [
  dogFilter,
  catFilter,
  sparkleFilter,
  flowerCrownFilter,
  starEyesFilter,
  theaterMakeupFilter,
  neonOutlineFilter,
  heartsTrailFilter,
  pixelFaceFilter,
  rainbowFilterAura,
];

export const getFilterById = (id: string): Filter | undefined => {
  return allFilters.find(f => f.id === id);
};
