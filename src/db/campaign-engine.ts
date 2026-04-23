import type { Operative } from '../types/campaign';

export interface MissionNode {
  id: string;
  act: number;
  title: string;
  type: 'combat' | 'recon' | 'defense' | 'boss';
  briefing: string;
  objectiveText: string;
  difficulty: 1 | 2 | 3;
  winNext: string | null;
  lossNext: string | null;
  winNarrative: string;
  lossNarrative: string;
}

const PLAYER = '{PLAYER_FACTION}';
const ENEMY = '{ENEMY_FACTION}';

// Randomized briefing variants for each mission
const BRIEFING_VARIANTS: Record<string, string[]> = {
  'a1_m1': [
    `Your ${PLAYER} kill team has been deployed to investigate reports of ${ENEMY} activity in the sector. Auspex readings are inconclusive — move in and confirm.`,
    `Command has detected unusual ${ENEMY} movement patterns in the sector. Your ${PLAYER} team is tasked with a forward reconnaissance. Expect resistance.`,
    `A distress signal from a forward outpost has gone silent. ${ENEMY} forces are suspected. Your ${PLAYER} kill team must investigate and report.`,
    `Intelligence suggests a ${ENEMY} scouting party has entered the sector. Your ${PLAYER} team must intercept before they report back to their command.`,
  ],
};

export function getRandomBriefing(missionId: string, fallback: string): string {
  const variants = BRIEFING_VARIANTS[missionId];
  if (variants && variants.length > 0) return variants[Math.floor(Math.random() * variants.length)];
  return fallback;
}

