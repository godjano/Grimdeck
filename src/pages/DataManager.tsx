import { useState } from 'react';
import { db } from '../db';
import { ALL_PAINT_PRESETS } from '../db/paint-presets';
import { ALL_MODEL_PRESETS } from '../db/model-presets';

type Tab = 'overview' | 'add-models' | 'add-paints' | 'import-json' | 'export-code';

export default function DataManager() {
  const [tab, setTab] = useState<Tab>('overview');
  return (
    <div>
      <div className="page-header" style={{ paddingTop: 48 }}><h2>🔧 Data Manager</h2></div>
      <p className="settings-desc">Manage preset databases. Add new models/paints, import from external sources, or export code.</p>
      <div className="game-tabs" style={{ marginBottom: 24 }}>
        {([['overview','📊 Overview'],['add-models','🛡️ Add Models'],['add-paints','🎨 Add Paints'],['import-json','📥 Import JSON'],['export-code','📤 Export Code']] as [Tab,string][]).map(([t,l]) => (
          <button key={t} className={`game-tab ${tab===t?'active':''}`} onClick={()=>setTab(t)}>{l}</button>
        ))}
      </div>
      {tab==='overview' && <Overview />}
      {tab==='add-models' && <AddModels />}
      {tab==='add-paints' && <AddPaints />}
      {tab==='import-json' && <ImportJson />}
      {tab==='export-code' && <ExportCode />}
    </div>
  );
}

function Overview() {
  const factions = [...new Set(ALL_MODEL_PRESETS.map(m=>m.faction))].sort();
  const brands = [...new Set(ALL_PAINT_PRESETS.map(p=>p.brand))].sort();
  return (
    <div className="settings-section">
      <h3 className="settings-title">Database Overview</h3>
      <div className="stats">
        <div className="stat"><div className="stat-num">{ALL_MODEL_PRESETS.length}</div><div className="stat-label">Models</div></div>
        <div className="stat"><div className="stat-num">{ALL_PAINT_PRESETS.length}</div><div className="stat-label">Paints</div></div>
        <div className="stat"><div className="stat-num">{factions.length}</div><div className="stat-label">Factions</div></div>
        <div className="stat"><div className="stat-num">{brands.length}</div><div className="stat-label">Brands</div></div>
      </div>
      <h4 style={{fontSize:'0.72rem',color:'var(--text-dim)',margin:'16px 0 8px',textTransform:'uppercase',letterSpacing:'2px'}}>Models by Faction</h4>
      {factions.map(f=>{const c=ALL_MODEL_PRESETS.filter(m=>m.faction===f).length;return(
        <div key={f} className="faction-row"><div className="faction-name">{f}</div><div className="faction-bar-wrap"><div className="faction-bar" style={{width:`${(c/90)*100}%`}}/></div><div className="faction-stat">{c}</div></div>
      );})}
      <h4 style={{fontSize:'0.72rem',color:'var(--text-dim)',margin:'16px 0 8px',textTransform:'uppercase',letterSpacing:'2px'}}>Paints by Brand</h4>
      {brands.map(b=>{const c=ALL_PAINT_PRESETS.filter(p=>p.brand===b).length;return(
        <div key={b} className="faction-row"><div className="faction-name">{b}</div><div className="faction-bar-wrap"><div className="faction-bar" style={{width:`${(c/200)*100}%`}}/></div><div className="faction-stat">{c}</div></div>
      );})}
    </div>
  );
}

