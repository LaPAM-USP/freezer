import React from 'react';
import { 
  BarChart3, 
  PieChart, 
  Layers, 
  ShieldAlert, 
  Users, 
  Box, 
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { LAB_MEMBERS, CATEGORIES, BIOSAFETY_LEVELS } from '../data/constants';

export default function StatsSummary({
  lang,
  boxes,
  drawers
}) {
  const totalSpots = 80;
  const occupiedSpots = boxes.length;
  const freeSpots = totalSpots - occupiedSpots;

  // Category counts
  const categoryStats = CATEGORIES.map(cat => {
    const count = boxes.filter(b => b.category === cat.id).length;
    return {
      ...cat,
      count,
      percent: Math.round((count / (occupiedSpots || 1)) * 100)
    };
  }).filter(c => c.count > 0);

  // Biosafety counts
  const nb3Count = boxes.filter(b => b.biosafety === 'nb3').length;
  const nb2Count = boxes.filter(b => b.biosafety === 'nb2').length;
  const genCount = boxes.filter(b => b.biosafety === 'general').length;

  // Member counts
  const memberStats = LAB_MEMBERS.map(m => {
    const count = boxes.filter(b => b.ownerId === m.id).length;
    return {
      ...m,
      count
    };
  }).filter(m => m.count > 0).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      
      {/* Top Overview Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-sky-600" />
          <span>{lang === 'pt' ? 'Métricas & Ocupação do Freezer' : 'Freezer Metrics & Analytics'}</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {lang === 'pt' 
            ? 'Panorama consolidado de amostras, biossegurança e distribuição de espaço no ICB II - USP.' 
            : 'Consolidated overview of samples, biosafety levels, and storage distribution at ICB II - USP.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Card 1: Drawers Occupancy */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              <span>{lang === 'pt' ? 'Ocupação por Gaveta' : 'Drawer Occupancy'}</span>
            </h3>
            <span className="text-xs font-mono font-bold text-slate-500">20 {lang === 'pt' ? 'vagas/gaveta' : 'spots/drawer'}</span>
          </div>

          <div className="space-y-3">
            {drawers.map((d) => {
              const dBoxes = boxes.filter(b => b.drawer === d.number).length;
              const dPercent = Math.round((dBoxes / 20) * 100);

              return (
                <div key={d.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      {lang === 'pt' ? `Gaveta ${d.number}` : `Drawer ${d.number}`}
                    </span>
                    <span className="font-mono text-slate-500 font-bold">
                      {dBoxes} / 20 ({dPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-sky-600 h-full rounded-full transition-all"
                      style={{ width: `${dPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: Biosafety Containment Breakdown */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>{lang === 'pt' ? 'Nível de Biossegurança' : 'Biosafety Breakdown'}</span>
            </h3>
            <span className="text-xs font-mono text-slate-500 font-bold">{occupiedSpots} {lang === 'pt' ? 'caixas' : 'boxes'}</span>
          </div>

          <div className="space-y-3 pt-2">
            
            {/* NB-3 */}
            <div className="p-3 rounded-xl bg-red-50/80 border border-red-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-red-800 block">NB-3 (BSL-3)</span>
                <span className="text-[11px] text-red-600">M. tuberculosis & M. bovis virulentos</span>
              </div>
              <span className="text-xl font-black font-mono text-red-700">{nb3Count}</span>
            </div>

            {/* NB-2 */}
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-amber-800 block">NB-2 (BSL-2)</span>
                <span className="text-[11px] text-amber-600">BCG, MNT & Linhagens Atenuadas</span>
              </div>
              <span className="text-xl font-black font-mono text-amber-700">{nb2Count}</span>
            </div>

            {/* General */}
            <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-emerald-800 block">Geral / Não-Infeccioso</span>
                <span className="text-[11px] text-emerald-600">DNA, Primers, Reagentes, Enzimas</span>
              </div>
              <span className="text-xl font-black font-mono text-emerald-700">{genCount}</span>
            </div>

          </div>
        </div>

        {/* Card 3: Researcher & Team Distribution */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>{lang === 'pt' ? 'Distribuição por Membro' : 'Distribution by Member'}</span>
            </h3>
            <span className="text-xs font-mono text-slate-500 font-bold">{memberStats.length} {lang === 'pt' ? 'membros' : 'members'}</span>
          </div>

          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {memberStats.map((m) => (
              <div key={m.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: m.color }}
                  />
                  <span className="font-semibold text-slate-700">
                    {lang === 'pt' ? m.name : m.nameEn}
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                  {m.count} {lang === 'pt' ? 'caixas' : 'boxes'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
