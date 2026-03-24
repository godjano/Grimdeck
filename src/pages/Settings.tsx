import GoldIcon from '../components/GoldIcon';
import PageBanner from '../components/PageBanner';
import { useState, useRef } from 'react';
import { exportAllData, importAllData, downloadJson, saveToGist, loadFromGist, getGistToken, setGistToken, getGistId, clearGistConfig, verifyToken } from '../db/sync';

export default function Settings() {
  const [status, setStatus] = useState('');
  const [ghToken, setGhToken] = useState(getGistToken() || '');
  const [ghUser, setGhUser] = useState('');
  const [synced, setSynced] = useState(!!getGistToken());
  const fileRef = useRef<HTMLInputElement>(null);

  const doExport = async () => {
    try {
      const json = await exportAllData();
      downloadJson(json, `grimdeck-backup-${new Date().toISOString().slice(0, 10)}.json`);
      setStatus('Data exported successfully!');
    } catch (e) { setStatus(`❌ Export failed: ${e}`); }
  };

  const doImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const json = await file.text();
      await importAllData(json);
      setStatus('Data imported successfully! Refresh to see changes.');
    } catch (err) { setStatus(`❌ Import failed: ${err}`); }
  };

  const connectGithub = async () => {
    if (!ghToken.trim()) return;
    try {
      setStatus('⏳ Verifying token...');
      const login = await verifyToken(ghToken.trim());
      setGistToken(ghToken.trim());
      setGhUser(login);
      setSynced(true);
      setStatus(`✅ Connected as ${login}!`);
    } catch (err) { setStatus(`❌ Invalid token: ${err}`); }
  };

  const doSave = async () => {
    try {
      setStatus('⏳ Saving to GitHub...');
      const id = await saveToGist();
      setStatus(`✅ Saved to Gist ${id.slice(0, 8)}...`);
    } catch (err) { setStatus(`❌ Save failed: ${err}`); }
  };

  const doLoad = async () => {
    try {
      setStatus('⏳ Loading from GitHub...');
      await loadFromGist();
      setStatus('Data loaded from GitHub! Refresh to see changes.');
    } catch (err) { setStatus(`❌ Load failed: ${err}`); }
  };

  const disconnect = () => {
    clearGistConfig();
    setSynced(false);
    setGhToken('');
    setGhUser('');
    setStatus('Disconnected from GitHub.');
  };

  return (
    <div>
      <div className="page-header" style={{ paddingTop: 48 }}>
        <PageBanner title="Settings & Backup" subtitle="Export, import, and sync your data" icon="settings" />
      </div>

      {status && <div className="status-banner">{status}</div>}

      {/* Export/Import */}
      <section className="settings-section">
        <h3 className="settings-title">💾 Local Backup</h3>
        <p className="settings-desc">Export your data as a JSON file or import a previous backup. Works offline, no account needed.</p>
        <div className="settings-actions">
          <button className="btn btn-primary" onClick={doExport}>📥 Export Data</button>
          <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>📤 Import Data</button>
          <input ref={fileRef} type="file" accept=".json" onChange={doImport} style={{ display: 'none' }} />
        </div>
      </section>

      {/* GitHub Gist Sync */}
      <section className="settings-section">
        <h3 className="settings-title"><GoldIcon name="aquila" size={18} /> GitHub Cloud Sync</h3>
        <p className="settings-desc">
          Sync your data across devices using a private GitHub Gist. Your data is stored in your own GitHub account.
        </p>

        {!synced ? (
          <div className="settings-setup">
            <p className="settings-desc">To set up, create a GitHub Personal Access Token:</p>
            <ol className="setup-steps">
              <li>Go to <a href="https://github.com/settings/tokens/new" target="_blank" rel="noreferrer">GitHub → Settings → Tokens → New token (classic)</a></li>
              <li>Name it <strong>Grimdeck</strong></li>
              <li>Check only the <strong>gist</strong> scope</li>
              <li>Click <strong>Generate token</strong> and copy it</li>
              <li>Paste it below:</li>
            </ol>
            <div className="token-input">
              <input
                type="password"
                value={ghToken}
                onChange={e => setGhToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              />
              <button className="btn btn-primary" onClick={connectGithub} disabled={!ghToken.trim()}>Connect</button>
            </div>
          </div>
        ) : (
          <div>
            <div className="sync-status">
              <span><GoldIcon name="medal" size={14} /> Connected{ghUser ? ` as ${ghUser}` : ''}</span>
              {getGistId() && <span className="gist-id">Gist: {getGistId()?.slice(0, 12)}...</span>}
            </div>
            <div className="settings-actions">
              <button className="btn btn-primary" onClick={doSave}>Save to GitHub</button>
              <button className="btn btn-ghost" onClick={doLoad}>📥 Load from GitHub</button>
              <button className="btn btn-danger btn-sm" onClick={disconnect}>Disconnect</button>
            </div>
          </div>
        )}
      </section>

      {/* Info */}
      <section className="settings-section">
        <h3 className="settings-title"><GoldIcon name="guides" size={18} /> About</h3>
        <p className="settings-desc">
          Grimdeck is a free, open-source miniature hobby companion. Your data is stored locally in your browser by default.
          No tracking, no ads, no server costs. Built with React, TypeScript, and Dexie.js.
        </p>
      </section>
    </div>
  );
}
