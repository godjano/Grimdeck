import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../db';
import type { MiniatureModel } from '../types';

type ProjectSize = 'small' | 'medium' | 'big';

interface ProjectStep {
  id: string;
  label: string;
  desc: string;
  icon: string;
  done: boolean;
}

interface Project {
  model: MiniatureModel;
  size: ProjectSize;
  steps: ProjectStep[];
  tips: string[];
}

const SIZE_CONFIG: Record<ProjectSize, { label: string; icon: string; desc: string; maxQty: number }> = {
  small: { label: 'Quick Win', icon: '⚡', desc: '1 model, ~1-2 hours', maxQty: 1 },
  medium: { label: 'Weekend Project', icon: '🎯', desc: '3-5 models, ~3-5 hours', maxQty: 5 },
  big: { label: 'Campaign Push', icon: '🏔️', desc: '10+ models, full army unit', maxQty: 999 },
};

function generateSteps(model: MiniatureModel): ProjectStep[] {
  const steps: ProjectStep[] = [
    { id: 'clean', label: 'Clean & Assemble', desc: 'Remove from sprue, clean mould lines, glue together', icon: '✂️', done: model.status !== 'unbuilt' },
    { id: 'prime', label: 'Prime', desc: 'Apply primer spray (black, grey, or white depending on scheme)', icon: '🫧', done: ['primed', 'wip', 'painted', 'based'].includes(model.status) },
    { id: 'base_coat', label: 'Base Coat', desc: 'Apply main colours to all areas — armour, cloth, skin, metals', icon: '🎨', done: ['painted', 'based'].includes(model.status) },
    { id: 'shade', label: 'Shade / Wash', desc: 'Apply washes to add depth — Nuln Oil for metals, Agrax for warm tones', icon: '🌊', done: ['painted', 'based'].includes(model.status) },
    { id: 'highlight', label: 'Highlight', desc: 'Edge highlight or drybrush raised areas for definition', icon: '✨', done: ['painted', 'based'].includes(model.status) },
    { id: 'details', label: 'Details', desc: 'Eyes, lenses, purity seals, small details that bring it to life', icon: '🔍', done: ['painted', 'based'].includes(model.status) },
    { id: 'base', label: 'Base', desc: 'Apply texture paint, drybrush, add tufts or static grass', icon: '🏔️', done: model.status === 'based' },
    { id: 'varnish', label: 'Varnish', desc: 'Protect with matte varnish spray — your model is complete!', icon: '🛡️', done: false },
  ];
  return steps;
}

