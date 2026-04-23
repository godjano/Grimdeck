import GoldIcon from '../components/GoldIcon';

export default function NotFound() {
  return (
    <div style={{ padding: 60, textAlign: 'center', color: 'var(--gold)', fontFamily: "'Cinzel', serif" }}>
      <GoldIcon name="skull-bones" size={64} />
      <h1 style={{ fontSize: '3rem', marginBottom: 8 }}>404</h1>
      <p style={{ color: 'var(--text-dim)', fontFamily: 'Inter, sans-serif', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px', lineHeight: 1.6 }}>
        This page does not exist in the grim darkness of the far future. There is only war... and broken links.
      </p>
      <a href="#/" style={{ color: 'var(--gold)', textDecoration: 'underline', fontSize: '0.9rem' }}>Return to Home</a>
    </div>
  );
}
