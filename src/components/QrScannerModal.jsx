import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  QrCode, 
  Search, 
  Camera, 
  ArrowRight, 
  AlertCircle,
  Layers,
  Sparkles
} from 'lucide-react';
import { parseSpotId, getShortCoordinate } from '../utils/coordinates';

export default function QrScannerModal({
  lang,
  boxes,
  onClose,
  onFoundBox,
  onRegisterEmptySpot,
}) {
  const [manualInput, setManualInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Parse input (can be URL, spotId like D1-R2-C3, or G1-L2-C3)
  const handleSearch = (inputVal) => {
    setErrorMsg('');
    const val = (inputVal || manualInput).trim();
    if (!val) return;

    let targetSpotId = null;

    // Check if it's a URL with ?spot=D1-R2-C3
    if (val.includes('spot=')) {
      const match = val.match(/spot=([A-Za-z0-9-]+)/);
      if (match) {
        targetSpotId = match[1].toUpperCase();
      }
    } else if (/^D\d+-R\d+-C\d+$/i.test(val)) {
      targetSpotId = val.toUpperCase();
    } else if (/^G(\d+)-?L(\d+)-?C(\d+)$/i.test(val)) {
      // Localized G1-L2-C3 -> D1-R2-C3
      const m = val.match(/^G(\d+)-?L(\d+)-?C(\d+)$/i);
      if (m) {
        targetSpotId = `D${m[1]}-R${m[2]}-C${m[3]}`;
      }
    }

    if (!targetSpotId) {
      // Try searching by box title substring or tag
      const matchedBox = boxes.find(b => 
        b.title.toLowerCase().includes(val.toLowerCase()) ||
        b.spotId.toLowerCase() === val.toLowerCase()
      );

      if (matchedBox) {
        stopCamera();
        onFoundBox(matchedBox);
        onClose();
        return;
      }

      setErrorMsg(lang === 'pt' ? 'Coordenada ou caixa não encontrada. Tente no formato "D1-R2-C3" ou "G1-L2-C3".' : 'Coordinate or box not found. Try "D1-R2-C3".');
      return;
    }

    // Spot identified! Look for registered box
    const foundBox = boxes.find(b => b.spotId.toUpperCase() === targetSpotId);
    stopCamera();

    if (foundBox) {
      onFoundBox(foundBox);
      onClose();
    } else {
      // It's an empty spot! Offer to register
      const parsed = parseSpotId(targetSpotId);
      if (parsed && parsed.drawer >= 1 && parsed.drawer <= 4 && parsed.row >= 1 && parsed.row <= 4 && parsed.col >= 1 && parsed.col <= 5) {
        onRegisterEmptySpot(parsed.drawer, parsed.row, parsed.col);
        onClose();
      } else {
        setErrorMsg(lang === 'pt' ? 'Coordenada fora do limite do freezer (1-4 gavetas, 4 linhas, 5 colunas).' : 'Coordinate out of bounds.');
      }
    }
  };

  const startCamera = async () => {
    setErrorMsg('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMsg(lang === 'pt' ? 'Câmera não suportada neste navegador.' : 'Camera not supported.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.error(err);
      setErrorMsg(lang === 'pt' ? 'Não foi possível acessar a câmera. Verifique as permissões do navegador.' : 'Could not access camera. Check browser permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print animate-fade-in">
      
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-sky-100 text-sky-700">
              <QrCode className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base text-slate-900 leading-none">
                {lang === 'pt' ? 'Escanear QR Code ou Buscar Coordenada' : 'Scan QR Code or Jump to Coordinate'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {lang === 'pt' ? 'Localize instantaneamente qualquer caixa no freezer' : 'Locate any box instantly in the freezer'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Option 1: Direct Coordinate / Link Jump */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              {lang === 'pt' ? 'Digite a coordenada ou cole o link do QR Code:' : 'Enter coordinate or paste QR code link:'}
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Ex: D1-R2-C3 ou G1-L2-C3 ou nome da amostra"
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-300 focus:bg-white focus:border-sky-500 outline-none font-mono"
                  autoFocus
                />
              </div>

              <button
                type="button"
                onClick={() => handleSearch()}
                className="h-9 px-4 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>{lang === 'pt' ? 'Buscar' : 'Go'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-600 flex items-center gap-1 pt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 my-2">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {lang === 'pt' ? 'OU' : 'OR'}
            </span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          {/* Option 2: Live Camera Scanner */}
          <div className="space-y-3">
            {!cameraActive ? (
              <button
                type="button"
                onClick={startCamera}
                className="w-full py-4 rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/50 hover:bg-sky-50 text-sky-800 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                  <Camera className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold block">
                    {lang === 'pt' ? 'Ativar Câmera para Escanear QR' : 'Enable Camera to Scan QR'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {lang === 'pt' ? 'Aponte para a etiqueta colada na caixa' : 'Point to the label on the box'}
                  </span>
                </div>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-4/3 flex items-center justify-center border border-slate-700 shadow-inner">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                  />
                  {/* Scanner reticle overlay */}
                  <div className="absolute inset-8 border-2 border-sky-400/80 rounded-2xl pointer-events-none animate-pulse">
                    <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-sky-400" />
                    <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-sky-400" />
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-sky-400" />
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-sky-400" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {lang === 'pt' ? 'Posicione o QR Code dentro do quadrado' : 'Align the QR Code within the square'}
                  </span>
                  <button
                    onClick={stopCamera}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                  >
                    {lang === 'pt' ? 'Desativar Câmera' : 'Turn Off Camera'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {lang === 'pt' ? 'Acessos Rápidos:' : 'Quick Shortcuts:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {['D1-R1-C1', 'D2-R1-C1', 'D3-R1-C1', 'D4-R1-C1'].map((coord) => (
                <button
                  key={coord}
                  onClick={() => handleSearch(coord)}
                  className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-800 transition-colors cursor-pointer"
                >
                  {coord}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
