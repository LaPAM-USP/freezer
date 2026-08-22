import React, { useState } from 'react';
import { 
  Snowflake, 
  Plus, 
  Edit3, 
  Printer, 
  ShieldAlert, 
  ShieldCheck, 
  User, 
  QrCode,
  ArrowLeft,
  Calendar,
  Box as BoxIcon
} from 'lucide-react';
import { getSpotId, getShortCoordinate, formatCoordinate } from '../utils/coordinates';
import { LAB_MEMBERS } from '../data/constants';

export default function SingleDrawerFocus({
  lang,
  drawers,
  boxes,
  focusedDrawerId,
  setFocusedDrawerId,
  onSelectSpot,
  onSelectBox,
  onEditDrawer,
  onPrintDrawerLabels,
  onBackToFreezer,
}) {
  const currentDrawer = drawers.find(d => d.number === focusedDrawerId) || drawers[0];
  const drawerBoxes = boxes.filter(b => b.drawer === currentDrawer.number);
  const occupiedCount = drawerBoxes.length;
  const totalSpots = 20;
  const occupancyPercent = Math.round((occupiedCount / totalSpots) * 100);

  return (
    <div className="space-y-6">
      
      {/* Header Navigation & Drawer Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        
        {/* Back Button & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToFreezer}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'pt' ? 'Visão Geral' : 'Overview'}</span>
          </button>

          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>{lang === 'pt' ? currentDrawer.namePt : currentDrawer.nameEn}</span>
            </h2>
            <p className="text-xs text-slate-500">
              {lang === 'pt' ? currentDrawer.descriptionPt : currentDrawer.descriptionEn}
            </p>
          </div>
        </div>

        {/* 4 Drawer Quick Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {drawers.map((d) => (
            <button
              key={d.id}
              onClick={() => setFocusedDrawerId(d.number)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                focusedDrawerId === d.number
                  ? 'bg-white text-sky-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'pt' ? `Gaveta ${d.number}` : `Drawer ${d.number}`}
            </button>
          ))}
        </div>

      </div>

      {/* Drawer Info Banner & Actions */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-600/30 border border-sky-500/50 flex items-center justify-center font-black text-2xl font-mono text-sky-300 shadow-inner">
            G{currentDrawer.number}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-sky-400 font-bold">
                {lang === 'pt' ? 'GAVETA SELECIONADA' : 'SELECTED DRAWER'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-900/80 text-sky-200 border border-sky-700">
                {currentDrawer.claimedByName || (lang === 'pt' ? 'Coletivo' : 'Community')}
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-white mt-0.5">
              {lang === 'pt' ? currentDrawer.namePt : currentDrawer.nameEn}
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {lang === 'pt' ? currentDrawer.descriptionPt : currentDrawer.descriptionEn}
            </p>
          </div>
        </div>

        {/* Occupancy and Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-slate-800/80 border border-slate-700 px-4 py-2.5 rounded-2xl text-right">
            <span className="text-[10px] uppercase font-mono text-slate-400 block font-bold">
              {lang === 'pt' ? 'OCUPAÇÃO' : 'OCCUPANCY'}
            </span>
            <span className="text-lg font-black font-mono text-sky-400">
              {occupiedCount} / 20 <span className="text-xs font-normal text-slate-400">({occupancyPercent}%)</span>
            </span>
          </div>

          <button
            onClick={() => onEditDrawer(currentDrawer)}
            className="h-10 px-3.5 rounded-xl text-xs font-bold text-white bg-slate-700 hover:bg-slate-600 border border-slate-600 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>{lang === 'pt' ? 'Configurar Gaveta' : 'Configure'}</span>
          </button>

          <button
            onClick={() => onPrintDrawerLabels(currentDrawer.number)}
            className="h-10 px-3.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{lang === 'pt' ? 'Imprimir Etiquetas' : 'Print Labels'}</span>
          </button>
        </div>

      </div>

      {/* Enlarged 4 Rows x 5 Columns Grid */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
        
        {/* Top / Back of Drawer Indicator */}
        <div className="flex items-center justify-center gap-2 pb-2 border-b border-slate-200 text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          <span>⬆️ {lang === 'pt' ? 'FUNDO DA GAVETA (INTERIOR)' : 'BACK OF DRAWER (DEEP INTERIOR)'}</span>
        </div>

        {/* Column Headers */}
        <div className="grid grid-cols-5 gap-3 sm:gap-4 px-8 text-center text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
          <div>{lang === 'pt' ? 'Coluna 1 (C1)' : 'Col 1 (C1)'}</div>
          <div>{lang === 'pt' ? 'Coluna 2 (C2)' : 'Col 2 (C2)'}</div>
          <div>{lang === 'pt' ? 'Coluna 3 (C3)' : 'Col 3 (C3)'}</div>
          <div>{lang === 'pt' ? 'Coluna 4 (C4)' : 'Col 4 (C4)'}</div>
          <div>{lang === 'pt' ? 'Coluna 5 (C5)' : 'Col 5 (C5)'}</div>
        </div>

        {/* 4 Rows (Inverted: Row 4 at back/top, Row 1 at front/bottom near door) */}
        <div className="space-y-4">
          {[4, 3, 2, 1].map((rowNum) => (
            <div key={rowNum} className="flex items-center gap-3">
              
              {/* Row Header */}
              <div className="w-6 text-xs font-mono font-bold text-slate-500 text-right shrink-0">
                L{rowNum}
              </div>

              {/* 5 Spots */}
              <div className="grid grid-cols-5 gap-3 sm:gap-4 flex-1">
                {[1, 2, 3, 4, 5].map((colNum) => {
                  const spotId = getSpotId(currentDrawer.number, rowNum, colNum);
                  const shortCoord = getShortCoordinate(currentDrawer.number, rowNum, colNum, lang);
                  const box = boxes.find(b => b.drawer === currentDrawer.number && b.row === rowNum && b.col === colNum);

                  return (
                    <div key={spotId} className="relative">
                      {box ? (
                        /* Occupied Box Card */
                        <div
                          onClick={() => onSelectBox(box)}
                          className="h-32 sm:h-36 p-3 rounded-2xl bg-white border-2 border-slate-200 hover:border-sky-400 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between select-none relative overflow-hidden group"
                        >
                          {/* Top Info */}
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                              {shortCoord}
                            </span>

                            <div className="flex items-center gap-1.5">
                              {box.biosafety === 'nb3' && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                                  NB-3
                                </span>
                              )}
                              {box.biosafety === 'nb2' && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                                  NB-2
                                </span>
                              )}
                              <QrCode className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600" />
                            </div>
                          </div>

                          {/* Title */}
                          <div>
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-tight">
                              {box.title}
                            </h4>
                            {box.tags && box.tags.length > 0 && (
                              <div className="flex gap-1 mt-1 overflow-hidden">
                                <span className="text-[9px] font-medium text-sky-700 bg-sky-50 px-1 rounded">
                                  #{box.tags[0]}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Footer: Owner & Capacity */}
                          <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[11px]">
                            <span className="font-semibold text-slate-700 truncate max-w-[80px]">
                              {box.ownerName}
                            </span>
                            <span className="font-mono text-slate-500 text-[10px]">
                              {box.occupiedCount || 0}/{box.totalCapacity || 81} tubos
                            </span>
                          </div>

                          {/* Left Color Indicator */}
                          <div 
                            className="absolute left-0 top-0 bottom-0 w-1.5" 
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
                        /* Empty Spot Card */
                        <button
                          onClick={() => onSelectSpot(currentDrawer.number, rowNum, colNum)}
                          className="w-full h-32 sm:h-36 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-sky-50/80 hover:border-sky-400 transition-all flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-sky-700 cursor-pointer group"
                        >
                          <span className="text-[11px] font-mono text-slate-400 group-hover:text-sky-600 font-semibold">
                            {shortCoord}
                          </span>
                          <div className="w-8 h-8 rounded-full bg-white group-hover:bg-sky-100 flex items-center justify-center text-slate-400 group-hover:text-sky-600 shadow-2xs transition-colors">
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400 group-hover:text-sky-700">
                            {lang === 'pt' ? 'Vaga Livre' : 'Free Spot'}
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
        <div className="mt-4 pt-3 border-t-2 border-slate-300 flex items-center justify-center">
          <div className="w-full max-w-lg py-2 px-6 rounded-2xl bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 border border-slate-400 shadow-inner flex items-center justify-center gap-3 text-slate-700 font-mono text-xs font-black tracking-wider uppercase">
            <span className="w-3 h-1.5 rounded-full bg-slate-500 inline-block"></span>
            <span>🚪 {lang === 'pt' ? 'FRENTE DA GAVETA / PUXADOR DA PORTA (LINHA 1)' : 'FRONT OF DRAWER / DOOR HANDLE (ROW 1)'}</span>
            <span className="w-3 h-1.5 rounded-full bg-slate-500 inline-block"></span>
          </div>
        </div>

      </div>

    </div>
  );
}
