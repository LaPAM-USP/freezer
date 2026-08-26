import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Layers, 
  ShieldAlert, 
  ShieldCheck, 
  Check, 
  Calendar, 
  User, 
  Tag, 
  Box as BoxIcon 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getShortCoordinate, formatCoordinate } from '../utils/coordinates';
import { CATEGORIES } from '../data/constants';

export default function PrintLabelModal({
  lang,
  initialBox, // single box object or null
  initialDrawerNum, // drawer number or null
  boxes,
  drawers,
  onClose,
}) {
  const [printMode, setPrintMode] = useState(
    initialBox ? 'single' : (initialDrawerNum ? 'drawer' : 'all')
  );
  const [selectedDrawerNum, setSelectedDrawerNum] = useState(initialDrawerNum || 1);
  const [labelSize, setLabelSize] = useState('standard'); // 'standard' (cryobox lid 2x2) or 'compact' (side strip)

  // Determine which boxes to print
  let printBoxes = [];
  if (printMode === 'single' && initialBox) {
    printBoxes = [initialBox];
  } else if (printMode === 'drawer') {
    printBoxes = boxes.filter(b => b.drawer === selectedDrawerNum);
  } else {
    printBoxes = [...boxes].sort((a, b) => (a.drawer * 1000 + a.row * 100 + a.col) - (b.drawer * 1000 + b.row * 100 + b.col));
  }

  const handlePrint = () => {
    window.print();
  };

  const getBaseUrl = () => {
    return window.location.origin + window.location.pathname;
  };

  return (
    <div className="print-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      
      {/* Modal Container */}
      <div 
        className="print-modal-container bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header (Hidden during print) */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
          
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-sky-100 text-sky-700">
              <Printer className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base text-slate-900 leading-none">
                {lang === 'pt' ? 'Gerador & Impressão de Etiquetas QR-Code' : 'QR-Code Box Label Generator & Print'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {lang === 'pt' ? 'Etiquetas otimizadas para tampa e lateral de caixas criogênicas' : 'Labels optimized for cryobox lids and sides'}
              </p>
            </div>
          </div>

          {/* Print Controls */}
          <div className="flex items-center gap-2">
            
            {/* Print Mode Selector */}
            <select
              value={printMode}
              onChange={(e) => setPrintMode(e.target.value)}
              className="h-9 px-3 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-800 cursor-pointer"
            >
              {initialBox && <option value="single">{lang === 'pt' ? 'Apenas Esta Caixa' : 'Only This Box'}</option>}
              <option value="drawer">{lang === 'pt' ? 'Todas da Gaveta' : 'All in Drawer'}</option>
              <option value="all">{lang === 'pt' ? 'Todas do Freezer (80 posições)' : 'All in Freezer'}</option>
            </select>

            {printMode === 'drawer' && (
              <select
                value={selectedDrawerNum}
                onChange={(e) => setSelectedDrawerNum(parseInt(e.target.value, 10))}
                className="h-9 px-3 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-800 cursor-pointer"
              >
                <option value={1}>{lang === 'pt' ? 'Gaveta 1' : 'Drawer 1'}</option>
                <option value={2}>{lang === 'pt' ? 'Gaveta 2' : 'Drawer 2'}</option>
                <option value={3}>{lang === 'pt' ? 'Gaveta 3' : 'Drawer 3'}</option>
                <option value={4}>{lang === 'pt' ? 'Gaveta 4' : 'Drawer 4'}</option>
              </select>
            )}

            <button
              onClick={handlePrint}
              className="h-9 px-4 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{lang === 'pt' ? 'Imprimir Agora' : 'Print Now'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

          </div>

        </div>

        {/* Printable Area / Sheet Preview */}
        <div className="print-sheet-area p-6 overflow-y-auto bg-slate-100 flex-1">
          
          {printBoxes.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              {lang === 'pt' ? 'Nenhuma caixa cadastrada para impressão nesta seleção.' : 'No boxes registered for printing in this selection.'}
            </div>
          ) : (
            <div className="print-labels-grid grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {printBoxes.map((box) => {
                const shortCoord = getShortCoordinate(box.drawer, box.row, box.col, lang);
                const fullCoord = formatCoordinate(box.drawer, box.row, box.col, lang);
                const qrUrl = `${getBaseUrl()}?spot=${box.spotId}`;

                return (
                  <div
                    key={box.id}
                    className="label-container bg-white text-black p-4 rounded-2xl border-2 border-dashed border-slate-300 shadow-xs relative flex flex-col justify-between"
                    style={{ minHeight: '210px' }}
                  >
                    
                    {/* Header: Lab Name & Freezer Info */}
                    <div className="flex items-center justify-between border-b border-black pb-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-sm tracking-tight">LaPAM · ICB-USP</span>
                        <span className="text-[10px] font-mono font-bold bg-black text-white px-1.5 py-0.2 rounded">
                          -80°C
                        </span>
                      </div>

                      {/* Prominent Coordinate Badge */}
                      <span className="font-mono font-black text-base px-2 py-0.5 rounded bg-slate-100 border border-black">
                        {shortCoord}
                      </span>
                    </div>

                    {/* Middle: Title & QR Code */}
                    <div className="flex items-start gap-3 my-1">
                      
                      {/* Left: Box Details */}
                      <div className="flex-1 space-y-1">
                        <h4 className="font-extrabold text-sm sm:text-base leading-tight text-slate-900 line-clamp-2">
                          {box.title}
                        </h4>

                        <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                          <span>{lang === 'pt' ? 'Resp:' : 'Owner:'}</span>
                          <span className="font-bold">{box.ownerName}</span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-slate-600 font-mono">
                          <span>{lang === 'pt' ? 'Data:' : 'Date:'} {box.date || '-'}</span>
                          <span>·</span>
                          <span>{box.occupiedCount || 0}/{box.totalCapacity || 81} tubos</span>
                        </div>

                        {/* Biosafety Warning */}
                        <div className="pt-0.5">
                          {box.biosafety === 'nb3' && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-red-600 text-white tracking-wider">
                              NB-3 (BSL-3) · VIRULENTO
                            </span>
                          )}
                          {box.biosafety === 'nb2' && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500 text-black tracking-wider">
                              NB-2 (BSL-2) · ATENUADO
                            </span>
                          )}
                          {box.biosafety === 'general' && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-200 text-slate-800 tracking-wider">
                              GERAL / NÃO-INFEC
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Sharp QR Code */}
                      <div className="shrink-0 p-1.5 bg-white border border-slate-300 rounded-lg flex flex-col items-center">
                        <QRCodeSVG
                          value={qrUrl}
                          size={76}
                          level="M"
                          includeMargin={false}
                        />
                        <span className="text-[8px] font-mono text-slate-500 mt-1 font-bold">
                          SCAN ME
                        </span>
                      </div>

                    </div>

                    {/* Footer: Coordinate String & Cut Guide */}
                    <div className="border-t border-slate-200 pt-1.5 mt-2 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                      <span>{fullCoord}</span>
                      <span className="text-[8px] uppercase tracking-wider text-slate-400">✂ Recortar / Colar na Caixa</span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Modal Bottom (Hidden during print) */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between no-print">
          <span className="text-xs text-slate-500">
            {lang === 'pt' 
              ? `${printBoxes.length} etiqueta(s) selecionada(s) para impressão.` 
              : `${printBoxes.length} label(s) selected for printing.`}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="h-9 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 cursor-pointer"
            >
              {lang === 'pt' ? 'Fechar' : 'Close'}
            </button>

            <button
              onClick={handlePrint}
              className="h-9 px-5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{lang === 'pt' ? 'Imprimir Etiquetas' : 'Print Labels'}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
