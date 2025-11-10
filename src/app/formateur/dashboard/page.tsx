"use client";
import React from "react";
import TrainerStats from "@/components/TrainerStats";

export default function DashboardFormateur() {
  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord Formateur</h1>
      <TrainerStats />
    </main>
  );
}
