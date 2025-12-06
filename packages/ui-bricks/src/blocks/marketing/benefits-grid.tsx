'use client'

import Image from 'next/image'
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface Benefit {
    title: string
    description: string
    image: string
    alt: string
    large?: boolean
}

interface BenefitsGridProps {
    title?: string
    benefits?: Benefit[]
}

export default function BenefitsGrid({
    title = "Why Satin?",
    benefits = [
        {
            title: "Hair Health",
            description: "Satin reduces friction by up to 90%.",
            image: "/images/coily-hair-hood-down.png",
            alt: "Hair Health",
            large: true
        },
        {
            title: "Protection",
            description: "Protect your curls from harsh textures.",
            image: "/images/curly-hair-hood-up.png",
            alt: "Protection"
        },
        {
            title: "Premium Feel",
            description: "Add a touch of luxury to everyday wear.",
            image: "/images/hoodie-close-up.png",
            alt: "Premium Feel"
        }
    ]
}: BenefitsGridProps) {
    return (
        <section className="py-24 px-4 bg-black relative">
            <h2 className="text-center text-5xl font-extrabold mb-16 text-white tracking-tight">
                {title}
            </h2>
            <div className="grid grid-cols-1 gap-6 max-w-5xl mx-auto md:grid-cols-3">
                {benefits.map((benefit, index) => (
                    <div 
                        key={index}
                        className={cn(
                            "bg-gray-900/40 border border-white/5 rounded-3xl p-8 flex flex-col justify-center transition-all overflow-hidden relative hover:bg-gray-900/60 hover:border-purple-500/30 hover:-translate-y-1 group",
                            benefit.large ? "md:col-span-2 md:row-span-2" : ""
                        )}
                    >
                        <div className="absolute inset-0 z-0">
                            <Image
                                src={benefit.image}
                                alt={benefit.alt}
                                fill
                                className="object-cover opacity-40 transition-transform duration-700 group-hover:scale-110"
                                quality={80}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
                        </div>
                        <div className="relative z-20">
                            <h3 className={cn("font-bold mb-3 text-white", benefit.large ? "text-4xl mb-4" : "text-2xl")}>
                                {benefit.title}
                            </h3>
                            <p className={cn("text-gray-100 leading-relaxed shadow-sm", benefit.large ? "text-xl max-w-[90%]" : "text-base")}>
                                {benefit.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
