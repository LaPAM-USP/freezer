import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  QrCode, 
  Printer, 
  Edit3, 
  Trash2, 
  Eye, 
  ShieldAlert, 
  ShieldCheck, 
  Calendar, 
  Plus, 
  Tag, 
  FileSpreadsheet,
  ArrowUpDown,
  User
} from 'lucide-react';
import { getShortCoordinate, formatCoordinate } from '../utils/coordinates';
import { CATEGORIES } from '../data/constants';

export default function TableView({
  lang,
  boxes,
  drawers,
  searchQuery,
  setSearchQuery,
  onSelectBox,
  onEditBox,
  onDeleteBox,
  onPrintLabel,
  onOpenRegister,
  onExportCsv
}) {
  const [sortField, setSortField] = useState('spotId');
  const [sortAsc, setSortAsc] = useState(true);

  // Filter boxes
  const filteredBoxes = boxes.filter((box) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const shortCoord = getShortCoordinate(box.drawer, box.row, box.col, 'pt').toLowerCase();
    return (
      box.title?.toLowerCase().includes(q) ||
      box.ownerName?.toLowerCase().includes(q) ||
      box.spotId?.toLowerCase().includes(q) ||
      box.category?.toLowerCase().includes(q) ||
      box.description?.toLowerCase().includes(q) ||
      box.tags?.some(t => t.toLowerCase().includes(q)) ||
      shortCoord.includes(q)
    );
  });

  // Sort boxes
  const sortedBoxes = [...filteredBoxes].sort((a, b) => {
    let aVal = a[sortField] || '';
    let bVal = b[sortField] || '';

    if (sortField === 'spotId') {
      aVal = a.drawer * 1000 + a.row * 100 + a.col;
      bVal = b.drawer * 1000 + b.row * 100 + b.col;
    }

    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const getCategoryBadge = (catId) => {
    const cat = CATEGORIES.find(c => c.id === catId);
    return cat ? (lang === 'pt' ? cat.namePt : cat.nameEn) : catId;
  };

  return (
    <div className="space-y-4">
      
      {/* Table Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'pt' ? "Filtrar por nome, cepa, responsável, tag..." : "Filter by name, strain, owner, tag..."}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 outline-none"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
            {sortedBoxes.length} {lang === 'pt' ? 'caixas encontradas' : 'boxes found'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportCsv}
            className="h-8 px-3 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{lang === 'pt' ? 'Exportar CSV' : 'Export CSV'}</span>
          </button>

          <button
            onClick={() => onOpenRegister(null)}
            className="h-8 px-3 rounded-lg text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{lang === 'pt' ? 'Nova Caixa' : 'New Box'}</span>
          </button>
        </div>

      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
              <tr>
                <th 
                  onClick={() => handleSort('spotId')}
                  className="px-4 py-3 cursor-pointer hover:text-sky-600 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>{lang === 'pt' ? 'Coordenada' : 'Coordinate'}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('title')}
                  className="px-4 py-3 cursor-pointer hover:text-sky-600 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>{lang === 'pt' ? 'Identificação / Caixa' : 'Box Title'}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('ownerName')}
                  className="px-4 py-3 cursor-pointer hover:text-sky-600 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>{lang === 'pt' ? 'Responsável' : 'Owner'}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-4 py-3">
                  {lang === 'pt' ? 'Categoria' : 'Category'}
                </th>
                <th className="px-4 py-3 text-center">
                  {lang === 'pt' ? 'Biossegurança' : 'Biosafety'}
                </th>
                <th className="px-4 py-3 text-center">
                  {lang === 'pt' ? 'Ocupação' : 'Occupancy'}
                </th>
                <th 
                  onClick={() => handleSort('date')}
                  className="px-4 py-3 cursor-pointer hover:text-sky-600 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>{lang === 'pt' ? 'Data' : 'Date'}</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-right">
                  {lang === 'pt' ? 'Ações' : 'Actions'}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-sans">
              {sortedBoxes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    {lang === 'pt' ? 'Nenhuma amostra encontrada com os filtros selecionados.' : 'No samples found with current filters.'}
                  </td>
                </tr>
              ) : (
                sortedBoxes.map((box) => {
                  const shortCoord = getShortCoordinate(box.drawer, box.row, box.col, lang);

                  return (
                    <tr key={box.id} className="hover:bg-slate-50/80 transition-colors group">
                      
                      {/* Coordinate */}
                      <td className="px-4 py-3 font-mono font-bold text-sky-900 whitespace-nowrap">
                        <span className="bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded-md text-[11px]">
                          {shortCoord}
                        </span>
                      </td>

                      {/* Title & Tags */}
                      <td className="px-4 py-3">
                        <div 
                          onClick={() => onSelectBox(box)}
                          className="cursor-pointer group-hover:text-sky-700"
                        >
                          <div className="font-bold text-slate-900 text-xs sm:text-sm">
                            {box.title}
                          </div>
                          {box.tags && box.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {box.tags.map((t, idx) => (
                                <span key={idx} className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Owner */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{box.ownerName}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-[11px] text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-medium">
                          {getCategoryBadge(box.category)}
                        </span>
                      </td>

                      {/* Biosafety */}
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {box.biosafety === 'nb3' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                            <ShieldAlert className="w-3 h-3 text-red-600" />
                            <span>NB-3</span>
                          </span>
                        )}
                        {box.biosafety === 'nb2' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            <ShieldCheck className="w-3 h-3 text-amber-600" />
                            <span>NB-2</span>
                          </span>
                        )}
                        {box.biosafety === 'general' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span>Geral</span>
                          </span>
                        )}
                      </td>

                      {/* Occupancy */}
                      <td className="px-4 py-3 text-center whitespace-nowrap font-mono text-xs">
                        <span className="font-semibold text-slate-700">{box.occupiedCount || 0}</span>
                        <span className="text-slate-400">/{box.totalCapacity || 81}</span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {box.date || '-'}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          
                          {/* View Modal */}
                          <button
                            onClick={() => onSelectBox(box)}
                            title={lang === 'pt' ? 'Ver Detalhes e QR Code' : 'View Details & QR Code'}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-700 hover:bg-sky-50 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Print Label */}
                          <button
                            onClick={() => onPrintLabel(box)}
                            title={lang === 'pt' ? 'Imprimir Etiqueta' : 'Print Label'}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-700 hover:bg-sky-50 transition-colors cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Box */}
                          <button
                            onClick={() => onEditBox(box)}
                            title={lang === 'pt' ? 'Editar Caixa' : 'Edit Box'}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Box */}
                          <button
                            onClick={() => {
                              if (confirm(lang === 'pt' ? `Remover caixa "${box.title}"?` : `Delete box "${box.title}"?`)) {
                                onDeleteBox(box.id);
                              }
                            }}
                            title={lang === 'pt' ? 'Excluir Caixa' : 'Delete Box'}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