function getMotivation(): string {
  const msgs = [
    "Every painted model is a victory against the grey pile! 🏆",
    "The Emperor protects... but only painted models. 🪖",
    "Two thin coats and you're halfway there! 🖌️",
    "Progress, not perfection. Get it on the table! ⚔️",
    "A painted army is a happy army. Let's go! 💪",
    "The pile won't paint itself. But you've got this! 🔥",
    "One model at a time. That's how legends are built. 🌟",
  ];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

export default function ProjectGenerator() {
  const models = useLiveQuery(() => db.models.toArray()) ?? [];
  const nav = useNavigate();
  const [project, setProject] = useState<Project | null>(() => {
    try { const s = localStorage.getItem('grimdeck_project'); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [size, setSize] = useState<ProjectSize>(() => (localStorage.getItem('grimdeck_project_size') as ProjectSize) || 'small');
  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(() => {
    try { const s = localStorage.getItem('grimdeck_project_steps'); return s ? new Set(JSON.parse(s)) : new Set(); } catch { return new Set(); }
  });

  // Persist project state
  const saveProject = (p: Project | null) => {
    setProject(p);
    if (p) localStorage.setItem('grimdeck_project', JSON.stringify(p));
    else localStorage.removeItem('grimdeck_project');
  };

  const saveSteps = (steps: Set<string>) => {
    setCheckedSteps(steps);
    localStorage.setItem('grimdeck_project_steps', JSON.stringify([...steps]));
  };

  const unpainted = models.filter(m => !m.wishlist && ['unbuilt', 'built', 'primed'].includes(m.status));

  const generate = () => {
    const cfg = SIZE_CONFIG[size];
    const eligible = size === 'big' ? unpainted : unpainted.filter(m => m.quantity <= cfg.maxQty);
    if (eligible.length === 0) return;

    const model = eligible[Math.floor(Math.random() * eligible.length)];
    const steps = generateSteps(model);
    const tips = [
      `Start with ${model.faction} colours — check the Recipes section for ideas.`,
      model.quantity > 1 ? `Batch paint all ${model.quantity} together — assembly line method is faster!` : 'Take your time with this one — single models deserve extra attention.',
      'Put on a podcast or YouTube video while you paint. Time flies!',
    ];

    saveProject({ model, size, steps, tips });
    saveSteps(new Set(steps.filter(s => s.done).map(s => s.id)));
  };

  const toggleStep = (stepId: string) => {
    const next = new Set(checkedSteps);
    next.has(stepId) ? next.delete(stepId) : next.add(stepId);
    saveSteps(next);

    // Auto-update model status based on progress
    if (project) {
      const allDone = project.steps.every(s => next.has(s.id));
      const paintDone = ['base_coat', 'shade', 'highlight', 'details'].every(id => next.has(id));
      const baseDone = next.has('base');

      if (allDone || (paintDone && baseDone)) {
        db.models.update(project.model.id!, { status: 'based' });
      } else if (paintDone) {
        db.models.update(project.model.id!, { status: 'painted' });
      } else if (next.has('base_coat')) {
        db.models.update(project.model.id!, { status: 'wip' });
      } else if (next.has('prime')) {
        db.models.update(project.model.id!, { status: 'primed' });
      } else if (next.has('clean')) {
        db.models.update(project.model.id!, { status: 'built' });
      }
    }
  };

  const completedCount = checkedSteps.size;
  const totalSteps = project?.steps.length || 8;
  const pct = Math.round((completedCount / totalSteps) * 100);

  return (
    <div className="project-gen">
      {!project ? (
        <div className="project-picker">
          <h3>🎲 Project Generator</h3>
          <p className="settings-desc">Pick a project size and we'll choose a random model from your pile with a step-by-step plan.</p>
          <div className="project-sizes">
            {(['small', 'medium', 'big'] as ProjectSize[]).map(s => (
              <button key={s} className={`project-size-btn ${size === s ? 'active' : ''}`} onClick={() => { setSize(s); localStorage.setItem('grimdeck_project_size', s); }}>
                <span className="project-size-icon">{SIZE_CONFIG[s].icon}</span>
                <span className="project-size-label">{SIZE_CONFIG[s].label}</span>
                <span className="project-size-desc">{SIZE_CONFIG[s].desc}</span>
              </button>
            ))}
          </div>
          <button className="btn btn-primary btn-lg" onClick={generate} disabled={unpainted.length === 0} style={{ marginTop: 16, width: '100%' }}>
            {unpainted.length > 0 ? `🎲 Generate ${SIZE_CONFIG[size].label} Project` : 'No unpainted models!'}
          </button>
        </div>
      ) : (
        <div className="project-active">
          <div className="project-header">
            <div>
              <span className="project-size-badge">{SIZE_CONFIG[project.size].icon} {SIZE_CONFIG[project.size].label}</span>
              <h3 className="project-model-name">{project.model.name}</h3>
              <p className="project-model-meta">{project.model.faction} · ×{project.model.quantity}</p>
            </div>
            <div className="project-progress-ring">
              <svg viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="25" fill="none" stroke="var(--surface3)" strokeWidth="4" />
                <circle cx="30" cy="30" r="25" fill="none" stroke="var(--success)" strokeWidth="4"
                  strokeDasharray={`${pct * 1.57} ${157 - pct * 1.57}`} strokeDashoffset="39" strokeLinecap="round" />
              </svg>
              <span className="project-progress-text">{pct}%</span>
            </div>
          </div>

          <div className="project-motivation">{getMotivation()}</div>

          <div className="project-steps">
            {project.steps.map(step => (
              <div key={step.id} className={`project-step ${checkedSteps.has(step.id) ? 'done' : ''}`} onClick={() => toggleStep(step.id)}>
                <div className="project-step-check">{checkedSteps.has(step.id) ? '✅' : '⬜'}</div>
                <div className="project-step-content">
                  <div className="project-step-label">{step.icon} {step.label}</div>
                  <div className="project-step-desc">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="project-tips">
            <h4>💡 Tips</h4>
            {project.tips.map((t, i) => <p key={i}>{t}</p>)}
          </div>

          <div className="project-actions">
            <button className="btn btn-ghost" onClick={() => saveProject(null)}>← New Project</button>
            <button className="btn btn-ghost" onClick={() => nav(`/model/${project.model.id}`)}>View Model →</button>
            <button className="btn btn-ghost" onClick={() => nav('/suggestions')}>Paint Recipes →</button>
          </div>
        </div>
      )}
    </div>
  );
}
