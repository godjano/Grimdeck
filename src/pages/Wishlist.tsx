import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../db';
import GoldIcon from '../components/GoldIcon';
import PageBanner from '../components/PageBanner';

export default function Wishlist() {
  const models = useLiveQuery(() => db.models.toArray()) ?? [];
  const paints = useLiveQuery(() => db.paints.toArray()) ?? [];
  const nav = useNavigate();
  const [tab, setTab] = useState<'models' | 'paints'>('models');
  const [newItem, setNewItem] = useState('');
  const [newType, setNewType] = useState<'model' | 'paint'>('model');
  const [newFaction, setNewFaction] = useState('');
  const [newBrand, setNewBrand] = useState('Citadel');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newNotes, setNewNotes] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Wishlist models from collection
  const wishModels = models.filter(m => m.wishlist);
  // Wishlist paints - stored in localStorage
  const [wishPaints, setWishPaints] = useState<{ name: string; brand: string; priority: string; notes: string; addedAt: number }[]>(
    () => JSON.parse(localStorage.getItem('grimdeck_wishpaints') || '[]')
  );
  const saveWishPaints = (items: typeof wishPaints) => {
    setWishPaints(items);
    localStorage.setItem('grimdeck_wishpaints', JSON.stringify(items));
  };

  // Model wishlist that's NOT in the collection
  const [standaloneWishes, setStandaloneWishes] = useState<{ name: string; faction: string; priority: string; notes: string; addedAt: number }[]>(
    () => JSON.parse(localStorage.getItem('grimdeck_wishmodels_extra') || '[]')
  );
  const saveStandaloneWishes = (items: typeof standaloneWishes) => {
    setStandaloneWishes(items);
    localStorage.setItem('grimdeck_wishmodels_extra', JSON.stringify(items));
  };

  // Prices
  const totalModelPrice = wishModels.reduce((s, m) => s + (m.pricePaid || 0), 0);
  const totalWishModels = wishModels.reduce((s, m) => s + m.quantity, 0);

  const addWishPaint = () => {
    if (!newItem.trim()) return;
    saveWishPaints([...wishPaints, { name: newItem.trim(), brand: newBrand, priority: newPriority, notes: newNotes.trim(), addedAt: Date.now() }]);
    setNewItem(''); setNewNotes('');
  };

  const addStandaloneModel = () => {
    if (!newItem.trim()) return;
    saveStandaloneWishes([...standaloneWishes, { name: newItem.trim(), faction: newFaction.trim(), priority: newPriority, notes: newNotes.trim(), addedAt: Date.now() }]);
    setNewItem(''); setNewFaction(''); setNewNotes('');
  };

  const removeStandaloneWish = (idx: number) => {
    saveStandaloneWishes(standaloneWishes.filter((_, i) => i !== idx));
  };

  const removeWishPaint = (idx: number) => {
    saveWishPaints(wishPaints.filter((_, i) => i !== idx));
  };

  const moveToCollection = async (idx: number) => {
    const wish = standaloneWishes[idx];
    await db.models.add({
      name: wish.name, faction: wish.faction || 'Unknown', unitType: 'Infantry', quantity: 1,
      status: 'unbuilt', gameSystem: 'Warhammer 40K', manufacturer: 'Games Workshop',
      points: 0, forceOrg: 'Other', countsAs: '', wishlist: false,
      createdAt: Date.now(), notes: wish.notes, photoUrl: '', pricePaid: 0,
    });
    removeStandaloneWish(idx);
  };

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sortedStandalone = [...standaloneWishes].sort((a, b) => (priorityOrder[a.priority as keyof typeof priorityOrder] || 1) - (priorityOrder[b.priority as keyof typeof priorityOrder] || 1));
  const sortedWishPaints = [...wishPaints].sort((a, b) => (priorityOrder[a.priority as keyof typeof priorityOrder] || 1) - (priorityOrder[b.priority as keyof typeof priorityOrder] || 1));

  const priorityColor = (p: string) => p === 'high' ? '#ef4444' : p === 'medium' ? '#f59e0b' : '#6b7280';
  const priorityLabel = (p: string) => p.charAt(0).toUpperCase() + p.slice(1);

  return (
    <div>
      <PageBanner title="Wishlist" subtitle="Track what you want to buy next" icon="medal" />

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 24 }}>
        <div className="stat">
          <div className="stat-num">{wishModels.length + standaloneWishes.length}</div>
          <div className="stat-label">Wanted Models</div>
        </div>
        <div className="stat">
          <div className="stat-num">{wishPaints.length}</div>
          <div className="stat-label">Wanted Paints</div>
        </div>
        {totalModelPrice > 0 && (
          <div className="stat">
            <div className="stat-num">£{totalModelPrice}</div>
            <div className="stat-label">Estimated Cost</div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="game-tabs" style={{ marginBottom: 20 }}>
        <button className={`game-tab ${tab === 'models' ? 'active' : ''}`} onClick={() => setTab('models')}>
          <GoldIcon name="models" size={14} /> Models ({wishModels.length + standaloneWishes.length})
        </button>
        <button className={`game-tab ${tab === 'paints' ? 'active' : ''}`} onClick={() => setTab('paints')}>
          <GoldIcon name="paints" size={14} /> Paints ({wishPaints.length})
        </button>
      </div>

      {/* Add new form */}
      <div style={{ marginBottom: 20 }}>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)} style={{ marginBottom: showForm ? 12 : 0 }}>
          {showForm ? '✕ Cancel' : '+ Add to Wishlist'}
        </button>
        {showForm && (
          <div className="settings-section" style={{ padding: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="field" style={{ gridColumn: '1/-1' }}>
                <label>Name</label>
                <input value={newItem} onChange={e => setNewItem(e.target.value)} placeholder={tab === 'models' ? 'e.g. Imperial Knight' : 'e.g. Wraithbone'} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', color: 'var(--text)', fontSize: '0.85rem', fontFamily: 'inherit', width: '100%' }} />
              </div>
              {tab === 'models' && !newType.startsWith('paint') && (
                <div className="field">
                  <label>Faction</label>
                  <input value={newFaction} onChange={e => setNewFaction(e.target.value)} placeholder="e.g. Space Marines" style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', color: 'var(--text)', fontSize: '0.85rem', fontFamily: 'inherit', width: '100%' }} />
                </div>
              )}
              {tab === 'paints' && (
                <div className="field">
                  <label>Brand</label>
                  <select value={newBrand} onChange={e => setNewBrand(e.target.value)} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', color: 'var(--text)', fontSize: '0.85rem', fontFamily: 'inherit', width: '100%' }}>
                    {['Citadel', 'Vallejo', 'Army Painter', 'AK Interactive', 'Scale75', 'ProAcryl', 'Turbo Dork', 'Other'].map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              )}
              <div className="field">
                <label>Priority</label>
                <select value={newPriority} onChange={e => setNewPriority(e.target.value as any)} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', color: 'var(--text)', fontSize: '0.85rem', fontFamily: 'inherit', width: '100%' }}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="field" style={{ marginTop: 10 }}>
              <label>Notes</label>
              <input value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="Optional notes..." style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px', color: 'var(--text)', fontSize: '0.85rem', fontFamily: 'inherit', width: '100%' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn btn-primary btn-sm" onClick={tab === 'paints' ? addWishPaint : addStandaloneModel} disabled={!newItem.trim()}>
                Add to Wishlist
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Models tab */}
      {tab === 'models' && (
        <div>
          {/* Wishlist models from collection */}
          {wishModels.length > 0 && (
            <>
              <h3 style={{ fontFamily: "'Cinzel', serif", color: 'var(--gold)', fontSize: '0.85rem', marginBottom: 12 }}>In Your Collection (Wishlist)</h3>
              {wishModels.map(m => (
                <div key={m.id} className="card" style={{ cursor: 'pointer' }} onClick={() => nav(`/model/${m.id}`)}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{m.name} {m.quantity > 1 && <span className="qty-badge">×{m.quantity}</span>}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{m.faction} · {m.unitType}</div>
                    {m.notes && <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: 2 }}>{m.notes}</div>}
                  </div>
                  {m.pricePaid > 0 && <span style={{ fontSize: '0.78rem', color: 'var(--gold)', marginRight: 8 }}>£{m.pricePaid}</span>}
                  <span className="status status-unbuilt">Wishlist</span>
                </div>
              ))}
            </>
          )}

          {/* Standalone wishes */}
          {sortedStandalone.length > 0 && (
            <>
              {wishModels.length > 0 && <h3 style={{ fontFamily: "'Cinzel', serif", color: 'var(--gold)', fontSize: '0.85rem', marginBottom: 12, marginTop: 24 }}>Additional Wishes</h3>}
              {sortedStandalone.map((w, idx) => (
                <div key={idx} className="card" style={{ cursor: 'default' }}>
                  <div style={{ width: 4, height: 32, borderRadius: 2, background: priorityColor(w.priority), flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{w.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {w.faction && <span>{w.faction} · </span>}
                      <span style={{ color: priorityColor(w.priority), fontWeight: 600 }}>{priorityLabel(w.priority)} priority</span>
                      <span style={{ color: 'var(--text-dim)', marginLeft: 8 }}>{new Date(w.addedAt).toLocaleDateString()}</span>
                    </div>
                    {w.notes && <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: 2 }}>{w.notes}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-sm btn-ghost" onClick={() => moveToCollection(idx)} style={{ fontSize: '0.65rem', padding: '4px 8px' }}>Own it</button>
                    <button className="btn btn-sm btn-danger" onClick={() => removeStandaloneWish(idx)} style={{ fontSize: '0.65rem', padding: '4px 8px' }}>×</button>
                  </div>
                </div>
              ))}
            </>
          )}

          {wishModels.length === 0 && standaloneWishes.length === 0 && (
            <div className="empty" style={{ padding: 60 }}>
              <GoldIcon name="medal" size={32} />
              <p className="empty-text" style={{ marginTop: 12 }}>No models on your wishlist. Add some from the Models page or use the button above.</p>
            </div>
          )}
        </div>
      )}

      {/* Paints tab */}
      {tab === 'paints' && (
        <div>
          {sortedWishPaints.length > 0 ? (
            sortedWishPaints.map((w, idx) => (
              <div key={idx} className="card" style={{ cursor: 'default' }}>
                <div style={{ width: 4, height: 32, borderRadius: 2, background: priorityColor(w.priority), flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{w.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {w.brand} · <span style={{ color: priorityColor(w.priority), fontWeight: 600 }}>{priorityLabel(w.priority)} priority</span>
                  </div>
                  {w.notes && <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: 2 }}>{w.notes}</div>}
                </div>
                <button className="btn btn-sm btn-danger" onClick={() => removeWishPaint(idx)} style={{ fontSize: '0.65rem', padding: '4px 8px' }}>×</button>
              </div>
            ))
          ) : (
            <div className="empty" style={{ padding: 60 }}>
              <GoldIcon name="paints" size={32} />
              <p className="empty-text" style={{ marginTop: 12 }}>No paints on your wishlist.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
