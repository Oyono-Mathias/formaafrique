"use client";

import { ShieldCheck, Lock, Unlock } from "lucide-react";
import { useUser } from "@/firebase";

export default function SecurityBanner() {
  const { userProfile, loading } = useUser();

  if (loading) {
    return null; 
  }

  if (userProfile?.role !== "admin") {
    return null;
  }

  // Note: The toggle functionality is for UI demonstration purposes only.
  // The actual protection logic is handled by the AI's internal rules.
  const [isProtected, setIsProtected] = React.useState(true);
  const toggleProtection = () => setIsProtected(!isProtected);

  return (
    <div
      className={`
        ${
          isProtected
            ? "bg-gradient-to-r from-green-600 to-emerald-700 border-green-400"
            : "bg-gradient-to-r from-red-600 to-pink-700 border-red-400"
        } 
        text-white flex items-center justify-between px-6 py-3 rounded-md shadow-lg animate-fade-in-down border transition-colors duration-300
      `}
    >
      <div className="flex items-center space-x-3">
        {isProtected ? (
          <ShieldCheck className="w-5 h-5 text-white" />
        ) : (
          <Unlock className="w-5 h-5 text-white" />
        )}
        <h2 className="text-sm md:text-base font-semibold">
          {isProtected
            ? "🔒 Mode protégé activé — Aucune modification non autorisée."
            : "⚠️ Mode protégé désactivé — Modifications possibles temporairement."}
        </h2>
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
