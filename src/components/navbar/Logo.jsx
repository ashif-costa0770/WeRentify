'use client';
import Link from "next/link";

export default function Logo() {
  return (
     <Link href="/">
    
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 200"
      className="h-28 w-auto filter drop-shadow-lg cursor-pointer select-none"
    >
      <defs>
        <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5B4FE9" />
          <stop offset="100%" stopColor="#E95FC8" />
        </linearGradient>
      </defs>

      {/* Icon: Location pin + Shopping bag */}
      <g transform="translate(75, 90) scale(1.3)">
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
          <rect x="-11" y="-11" width="3.2" height="7" fill="#fff" opacity="0.4" />
          <rect x="-4.5" y="-11" width="3.2" height="7" fill="#fff" opacity="0.4" />
          <rect x="1.3" y="-11" width="3.2" height="7" fill="#fff" opacity="0.4" />
          <rect x="7.8" y="-11" width="3.2" height="7" fill="#fff" opacity="0.4" />
          <rect
            x="-12"
            y="-4"
            width="24"
            height="20"
            fill="#fff"
            stroke="url(#brandGrad)"
            strokeWidth="1.5"
          />
          <path
            d="M -5 12 L -5 4 Q -5 1 0 1 Q 5 1 5 4 L 5 12 Z"
            fill="url(#brandGrad)"
          />
        </g>
      </g>

      {/* Text */}
      <g fontFamily="'Quicksand', 'Nunito', 'Poppins', system-ui" transform="translate(110, 115)">
        <text
          x="0"
          y="0"
          fontSize="55"
          fontWeight="700"
          fill="url(#brandGrad)"
          letterSpacing="-1"
        >
          WeRentify
        </text>
      </g>
    </svg>
    </Link>
  );
}
