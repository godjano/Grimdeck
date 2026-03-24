import { PaintTimer, RandomPicker, ShoppingList, CsvImport, ShareCollection, Glossary } from '../components/Tools';
import PaintMatcher from '../components/PaintMatcher';
import { addHachetteCollection } from '../db/hachette-collection';
import { db } from '../db';
import { useState } from 'react';

export default function Tools() {
  const [hachetteStatus, setHachetteStatus] = useState('');

  const clearHachette = async () => {
    const all = await db.models.toArray();
    const hachette = all.filter(m => m.notes?.includes('Hachette') || m.manufacturer === 'Games Workshop (Hachette)');
    for (const m of hachette) await db.models.delete(m.id!);
    setHachetteStatus(`🗑 Removed ${hachette.length} Hachette models`);
  };

  const importHachette = async () => {
    await clearHachette();
    setHachetteStatus('⏳ Adding fresh...');
    const count = await addHachetteCollection();
    setHachetteStatus(`Added ${count} models (old duplicates cleared)`);
  };

  return (
    <div>
      <div className="page-header" style={{ paddingTop: 48 }}>
        <h2>🧰 Tools</h2>
      </div>

      {/* Hachette Import */}
      <div className="tool-card" style={{ marginBottom: 16 }}>
        <h3>📰 Hachette Combat Patrol Collection</h3>
        <p className="settings-desc">Import all models from Hachette Combat Patrol magazine Issues 1-72. Clears old imports first to avoid duplicates.</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={importHachette}>Import Issues 1-72 (clean)</button>
          <button className="btn btn-danger btn-sm" onClick={clearHachette}>Remove Hachette models</button>
        </div>
        {hachetteStatus && <p style={{ marginTop: 8, fontSize: '0.85rem' }}>{hachetteStatus}</p>}
      </div>

      <div className="tools-grid">
        <PaintMatcher />
        <PaintTimer />
        <RandomPicker />
        <ShoppingList />
        <ShareCollection />
        <CsvImport />
        <Glossary />
      </div>
    </div>
  );
}
