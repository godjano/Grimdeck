import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { ModelStatus } from '../types';
import PaintAutocomplete from '../components/PaintAutocomplete';
import type { PaintPreset } from '../db/paint-presets';
import { FACTION_ROSTERS } from '../db/killteam-data';
import { getGWSearchUrl } from '../db/external-links';
import { ChevronLeft, Camera, Image, ExternalLink, Trash2, Copy, Plus, X } from 'lucide-react';
import GoldIcon from '../components/GoldIcon';

const STATUS_FLOW: ModelStatus[] = ['unbuilt', 'built', 'primed', 'wip', 'painted', 'based'];

// Faction accent colors
const FACTION_COLORS: Record<string, string> = {
  'Space Marines': '#3b6bb5', 'Ultramarines': '#0046ad', 'Blood Angels': '#9b1b1b',
  'Dark Angels': '#2a5a2a', 'Space Wolves': '#6e8ca0', 'Salamanders': '#2d8a4e',
  'Imperial Fists': '#d4a017', 'Iron Hands': '#4a4a4a', 'Raven Guard': '#1a1a2e',
  'White Scars': '#c0c0c0', 'Black Templars': '#1a1a1a', 'Crimson Fists': '#1a3a7a',
  'Astra Militarum': '#5a6a3a', 'Imperial Guard': '#5a6a3a', 'Death Korps': '#4a5a3a',
  'Orks': '#3a7a2a', 'Tyranids': '#6a2a6a', 'Necrons': '#2a8a5a',
  'Aeldari': '#1a5a8a', 'Craftworlds': '#1a5a8a', 'Drukhari': '#4a1a5a',
  "T'au Empire": '#c07020', 'Tau': '#c07020', 'Adepta Sororitas': '#8a1a2a',
  'Sisters of Battle': '#8a1a2a', 'Adeptus Mechanicus': '#8a2a1a', 'Adeptus Custodes': '#b8860b',
  'Grey Knights': '#6a6a8a', 'Chaos Space Marines': '#5a1a1a', 'Death Guard': '#5a6a3a',
  'Thousand Sons': '#1a4a7a', 'World Eaters': '#8a1a1a', 'Genestealer Cults': '#5a3a6a',
  'Leagues of Votann': '#8a6a3a', 'Imperial Knights': '#7a7a7a',
  // Traitor Legions
  'Alpha Legion': '#2a6a6a', 'Night Lords': '#1a2a5a', 'Word Bearers': '#6a1a2a',
  'Iron Warriors': '#5a5a5a', "Emperor's Children": '#7a2a6a', 'Sons of Horus': '#3a5a4a',
  'Black Legion': '#2a2a2a',
};

// Primarch data — name, title, legion
const PRIMARCHS: Record<string, { title: string; legion: string; numeral: string }> = {
  'Roboute Guilliman': { title: 'Lord of Ultramar', legion: 'XIII Legion — Ultramarines', numeral: 'XIII' },
  "Lion El'Jonson": { title: 'The First', legion: 'I Legion — Dark Angels', numeral: 'I' },
  'Leman Russ': { title: 'The Wolf King', legion: 'VI Legion — Space Wolves', numeral: 'VI' },
  'Jaghatai Khan': { title: 'The Warhawk', legion: 'V Legion — White Scars', numeral: 'V' },
  'Rogal Dorn': { title: 'The Praetorian', legion: 'VII Legion — Imperial Fists', numeral: 'VII' },
  'Sanguinius': { title: 'The Angel', legion: 'IX Legion — Blood Angels', numeral: 'IX' },
  'Ferrus Manus': { title: 'The Gorgon', legion: 'X Legion — Iron Hands', numeral: 'X' },
  'Vulkan': { title: 'Lord of Drakes', legion: 'XVIII Legion — Salamanders', numeral: 'XVIII' },
  'Corvus Corax': { title: 'The Raven Lord', legion: 'XIX Legion — Raven Guard', numeral: 'XIX' },
  'Horus Lupercal': { title: 'The Warmaster', legion: 'XVI Legion — Sons of Horus', numeral: 'XVI' },
  'Fulgrim': { title: 'The Phoenician', legion: 'III Legion — Emperor\'s Children', numeral: 'III' },
  'Perturabo': { title: 'The Lord of Iron', legion: 'IV Legion — Iron Warriors', numeral: 'IV' },
  'Konrad Curze': { title: 'The Night Haunter', legion: 'VIII Legion — Night Lords', numeral: 'VIII' },
  'Lorgar': { title: 'Bearer of the Word', legion: 'XVII Legion — Word Bearers', numeral: 'XVII' },
  'Alpharius': { title: 'The Last / The First', legion: 'XX Legion — Alpha Legion', numeral: 'XX' },
  'Mortarion': { title: 'The Death Lord', legion: 'XIV Legion — Death Guard', numeral: 'XIV' },
  'Magnus the Red': { title: 'The Crimson King', legion: 'XV Legion — Thousand Sons', numeral: 'XV' },
  'Angron': { title: 'The Red Angel', legion: 'XII Legion — World Eaters', numeral: 'XII' },
  'The Emperor of Mankind': { title: 'Master of Mankind', legion: 'The Imperium of Man', numeral: '∞' },
  // The Lost Primarchs
  'The Forgotten': { title: '[REDACTED BY ORDER OF THE SIGILLITE]', legion: 'II Legion — [EXPUNGED]', numeral: 'II' },
  'The Purged': { title: '[REDACTED BY ORDER OF THE SIGILLITE]', legion: 'XI Legion — [EXPUNGED]', numeral: 'XI' },
};
const PRIMARCH_ART: Record<string, string> = {
  'Roboute Guilliman': 'primarch-guilliman.jpg',
  "Lion El'Jonson": 'primarch-lion.jpg', 'Lion': 'primarch-lion.jpg',
  'Sanguinius': 'primarch-sanguinius.jpg',
  'Leman Russ': 'primarch-russ.jpg',
  'Rogal Dorn': 'primarch-dorn.jpg',
  'Alpharius': 'primarch-alpharius.jpg',
  'Horus Lupercal': 'primarch-horus.jpg', 'Horus': 'primarch-horus.jpg',
  'Fulgrim': 'primarch-fulgrim.jpg',
  'Mortarion': 'primarch-mortarion.jpg',
  'Magnus': 'primarch-magnus.jpg',
};
function getPrimarchArt(name: string): string | null {
  for (const [key, val] of Object.entries(PRIMARCH_ART)) {
    if (name.toLowerCase().includes(key.toLowerCase().split(' ')[0]) && name.toLowerCase().includes(key.toLowerCase().split(' ').slice(-1)[0])) return `/faction-art/${val}`;
  }
  return null;
}
function getPrimarch(name: string) {
  for (const [key, val] of Object.entries(PRIMARCHS)) {
    if (name.toLowerCase().includes(key.toLowerCase().split(' ')[0]) && name.toLowerCase().includes(key.toLowerCase().split(' ').slice(-1)[0])) return val;
  }
  // Partial match for names like "Leman Russ (Primarch)" or "Vulkan (Primarch)"
  for (const [key, val] of Object.entries(PRIMARCHS)) {
    if (name.toLowerCase().startsWith(key.toLowerCase().split(' ')[0].toLowerCase())) {
      const parts = key.toLowerCase().split(' ');
      if (parts.length === 1 || name.toLowerCase().includes(parts[0])) return val;
    }
  }
  return null;
}
function getFactionColor(faction: string): string | null {
  if (FACTION_COLORS[faction]) return FACTION_COLORS[faction];
  const lower = faction.toLowerCase();
  for (const [key, val] of Object.entries(FACTION_COLORS)) {
    if (lower.includes(key.toLowerCase().split(' ')[0])) return val;
  }
  return null;
}

