export const THEMES: Record<string, any> = {
  dreamy: {
    id: 'dreamy', bg: '#fff0f8', navBg: 'rgba(255,255,255,0.7)', navBorder: 'rgba(252,231,243,0.5)',
    card: 'rgba(255,255,255,0.8)', cardBorder: 'rgba(255,255,255,1)', shadow: '0 24px 48px -12px rgba(217,70,168,0.15), 0 4px 24px rgba(217,70,168,0.06)',
    text: '#3a1e3b', sub: '#b45dd4', accent: '#d946a8', accentLight: 'rgba(252,231,243,0.8)',
    accentGrad: 'linear-gradient(135deg,#ff80c5,#d946a8)',
    tag: 'rgba(253,242,248,0.8)', tagText: '#be185d',
    banner: 'linear-gradient(135deg,#fbcfe8 0%,#e879f9 50%,#c084fc 100%)',
    avatarBg: 'linear-gradient(135deg,#ff80c5,#c084fc)',
    inputBg: 'rgba(255,255,255,0.6)', inputBorder: 'rgba(252,231,243,0.8)',
    commentBg: 'rgba(255,255,255,0.5)', scrollThumb: '#f9a8d4',
    logoColor: '#d946a8', logo: '🌹 Red Rose Gaming',
    deco: ['💖', '🌸', '⭐', '✨', '🌷', '💫', '🎀', '🦋'],
    backdrop: 'blur(24px)', textShadow: '0 2px 4px rgba(217,70,168,0.1)',
  },
  galaxy: {
    id: 'galaxy', bg: '#070512', navBg: 'rgba(10,5,25,0.6)', navBorder: 'rgba(76,29,149,0.3)',
    card: 'rgba(20,12,45,0.7)', cardBorder: 'rgba(124,58,237,0.2)', shadow: '0 24px 64px -16px rgba(168,85,247,0.4), 0 0 1px rgba(232,121,249,0.5)',
    text: '#f8f5ff', sub: '#c4b5fd', accent: '#e879f9', accentLight: 'rgba(45,27,105,0.6)',
    accentGrad: 'linear-gradient(135deg,#c084fc,#e879f9)',
    tag: 'rgba(30,16,69,0.8)', tagText: '#e879f9',
    banner: 'linear-gradient(135deg,#1e1b4b 0%,#581c87 50%,#172554 100%)',
    avatarBg: 'linear-gradient(135deg,#a855f7,#e879f9)',
    inputBg: 'rgba(15,10,35,0.6)', inputBorder: 'rgba(76,29,149,0.4)',
    commentBg: 'rgba(25,15,50,0.5)', scrollThumb: '#7c3aed',
    logoColor: '#e879f9', logo: '🌌 Red Rose Gaming',
    deco: [], stars: true,
    backdrop: 'blur(30px)', textShadow: '0 0 12px rgba(232,121,249,0.4)',
  },
  fresh: {
    id: 'fresh', bg: '#f1f5f9', navBg: 'rgba(255,255,255,0.85)', navBorder: 'rgba(226,232,240,0.6)',
    card: 'rgba(255,255,255,0.9)', cardBorder: 'rgba(255,255,255,1)', shadow: '0 20px 48px -12px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.03)',
    text: '#0f172a', sub: '#64748b', accent: '#10b981', accentLight: 'rgba(209,250,229,0.7)',
    accentGrad: 'linear-gradient(135deg,#34d399,#10b981)',
    tag: 'rgba(240,253,244,0.8)', tagText: '#059669',
    banner: 'linear-gradient(135deg,#a7f3d0 0%,#6ee7b7 55%,#34d399 100%)',
    avatarBg: 'linear-gradient(135deg,#6ee7b7,#10b981)',
    inputBg: 'rgba(255,255,255,0.7)', inputBorder: 'rgba(226,232,240,0.8)',
    commentBg: 'rgba(248,250,252,0.8)', scrollThumb: '#a7f3d0',
    logoColor: '#059669', logo: '🌿 Red Rose Gaming',
    deco: [],
    backdrop: 'blur(20px)', textShadow: 'none',
  },
};

