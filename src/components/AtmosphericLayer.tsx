interface AtmosphericLayerProps {
  variant?: 'hero' | 'section' | 'minimal';
}

const AtmosphericLayer = ({ variant = 'section' }: AtmosphericLayerProps) => {
  // Thread configurations based on variant
  const configs = {
    hero: { count: 3, opacity: 'opacity-[0.12]' },
    section: { count: 2, opacity: 'opacity-[0.08]' },
    minimal: { count: 1, opacity: 'opacity-[0.05]' }
  };

  const config = configs[variant];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating Threads */}
      {Array.from({ length: config.count }).map((_, i) => (
        <svg
          key={`thread-${i}`}
          className={`thread-layer thread-${i + 1} absolute ${config.opacity}`}
          style={{
            top: `${20 + i * 30}%`,
            left: `${10 + i * 25}%`,
            width: '300px',
            height: '200px',
          }}
          viewBox="0 0 300 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`threadGradient${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(36, 40%, 58%)" stopOpacity="0" />
              <stop offset="50%" stopColor="hsl(36, 40%, 58%)" stopOpacity="1" />
              <stop offset="100%" stopColor="hsl(36, 40%, 58%)" stopOpacity="0" />
            </linearGradient>
            <filter id={`blur${i}`}>
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
            </filter>
          </defs>
          <path
            d={`M 20 ${80 + i * 20} Q ${100 + i * 30} ${60 + i * 15}, ${200 + i * 20} ${90 + i * 10}`}
            stroke={`url(#threadGradient${i})`}
            strokeWidth="0.5"
            strokeLinecap="round"
            filter={`url(#blur${i})`}
          />
        </svg>
      ))}

      {/* Subtle fabric particles (only for hero) */}
      {variant === 'hero' && (
        <>
          <div
            className="fabric-particle absolute w-1 h-1 rounded-full bg-primary/20"
            style={{
              top: '15%',
              right: '20%',
              filter: 'blur(1px)',
            }}
          />
          <div
            className="fabric-particle absolute w-0.5 h-0.5 rounded-full bg-accent/15"
            style={{
              top: '60%',
              left: '15%',
              filter: 'blur(1px)',
              animationDelay: '-15s',
            }}
          />
        </>
      )}
    </div>
  );
};

export default AtmosphericLayer;
