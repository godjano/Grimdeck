export interface RandomEvent {
  id: string;
  name: string;
  desc: string;
  icon: string;
  effect: 'positive' | 'negative' | 'neutral';
  apply: string; // description of game effect
}

const EVENTS: RandomEvent[] = [
  // Positive
  { id: 'supply_drop', name: 'Supply Drop', desc: 'Reinforcements have sent supplies.', icon: '📦', effect: 'positive', apply: 'One friendly operative heals 3 wounds.' },
  { id: 'inspiring_speech', name: 'Inspiring Speech', desc: 'Your leader rallies the team.', icon: '📢', effect: 'positive', apply: 'All friendly operatives get +1 APL this turning point.' },
  { id: 'intel', name: 'Intelligence Report', desc: 'You intercept enemy communications.', icon: '📡', effect: 'positive', apply: 'You may activate two operatives in a row before the enemy.' },
  { id: 'cover_fire', name: 'Covering Fire', desc: 'Off-board support provides covering fire.', icon: '💥', effect: 'positive', apply: 'One enemy operative takes 3 mortal wounds.' },
  { id: 'lucky_find', name: 'Lucky Find', desc: 'An operative finds useful equipment.', icon: '🍀', effect: 'positive', apply: 'One operative gets +1 to all hit rolls this turning point.' },

  // Negative
  { id: 'ambush', name: 'Ambush!', desc: 'The enemy springs a trap.', icon: '⚠️', effect: 'negative', apply: 'One random friendly operative takes D3 mortal wounds.' },
  { id: 'comms_down', name: 'Comms Disrupted', desc: 'Your communications are jammed.', icon: '📵', effect: 'negative', apply: 'Your leader loses 1 APL this turning point.' },
  { id: 'reinforcements', name: 'Enemy Reinforcements', desc: 'More enemies arrive.', icon: '🚨', effect: 'negative', apply: 'One incapacitated enemy operative returns with half wounds.' },
  { id: 'sandstorm', name: 'Visibility Drop', desc: 'Dust, smoke, or rain reduces visibility.', icon: '🌫️', effect: 'negative', apply: 'All ranged attacks are -1 to hit this turning point.' },
  { id: 'booby_trap', name: 'Booby Trap', desc: 'An operative triggers a hidden explosive.', icon: '💣', effect: 'negative', apply: 'The next operative to move takes 2 mortal wounds.' },

  // Neutral
  { id: 'shifting_objectives', name: 'Shifting Priorities', desc: 'Command changes the mission parameters.', icon: '🔄', effect: 'neutral', apply: 'Objective control is reset. All objectives become neutral.' },
  { id: 'fog', name: 'Dense Fog', desc: 'Fog rolls across the battlefield.', icon: '🌁', effect: 'neutral', apply: 'No shooting beyond 12" this turning point.' },
  { id: 'tremor', name: 'Ground Tremor', desc: 'The ground shakes violently.', icon: '🌋', effect: 'neutral', apply: 'All operatives within 3" of terrain take 1 mortal wound.' },
];

export function rollRandomEvent(): RandomEvent {
  // 40% chance of event each turning point
  if (Math.random() > 0.4) return { id: 'none', name: 'No Event', desc: 'The battle continues as normal.', icon: '—', effect: 'neutral', apply: 'No special effect.' };
  return EVENTS[Math.floor(Math.random() * EVENTS.length)];
}
