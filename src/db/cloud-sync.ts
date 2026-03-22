import { supabase } from './supabase';
import { db } from './index';
import type { Session, User } from '@supabase/supabase-js';

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export function onAuthChange(callback: (session: Session | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => callback(session));
}

// ─── Cloud Sync ───

async function exportLocalData(): Promise<object> {
  const [models, paints, links, campaigns, operatives, results, logs] = await Promise.all([
    db.models.toArray(),
    db.paints.toArray(),
    db.modelPaintLinks.toArray(),
    db.campaigns.toArray(),
    db.operatives.toArray(),
    db.missionResults.toArray(),
    db.paintingLogs.toArray(),
  ]);
  return { models, paints, links, campaigns, operatives, results, logs, syncedAt: Date.now() };
}

async function importCloudData(data: any) {
  await db.transaction('rw', [db.models, db.paints, db.modelPaintLinks, db.campaigns, db.operatives, db.missionResults, db.paintingLogs], async () => {
    await db.models.clear(); await db.paints.clear(); await db.modelPaintLinks.clear();
    await db.campaigns.clear(); await db.operatives.clear(); await db.missionResults.clear();
    await db.paintingLogs.clear();
    if (data.models?.length) await db.models.bulkAdd(data.models);
    if (data.paints?.length) await db.paints.bulkAdd(data.paints);
    if (data.links?.length) await db.modelPaintLinks.bulkAdd(data.links);
    if (data.campaigns?.length) await db.campaigns.bulkAdd(data.campaigns);
    if (data.operatives?.length) await db.operatives.bulkAdd(data.operatives);
    if (data.results?.length) await db.missionResults.bulkAdd(data.results);
    if (data.logs?.length) await db.paintingLogs.bulkAdd(data.logs);
  });
}

export async function pushToCloud(): Promise<void> {
  const user = await getUser();
  if (!user) throw new Error('Not logged in');

  const data = await exportLocalData();
  const { error } = await supabase.from('user_data').upsert({
    user_id: user.id,
    data,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  if (error) throw error;
}

export async function pullFromCloud(): Promise<void> {
  const user = await getUser();
  if (!user) throw new Error('Not logged in');

  const { data, error } = await supabase.from('user_data').select('data').eq('user_id', user.id).single();
  if (error) throw error;
  if (!data?.data) throw new Error('No cloud data found');

  await importCloudData(data.data);
}

export async function getCloudSyncInfo(): Promise<{ lastSync: string | null }> {
  const user = await getUser();
  if (!user) return { lastSync: null };

  const { data } = await supabase.from('user_data').select('updated_at').eq('user_id', user.id).single();
  return { lastSync: data?.updated_at || null };
}