export const CAMPAIGN_MISSIONS: MissionNode[] = [
  // ACT 1
  {
    id: 'a1_m1', act: 1, title: 'First Contact', type: 'recon', difficulty: 1,
    briefing: `Your ${PLAYER} kill team has been deployed to investigate reports of ${ENEMY} activity in the sector. Auspex readings are inconclusive — move in and confirm.`,
    objectiveText: 'Scout 3 objectives. Eliminate any hostiles encountered.',
    winNext: 'a1_m2_win', lossNext: 'a1_m2_loss',
    winNarrative: `Your ${PLAYER} operatives swept through the sector with precision. The ${ENEMY} presence was confirmed and their forward scouts eliminated. Command is pleased — but this is only the beginning.`,
    lossNarrative: `The ${ENEMY} were more entrenched than expected. Your team was forced to fall back under heavy fire. Command is concerned — the enemy knows you're coming now.`,
  },
  {
    id: 'a1_m2_win', act: 1, title: 'Press the Advantage', type: 'combat', difficulty: 1,
    briefing: `With the element of surprise, command orders your ${PLAYER} team to strike a ${ENEMY} supply cache before they can reinforce.`,
    objectiveText: 'Destroy the supply cache. Hold the centre for 3 turning points.',
    winNext: 'a2_m1_strong', lossNext: 'a2_m1_normal',
    winNarrative: `The cache burns. ${ENEMY} reinforcements arrived too late — your team had already vanished into the ruins. The enemy's supply line is crippled.`,
    lossNarrative: `The ${ENEMY} defended their cache with unexpected ferocity. Your team inflicted damage but couldn't hold the position. The supplies remain intact.`,
  },
  {
    id: 'a1_m2_loss', act: 1, title: 'Desperate Regroup', type: 'defense', difficulty: 2,
    briefing: `After the failed recon, ${ENEMY} forces are hunting your team. Establish a defensive position and survive until extraction arrives.`,
    objectiveText: 'Survive 4 turning points. Keep at least half your team alive.',
    winNext: 'a2_m1_normal', lossNext: 'a2_m1_weak',
    winNarrative: `Against the odds, your ${PLAYER} operatives held the line. The extraction shuttle arrived just as the ${ENEMY} assault began to overwhelm your position. Battered but unbroken.`,
    lossNarrative: `The defensive position was overrun. Casualties were severe. Your team barely made it to extraction. Morale is shaken — but the mission continues.`,
  },
  // ACT 2
  {
    id: 'a2_m1_strong', act: 2, title: 'Behind Enemy Lines', type: 'recon', difficulty: 2,
    briefing: `Your victories have opened a path deep into ${ENEMY} territory. Intelligence suggests a command node nearby. This could end the campaign early.`,
    objectiveText: 'Infiltrate the compound. Retrieve intel from 2 data terminals.',
    winNext: 'a2_m2', lossNext: 'a2_m2',
    winNarrative: `The intel is secured. Your ${PLAYER} team moved like ghosts through the ${ENEMY} compound. The data reveals the location of their command centre.`,
    lossNarrative: `The compound's security was tighter than expected. Your team extracted with partial intel, but the ${ENEMY} are now on high alert.`,
  },
  {
    id: 'a2_m1_normal', act: 2, title: 'No Man\'s Land', type: 'combat', difficulty: 2,
    briefing: `The war zone has become a grinding stalemate. Your ${PLAYER} team must break through ${ENEMY} lines to reach the next sector.`,
    objectiveText: 'Control more objectives than the enemy by the end of turning point 4.',
    winNext: 'a2_m2', lossNext: 'a2_m2',
    winNarrative: `Inch by bloody inch, your team pushed through. The ${ENEMY} line broke and your operatives secured the crossing. The path forward is open.`,
    lossNarrative: `The ${ENEMY} held firm. Your team was pushed back to the starting positions. The stalemate continues, but you'll find another way.`,
  },
  {
    id: 'a2_m1_weak', act: 2, title: 'Survival Run', type: 'recon', difficulty: 3,
    briefing: `Your battered ${PLAYER} team is being hunted. You must reach the extraction zone across hostile territory while ${ENEMY} patrols close in.`,
    objectiveText: 'Get at least 3 operatives to the extraction zone.',
    winNext: 'a2_m2', lossNext: 'a2_m2',
    winNarrative: `Bloodied but alive. Your team made it through the ${ENEMY} net. Every operative who survived this run is forged in fire now.`,
    lossNarrative: `The ${ENEMY} patrols were relentless. Too many were lost in the crossing. The survivors carry the weight of those left behind.`,
  },
  {
    id: 'a2_m2', act: 2, title: 'The Turning Point', type: 'combat', difficulty: 2,
    briefing: `A critical ${ENEMY} relay station controls communications across the sector. Destroy it and their coordination collapses. Fail, and they'll call in overwhelming reinforcements.`,
    objectiveText: 'Destroy the relay (centre objective). Eliminate the relay guards.',
    winNext: 'a3_m1_advantage', lossNext: 'a3_m1_desperate',
    winNarrative: `The relay explodes in a shower of sparks and flame. ${ENEMY} comms go dark across the sector. Your ${PLAYER} team has turned the tide of this campaign.`,
    lossNarrative: `The relay still stands. ${ENEMY} reinforcements are inbound. Your team must fall back and prepare for the worst. The final battle will be fought on their terms.`,
  },
  // ACT 3
  {
    id: 'a3_m1_advantage', act: 3, title: 'Storm the Fortress', type: 'boss', difficulty: 2,
    briefing: `With ${ENEMY} communications down, their command centre is vulnerable. This is the final assault. Strike hard, strike fast, end this.`,
    objectiveText: 'Eliminate the enemy commander. Control the command centre.',
    winNext: null, lossNext: 'a3_m2_laststand',
    winNarrative: `The ${ENEMY} commander falls. Their forces scatter without leadership. Your ${PLAYER} kill team stands victorious in the ruins of the command centre. The sector is secured. Glory to your faction — this campaign is won.`,
    lossNarrative: `The commander escaped. Your assault was repelled at the gates. But the enemy is weakened — one final push remains.`,
  },
  {
    id: 'a3_m1_desperate', act: 3, title: 'Against All Odds', type: 'boss', difficulty: 3,
    briefing: `${ENEMY} reinforcements have arrived in force. Your ${PLAYER} team must make a desperate assault on their command post before you're overwhelmed entirely.`,
    objectiveText: 'Eliminate the enemy commander before turning point 4. Survive.',
    winNext: null, lossNext: 'a3_m2_laststand',
    winNarrative: `Against impossible odds, your team broke through. The ${ENEMY} commander is dead. Their reinforcements falter without orders. A pyrrhic victory — but victory nonetheless.`,
    lossNarrative: `The assault failed. The ${ENEMY} commander still lives. But your team refuses to break. One last chance remains.`,
  },
  {
    id: 'a3_m2_laststand', act: 3, title: 'Last Stand', type: 'boss', difficulty: 3,
    briefing: `This is it. Everything comes down to this final battle. Your battered ${PLAYER} team faces the ${ENEMY} commander and their elite guard. No retreat. No surrender.`,
    objectiveText: 'Eliminate the enemy commander. Last operative standing wins.',
    winNext: null, lossNext: null,
    winNarrative: `In the blood and dust, your last operative standing delivers the killing blow. The ${ENEMY} commander falls. It's over. Your ${PLAYER} kill team — what remains of it — has won the campaign. Heroes, every one of them. Even the fallen.`,
    lossNarrative: `Your team fought to the last. They fell, one by one, but they never broke. The ${ENEMY} holds the field, but the legend of your ${PLAYER} kill team will echo through the sector. Sometimes, the story isn't about winning.`,
  },
];

