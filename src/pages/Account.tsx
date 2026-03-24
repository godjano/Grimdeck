import GoldIcon from '../components/GoldIcon';
import { useState, useEffect } from 'react';
import { signUp, signIn, signOut, getUser, pushToCloud, pullFromCloud, getCloudSyncInfo, onAuthChange } from '../db/cloud-sync';
import type { User } from '@supabase/supabase-js';

export default function Account() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [status, setStatus] = useState('');
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    getUser().then(u => { setUser(u); setLoading(false); });
    const { data } = onAuthChange(session => setUser(session?.user || null));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) getCloudSyncInfo().then(info => setLastSync(info.lastSync));
  }, [user]);

  const handleAuth = async () => {
    setStatus('⏳ ...');
    try {
      if (mode === 'signup') {
        await signUp(email, password);
        setStatus('Check your email to confirm your account!');
      } else {
        await signIn(email, password);
        setStatus('Logged in!');
      }
    } catch (e: any) { setStatus(`❌ ${e.message}`); }
  };

  const handlePush = async () => {
    setSyncing(true); setStatus('⏳ Pushing to cloud...');
    try { await pushToCloud(); setStatus('Data saved to cloud!'); getCloudSyncInfo().then(i => setLastSync(i.lastSync)); }
    catch (e: any) { setStatus(`❌ ${e.message}`); }
    setSyncing(false);
  };

  const handlePull = async () => {
    setSyncing(true); setStatus('⏳ Loading from cloud...');
    try { await pullFromCloud(); setStatus('Data loaded! Refresh to see changes.'); }
    catch (e: any) { setStatus(`❌ ${e.message}`); }
    setSyncing(false);
  };

  const handleLogout = async () => {
    await signOut(); setUser(null); setStatus('Logged out.');
  };

  if (loading) return <div className="empty">Loading...</div>;

  return (
    <div>
      <div className="page-header" style={{ paddingTop: 48 }}><h2><GoldIcon name="aquila" size={22} /> Account & Cloud Sync</h2></div>

      {status && <div className="status-banner">{status}</div>}

      {!user ? (
        <div className="settings-section">
          <h3 className="settings-title"><>{mode === 'signin' ? <><GoldIcon name="campaigns" size={16} /> Sign In</> : <><GoldIcon name="scroll" size={16} /> Create Account</>}</></h3>
          <p className="settings-desc">Sign in to sync your collection across devices. Your data is stored securely in the cloud.</p>

          <div className="form-grid" style={{ maxWidth: 400 }}>
            <div className="field full-width">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
            </div>
            <div className="field full-width">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" onKeyDown={e => e.key === 'Enter' && handleAuth()} />
            </div>
            <div className="field full-width">
              <button className="btn btn-primary" onClick={handleAuth} disabled={!email || password.length < 6} style={{ width: '100%' }}>
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: 12 }}>
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button className="btn-advanced-toggle" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} style={{ color: 'var(--gold)' }}>
              {mode === 'signin' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      ) : (
        <>
          <div className="settings-section">
            <h3 className="settings-title">👤 Logged in as</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: 12 }}>{user.email}</p>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Sign Out</button>
          </div>

          <div className="settings-section">
            <h3 className="settings-title"><GoldIcon name="aquila" size={18} /> Cloud Sync</h3>
            <p className="settings-desc">Push your local data to the cloud or pull from the cloud to this device.</p>
            {lastSync && <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: 12 }}>Last synced: {new Date(lastSync).toLocaleString()}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" onClick={handlePush} disabled={syncing}><GoldIcon name="aquila" size={14} /> Push to Cloud</button>
              <button className="btn btn-ghost" onClick={handlePull} disabled={syncing}>📥 Pull from Cloud</button>
            </div>
            <p className="settings-desc" style={{ marginTop: 12 }}>
              <strong>Push:</strong> Saves your current local data to the cloud (overwrites cloud data).<br />
              <strong>Pull:</strong> Loads cloud data to this device (overwrites local data).
            </p>
          </div>
        </>
      )}
    </div>
  );
}
