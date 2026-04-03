import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { error: Error | null; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) return (
      <div style={{ padding: 40, textAlign: 'center', color: '#d4af37', fontFamily: "'Cinzel', serif" }}>
        <h2>Something went wrong</h2>
        <p style={{ color: '#888', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif' }}>{this.state.error.message}</p>
        <button style={{ marginTop: 16, padding: '10px 24px', background: '#d4af37', color: '#0a0a0e', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}
          onClick={() => { this.setState({ error: null }); window.location.hash = '/'; }}>Back to Home</button>
      </div>
    );
    return this.props.children;
  }
}