export function getMission(id: string): MissionNode | undefined {
  return [...CAMPAIGN_MISSIONS, ...XENOS_HUNT_MISSIONS].find(m => m.id === id);
}

export function fillNarrative(text: string, playerFaction: string, enemyFaction: string): string {
  return text.replace(/\{PLAYER_FACTION\}/g, playerFaction).replace(/\{ENEMY_FACTION\}/g, enemyFaction);
}

// Simple dice roller
export function rollD6(): number { return Math.floor(Math.random() * 6) + 1; }

const OPERATIVE_NAMES: Record<string, string[]> = {
  'Space Marines': ['Brother Titus', 'Brother Castiel', 'Brother Varn', 'Sergeant Theron', 'Brother Kael', 'Brother Dorn'],
  'Astra Militarum': ['Sergeant Holt', 'Trooper Vex', 'Trooper Kira', 'Corporal Dane', 'Trooper Marsh', 'Trooper Sully'],
  'Adepta Sororitas': ['Sister Mirael', 'Sister Voss', 'Sister Ardent', 'Superior Thalia', 'Sister Kyne', 'Sister Ember'],
  'Orks': ['Grot Snagga', 'Nob Gutsmash', 'Boy Dakka', 'Kommando Sneekgit', 'Burna Skorch', 'Slugga Krump'],
  'Necrons': ['Warrior Alpha-7', 'Warrior Beta-3', 'Immortal Khet', 'Deathmark Null', 'Flayed One IX', 'Warrior Gamma-1'],
  'Tyranids': ['Bioform Alpha', 'Bioform Beta', 'Synapse Node 3', 'Hunter-Killer 7', 'Lurker Prime', 'Swarm Entity 12'],
  'default': ['Operative Alpha', 'Operative Beta', 'Operative Gamma', 'Operative Delta', 'Operative Epsilon', 'Operative Zeta'],
};

const OPERATIVE_ROLES = ['Leader', 'Gunner', 'Fighter', 'Specialist', 'Scout', 'Heavy'];

export function generateRoster(faction: string): Omit<Operative, 'id' | 'campaignId'>[] {
  const names = OPERATIVE_NAMES[faction] || OPERATIVE_NAMES['default'];
  return names.map((name, i) => ({
    name, role: OPERATIVE_ROLES[i] || 'Operative',
    xp: 0, wounds: 0, maxWounds: i === 0 ? 4 : 3,
    status: 'ready' as const, kills: 0,
  }));
}

