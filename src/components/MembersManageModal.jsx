import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Users, 
  Edit2, 
  Trash2, 
  Check, 
  Copy, 
  AlertCircle, 
  ShieldAlert,
  Database
} from 'lucide-react';

const PRESET_COLORS = [
  '#0284c7', // Sky
  '#0d9488', // Teal
  '#059669', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#6366f1', // Indigo
  '#f43f5e', // Rose
  '#64748b', // Slate
];

export default function MembersManageModal({
  lang,
  members,
  boxes,
  onClose,
  onSaveMember,
  onDeleteMember,
  onReassignBoxes,
}) {
  const [editingMember, setEditingMember] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [initials, setInitials] = useState('');
  const [color, setColor] = useState('#0284c7');

  const [copiedSql, setCopiedSql] = useState(false);
  const [showSqlGuide, setShowSqlGuide] = useState(false);

  const startAddNew = () => {
    setEditingMember(null);
    setName('');
    setRole('');
    setInitials('');
    setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    setIsAddingNew(true);
  };

  const startEdit = (m) => {
    setIsAddingNew(false);
    setEditingMember(m);
    setName(m.name);
    setRole(m.role || '');
    setInitials(m.initials || '');
    setColor(m.color || '#0284c7');
  };

  const cancelForm = () => {
    setIsAddingNew(false);
    setEditingMember(null);
    setName('');
    setRole('');
    setInitials('');
  };

  const handleNameChange = (val) => {
    setName(val);
    if (!editingMember) {
      // Auto-compute initials from name
      const parts = val.trim().split(/\s+/).filter(Boolean);
      if (parts.length === 1) {
        setInitials(parts[0].slice(0, 2).toUpperCase());
      } else if (parts.length >= 2) {
        setInitials((parts[0][0] + parts[parts.length - 1][0]).toUpperCase());
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert(lang === 'pt' ? 'Informe o nome do pesquisador.' : 'Please enter the researcher name.');
      return;
    }

    const memberId = editingMember 
      ? editingMember.id 
      : name.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-") + '-' + Date.now().toString(36).slice(-4);

    const updatedMember = {
      ...(editingMember || {}),
      id: memberId,
      name: name.trim(),
      nameEn: name.trim(),
      role: role.trim(),
      initials: (initials.trim() || name.trim().slice(0, 2)).toUpperCase(),
      color,
      avatar: editingMember?.avatar || './img/LOGO%20LAPAM.png',
      active: true,
    };

    onSaveMember(updatedMember);
    cancelForm();
  };

  const handleDelete = (member) => {
    if (member.id === 'coletivo') {
      alert(lang === 'pt' ? 'O perfil Coletivo é padrão do laboratório e não pode ser removido.' : 'Community profile is system default and cannot be deleted.');
      return;
    }

    const memberBoxes = boxes.filter(b => b.ownerId === member.id);

    if (memberBoxes.length > 0) {
      const confirmMsg = lang === 'pt'
        ? `O pesquisador "${member.name}" possui ${memberBoxes.length} caixa(s) cadastrada(s) no freezer.\n\nSe você confirmar, essas caixas serão reatribuídas automaticamente para "Coletivo / LaPAM" para evitar perda de dados no inventário.\n\nDeseja remover?`
        : `Researcher "${member.name}" has ${memberBoxes.length} box(es) in the freezer.\n\nIf confirmed, these boxes will be safely reassigned to "Community / LaPAM".\n\nDo you want to proceed?`;

      if (confirm(confirmMsg)) {
        if (onReassignBoxes) {
          onReassignBoxes(member.id, 'coletivo', 'Coletivo / LaPAM');
        }
        onDeleteMember(member.id);
      }
    } else {
      if (confirm(lang === 'pt' ? `Deseja remover "${member.name}" do laboratório?` : `Delete "${member.name}"?`)) {
        onDeleteMember(member.id);
      }
    }
  };

  const sqlCode = `-- Criar tabela de membros do laboratório no Supabase
CREATE TABLE IF NOT EXISTS public.lab_members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT,
    color TEXT DEFAULT '#0284c7',
    initials TEXT,
    avatar TEXT,
    role TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lab_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public full access to lab_members" ON public.lab_members;
CREATE POLICY "Allow public full access to lab_members"
ON public.lab_members FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.lab_members;`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print animate-fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-sky-100 text-sky-700">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base text-slate-900 leading-none">
                {lang === 'pt' ? 'Gerenciar Membros & Pesquisadores' : 'Manage Lab Members'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {lang === 'pt' ? 'Cadastre ou remova pessoas conforme o turnover do laboratório' : 'Add or remove researchers as lab members change'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto p-5 space-y-4">
          
          {/* Add New / Edit Form Banner */}
          {(isAddingNew || editingMember) ? (
            <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-sky-50/60 border border-sky-200 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-sky-900 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-sky-600" />
                  <span>{editingMember ? (lang === 'pt' ? 'Editar Pesquisador' : 'Edit Researcher') : (lang === 'pt' ? 'Novo Pesquisador' : 'New Researcher')}</span>
                </span>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer font-medium"
                >
                  {lang === 'pt' ? 'Cancelar' : 'Cancel'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    {lang === 'pt' ? 'Nome Completo / Como é conhecido *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ex: Mariana Souza, Dr. Carlos Mendes"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 focus:border-sky-500 outline-none font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {lang === 'pt' ? 'Cargo / Nível (Opcional)' : 'Role / Position (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Ex: Doutorado, Pós-Doc, IC"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 focus:border-sky-500 outline-none text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {lang === 'pt' ? 'Sigla / Iniciais' : 'Initials'}
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={initials}
                    onChange={(e) => setInitials(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 focus:border-sky-500 outline-none font-mono font-bold text-slate-900 uppercase"
                  />
                </div>
              </div>

              {/* Color Preset Palette */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">
                  {lang === 'pt' ? 'Cor da Tag / Identificação' : 'Tag Color'}
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-6 h-6 rounded-full cursor-pointer transition-transform flex items-center justify-center ${
                        color === c ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-110 opacity-90'
                      }`}
                    >
                      {color === c && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="h-8 px-3 rounded-lg text-xs font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 cursor-pointer"
                >
                  {lang === 'pt' ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-lg text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{lang === 'pt' ? 'Salvar Pesquisador' : 'Save Researcher'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                {lang === 'pt' ? `Total de pesquisadores cadastrados: ${members.length}` : `Registered researchers: ${members.length}`}
              </span>
              <button
                onClick={startAddNew}
                className="h-8 px-3 rounded-lg text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'pt' ? 'Novo Membro' : 'Add Member'}</span>
              </button>
            </div>
          )}

          {/* Members List */}
          <div className="space-y-2">
            {members.map((m) => {
              const boxCount = boxes.filter(b => b.ownerId === m.id).length;
              const isColetivo = m.id === 'coletivo';

              return (
                <div 
                  key={m.id}
                  className="p-3 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div 
                      style={{ backgroundColor: m.color || '#0284c7' }}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-mono font-bold text-xs shrink-0 shadow-2xs"
                    >
                      {m.initials || m.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {lang === 'pt' ? m.name : m.nameEn || m.name}
                        </span>
                        {isColetivo && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-100 text-sky-800">
                            {lang === 'pt' ? 'Padrão' : 'Default'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        {m.role && <span>{m.role} · </span>}
                        <span className="font-mono text-slate-600 font-medium">
                          {boxCount} {lang === 'pt' ? (boxCount === 1 ? 'caixa' : 'caixas') : (boxCount === 1 ? 'box' : 'boxes')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startEdit(m)}
                      title={lang === 'pt' ? 'Editar' : 'Edit'}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {!isColetivo && (
                      <button
                        onClick={() => handleDelete(m)}
                        title={lang === 'pt' ? 'Remover' : 'Remove'}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Automatic Cloud Sync Status Banner */}
          <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="text-[11px] leading-relaxed">
              <span className="font-bold">
                {lang === 'pt' ? 'Sincronização em Nuvem Automática: ' : 'Automatic Cloud Sync: '}
              </span>
              <span>
                {lang === 'pt' 
                  ? 'Todas as alterações são salvas automaticamente na nuvem (Supabase) e sincronizadas em tempo real em todos os computadores e celulares do laboratório. Nenhuma configuração técnica é necessária!' 
                  : 'All member changes are automatically saved to Supabase and synced in real time across all lab computers and devices. Zero setup required!'}
              </span>
            </div>
          </div>

          {/* Optional Developer Advanced SQL Info */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowSqlGuide(!showSqlGuide)}
              className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-1 cursor-pointer font-medium"
            >
              <Database className="w-3 h-3 text-slate-400" />
              <span>
                {showSqlGuide 
                  ? (lang === 'pt' ? 'Ocultar detalhes de desenvolvedor' : 'Hide developer details') 
                  : (lang === 'pt' ? 'Detalhes técnicos / Esquema de banco' : 'Technical details / DB schema')}
              </span>
            </button>

            {showSqlGuide && (
              <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs space-y-2 animate-fade-in">
                <p className="text-[10px] text-slate-500">
                  {lang === 'pt'
                    ? 'Os membros já estão sincronizando automaticamente na nuvem. Caso algum desenvolvedor queira criar uma tabela dedicada separada no Supabase, segue o comando:'
                    : 'Members already sync automatically. If a developer wishes to create a dedicated table in Supabase, here is the DDL:'}
                </p>
                <div className="relative">
                  <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-200 text-[10px] font-mono overflow-x-auto max-h-32">
                    {sqlCode}
                  </pre>
                  <button
                    type="button"
                    onClick={copySql}
                    className="absolute top-2 right-2 px-2 py-1 rounded bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSql ? (lang === 'pt' ? 'Copiado!' : 'Copied!') : (lang === 'pt' ? 'Copiar SQL' : 'Copy SQL')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="h-8.5 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {lang === 'pt' ? 'Fechar' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
}
