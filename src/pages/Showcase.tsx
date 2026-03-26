import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../db';
import PageBanner from '../components/PageBanner';
import GoldIcon from '../components/GoldIcon';

export default function Showcase() {
  const nav = useNavigate();
  const models = useLiveQuery(() => db.models.toArray()) ?? [];
  const painted = models.filter(m => (m.status === 'painted' || m.status === 'based') && m.photoUrl);

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
          <p style={{ color: 'var(--text-dim)', fontSize: '0.82rem', marginBottom: 16 }}>{painted.length} masterpiece{painted.length !== 1 ? 's' : ''}</p>
          <div className="showcase-grid">
            {painted.map(m => (
              <div key={m.id} className="showcase-card" onClick={() => nav(`/model/${m.id}`)}>
                <img src={m.photoUrl} alt={m.name} className="showcase-img" />
                <div className="showcase-info">
                  <div className="showcase-name">{m.name}</div>
                  <div className="showcase-faction">{m.faction}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