// ═══ CAMPAIGN ARC 2: XENOS HUNT ═══
export const XENOS_HUNT_MISSIONS: MissionNode[] = [
  { id: 'x1_m1', act: 1, title: 'Strange Signals', type: 'recon', difficulty: 1,
    briefing: `Your ${PLAYER} team picks up anomalous signals from a derelict facility. ${ENEMY} bio-signatures detected. Investigate with caution.`,
    objectiveText: 'Scout 3 signal sources. Identify the xenos threat.',
    winNext: 'x1_m2', lossNext: 'x1_m2b',
    winNarrative: `The signals were a lure — but your ${PLAYER} team saw through it. The ${ENEMY} ambush was turned against them. You now know what you're dealing with.`,
    lossNarrative: `The ${ENEMY} were waiting. Your team walked into a kill zone and barely escaped. The xenos are more cunning than expected.`,
  },
  { id: 'x1_m2', act: 1, title: 'Purge Protocol', type: 'combat', difficulty: 1,
    briefing: `With the ${ENEMY} nest located, command orders immediate extermination. Burn it out before they can spread.`,
    objectiveText: 'Destroy 3 nest markers. Eliminate all hostiles.',
    winNext: 'x2_m1', lossNext: 'x2_m1b',
    winNarrative: `The nest burns. ${ENEMY} creatures scatter into the darkness, but the main hive is destroyed. Your ${PLAYER} team pushes deeper.`,
    lossNarrative: `The nest was too well defended. Your team destroyed one chamber but the ${ENEMY} drove you back. They're adapting to your tactics.`,
  },
  { id: 'x1_m2b', act: 1, title: 'Fighting Retreat', type: 'defense', difficulty: 2,
    briefing: `After the failed recon, ${ENEMY} hunters are tracking your team. Set up a defensive perimeter and hold until reinforcements arrive.`,
    objectiveText: 'Survive 4 turning points with at least 3 operatives.',
    winNext: 'x2_m1b', lossNext: 'x2_m1b',
    winNarrative: `Your ${PLAYER} team held the line against wave after wave. The ${ENEMY} finally broke off as reinforcements arrived. Battered but alive.`,
    lossNarrative: `Too many fell. The ${ENEMY} overran your position before extraction. The survivors carry scars that won't heal.`,
  },
  { id: 'x2_m1', act: 2, title: 'Into the Hive', type: 'recon', difficulty: 2,
    briefing: `The ${ENEMY} have retreated to their primary hive deep underground. Your ${PLAYER} team must infiltrate and locate the hive leader.`,
    objectiveText: 'Reach the centre of the map. Avoid detection for 2 turning points.',
    winNext: 'x2_m2', lossNext: 'x2_m2',
    winNarrative: `Moving like shadows, your team penetrated the hive's outer defences. The leader's chamber is close — you can feel the psychic pressure building.`,
    lossNarrative: `Alarms triggered. The entire hive is awake now. Your team fights through corridors of chitin and fury toward the leader.`,
  },
  { id: 'x2_m1b', act: 2, title: 'Scorched Earth', type: 'combat', difficulty: 2,
    briefing: `Command has authorised heavy weapons. Your ${PLAYER} team must clear a path through ${ENEMY} territory using overwhelming force.`,
    objectiveText: 'Control all 4 objectives by turning point 4.',
    winNext: 'x2_m2', lossNext: 'x2_m2',
    winNarrative: `Sector by sector, your team burned through the ${ENEMY} resistance. The path to the hive leader is open.`,
    lossNarrative: `The ${ENEMY} contested every inch. You hold some ground but the cost was high. The final push will be desperate.`,
  },
  { id: 'x2_m2', act: 2, title: 'The Synapse', type: 'combat', difficulty: 2,
    briefing: `A massive ${ENEMY} synapse creature coordinates the hive's defences. Destroy it and the lesser creatures will lose cohesion.`,
    objectiveText: 'Eliminate the synapse creature (centre objective). Hold for 1 turning point after.',
    winNext: 'x3_m1', lossNext: 'x3_m1b',
    winNarrative: `The synapse creature falls with a psychic scream that echoes through the hive. ${ENEMY} creatures stumble, confused, directionless. Now — strike the leader.`,
    lossNarrative: `The synapse creature still lives. The hive mind adapts, sending everything it has at your team. The final battle will be on their terms.`,
  },
  { id: 'x3_m1', act: 3, title: 'Regicide', type: 'boss', difficulty: 2,
    briefing: `The hive leader is cornered in its throne chamber. With the synapse network disrupted, this is your best chance. End this.`,
    objectiveText: 'Eliminate the hive leader. Survive.',
    winNext: null, lossNext: 'x3_m2',
    winNarrative: `The hive leader falls. Its death cry collapses the psychic network entirely. ${ENEMY} creatures across the sector go feral, easy prey. Your ${PLAYER} team stands victorious in the heart of the hive. The hunt is over.`,
    lossNarrative: `The leader is wounded but escapes deeper into the hive. Your team regroups for one final assault.`,
  },
  { id: 'x3_m1b', act: 3, title: 'Desperate Assault', type: 'boss', difficulty: 3,
    briefing: `The full might of the ${ENEMY} hive stands between you and the leader. No subtlety left — charge in and pray to the Emperor.`,
    objectiveText: 'Reach and eliminate the hive leader before turning point 4.',
    winNext: null, lossNext: 'x3_m2',
    winNarrative: `Against all odds, your team broke through. The hive leader dies screaming. Victory — pyrrhic, bloody, but absolute.`,
    lossNarrative: `So close. The leader escapes again. But your team won't stop. One last chance.`,
  },
  { id: 'x3_m2', act: 3, title: 'Exterminatus', type: 'boss', difficulty: 3,
    briefing: `This is it. The hive leader makes its last stand surrounded by its elite guard. Your battered ${PLAYER} team has one chance. No retreat.`,
    objectiveText: 'Eliminate the hive leader. Last operative standing wins.',
    winNext: null, lossNext: null,
    winNarrative: `It's done. The hive leader is dead. Your ${PLAYER} kill team — what remains — emerges from the hive into daylight. Heroes. Every single one, living and fallen.`,
    lossNarrative: `Your team fought to the last breath in the darkness of the hive. They fell, but they wounded the beast mortally. Others will finish what you started. Your sacrifice will be remembered.`,
  },
];

export const ALL_CAMPAIGNS = [
  { id: 'default', name: 'Operation Crimson Dawn', desc: 'A 3-act narrative campaign of escalating conflict', missions: CAMPAIGN_MISSIONS },
  { id: 'xenos_hunt', name: 'Xenos Hunt', desc: 'Track and eliminate a xenos hive threat', missions: XENOS_HUNT_MISSIONS },
];

