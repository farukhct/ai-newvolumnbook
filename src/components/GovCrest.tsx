import React from 'react';

interface Props {
  className?: string;
  size?: number;
}

/**
 * Official National Emblem of Bangladesh (Seal of the People's Republic of Bangladesh)
 * Shapla (water lily) on water, bordered by sheaves of rice/paddy, 
 * surmounted by four stars and three connected jute leaves.
 */
export const GovCrest: React.FC<Props> = ({ className = 'w-10 h-10', size }) => {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Government of Bangladesh Emblem"
    >
      {/* Outer gold ring */}
      <circle cx="60" cy="60" r="57" fill="#006A4E" stroke="#C68A14" strokeWidth="3" />
      {/* Inner Red Circle */}
      <circle cx="60" cy="60" r="48" fill="#D92534" stroke="#F59E0B" strokeWidth="1.5" />

      {/* Golden Shapla (Water Lily) center */}
      <g fill="#FDE047" stroke="#92400E" strokeWidth="0.8">
        {/* Central petal */}
        <path d="M60 27 C63 38 64 48 60 58 C56 48 57 38 60 27 Z" />
        {/* Left inner petal */}
        <path d="M57 33 C51 40 48 50 56 58 C53 49 53 40 57 33 Z" />
        {/* Right inner petal */}
        <path d="M63 33 C67 40 67 49 64 58 C72 50 69 40 63 33 Z" />
        {/* Left outer petal */}
        <path d="M52 40 C43 47 43 56 54 60 C46 54 46 46 52 40 Z" />
        {/* Right outer petal */}
        <path d="M68 40 C74 46 74 54 66 60 C77 56 77 47 68 40 Z" />

        {/* Base Water Waves under Lily */}
        <path
          d="M38 64 C45 61 52 66 60 62 C68 66 75 61 82 64 C75 67 68 63 60 66 C52 63 45 67 38 64 Z"
          fill="#38BDF8"
          stroke="#0284C7"
        />
        <path
          d="M42 68 C48 65 54 69 60 66 C66 69 72 65 78 68 C72 70 66 67 60 70 C54 67 48 70 42 68 Z"
          fill="#0284C7"
          stroke="#0369A1"
        />
      </g>

      {/* Surrounding Golden Sheaves of Paddy (Rice) */}
      <g fill="#FDE047" stroke="#B45309" strokeWidth="0.5">
        {/* Left Sheaf */}
        <path d="M30 46 C26 55 26 68 33 78 C35 74 34 64 36 56 C33 53 31 49 30 46 Z" />
        <circle cx="28" cy="50" r="2.2" />
        <circle cx="27" cy="58" r="2.2" />
        <circle cx="28" cy="66" r="2.2" />
        <circle cx="31" cy="74" r="2.2" />

        {/* Right Sheaf */}
        <path d="M90 46 C94 55 94 68 87 78 C85 74 86 64 84 56 C87 53 89 49 90 46 Z" />
        <circle cx="92" cy="50" r="2.2" />
        <circle cx="93" cy="58" r="2.2" />
        <circle cx="92" cy="66" r="2.2" />
        <circle cx="89" cy="74" r="2.2" />
      </g>

      {/* Top 3 Connected Jute Leaves */}
      <g fill="#FDE047" stroke="#78350F" strokeWidth="0.6">
        <path d="M60 14 C63 18 63 23 60 26 C57 23 57 18 60 14 Z" />
        <path d="M54 18 C58 20 59 24 57 27 C54 25 53 21 54 18 Z" />
        <path d="M66 18 C67 21 66 25 63 27 C61 24 62 20 66 18 Z" />
      </g>

      {/* Four Stars (two on each side of top jute leaves) */}
      <g fill="#FBBF24">
        {/* Left Stars */}
        <polygon points="44,21 45.5,25 49.5,25 46.5,27.5 47.5,31.5 44,29 40.5,31.5 41.5,27.5 38.5,25 42.5,25" transform="scale(0.6) translate(28, 6)" />
        <polygon points="44,21 45.5,25 49.5,25 46.5,27.5 47.5,31.5 44,29 40.5,31.5 41.5,27.5 38.5,25 42.5,25" transform="scale(0.6) translate(18, 14)" />
        {/* Right Stars */}
        <polygon points="44,21 45.5,25 49.5,25 46.5,27.5 47.5,31.5 44,29 40.5,31.5 41.5,27.5 38.5,25 42.5,25" transform="scale(0.6) translate(92, 6)" />
        <polygon points="44,21 45.5,25 49.5,25 46.5,27.5 47.5,31.5 44,29 40.5,31.5 41.5,27.5 38.5,25 42.5,25" transform="scale(0.6) translate(102, 14)" />
      </g>
    </svg>
  );
};