function AddModels() {
  const [rows,setRows] = useState([{name:'',faction:'',unitType:'',qty:1,points:0,forceOrg:'Other'}]);
  const [code,setCode] = useState('');
  const update = (i:number,f:string,v:any) => {const n=[...rows];(n[i] as any)[f]=v;setRows(n);};
  const gen = () => setCode(rows.filter(r=>r.name).map(r=>`  { name: '${r.name}', faction: '${r.faction}', unitType: '${r.unitType}', defaultQty: ${r.qty}, points: ${r.points}, forceOrg: '${r.forceOrg}' },`).join('\n'));
  const add = async () => {for(const r of rows.filter(r=>r.name)){await db.models.add({name:r.name,faction:r.faction,unitType:r.unitType,quantity:r.qty,status:'unbuilt',notes:'',photoUrl:'',createdAt:Date.now(),manufacturer:'Games Workshop',gameSystem:'Warhammer 40K',countsAs:'',pricePaid:0,wishlist:false,points:r.points,forceOrg:r.forceOrg});}setRows([{name:'',faction:'',unitType:'',qty:1,points:0,forceOrg:'Other'}]);};
  return (
    <div className="settings-section">
      <h3 className="settings-title">Add Model Presets</h3>
      <p className="settings-desc">Add multiple models. Generate code for the preset files or add directly to your collection.</p>
      <div className="dm-table">
        <div className="dm-header"><span>Name</span><span>Faction</span><span>Type</span><span>Qty</span><span>Pts</span><span>Org</span></div>
        {rows.map((r,i)=>(
          <div key={i} className="dm-row">
            <input value={r.name} onChange={e=>update(i,'name',e.target.value)} placeholder="Intercessors"/>
            <input value={r.faction} onChange={e=>update(i,'faction',e.target.value)} placeholder="Space Marines"/>
            <input value={r.unitType} onChange={e=>update(i,'unitType',e.target.value)} placeholder="Troops"/>
            <input type="number" value={r.qty} onChange={e=>update(i,'qty',+e.target.value||1)} style={{width:50}}/>
            <input type="number" value={r.points} onChange={e=>update(i,'points',+e.target.value||0)} style={{width:60}}/>
            <input value={r.forceOrg} onChange={e=>update(i,'forceOrg',e.target.value)} placeholder="HQ" style={{width:80}}/>
          </div>
        ))}
      </div>
      <div className="tool-actions" style={{marginTop:12}}>
        <button className="btn btn-sm btn-ghost" onClick={()=>setRows([...rows,{name:'',faction:'',unitType:'',qty:1,points:0,forceOrg:'Other'}])}>+ Row</button>
        <button className="btn btn-sm btn-primary" onClick={add}>Add to Collection</button>
        <button className="btn btn-sm btn-ghost" onClick={gen}>Generate Code</button>
      </div>
      {code && <div className="dm-code"><pre>{code}</pre><button className="btn btn-sm btn-ghost" onClick={()=>navigator.clipboard.writeText(code)}>📋 Copy</button></div>}
    </div>
  );
}

function AddPaints() {
  const [rows,setRows] = useState([{name:'',brand:'Citadel',range:'',type:'base',hex:'#888888'}]);
  const [code,setCode] = useState('');
  const update = (i:number,f:string,v:string) => {const n=[...rows];(n[i] as any)[f]=v;setRows(n);};
  const gen = () => setCode(rows.filter(r=>r.name).map(r=>`  { name: '${r.name}', brand: '${r.brand}', range: '${r.range}', type: '${r.type}', hex: '${r.hex}' },`).join('\n'));
  const add = async () => {for(const r of rows.filter(r=>r.name)){await db.paints.add({name:r.name,brand:r.brand,range:r.range,type:r.type as any,hexColor:r.hex,owned:true,quantity:1,notes:''});}setRows([{name:'',brand:'Citadel',range:'',type:'base',hex:'#888888'}]);};
  return (
    <div className="settings-section">
      <h3 className="settings-title">Add Paint Presets</h3>
      <div className="dm-table">
        <div className="dm-header"><span>Name</span><span>Brand</span><span>Range</span><span>Type</span><span>Colour</span></div>
        {rows.map((r,i)=>(
          <div key={i} className="dm-row">
            <input value={r.name} onChange={e=>update(i,'name',e.target.value)} placeholder="Mephiston Red"/>
            <input value={r.brand} onChange={e=>update(i,'brand',e.target.value)} placeholder="Citadel" style={{width:90}}/>
            <input value={r.range} onChange={e=>update(i,'range',e.target.value)} placeholder="Base" style={{width:80}}/>
            <select value={r.type} onChange={e=>update(i,'type',e.target.value)} style={{width:80}}>
              {['base','layer','shade','dry','contrast','technical','spray','air','other'].map(t=><option key={t}>{t}</option>)}
            </select>
            <div style={{display:'flex',gap:4,alignItems:'center'}}>
              <input type="color" value={r.hex} onChange={e=>update(i,'hex',e.target.value)} style={{width:32,height:28}}/>
              <input value={r.hex} onChange={e=>update(i,'hex',e.target.value)} style={{width:70,fontFamily:'monospace',fontSize:'0.75rem'}}/>
            </div>
          </div>
        ))}
      </div>
      <div className="tool-actions" style={{marginTop:12}}>
        <button className="btn btn-sm btn-ghost" onClick={()=>setRows([...rows,{name:'',brand:'Citadel',range:'',type:'base',hex:'#888888'}])}>+ Row</button>
        <button className="btn btn-sm btn-primary" onClick={add}>Add to Collection</button>
        <button className="btn btn-sm btn-ghost" onClick={gen}>Generate Code</button>
      </div>
      {code && <div className="dm-code"><pre>{code}</pre><button className="btn btn-sm btn-ghost" onClick={()=>navigator.clipboard.writeText(code)}>📋 Copy</button></div>}
    </div>
  );
}

