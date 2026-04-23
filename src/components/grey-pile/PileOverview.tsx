import { useMemo } from 'react';
import GoldIcon from '../GoldIcon';

interface PileOverviewProps {
  totalGrey: number;
  totalWip: number;
  totalPainted: number;
  totalAll: number;
  greyModels: any[];
  oldestModel: any | null;
  recentPaintCount: number;
}

export default function PileOverview({ totalGrey, totalWip, totalPainted, totalAll, greyModels, oldestModel, recentPaintCount }: PileOverviewProps) {
  const pctDone = totalAll > 0 ? Math.round((totalPainted / totalAll) * 100) : 0;
  const estHours = Math.round((totalGrey / 5) * 2);

  const daysInPile = useMemo(() => {
    if (!oldestModel) return null;
    return Math.floor((Date.now() - oldestModel.createdAt) / 86400000);
  }, [oldestModel]);

  const velocity = useMemo(() => {
    if (recentPaintCount > 0) return 'shrinking';
    if (totalWip > 0) return 'active';
    return 'stagnant';
  }, [recentPaintCount, totalWip]);

  const velocityConfig = {
    shrinking: { label: 'Pile is shrinking!', color: '#1e7331', icon: 'medal' },
    active: { label: 'Active painting session', color: '#f97316', icon: 'paints' },
    stagnant: { label: 'No recent activity', color: '#8a0808', icon: 'skull' },
  };

  const v = velocityConfig[velocity];

  return (
    <div className="pile-overview">
      {/* Background image layer */}
      <div className="pile-overview-bg" />

      {/* Ember particles */}
      <div className="pile-embers">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="pile-ember" style={{
            left: `${8 + (i * 8)}%`,
            animationDelay: `${i * 0.7}s`,
            animationDuration: `${3 + (i % 4)}s`,
          }} />
        ))}
      </div>

      {/* Main content */}
      <div className="pile-overview-content">
        {/* Left: Shame number + velocity */}
        <div className="pile-overview-left">
          <div className="pile-eyebrow">
            <GoldIcon name="skull" size={14} />
            THE PILE OF SHAME
          </div>
          <div className="pile-number-row">
            <div className="pile-big-number">{totalGrey}</div>
            <div className="pile-big-label">
              unpainted <br />
              <span className="pile-big-unit">{totalGrey === 1 ? 'miniature' : 'miniatures'}</span>
            </div>
          </div>

          {/* Animated progress bar */}
          <div className="pile-progress-bar-container">
            <div className="pile-progress-bar">
              <div className="pile-progress-fill" style={{ width: `${pctDone}%` }}>
                <div className="pile-progress-shimmer" />
              </div>
            </div>
            <div className="pile-progress-labels">
              <span className="pile-progress-pct">{pctDone}% painted</span>
              <span className="pile-progress-count">{totalPainted} / {totalAll}</span>
            </div>
          </div>

          {/* Velocity indicator */}
          <div className="pile-velocity" style={{ color: v.color }}>
            <GoldIcon name={v.icon} size={14} />
            <span>{v.label}</span>
            {recentPaintCount > 0 && (
              <span className="pile-velocity-detail">· {recentPaintCount} painted this month</span>
            )}
          </div>
        </div>

        {/* Right: Stats ring + extras */}
        <div className="pile-overview-right">
          {/* SVG Ring */}
          <div className="pile-ring">
            <svg viewBox="0 0 120 120" className="pile-ring-svg">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle cx="60" cy="60" r="52" fill="none"
                stroke="url(#pileGrad)" strokeWidth="8"
                strokeDasharray={`${pctDone * 3.27} ${327 - pctDone * 3.27}`}
                strokeDashoffset="82" strokeLinecap="round"
                className="pile-ring-progress" />
              <defs>
                <linearGradient id="pileGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c4952a" />
                  <stop offset="100%" stopColor="#1e7331" />
                </linearGradient>
              </defs>
            </svg>
            <div className="pile-ring-text">
              <div className="pile-ring-pct">{pctDone}%</div>
              <div className="pile-ring-label">complete</div>
            </div>
          </div>

          {/* Time estimates */}
          <div className="pile-stats-mini">
            {estHours > 0 && (
              <div className="pile-stat-mini">
                <GoldIcon name="winged-hour" size={14} />
                <span>~{estHours}h to paint</span>
              </div>
            )}
            {totalWip > 0 && (
              <div className="pile-stat-mini pile-stat-mini-wip">
                <GoldIcon name="paints" size={14} />
                <span>{totalWip} on the desk</span>
              </div>
            )}
            {daysInPile !== null && daysInPile > 0 && (
              <div className="pile-stat-mini pile-stat-mini-old">
                <GoldIcon name="skull-bones" size={14} />
                <span>Oldest: {daysInPile} days grey</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="pile-quick-stats">
        <div className="pile-qs pile-qs-unbuilt">
          <div className="pile-qs-num">{greyModels.filter((m: any) => m.status === 'unbuilt').reduce((s: number, m: any) => s + m.quantity, 0)}</div>
          <div className="pile-qs-label">Unbuilt</div>
        </div>
        <div className="pile-qs-divider" />
        <div className="pile-qs pile-qs-built">
          <div className="pile-qs-num">{greyModels.filter((m: any) => m.status === 'built').reduce((s: number, m: any) => s + m.quantity, 0)}</div>
          <div className="pile-qs-label">Built</div>
        </div>
        <div className="pile-qs-divider" />
        <div className="pile-qs pile-qs-primed">
          <div className="pile-qs-num">{greyModels.filter((m: any) => m.status === 'primed').reduce((s: number, m: any) => s + m.quantity, 0)}</div>
          <div className="pile-qs-label">Primed</div>
        </div>
        <div className="pile-qs-divider" />
        <div className="pile-qs pile-qs-wip">
          <div className="pile-qs-num">{totalWip}</div>
          <div className="pile-qs-label">WIP</div>
        </div>
        <div className="pile-qs-divider" />
        <div className="pile-qs pile-qs-done">
          <div className="pile-qs-num">{totalPainted}</div>
          <div className="pile-qs-label">Done</div>
        </div>
      </div>
    </div>
  );
}
