import { Link } from "react-router-dom";

interface LogoIconProps {
  size?: number;
  className?: string;
}

export function LogoIcon({ size = 36, className = "" }: LogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 ${className}`}
    >
      <defs>
        <linearGradient id="sf-grad-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
        <linearGradient id="sf-grad-left" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="sf-grad-right" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#064E3B" />
        </linearGradient>
        <linearGradient id="sf-glow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#059669" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Outer rounded card container with dark backdrop */}
      <rect width="48" height="48" rx="12" fill="#0F172A" stroke="#1E293B" strokeWidth="1.5" />
      <rect x="2" y="2" width="44" height="44" rx="10" fill="url(#sf-glow-grad)" opacity="0.12" />

      {/* 3D Isometric Cube / Smart Warehouse Unit */}
      {/* Top diamond facet */}
      <path
        d="M24 10L36.5 17.5L24 25L11.5 17.5L24 10Z"
        fill="url(#sf-grad-top)"
      />
      {/* Left facet */}
      <path
        d="M11.5 17.5L24 25V37.5L11.5 30V17.5Z"
        fill="url(#sf-grad-left)"
      />
      {/* Right facet */}
      <path
        d="M24 25L36.5 17.5V30L24 37.5V25Z"
        fill="url(#sf-grad-right)"
      />

      {/* Flow arrow inside top facet */}
      <path
        d="M18.5 17.5L24 20.5L29.5 17.5"
        stroke="#ECFDF5"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 14V20.5"
        stroke="#ECFDF5"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* AI Pulse Sparkle Node in top right */}
      <circle cx="36" cy="12" r="3.5" fill="#34D399" />
      <circle cx="36" cy="12" r="1.5" fill="#FFFFFF" />
      <path
        d="M36 7V17M31 12H41"
        stroke="#A7F3D0"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
}

interface LogoProps {
  size?: number;
  showText?: boolean;
  to?: string;
  className?: string;
}

export default function Logo({
  size = 36,
  showText = true,
  to,
  className = "",
}: LogoProps) {
  const content = (
    <div className={`inline-flex items-center gap-3 group ${className}`}>
      <LogoIcon size={size} className="group-hover:scale-105 transition-transform duration-200" />
      {showText && (
        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white block leading-none">
          StockFlow <span className="text-emerald-500">AI</span>
        </span>
      )}
    </div>
  );

  if (to) {
    return <Link to={to} className="inline-block">{content}</Link>;
  }

  return content;
}
