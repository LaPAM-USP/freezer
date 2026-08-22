import React, { useState } from 'react';
import { 
  X, 
  Cloud, 
  Check, 
  AlertCircle, 
  Database, 
  ExternalLink, 
  Radio, 
  UploadCloud, 
  Trash2,
  Lock,
  Sparkles
} from 'lucide-react';
import { 
  getSupabaseCredentials, 
  saveSupabaseCredentials, 
  isSupabaseConfigured,
  fetchRemoteFreezerData,
  batchSeedRemoteData
} from '../services/supabase';

export default function CloudConfigModal({
  lang,
  drawers,
  boxes,
  onClose,
  onReloadCloudData,
}) {
  const currentCreds = getSupabaseCredentials();
  const [url, setUrl] = useState(currentCreds.url);
  const [anonKey, setAnonKey] = useState(currentCreds.key);
  const [testing, setTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusType, setStatusType] = useState(''); // 'success' | 'error' | ''
  const isConfigured = isSupabaseConfigured();

  const handleSaveAndTest = async (e) => {
    e.preventDefault();
    setTesting(true);
    setStatusMsg('');

    try {
      if (!url.trim() || !anonKey.trim()) {
        saveSupabaseCredentials('', '');
        setStatusMsg(lang === 'pt' ? 'Configuração limpa. Operando em Modo Local.' : 'Config cleared. Operating in Local Mode.');
        setStatusType('success');
        setTesting(false);
        return;
      }

      saveSupabaseCredentials(url.trim(), anonKey.trim());
      const remoteData = await fetchRemoteFreezerData();

      setStatusMsg(lang === 'pt' 
        ? `Conexão estabelecida com sucesso! (${remoteData.boxes.length} caixas no banco).` 
        : `Connected successfully! (${remoteData.boxes.length} boxes in cloud).`
      );
      setStatusType('success');

      // Reload app data
      if (onReloadCloudData) {
        onReloadCloudData();
      }
    } catch (err) {
      console.error(err);
      setStatusMsg(lang === 'pt' 
        ? `Falha ao conectar: ${err.message || 'Verifique a URL e a Anon Key'}. Certifique-se de executar o script SQL no Supabase.` 
        : `Connection failed: ${err.message}. Make sure SQL tables are created.`
      );
      setStatusType('error');
    } finally {
      setTesting(false);
    }
  };

  const handleSeedLocalToCloud = async () => {
    if (!confirm(lang === 'pt' 
      ? 'Deseja sincronizar e enviar os dados atuais para o banco de dados do Supabase?' 
      : 'Upload current local dataset to Supabase?')) {
      return;
    }

    setTesting(true);
    try {
      await batchSeedRemoteData(drawers, boxes);
      setStatusMsg(lang === 'pt' ? 'Dados sincronizados no Supabase com sucesso!' : 'Data synced to Supabase successfully!');
      setStatusType('success');
      if (onReloadCloudData) {
        onReloadCloudData();
      }
    } catch (err) {
      console.error(err);
      setStatusMsg(lang === 'pt' ? `Erro ao enviar dados: ${err.message}` : `Error seeding data: ${err.message}`);
      setStatusType('error');
    } finally {
      setTesting(false);
    }
  };

  const handleDisconnect = () => {
    saveSupabaseCredentials('', '');
    setUrl('');
    setAnonKey('');
    setStatusMsg(lang === 'pt' ? 'Desconectado da nuvem. Operando em Modo Local (localStorage).' : 'Disconnected. Running in Local Mode.');
    setStatusType('success');
    if (onReloadCloudData) {
      onReloadCloudData();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print animate-fade-in">
      
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-sky-100 text-sky-700">
              <Cloud className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base text-slate-900 leading-none">
                {lang === 'pt' ? 'Sincronização em Nuvem (Supabase)' : 'Cloud Synchronization (Supabase)'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {lang === 'pt' ? 'Conecte o banco PostgreSQL para atualizar em tempo real em todos os dispositivos' : 'Connect PostgreSQL database for real-time multi-device sync'}
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Status Banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
            isConfigured 
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50/80 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full ${
                isConfigured ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'
              }`} />
              <div>
                <span className="font-bold text-xs block">
                  {isConfigured 
                    ? (lang === 'pt' ? 'Tempo Real Ativo (Supabase)' : 'Realtime Connected (Supabase)') 
                    : (lang === 'pt' ? 'Modo Local (localStorage)' : 'Local Storage Mode')}
                </span>
                <span className="text-[11px] opacity-80">
                  {isConfigured
                    ? (lang === 'pt' ? 'Todas as alterações são sincronizadas instantaneamente para todo o laboratório.' : 'Changes sync instantly to all lab devices.')
                    : (lang === 'pt' ? 'Dados salvos apenas neste navegador. Conecte o Supabase abaixo.' : 'Data stored only in this browser.')}
                </span>
              </div>
            </div>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSaveAndTest} className="space-y-3.5">
            
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Project URL (Supabase)
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://sua-instancia.supabase.co"
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-slate-300 focus:border-sky-500 font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Anon / Public API Key
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-slate-300 focus:border-sky-500 font-mono text-slate-800"
              />
            </div>

            {statusMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                statusType === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {statusType === 'success' ? <Check className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                <span>{statusMsg}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={testing}
                className="flex-1 h-9 px-4 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{testing ? (lang === 'pt' ? 'Conectando...' : 'Connecting...') : (lang === 'pt' ? 'Testar & Conectar' : 'Test & Connect')}</span>
              </button>

              {isConfigured && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="h-9 px-3 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                  title="Desconectar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </form>

          {/* Seed Action Button */}
          {isConfigured && (
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSeedLocalToCloud}
                disabled={testing}
                className="w-full h-9 px-3 rounded-xl text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-sky-600" />
                <span>{lang === 'pt' ? 'Enviar / Atualizar Dados Locais para o Supabase' : 'Sync Local Dataset to Supabase'}</span>
              </button>
            </div>
          )}

          {/* Quick Guide */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs space-y-1.5">
            <span className="font-bold text-slate-800 block">
              💡 {lang === 'pt' ? 'Como configurar o Supabase em 2 minutos:' : 'How to set up Supabase in 2 mins:'}
            </span>
            <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-600">
              <li>Crie uma conta gratuita em <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-sky-600 font-semibold underline">supabase.com</a> e crie um novo projeto.</li>
              <li>Acesse o <strong>SQL Editor</strong> e execute o arquivo <code className="bg-slate-200 px-1 rounded font-mono">supabase_schema.sql</code> incluído neste repositório.</li>
              <li>Copie a <strong>Project URL</strong> e a <strong>Anon Key</strong> em <em>Project Settings → API</em> e cole acima.</li>
            </ol>
          </div>

        </div>

      </div>

    </div>
  );
}
