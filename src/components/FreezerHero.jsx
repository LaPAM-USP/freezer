import React from 'react';
import { 
  Search, 
  Filter, 
  Sparkles, 
  Box, 
  ShieldAlert, 
  Users, 
  CheckCircle2, 
  Layers,
  X,
  Plus
} from 'lucide-react';
import { LAB_MEMBERS, CATEGORIES, BIOSAFETY_LEVELS } from '../data/constants';

export default function FreezerHero({
  lang,
  boxes,
  drawers,
  searchQuery,
  setSearchQuery,
  selectedDrawer,
  setSelectedDrawer,
  selectedOwner,
  setSelectedOwner,
  selectedCategory,
  setSelectedCategory,
  selectedBiosafety,
  setSelectedBiosafety,
  onFindNextEmptySpot,
}) {
  const totalCapacity = 80;
  const occupiedCount = boxes.length;
  const freeCount = Math.max(0, totalCapacity - occupiedCount);
  const occupancyPercent = Math.round((occupiedCount / totalCapacity) * 100);

  const nb3Count = boxes.filter(b => b.biosafety === 'nb3').length;
  const uniqueOwners = new Set(boxes.map(b => b.ownerId)).size;

  const hasActiveFilters = searchQuery || selectedDrawer !== 'all' || selectedOwner !== 'all' || selectedCategory !== 'all' || selectedBiosafety !== 'all';

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedDrawer('all');
    setSelectedOwner('all');
    setSelectedCategory('all');
    setSelectedBiosafety('all');
  };

  return (
    <div className="pt-6 pb-4 no-print">
      
      {/* Top Banner & KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        
        {/* KPI 1: Total Occupancy */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {lang === 'pt' ? 'Ocupação Total' : 'Total Occupancy'}
            </span>
            <span className="p-1.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
              <Box className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 font-mono">{occupiedCount}</span>
              <span className="text-xs font-medium text-slate-500 font-mono">/ {totalCapacity} {lang === 'pt' ? 'vagas' : 'spots'}</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-sky-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${occupancyPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 2: Free Spots */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {lang === 'pt' ? 'Vagas Disponíveis' : 'Available Spots'}
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600 font-mono">{freeCount}</span>
              <span className="text-xs font-medium text-slate-500 font-mono">/ {totalCapacity} {lang === 'pt' ? 'livres' : 'free'}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">
              {lang === 'pt' ? 'Prontas para armazenamento' : 'Ready for storage'}
            </p>
          </div>
        </div>

        {/* KPI 3: Biosafety NB-3 Level */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {lang === 'pt' ? 'Amostras NB-3 (M. tb)' : 'NB-3 (BSL-3) Samples'}
            </span>
            <span className="p-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100">
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-red-600 font-mono">{nb3Count}</span>
              <span className="text-xs font-medium text-slate-500">{lang === 'pt' ? 'caixas virulentas' : 'boxes'}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">
              {lang === 'pt' ? 'Controle estrito de biossegurança' : 'Strict containment protocol'}
            </p>
          </div>
        </div>

        {/* KPI 4: Lab Researchers & Drawers */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {lang === 'pt' ? 'Pesquisadores / Gavetas' : 'Users & Drawers'}
            </span>
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-indigo-600 font-mono">{uniqueOwners}</span>
              <span className="text-xs font-medium text-slate-500">{lang === 'pt' ? 'pesquisadores ativos' : 'active users'}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">
              {lang === 'pt' ? '4 Gavetas organizadas' : '4 Drawers organized'}
            </p>
          </div>
        </div>

      </div>

      {/* Interactive Search & Live Filter Bar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'pt' 
                ? "Buscar por amostra, cepa (H37Rv, BCG), responsável, coordenada (G1-L1-C1), tag ou notas..." 
                : "Search by sample, strain, owner, coordinate (D1-R1-C1), tag or notes..."
              }
              className="w-full pl-10 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Drawer Filter Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedDrawer}
              onChange={(e) => setSelectedDrawer(e.target.value)}
              className="h-9 px-3 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="all">{lang === 'pt' ? 'Todas as Gavetas (1-4)' : 'All Drawers (1-4)'}</option>
              <option value="1">{lang === 'pt' ? 'Gaveta 1 (Topo)' : 'Drawer 1 (Top)'}</option>
              <option value="2">{lang === 'pt' ? 'Gaveta 2' : 'Drawer 2'}</option>
              <option value="3">{lang === 'pt' ? 'Gaveta 3' : 'Drawer 3'}</option>
              <option value="4">{lang === 'pt' ? 'Gaveta 4 (Base)' : 'Drawer 4 (Base)'}</option>
            </select>

            {/* Owner Filter Dropdown */}
            <select
              value={selectedOwner}
              onChange={(e) => setSelectedOwner(e.target.value)}
              className="h-9 px-3 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="all">{lang === 'pt' ? 'Todos os Responsáveis' : 'All Owners'}</option>
              {LAB_MEMBERS.map((m) => (
                <option key={m.id} value={m.id}>
                  {lang === 'pt' ? m.name : m.nameEn}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="hidden sm:block h-9 px-3 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="all">{lang === 'pt' ? 'Todas as Categorias' : 'All Categories'}</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {lang === 'pt' ? c.namePt : c.nameEn}
                </option>
              ))}
            </select>

            {/* Biosafety Filter */}
            <select
              value={selectedBiosafety}
              onChange={(e) => setSelectedBiosafety(e.target.value)}
              className="hidden md:block h-9 px-3 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="all">{lang === 'pt' ? 'Biossegurança' : 'Biosafety'}</option>
              {BIOSAFETY_LEVELS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="h-9 px-2.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                title={lang === 'pt' ? "Limpar todos os filtros" : "Clear all filters"}
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === 'pt' ? 'Limpar' : 'Clear'}</span>
              </button>
            )}

          </div>

        </div>

        {/* Quick hint helper */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{lang === 'pt' ? 'Clique em qualquer vaga vazia [+] para registrar uma nova caixa ou em uma caixa para ver detalhes e etiqueta QR.' : 'Click any empty slot [+] to register a box or click a box to view details and QR label.'}</span>
          </div>
          <span className="hidden md:inline font-mono text-slate-400">
            {lang === 'pt' ? 'Matriz: 4 Gavetas × 4 Linhas × 5 Colunas' : 'Matrix: 4 Drawers × 4 Rows × 5 Columns'}
          </span>
        </div>

      </div>

    </div>
  );
}
