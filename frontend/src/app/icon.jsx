import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      // Favicon Container
      <div
        style={{
          background: 'transparent',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 100 100"
          style={{ display: 'block' }}
        >
          <defs>
            <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5B4FE9" />
              <stop offset="100%" stopColor="#E95FC8" />
            </linearGradient>
          </defs>

          {/* Icon: Location pin + Shopping bag centered */}
          <g transform="translate(50, 55) scale(1.6)">
            {/* Location pin */}
            <path
              d="M 0 -40 Q -10 -40 -10 -30 Q -10 -22 0 -8 Q 10 -22 10 -30 Q 10 -40 0 -40 Z"
              fill="url(#brandGrad)"
            />
            <circle cx="0" cy="-30" r="3.5" fill="#fff" />

            {/* Shopping bag */}
            <g transform="translate(0, 8) scale(1.15)">
              <path
                d="M -14 -8 L -12 -4 L 12 -4 L 14 -8 Q 13 -11 9 -11 L -9 -11 Q -13 -11 -14 -8 Z"
                fill="url(#brandGrad)"
              />
              <rect x="-12" y="-4" width="24" height="20" fill="#fff" stroke="url(#brandGrad)" strokeWidth="1.5" />
              <path
                d="M -5 12 L -5 4 Q -5 1 0 1 Q 5 1 5 4 L 5 12 Z"
                fill="url(#brandGrad)"
              />
            </g>
          </g>
        </svg>
      </div>
    ),
    { ...size }
  );
}