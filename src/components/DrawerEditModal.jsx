import React, { useState } from 'react';
import { X, Check, Edit3, User, Layers } from 'lucide-react';
import { LAB_MEMBERS } from '../data/constants';

export default function DrawerEditModal({
  lang,
  drawer,
  onClose,
  onSaveDrawer,
}) {
  const [namePt, setNamePt] = useState(drawer.namePt || '');
  const [nameEn, setNameEn] = useState(drawer.nameEn || '');
  const [claimedBy, setClaimedBy] = useState(drawer.claimedBy || 'coletivo');
  const [customName, setCustomName] = useState(drawer.claimedByName || '');
  const [descriptionPt, setDescriptionPt] = useState(drawer.descriptionPt || '');
  const [descriptionEn, setDescriptionEn] = useState(drawer.descriptionEn || '');
  const [isCommunity, setIsCommunity] = useState(drawer.isCommunity ?? true);

  const handleSubmit = (e) => {
    e.preventDefault();

    let claimedByName = "Coletivo / LaPAM";
    if (claimedBy === 'custom') {
      claimedByName = customName.trim() || 'Pesquisador';
    } else {
      const found = LAB_MEMBERS.find(m => m.id === claimedBy);
      if (found) claimedByName = lang === 'pt' ? found.name : found.nameEn;
    }

    const updatedDrawer = {
      ...drawer,
      namePt: namePt.trim() || `Gaveta ${drawer.number}`,
      nameEn: nameEn.trim() || `Drawer ${drawer.number}`,
      claimedBy,
      claimedByName,
      isCommunity: claimedBy === 'coletivo',
      descriptionPt: descriptionPt.trim(),
      descriptionEn: descriptionEn.trim(),
    };

    onSaveDrawer(updatedDrawer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print animate-fade-in">
      
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-sky-600 text-white font-black text-sm flex items-center justify-center font-mono">
              G{drawer.number}
            </span>
            <div>
              <h3 className="font-bold text-base text-slate-900 leading-none">
                {lang === 'pt' ? `Configurar Gaveta ${drawer.number}` : `Configure Drawer ${drawer.number}`}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {lang === 'pt' ? 'Defina o nome, responsável e finalidade' : 'Set drawer title, owner, and purpose'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          
          {/* Drawer Title PT */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {lang === 'pt' ? 'Nome da Gaveta (Português)' : 'Drawer Title (Portuguese)'}
            </label>
            <input
              type="text"
              required
              value={namePt}
              onChange={(e) => setNamePt(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white border border-slate-300 focus:border-sky-500 outline-none font-semibold text-slate-800"
            />
          </div>

          {/* Drawer Title EN */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {lang === 'pt' ? 'Nome da Gaveta (Inglês)' : 'Drawer Title (English)'}
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm bg-white border border-slate-300 focus:border-sky-500 outline-none font-semibold text-slate-800"
            />
          </div>

          {/* Claim Drawer / Responsible */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              {lang === 'pt' ? 'Responsável / Reivindicação da Gaveta' : 'Drawer Ownership / Claim'}
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {LAB_MEMBERS.map((member) => (
                <button
                  type="button"
                  key={member.id}
                  onClick={() => setClaimedBy(member.id)}
                  className={`p-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all cursor-pointer ${
                    claimedBy === member.id
                      ? 'bg-sky-50 border-sky-500 text-sky-900 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-5 h-5 rounded-full object-cover shrink-0"
                    onError={(e) => { e.target.src = './img/LOGO%20LAPAM.png'; }}
                  />
                  <span className="truncate">{lang === 'pt' ? member.name : member.nameEn}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description PT */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {lang === 'pt' ? 'Finalidade / Descrição da Gaveta' : 'Purpose / Description'}
            </label>
            <textarea
              rows={2}
              value={descriptionPt}
              onChange={(e) => setDescriptionPt(e.target.value)}
              placeholder="Ex: Estoques de isolados clínicos e bactérias de referência."
              className="w-full p-2.5 rounded-xl text-xs bg-white border border-slate-300 focus:border-sky-500 outline-none text-slate-800 resize-none"
            />
          </div>

        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          >
            {lang === 'pt' ? 'Cancelar' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="h-9 px-5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{lang === 'pt' ? 'Salvar Configurações' : 'Save Drawer'}</span>
          </button>
        </div>

      </div>

    </div>
  );
}
