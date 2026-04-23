import {
  collection, addDoc, query, where,
  orderBy, onSnapshot, Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import type { Comment } from '@/lib/types';

const COL = 'comments';

function fromFirestore(id: string, data: Record<string, unknown>): Comment {
  return {
    id,
    videoId:       data.videoId as string,
    authorName:    data.authorName as string,
    authorId:      (data.authorId as string | null) ?? null,
    text:          (data.text as string) ?? '',
    reactionEmoji: (data.reactionEmoji as string | null) ?? null,
    createdAt:     (data.createdAt as Timestamp)?.toDate() ?? new Date(),
  };
}

export function subscribeToComments(
  videoId: string,
  cb: (comments: Comment[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, COL),
    where('videoId', '==', videoId),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(q, snap => cb(snap.docs.map(d => fromFirestore(d.id, d.data()))));
}

export async function addComment(
  videoId: string,
  authorName: string,
  text: string,
  reactionEmoji?: string | null,
  authorId?: string | null,
): Promise<void> {
  await addDoc(collection(db, COL), {
    videoId,
    authorName: authorName.trim() || 'Family Friend',
    authorId:   authorId ?? null,
    text:       text.trim(),
    reactionEmoji: reactionEmoji ?? null,
    createdAt:  Timestamp.now(),
  });
}
