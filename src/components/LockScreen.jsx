import React, { useState } from 'react';
import { 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle,
  ShieldCheck,
  Globe2
} from 'lucide-react';
import BioCanvas from './BioCanvas';

export default function LockScreen({
  lang,
  setLang,
  onUnlock,
}) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const MASTER_PASSWORD = (import.meta.env.VITE_MASTER_PASSWORD || 'MTBC-80').trim();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    const inputClean = password.trim();

    // Check against master password (case-insensitive for user convenience)
    if (inputClean.toUpperCase() === MASTER_PASSWORD.toUpperCase()) {
      onUnlock(rememberMe);
    } else {
      setError(
        lang === 'pt' 
          ? 'Senha incorreta. Solicite a senha mestre com a equipe do LaPAM.' 
          : 'Incorrect password. Request the master password from the LaPAM team.'
      );
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4 overflow-hidden selection:bg-sky-500 selection:text-white">
      
      {/* Ambient BioCanvas Background */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <BioCanvas />
      </div>

      {/* Language Switcher Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
          className="h-8 px-2.5 rounded-lg text-xs font-mono text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
        >
          <Globe2 className="w-3.5 h-3.5 text-sky-400" />
          <span>{lang === 'pt' ? 'EN' : 'PT'}</span>
        </button>
      </div>

      {/* Lock Card Container */}
      <div 
        className={`relative z-10 w-full max-w-sm bg-slate-800/90 backdrop-blur-md rounded-3xl border border-slate-700/80 shadow-2xl p-6 sm:p-8 transition-transform ${
          isShaking ? 'animate-bounce' : ''
        }`}
      >
        {/* Lab Logo & Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-400 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center p-2">
                <img
                  src="./img/LOGO%20LAPAM.png"
                  alt="LaPAM Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-sky-500 border-2 border-slate-900 flex items-center justify-center text-white shadow-xs">
              <Lock className="w-3 h-3" />
            </span>
          </div>

          <h1 className="text-xl font-black text-white tracking-tight">
            LaPAM · Freezer -80°C
          </h1>
          <p className="text-xs text-sky-400 font-semibold mt-0.5">
            ICB - Universidade de São Paulo
          </p>
          <p className="text-[11px] text-slate-400 mt-2 max-w-[240px]">
            {lang === 'pt' 
              ? 'Acesso restrito. Digite a senha mestre do laboratório para acessar o inventário.' 
              : 'Restricted access. Enter the lab master password to access the inventory.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="text-[11px] leading-tight">{error}</span>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              {lang === 'pt' ? 'Senha do Laboratório' : 'Lab Master Password'}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4 text-sky-400" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={lang === 'pt' ? 'Digite a senha mestre...' : 'Enter master password...'}
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 outline-none text-white text-sm font-mono placeholder:text-slate-600 tracking-wider"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-sky-500 focus:ring-sky-400 bg-slate-900 border-slate-700 cursor-pointer"
              />
              <span className="text-[11px]">
                {lang === 'pt' ? 'Lembrar neste navegador' : 'Remember on this device'}
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-400 hover:to-teal-400 active:scale-[0.99] transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{lang === 'pt' ? 'Entrar no Sistema' : 'Unlock Inventory'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Security badge / Footer note */}
        <div className="mt-6 pt-4 border-t border-slate-700/60 text-center flex items-center justify-center gap-1.5 text-slate-500 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{lang === 'pt' ? 'Proteção de Amostras Biológicas' : 'Biological Samples Security'}</span>
        </div>

      </div>

    </div>
  );
}
