# SOP: Update Models & Paints Database

## File Locations

### Models (847 presets across 7 files)
- `src/db/model-presets.ts` — Core factions (334): Space Marines, Guard, Orks, Tau, Tyranids, Necrons, Aeldari, etc.
- `src/db/model-presets-extra.ts` — Kill Team boxes + named characters (110)
- `src/db/model-presets-more.ts` — Additional units per faction (135)
- `src/db/model-presets-killteam-ops.ts` — Individual Kill Team operatives (125)
- `src/db/model-presets-combat-patrol.ts` — Combat Patrol box contents (77)
- `src/db/model-presets-40k-more.ts` — Named characters, titans, terrain (66)
- All imported in `src/db/model-presets.ts` → `ALL_MODEL_PRESETS`

### Paints (539 presets across 7 files)
- `src/db/paints-citadel-base.ts` — Citadel Base (42)
- `src/db/paints-citadel-layer.ts` — Citadel Layer (47)
- `src/db/paints-citadel-other.ts` — Citadel Shade, Contrast, Dry, Technical (95)
- `src/db/paints-vallejo.ts` — Vallejo Game Color + Model Color (130)
- `src/db/paints-army-painter.ts` — Army Painter Warpaints + Speedpaints (115)
- `src/db/paints-extra.ts` — Citadel Air, ProAcryl, Scale75 (68)
- `src/db/paints-more.ts` — Citadel Spray, Vallejo Metal, AK Interactive (42)
- All imported in `src/db/paint-presets.ts` → `ALL_PAINT_PRESETS`

### Kill Team Rosters (23 factions, 101 operatives)
- `src/db/killteam-data.ts` — 10 factions with full datacards
- `src/db/killteam-data-extra.ts` — 13 additional factions

## How to Add Models

### Format
```typescript
{ name: 'Unit Name', faction: 'Faction Name', unitType: 'Troops', defaultQty: 10, points: 160, forceOrg: 'Troops' },
```

### Fields
- `name` (required): Unit name
- `faction` (required): Must match existing faction names exactly
- `unitType`: Battleline, Infantry, Vehicle, Character, Monster, etc.
- `defaultQty`: How many models in the unit
- `points`: Points cost (optional, 0 if unknown)
- `forceOrg`: HQ, Troops, Elites, Fast Attack, Heavy Support, Flyer, Dedicated Transport, Fortification, Lord of War, Kill Team Operative, Other

### Steps
1. Choose the appropriate file (or create new one)
2. Add entries to the array
3. If new file, import it in `src/db/model-presets.ts` and add to `ALL_MODEL_PRESETS`
4. Run `npx tsc -b` to verify
5. Push using SOP-PUSH

## How to Add Paints

### Format
```typescript
{ name: 'Paint Name', brand: 'Brand', range: 'Range', type: 'base', hex: '#ff0000' },
```

### Fields
- `name` (required): Paint name
- `brand` (required): Citadel, Vallejo, Army Painter, ProAcryl, Scale75, AK Interactive
- `range`: Base, Layer, Shade, Contrast, Dry, Technical, Air, Spray, Game Color, Model Color, etc.
- `type`: base, layer, shade, dry, contrast, technical, spray, air, other
- `hex` (required): Hex colour code

### Steps
1. Add to appropriate brand file
2. If new file, import in `src/db/paint-presets.ts` and add to `ALL_PAINT_PRESETS`
3. Run `npx tsc -b` to verify
4. Push using SOP-PUSH

## How to Add Kill Team Factions

### Full roster in `src/db/killteam-data.ts`
```typescript
'Faction Name': [
  { id: '', faction: 'Faction Name', name: 'Operative', role: 'leader',
    movement: 6, apl: 3, groupAct: 1, defense: 3, save: 3, wounds: 15,
    weapons: [
      { name: 'Weapon', type: 'ranged', attacks: 4, skill: 3, normalDmg: 3, critDmg: 4, special: ['Piercing 1'] },
    ],
    abilities: ['Ability description'],
    aiType: 'tactical' },
],
```

### Quick roster in `src/db/killteam-data-extra.ts`
Uses helper function `op()` for shorter syntax.

### After adding
1. Faction auto-appears in campaign creation dropdown
2. Add team rules to `src/db/team-selection.ts` for operative selection validation
3. Run `npx tsc -b` to verify

## Verification Commands
```bash
# Count totals
node -e "const fs=require('fs'); let t=0; ['src/db/model-presets.ts','src/db/model-presets-extra.ts','src/db/model-presets-more.ts','src/db/model-presets-killteam-ops.ts','src/db/model-presets-combat-patrol.ts','src/db/model-presets-40k-more.ts'].forEach(f=>{t+=(fs.readFileSync(f,'utf8').match(/defaultQty:/g)||[]).length}); console.log('Models:', t);"

node -e "const fs=require('fs'); let t=0; ['src/db/paints-citadel-base.ts','src/db/paints-citadel-layer.ts','src/db/paints-citadel-other.ts','src/db/paints-vallejo.ts','src/db/paints-army-painter.ts','src/db/paints-extra.ts','src/db/paints-more.ts'].forEach(f=>{t+=(fs.readFileSync(f,'utf8').match(/hex:/g)||[]).length}); console.log('Paints:', t);"

# Check factions
grep "^  '" src/db/killteam-data.ts src/db/killteam-data-extra.ts | grep -o "'[^']*'" | sort -u
```

## Current Faction List (for reference)
Space Marines, Death Guard, Deathwatch, Necrons, Wolf Scouts, Sanctifiers,
Orks, Astra Militarum, Chaos Space Marines, Tyranids,
Pathfinders, Scout Squad, Nemesis Claw, Mandrakes, Murderwing,
Death Korps, Exaction Squad, Farstalker Kinband, Hearthkyn Salvagers,
Hunter Clade, Imperial Navy Breachers, XV26 Stealth Battlesuits,
Celestian Insidiants
