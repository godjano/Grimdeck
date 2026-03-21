import type { MissionNode } from './campaign-engine';

const P = '{PLAYER_FACTION}';
const E = '{ENEMY_FACTION}';

export const SIDE_MISSIONS: MissionNode[] = [
  {
    id: 'side_rescue', act: 0, title: 'Rescue Mission', type: 'recon', difficulty: 1,
    briefing: `Intelligence reports a captured ${P} operative is being held in a ${E} outpost. Get in, extract them, get out.`,
    objectiveText: 'Reach the centre objective and hold it for 1 turning point, then extract.',
    winNext: '', lossNext: '',
    winNarrative: `The operative is rescued. They share valuable intel about ${E} positions. Your team grows stronger.`,
    lossNarrative: `The rescue failed. The ${E} were too well prepared. The operative remains in enemy hands.`,
  },
  {
    id: 'side_sabotage', act: 0, title: 'Sabotage Run', type: 'combat', difficulty: 2,
    briefing: `A ${E} ammunition depot has been located. Destroy it to weaken their forces for the battles ahead.`,
    objectiveText: 'Place charges on 2 objectives (perform mission action within 1").',
    winNext: '', lossNext: '',
    winNarrative: `The depot erupts in a massive explosion. ${E} forces in the sector will be fighting with reduced ammunition.`,
    lossNarrative: `The charges were discovered and disarmed. The ${E} depot remains operational.`,
  },
  {
    id: 'side_assassinate', act: 0, title: 'Assassination', type: 'combat', difficulty: 3,
    briefing: `A high-value ${E} target has been spotted moving through the sector with minimal escort. Eliminate them.`,
    objectiveText: 'Eliminate the enemy leader before turning point 3.',
    winNext: '', lossNext: '',
    winNarrative: `The target is down. ${E} command structure is in disarray. This will make the final assault easier.`,
    lossNarrative: `The target escaped. They'll be more cautious now, and their forces are on high alert.`,
  },
  {
    id: 'side_holdtheline', act: 0, title: 'Hold the Line', type: 'defense', difficulty: 2,
    briefing: `${E} forces are probing your defensive perimeter. Hold your position until reinforcements arrive.`,
    objectiveText: 'Control at least 2 objectives at the end of turning point 4.',
    winNext: '', lossNext: '',
    winNarrative: `The line held. ${E} forces withdrew after taking heavy casualties. Your position is secure.`,
    lossNarrative: `The perimeter was breached. Your team fell back to secondary positions. Ground was lost.`,
  },
  {
    id: 'side_convoy', act: 0, title: 'Convoy Ambush', type: 'combat', difficulty: 2,
    briefing: `A ${E} supply convoy is passing through the sector. Ambush it and seize the supplies.`,
    objectiveText: 'Control the centre 3 objectives by end of game.',
    winNext: '', lossNext: '',
    winNarrative: `The convoy is captured. Medical supplies, ammunition, and rations — your team is resupplied.`,
    lossNarrative: `The convoy escort was stronger than expected. The supplies continue to the ${E} front lines.`,
  },
  {
    id: 'side_recon', act: 0, title: 'Deep Recon', type: 'recon', difficulty: 1,
    briefing: `Command needs eyes on ${E} positions in the adjacent sector. Scout and report back.`,
    objectiveText: 'Have an operative within 2" of each objective at any point during the game.',
    winNext: '', lossNext: '',
    winNarrative: `Recon complete. The intelligence gathered reveals a weakness in the ${E} defences.`,
    lossNarrative: `Your scouts were detected. The ${E} know you're watching. They'll adjust their positions.`,
  },
];