export const VIDEOS = [
  { id: 1, title: 'Dress to Impress ✨ Wedding Theme DONKEY!', game: 'Dress to Impress', dur: '12:34', views: 47, likes: 23, date: '2 days ago', c1: '#f9a8d4', c2: '#c084fc', emoji: '👗', desc: "I finally won the wedding theme round!! It was SO hard picking the dress but I think the white ballgown was perfect 🤍 Let me know what you think in the comments!" },
  { id: 2, title: 'Brookhaven 🏠 Building My Dream House', game: 'Brookhaven', dur: '18:21', views: 63, likes: 41, date: '5 days ago', c1: '#86efac', c2: '#34d399', emoji: '🏡', desc: "Today I built the most amazing house in Brookhaven with a pink bedroom and a pool!! Come see my tour 🌸" },
  { id: 3, title: '99 Nights in the Forest 🌲 I Survived!!', game: '99 Nights', dur: '24:07', views: 31, likes: 19, date: '1 week ago', c1: '#6ee7b7', c2: '#059669', emoji: '🌲', desc: "I SURVIVED!! Night 99 was sooo scary but I made it! Watch my reaction when I got the ending 😱🎉" },
  { id: 4, title: 'Dress to Impress 🌊 Beach Vibes Round!', game: 'Dress to Impress', dur: '9:45', views: 28, likes: 15, date: '2 weeks ago', c1: '#7dd3fc', c2: '#2563eb', emoji: '🌊', desc: "Beach theme is my favourite!! I wore a blue sparkly dress and got so many votes 💙✨" },
  { id: 5, title: 'Brookhaven 🚗 Going on a Road Trip!', game: 'Brookhaven', dur: '15:02', views: 55, likes: 33, date: '3 weeks ago', c1: '#fde68a', c2: '#f59e0b', emoji: '🚗', desc: "Me and my friends went on the longest road trip in Brookhaven and it was hilarious 😂" },
  { id: 6, title: '99 Nights 🔦 Night 50 Challenge!', game: '99 Nights', dur: '20:18', views: 39, likes: 27, date: '1 month ago', c1: '#c4b5fd', c2: '#7c3aed', emoji: '🔦', desc: "Night 50 is where it gets REALLY scary. I was shaking!! 👻" },
];

export const REACTIONS = [
  { id: 1, emoji: '🎉', label: 'Yay!', bg: '#fef9c3' },
  { id: 2, emoji: '😂', label: 'LOL', bg: '#fee2e2' },
  { id: 3, emoji: '🔥', label: 'Fire!', bg: '#fef3c7' },
  { id: 4, emoji: '💖', label: 'Love it', bg: '#fce7f3' },
  { id: 5, emoji: '👏', label: 'Clap', bg: '#d1fae5' },
  { id: 6, emoji: '😱', label: 'OMG!', bg: '#ede9fe' },
  { id: 7, emoji: '✨', label: 'Magic', bg: '#e0f2fe' },
  { id: 8, emoji: '🌹', label: 'Rose!', bg: '#fce7f3' },
];

export const INIT_COMMENTS = [
  { id: 1, name: 'Grandma Pat 💛', avatar: '👵', text: "I am so proud of you sweetheart!! That dress was BEAUTIFUL! Love you loads xx", time: '1 day ago', gif: null },
  { id: 2, name: 'Auntie Sarah', avatar: '👩', text: "Omg you are so funny!! I was laughing the whole time 😂", time: '1 day ago', gif: '😂' },
  { id: 3, name: 'Dad 🏆', avatar: '👨', text: "My favourite gamer!! That was amazing, well done!", time: '2 days ago', gif: '🎉' },
];
