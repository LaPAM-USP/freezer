import React from 'react';
import { ExternalLink, Snowflake, Layers } from 'lucide-react';

export default function Footer({ lang }) {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 text-slate-500 text-xs no-print mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          
          {/* Col 1: About LaPAM */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <img
                src="./img/LOGO%20LAPAM.png"
                alt="LaPAM Logo"
                className="h-8 w-auto object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span className="font-bold text-slate-900 text-sm">
                LaPAM
              </span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              {lang === 'pt' 
                ? 'Laboratório de Pesquisa Aplicada a Micobactérias' 
                : 'Laboratory of Applied Research in Mycobacteria'}
            </p>
            <p className="text-slate-400 text-[11px]">
              {lang === 'pt' ? 'Edifício Biomédicas II (ICB II) - USP' : 'Biomedical Sciences Bldg II (ICB II) - USP'}
            </p>
          </div>

          {/* Col 2: Freezer Specifications */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 text-xs flex items-center gap-1">
              <Snowflake className="w-3.5 h-3.5 text-sky-600" />
              <span>{lang === 'pt' ? 'Especificações do Equipamento' : 'Equipment Specifications'}</span>
            </h4>
            <ul className="space-y-1.5 text-slate-600 text-[11px]">
              <li>Freezer Ultra-Low -80.0°C</li>
              <li>{lang === 'pt' ? '4 Gavetas Modulares' : '4 Modular Drawers'}</li>
              <li>{lang === 'pt' ? 'Matriz 4x5 (20 caixas / gaveta)' : '4x5 Matrix (20 boxes / drawer)'}</li>
              <li>{lang === 'pt' ? 'Capacidade Total: 80 caixas' : 'Total Capacity: 80 boxes'}</li>
            </ul>
          </div>

          {/* Col 3: Institutional Links */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 text-xs">
              {lang === 'pt' ? 'Links & Portais' : 'Links & Portals'}
            </h4>
            <ul className="space-y-1.5 text-slate-600 text-[11px]">
              <li>
                <a
                  href="https://lapam-usp.github.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-sky-700 transition-colors inline-flex items-center gap-1 font-semibold text-sky-800"
                >
                  <span>{lang === 'pt' ? 'Portal Principal LaPAM' : 'Main LaPAM Portal'}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/LaPAM-USP/BrSeqTB"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-900 transition-colors inline-flex items-center gap-1"
                >
                  <span>BrSeqTB Pipeline</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://ww3.icb.usp.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-900 transition-colors inline-flex items-center gap-1"
                >
                  <span>ICB II - USP</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/LaPAM-USP"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-900 transition-colors inline-flex items-center gap-1"
                >
                  <span>GitHub: LaPAM-USP</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Biosafety Containment notice */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 text-xs">
              {lang === 'pt' ? 'Aviso de Biossegurança' : 'Biosafety Notice'}
            </h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              {lang === 'pt'
                ? 'A manipulação de estoques de micobactérias virulentas (NB-3 / BSL-3) deve ser realizada exclusivamente dentro das instalações de contenção certificadas com EPI apropriado.'
                : 'Handling virulent mycobacteria stocks (BSL-3) must be performed exclusively within certified containment facilities with proper PPE.'}
            </p>
          </div>

        </div>

        {/* Bottom Banner */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} LaPAM - Laboratório de Pesquisa Aplicada a Micobactérias • ICB II - USP.
          </div>

          <div className="flex items-center gap-2">
            <span>Developed by</span>
            <a
              href="https://falatfernando.github.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-2 py-1 rounded-md bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-2xs group"
              title="Falat Labs (falatfernando.github.io)"
            >
              <img
                src="./img/falat_labs_trimmed.webp"
                alt="Falat Labs"
                className="h-6 sm:h-7 w-auto object-contain invert mix-blend-multiply transition-transform group-hover:scale-105"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
