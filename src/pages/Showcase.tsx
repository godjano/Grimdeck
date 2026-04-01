import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../db';
import PageBanner from '../components/PageBanner';
import GoldIcon from '../components/GoldIcon';

import { useState } from 'react';

export default function Showcase() {
  const nav = useNavigate();
  const models = useLiveQuery(() => db.models.toArray()) ?? [];
  const painted = models.filter(m => (m.status === 'painted' || m.status === 'based') && m.photoUrl);
  const [techFilter, setTechFilter] = useState('');

  const allTechs = [...new Set(painted.flatMap(m => m.techniques || []))].sort();
  const filtered = techFilter ? painted.filter(m => (m.techniques || []).includes(techFilter)) : painted;

  return (
    <div>
      <PageBanner title="Shelf of Pride" subtitle="Your finest work" icon="trophy" />
      {painted.length === 0 ? (
        <div className="md-empty-tab" style={{ marginTop: 40 }}>
          <GoldIcon name="trophy" size={32} />
          <p>Paint some models and add photos to see them here</p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Only painted/based models with photos appear in the showcase</p>
        </div>
      ) : (
        <>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', marginBottom: 8 }}>{filtered.length} masterpiece{filtered.length !== 1 ? 's' : ''}</p>
          {allTechs.length > 0 && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
              <button className={`btn btn-sm ${!techFilter ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTechFilter('')} style={{ fontSize: '0.7rem', padding: '3px 8px' }}>All</button>
              {allTechs.map(t => (
                <button key={t} className={`btn btn-sm ${techFilter === t ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTechFilter(t)} style={{ fontSize: '0.7rem', padding: '3px 8px' }}>{t}</button>
              ))}
            </div>
          )}
          <div className="showcase-grid">
            {filtered.map(m => (
              <div key={m.id} className="showcase-card" onClick={() => nav(`/model/${m.id}`)}>
                <img src={m.photoUrl} alt={m.name} className="showcase-img" />
                <div className="showcase-info">
                  <div className="showcase-name">{m.name}</div>
                  <div className="showcase-faction">{m.faction}</div>
                {(m.techniques || []).length > 0 && (
                  <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', marginTop: 4 }}>
                    {(m.techniques || []).map(t => <span key={t} className="recipe-tag">{t}</span>)}
                  </div>
                )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
