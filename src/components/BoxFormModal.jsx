import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Box as BoxIcon, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  ShieldCheck, 
  Shield
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getSpotId, getShortCoordinate } from '../utils/coordinates';
import { LAB_MEMBERS, CATEGORIES, BOX_GRID_TYPES } from '../data/constants';

export default function BoxFormModal({
  lang,
  initialSpot, // { drawer, row, col } or null
  existingBox, // box object if editing, null if creating
  boxes,
  drawers,
  members = LAB_MEMBERS,
  onOpenMembers,
  onClose,
  onSaveBox,
}) {
  const membersList = members && members.length > 0 ? members : LAB_MEMBERS;

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
  const [description, setDescription] = useState(existingBox?.description || '');
  const [tagsInput, setTagsInput] = useState(existingBox?.tags ? existingBox.tags.join(', ') : '');

  // Toggle for optional fields (auto-opened if editing a box that has description or tags)
  const [showAdvanced, setShowAdvanced] = useState(Boolean(existingBox?.description || existingBox?.tags?.length));

  // Update capacity when gridType changes
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
      alert(lang === 'pt' ? 'Por favor informe o título ou nome da caixa.' : 'Please enter a box title.');
      return;
    }

    if (spotTakenByOther) {
      alert(lang === 'pt' 
        ? `A vaga ${shortCoord} já está ocupada por "${spotTakenByOther.title}". Escolha outra vaga.` 
        : `Spot ${shortCoord} is already occupied by "${spotTakenByOther.title}". Please choose another spot.`
      );
      return;
    }

    // Resolve owner name
    let ownerName = "Coletivo / LaPAM";
    if (ownerId === 'custom') {
      ownerName = customOwnerName.trim() || (lang === 'pt' ? 'Pesquisador' : 'Researcher');
    } else {
      const found = membersList.find(m => m.id === ownerId);
      if (found) ownerName = lang === 'pt' ? found.name : (found.nameEn || found.name);
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
      expiryDate: existingBox?.expiryDate || '',
      status: 'active',
      temperature: '-80°C',
      description: description.trim(),
      notes: existingBox?.notes || '',
      tags,
    };

    onSaveBox(newBoxData);

    if (!existingBox) {
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.6 }
        });
      } catch (err) {}
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print animate-fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
              <BoxIcon className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-none">
                {existingBox 
                  ? (lang === 'pt' ? 'Editar Caixa' : 'Edit Box')
                  : (lang === 'pt' ? 'Cadastrar Caixa' : 'Register Box')
                }
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                {shortCoord} ({currentSpotId})
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 text-xs">
          
          {/* 1. Box Title */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              {lang === 'pt' ? 'Nome / Identificação da Caixa *' : 'Box Title / Identification *'}
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={lang === 'pt' ? "Ex: M. tuberculosis H37Rv stocks / DNA Isolados SP" : "Ex: M. tuberculosis H37Rv stocks"}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-slate-900 font-semibold"
            />
          </div>

          {/* 2. Physical Location (Inline 3 Columns) */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[11px] text-slate-600 uppercase tracking-wide">
                {lang === 'pt' ? 'Posição Física no Freezer' : 'Freezer Physical Position'}
              </span>
              <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-sky-600 text-white">
                {shortCoord}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">{lang === 'pt' ? 'Gaveta' : 'Drawer'}</label>
                <select
                  value={drawer}
                  onChange={(e) => setDrawer(parseInt(e.target.value, 10))}
                  className="w-full h-8 px-2 rounded-lg bg-white border border-slate-300 font-semibold text-slate-800 cursor-pointer"
                >
                  <option value={1}>Gaveta 1</option>
                  <option value={2}>Gaveta 2</option>
                  <option value={3}>Gaveta 3</option>
                  <option value={4}>Gaveta 4</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">{lang === 'pt' ? 'Linha' : 'Row'}</label>
                <select
                  value={row}
                  onChange={(e) => setRow(parseInt(e.target.value, 10))}
                  className="w-full h-8 px-2 rounded-lg bg-white border border-slate-300 font-semibold text-slate-800 cursor-pointer"
                >
                  <option value={1}>L1 (Frente)</option>
                  <option value={2}>L2</option>
                  <option value={3}>L3</option>
                  <option value={4}>L4 (Fundo)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">{lang === 'pt' ? 'Coluna' : 'Column'}</label>
                <select
                  value={col}
                  onChange={(e) => setCol(parseInt(e.target.value, 10))}
                  className="w-full h-8 px-2 rounded-lg bg-white border border-slate-300 font-semibold text-slate-800 cursor-pointer"
                >
                  <option value={1}>C1</option>
                  <option value={2}>C2</option>
                  <option value={3}>C3</option>
                  <option value={4}>C4</option>
                  <option value={5}>C5</option>
                </select>
              </div>
            </div>

            {spotTakenByOther && (
              <p className="mt-2 text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                ⚠️ {lang === 'pt' ? `Ocupada por "${spotTakenByOther.title}"` : `Occupied by "${spotTakenByOther.title}"`}
              </p>
            )}
          </div>

          {/* 3. Owner & Category (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 block">
                  {lang === 'pt' ? 'Responsável' : 'Owner'}
                </label>
                {onOpenMembers && (
                  <button
                    type="button"
                    onClick={onOpenMembers}
                    className="text-[10px] font-semibold text-sky-600 hover:text-sky-800 underline cursor-pointer"
                  >
                    {lang === 'pt' ? '+ Gerenciar' : '+ Manage'}
                  </button>
                )}
              </div>
              <select
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                className="w-full h-9 px-2.5 rounded-xl bg-white border border-slate-300 font-medium text-slate-800 cursor-pointer"
              >
                {membersList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {lang === 'pt' ? m.name : (m.nameEn || m.name)}
                  </option>
                ))}
                <option value="custom">{lang === 'pt' ? 'Outro / Pesquisador Externo' : 'Other / External'}</option>
              </select>

              {ownerId === 'custom' && (
                <input
                  type="text"
                  value={customOwnerName}
                  onChange={(e) => setCustomOwnerName(e.target.value)}
                  placeholder={lang === 'pt' ? 'Nome do responsável' : 'Owner name'}
                  className="mt-1.5 w-full h-8 px-2.5 rounded-lg bg-white border border-slate-300 text-xs"
                />
              )}
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {lang === 'pt' ? 'Categoria do Material' : 'Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-9 px-2.5 rounded-xl bg-white border border-slate-300 font-medium text-slate-800 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {lang === 'pt' ? cat.namePt : cat.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Biosafety & Capacity (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {lang === 'pt' ? 'Biossegurança' : 'Biosafety'}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setBiosafety('nb3')}
                  className={`h-9 rounded-lg font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    biosafety === 'nb3'
                      ? 'bg-red-50 text-red-700 border-red-500 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                  <span>NB-3</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBiosafety('nb2')}
                  className={`h-9 rounded-lg font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    biosafety === 'nb2'
                      ? 'bg-amber-50 text-amber-700 border-amber-500 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>NB-2</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBiosafety('general')}
                  className={`h-9 rounded-lg font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    biosafety === 'general'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-500 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Geral</span>
                </button>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {lang === 'pt' ? 'Ocupação / Formato' : 'Occupied / Format'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max={totalCapacity}
                  value={occupiedCount}
                  onChange={(e) => setOccupiedCount(parseInt(e.target.value, 10) || 0)}
                  className="w-16 h-9 px-2 rounded-xl text-center font-mono font-bold bg-white border border-slate-300"
                />
                <span className="text-slate-400 font-mono">/</span>
                <select
                  value={gridType}
                  onChange={(e) => handleGridTypeChange(e.target.value)}
                  className="flex-1 h-9 px-2 rounded-xl bg-white border border-slate-300 font-medium text-slate-800 cursor-pointer"
                >
                  {BOX_GRID_TYPES.map((g) => (
                    <option key={g.id} value={g.id}>{g.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 5. Optional Advanced Details Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[11px] font-semibold text-sky-700 hover:text-sky-800 flex items-center gap-1 cursor-pointer py-1"
            >
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>
                {showAdvanced 
                  ? (lang === 'pt' ? 'Ocultar detalhes opcionais' : 'Hide optional details')
                  : (lang === 'pt' ? '+ Adicionar mais detalhes (Data, Descrição, Tags)' : '+ Add more details (Date, Description, Tags)')
                }
              </span>
            </button>

            {showAdvanced && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 animate-fade-in">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-0.5">
                    {lang === 'pt' ? 'Data de Cadastro' : 'Registration Date'}
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-lg bg-white border border-slate-300 font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-0.5">
                    {lang === 'pt' ? 'Descrição / Observações' : 'Description / Notes'}
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={lang === 'pt' ? "Ex: Amostras tratadas com DNase I, concentração..." : "Sample description, concentration, notes..."}
                    className="w-full p-2 rounded-lg bg-white border border-slate-300 outline-none text-slate-800 resize-none text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-0.5">
                    {lang === 'pt' ? 'Tags (separadas por vírgula)' : 'Tags (comma-separated)'}
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="WGS, H37Rv, Glicerol, etc."
                    className="w-full h-8 px-2.5 rounded-lg bg-white border border-slate-300 outline-none text-slate-800 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

        </form>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="h-8.5 px-3.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 transition-colors cursor-pointer"
          >
            {lang === 'pt' ? 'Cancelar' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="h-8.5 px-4 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{existingBox ? (lang === 'pt' ? 'Salvar Alterações' : 'Save Changes') : (lang === 'pt' ? 'Cadastrar Caixa' : 'Register Box')}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
