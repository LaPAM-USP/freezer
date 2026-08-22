import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Plus, 
  Box as BoxIcon, 
  Calendar, 
  User, 
  Tag, 
  ShieldAlert, 
  ShieldCheck, 
  QrCode,
  Sparkles,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
import { getSpotId, getShortCoordinate, formatCoordinate } from '../utils/coordinates';
import { LAB_MEMBERS, CATEGORIES, BIOSAFETY_LEVELS, BOX_GRID_TYPES } from '../data/constants';

export default function BoxFormModal({
  lang,
  initialSpot, // { drawer, row, col } or null
  existingBox, // box object if editing, null if creating
  boxes,
  drawers,
  onClose,
  onSaveBox,
}) {
  // Form State
  const [drawer, setDrawer] = useState(existingBox ? existingBox.drawer : (initialSpot?.drawer || 1));
  const [row, setRow] = useState(existingBox ? existingBox.row : (initialSpot?.row || 1));
  const [col, setCol] = useState(existingBox ? existingBox.col : (initialSpot?.col || 1));
  
  const [title, setTitle] = useState(existingBox?.title || '');
  const [ownerId, setOwnerId] = useState(existingBox?.ownerId || 'coletivo');
  const [customOwnerName, setCustomOwnerName] = useState('');
  const [category, setCategory] = useState(existingBox?.category || 'stocks');
  const [biosafety, setBiosafety] = useState(existingBox?.biosafety || 'nb3');
  const [gridType, setGridType] = useState(existingBox?.gridType || '9x9');
  const [totalCapacity, setTotalCapacity] = useState(existingBox?.totalCapacity || 81);
  const [occupiedCount, setOccupiedCount] = useState(existingBox?.occupiedCount || 1);
  const [date, setDate] = useState(existingBox?.date || new Date().toISOString().slice(0, 10));
  const [expiryDate, setExpiryDate] = useState(existingBox?.expiryDate || '');
  const [description, setDescription] = useState(existingBox?.description || '');
  const [notes, setNotes] = useState(existingBox?.notes || '');
  const [tagsInput, setTagsInput] = useState(existingBox?.tags ? existingBox.tags.join(', ') : '');

  // Quick title suggestions
  const titleSuggestions = [
    "M. tuberculosis H37Rv (Glicerolado)",
    "Extração DNA Genômico (gDNA)",
    "Isolados Clínicos MDR-TB",
    "M. bovis BCG Moreau",
    "Primers & Sondas BrSeqTB",
    "Mastermix & Enzimas Coletivo",
    "Células THP-1 Criopreservadas",
  ];

  // Update total capacity when gridType changes
  const handleGridTypeChange = (gtId) => {
    setGridType(gtId);
    const found = BOX_GRID_TYPES.find(g => g.id === gtId);
    if (found && found.total > 0) {
      setTotalCapacity(found.total);
      if (occupiedCount > found.total) {
        setOccupiedCount(found.total);
      }
    }
  };

  // Spot calculation
  const currentSpotId = getSpotId(drawer, row, col);
  const shortCoord = getShortCoordinate(drawer, row, col, lang);
  const spotTakenByOther = boxes.find(b => b.spotId === currentSpotId && b.id !== existingBox?.id);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert(lang === 'pt' ? 'Por favor informe um título para a caixa.' : 'Please enter a box title.');
      return;
    }

    if (spotTakenByOther) {
      alert(lang === 'pt' 
        ? `A vaga ${shortCoord} já está ocupada por "${spotTakenByOther.title}". Por favor selecione outra vaga.` 
        : `Spot ${shortCoord} is already occupied by "${spotTakenByOther.title}". Please choose another spot.`
      );
      return;
    }

    // Resolve owner name
    let ownerName = "Coletivo / LaPAM";
    if (ownerId === 'custom') {
      ownerName = customOwnerName.trim() || 'Pesquisador';
    } else {
      const found = LAB_MEMBERS.find(m => m.id === ownerId);
      if (found) ownerName = lang === 'pt' ? found.name : found.nameEn;
    }

    // Parse tags
    const tags = tagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(t => t.length > 0);

    const newBoxData = {
      id: existingBox ? existingBox.id : `box-${drawer}-${row}-${col}-${Date.now().toString(36)}`,
      spotId: currentSpotId,
      drawer: parseInt(drawer, 10),
      row: parseInt(row, 10),
      col: parseInt(col, 10),
      title: title.trim(),
      ownerId,
      ownerName,
      category,
      biosafety,
      gridType,
      totalCapacity: parseInt(totalCapacity, 10) || 81,
      occupiedCount: parseInt(occupiedCount, 10) || 0,
      date,
      expiryDate,
      status: 'active',
      temperature: '-80°C',
      description: description.trim(),
      notes: notes.trim(),
      tags,
    };

    onSaveBox(newBoxData);

    // Confetti effect on new creation!
    if (!existingBox) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (err) {}
    }

    onClose();
  };

  const previewQrValue = `${window.location.origin}${window.location.pathname}?spot=${currentSpotId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print animate-fade-in">
      
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-sky-100 text-sky-700">
              <BoxIcon className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base text-slate-900 leading-none">
                {existingBox 
                  ? (lang === 'pt' ? 'Editar Caixa / Amostra' : 'Edit Box / Sample')
                  : (lang === 'pt' ? 'Cadastrar Nova Caixa no Freezer' : 'Register New Box in Freezer')
                }
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {lang === 'pt' ? 'Preencha as informações e gere a etiqueta com QR Code' : 'Enter details and generate QR code tag'}
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
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Location & Coordinates */}
          <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-sky-600" />
                <span>{lang === 'pt' ? 'Coordenadas Físicas no Freezer' : 'Physical Freezer Coordinates'}</span>
              </span>

              <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-sky-600 text-white shadow-2xs">
                {shortCoord}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Drawer */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  {lang === 'pt' ? 'Gaveta' : 'Drawer'}
                </label>
                <select
                  value={drawer}
                  onChange={(e) => setDrawer(parseInt(e.target.value, 10))}
                  className="w-full h-9 px-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value={1}>Gaveta 1 (Topo)</option>
                  <option value={2}>Gaveta 2</option>
                  <option value={3}>Gaveta 3</option>
                  <option value={4}>Gaveta 4 (Base)</option>
                </select>
              </div>

              {/* Row */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  {lang === 'pt' ? 'Linha' : 'Row'}
                </label>
                <select
                  value={row}
                  onChange={(e) => setRow(parseInt(e.target.value, 10))}
                  className="w-full h-9 px-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value={1}>{lang === 'pt' ? 'Linha 1 (L1 - Frente / Porta)' : 'Row 1 (R1 - Front / Door)'}</option>
                  <option value={2}>{lang === 'pt' ? 'Linha 2 (L2)' : 'Row 2 (R2)'}</option>
                  <option value={3}>{lang === 'pt' ? 'Linha 3 (L3)' : 'Row 3 (R3)'}</option>
                  <option value={4}>{lang === 'pt' ? 'Linha 4 (L4 - Fundo)' : 'Row 4 (R4 - Back / Deep)'}</option>
                </select>
              </div>

              {/* Column */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  {lang === 'pt' ? 'Coluna' : 'Column'}
                </label>
                <select
                  value={col}
                  onChange={(e) => setCol(parseInt(e.target.value, 10))}
                  className="w-full h-9 px-2.5 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value={1}>Coluna 1 (C1)</option>
                  <option value={2}>Coluna 2 (C2)</option>
                  <option value={3}>Coluna 3 (C3)</option>
                  <option value={4}>Coluna 4 (C4)</option>
                  <option value={5}>Coluna 5 (C5)</option>
                </select>
              </div>
            </div>

            {spotTakenByOther && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <span className="font-bold">{lang === 'pt' ? 'Atenção:' : 'Warning:'}</span>
                <span>{lang === 'pt' ? `Esta vaga já está ocupada por "${spotTakenByOther.title}".` : `This spot is already occupied by "${spotTakenByOther.title}".`}</span>
              </div>
            )}
          </div>

          {/* Section 2: Box Title & Quick suggestions */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              {lang === 'pt' ? 'Identificação / Nome da Caixa *' : 'Box Title / Identification *'}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={lang === 'pt' ? "Ex: M. tuberculosis H37Rv stocks 2024 / DNA Isolados SP" : "Ex: M. tuberculosis H37Rv stocks 2024"}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all font-semibold text-slate-900"
            />

            {/* Suggestions Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-medium py-0.5">{lang === 'pt' ? 'Sugestões rápidas:' : 'Quick ideas:'}</span>
              {titleSuggestions.map((sug, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setTitle(sug)}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 hover:bg-sky-100 text-slate-600 hover:text-sky-800 transition-colors cursor-pointer"
                >
                  + {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Owner / Responsible Person */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              {lang === 'pt' ? 'Responsável pela Caixa' : 'Owner / Responsible Person'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LAB_MEMBERS.map((member) => (
                <button
                  type="button"
                  key={member.id}
                  onClick={() => {
                    setOwnerId(member.id);
                  }}
                  className={`p-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all cursor-pointer ${
                    ownerId === member.id
                      ? 'bg-sky-50 border-sky-500 text-sky-900 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200"
                    onError={(e) => { e.target.src = './img/LOGO%20LAPAM.png'; }}
                  />
                  <span className="truncate text-left">{lang === 'pt' ? member.name.split(' ')[0] : member.nameEn.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Category & Biosafety */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Category */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                {lang === 'pt' ? 'Tipo de Material / Categoria' : 'Sample Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {lang === 'pt' ? cat.namePt : cat.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Biosafety */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                {lang === 'pt' ? 'Nível de Biossegurança' : 'Biosafety Level'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setBiosafety('nb3')}
                  className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex flex-col items-center justify-center ${
                    biosafety === 'nb3'
                      ? 'bg-red-50 text-red-800 border-red-500 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-600 mb-0.5" />
                  <span>NB-3 (BSL-3)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBiosafety('nb2')}
                  className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex flex-col items-center justify-center ${
                    biosafety === 'nb2'
                      ? 'bg-amber-50 text-amber-800 border-amber-500 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 mb-0.5" />
                  <span>NB-2 (BSL-2)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBiosafety('general')}
                  className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex flex-col items-center justify-center ${
                    biosafety === 'general'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-500 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600 mb-0.5" />
                  <span>Geral / NB-1</span>
                </button>
              </div>
            </div>

          </div>

          {/* Section 5: Capacity & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Grid Format */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {lang === 'pt' ? 'Formato da Caixa' : 'Box Grid Type'}
              </label>
              <select
                value={gridType}
                onChange={(e) => handleGridTypeChange(e.target.value)}
                className="w-full h-9 px-3 rounded-xl text-xs bg-white border border-slate-300 font-semibold text-slate-800"
              >
                {BOX_GRID_TYPES.map((g) => (
                  <option key={g.id} value={g.id}>{g.label}</option>
                ))}
              </select>
            </div>

            {/* Occupied Tubes */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {lang === 'pt' ? 'Tubos Ocupados / Total' : 'Occupied Vials / Total'}
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max={totalCapacity}
                  value={occupiedCount}
                  onChange={(e) => setOccupiedCount(parseInt(e.target.value, 10) || 0)}
                  className="w-20 h-9 px-2 rounded-xl text-xs font-mono font-bold bg-white border border-slate-300 text-center"
                />
                <span className="text-xs text-slate-500 font-mono">/ {totalCapacity}</span>
              </div>
            </div>

            {/* Registration Date */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {lang === 'pt' ? 'Data de Cadastro' : 'Date Stored'}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-9 px-3 rounded-xl text-xs bg-white border border-slate-300 font-mono text-slate-800"
              />
            </div>

          </div>

          {/* Section 6: Description & Notes */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {lang === 'pt' ? 'Descrição Detalhada da Amostra / Cepa' : 'Detailed Sample / Strain Description'}
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={lang === 'pt' ? "Ex: M. tuberculosis H37Rv em meio 7H9 + 15% glicerol. Passagem 2. Utilizar EPI NB-3." : "Sample protocol, concentration, strain description..."}
                className="w-full p-3 rounded-xl text-xs bg-white border border-slate-300 focus:border-sky-500 outline-none text-slate-800 resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {lang === 'pt' ? 'Tags (separadas por vírgula)' : 'Tags (comma-separated)'}
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="H37Rv, BrSeqTB, WGS, NB-3, Glicerol"
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-slate-300 focus:border-sky-500 outline-none text-slate-800"
              />
            </div>
          </div>

        </form>

        {/* Modal Bottom Actions */}
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
            <span>{existingBox ? (lang === 'pt' ? 'Salvar Alterações' : 'Save Changes') : (lang === 'pt' ? 'Cadastrar Caixa' : 'Register Box')}</span>
          </button>
        </div>

      </div>

    </div>
  );
}
