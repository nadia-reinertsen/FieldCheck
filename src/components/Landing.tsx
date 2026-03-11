interface Props {
  onEnter: () => void;
}

export default function Landing({ onEnter }: Props) {
  return (
    <div style={{
      height: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
      color: 'white',
      fontFamily: 'sans-serif',
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', letterSpacing: '0.05em' }}>
        Hackathon Test App
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2.5rem', opacity: 0.75 }}>
        Explore the North Sea
      </p>
      <button
        onClick={onEnter}
        style={{
          padding: '0.9rem 2.5rem',
          fontSize: '1rem',
          fontWeight: 600,
          borderRadius: '8px',
          border: 'none',
          background: '#61dafb',
          color: '#0f2027',
          cursor: 'pointer',
          transition: 'opacity 0.2s',
        }}
        onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
        onMouseOut={e => (e.currentTarget.style.opacity = '1')}
      >
        Open Map
      </button>
    </div>
  );
}
