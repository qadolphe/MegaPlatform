'use client'

import { AnimatePresence, motion } from 'framer-motion'

interface AnimatedCounterProps {
    value: number
    isCurrency?: boolean
    className?: string
}

export default function AnimatedCounter({ value, isCurrency = false, className = '' }: AnimatedCounterProps) {
    // Format: 123.45 or 123
    const formatted = isCurrency 
        ? (value / 100).toFixed(2) // Assuming value is in cents if currency
        : Math.round(value).toString()
    
    const characters = formatted.split('')

    return (
        <div className={className} style={{ display: 'inline-flex', alignItems: 'center', overflow: 'hidden' }}>
            {characters.map((char, index) => {
                // If it's not a digit (like . or ,), just render it statically
                if (isNaN(parseInt(char))) {
                    return <span key={index}>{char}</span>
                }

                return <Digit key={index} char={char} />
            })}
        </div>
    )
}

function Digit({ char }: { char: string }) {
    return (
        <div style={{ position: 'relative', display: 'inline-block', width: '0.6em', height: '1.5em' }}>
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                    key={char}
                    initial={{ y: '100%' }}
                    animate={{ y: '0%' }}
                    exit={{ y: '-100%' }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    style={{ 
                        position: 'absolute', 
                        inset: 0, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                    }}
                >
                    {char}
                </motion.span>
            </AnimatePresence>
        </div>
    )
}
