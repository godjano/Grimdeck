import { useState, useRef, type DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import GoldIcon from '../GoldIcon';
import type { MiniatureModel, ModelStatus } from '../../types';

const PIPELINE_STAGES: { status: ModelStatus; label: string; color: string; accent: string }[] = [
  { status: 'unbuilt', label: 'Unbuilt', color: 'rgba(150,150,150,0.08)', accent: '#888' },
  { status: 'built', label: 'Built', color: 'rgba(196,149,42,0.06)', accent: '#c4952a' },
  { status: 'primed', label: 'Primed', color: 'rgba(220,220,220,0.06)', accent: '#ccc' },
  { status: 'wip', label: 'WIP', color: 'rgba(249,115,22,0.08)', accent: '#f97316' },
  { status: 'painted', label: 'Painted', color: 'rgba(196,149,42,0.08)', accent: '#e8c040' },
  { status: 'based', label: 'Based', color: 'rgba(30,115,49,0.08)', accent: '#1e7331' },
];

function getNextStatus(status: ModelStatus): ModelStatus | null {
  const idx = PIPELINE_STAGES.findIndex(s => s.status === status);
  return idx < PIPELINE_STAGES.length - 1 ? PIPELINE_STAGES[idx + 1].status : null;
}

function getTimeInStage(model: MiniatureModel): string {
  if (model.lastPaintedAt && model.status !== 'unbuilt') {
    const days = Math.floor((Date.now() - model.lastPaintedAt) / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return '1 day';
    return `${days} days`;
  }
  const days = Math.floor((Date.now() - model.createdAt) / 86400000);
  if (days === 0) return 'New';
  if (days === 1) return '1 day';
  return `${days} days`;
}

interface PipelineKanbanProps {
  models: MiniatureModel[];
  onUpdateStatus: (id: number, status: ModelStatus) => void;
}

export default function PipelineKanban({ models, onUpdateStatus }: PipelineKanbanProps) {
  const nav = useNavigate();
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [justDropped, setJustDropped] = useState<string | null>(null);
  const colRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleDragStart = (e: DragEvent, id: number) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(id));
    (e.target as HTMLElement).classList.add('pipeline-dragging');
  };

  const handleDragEnd = (e: DragEvent) => {
    setDraggedId(null);
    setDragOverCol(null);
    (e.target as HTMLElement).classList.remove('pipeline-dragging');
  };

  const handleDragOver = (e: DragEvent, status: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(status);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e: DragEvent, status: ModelStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const id = Number(e.dataTransfer.getData('text/plain'));
    if (id && id !== draggedId) {
      onUpdateStatus(id, status);
      setJustDropped(`${id}-${status}`);
      setTimeout(() => setJustDropped(null), 600);
    }
    setDraggedId(null);
  };

  return (
    <div className="pipeline-kanban">
      {PIPELINE_STAGES.map(stage => {
        const colModels = models.filter(m => m.status === stage.status);
        const isOver = dragOverCol === stage.status;
        const totalQty = colModels.reduce((s, m) => s + m.quantity, 0);
        const colFillPct = models.length > 0 ? Math.round((colModels.length / models.length) * 100) : 0;

        return (
          <div
            key={stage.status}
            ref={el => { colRefs.current[stage.status] = el; }}
            className={`pipeline-col ${isOver ? 'pipeline-col-over' : ''}`}
            style={{ '--col-accent': stage.accent, '--col-bg': stage.color } as React.CSSProperties}
            onDragOver={e => handleDragOver(e, stage.status)}
            onDragLeave={handleDragLeave}
            onDrop={e => handleDrop(e, stage.status)}
          >
            {/* Column header */}
            <div className="pipeline-col-header">
              <div className="pipeline-col-title" style={{ color: stage.accent }}>{stage.label}</div>
              <div className="pipeline-col-count">{totalQty}</div>
            </div>

            {/* Mini progress bar for column fill */}
            <div className="pipeline-col-bar">
              <div className="pipeline-col-bar-fill" style={{ width: `${colFillPct}%`, background: stage.accent }} />
            </div>

            {/* Cards */}
            <div className="pipeline-col-cards">
              {colModels.map(m => {
                const next = getNextStatus(m.status);
                const isDragged = draggedId === m.id;
                const wasDropped = justDropped === `${m.id}-${m.status}`;
                return (
                  <div
                    key={m.id}
                    className={`pipeline-card ${isDragged ? 'pipeline-dragging' : ''} ${wasDropped ? 'pipeline-dropped' : ''}`}
                    draggable
                    onDragStart={e => handleDragStart(e, m.id!)}
                    onDragEnd={handleDragEnd}
                    onClick={() => nav(`/model/${m.id}`)}
                  >
                    {/* Photo or placeholder */}
                    {m.photoUrl ? (
                      <div className="pipeline-card-photo">
                        <img src={m.photoUrl} alt={m.name} loading="lazy" />
                      </div>
                    ) : (
                      <div className="pipeline-card-photo pipeline-card-photo-empty">
                        <GoldIcon name="figurine" size={24} />
                      </div>
                    )}

                    {/* Card content */}
                    <div className="pipeline-card-body">
                      <div className="pipeline-card-name">{m.name}</div>
                      <div className="pipeline-card-faction">{m.faction}</div>
                      {m.quantity > 1 && <div className="pipeline-card-qty">x{m.quantity}</div>}
                    </div>

                    {/* Time in stage badge */}
                    <div className="pipeline-card-time">{getTimeInStage(m)}</div>

                    {/* Promote button */}
                    {next && (
                      <button
                        className="pipeline-promote-btn"
                        style={{ background: stage.accent }}
                        onClick={e => { e.stopPropagation(); onUpdateStatus(m.id!, next); }}
                        title={`Move to ${next}`}
                      >
                        →
                      </button>
                    )}
                  </div>
                );
              })}
              {colModels.length === 0 && (
                <div className="pipeline-col-empty">
                  <span>Empty</span>
                  {draggedId !== null && <span className="pipeline-drop-hint">Drop here</span>}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