// ─── 40K stat profiles (10th Edition style) ───
interface W40KProfile { m: string; t: number; sv: string; w: number; ld: string; oc: number; inv?: string; }
const W40K_PROFILES: Record<string, W40KProfile> = {
  'Space Marines':       { m: '6"', t: 4, sv: '3+', w: 2, ld: '6+', oc: 1 },
  'Intercessors':        { m: '6"', t: 4, sv: '3+', w: 2, ld: '6+', oc: 2 },
  'Terminators':         { m: '5"', t: 5, sv: '2+', w: 3, ld: '6+', oc: 1, inv: '4+' },
  'Assault Intercessors':{ m: '6"', t: 4, sv: '3+', w: 2, ld: '6+', oc: 2 },
  'Hellblasters':        { m: '6"', t: 4, sv: '3+', w: 2, ld: '6+', oc: 1 },
  'Eradicators':         { m: '6"', t: 6, sv: '3+', w: 3, ld: '6+', oc: 1 },
  'Bladeguard Veterans': { m: '6"', t: 4, sv: '3+', w: 3, ld: '6+', oc: 1, inv: '4+' },
  'Sternguard Veterans': { m: '6"', t: 4, sv: '3+', w: 2, ld: '6+', oc: 1 },
  'Aggressors':          { m: '5"', t: 6, sv: '3+', w: 3, ld: '6+', oc: 1 },
  'Devastators':         { m: '6"', t: 4, sv: '3+', w: 2, ld: '6+', oc: 1 },
  'Scouts':              { m: '6"', t: 4, sv: '4+', w: 2, ld: '6+', oc: 1 },
  'Dreadnought':         { m: '6"', t: 9, sv: '2+', w: 8, ld: '6+', oc: 3 },
  'Redemptor Dreadnought':{ m: '8"', t: 10, sv: '2+', w: 12, ld: '6+', oc: 4 },
  'Captain':             { m: '6"', t: 4, sv: '3+', w: 5, ld: '6+', oc: 1, inv: '4+' },
  'Librarian':           { m: '6"', t: 4, sv: '3+', w: 4, ld: '6+', oc: 1 },
  'Chaplain':            { m: '6"', t: 4, sv: '3+', w: 4, ld: '6+', oc: 1, inv: '4+' },
  'Lieutenant':          { m: '6"', t: 4, sv: '3+', w: 4, ld: '6+', oc: 1 },
  'Astra Militarum':     { m: '6"', t: 3, sv: '5+', w: 1, ld: '7+', oc: 2 },
  'Leman Russ':          { m: '10"', t: 11, sv: '2+', w: 13, ld: '7+', oc: 3 },
  'Sentinel':            { m: '8"', t: 7, sv: '3+', w: 7, ld: '7+', oc: 2 },
  'Orks':                { m: '6"', t: 5, sv: '5+', w: 1, ld: '7+', oc: 2 },
  'Meganobz':            { m: '5"', t: 6, sv: '2+', w: 3, ld: '7+', oc: 1 },
  'Warboss':             { m: '6"', t: 5, sv: '4+', w: 6, ld: '6+', oc: 1, inv: '5+' },
  'Necrons':             { m: '5"', t: 4, sv: '4+', w: 1, ld: '7+', oc: 2, inv: '4+' },
  'Necron Warriors':     { m: '5"', t: 4, sv: '4+', w: 1, ld: '7+', oc: 2 },
  'Lychguard':           { m: '5"', t: 5, sv: '3+', w: 2, ld: '7+', oc: 1, inv: '4+' },
  'Tyranids':            { m: '6"', t: 4, sv: '5+', w: 2, ld: '8+', oc: 2 },
  'Hive Tyrant':         { m: '8"', t: 10, sv: '2+', w: 10, ld: '7+', oc: 4, inv: '4+' },
  'Carnifex':            { m: '8"', t: 9, sv: '3+', w: 8, ld: '8+', oc: 3 },
  'Genestealers':        { m: '8"', t: 4, sv: '5+', w: 2, ld: '8+', oc: 1, inv: '5+' },
  'Termagants':          { m: '6"', t: 3, sv: '5+', w: 1, ld: '8+', oc: 2 },
  'Hormagaunts':         { m: '8"', t: 3, sv: '5+', w: 1, ld: '8+', oc: 2 },
  'Chaos Space Marines': { m: '6"', t: 4, sv: '3+', w: 2, ld: '6+', oc: 1 },
  'Death Guard':         { m: '5"', t: 5, sv: '3+', w: 2, ld: '6+', oc: 2 },
  'Plague Marines':      { m: '5"', t: 5, sv: '3+', w: 2, ld: '6+', oc: 2 },
  'Thousand Sons':       { m: '6"', t: 4, sv: '3+', w: 2, ld: '6+', oc: 2, inv: '5+' },
  'World Eaters':        { m: '6"', t: 4, sv: '3+', w: 2, ld: '6+', oc: 1 },
  'Berzerkers':          { m: '6"', t: 4, sv: '3+', w: 2, ld: '6+', oc: 1 },
  'Aeldari':             { m: '7"', t: 3, sv: '4+', w: 1, ld: '6+', oc: 1 },
  'Craftworlds':         { m: '7"', t: 3, sv: '4+', w: 1, ld: '6+', oc: 1 },
  'Wraithguard':         { m: '5"', t: 7, sv: '2+', w: 3, ld: '6+', oc: 1 },
  'Drukhari':            { m: '8"', t: 3, sv: '4+', w: 1, ld: '6+', oc: 1, inv: '6+' },
  "T'au Empire":         { m: '6"', t: 4, sv: '4+', w: 2, ld: '7+', oc: 1 },
  'Crisis Suits':        { m: '10"', t: 5, sv: '3+', w: 4, ld: '7+', oc: 2 },
  'Adepta Sororitas':    { m: '6"', t: 3, sv: '3+', w: 1, ld: '6+', oc: 1, inv: '6+' },
  'Adeptus Mechanicus':  { m: '6"', t: 4, sv: '4+', w: 1, ld: '7+', oc: 1 },
  'Adeptus Custodes':    { m: '6"', t: 6, sv: '2+', w: 3, ld: '6+', oc: 2, inv: '4+' },
  'Grey Knights':        { m: '6"', t: 4, sv: '2+', w: 2, ld: '6+', oc: 1 },
  'Imperial Knights':    { m: '10"', t: 12, sv: '3+', w: 22, ld: '6+', oc: 10, inv: '5+' },
  'Genestealer Cults':   { m: '6"', t: 3, sv: '5+', w: 1, ld: '7+', oc: 2 },
  'Leagues of Votann':   { m: '5"', t: 5, sv: '4+', w: 1, ld: '7+', oc: 2 },
  // Traitor Legions (use CSM baseline)
  'Alpha Legion':        { m: '6"', t: 4, sv: '3+', w: 2, ld: '6+', oc: 1 },
  'Night Lords':         { m: '6"', t: 4, sv: '3+', w: 2, ld: '6+', oc: 1 },
  'Word Bearers':        { m: '6"', t: 4, sv: '3+', w: 2, ld: '6+', oc: 1 },
  'Iron Warriors':       { m: '6"', t: 4, sv: '3+', w: 2, ld: '6+', oc: 1 },
  "Emperor's Children":  { m: '6"', t: 4, sv: '3+', w: 2, ld: '6+', oc: 1 },
  'Sons of Horus':       { m: '6"', t: 4, sv: '3+', w: 2, ld: '6+', oc: 1 },
  'Black Legion':        { m: '6"', t: 4, sv: '3+', w: 2, ld: '6+', oc: 1 },
  // Primarchs
  'Guilliman':           { m: '8"', t: 6, sv: '2+', w: 10, ld: '5+', oc: 4, inv: '3+' },
  'Angron':              { m: '12"', t: 11, sv: '2+', w: 16, ld: '6+', oc: 5, inv: '4+' },
  'Mortarion':           { m: '10"', t: 11, sv: '2+', w: 16, ld: '6+', oc: 5, inv: '4+' },
  'Magnus':              { m: '12"', t: 11, sv: '2+', w: 16, ld: '6+', oc: 5, inv: '4+' },
  'Lion':                { m: '8"', t: 6, sv: '2+', w: 10, ld: '5+', oc: 4, inv: '3+' },
  'Alpharius':           { m: '7"', t: 6, sv: '2+', w: 7, ld: '5+', oc: 3, inv: '4+' },
  'Horus':               { m: '8"', t: 7, sv: '2+', w: 10, ld: '5+', oc: 5, inv: '3+' },
  'Fulgrim':             { m: '8"', t: 6, sv: '2+', w: 9, ld: '5+', oc: 4, inv: '3+' },
  'Sanguinius':          { m: '14"', t: 6, sv: '2+', w: 10, ld: '5+', oc: 4, inv: '3+' },
};

