import React, { useState } from 'react';
import { 
  Snowflake, 
  Plus, 
  QrCode, 
  Edit3, 
  Printer, 
  Maximize2, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  ShieldCheck, 
  User, 
  Sparkles,
  Layers,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSpotId, getShortCoordinate, formatCoordinate } from '../utils/coordinates';
import { LAB_MEMBERS, CATEGORIES, BIOSAFETY_LEVELS } from '../data/constants';

export default function FreezerVisual({
  lang,
  drawers,
  boxes,
  searchQuery,
  selectedDrawer,
  selectedOwner,
  selectedCategory,
  selectedBiosafety,
  onSelectSpot,
  onSelectBox,
  onEditDrawer,
  onPrintDrawerLabels,
  onFocusDrawer,
  members = LAB_MEMBERS,
}) {
  const membersList = members && members.length > 0 ? members : LAB_MEMBERS;

  // Collapsed drawers state (default: all expanded or filtered)
  const [collapsedDrawers, setCollapsedDrawers] = useState({});

  const toggleCollapse = (drawerId) => {
    setCollapsedDrawers(prev => ({
      ...prev,
      [drawerId]: !prev[drawerId]
    }));
  };

  // Helper to test if a box matches current active filters
  const doesBoxMatchFilters = (box) => {
    if (!box) return false;

    if (selectedDrawer !== 'all' && String(box.drawer) !== String(selectedDrawer)) {
      return false;
    }
    if (selectedOwner !== 'all' && box.ownerId !== selectedOwner) {
      return false;
    }
    if (selectedCategory !== 'all' && box.category !== selectedCategory) {
      return false;
    }
    if (selectedBiosafety !== 'all' && box.biosafety !== selectedBiosafety) {
      return false;
    }

    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = box.title?.toLowerCase().includes(q);
      const matchOwner = box.ownerName?.toLowerCase().includes(q);
      const matchSpot = box.spotId?.toLowerCase().includes(q);
      const matchDesc = box.description?.toLowerCase().includes(q);
      const matchNotes = box.notes?.toLowerCase().includes(q);
      const matchTags = box.tags?.some(t => t.toLowerCase().includes(q));
      const shortCoord = getShortCoordinate(box.drawer, box.row, box.col, 'pt').toLowerCase();
      const shortCoordEn = getShortCoordinate(box.drawer, box.row, box.col, 'en').toLowerCase();

      return matchTitle || matchOwner || matchSpot || matchDesc || matchNotes || matchTags || shortCoord.includes(q) || shortCoordEn.includes(q);
    }

    return true;
  };

  const hasAnyFilterActive = searchQuery.trim() !== '' || selectedOwner !== 'all' || selectedCategory !== 'all' || selectedBiosafety !== 'all';

  // Visible drawers based on filter
  const visibleDrawers = selectedDrawer === 'all'
    ? drawers
    : drawers.filter(d => String(d.number) === String(selectedDrawer));

  return (
    <div className="space-y-8">
      
      {/* Freezer Outer Body Container */}
      <div className="rounded-3xl bg-slate-900 text-white p-3 sm:p-5 shadow-2xl border-4 border-slate-700/80 relative overflow-hidden">
        
        {/* Subtle Freezer Texture / Shine Header */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-teal-300 to-sky-400 opacity-80" />
        
        {/* Freezer Top Electronic Control Panel */}
        <div className="bg-slate-800/90 rounded-2xl p-3 sm:p-4 mb-4 border border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-950 border border-sky-800/60 shadow-inner">
              <Snowflake className="w-6 h-6 text-sky-400 animate-spin" style={{ animationDuration: '12s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-slate-100">
                  ULTRA-LOW -80°C FREEZER
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'pt' 
                  ? 'Laboratório de Pesquisa Aplicada a Micobactérias · ICB II - USP' 
                  : 'Laboratory of Applied Research in Mycobacteria · ICB II - USP'}
              </p>
            </div>
          </div>

          {/* LED Display Indicator */}
          <div className="flex items-center gap-3 bg-black/70 px-4 py-2 rounded-xl border border-sky-900/60 shadow-inner">
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-widest text-sky-400 font-mono font-bold">
                TEMP SENSOR
              </div>
              <div className="text-xl sm:text-2xl font-black text-sky-400 font-mono tracking-wider flex items-center gap-1">
                <span>-80.0</span>
                <span className="text-xs text-sky-300">°C</span>
              </div>
            </div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
          </div>

        </div>

        {/* 4 Drawers Stacked Vertically */}
        <div className="space-y-4">
          {visibleDrawers.map((drawer) => {
            const drawerBoxes = boxes.filter(b => b.drawer === drawer.number);
            const drawerOccupancy = drawerBoxes.length;
            const drawerCapacity = 20;
            const drawerPercent = Math.round((drawerOccupancy / drawerCapacity) * 100);
            const isCollapsed = !!collapsedDrawers[drawer.id];

            // Claimed owner info
            const ownerObj = membersList.find(m => m.id === drawer.claimedBy);

            return (
              <div 
                key={drawer.id} 
                className="rounded-2xl bg-slate-100 text-slate-900 border border-slate-300 shadow-md overflow-hidden transition-all"
              >
                
                {/* Drawer Compartment Header Bar */}
                <div className="bg-white px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
                  
                  {/* Left: Drawer Number & Title & Owner */}
                  <div className="flex items-center gap-3">
                    
                    <button
                      onClick={() => toggleCollapse(drawer.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                      title={isCollapsed ? (lang === 'pt' ? 'Expandir gaveta' : 'Expand drawer') : (lang === 'pt' ? 'Recolher gaveta' : 'Collapse drawer')}
                    >
                      {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-sky-600 text-white font-black text-xs flex items-center justify-center font-mono shadow-xs">
                        G{drawer.number}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
                            {lang === 'pt' ? drawer.namePt : drawer.nameEn}
                          </h4>
                          
                          {/* Claimed Owner Badge */}
                          <span 
                            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border shadow-2xs"
                            style={{
                              backgroundColor: drawer.isCommunity ? '#f0f9ff' : '#f8fafc',
                              color: drawer.isCommunity ? '#0369a1' : '#334155',
                              borderColor: drawer.isCommunity ? '#bae6fd' : '#cbd5e1'
                            }}
                          >
                            <User className="w-3 h-3 text-slate-500" />
                            <span>{drawer.claimedByName || (lang === 'pt' ? 'Coletivo' : 'Community')}</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 hidden sm:block mt-0.5">
                          {lang === 'pt' ? drawer.descriptionPt : drawer.descriptionEn}
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Right: Drawer Actions & Occupancy Badge */}
                  <div className="flex items-center gap-2">
                    
                    {/* Occupancy Indicator */}
                    <div className="hidden md:flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
                      <span className="text-slate-500">{lang === 'pt' ? 'Ocupação:' : 'Occupancy:'}</span>
                      <span className="font-mono font-bold text-slate-800">{drawerOccupancy}/20</span>
                      <div className="w-12 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-sky-600 rounded-full" 
                          style={{ width: `${drawerPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Edit Drawer Button */}
                    <button
                      onClick={() => onEditDrawer(drawer)}
                      title={lang === 'pt' ? "Configurar título e responsável desta gaveta" : "Configure drawer title and owner"}
                      className="h-8 px-2.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                      <span className="hidden sm:inline">{lang === 'pt' ? 'Configurar' : 'Configure'}</span>
                    </button>

                    {/* Print All Drawer Labels Button */}
                    <button
                      onClick={() => onPrintDrawerLabels(drawer.number)}
                      title={lang === 'pt' ? "Imprimir todas as etiquetas QR desta gaveta" : "Print all QR labels for this drawer"}
                      className="h-8 px-2.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-sky-600" />
                      <span className="hidden sm:inline">{lang === 'pt' ? 'Etiquetas' : 'Labels'}</span>
                    </button>

                    {/* Focus Single Drawer View Button */}
                    <button
                      onClick={() => onFocusDrawer(drawer.number)}
                      title={lang === 'pt' ? "Visualizar apenas esta gaveta em tela cheia" : "Focus on this drawer"}
                      className="h-8 w-8 rounded-lg text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 transition-colors inline-flex items-center justify-center cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>

                  </div>

                </div>

                {/* Drawer Interior Matrix (4 Rows x 5 Columns = 20 Spots) */}
                {!isCollapsed && (
                  <div className="p-3 sm:p-4 bg-slate-50/70">
                    
                    {/* Top / Back of Drawer Indicator */}
                    <div className="flex items-center justify-center gap-2 mb-2.5 pb-1.5 border-b border-slate-200/90 text-[10px] sm:text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      <span>⬆️ {lang === 'pt' ? 'FUNDO DA GAVETA (INTERIOR)' : 'BACK OF DRAWER (DEEP INTERIOR)'}</span>
                    </div>

                    {/* Grid Column Headers: C1 .. C5 */}
                    <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-2 px-6 sm:px-8 text-center text-[10px] sm:text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                      <div>{lang === 'pt' ? 'Coluna 1' : 'Col 1'}</div>
                      <div>{lang === 'pt' ? 'Coluna 2' : 'Col 2'}</div>
                      <div>{lang === 'pt' ? 'Coluna 3' : 'Col 3'}</div>
                      <div>{lang === 'pt' ? 'Coluna 4' : 'Col 4'}</div>
                      <div>{lang === 'pt' ? 'Coluna 5' : 'Col 5'}</div>
                    </div>

                    {/* 4 Rows (Inverted: Row 4 at the back/top, Row 1 at the front/bottom near the door) */}
                    <div className="space-y-2 sm:space-y-3">
                      {[4, 3, 2, 1].map((rowNum) => (
                        <div key={rowNum} className="flex items-center gap-2">
                          
                          {/* Row Header Badge */}
                          <div className="w-5 sm:w-6 text-[10px] sm:text-xs font-mono font-bold text-slate-400 shrink-0 text-right pr-1">
                            L{rowNum}
                          </div>

                          {/* 5 Column Spots for this Row */}
                          <div className="grid grid-cols-5 gap-2 sm:gap-3 flex-1">
                            {[1, 2, 3, 4, 5].map((colNum) => {
                              const spotId = getSpotId(drawer.number, rowNum, colNum);
                              const shortCoord = getShortCoordinate(drawer.number, rowNum, colNum, lang);
                              const box = boxes.find(b => b.drawer === drawer.number && b.row === rowNum && b.col === colNum);
                              
                              const isOccupied = !!box;
                              const isMatch = isOccupied && doesBoxMatchFilters(box);
                              const isDimmed = hasAnyFilterActive && isOccupied && !isMatch;

                              return (
                                <div key={spotId} className="relative group">
                                  {isOccupied ? (
                                    /* Occupied Spot Tile */
                                    <div
                                      onClick={() => onSelectBox(box)}
                                      className={`h-24 sm:h-28 p-2 rounded-xl bg-white border cursor-pointer transition-all flex flex-col justify-between select-none relative overflow-hidden ${
                                        isMatch && hasAnyFilterActive
                                          ? 'ring-2 ring-sky-500 border-sky-400 shadow-md scale-[1.02] z-10'
                                          : isDimmed
                                          ? 'opacity-35 grayscale border-slate-200'
                                          : 'border-slate-200 hover:border-sky-300 hover:shadow-md hover:-translate-y-0.5'
                                      }`}
                                    >
                                      {/* Top Row: Coordinate Badge + Biosafety / Category Indicator */}
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                          {shortCoord}
                                        </span>

                                        <div className="flex items-center gap-1">
                                          {box.biosafety === 'nb3' && (
                                            <span 
                                              title="NB-3 (Virulento / M. tb)" 
                                              className="w-4 h-4 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-[9px] font-bold"
                                            >
                                              <ShieldAlert className="w-2.5 h-2.5" />
                                            </span>
                                          )}
                                          {box.biosafety === 'nb2' && (
                                            <span 
                                              title="NB-2 (BCG / MNT)" 
                                              className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[9px] font-bold"
                                            >
                                              <ShieldCheck className="w-2.5 h-2.5" />
                                            </span>
                                          )}
                                          <QrCode className="w-3 h-3 text-slate-400 group-hover:text-sky-600 transition-colors" />
                                        </div>
                                      </div>

                                      {/* Center: Box Title */}
                                      <div className="my-auto">
                                        <p 
                                          className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug"
                                          title={box.title}
                                        >
                                          {box.title}
                                        </p>
                                      </div>

                                      {/* Bottom: Owner & Tubes count */}
                                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                                        <span className="font-semibold text-slate-600 truncate max-w-[65px]" title={box.ownerName}>
                                          {box.ownerName?.split(' ')[0]}
                                        </span>
                                        <span className="font-mono text-slate-400 text-[9px]">
                                          {box.occupiedCount || 0}/{box.totalCapacity || 81}
                                        </span>
                                      </div>

                                      {/* Left Color Ribbon based on category */}
                                      <div 
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500" 
                                        style={{
                                          backgroundColor: box.category === 'stocks' ? '#f43f5e' :
                                                           box.category === 'dna_rna' ? '#0ea5e9' :
                                                           box.category === 'isolates' ? '#a855f7' :
                                                           box.category === 'primers' ? '#10b981' :
                                                           box.category === 'reagents' ? '#f59e0b' : '#64748b'
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    /* Empty Spot Tile */
                                    <button
                                      onClick={() => onSelectSpot(drawer.number, rowNum, colNum)}
                                      className={`w-full h-24 sm:h-28 rounded-xl border-2 border-dashed border-slate-200 bg-white/60 hover:bg-sky-50/80 hover:border-sky-400 transition-all flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-sky-700 cursor-pointer group/slot ${
                                        hasAnyFilterActive ? 'opacity-40' : ''
                                      }`}
                                      title={formatCoordinate(drawer.number, rowNum, colNum, lang)}
                                    >
                                      <span className="text-[10px] font-mono text-slate-400 group-hover/slot:text-sky-600 font-semibold">
                                        {shortCoord}
                                      </span>
                                      <div className="w-6 h-6 rounded-full bg-slate-100 group-hover/slot:bg-sky-100 flex items-center justify-center text-slate-400 group-hover/slot:text-sky-600 transition-colors">
                                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                      </div>
                                      <span className="text-[9px] font-medium opacity-0 group-hover/slot:opacity-100 transition-opacity text-sky-700">
                                        {lang === 'pt' ? 'Adicionar' : 'Add Box'}
                                      </span>
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                        </div>
                      ))}
                    </div>

                    {/* Bottom / Front Door Handle Indicator */}
                    <div className="mt-3 pt-2.5 border-t-2 border-slate-300/80 flex items-center justify-center">
                      <div className="w-full max-w-md py-1.5 px-4 rounded-xl bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 border border-slate-400/60 shadow-inner flex items-center justify-center gap-2 text-slate-700 font-mono text-[10px] sm:text-xs font-black tracking-wider uppercase">
                        <span className="w-2.5 h-1 rounded-full bg-slate-500/80 inline-block"></span>
                        <span>🚪 {lang === 'pt' ? 'FRENTE DA GAVETA / PUXADOR DA PORTA (LINHA 1)' : 'FRONT OF DRAWER / DOOR HANDLE (ROW 1)'}</span>
                        <span className="w-2.5 h-1 rounded-full bg-slate-500/80 inline-block"></span>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
