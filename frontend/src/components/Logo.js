function Logo({ size = 24, light = false }) {
  return (
    <div className="logo">
      <svg width={size} height={size} viewBox="0 0 24 24">
        <rect width="24" height="24" rx="5" fill="#2a63c6" />
        <rect x="5" y="5" width="4" height="14" rx="1.5" fill="#fff" />
        <rect x="10" y="5" width="4" height="9" rx="1.5" fill="#fff" opacity=".85" />
        <rect x="15" y="5" width="4" height="5" rx="1.5" fill="#fff" opacity=".7" />
      </svg>
      <span className="logo-text" style={{ color: light ? '#fff' : '#1c2b41' }}>TrackIt</span>
    </div>
  );
}

export default Logo;
