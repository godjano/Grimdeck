import { useState } from 'react';
import type { KTOperative } from '../db/killteam-data';
import { FACTION_ROSTERS } from '../db/killteam-data';
import { TEAM_RULES, validateTeam, getAvailableOperatives } from '../db/team-selection';
import GoldIcon from './GoldIcon';

interface Props {
  faction: string;
  onConfirm: (selected: KTOperative[]) => void;
  onBack: () => void;
}

export default function OperativeSelection({ faction, onConfirm, onBack }: Props) {
  const [selected, setSelected] = useState<KTOperative[]>([]);
  const rule = TEAM_RULES[faction];
  const { leaders, regulars } = getAvailableOperatives(faction);
  const validation = validateTeam(faction, selected);

  const addOp = (op: KTOperative) => {
    if (!rule) { setSelected([...selected, { ...op, id: `op_${selected.length}` }]); return; }
    // Check if we can add this
    const count = selected.filter(s => s.name === op.name).length;
    const isUnique = rule.uniqueOnly.includes(op.name);
    if (isUnique && count >= 1) return;
    if (selected.length >= rule.totalOperatives) return;
    setSelected([...selected, { ...op, id: `op_${selected.length}` }]);
  };

  const removeOp = (idx: number) => {
    setSelected(selected.filter((_, i) => i !== idx));
  };

  const autoFill = () => {
    const roster = FACTION_ROSTERS[faction] || [];
    setSelected(roster.map((op, i) => ({ ...op, id: `op_${i}` })));
  };

  const maxOps = rule?.totalOperatives || 6;

  return (
    <div>
      <div className="page-header" style={{ paddingTop: 24 }}>
        <h2>Select Your Kill Team</h2>
      </div>

      {rule && (
        <div className="selection-rules">
          <div className="selection-rules-title">< GoldIcon name="guides" size={14} /> {faction} Team Rules</div>
          <div className="selection-rules-text">{rule.notes}</div>
        </div>
      )}

      {/* Selected roster */}
      <div className="selection-roster">
        <div className="selection-roster-header">
          <span>Your Team ({selected.length}/{maxOps})</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-sm btn-ghost" onClick={autoFill}>Auto-fill</button>
            <button className="btn btn-sm btn-ghost" onClick={() => setSelected([])}>Clear</button>
          </div>
        </div>
        {selected.length === 0 ? (
          <div className="selection-empty">Select operatives from below to build your kill team.</div>
        ) : (
          <div className="selection-slots">
            {selected.map((op, i) => (
              <div key={i} className="selection-slot">
                <div className="selection-slot-info">
                  <span className="selection-slot-name">{op.name}</span>
                  <span className="selection-slot-role"><GoldIcon name={`role-${op.role.toLowerCase().split(' ')[0]}`} size={14} /> {op.role}</span>
                </div>
                <div className="selection-slot-stats">
                  M:{op.movement}" · APL:{op.apl} · SV:{op.save}+ · W:{op.wounds}
                </div>
                <button className="selection-slot-remove" onClick={() => removeOp(i)}>✕</button>
              </div>
            ))}
            {Array.from({ length: maxOps - selected.length }, (_, i) => (
              <div key={`empty-${i}`} className="selection-slot empty">
                <span className="selection-slot-name">Empty slot</span>
              </div>
            ))}
          </div>
        )}
        {validation.errors.length > 0 && (
          <div className="selection-errors">
            {validation.errors.map((e, i) => <div key={i} className="selection-error">⚠ {e}</div>)}
          </div>
        )}
      </div>

      {/* Available operatives */}
      {leaders.length > 0 && (
        <div className="selection-section">
          <h3 className="section-title"><GoldIcon name="crown" size={18} /> Leaders (pick {rule?.leaderSlots || 1})</h3>
          <div className="selection-options">
            {leaders.map((op, i) => {
              const count = selected.filter(s => s.name === op.name).length;
              const isUnique = rule?.uniqueOnly.includes(op.name);
              const disabled = (isUnique && count >= 1) || selected.length >= maxOps;
              return (
                <div key={i} className={`selection-op-card ${disabled ? 'disabled' : ''}`} onClick={() => !disabled && addOp(op)}>
                  <div className="selection-op-header">
                    <span className="selection-op-name">{op.name}</span>
                    {isUnique && <span className="selection-op-unique">UNIQUE</span>}
                    {count > 0 && <span className="selection-op-count">×{count}</span>}
                  </div>
                  <div className="selection-op-stats">M:{op.movement}" · APL:{op.apl} · SV:{op.save}+ · W:{op.wounds}</div>
                  <div className="selection-op-weapons">
                    {op.weapons.map(w => (
                      <div key={w.name} className="selection-op-weapon">{w.type === 'ranged' ? <GoldIcon name="pistol" size={12} /> : <GoldIcon name="sword2" size={12} />} {w.name} ({w.attacks}A {w.skill}+ {w.normalDmg}/{w.critDmg})</div>
                    ))}
                  </div>
                  {op.abilities.length > 0 && (
                    <div className="selection-op-abilities">{op.abilities[0]}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="selection-section">
        <h3 className="section-title"><GoldIcon name="campaigns" size={16} /> Operatives (pick {rule?.regularSlots || 5})</h3>
        <div className="selection-options">
          {regulars.map((op, i) => {
            const count = selected.filter(s => s.name === op.name).length;
            const isUnique = rule?.uniqueOnly.includes(op.name);
            const canDuplicate = rule?.duplicatesAllowed.includes(op.name);
            const disabled = (isUnique && count >= 1) || (!canDuplicate && count >= 1) || selected.length >= maxOps;
            return (
              <div key={i} className={`selection-op-card ${disabled ? 'disabled' : ''}`} onClick={() => !disabled && addOp(op)}>
                <div className="selection-op-header">
                  <span className="selection-op-name">{op.name}</span>
                  {isUnique && <span className="selection-op-unique">UNIQUE</span>}
                  {canDuplicate && <span className="selection-op-dupe">CAN DUPLICATE</span>}
                  {count > 0 && <span className="selection-op-count">×{count}</span>}
                </div>
                <div className="selection-op-stats">M:{op.movement}" · APL:{op.apl} · SV:{op.save}+ · W:{op.wounds}</div>
                <div className="selection-op-weapons">
                  {op.weapons.slice(0, 2).map(w => (
                    <div key={w.name} className="selection-op-weapon">{w.type === 'ranged' ? <GoldIcon name="pistol" size={12} /> : <GoldIcon name="sword2" size={12} />} {w.name} ({w.attacks}A {w.skill}+ {w.normalDmg}/{w.critDmg})</div>
                  ))}
                  {op.weapons.length > 2 && <div className="selection-op-weapon">+{op.weapons.length - 2} more weapons</div>}
                </div>
                {op.abilities.length > 0 && (
                  <div className="selection-op-abilities">{op.abilities[0]}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="selection-actions">
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <button className="btn btn-primary btn-lg" onClick={() => onConfirm(selected)} disabled={!validation.valid}>
          {validation.valid ? `Confirm Team (${selected.length} operatives) →` : `Fix errors (${validation.errors.length})`}
        </button>
      </div>
    </div>
  );
}
