import { useState, useCallback } from 'react';
import GoldIcon from './GoldIcon';

// ─── Dice Roller ───
export default function DiceRoller() {
  const [diceCount, setDiceCount] = useState(6);
  const [diceSides, setDiceSides] = useState(6);
  const [modifier, setModifier] = useState(0);
  const [threshold, setThreshold] = useState(4);
  const [results, setResults] = useState<number[]>([]);
  const [rolling, setRolling] = useState(false);
  const [history, setHistory] = useState<{ dice: number; sides: number; mod: number; results: number[]; total: number; hits: number; timestamp: number }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [rerollOnes, setRerollOnes] = useState(false);
  const [rerollBelow, setRerollBelow] = useState(false);

  const rollDice = useCallback(() => {
    setRolling(true);
    // Animate for 400ms then settle
    const frames: number[][] = [];
    for (let i = 0; i < 8; i++) {
      frames.push(Array.from({ length: diceCount }, () => Math.floor(Math.random() * diceSides) + 1));
    }
    let frame = 0;
    const interval = setInterval(() => {
      setResults(frames[frame]);
      frame++;
      if (frame >= frames.length) {
        clearInterval(interval);
        // Final roll
        let finalResults = Array.from({ length: diceCount }, () => Math.floor(Math.random() * diceSides) + 1);

        // Apply rerolls
        if (rerollOnes) {
          finalResults = finalResults.map(d => d === 1 ? Math.floor(Math.random() * diceSides) + 1 : d);
        }
        if (rerollBelow && threshold > 1) {
          finalResults = finalResults.map(d => d < threshold ? Math.floor(Math.random() * diceSides) + 1 : d);
        }

        setResults(finalResults);
        const total = finalResults.reduce((s, d) => s + d, 0) + modifier;
        const hits = finalResults.filter(d => d >= threshold).length;
        setHistory(prev => [{ dice: diceCount, sides: diceSides, mod: modifier, results: finalResults, total, hits, timestamp: Date.now() }, ...prev].slice(0, 20));
        setRolling(false);
      }
    }, 50);
  }, [diceCount, diceSides, modifier, threshold, rerollOnes, rerollBelow, diceCount]);

  const hits = results.filter(d => d >= threshold).length;
  const total = results.reduce((s, d) => s + d, 0) + modifier;
  const successes = results.filter(d => d >= threshold).length;
  const failures = results.filter(d => d < threshold).length;
  const crits = results.filter(d => d === (diceSides === 6 ? 6 : diceSides)).length;
  const ones = results.filter(d => d === 1).length;

  // Hit probability display
  const hitProb = diceSides > 0 ? Math.max(0, ((diceSides - threshold + 1) / diceSides) * 100) : 0;
  const expectedHits = diceCount * (diceSides - threshold + 1) / diceSides;

  // Quick roll presets
  const presets = [
    { label: 'D6 Hit Roll', dice: 6, sides: 6, threshold: 3 },
    { label: 'D6 Wound Roll', dice: 6, sides: 6, threshold: 4 },
    { label: 'D6 Save Roll', dice: 6, sides: 6, threshold: 3 },
    { label: '2D6 Charge', dice: 2, sides: 6, threshold: 7 },
    { label: 'D6 Morale', dice: 1, sides: 6, threshold: 4 },
    { label: 'D20 Ability', dice: 1, sides: 20, threshold: 10 },
  ];

  const applyPreset = (p: typeof presets[0]) => {
    setDiceCount(p.dice);
    setDiceSides(p.sides);
    setThreshold(p.threshold);
    setModifier(0);
    setRerollOnes(false);
    setRerollBelow(false);
    setResults([]);
  };

  // Color for dice results
  const dieColor = (d: number) => {
    if (diceSides === 6 && d === 6) return 'die-crit';
    if (diceSides === 6 && d === 1) return 'die-miss';
    if (d >= threshold) return 'die-hit';
    return 'die-fail';
  };

  return (
    <div className="tool-card">
      <h3><GoldIcon name="crosshair" size={18} /> Dice Roller</h3>
      <p className="settings-desc">Roll dice for your games. Track hits, wounds, saves and more.</p>

      {/* Quick presets */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
        {presets.map(p => (
          <button key={p.label} className="btn btn-sm btn-ghost" onClick={() => applyPreset(p)} style={{ fontSize: '0.65rem', padding: '3px 8px' }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Config */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        <div className="field" style={{ margin: 0 }}>
          <label>Dice ({diceSides}D)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button className="btn btn-sm btn-ghost" onClick={() => setDiceCount(Math.max(1, diceCount - 1))} style={{ padding: '2px 8px' }}>-</button>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, minWidth: 32, textAlign: 'center', color: 'var(--gold)' }}>{diceCount}</span>
            <button className="btn btn-sm btn-ghost" onClick={() => setDiceCount(Math.min(30, diceCount + 1))} style={{ padding: '2px 8px' }}>+</button>
          </div>
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label>Sides</label>
          <select value={diceSides} onChange={e => setDiceSides(Number(e.target.value))} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px', color: 'var(--text)', fontSize: '0.82rem', fontFamily: 'inherit', width: '100%' }}>
            {[3, 4, 6, 8, 10, 12, 20, 100].map(s => <option key={s} value={s}>D{s}</option>)}
          </select>
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label>Hit Threshold</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{threshold}+</span>
            <input type="range" min={2} max={diceSides} value={threshold} onChange={e => setThreshold(Number(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--gold)' }} />
            <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{hitProb.toFixed(0)}%</span>
          </div>
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label>Modifier</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button className="btn btn-sm btn-ghost" onClick={() => setModifier(modifier - 1)} style={{ padding: '2px 8px' }}>-</button>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, minWidth: 32, textAlign: 'center', color: modifier > 0 ? 'var(--success)' : modifier < 0 ? 'var(--danger)' : 'var(--text)' }}>{modifier > 0 ? `+${modifier}` : modifier}</span>
            <button className="btn btn-sm btn-ghost" onClick={() => setModifier(modifier + 1)} style={{ padding: '2px 8px' }}>+</button>
          </div>
        </div>
      </div>

      {/* Reroll options */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <input type="checkbox" checked={rerollOnes} onChange={e => setRerollOnes(e.target.checked)} />
          Reroll 1s
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <input type="checkbox" checked={rerollBelow} onChange={e => setRerollBelow(e.target.checked)} />
          Reroll below {threshold}+
        </label>
      </div>

      {/* Roll button */}
      <button className="btn btn-primary" onClick={rollDice} disabled={rolling} style={{ width: '100%', marginBottom: 16 }}>
        {rolling ? 'Rolling...' : `🎲 Roll ${diceCount}D${diceSides}${modifier > 0 ? `+${modifier}` : modifier < 0 ? String(modifier) : ''}`}
      </button>

      {/* Results */}
      {results.length > 0 && (
        <div>
          {/* Dice display */}
          <div className="dice-roller-results">
            {results.map((d, i) => (
              <div key={i} className={`dice-roller-face ${dieColor(d)}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="dice-roller-stats">
            <div className="dice-roller-stat">
              <div className="dice-roller-stat-num" style={{ color: 'var(--gold)' }}>{total}</div>
              <div className="dice-roller-stat-label">Total</div>
            </div>
            <div className="dice-roller-stat">
              <div className="dice-roller-stat-num" style={{ color: '#2ecc71' }}>{successes}</div>
              <div className="dice-roller-stat-label">Hits ({threshold}+)</div>
            </div>
            <div className="dice-roller-stat">
              <div className="dice-roller-stat-num" style={{ color: 'var(--text-dim)' }}>{failures}</div>
              <div className="dice-roller-stat-label">Misses</div>
            </div>
            {diceSides === 6 && (
              <>
                <div className="dice-roller-stat">
                  <div className="dice-roller-stat-num" style={{ color: '#e8c040' }}>{crits}</div>
                  <div className="dice-roller-stat-label">Crits (6)</div>
                </div>
                <div className="dice-roller-stat">
                  <div className="dice-roller-stat-num" style={{ color: '#c0392b' }}>{ones}</div>
                  <div className="dice-roller-stat-label">Ones</div>
                </div>
              </>
            )}
          </div>

          {/* Expected vs actual */}
          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: 8, marginBottom: 12 }}>
            Expected {expectedHits.toFixed(1)} hits · Actual {successes} hits{successes >= expectedHits ? ' — Great rolls!' : ' — Tough luck!'}
          </div>
        </div>
      )}

      {/* History toggle */}
      {history.length > 0 && (
        <button className="btn btn-sm btn-ghost" onClick={() => setShowHistory(!showHistory)} style={{ width: '100%', marginBottom: 8 }}>
          {showHistory ? 'Hide' : 'Show'} Roll History ({history.length})
        </button>
      )}

      {showHistory && history.length > 0 && (
        <div className="dice-roller-history">
          {history.map((h, i) => (
            <div key={i} className="dice-roller-history-item">
              <span className="dice-roller-history-dice">{h.dice}D{h.sides}</span>
              <span className="dice-roller-history-vals">[{h.results.join(', ')}]</span>
              <span className="dice-roller-history-total">{h.total}</span>
              <span className="dice-roller-history-hits">{h.hits} hits</span>
              <span className="dice-roller-history-time">{new Date(h.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