function get40KProfile(name: string, faction: string): W40KProfile | null {
  // Try exact unit name first, then faction fallback
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(W40K_PROFILES)) {
    if (lower.includes(key.toLowerCase())) return val;
  }
  return W40K_PROFILES[faction] || null;
}

// Map faction names to faction-art filenames
const FACTION_ART_MAP: Record<string, string> = {
  'Angels of Death': 'angels-of-death-13-1.jpeg', 'Battleclade': 'battleclade-10-2.jpeg',
  'Brood Brothers': 'brood-brothers-0-32.jpeg', 'Canoptek Circle': 'canoptek-circle-0-22.jpeg',
  'Celestian Insidiants': 'celestian-insidiants-10-2.jpeg', 'Death Korps': 'death-korps-0-31.jpeg',
  'Deathwatch': 'deathwatch-12-10.jpeg', 'Exaction Squad': 'exaction-squad-0-30.jpeg',
  'Farstalker Kinband': 'farstalker-kinband-0-32.jpeg', 'Hearthkyn Salvagers': 'hearthkyn-salvagers-14-18.jpeg',
  'Hierotek Circle': 'hierotek-circle-15-3.jpeg', 'Hunter Clade': 'hunter-clade-14-8.jpeg',
  'Imperial Navy Breachers': 'imperial-navy-breachers-14-1.jpeg', 'Inquisitorial Agents': 'inquisitorial-agents-0-31.jpeg',
  'Mandrakes': 'mandrakes-0-31.jpeg', 'Murderwing': 'murderwing-11-2.jpeg',
  'Nemesis Claw': 'nemesis-claw-0-30.jpeg', 'Pathfinders': 'pathfinders-0-32.jpeg',
  'Plague Marines': 'plague-marines-10-2.jpeg', 'Sanctifiers': 'sanctifiers-0-30.jpeg',
  'Scout Squad': 'scout-squad-0-32.jpeg', 'Wolf Scouts': 'wolf-scouts-10-0.jpeg',
  'XV26 Stealth Battlesuits': 'xv26-stealth-battlesuits-10-2.jpeg',
  // Common 40K factions mapped to closest art
  'Space Marines': 'primarch-guilliman.jpg', 'Adeptus Astartes': 'primarch-guilliman.jpg',
  'Ultramarines': 'primarch-guilliman.jpg',
  'Blood Angels': 'primarch-sanguinius.jpg',
  'Dark Angels': 'primarch-lion.jpg',
  'Space Wolves': 'primarch-russ.jpg',
  'Imperial Fists': 'primarch-dorn.jpg', 'Crimson Fists': 'primarch-dorn.jpg',
  'Black Templars': 'primarch-dorn.jpg', 'Astra Militarum': 'death-korps-0-31.jpeg',
  'Imperial Guard': 'death-korps-0-31.jpeg', 'Genestealer Cults': 'brood-brothers-0-32.jpeg',
  'Necrons': 'canoptek-circle-0-22.jpeg', 'Adepta Sororitas': 'celestian-insidiants-10-2.jpeg',
  'Sisters of Battle': 'celestian-insidiants-10-2.jpeg', 'Adeptus Mechanicus': 'hunter-clade-14-8.jpeg',
  "T'au Empire": 'pathfinders-0-32.jpeg', 'Tau': 'pathfinders-0-32.jpeg',
  'Drukhari': 'mandrakes-0-31.jpeg', 'Chaos Space Marines': 'primarch-horus.jpg',
  'Death Guard': 'primarch-mortarion.jpg', 'Inquisition': 'inquisitorial-agents-0-31.jpeg',
  'Leagues of Votann': 'hearthkyn-salvagers-14-18.jpeg',
  // More 40K factions → closest visual match
  'Orks': 'farstalker-kinband-0-32.jpeg', 'Tyranids': 'brood-brothers-0-32.jpeg',
  'Aeldari': 'mandrakes-0-31.jpeg', 'Craftworlds': 'mandrakes-0-31.jpeg', 'Eldar': 'mandrakes-0-31.jpeg',
  'Harlequins': 'mandrakes-0-31.jpeg', 'Ynnari': 'mandrakes-0-31.jpeg',
  'Thousand Sons': 'primarch-magnus.jpg', 'World Eaters': 'nemesis-claw-0-30.jpeg',
  'Chaos Daemons': 'primarch-horus.jpg', 'Chaos Knights': 'primarch-horus.jpg',
  'Adeptus Custodes': 'sanctifiers-0-30.jpeg', 'Custodes': 'sanctifiers-0-30.jpeg',
  'Grey Knights': 'sanctifiers-0-30.jpeg', 'Imperial Knights': 'imperial-navy-breachers-14-1.jpeg',
  'Agents of the Imperium': 'inquisitorial-agents-0-31.jpeg',
  'Salamanders': 'angels-of-death-13-1.jpeg', 'Iron Hands': 'angels-of-death-13-1.jpeg',
  'Raven Guard': 'scout-squad-0-32.jpeg', 'White Scars': 'scout-squad-0-32.jpeg',
  'Votann': 'hearthkyn-salvagers-14-18.jpeg', 'Kroot': 'farstalker-kinband-0-32.jpeg',
  // Traitor Legions
  'Alpha Legion': 'primarch-alpharius.jpg', 'Night Lords': 'nemesis-claw-0-30.jpeg',
  'Word Bearers': 'nemesis-claw-0-30.jpeg', 'Iron Warriors': 'nemesis-claw-0-30.jpeg',
  "Emperor's Children": 'primarch-fulgrim.jpg', 'Sons of Horus': 'primarch-horus.jpg',
  'Black Legion': 'primarch-horus.jpg',
};

