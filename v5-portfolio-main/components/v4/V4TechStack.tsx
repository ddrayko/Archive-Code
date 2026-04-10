"use client"

import { motion } from "framer-motion"
import { Code2, Globe, Database, Cpu, Palette, Zap, Wind, Layers3, Terminal } from "lucide-react"
import { useRef, useState, useLayoutEffect } from "react";

const tech = [
    { name: "React", icon: Cpu, color: "text-blue-400" },
    { name: "Next.js", icon: Globe, color: "text-white" },
    { name: "TypeScript", icon: Code2, color: "text-blue-500" },
    { name: "Tailwind", icon: Wind, color: "text-cyan-400" },
    { name: "Firebase", icon: Database, color: "text-yellow-500" },
    { name: "Framer Motion", icon: Zap, color: "text-purple-500" },
    { name: "PostgreSQL", icon: Database, color: "text-indigo-400" },
    { name: "Node.js", icon: Terminal, color: "text-green-500" },
    { name: "Prisma", icon: Database, color: "text-teal-400" },
    { name: "Stripe", icon: Palette, color: "text-purple-400" },
    { name: "Vercel", icon: Layers3, color: "text-gray-300" },
    { name: "Docker", icon: Cpu, color: "text-blue-400" },
    { name: "Python", icon: Code2, color: "text-yellow-400" },
    { name: "Electron", icon: Cpu, color: "text-cyan-300" },
    { name: "Express", icon: Terminal, color: "text-gray-400" },
    { name: "MongoDB", icon: Database, color: "text-green-400" },
    { name: "Redis", icon: Database, color: "text-red-500" },
    { name: "Ubuntu", icon: Terminal, color: "text-orange-500" },
    { name: "Git", icon: Terminal, color: "text-green-500" },
];

export function V4TechStack() {
    const marqueeRef = useRef<HTMLDivElement>(null);
    const [marqueeWidth, setMarqueeWidth] = useState(0);

    useLayoutEffect(() => {
        const node = marqueeRef.current;
        if (!node) return;

        let frameId: number | null = null;
        const updateWidth = () => {
            const width = node.scrollWidth / 2;
            setMarqueeWidth((prev) => (prev === width ? prev : width));
        };

        const onResize = () => {
            if (frameId) cancelAnimationFrame(frameId);
            frameId = requestAnimationFrame(updateWidth);
        };

        updateWidth();
        window.addEventListener("resize", onResize);
        const resizeObserver = new ResizeObserver(onResize);
        resizeObserver.observe(node);

        return () => {
            window.removeEventListener("resize", onResize);
            resizeObserver.disconnect();
            if (frameId) cancelAnimationFrame(frameId);
        };
    }, []);

    const speedFactor = 80; 
    const duration = marqueeWidth ? marqueeWidth / speedFactor : 1;

    return (
        <section className="py-16 sm:py-20 relative overflow-hidden bg-muted/5">
            <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10 pointer-events-none" />

            <div className="container mx-auto px-4 sm:px-6 mb-10 sm:mb-12 text-center">
                <motion.h3
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground"
                >
                    What Tech I Use
                </motion.h3>
            </div>

            <div className="flex overflow-hidden group">
                <motion.div
                    ref={marqueeRef}
                    animate={marqueeWidth ? { x: [0, -marqueeWidth] } : { x: 0 }}
                    transition={{ 
                        duration: duration,
                        repeat: Infinity, 
                        ease: "linear" 
                    }}
                    className="flex gap-8 sm:gap-12 whitespace-nowrap px-4 sm:px-6"
                >
                    {[...tech, ...tech].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 group/item">
                            <div className="p-4 rounded-2xl v4-glass border-white/5 group-hover/item:border-primary/50 transition-colors">
                                <item.icon className={`w-8 h-8 ${item.color} group-hover/item:scale-110 transition-transform`} />
                            </div>
                            <span className="text-lg sm:text-xl md:text-2xl font-black text-muted-foreground group-hover/item:text-foreground transition-colors uppercase italic tracking-tighter">
                                {item.name}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
