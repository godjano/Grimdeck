import { supabase } from './supabase';
import { getUser } from './cloud-sync';

export interface SharedModel {
  id: string;
  user_id: string;
  user_email: string;
  model_name: string;
  faction: string;
  photo_url: string | null;
  recipe: { name: string; hex: string; step: string }[] | null;
  description: string;
  tags: string[];
  likes: number;
  created_at: string;
  liked?: boolean;
}

export interface CreatorProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  youtube_url: string;
  instagram_url: string;
  specialty: string;
  is_verified: boolean;
}

// ─── Gallery ───

export async function getGallery(limit = 20, faction?: string): Promise<SharedModel[]> {
  let q = supabase.from('shared_models').select('*').order('created_at', { ascending: false }).limit(limit);
  if (faction) q = q.eq('faction', faction);
  const { data, error } = await q;
  if (error) throw error;

  const user = await getUser();
  if (user && data) {
    const { data: likes } = await supabase.from('model_likes').select('model_id').eq('user_id', user.id);
    const likedIds = new Set(likes?.map(l => l.model_id) || []);
    return data.map(m => ({ ...m, liked: likedIds.has(m.id) }));
  }
  return data || [];
}

export async function shareModel(model: { model_name: string; faction: string; photo_url?: string; recipe?: any[]; description?: string; tags?: string[] }) {
  const user = await getUser();
  if (!user) throw new Error('Not logged in');
  const { error } = await supabase.from('shared_models').insert({
    user_id: user.id,
    user_email: user.email,
    ...model,
  });
  if (error) throw error;
}

export async function deleteSharedModel(id: string) {
  const { error } = await supabase.from('shared_models').delete().eq('id', id);
  if (error) throw error;
}

export async function likeModel(modelId: string) {
  const user = await getUser();
  if (!user) throw new Error('Not logged in');
  await supabase.from('model_likes').insert({ user_id: user.id, model_id: modelId });
  await supabase.from('shared_models').update({ likes: 0 }).eq('id', modelId);
  // Increment likes count
  const { data } = await supabase.from('shared_models').select('likes').eq('id', modelId).single();
  if (data) await supabase.from('shared_models').update({ likes: (data.likes || 0) + 1 }).eq('id', modelId);
}

export async function unlikeModel(modelId: string) {
  const user = await getUser();
  if (!user) return;
  await supabase.from('model_likes').delete().eq('user_id', user.id).eq('model_id', modelId);
  const { data } = await supabase.from('shared_models').select('likes').eq('id', modelId).single();
  if (data) await supabase.from('shared_models').update({ likes: Math.max(0, (data.likes || 0) - 1) }).eq('id', modelId);
}

// ─── Creator Profiles ───

export async function getCreatorProfile(userId: string): Promise<CreatorProfile | null> {
  const { data } = await supabase.from('creator_profiles').select('*').eq('user_id', userId).single();
  return data;
}

export async function getMyProfile(): Promise<CreatorProfile | null> {
  const user = await getUser();
  if (!user) return null;
  return getCreatorProfile(user.id);
}

export async function saveCreatorProfile(profile: { display_name: string; bio?: string; youtube_url?: string; instagram_url?: string; specialty?: string }) {
  const user = await getUser();
  if (!user) throw new Error('Not logged in');
  const { error } = await supabase.from('creator_profiles').upsert({
    user_id: user.id,
    ...profile,
  }, { onConflict: 'user_id' });
  if (error) throw error;
}

export async function getAllCreators(): Promise<CreatorProfile[]> {
  const { data } = await supabase.from('creator_profiles').select('*').order('display_name');
  return data || [];
}
