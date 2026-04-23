import { useState, useEffect, useCallback } from 'react';
import GoldIcon from '../GoldIcon';

// ─── Types ───
interface GamificationData {
  xp: number;
  level: number;
  title: string;
  achievements: string[];
  streak: number;
  lastActivityDate: string;
  totalPainted: number;
  totalProjectsCompleted: number;
  fastestPaint: number; // ms from unbuilt to painted
  milestones: number[]; // XP thresholds reached
}

const LEVELS = [
  { level: 1, title: 'Initiate', xp: 0, icon: 'skull' },
  { level: 2, title: 'Neophyte', xp: 100, icon: 'target' },
  { level: 3, title: 'Battle-Brother', xp: 300, icon: 'sword2' },
  { level: 4, title: 'Veteran', xp: 600, icon: 'medal' },
  { level: 5, title: 'Sergeant', xp: 1000, icon: 'shield-check' },
  { level: 6, title: 'Company Champion', xp: 1500, icon: 'crown' },
  { level: 7, title: 'Captain', xp: 2500, icon: 'eagle-shield' },
  { level: 8, title: 'Chapter Master', xp: 5000, icon: 'aquila' },
];

const ACHIEVEMENTS: Record<string, { name: string; desc: string; icon: string; check: (d: GamificationData) => boolean }> = {
  first_blood: { name: 'First Blood', desc: 'Paint your first miniature', icon: 'medal', check: d => d.totalPainted >= 1 },
  ten_painted: { name: 'Squad Leader', desc: 'Paint 10 miniatures', icon: 'campaigns', check: d => d.totalPainted >= 10 },
  fifty_painted: { name: 'Company Commander', desc: 'Paint 50 miniatures', icon: 'crown', check: d => d.totalPainted >= 50 },
  hundred_painted: { name: 'Chapter Master', desc: 'Paint 100 miniatures', icon: 'eagle-shield', check: d => d.totalPainted >= 100 },
  grey_slayer: { name: 'Grey Slayer', desc: 'Eliminate your entire grey pile', icon: 'flame-skull', check: d => d.totalPainted >= 1 && false }, // set dynamically
  speed_demon: { name: 'Speed Demon', desc: 'Paint a model in under 3 days', icon: 'lightning', check: d => d.fastestPaint > 0 && d.fastestPaint < 3 * 86400000 },
  project_first: { name: 'Project Initiator', desc: 'Complete your first project', icon: 'scroll', check: d => d.totalProjectsCompleted >= 1 },
  project_five: { name: 'Campaign Veteran', desc: 'Complete 5 projects', icon: 'victory', check: d => d.totalProjectsCompleted >= 5 },
  streak_3: { name: 'On Fire', desc: '3-day painting streak', icon: 'fist', check: d => d.streak >= 3 },
  streak_7: { name: 'Unstoppable', desc: '7-day painting streak', icon: 'flame-skull', check: d => d.streak >= 7 },
  streak_30: { name: 'Legendary Dedication', desc: '30-day painting streak', icon: 'dragon', check: d => d.streak >= 30 },
};

const STORAGE_KEY = 'grimdeck_gamification';

function getDefaultData(): GamificationData {
  return { xp: 0, level: 1, title: 'Initiate', achievements: [], streak: 0, lastActivityDate: '', totalPainted: 0, totalProjectsCompleted: 0, fastestPaint: 0, milestones: [] };
}

function loadData(): GamificationData {
  try { const s = localStorage.getItem(STORAGE_KEY); return s ? { ...getDefaultData(), ...JSON.parse(s) } : getDefaultData(); }
  catch { return getDefaultData(); }
}

