import Link from 'next/link'
import Image from 'next/image'
import { Check } from 'lucide-react'

interface ProductCardProps {
    product: any
    isActive?: boolean
    innerRef?: (el: HTMLDivElement | null) => void
    priority?: boolean
    overrideTitle?: string
    overrideDescription?: string
    overrideButtonText?: string
    overrideLink?: string
}

export default function ProductCard({
    product,
    isActive = false,
    innerRef,
    priority = false,
    overrideTitle,
    overrideDescription,
    overrideButtonText,
    overrideLink
}: ProductCardProps) {
    const config = product.ui || {}

    const displayTitle = overrideTitle || product.name
    const displayDesc = overrideDescription || product.description
    const displayButton = overrideButtonText || config.buttonText || 'View Details'
    const displayLink = overrideLink || `${config.linkPrefix || '/products'}/${product.slug}`

    const getPriceDisplay = (p: any) => {
        if (p.type === 'kit') return `Starting from $${p.base_price}`
        if (p.slug === 'concierge') return `Cost of Hoodie + $${p.base_price}`
        return `$${p.base_price}`
    }

    return (
        <div
            ref={innerRef}
            data-id={product.id}
            className={`
                relative w-full h-auto min-h-[600px] rounded-3xl overflow-hidden border border-white/10 flex flex-col justify-end items-center text-center pb-12 bg-white/5 transition-all duration-500 hover:border-purple-500/40 hover:flex-[3] group
                ${isActive ? 'opacity-100 scale-100 border-white/40 shadow-2xl' : 'opacity-50 scale-98'}
            `}
        >
            <div className="absolute inset-0 z-0">
                {product.image_url && (
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        quality={90}
                        priority={priority}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/70 to-black z-10 transition-colors duration-500" />
            </div>

            <div className="relative z-20 w-full flex flex-col items-center px-6">
                <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-4xl transition-all whitespace-normal leading-tight">{displayTitle}</h3>
                <p className="text-gray-200 text-base mb-6 max-w-[300px] leading-relaxed">{displayDesc}</p>

                <div className="flex flex-col items-center gap-4 w-full mt-4">
                    <ul className="list-none p-0 m-0 text-left text-gray-300 text-sm flex flex-col gap-2 w-full items-center opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                        {config.features && config.features.map((feature: string, i: number) => (
                            <li key={i} className="flex items-center gap-2 w-fit">
                                <Check size={16} className="text-purple-500 shrink-0" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="text-lg font-semibold text-white mb-4 group-hover:text-purple-400 group-hover:scale-110 transition-all tracking-wide">
                        {getPriceDisplay(product)}
                    </div>

                    <Link
                        href={displayLink}
                        className="bg-white text-black px-8 py-3 rounded-full font-bold uppercase text-sm hover:bg-gray-100 hover:-translate-y-0.5 transition-all inline-block mt-4"
                    >
                        {displayButton}
                    </Link>
                </div>
            </div>
        </div>
    )
}
