import { useState } from 'react';

interface StreakData {
  dates: string[]; // YYYY-MM-DD of days painted
  currentStreak: number;
  longestStreak: number;
  lastDate: string;
}

const CHALLENGES = [
  '🎨 Paint one face today',
  '🖌️ Base coat 3 models',
  '✨ Edge highlight one model',
  '🫧 Prime something from the pile',
  '🌊 Shade wash one unit',
  '📸 Take a progress photo',
  '🔍 Paint the details on one model',
  '🏔️ Base one model completely',
  '⚡ Speed paint: finish one model in under 1 hour',
  '🎯 Paint something you\'ve been avoiding',
  '✂️ Assemble and clean 5 models',
  '🧪 Try a new technique you haven\'t used before',
  '🎨 Paint using only 3 colours',
  '📝 Log a painting session with notes',
];

function getStreakData(): StreakData {
  try { return JSON.parse(localStorage.getItem('grimdeck_streak') || '{}'); }
  catch { return { dates: [], currentStreak: 0, longestStreak: 0, lastDate: '' }; }
}

function saveStreakData(data: StreakData) {
  localStorage.setItem('grimdeck_streak', JSON.stringify(data));
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function getDailyChallenge(): string {
  const day = Math.floor(Date.now() / 86400000);
  return CHALLENGES[day % CHALLENGES.length];
}

export function logPaintingDay() {
  const data = getStreakData();
  const today = getToday();
  if (data.dates?.includes(today)) return data;

  const dates = [...(data.dates || []), today];
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const currentStreak = data.lastDate === yesterday ? (data.currentStreak || 0) + 1 : 1;
  const longestStreak = Math.max(currentStreak, data.longestStreak || 0);

  const newData = { dates, currentStreak, longestStreak, lastDate: today };
  saveStreakData(newData);
  return newData;
}

export default function PaintingStreak() {
  const [data, setData] = useState<StreakData>(getStreakData);
  
  const today = getToday();
  const paintedToday = data.dates?.includes(today);

  const handleLog = () => {
    const newData = logPaintingDay();
    setData(newData);
    
  };

  // Calendar: last 28 days
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(Date.now() - (27 - i) * 86400000);
    const dateStr = d.toISOString().slice(0, 10);
    return { date: dateStr, day: d.getDate(), dow: d.getDay(), painted: data.dates?.includes(dateStr) };
  });

  return (
    <div className="streak-card">
      <div className="streak-header">
        <div>
          <div className="streak-fire">{data.currentStreak > 0 ? '🔥' : '❄️'} {data.currentStreak || 0} day streak</div>
          <div className="streak-best">Best: {data.longestStreak || 0} days · {data.dates?.length || 0} total sessions</div>
        </div>
        {!paintedToday && (
          <button className="btn btn-sm btn-primary" onClick={handleLog}>✓ I painted today</button>
        )}
        {paintedToday && <span className="streak-done">✅ Logged today!</span>}
      </div>

      <div className="streak-calendar">
        {days.map(d => (
          <div key={d.date} className={`streak-day ${d.painted ? 'painted' : ''} ${d.date === today ? 'today' : ''}`} title={d.date}>
            {d.day}
          </div>
        ))}
      </div>

      <div className="streak-challenge">
        <span className="streak-challenge-label">Today's Challenge:</span>
        <span className="streak-challenge-text">{getDailyChallenge()}</span>
      </div>
    </div>
  );
}