function ImportJson() {
  const [json,setJson] = useState('');
  const [status,setStatus] = useState('');
  const importModels = async () => {try{const d=JSON.parse(json);const items=Array.isArray(d)?d:d.models||d.items||[];let c=0;for(const m of items){if(m.name){await db.models.add({name:m.name,faction:m.faction||'Unknown',unitType:m.unitType||'',quantity:m.quantity||1,status:'unbuilt',notes:'',photoUrl:'',createdAt:Date.now(),manufacturer:'Games Workshop',gameSystem:'Warhammer 40K',countsAs:'',pricePaid:0,wishlist:false,points:m.points||0,forceOrg:m.forceOrg||'Other'});c++;}}setStatus(`✅ Imported ${c} models`);}catch(e){setStatus(`❌ ${e}`);}};
  const importPaints = async () => {try{const d=JSON.parse(json);const items=Array.isArray(d)?d:d.paints||d.items||[];let c=0;for(const p of items){if(p.name){await db.paints.add({name:p.name,brand:p.brand||'Unknown',range:p.range||'',type:p.type||'base',hexColor:p.hex||p.hexColor||'#888',owned:true,quantity:1,notes:''});c++;}}setStatus(`✅ Imported ${c} paints`);}catch(e){setStatus(`❌ ${e}`);}};
  return (
    <div className="settings-section">
      <h3 className="settings-title">Import from JSON</h3>
      <p className="settings-desc">Paste JSON data from BattleScribe exports, community databases, or other tools.</p>
      <textarea value={json} onChange={e=>setJson(e.target.value)} placeholder='[{"name":"Intercessors","faction":"Space Marines","points":160}]' rows={8} style={{width:'100%',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:10,padding:14,color:'var(--text)',fontFamily:'monospace',fontSize:'0.8rem',resize:'vertical'}}/>
      <div className="tool-actions" style={{marginTop:12}}>
        <button className="btn btn-sm btn-primary" onClick={importModels} disabled={!json.trim()}>Import as Models</button>
        <button className="btn btn-sm btn-ghost" onClick={importPaints} disabled={!json.trim()}>Import as Paints</button>
      </div>
      {status && <p style={{marginTop:8,fontSize:'0.85rem'}}>{status}</p>}
    </div>
  );
}

function ExportCode() {
  const [type,setType] = useState<'models'|'paints'>('models');
  const [filter,setFilter] = useState('');
  const factions = [...new Set(ALL_MODEL_PRESETS.map(m=>m.faction))].sort();
  const brands = [...new Set(ALL_PAINT_PRESETS.map(p=>p.brand))].sort();
  const code = type==='models'
    ? (filter?ALL_MODEL_PRESETS.filter(m=>m.faction===filter):ALL_MODEL_PRESETS).map(m=>`  { name: '${m.name}', faction: '${m.faction}', unitType: '${m.unitType}', defaultQty: ${m.defaultQty}${m.points?`, points: ${m.points}`:''}${m.forceOrg?`, forceOrg: '${m.forceOrg}'`:''} },`).join('\n')
    : (filter?ALL_PAINT_PRESETS.filter(p=>p.brand===filter):ALL_PAINT_PRESETS).map(p=>`  { name: '${p.name}', brand: '${p.brand}', range: '${p.range}', type: '${p.type}', hex: '${p.hex}' },`).join('\n');
  return (
    <div className="settings-section">
      <h3 className="settings-title">Export Preset Code</h3>
      <div style={{display:'flex',gap:8,marginBottom:12}}>
        <button className={`btn btn-sm ${type==='models'?'btn-primary':'btn-ghost'}`} onClick={()=>{setType('models');setFilter('');}}>Models</button>
        <button className={`btn btn-sm ${type==='paints'?'btn-primary':'btn-ghost'}`} onClick={()=>{setType('paints');setFilter('');}}>Paints</button>
        <select value={filter} onChange={e=>setFilter(e.target.value)} className="tool-input" style={{width:200,marginBottom:0}}>
          <option value="">All</option>
          {(type==='models'?factions:brands).map(f=><option key={f} value={f}>{f}</option>)}
        </select>
      </div>
      <div className="dm-code"><pre style={{maxHeight:300,overflow:'auto'}}>{code}</pre><button className="btn btn-sm btn-ghost" onClick={()=>navigator.clipboard.writeText(code)}>📋 Copy</button></div>
    </div>
  );
}
