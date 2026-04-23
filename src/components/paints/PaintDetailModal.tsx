import React, { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import type { Paint } from '../../types';
import GoldIcon from '../GoldIcon';

interface PaintDetailModalProps {
  paint: Paint;
  onClose: () => void;
  usageCount: number;
}

export default function PaintDetailModal({ paint, onClose, usageCount }: PaintDetailModalProps) {
  const linkedModels = useLiveQuery(
    () => db.modelPaintLinks.where('paintId').equals(paint.id!).toArray(),
    [paint.id]
  ) ?? [];

  // Fetch model names for linked models
  const modelIds = [...new Set(linkedModels.map(l => l.modelId))];
  const models = useLiveQuery(
    () => modelIds.length > 0 ? db.models.where('id').anyOf(modelIds).toArray() as any : Promise.resolve([]) as any,
    [modelIds.join(',')]
  ) as any ?? [];

  const modelMap = new Map(models.map((m: any) => [m.id, m.name]));
  const getModelName = (id: number) => modelMap.get(id) || `Model #${id}`;

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  const updateQuantity = async (delta: number) => {
    const newQty = Math.max(0, paint.quantity + delta);
    await db.paints.update(paint.id!, { quantity: newQty });
  };

  const restock = async () => {
    await db.paints.update(paint.id!, { quantity: paint.quantity + 1 });
  };

  const deletePaint = async () => {
    await db.paints.delete(paint.id!);
    await db.modelPaintLinks.where('paintId').equals(paint.id!).delete();
    onClose();
  };

  return (
    <div className="paint-detail-modal" onClick={handleBackdropClick}>
      <div className="paint-detail-panel">
        {/* Close button */}
        <button className="paint-detail-close" onClick={onClose}>
          ✕
        </button>

        {/* Header: Swatch + Info */}
        <div className="paint-detail-header">
          <div
            className="paint-detail-swatch"
            style={{ background: paint.hexColor || '#555' }}
          />
          <div className="paint-detail-info">
            <h3 className="paint-detail-name">{paint.name}</h3>
            <div className="paint-detail-meta">
              <span className="paint-detail-brand">{paint.brand}</span>
              {paint.range && <span className="paint-detail-range"> · {paint.range}</span>}
              <span className="paint-detail-type"> · {paint.type}</span>
            </div>
            <div className="paint-detail-hex">
              <span className="paint-detail-hex-label">HEX</span>
              <span className="paint-detail-hex-value">{paint.hexColor || '—'}</span>
            </div>
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="paint-detail-qty-section">
          <div className="paint-detail-qty-label">
            <GoldIcon name="paint-pot" size={14} />
            Quantity
          </div>
          <div className="paint-detail-qty-controls">
            <button
              className="paint-detail-qty-btn"
              onClick={() => updateQuantity(-1)}
              disabled={paint.quantity <= 0}
            >
              −
            </button>
            <span className={`paint-detail-qty-num ${paint.quantity === 0 ? 'empty' : ''} ${paint.quantity <= 1 ? 'low' : ''}`}>
              {paint.quantity}
            </span>
            <button className="paint-detail-qty-btn" onClick={() => updateQuantity(1)}>
              +
            </button>
          </div>
          <button className="paint-detail-restock-btn" onClick={restock}>
            <GoldIcon name="brushes" size={12} />
            Restock +1
          </button>
        </div>

        {/* Usage Info */}
        {usageCount > 0 && (
          <div className="paint-detail-usage">
            <div className="paint-detail-usage-label">
              <GoldIcon name="tome" size={14} />
              Used in {usageCount} recipe{usageCount > 1 ? 's' : ''}
            </div>
          </div>
        )}

        {/* Linked Models / Recipes */}
        {linkedModels.length > 0 && (
          <div className="paint-detail-recipes">
            <div className="paint-detail-recipes-label">
              <GoldIcon name="target" size={14} />
              Recipes using this paint
            </div>
            <div className="paint-detail-recipes-list">
              {linkedModels.map(link => {
                const modelName = getModelName(link.modelId);
                return (
                  <div key={link.id} className="paint-detail-recipe-item">
                    <div className="paint-detail-recipe-swatch" style={{ background: paint.hexColor || '#555' }} />
                    <div className="paint-detail-recipe-info">
                      <span className="paint-detail-recipe-model">{String(modelName)}</span>
                      {(link.area || link.technique) && (
                        <span className="paint-detail-recipe-detail">
                          {link.area}{link.area && link.technique ? ' · ' : ''}{link.technique}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Notes */}
        {paint.notes && (
          <div className="paint-detail-notes">
            <div className="paint-detail-notes-label">Notes</div>
            <div className="paint-detail-notes-text">{paint.notes}</div>
          </div>
        )}

        {/* Delete Button */}
        <div className="paint-detail-footer">
          <button className="paint-detail-delete-btn" onClick={deletePaint}>
            Delete Paint
          </button>
        </div>
      </div>
    </div>
  );
}
