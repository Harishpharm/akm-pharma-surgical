
import React from 'react';

interface LogoProps {
    className?: string;
    variant?: 'full' | 'icon';
}

/**
 * AKM Logo Component
 * High-fidelity SVG recreation of the AKM Pharma and Surgicals brand mark.
 * This ensures the logo is always visible, sharp on all screens, and requires no external files.
 */
export const AkmLogo: React.FC<LogoProps> = ({ className, variant = 'full' }) => {
    const ShieldIcon = (
        <svg viewBox="0 0 400 400" className="h-full w-auto drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="shield_grad" x1="60" y1="40" x2="340" y2="380" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#008B8B" />
                    <stop offset="1" stopColor="#004D4D" />
                </linearGradient>
                <linearGradient id="heart_grad" x1="130" y1="150" x2="270" y2="280" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#E53935" />
                    <stop offset="1" stopColor="#B71C1C" />
                </linearGradient>
                <linearGradient id="pill_blue" x1="150" y1="175" x2="200" y2="225" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#1E88E5" />
                    <stop offset="1" stopColor="#0D47A1" />
                </linearGradient>
                <linearGradient id="pill_orange" x1="200" y1="175" x2="250" y2="225" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFA726" />
                    <stop offset="1" stopColor="#E65100" />
                </linearGradient>
            </defs>

            {/* Outer Teal Shield with Swirl Effect */}
            <path d="M200 40 L340 80 V180 C340 320 200 380 200 380 C200 380 60 320 60 180 V80 L200 40Z" fill="url(#shield_grad)" />
            <path d="M200 40 C280 40 340 100 340 180 C340 260 280 340 200 380 C120 340 60 260 60 180 C60 100 120 40 200 40Z" fill="white" fillOpacity="0.1" />
            
            {/* Swirl Overlays for the "Teal layered" look */}
            <path d="M340 80 C310 60 250 40 200 40 L200 80 C230 80 280 100 300 130 L340 80Z" fill="white" fillOpacity="0.2" />
            <path d="M60 180 C60 280 150 350 200 380 L200 330 C170 310 110 260 110 180 L60 180Z" fill="black" fillOpacity="0.2" />

            {/* Inner Shield White Base */}
            <path d="M200 355C200 355 315 305 315 185V95L200 60L85 95V185C85 305 200 355 200 355Z" fill="white" />
            
            {/* Heart */}
            <path d="M200 280C160 280 130 250 130 210C130 180 150 160 180 150C185 140 215 140 220 150C250 160 270 180 270 210C270 250 240 280 200 280Z" fill="url(#heart_grad)" />
            {/* White Cross on Heart */}
            <rect x="188" y="195" width="24" height="30" rx="2" fill="white" />
            <rect x="185" y="198" width="30" height="24" rx="2" fill="white" />
            
            {/* Capsule/Pill (Diagonal) */}
            <g transform="rotate(-45 200 200)">
                <rect x="150" y="175" width="50" height="50" rx="25" fill="url(#pill_blue)" />
                <rect x="200" y="175" width="50" height="50" rx="25" fill="url(#pill_orange)" />
                <rect x="150" y="175" width="100" height="50" rx="25" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.5" />
                {/* Highlight on pill */}
                <rect x="165" y="185" width="30" height="8" rx="4" fill="white" fillOpacity="0.3" />
            </g>
            
            {/* Scalpel (Diagonal crossing) */}
            <g transform="rotate(-45 200 200) translate(20, 20)">
                <path d="M150 240L280 240L285 235L260 230L150 230Z" fill="#263238" />
                <rect x="180" y="232" width="40" height="2" fill="white" fillOpacity="0.5" />
            </g>
        </svg>
    );

    return (
        <div className={`flex flex-col items-center justify-center select-none ${className}`}>
            <div className={`${variant === 'full' ? 'h-32 md:h-40' : 'h-full'} aspect-square flex items-center justify-center`}>
                {ShieldIcon}
            </div>
            
            {variant === 'full' && (
                <div className="flex flex-col items-center justify-center text-center mt-2">
                    <div className="flex items-baseline space-x-1">
                        <span className="text-3xl md:text-5xl font-black text-[#0D47A1] tracking-tighter uppercase">AKM</span>
                    </div>
                    <span className="text-[12px] md:text-[14px] font-bold text-slate-800 uppercase tracking-[0.05em] mt-1">
                        Pharma and Surgicals
                    </span>
                    <span className="text-[10px] md:text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] mt-1">
                        A unit of AKM
                    </span>
                </div>
            )}
        </div>
    );
};
