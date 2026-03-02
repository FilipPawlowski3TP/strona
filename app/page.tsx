"use client";

import React, { useState } from "react";
import { Hero } from "@/components/Hero";
import { SupportedGames } from "@/components/SupportedGames";
import { Features } from "@/components/Features";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { ProductDetail } from "@/components/ProductDetail";
import { Navbar } from "@/components/Navbar";

export default function Home() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  return (
    <div className="w-full relative min-h-screen">
      {/* Global Environmental Layers */}
      <div className="bg-noise" />
      <div className="bg-glow-main" />

      <Navbar />

      <div className="relative z-10 flex flex-col items-center">
        {!selectedGame ? (
          <>
            <Hero />
            <SupportedGames onSelectGame={setSelectedGame} />
            <Features />
          </>
        ) : (
          <ProductDetail onBack={() => setSelectedGame(null)} />
        )}
        <FAQ />
        <Footer />
      </div>
    </div>
  );
}
