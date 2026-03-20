import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db';
import { ALL_MODEL_PRESETS } from '../db/model-presets';

const STARTER_SETS: Record<string, string[]> = {
  'Space Marines Combat Patrol': ['Captain in Terminator Armour (CP)', 'Infernus Squad (CP)', 'Terminator Squad (CP)', 'Impulsor (CP)'],
  'Tyranids Combat Patrol': ['Winged Tyranid Prime (CP)', 'Termagants (CP)', 'Von Ryan Leapers (CP)', 'Psychophage (CP)'],
  'Necrons Combat Patrol': ['Overlord (CP)', 'Necron Warriors (CP)', 'Immortals (CP)', 'Skorpekh Destroyers (CP)', 'Canoptek Scarab Swarms (CP)', 'Canoptek Doomstalker (CP)'],
  'Orks Combat Patrol': ['Warboss (CP)', 'Boyz (CP)', 'Deffkoptas (CP)', 'Deff Dread (CP)'],
  'Death Guard Combat Patrol': ['Typhus (CP)', 'Plague Marines (CP)', 'Poxwalkers (CP)', 'Biologus Putrifier (CP)'],
};

export default function GettingStarted() {
  const [step, setStep] = useState(0);
  const [selectedSet, setSelectedSet] = useState('');
  const nav = useNavigate();

  const addSet = async () => {
    const names = STARTER_SETS[selectedSet] || [];
    for (const name of names) {
      const preset = ALL_MODEL_PRESETS.find(p => p.name === name);
      if (preset) {
        await db.models.add({ name: preset.name, faction: preset.faction, unitType: preset.unitType, quantity: preset.defaultQty, status: 'unbuilt', notes: '', photoUrl: '', createdAt: Date.now(), manufacturer: 'Games Workshop', gameSystem: 'Warhammer 40K', countsAs: '', pricePaid: 0, wishlist: false, points: preset.points || 0, forceOrg: preset.forceOrg || 'Other' });
      }
    }
  };

  return (
    <div>
      <section className="hero" style={{ padding: '60px 0 40px' }}>
        <p className="hero-eyebrow">Welcome to Grimdeck</p>
        <h1 className="hero-title">Let's get you<br /><span>started</span></h1>
      </section>

      {step === 0 && (
        <div className="wizard-card">
          <div className="wizard-step-num">1 of 3</div>
          <h3>What did you get?</h3>
          <p className="settings-desc">Select your starter set and we'll add all the models for you.</p>
          <div className="wizard-options">
            {Object.keys(STARTER_SETS).map(s => (
              <button key={s} className={`wizard-option ${selectedSet === s ? 'selected' : ''}`} onClick={() => setSelectedSet(s)}>{s}</button>
            ))}
            <button className={`wizard-option ${selectedSet === 'other' ? 'selected' : ''}`} onClick={() => setSelectedSet('other')}>Something else</button>
          </div>
          <button className="btn btn-primary btn-lg" style={{ marginTop: 20 }} onClick={() => { if (selectedSet && selectedSet !== 'other') addSet(); setStep(1); }} disabled={!selectedSet}>
            Next →
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="wizard-card">
          <div className="wizard-step-num">2 of 3</div>
          <h3>Do you have paints?</h3>
          <p className="settings-desc">If you have a starter paint set, we can add those too.</p>
          <div className="wizard-options">
            <button className="wizard-option" onClick={async () => {
              const starterPaints = ['Abaddon Black', 'Corax White', 'Mephiston Red', 'Macragge Blue', 'Retributor Armour', 'Leadbelcher', 'Nuln Oil', 'Agrax Earthshade', 'Wraithbone'];
              const { ALL_PAINT_PRESETS } = await import('../db/paint-presets');
              for (const name of starterPaints) {
                const p = ALL_PAINT_PRESETS.find(pp => pp.name === name);
                if (p) await db.paints.add({ name: p.name, brand: p.brand, range: p.range, type: p.type, hexColor: p.hex, owned: true, quantity: 1, notes: '' });
              }
              setStep(2);
            }}>🎨 Yes, add a basic Citadel starter set</button>
            <button className="wizard-option" onClick={() => setStep(2)}>I'll add my paints later</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="wizard-card" style={{ textAlign: 'center' }}>
          <div className="wizard-step-num">3 of 3</div>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎉</div>
          <h3>You're all set!</h3>
          <p className="settings-desc">Your collection is ready. Here's what to do next:</p>
          <div className="wizard-next-steps">
            <button className="btn btn-primary btn-lg" onClick={() => nav('/grey-pile')}>🪦 See your Grey Pile</button>
            <button className="btn btn-outline btn-lg" onClick={() => nav('/suggestions')}>📖 Browse Painting Guides</button>
            <button className="btn btn-ghost btn-lg" onClick={() => nav('/')}>🏠 Go to Home</button>
          </div>
        </div>
      )}
    </div>
  );
}