function getFactionArt(faction: string): string | null {
  const file = FACTION_ART_MAP[faction];
  if (file) return `/faction-art/${file}`;
  const lower = faction.toLowerCase();
  for (const [key, val] of Object.entries(FACTION_ART_MAP)) {
    if (lower.includes(key.toLowerCase().split(' ')[0])) return `/faction-art/${val}`;
  }
  return null;
}

type Tab = 'stats' | 'recipe' | 'journal' | 'inspiration' | 'compare';

export default function ModelDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const modelId = Number(id);
  const [tab, setTab] = useState<Tab>('stats');
  const [confetti, setConfetti] = useState(false);

  const model = useLiveQuery(() => db.models.get(modelId), [modelId]);
  const allModels = useLiveQuery(() => db.models.orderBy('createdAt').reverse().toArray()) ?? [];
  const linkedPaints = useLiveQuery(() =>
    db.modelPaintLinks.where('modelId').equals(modelId).toArray().then(async links => {
      const results = [];
      for (const link of links) {
        const paint = await db.paints.get(link.paintId);
        if (paint) results.push({ link, paint });
      }
      return results;
    }), [modelId]) ?? [];
  const logs = useLiveQuery(() => db.paintingLogs.where('modelId').equals(modelId).reverse().sortBy('timestamp'), [modelId]) ?? [];

  const [paintSearch, setPaintSearch] = useState('');
  const [usageNote, setUsageNote] = useState('');
  const [addArea, setAddArea] = useState('armour');
  const [addTechnique, setAddTechnique] = useState('basecoat');
  const [addTool, setAddTool] = useState('');
  const [addMix, setAddMix] = useState('');
  const [logText, setLogText] = useState('');
  const [showAddPaint, setShowAddPaint] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);
  const logPhotoRef = useRef<HTMLInputElement>(null);

  // Prev/Next navigation
  const modelIdx = allModels.findIndex(m => m.id === modelId);
  const prevModel = modelIdx > 0 ? allModels[modelIdx - 1] : null;
  const nextModel = modelIdx < allModels.length - 1 ? allModels[modelIdx + 1] : null;

  const [bitsPrompt, setBitsPrompt] = useState(false);
  const [editing, setEditing] = useState(false);

  if (!model) return <div className="empty">Loading...</div>;

  const setStatus = async (status: ModelStatus) => {
    const update: any = { status };
    if (status === 'wip' || status === 'painted' || status === 'based') update.lastPaintedAt = Date.now();
    await db.models.update(modelId, update);
    if (status === 'painted') { setConfetti(true); setTimeout(() => setConfetti(false), 1500); }
    if (status === 'built' && !model.notes) setBitsPrompt(true);
  };
  const currentIdx = STATUS_FLOW.indexOf(model.status);
  const factionArt = getPrimarchArt(model.name) || getFactionArt(model.faction);
  const factionColor = getFactionColor(model.faction);
  const primarch = getPrimarch(model.name);
  const roster = FACTION_ROSTERS[model.faction];
  const datacard = roster?.find(op => model.name.toLowerCase().includes(op.name.toLowerCase().split(' ')[0]));
  const w40k = !datacard ? get40KProfile(model.name, model.faction) : null;

  const addPaintToRecipe = async (paintId: number) => {
    const areaLinks = linkedPaints.filter(({ link }) => link.area === addArea);
    await db.modelPaintLinks.add({ modelId, paintId, usageNote: usageNote.trim(), area: addArea, stepOrder: areaLinks.length + 1, technique: addTechnique, tool: addTool || undefined, mixRatio: addMix || undefined });
    setPaintSearch(''); setUsageNote(''); setAddMix(''); setShowAddPaint(false);
  };
  const removePaint = async (linkId: number) => { await db.modelPaintLinks.delete(linkId); };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const img = new window.Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1200 / img.width, 1200 / img.height, 1);
        canvas.width = img.width * scale; canvas.height = img.height * scale;
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        await db.models.update(modelId, { photoUrl: canvas.toDataURL('image/jpeg', 0.75) });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const addLog = async (photoUrl = '') => {
    if (!logText.trim() && !photoUrl) return;
    await db.paintingLogs.add({ modelId, text: logText.trim(), timestamp: Date.now(), photoUrl });
    setLogText('');
  };

  const handleLogPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const img = new window.Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(400 / img.width, 400 / img.height, 1);
        canvas.width = img.width * scale; canvas.height = img.height * scale;
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        await addLog(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'stats', label: 'Datacard', icon: <GoldIcon name="campaigns" size={18} /> },
    { key: 'recipe', label: 'Recipe', icon: <GoldIcon name="paints" size={18} /> , count: linkedPaints.length },
    { key: 'journal', label: 'Journal', icon: <GoldIcon name="guides" size={18} />, count: logs.length },
    { key: 'inspiration', label: 'Inspo', icon: <GoldIcon name="inspiration" size={18} /> },
    { key: 'compare', label: 'Compare', icon: <GoldIcon name="lens" size={18} /> },
  ];

  return (
    <div className="model-detail-v2" style={factionColor ? { '--faction-accent': factionColor } as React.CSSProperties : {}}>
      {/* ─── HERO BANNER with faction art ─── */}
      <div className={`md-hero ${factionArt ? '' : 'md-hero-frame'}`} style={factionArt ? { backgroundImage: `url(${factionArt})` } : {}}>
        <div className="md-hero-overlay" />
        <button className="btn btn-ghost btn-sm md-back" onClick={() => nav('/models')}>
          <ChevronLeft size={16} /> Back
        </button>
        <button className="btn btn-ghost btn-sm" style={{ position: 'absolute', top: 16, right: 80, zIndex: 5, fontSize: '0.72rem' }} onClick={() => setEditing(!editing)}>
          ✏️ Edit
        </button>
        <div className="md-hero-content">
          <div className="md-portrait" onClick={() => photoRef.current?.click()}>
            {model.photoUrl ? <img src={model.photoUrl} alt={model.name} /> : <Camera size={28} strokeWidth={1.5} />}
            <input ref={photoRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display: 'none' }} />
          </div>
          <div className="md-hero-info">
            {primarch && <div className="md-primarch-numeral">{primarch.numeral}</div>}
            <h1 className={`md-name ${primarch ? 'md-primarch-name' : ''}`}>{model.name}</h1>
            {primarch ? (
              <>
                <div className="md-primarch-title">{primarch.title}</div>
                <div className="md-faction">{primarch.legion}{model.points ? ` · ${model.points}pts` : ''}</div>
              </>
            ) : (
              <div className="md-faction">{model.faction}{model.points ? ` · ${model.points}pts` : ''}</div>
            )}
            <div className="md-status-row">
              {STATUS_FLOW.map((s, i) => (
                <button key={s} className={`md-status-pip ${model.status === s ? 'active' : i < currentIdx ? 'done' : ''}`} onClick={() => setStatus(s)} title={s}>
                  <span className="md-pip-dot" />
                  <span className="md-pip-label">{s}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <a href={getGWSearchUrl(model.name)} target="_blank" rel="noreferrer" className="md-gw-link">
          <ExternalLink size={14} /> GW Store
        </a>
      </div>

      {/* Edit Model Form */}
      {editing && (
        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <h4 style={{ color: 'var(--gold)', fontFamily: "'Cinzel', serif", marginBottom: 10 }}>Edit Model</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Name</label>
              <input defaultValue={model.name} onBlur={e => db.models.update(modelId, { name: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Faction</label>
              <input defaultValue={model.faction} onBlur={e => db.models.update(modelId, { faction: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Points</label>
              <input type="number" defaultValue={model.points} onBlur={e => db.models.update(modelId, { points: Number(e.target.value) })} />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Quantity</label>
              <input type="number" defaultValue={model.quantity} onBlur={e => db.models.update(modelId, { quantity: Number(e.target.value) })} />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Unit Type</label>
              <input defaultValue={model.unitType} onBlur={e => db.models.update(modelId, { unitType: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Game System</label>
              <select defaultValue={model.gameSystem} onChange={e => db.models.update(modelId, { gameSystem: e.target.value })}>
                <option>Warhammer 40K</option><option>Kill Team</option><option>Age of Sigmar</option><option>Horus Heresy</option><option>Other</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Force Org</label>
              <select defaultValue={model.forceOrg} onChange={e => db.models.update(modelId, { forceOrg: e.target.value })}>
                {['HQ', 'Troops', 'Elites', 'Fast Attack', 'Heavy Support', 'Flyer', 'Dedicated Transport', 'Lord of War', 'Other'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Manufacturer</label>
              <input defaultValue={model.manufacturer} onBlur={e => db.models.update(modelId, { manufacturer: e.target.value })} />
            </div>
          </div>
          <div style={{ marginTop: 8 }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Notes</label>
            <textarea defaultValue={model.notes} rows={2} style={{ width: '100%' }} onBlur={e => db.models.update(modelId, { notes: e.target.value })} />
          </div>
          <button className="btn btn-sm btn-primary" style={{ marginTop: 8 }} onClick={() => setEditing(false)}>Done</button>
        </div>
      )}

      {/* Prev / Next navigation */}
      <div className="md-nav">
        {prevModel ? <button onClick={() => nav(`/model/${prevModel.id}`)}>← {prevModel.name}</button> : <span />}
        {nextModel ? <button onClick={() => nav(`/model/${nextModel.id}`)}>{nextModel.name} →</button> : <span />}
      </div>

      {/* Confetti burst on painted */}
      {confetti && <div className="confetti-burst">{Array.from({ length: 20 }, (_, i) => <span key={i} style={{ left: (Math.random() - 0.5) * 200, background: ['#d4af37','#c0392b','#2ecc71','#3498db','#9b59b6'][i % 5], animationDelay: `${Math.random() * 0.4}s` }} />)}</div>}

      {bitsPrompt && (
        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 6 }}>🔧 Any leftover bits?</div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: 8 }}>Jot down spare parts from this kit for future kitbashes.</p>
          <textarea placeholder="e.g. Extra plasma gun, 3 spare heads, power sword arm..." rows={2} style={{ width: '100%', marginBottom: 8 }}
            onBlur={async e => { if (e.target.value.trim()) await db.models.update(modelId, { notes: `Leftover bits: ${e.target.value.trim()}` }); }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-sm btn-primary" onClick={() => setBitsPrompt(false)}>Save</button>
            <button className="btn btn-sm btn-ghost" onClick={() => setBitsPrompt(false)}>Skip</button>
          </div>
        </div>
      )}

      {/* ─── TAB BAR ─── */}
      <div className="md-tabs">
        {tabs.map(t => (
          <button key={t.key} className={`md-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.icon}
            <span>{t.label}</span>
            {t.count ? <span className="md-tab-count">{t.count}</span> : null}
          </button>
        ))}
      </div>

      {/* ─── TAB CONTENT ─── */}
      <div className="md-content">
        {tab === 'stats' && (
          <div className="md-stats-tab">
            {datacard ? (
              <>
                <div className="md-stat-grid">
                  <div className="md-stat-card"><div className="md-stat-label">Move</div><div className="md-stat-value">{datacard.movement}"</div></div>
                  <div className="md-stat-card"><div className="md-stat-label">APL</div><div className="md-stat-value">{datacard.apl}</div></div>
                  <div className="md-stat-card"><div className="md-stat-label">Save</div><div className="md-stat-value">{datacard.save}+</div></div>
                  <div className="md-stat-card md-stat-wounds"><div className="md-stat-label">Wounds</div><div className="md-stat-value">{datacard.wounds}</div></div>
                </div>
                {datacard.weapons.length > 0 && (
                  <div className="md-weapons">
                    <h3 className="md-section-title"><GoldIcon name="campaigns" size={16} /> Weapons</h3>
                    {datacard.weapons.map(w => (
                      <div key={w.name} className="md-weapon">
                        <div className="md-weapon-name">{w.type === 'ranged' ? <GoldIcon name="pistol" size={16} /> : <GoldIcon name="sword2" size={16} />} {w.name}</div>
                        <div className="md-weapon-stats">
                          <span>{w.attacks}A</span><span>BS {w.skill}+</span><span>{w.normalDmg}/{w.critDmg} dmg</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : w40k ? (
              <>
                <div className="md-stat-grid">
                  <div className="md-stat-card"><div className="md-stat-label">Move</div><div className="md-stat-value">{w40k.m}</div></div>
                  <div className="md-stat-card"><div className="md-stat-label">T</div><div className="md-stat-value">{w40k.t}</div></div>
                  <div className="md-stat-card"><div className="md-stat-label">Sv</div><div className="md-stat-value">{w40k.sv}</div></div>
                  <div className="md-stat-card md-stat-wounds"><div className="md-stat-label">W</div><div className="md-stat-value">{w40k.w}</div></div>
                  <div className="md-stat-card"><div className="md-stat-label">Ld</div><div className="md-stat-value">{w40k.ld}</div></div>
                  <div className="md-stat-card"><div className="md-stat-label">OC</div><div className="md-stat-value">{w40k.oc}</div></div>
                  {w40k.inv && <div className="md-stat-card"><div className="md-stat-label">Inv</div><div className="md-stat-value">{w40k.inv}</div></div>}
                </div>
                <div className="md-stat-grid" style={{ marginTop: 8 }}>
                  <div className="md-stat-card"><div className="md-stat-label">Quantity</div><div className="md-stat-value">{model.quantity}</div></div>
                  <div className="md-stat-card"><div className="md-stat-label">Status</div><div className="md-stat-value md-stat-text">{model.status}</div></div>
                </div>
                <p style={{ color: 'var(--gold-dim)', fontSize: 11, textAlign: 'center', marginTop: 8, opacity: 0.6 }}>Approximate 40K 10th Ed. profile</p>
              </>
            ) : (
              <div className="md-stat-grid">
                <div className="md-stat-card"><div className="md-stat-label">Quantity</div><div className="md-stat-value">{model.quantity}</div></div>
                <div className="md-stat-card"><div className="md-stat-label">System</div><div className="md-stat-value md-stat-text">{model.gameSystem}</div></div>
                <div className="md-stat-card"><div className="md-stat-label">Type</div><div className="md-stat-value md-stat-text">{model.unitType}</div></div>
                <div className="md-stat-card"><div className="md-stat-label">Status</div><div className="md-stat-value md-stat-text">{model.status}</div></div>
              </div>
            )}
            {/* Technique Tags */}
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: 6 }}>Techniques used:</div>
              <div className="technique-tags">
                {['NMM', 'OSL', 'Wet Blending', 'Glazing', 'Drybrushing', 'Edge Highlighting', 'Zenithal', 'Weathering', 'Freehand', 'Stippling', 'Contrast', 'Airbrush', 'Oil Wash', 'Chipping', 'Basing'].map(t => (
                  <span key={t} className={`technique-tag ${(model.techniques || []).includes(t) ? 'active' : ''}`}
                    onClick={async () => {
                      const techs = model.techniques || [];
                      const next = techs.includes(t) ? techs.filter(x => x !== t) : [...techs, t];
                      await db.models.update(modelId, { techniques: next });
                    }}>{t}</span>
                ))}
              </div>
            </div>
            {/* Decorative skull divider */}
            <div className="md-divider"><img src={`${import.meta.env.BASE_URL}decor/divider-gold.png`} alt="" loading="lazy" /></div>
          </div>
        )}

        {tab === 'recipe' && (
          <div className="md-recipe-tab">
            <div className="md-section-header">
              <h3 className="md-section-title"><GoldIcon name="paints" size={16} /> Paint Recipe</h3>
              <button className="btn btn-sm btn-ghost" onClick={() => setShowAddPaint(!showAddPaint)}>
                {showAddPaint ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Add Step</>}
              </button>
            </div>
            {showAddPaint && (
              <div className="recipe-add-form">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  <select value={addArea} onChange={e => setAddArea(e.target.value)} className="recipe-select">
                    {['armour', 'skin', 'cloth', 'metallics', 'leather', 'gems', 'weapons', 'base', 'details', 'other'].map(a => <option key={a}>{a}</option>)}
                  </select>
                  <select value={addTechnique} onChange={e => setAddTechnique(e.target.value)} className="recipe-select">
                    {['basecoat', 'shade', 'layer', 'highlight', 'edge highlight', 'glaze', 'drybrush', 'wash', 'contrast', 'wetblend', 'stipple', 'zenithal', 'other'].map(t => <option key={t}>{t}</option>)}
                  </select>
                  <select value={addTool} onChange={e => setAddTool(e.target.value)} className="recipe-select">
                    <option value="">Tool (optional)</option>
                    {['fine brush', 'large brush', 'airbrush', 'sponge', 'drybrush', 'palette knife'].map(t => <option key={t}>{t}</option>)}
                  </select>
                  <input value={addMix} onChange={e => setAddMix(e.target.value)} placeholder="Mix ratio (optional)" className="recipe-select" />
                </div>
                <PaintAutocomplete value={paintSearch} onChange={setPaintSearch} onSelect={async (preset: PaintPreset) => {
                  let paint = await db.paints.where('name').equals(preset.name).first();
                  if (!paint) {
                    const id = await db.paints.add({ name: preset.name, brand: preset.brand, range: preset.range, type: preset.type as any, hexColor: preset.hex, owned: false, quantity: 0, notes: '' });
                    paint = await db.paints.get(id);
                  }
                  if (paint?.id) await addPaintToRecipe(paint.id);
                  setPaintSearch('');
                }} />
                <input value={usageNote} onChange={e => setUsageNote(e.target.value)} placeholder="Notes (e.g. thin to milk consistency, recess only)" className="md-usage-input" />
              </div>
            )}
            {linkedPaints.length === 0 ? (
              <div className="md-empty-tab"><GoldIcon name="gear" size={24} /><p>No paints assigned yet. Add steps to build your recipe.</p></div>
            ) : (
              <>
                {/* Group by area */}
                {(() => {
                  const areas: Record<string, typeof linkedPaints> = {};
                  for (const lp of linkedPaints) (areas[lp.link.area || 'general'] ??= []).push(lp);
                  // Sort each area by stepOrder
                  for (const a of Object.keys(areas)) areas[a].sort((a2, b) => (a2.link.stepOrder || 0) - (b.link.stepOrder || 0));
                  return Object.entries(areas).map(([area, steps]) => (
                    <div key={area} className="recipe-area">
                      <div className="recipe-area-title"><GoldIcon name="paints" size={14} /> {area}</div>
                      {steps.map(({ link, paint }, i) => (
                        <div key={link.id} className="recipe-step">
                          <div className="recipe-step-num">{i + 1}</div>
                          <div className="md-swatch" style={{ background: paint.hexColor || '#555' }} />
                          <div className="recipe-step-info">
                            <div className="recipe-step-name">{paint.name} <span className="recipe-step-brand">{paint.brand}</span></div>
                            <div className="recipe-step-meta">
                              {link.technique && <span className="recipe-tag">{link.technique}</span>}
                              {link.tool && <span className="recipe-tag">{link.tool}</span>}
                              {link.mixRatio && <span className="recipe-tag">mix: {link.mixRatio}</span>}
                            </div>
                            {link.usageNote && <div className="recipe-step-note">{link.usageNote}</div>}
                          </div>
                          <button className="btn-icon-sm" onClick={() => removePaint(link.id!)}><Trash2 size={14} /></button>
                        </div>
                      ))}
                    </div>
                  ));
                })()}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
                  <button className="btn btn-sm btn-ghost" onClick={() => {
                    const text = `Paint recipe for ${model.name} (${model.faction}):\n` + linkedPaints.map(({ link, paint }) => `${link.stepOrder || '-'}. [${link.area || ''}] ${link.technique || ''}: ${paint.name} (${paint.brand})${link.tool ? ` — ${link.tool}` : ''}${link.usageNote ? ` — ${link.usageNote}` : ''}`).join('\n');
                    navigator.clipboard.writeText(text);
                  }}><Copy size={14} /> Copy</button>
                  <button className="btn btn-sm btn-ghost" onClick={async () => {
                    const name = prompt('Apply recipe to which model?');
                    if (!name) return;
                    const target = (await db.models.toArray()).find(m => m.name.toLowerCase().includes(name.toLowerCase()));
                    if (!target?.id) { alert('Model not found'); return; }
                    for (const { link, paint } of linkedPaints) {
                      if (!paint.id) continue;
                      await db.modelPaintLinks.add({ modelId: target.id, paintId: paint.id, usageNote: link.usageNote, area: link.area, stepOrder: link.stepOrder, technique: link.technique, tool: link.tool, mixRatio: link.mixRatio });
                    }
                    alert(`Recipe applied to ${target.name}`);
                  }}><Copy size={14} /> Apply to model</button>
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'journal' && (
          <div className="md-journal-tab">
            <h3 className="md-section-title"><GoldIcon name="guides" size={16} /> Painting Journal</h3>
            <div className="md-journal-add">
              <textarea value={logText} onChange={e => setLogText(e.target.value)} placeholder="What did you work on?" rows={2} />
              <div className="md-journal-actions">
                <button className="btn btn-sm btn-ghost" onClick={() => logPhotoRef.current?.click()}><Camera size={14} /> Photo</button>
                <button className="btn btn-sm btn-primary" onClick={() => addLog()} disabled={!logText.trim()}><Plus size={14} /> Add</button>
                <input ref={logPhotoRef} type="file" accept="image/*" capture="environment" onChange={handleLogPhoto} style={{ display: 'none' }} />
              </div>
            </div>
            {logs.length === 0 ? (
              <div className="md-empty-tab">
                <img src="/decor/key.png" alt="" className="md-empty-icon" />
                <p>No entries yet. Track your progress here.</p>
              </div>
            ) : (
              <>
                {(() => { const photos = logs.filter(l => l.photoUrl); return photos.length >= 2 ? (
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ color: 'var(--gold-dim)', fontSize: '0.8rem', marginBottom: 8, fontFamily: "'Cinzel', serif" }}>Before & After</h4>
                    <div className="ba-container">
                      <div style={{ position: 'relative', flex: 1 }}><img src={photos[photos.length - 1].photoUrl} alt="Before" /><div className="ba-label">Before</div></div>
                      <div style={{ position: 'relative', flex: 1 }}><img src={photos[0].photoUrl} alt="After" /><div className="ba-label">After</div></div>
                    </div>
                  </div>
                ) : null; })()}
                <div className="md-journal-list">
                {logs.map(log => (
                  <div key={log.id} className="md-journal-entry">
                    <div className="md-journal-time">{new Date(log.timestamp).toLocaleDateString()}</div>
                    {log.text && <div className="md-journal-text">{log.text}</div>}
                    {log.photoUrl && <img src={log.photoUrl} alt="Progress" className="md-journal-photo" />}
                  </div>
                ))}
              </div>
              </>
            )}
          </div>
        )}

        {tab === 'inspiration' && (
          <div className="md-inspo-tab">
            <h3 className="md-section-title"><Image size={16} /> Inspiration Board</h3>
            <p className="md-inspo-hint">Save reference images — right-click → Copy Image, then paste here.</p>
            <InspirationBoard modelId={modelId} />
          </div>
        )}

        {tab === 'compare' && (
          <div className="md-compare-tab">
            <h3 className="md-section-title"><GoldIcon name="lens" size={16} /> Compare with Studio</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: 12 }}>See your model next to the official GW studio paint job.</p>
            <div className="compare-container">
              <div className="compare-side">
                <div className="compare-label">Yours</div>
                {model.photoUrl ? (
                  <img src={model.photoUrl} alt={model.name} className="compare-img" />
                ) : (
                  <div className="compare-empty"><GoldIcon name="lens" size={24} /><span>Add a photo to your model</span></div>
                )}
              </div>
              <div className="compare-side">
                <div className="compare-label">GW Studio</div>
                <div className="compare-gw">
                  <iframe src={getGWSearchUrl(model.name)} title="GW Store" className="compare-iframe" sandbox="allow-scripts allow-same-origin" />
                  <a href={getGWSearchUrl(model.name)} target="_blank" rel="noreferrer" className="compare-link">Open in GW Store →</a>
                </div>
              </div>
            </div>
            {/* Time spent on this model */}
            {(() => {
              const modelSessions = logs.filter(l => l.text.includes('⏱'));
              const totalSecs = modelSessions.reduce((s, l) => {
                const m = l.text.match(/(\d+):(\d+):(\d+)/);
                return s + (m ? parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseInt(m[3]) : 0);
              }, 0);
              return totalSecs > 0 ? (
                <div className="goal-ring" style={{ marginTop: 16 }}>
                  <GoldIcon name="winged-hour" size={24} />
                  <div className="goal-ring-info">
                    <div className="goal-ring-title">Time Invested</div>
                    <div className="goal-ring-sub">{Math.floor(totalSecs / 3600)}h {Math.floor((totalSecs % 3600) / 60)}m across {modelSessions.length} sessions</div>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

function InspirationBoard({ modelId }: { modelId: number }) {
  const [images, setImages] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(`inspo-${modelId}`) || '[]'); } catch { return []; }
  });

  const save = (imgs: string[]) => { setImages(imgs); localStorage.setItem(`inspo-${modelId}`, JSON.stringify(imgs)); };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile(); if (!file) continue;
        const reader = new FileReader();
        reader.onload = () => {
          const img = new window.Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const scale = Math.min(500 / img.width, 500 / img.height, 1);
            canvas.width = img.width * scale; canvas.height = img.height * scale;
            canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
            save([...images, canvas.toDataURL('image/jpeg', 0.7)]);
          };
          img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
      }
    }
  };

  return (
    <div className="md-inspo-board" onPaste={handlePaste} tabIndex={0}>
      {images.length === 0 ? (
        <div className="md-inspo-empty">
          <img src="/decor/heart.png" alt="" className="md-empty-icon" />
          <p>Paste images here (Ctrl+V)</p>
        </div>
      ) : (
        <div className="md-inspo-grid">
          {images.map((src, i) => (
            <div key={i} className="md-inspo-img">
              <img src={src} alt={`Ref ${i + 1}`} />
              <button className="md-inspo-remove" onClick={() => save(images.filter((_, j) => j !== i))}><X size={12} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
