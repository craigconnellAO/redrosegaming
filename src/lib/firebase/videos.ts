import {
  collection, doc, getDoc, getDocs, addDoc,
  updateDoc, increment, arrayUnion, arrayRemove,
  query, orderBy, onSnapshot, Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import type { Video, GameTag } from '@/lib/types';

const COL = 'videos';

function fromFirestore(id: string, data: Record<string, unknown>): Video {
  return {
    id,
    title:        data.title as string,
    description:  data.description as string,
    game:         data.game as GameTag,
    storageUrl:   data.storageUrl as string,
    thumbnailUrl: data.thumbnailUrl as string | undefined,
    duration:     data.duration as string | undefined,
    views:        (data.views as number) ?? 0,
    likes:        (data.likes as number) ?? 0,
    likedBy:      (data.likedBy as string[]) ?? [],
    createdAt:    (data.createdAt as Timestamp)?.toDate() ?? new Date(),
  };
}

export async function getVideos(): Promise<Video[]> {
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => fromFirestore(d.id, d.data()));
}

export async function getVideo(id: string): Promise<Video | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return fromFirestore(snap.id, snap.data());
}

export function subscribeToVideos(cb: (videos: Video[]) => void): Unsubscribe {
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap => cb(snap.docs.map(d => fromFirestore(d.id, d.data()))));
}

export async function addVideo(data: Omit<Video, 'id' | 'views' | 'likes' | 'likedBy' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    views:     0,
    likes:     0,
    likedBy:   [],
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

export async function incrementViews(id: string): Promise<void> {
  await updateDoc(doc(db, COL, id), { views: increment(1) });
}

export async function toggleLike(id: string, userId: string, isLiked: boolean): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    likes:   increment(isLiked ? -1 : 1),
    likedBy: isLiked ? arrayRemove(userId) : arrayUnion(userId),
  });
}
