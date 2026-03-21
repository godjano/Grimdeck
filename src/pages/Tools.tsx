import { PaintTimer, RandomPicker, ShoppingList, CsvImport, ShareCollection, Glossary } from '../components/Tools';
import { addHachetteCollection } from '../db/hachette-collection';
import { useState } from 'react';

export default function Tools() {
  const [hachetteStatus, setHachetteStatus] = useState('');

  const importHachette = async () => {
    setHachetteStatus('⏳ Adding...');
    const count = await addHachetteCollection();
    setHachetteStatus(`✅ Added ${count} models from Hachette Combat Patrol Issues 1-72!`);
  };

  return (
    <div>
      <div className="page-header" style={{ paddingTop: 48 }}>
        <h2>🧰 Tools</h2>
      </div>

      {/* Hachette Import */}
      <div className="tool-card" style={{ marginBottom: 16 }}>
        <h3>📰 Hachette Combat Patrol Collection</h3>
        <p className="settings-desc">Import all models from Hachette Combat Patrol magazine Issues 1-72. Adds Space Marines, Tyranids, Aeldari, Chaos, Orks, Votann, GSC, and Guard models as "unbuilt".</p>
        <button className="btn btn-primary" onClick={importHachette}>Import Issues 1-72</button>
        {hachetteStatus && <p style={{ marginTop: 8, fontSize: '0.85rem' }}>{hachetteStatus}</p>}
      </div>

      <div className="tools-grid">
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