function saveData(data: GamificationData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function calcLevel(xp: number) {
  let current = LEVELS[0];
  for (const l of LEVELS) { if (xp >= l.xp) current = l; }
  return current;
}

export function useGamification() {
  const [data, setData] = useState<GamificationData>(loadData);

  const save = useCallback((d: GamificationData) => { setData(d); saveData(d); }, []);

  const addXP = useCallback((amount: number, _reason: string) => {
    const d = loadData();
    d.xp += amount;
    const lvl = calcLevel(d.xp);
    if (lvl.level > d.level) {
      d.level = lvl.level;
      d.title = lvl.title;
    }
    // Update streak
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (d.lastActivityDate !== today) {
      if (d.lastActivityDate === yesterday) {
        d.streak += 1;
      } else if (d.lastActivityDate !== today) {
        d.streak = 1;
      }
      d.lastActivityDate = today;
    }
    save(d);
    return lvl.level > d.level ? lvl : null; // return new level if leveled up
  }, [save]);

  const recordPaint = useCallback((createdAt: number) => {
    const d = loadData();
    d.totalPainted += 1;
    const paintTime = Date.now() - createdAt;
    if (d.fastestPaint === 0 || paintTime < d.fastestPaint) d.fastestPaint = paintTime;
    save(d);
  }, [save]);

  const recordProjectComplete = useCallback(() => {
    const d = loadData();
    d.totalProjectsCompleted += 1;
    save(d);
  }, [save]);

  const getAchievements = useCallback(() => {
    const d = loadData();
    return Object.entries(ACHIEVEMENTS).map(([id, a]) => ({
      id, ...a, unlocked: d.achievements.includes(id),
    }));
  }, []);

  const checkAchievements = useCallback(() => {
    const d = loadData();
    const newAchievements: string[] = [];
    Object.entries(ACHIEVEMENTS).forEach(([id, a]) => {
      if (!d.achievements.includes(id) && a.check(d)) {
        newAchievements.push(id);
      }
    });
    if (newAchievements.length > 0) {
      d.achievements = [...d.achievements, ...newAchievements];
      save(d);
    }
    return newAchievements;
  }, [save]);

  const getLevelProgress = useCallback(() => {
    const d = loadData();
    const current = calcLevel(d.xp);
    const currentIdx = LEVELS.findIndex(l => l.xp === current.xp);
    const next = LEVELS[currentIdx + 1];
    if (!next) return { current, next: null, progress: 100 };
    const range = next.xp - current.xp;
    const into = d.xp - current.xp;
    return { current, next, progress: Math.round((into / range) * 100) };
  }, []);

  // Update streak on mount
  useEffect(() => {
    const d = loadData();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (d.lastActivityDate && d.lastActivityDate !== today && d.lastActivityDate !== yesterday) {
      d.streak = 0;
      save(d);
    }
  }, [save]);

  return { data, addXP, recordPaint, recordProjectComplete, getAchievements, checkAchievements, getLevelProgress, LEVELS };
}

// ─── UI Components ───

export function LevelBadge() {
  const { getLevelProgress } = useGamification();
  const { current, next, progress } = getLevelProgress();
  return (
    <div className="level-badge">
      <div className="level-badge-left">
        <GoldIcon name={current.icon} size={18} />
        <div>
          <div className="level-badge-title">{current.title}</div>
          <div className="level-badge-rank">Rank {current.level}</div>
        </div>
      </div>
      <div className="level-badge-right">
        <div className="level-bar"><div className="level-bar-fill" style={{ width: `${progress}%` }} /></div>
        {next && <div className="level-bar-label">{next.title}</div>}
      </div>
    </div>
  );
}

export function StreakCounter() {
  const { data } = useGamification();
  if (data.streak < 1) return null;
  return (
    <div className="streak-counter">
      <GoldIcon name="flame-skull" size={16} />
      <span className="streak-num">{data.streak}</span>
      <span className="streak-label">{data.streak === 1 ? 'day' : 'days'}</span>
    </div>
  );
}

export function AchievementGrid() {
  const { getAchievements } = useGamification();
  const achievements = getAchievements();
  if (achievements.length === 0) return null;
  return (
    <div className="achievement-grid">
      <h3 className="achievement-title"><GoldIcon name="crown" size={18} /> Achievements</h3>
      <div className="achievement-items">
        {achievements.map(a => (
          <div key={a.id} className={`achievement-item ${a.unlocked ? 'unlocked' : 'locked'}`} title={a.desc}>
            <div className="achievement-icon"><GoldIcon name={a.icon} size={20} /></div>
            <div className="achievement-info">
              <div className="achievement-name">{a.name}</div>
              <div className="achievement-desc">{a.desc}</div>
            </div>
            {a.unlocked && <div className="achievement-check"><GoldIcon name="medal" size={14} /></div>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function XPPopup({ xp, reason, onDismiss }: { xp: number; reason: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 2500);
    return () => clearTimeout(t);
  }, [onDismiss]);
  return (
    <div className="xp-popup" onClick={onDismiss}>
      <div className="xp-popup-content">
        <GoldIcon name="lightning" size={24} />
        <div className="xp-popup-text">
          <div className="xp-popup-amount">+{xp} XP</div>
          <div className="xp-popup-reason">{reason}</div>
        </div>
      </div>
    </div>
  );
}
