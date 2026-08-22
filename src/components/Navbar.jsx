import React, { useState } from 'react';
import { 
  Snowflake, 
  Plus, 
  QrCode, 
  Download, 
  Upload, 
  RotateCcw, 
  Globe2, 
  Layers,
  Table as TableIcon,
  BarChart3,
  ChevronDown,
  FileSpreadsheet
} from 'lucide-react';

export default function Navbar({ 
  lang, 
  setLang, 
  activeView, 
  setActiveView, 
  onOpenRegister, 
  onOpenScanner,
  onExportJson,
  onExportCsv,
  onImportJson,
  onResetData,
  occupiedCount,
  totalCapacity
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        onImportJson(content);
        setDropdownOpen(false);
      } catch (err) {
        alert(lang === 'pt' ? 'Arquivo JSON inválido.' : 'Invalid JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs no-print">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand / Logo */}
          <div className="flex items-center gap-3">
            <a 
              href="https://lapam-usp.github.io/" 
              title={lang === 'pt' ? "Ir para o site principal do LaPAM" : "Go to main LaPAM website"}
              className="flex items-center gap-2.5 group"
            >
              <img
                src="./img/LOGO%20LAPAM.png"
                alt="LaPAM Logo"
                className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 leading-none">
                  LaPAM
                </span>
                <span className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                  {lang === 'pt' ? 'Sistema de Inventário & Tags' : 'Biobank & Tag System'}
                </span>
              </div>
            </a>
          </div>

          {/* Navigation Views */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setActiveView('freezer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'freezer'
                  ? 'bg-white text-sky-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-sky-600" />
              <span>{lang === 'pt' ? 'Visão Geral Freezer' : 'Freezer Overview'}</span>
            </button>

            <button
              onClick={() => setActiveView('drawers')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'drawers'
                  ? 'bg-white text-sky-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Snowflake className="w-3.5 h-3.5 text-sky-600" />
              <span>{lang === 'pt' ? 'Gavetas (4x5)' : 'Drawers (4x5)'}</span>
            </button>

            <button
              onClick={() => setActiveView('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'table'
                  ? 'bg-white text-sky-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5 text-sky-600" />
              <span>{lang === 'pt' ? 'Lista Completa' : 'Inventory List'}</span>
            </button>

            <button
              onClick={() => setActiveView('stats')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'stats'
                  ? 'bg-white text-sky-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-sky-600" />
              <span>{lang === 'pt' ? 'Estatísticas' : 'Statistics'}</span>
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            
            {/* Quick QR Scanner Button */}
            <button
              onClick={onOpenScanner}
              title={lang === 'pt' ? "Escanear QR Code ou buscar coordenada" : "Scan QR Code or find coordinate"}
              className="h-9 inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-sky-600" />
              <span className="hidden sm:inline">{lang === 'pt' ? 'Escanear QR' : 'Scan QR'}</span>
            </button>

            {/* + Register Box Button */}
            <button
              onClick={() => onOpenRegister(null)}
              className="h-9 inline-flex items-center justify-center gap-1.5 px-3.5 rounded-lg text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow-xs hover:shadow transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{lang === 'pt' ? 'Nova Caixa' : 'New Box'}</span>
            </button>

            {/* Backup / Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                title={lang === 'pt' ? "Opções de Backup e Exportação" : "Backup & Export Options"}
              >
                <ChevronDown className="w-4 h-4" />
              </button>

              {dropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      {lang === 'pt' ? 'Backup & Exportação' : 'Backup & Export'}
                    </div>

                    <button
                      onClick={() => {
                        onExportJson();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-sky-600" />
                      <span>{lang === 'pt' ? 'Exportar Backup (JSON)' : 'Export Backup (JSON)'}</span>
                    </button>

                    <button
                      onClick={() => {
                        onExportCsv();
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{lang === 'pt' ? 'Exportar Tabela (CSV / Excel)' : 'Export Spreadsheet (CSV)'}</span>
                    </button>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-teal-600" />
                      <span>{lang === 'pt' ? 'Importar Backup (JSON)' : 'Import Backup (JSON)'}</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".json"
                      className="hidden"
                    />

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      onClick={() => {
                        if (confirm(lang === 'pt' ? 'Deseja restaurar os dados originais de demonstração do laboratório?' : 'Reset to original demo lab data?')) {
                          onResetData();
                          setDropdownOpen(false);
                        }
                      }}
                      className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                      <span>{lang === 'pt' ? 'Restaurar Dados Exemplo' : 'Reset to Demo Data'}</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
              className="h-9 inline-flex items-center justify-center gap-1 px-2.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              title={lang === 'pt' ? 'Switch to English' : 'Mudar para Português'}
            >
              <Globe2 className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-mono font-semibold">{lang === 'pt' ? 'EN' : 'PT'}</span>
            </button>

          </div>
        </div>

        {/* Mobile View Switcher Tabs */}
        <div className="lg:hidden flex items-center justify-around py-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => setActiveView('freezer')}
            className={`px-3 py-1.5 rounded-lg font-medium ${
              activeView === 'freezer' ? 'bg-sky-50 text-sky-800 font-semibold' : 'text-slate-600'
            }`}
          >
            {lang === 'pt' ? 'Freezer' : 'Freezer'}
          </button>
          <button
            onClick={() => setActiveView('drawers')}
            className={`px-3 py-1.5 rounded-lg font-medium ${
              activeView === 'drawers' ? 'bg-sky-50 text-sky-800 font-semibold' : 'text-slate-600'
            }`}
          >
            {lang === 'pt' ? 'Gavetas (4x5)' : 'Drawers'}
          </button>
          <button
            onClick={() => setActiveView('table')}
            className={`px-3 py-1.5 rounded-lg font-medium ${
              activeView === 'table' ? 'bg-sky-50 text-sky-800 font-semibold' : 'text-slate-600'
            }`}
          >
            {lang === 'pt' ? 'Inventário' : 'Inventory'}
          </button>
          <button
            onClick={() => setActiveView('stats')}
            className={`px-3 py-1.5 rounded-lg font-medium ${
              activeView === 'stats' ? 'bg-sky-50 text-sky-800 font-semibold' : 'text-slate-600'
            }`}
          >
            {lang === 'pt' ? 'Stats' : 'Stats'}
          </button>
        </div>

      </div>
    </header>
  );
}
