"use client";

import { ShieldCheck, Lock, Unlock, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from "@/firebase"; // Corrected import path
import React from "react";


export default function SecurityBanner() {
  const { userProfile, loading } = useUser();
  const [isProtected, setIsProtected] = useState(true);
  const [timer, setTimer] = useState(0); // temps restant en secondes
  const DURATION = 10 * 60; // 10 minutes = 600 secondes


  // Décompte automatique
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isProtected && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0 && !isProtected) {
      setIsProtected(true);
    }
    return () => clearInterval(interval);
  }, [isProtected, timer]);

  if (loading || userProfile?.role !== "admin") {
    return null;
  }

  const toggleProtection = () => {
    if (isProtected) {
      setIsProtected(false);
      setTimer(DURATION);
    } else {
      setIsProtected(true);
      setTimer(0);
    }
  };

  // Conversion du timer en format mm:ss
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`${
        isProtected
          ? "bg-gradient-to-r from-green-600 to-emerald-700 border-green-400"
          : "bg-gradient-to-r from-red-600 to-pink-700 border-red-400"
      } text-white flex items-center justify-between px-6 py-3 rounded-md shadow-lg animate-fade-in-down border`}
    >
      <div className="flex items-center space-x-3">
        {isProtected ? (
          <ShieldCheck className="w-5 h-5 text-white" />
        ) : (
          <Unlock className="w-5 h-5 text-white" />
        )}
        <div>
          <h2 className="text-sm md:text-base font-semibold">
            {isProtected
              ? "🔒 Mode protégé activé — Aucune modification non autorisée."
              : "⚠️ Mode protégé désactivé — Modifications possibles temporairement."}
          </h2>
          {!isProtected && (
            <div className="flex items-center gap-2 text-xs mt-1 opacity-80">
              <Timer className="w-4 w-4" />
              <span>Réactivation automatique dans {formatTime(timer)}</span>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={toggleProtection}
        className={`text-sm px-3 py-1 rounded-md font-medium transition ${
          isProtected
            ? "bg-white/20 hover:bg-white/30"
            : "bg-white/20 hover:bg-white/40"
        }`}
      >
        {isProtected ? "Désactiver" : "Activer"} la protection
      </button>
    </div>
  );
}
