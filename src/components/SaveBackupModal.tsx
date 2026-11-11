import React, { useState } from 'react';
import { PlayerState } from '../types/game';
import { saveGameState, loadSavedGameState } from '../data/initialGameState';
import { sound } from '../services/soundEffects';
import { Download, Upload, Copy, Check, X, ShieldCheck, AlertCircle } from 'lucide-react';

interface SaveBackupModalProps {
  playerState: PlayerState;
  onRestoreState: (state: PlayerState) => void;
  onClose: () => void;
}

export const SaveBackupModal: React.FC<SaveBackupModalProps> = ({
  playerState,
  onRestoreState,
  onClose,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [importJson, setImportJson] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const serializedSave = JSON.stringify(playerState, null, 2);

  // Copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(serializedSave);
    setCopied(true);
    sound.playCoin();
    setTimeout(() => setCopied(false), 2000);
  };

  // Download JSON file
  const handleDownload = () => {
    sound.playCoin();
    const blob = new Blob([serializedSave], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monsterr_save_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import JSON string
  const handleImport = () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!importJson.trim()) {
      setErrorMsg('يرجى لصق بيانات الحفظ أولاً!');
      return;
    }

    try {
      const parsed = JSON.parse(importJson);
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.monsters)) {
        setErrorMsg('ملف الحفظ غير صالح! تأكد من نسخ نص الحفظ بصيغة JSON صحيحة.');
        return;
      }

      sound.playSummonFanfare();
      saveGameState(parsed as PlayerState);
      onRestoreState(parsed as PlayerState);
      setSuccessMsg('تم استيراد وحفظ بيانات اللعبة بنجاح! تم تحديث جميع الوحوش والموارد.');
    } catch {
      setErrorMsg('حدث خطأ في قراءة ملف JSON! تأكد من صحة النص المنسوخ.');
    }
  };

  // Import from file input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportJson(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none" dir="rtl">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                تصدير واستيراد بيانات الحفظ (Save & Cloud Backup)
              </h3>
              <p className="text-xs text-slate-400">
                احفظ تقدمك وانقله بين الأجهزة أو احتفظ بنسخة احتياطية آمنة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback notices */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Section 1: Export */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-300">1. تصدير الحفظ الحالي:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ!' : 'نسخ النص'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition flex items-center gap-1.5 shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تحميل كملف JSON</span>
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800 font-mono">
            <span>اللاعب: {playerState.playerName}</span>
            <span>الوحوش: {playerState.monsters.length}</span>
            <span>الذهب: {playerState.gold} 💰</span>
            <span>الكؤوس: {playerState.trophies || 1080} 🏆</span>
          </div>
        </div>

        {/* Section 2: Import */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-cyan-300">2. استيراد ملف حفظ:</span>
            <label className="cursor-pointer px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" />
              <span>اختر ملف من جهازك</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <textarea
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
            placeholder="الصق نص ملف الحفظ بصيغة JSON هنا..."
            className="w-full h-24 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500 resize-none"
          />

          <button
            onClick={handleImport}
            className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs transition shadow-md flex items-center justify-center gap-1.5"
          >
            <Upload className="w-4 h-4" />
            <span>تأكيد استيراد واسترجاع الحفظ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
