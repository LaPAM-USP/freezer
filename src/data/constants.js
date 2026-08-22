export const LAB_MEMBERS = [
  { id: "coletivo", name: "Coletivo / LaPAM", nameEn: "Community / LaPAM", color: "#0284c7", initials: "LAP", avatar: "./img/LOGO%20LAPAM.png" },
  { id: "ana-marcia", name: "Prof.ª Dra. Ana Marcia", nameEn: "Prof. Ana Marcia, PhD", color: "#0d9488", initials: "AMG", avatar: "./img/ana_marcia.jpeg" },
  { id: "kevim", name: "Kevim", nameEn: "Kevim", color: "#6366f1", initials: "KV", avatar: "./img/kevim.jpeg" },
  { id: "agatha-morgana", name: "Agatha Morgana", nameEn: "Agatha Morgana", color: "#ec4899", initials: "AM", avatar: "./img/agatha_morgana.jpeg" },
  { id: "alice-bispo", name: "Alice Bispo", nameEn: "Alice Bispo", color: "#f59e0b", initials: "AB", avatar: "./img/alice_bispo.jpeg" },
  { id: "caroline-silva", name: "Caroline Silva", nameEn: "Caroline Silva", color: "#10b981", initials: "CS", avatar: "./img/caroline_silva.jpeg" },
  { id: "fernando-falat", name: "Fernando Falat", nameEn: "Fernando Falat", color: "#0ea5e9", initials: "FF", avatar: "./img/fernando_falat.jpeg" },
  { id: "julia", name: "Julia", nameEn: "Julia", color: "#8b5cf6", initials: "JL", avatar: "./img/julia.jpeg" },
  { id: "lucas", name: "Lucas", nameEn: "Lucas", color: "#14b8a6", initials: "LC", avatar: "./img/lucas.jpeg" },
  { id: "mia", name: "Mia", nameEn: "Mia", color: "#f43f5e", initials: "MA", avatar: "./img/mia.jpeg" },
];

export const CATEGORIES = [
  { id: "stocks", namePt: "Estoques Bacterianos (Glicerol)", nameEn: "Bacterial Stocks (Glycerol)", color: "rose", bgLight: "bg-rose-50 text-rose-700 border-rose-200" },
  { id: "dna_rna", namePt: "Extração de DNA / RNA", nameEn: "DNA / RNA Extractions", color: "blue", bgLight: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "isolates", namePt: "Isolados Clínicos", nameEn: "Clinical Isolates", color: "purple", bgLight: "bg-purple-50 text-purple-700 border-purple-200" },
  { id: "primers", namePt: "Primers & Oligonucleotídeos", nameEn: "Primers & Oligos", color: "emerald", bgLight: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "reagents", namePt: "Enzimas & Reagentes", nameEn: "Enzymes & Reagents", color: "amber", bgLight: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "serum", namePt: "Soro / Fluidos Biológicos", nameEn: "Serum / Bio-fluids", color: "cyan", bgLight: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  { id: "cells", namePt: "Cultura Celular", nameEn: "Cell Culture Stocks", color: "indigo", bgLight: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { id: "other", namePt: "Outros", nameEn: "Other", color: "slate", bgLight: "bg-slate-50 text-slate-700 border-slate-200" },
];

export const BIOSAFETY_LEVELS = [
  { id: "nb3", label: "NB-3 (BSL-3)", descPt: "Micobactérias virulentas (M. tb)", descEn: "Virulent Mycobacteria", badge: "bg-red-50 text-red-700 border-red-200" },
  { id: "nb2", label: "NB-2 (BSL-2)", descPt: "BCG / Micobactérias atenuadas / MNT", descEn: "BCG / Attenuated / NTM", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "general", label: "Geral (NB-1)", descPt: "DNA purificado / Primers / Enzimas", descEn: "Purified DNA / Primers / Reagents", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
];

export const BOX_GRID_TYPES = [
  { id: "9x9", label: "9x9 (81 criotubos)", total: 81 },
  { id: "10x10", label: "10x10 (100 criotubos)", total: 100 },
  { id: "8x12", label: "96-poços (Placa / Tubos)", total: 96 },
  { id: "5x5", label: "5x5 (25 tubos)", total: 25 },
  { id: "custom", label: "Outro / Customizado", total: 0 },
];

export const FREEZER_CONFIG = {
  totalDrawers: 4,
  rowsPerDrawer: 4,
  colsPerDrawer: 5,
  spotsPerDrawer: 20,
  totalSpots: 80,
  targetTemp: -80,
  unitTemp: "°C",
  location: "ICB II - USP, Sala de Micobacteriologia",
};
