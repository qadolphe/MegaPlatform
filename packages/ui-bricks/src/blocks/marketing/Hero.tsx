'use client'

import Link from 'next/link'
import Image from 'next/image'
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface HeroProps {
    title?: string
    subtitle?: string
    primaryCtaText?: string
    primaryCtaLink?: string
    secondaryCtaText?: string
    secondaryCtaLink?: string
    backgroundImage?: string
}

export const Hero = ({
    title = "Protect Your Hair.\nElevate Your Style.",
    subtitle = "The premium satin lining solution for your favorite hoodies.",
    primaryCtaText = "Shop DIY Kits",
    primaryCtaLink = "/products/kits",
    secondaryCtaText = "How Mail-In Works",
    secondaryCtaLink = "/services/mail-in-service",
    backgroundImage = "/images/essentials-kit.jpg"
}: HeroProps) => {
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center pt-20 px-4 overflow-hidden bg-gradient-to-b from-black to-gray-900">
            <div className="absolute inset-0 z-0">
                <Image
                    src={backgroundImage}
                    alt="Hero Background"
                    fill
                    className="object-cover opacity-30 mask-image-gradient"
                    style={{ 
                        maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)'
                    }}
                    quality={90}
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/90 z-10" />
            </div>
            
            <div className="relative z-10 max-w-4xl mt-0">
                <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight text-white tracking-tight whitespace-pre-line">
                    {title}
                </h1>
                <p className="text-xl md:text-2xl text-gray-400 mb-12 leading-relaxed max-w-2xl mx-auto">
                    {subtitle}
                </p>
                
                <div className="flex flex-col md:flex-row gap-6 w-full max-w-xl mx-auto">
                    <Link 
                        href={primaryCtaLink} 
                        className="flex-1 bg-white text-black py-5 px-8 rounded-full font-bold uppercase tracking-wider hover:bg-purple-400 hover:text-white hover:-translate-y-0.5 hover:shadow-lg transition-all flex items-center justify-center text-base"
                    >
                        {primaryCtaText}
                    </Link>
                    <Link 
                        href={secondaryCtaLink} 
                        className="flex-1 bg-white/5 text-white py-5 px-8 rounded-full font-bold uppercase tracking-wider backdrop-blur-md border border-white/10 hover:bg-white/15 hover:border-white hover:-translate-y-0.5 transition-all flex items-center justify-center text-base"
                    >
                        {secondaryCtaText}
                    </Link>
                </div>
            </div>
        </section>
    )
}
