"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const cheatFaqs = [
    {
        question: "Is VOIDHOOK currently undetectable?",
        answer: "Yes. Our external software logic ensures zero memory modification, staying clear of internal detection vectors and keeping your account secure.",
    },
    {
        question: "What Windows versions are supported?",
        answer: "We support Windows 10 (20H2+) and Windows 11. Official support for ARM-based systems is currently in development.",
    },
    {
        question: "Do I need a second PC for full safety?",
        answer: "While VOIDHOOK is designed to be extremely safe on a single machine, we offer specialized builds that support network-based execution for total isolation.",
    },
    {
        question: "How do I receive updates?",
        answer: "Our cloud-based loader automatically checks for updates every time you launch, ensuring you are always running the latest version with the latest security signatures.",
    },
];

export const FAQ = () => {
    return (
        <section id="faq" className="py-32 w-full max-w-4xl relative mx-auto px-6">
            <div className="text-center mb-24">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black tracking-widest uppercase mb-6"
                >
                    <HelpCircle size={10} className="fill-primary" />
                    <span>Operational Support</span>
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-6xl font-black tracking-tightest text-white mb-8 uppercase leading-none"
                >
                    OPERATIONAL <span className="text-glow-accent italic">GUIDANCE</span>
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-muted-foreground text-xl font-medium"
                >
                    Clarifying the VOIDHOOK deployment process.
                </motion.p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="card-premium p-12"
            >
                <Accordion type="single" collapsible className="w-full">
                    {cheatFaqs.map((faq, index) => (
                        <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className="border-white/5 last:border-0"
                        >
                            <AccordionTrigger className="text-left text-white font-black text-2xl tracking-tightest uppercase hover:text-primary transition-colors py-8 group">
                                <span className="flex items-center gap-4">
                                    <span className="text-xs text-primary/40 font-mono">CODE-0{index + 1}</span>
                                    {faq.question}
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground text-lg font-medium leading-relaxed pb-8 pl-10 border-l border-primary/20 ml-4">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </motion.div>
        </section>
    );
};
