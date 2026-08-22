import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  Edit3, 
  Trash2, 
  Download, 
  QrCode, 
  Calendar, 
  User, 
  Tag, 
  ShieldAlert, 
  ShieldCheck, 
  Copy, 
  Check, 
  Layers, 
  Box as BoxIcon, 
  Info,
  ExternalLink
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getShortCoordinate, formatCoordinate } from '../utils/coordinates';
import { CATEGORIES, BIOSAFETY_LEVELS } from '../data/constants';

export default function BoxDetailModal({
  lang,
  box,
  onClose,
  onEdit,
  onDelete,
  onPrintLabel,
}) {
  const [copiedUrl, setCopiedUrl] = React.useState(false);

  if (!box) return null;

  const shortCoord = getShortCoordinate(box.drawer, box.row, box.col, lang);
  const fullCoord = formatCoordinate(box.drawer, box.row, box.col, lang);

  // Generate deep link or shareable QR data
  const currentUrl = window.location.origin + window.location.pathname;
  const qrValue = `${currentUrl}?spot=${box.spotId}`;

  const catObj = CATEGORIES.find(c => c.id === box.category);
  const categoryName = catObj ? (lang === 'pt' ? catObj.namePt : catObj.nameEn) : box.category;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrValue);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleDownloadQrSvg = () => {
    const svgElement = document.getElementById('box-detail-qr-svg');
    if (!svgElement) return;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `QR-${box.spotId}-${box.title.slice(0, 15).replace(/\s+/g, '_')}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  const occupancyPercent = Math.round(((box.occupiedCount || 0) / (box.totalCapacity || 81)) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print animate-fade-in">
      
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          
          <div className="flex items-center gap-2.5">
            <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-sky-600 text-white shadow-xs">
              {shortCoord}
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500">
                {fullCoord}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                ID: {box.spotId}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPrintLabel(box)}
              className="h-8 px-3 rounded-lg text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-sky-600" />
              <span>{lang === 'pt' ? 'Imprimir Etiqueta' : 'Print Label'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Main Title & Biosafety Badges */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {categoryName}
              </span>

              {box.biosafety === 'nb3' && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                  <span>NB-3 (BSL-3) · Virulento</span>
                </span>
              )}

              {box.biosafety === 'nb2' && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>NB-2 (BSL-2) · Atenuado / MNT</span>
                </span>
              )}

              {box.biosafety === 'general' && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span>Geral / Não-Infeccioso</span>
                </span>
              )}

              <span className="text-xs font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                -80.0 °C
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 leading-snug">
              {box.title}
            </h3>
          </div>

          {/* QR Code & Printable Preview Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-sky-50/40 border border-slate-200 flex flex-col sm:flex-row items-center gap-5">
            
            {/* Crisp QR Code */}
            <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200 shrink-0">
              <QRCodeSVG
                id="box-detail-qr-svg"
                value={qrValue}
                size={130}
                level="M"
                includeMargin={false}
              />
            </div>

            {/* QR Details & Quick Actions */}
            <div className="space-y-2 text-center sm:text-left flex-1">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  {lang === 'pt' ? 'ETIQUETA INTELIGENTE QR CODE' : 'SMART QR CODE TAG'}
                </span>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {lang === 'pt' 
                    ? 'Ao escanear com a câmera do celular, abre diretamente a ficha técnica desta caixa no sistema.' 
                    : 'Scanning with a phone camera opens the technical data sheet for this box directly in the system.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={handleDownloadQrSvg}
                  className="h-8 px-2.5 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>{lang === 'pt' ? 'Baixar SVG' : 'Download SVG'}</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="h-8 px-2.5 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedUrl ? (lang === 'pt' ? 'Copiado!' : 'Copied!') : (lang === 'pt' ? 'Copiar Link' : 'Copy Link')}</span>
                </button>
              </div>
            </div>

          </div>

          {/* Grid of Key Properties */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Property: Owner */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                {lang === 'pt' ? 'Responsável / Proprietário' : 'Owner / Responsible'}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <User className="w-4 h-4 text-sky-600" />
                <span className="font-bold text-sm text-slate-800">
                  {box.ownerName}
                </span>
              </div>
            </div>

            {/* Property: Storage Date */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                {lang === 'pt' ? 'Data de Congelamento / Cadastro' : 'Registration / Stored Date'}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4 text-sky-600" />
                <span className="font-bold text-sm text-slate-800 font-mono">
                  {box.date || '-'}
                </span>
              </div>
            </div>

            {/* Property: Tube Count & Capacity */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                {lang === 'pt' ? 'Ocupação da Caixa' : 'Box Occupancy'}
              </span>
              <div className="mt-1">
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-sm text-slate-800 font-mono">
                    {box.occupiedCount || 0} / {box.totalCapacity || 81} {lang === 'pt' ? 'tubos' : 'vials'}
                  </span>
                  <span className="text-xs font-mono text-slate-500">{occupancyPercent}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div 
                    className="bg-sky-600 h-full rounded-full" 
                    style={{ width: `${occupancyPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Property: Grid Layout */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                {lang === 'pt' ? 'Formato da Caixa' : 'Box Format'}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <BoxIcon className="w-4 h-4 text-sky-600" />
                <span className="font-bold text-sm text-slate-800">
                  {box.gridType || '9x9'} ({box.totalCapacity || 81} {lang === 'pt' ? 'posições' : 'slots'})
                </span>
              </div>
            </div>

          </div>

          {/* Description & Technical Notes */}
          {(box.description || box.notes) && (
            <div className="space-y-3">
              {box.description && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-sky-600" />
                    <span>{lang === 'pt' ? 'Descrição da Amostra & Protocolo' : 'Sample Description & Protocol'}</span>
                  </span>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {box.description}
                  </p>
                </div>
              )}

              {box.notes && (
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                  <span className="text-xs font-bold text-amber-900">
                    {lang === 'pt' ? 'Observações & Armazenamento' : 'Notes & Storage Instructions'}
                  </span>
                  <p className="text-xs sm:text-sm text-amber-950 leading-relaxed whitespace-pre-wrap">
                    {box.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {box.tags && box.tags.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                <span>Tags / Metadados</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {box.tags.map((tag, idx) => (
                  <span 
                    key={idx}
                    className="text-xs font-medium px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          
          <button
            onClick={() => {
              if (confirm(lang === 'pt' ? `Deseja realmente excluir a caixa "${box.title}"?` : `Delete box "${box.title}"?`)) {
                onDelete(box.id);
                onClose();
              }
            }}
            className="h-9 px-3 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>{lang === 'pt' ? 'Excluir Caixa' : 'Delete Box'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(box);
              }}
              className="h-9 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Edit3 className="w-4 h-4 text-slate-500" />
              <span>{lang === 'pt' ? 'Editar Dados' : 'Edit Details'}</span>
            </button>

            <button
              onClick={() => onPrintLabel(box)}
              className="h-9 px-4 rounded-xl text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>{lang === 'pt' ? 'Imprimir Etiqueta' : 'Print Label'}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
