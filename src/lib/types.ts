export type GameTag =
  | 'Dress to Impress'
  | 'Brookhaven'
  | '99 Nights'
  | 'Other Roblox'
  | 'Just Chatting';

export interface Video {
  id: string;
  title: string;
  description: string;
  game: GameTag;
  storageUrl: string;
  thumbnailUrl?: string;
  duration?: string;
  views: number;
  likes: number;
  likedBy: string[];
  createdAt: Date;
  archived?: boolean;
}

export interface Comment {
  id: string;
  videoId: string;
  authorName: string;
  authorId?: string | null;
  text: string;
  reactionEmoji?: string | null;
  createdAt: Date;
}

export interface Reaction {
  emoji: string;
  label: string;
}

export const GAME_TAGS: GameTag[] = [
  'Dress to Impress',
  'Brookhaven',
  '99 Nights',
  'Other Roblox',
  'Just Chatting',
];

export const REACTIONS: Reaction[] = [
  { emoji: '🎉', label: 'Yay!' },
  { emoji: '😂', label: 'LOL' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '💖', label: 'Love' },
  { emoji: '👏', label: 'Clap' },
  { emoji: '😱', label: 'OMG' },
  { emoji: '✨', label: 'Magic' },
  { emoji: '🌹', label: 'Rose' },
];

export function thumbClass(game: GameTag): string {
  switch (game) {
    case 'Dress to Impress': return 'thumb-dti';
    case 'Brookhaven':       return 'thumb-bh';
    case '99 Nights':        return 'thumb-99n';
    case 'Just Chatting':    return 'thumb-chat';
    default:                 return 'thumb-other';
  }
}
