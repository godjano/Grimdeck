import GoldIcon from '../components/GoldIcon';
import PageBanner from '../components/PageBanner';
import { useState, useEffect } from 'react';
import { getGallery, shareModel, likeModel, unlikeModel, deleteSharedModel, getMyProfile, saveCreatorProfile, type SharedModel, type CreatorProfile } from '../db/community';
import { getUser } from '../db/cloud-sync';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { User } from '@supabase/supabase-js';

type Tab = 'gallery' | 'share' | 'profile';

export default function Community() {
  const [tab, setTab] = useState<Tab>('gallery');
  const [user, setUser] = useState<User | null>(null);
  const [gallery, setGallery] = useState<SharedModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [faction, setFaction] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => { getUser().then(setUser); }, []);
  useEffect(() => { loadGallery(); }, [faction]);

  const loadGallery = async () => {
    setLoading(true);
    try { setGallery(await getGallery(30, faction || undefined)); }
    catch (e: any) { setStatus(`❌ ${e.message}`); }
    setLoading(false);
  };

  const handleLike = async (model: SharedModel) => {
    if (!user) { setStatus('Sign in to like'); return; }
    try {
      if (model.liked) await unlikeModel(model.id);
      else await likeModel(model.id);
      loadGallery();
    } catch (e: any) { setStatus(`❌ ${e.message}`); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteSharedModel(id); loadGallery(); } catch (e: any) { setStatus(`❌ ${e.message}`); }
  };

  return (
    <div>
      <div className="page-header" style={{ paddingTop: 48 }}>
        <PageBanner title="Community" subtitle="Share your work and get inspired" icon="community" />
      </div>

      <div className="game-tabs" style={{ marginBottom: 20 }}>
        <button className={`game-tab ${tab === 'gallery' ? 'active' : ''}`} onClick={() => setTab('gallery')}><GoldIcon name="lens" size={14} /> Gallery</button>
        <button className={`game-tab ${tab === 'share' ? 'active' : ''}`} onClick={() => setTab('share')}><GoldIcon name="aquila" size={14} /> Share</button>
        <button className={`game-tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}><GoldIcon name="crown" size={14} /> Profile</button>
      </div>

      {status && <div className="status-banner">{status}</div>}

      {tab === 'gallery' && (
        <div>
          <div className="filters" style={{ marginBottom: 16 }}>
            <select value={faction} onChange={e => setFaction(e.target.value)}>
              <option value="">All factions</option>
              {['Space Marines', 'Tyranids', 'Necrons', 'Orks', 'Death Guard', 'Aeldari', 'Chaos Space Marines', 'Tau Empire', 'Astra Militarum'].map(f =>
                <option key={f} value={f}>{f}</option>
              )}
            </select>
            <button className="btn btn-sm btn-ghost" onClick={loadGallery}>↻ Refresh</button>
          </div>

          {loading ? <div className="empty">Loading gallery...</div> :
           gallery.length === 0 ? (
            <div className="empty">
              <span className="empty-icon"><GoldIcon name="lens" size={40} /></span>
              <p className="empty-text">No shared models yet. Be the first to share!</p>
            </div>
          ) : (
            <div className="gallery-grid">
              {gallery.map(m => (
                <div key={m.id} className="gallery-card">
                  {m.photo_url && <img src={m.photo_url} alt={m.model_name} className="gallery-photo" />}
                  <div className="gallery-info">
                    <div className="gallery-name">{m.model_name}</div>
                    <div className="gallery-meta">{m.faction} · by {m.user_email?.split('@')[0] || 'Anonymous'}</div>
                    {m.description && <div className="gallery-desc">{m.description}</div>}
                    {m.recipe && m.recipe.length > 0 && (
                      <div className="gallery-recipe">
                        {m.recipe.map((p: any, i: number) => (
                          <div key={i} className="gallery-paint">
                            <div style={{ width: 14, height: 14, borderRadius: '50%', background: p.hex, border: '1px solid var(--border)' }} />
                            <span>{p.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="gallery-actions">
                      <button className={`gallery-like ${m.liked ? 'liked' : ''}`} onClick={() => handleLike(m)}>
                        <GoldIcon name={m.liked ? 'flame-skull' : 'skull'} size={14} /> {m.likes || 0}
                      </button>
                      {user && m.user_id === user.id && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m.id)}>🗑</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'share' && <ShareForm user={user} onShared={loadGallery} setStatus={setStatus} />}
      {tab === 'profile' && <ProfileForm user={user} setStatus={setStatus} />}
    </div>
  );
}

function ShareForm({ user, onShared, setStatus }: { user: User | null; onShared: () => void; setStatus: (s: string) => void }) {
  const models = useLiveQuery(() => db.models.toArray()) ?? [];
  const [selectedId, setSelectedId] = useState('');
  const [desc, setDesc] = useState('');
  const [tags, setTags] = useState('');

  const paintedModels = models.filter(m => ['painted', 'based'].includes(m.status));
  const selected = paintedModels.find(m => String(m.id) === selectedId);

  const handleShare = async () => {
    if (!user) { setStatus('Sign in to share'); return; }
    if (!selected) return;

    // Get paint recipe for this model
    const links = await db.modelPaintLinks.where('modelId').equals(selected.id!).toArray();
    const recipe = [];
    for (const link of links) {
      const paint = await db.paints.get(link.paintId);
      if (paint) recipe.push({ name: paint.name, hex: paint.hexColor, step: link.usageNote || paint.type });
    }

    try {
      await shareModel({
        model_name: selected.name,
        faction: selected.faction,
        photo_url: selected.photoUrl || undefined,
        recipe: recipe.length > 0 ? recipe : undefined,
        description: desc.trim() || undefined,
        tags: tags.trim() ? tags.split(',').map(t => t.trim()) : undefined,
      });
      setStatus('Model shared to gallery!');
      setSelectedId(''); setDesc(''); setTags('');
      onShared();
    } catch (e: any) { setStatus(`❌ ${e.message}`); }
  };

  if (!user) return <div className="settings-section"><p className="settings-desc">Sign in to share your painted models with the community.</p></div>;

  return (
    <div className="settings-section">
      <h3 className="settings-title"><GoldIcon name="aquila" size={18} /> Share a Painted Model</h3>
      <p className="settings-desc">Share your work with the community. Only painted/based models can be shared.</p>
      <div className="form-grid" style={{ maxWidth: 500 }}>
        <div className="field full-width">
          <label>Select Model</label>
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
            <option value="">Choose a painted model...</option>
            {paintedModels.map(m => <option key={m.id} value={String(m.id)}>{m.name} ({m.faction})</option>)}
          </select>
        </div>
        {selected && selected.photoUrl && <img src={selected.photoUrl} alt="" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 'var(--radius)', gridColumn: '1/-1' }} />}
        <div className="field full-width"><label>Description</label><input value={desc} onChange={e => setDesc(e.target.value)} placeholder="How did you paint this?" /></div>
        <div className="field full-width"><label>Tags (comma separated)</label><input value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. nmm, speed paint, display" /></div>
        <div className="field full-width">
          <button className="btn btn-primary" onClick={handleShare} disabled={!selectedId}>Share to Gallery</button>
        </div>
      </div>
    </div>
  );
}

function ProfileForm({ user, setStatus }: { user: User | null; setStatus: (s: string) => void }) {
  const [_profile, setProfile] = useState<CreatorProfile | null>(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [youtube, setYoutube] = useState('');
  const [instagram, setInstagram] = useState('');
  const [specialty, setSpecialty] = useState('');

  useEffect(() => {
    if (user) getMyProfile().then(p => {
      if (p) { setProfile(p); setName(p.display_name); setBio(p.bio || ''); setYoutube(p.youtube_url || ''); setInstagram(p.instagram_url || ''); setSpecialty(p.specialty || ''); }
      void _profile;
    });
  }, [user]);

  const save = async () => {
    try {
      await saveCreatorProfile({ display_name: name.trim(), bio: bio.trim(), youtube_url: youtube.trim(), instagram_url: instagram.trim(), specialty: specialty.trim() });
      setStatus('Profile saved!');
    } catch (e: any) { setStatus(`❌ ${e.message}`); }
  };

  if (!user) return <div className="settings-section"><p className="settings-desc">Sign in to create your creator profile.</p></div>;

  return (
    <div className="settings-section">
      <h3 className="settings-title"><GoldIcon name="crown" size={18} /> Creator Profile</h3>
      <p className="settings-desc">Set up your profile to be recognised in the community.</p>
      <div className="form-grid" style={{ maxWidth: 500 }}>
        <div className="field full-width"><label>Display Name *</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Your painter name" /></div>
        <div className="field full-width"><label>Bio</label><input value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about your hobby" /></div>
        <div className="field"><label>YouTube URL</label><input value={youtube} onChange={e => setYoutube(e.target.value)} placeholder="https://youtube.com/@..." /></div>
        <div className="field"><label>Instagram</label><input value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@handle" /></div>
        <div className="field full-width"><label>Specialty</label><input value={specialty} onChange={e => setSpecialty(e.target.value)} placeholder="e.g. NMM, speed painting, Orks" /></div>
        <div className="field full-width"><button className="btn btn-primary" onClick={save} disabled={!name.trim()}>Save Profile</button></div>
      </div>
    </div>
  );
}
