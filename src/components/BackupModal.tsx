import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PlayerState } from '../types/game';
import { sound } from '../services/soundEffects';
import { Save, Download, Upload, RotateCcw, X, Check, Copy } from 'lucide-react';
import { resetGameState } from '../data/initialGameState';

interface BackupModalProps {
  playerState: PlayerState;
  onRestoreState: (state: PlayerState) => void;
  onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  playerState,
  onRestoreState,
  onClose,
}) => {
  const [importText, setImportText] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const exportData = JSON.stringify(playerState, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(exportData);
    sound.playCoin();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    sound.playCoin();
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monsterr_save_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      if (!importText.trim()) {
        setErrorMsg('الرجاء لصق نص الحفظ في الخانة أولاً.');
        return;
      }
      const parsed = JSON.parse(importText);
      if (!parsed || !Array.isArray(parsed.monsters) || !Array.isArray(parsed.buildings)) {
        setErrorMsg('ملف الحفظ غير صالح أو تالف. تأكد من صحة البيانات.');
        return;
      }
      sound.playVictory();
      onRestoreState(parsed);
      setSuccessMsg('تم استرجاع تقدمك بنجاح!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch {
      setErrorMsg('حدث خطأ في قراءة ملف JSON. تأكد من نسخ النص بالكامل.');
    }
  };

  const handleReset = () => {
    if (confirm('هل أنت متأكد من رغبتك في إعادة ضبط اللعبة بالكامل إلى البداية؟')) {
      const fresh = resetGameState();
      onRestoreState(fresh);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-right"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Save className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-black text-white">إدارة الحفظ والنسخ الاحتياطي</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/60 border border-red-500/40 text-red-300 text-xs rounded-xl font-bold">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl font-bold">
            {successMsg}
          </div>
        )}

        {/* Section 1: Export Current Progress */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-200">تصدير وحفظ التقدم الحالي</span>
            <span className="text-[11px] text-amber-400 font-bold">
              {playerState.monsters.length} وحوش · المستوى {playerState.level}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            يمكنك تحميل ملف الحفظ أو نسخ الكود النصي للاحتفاظ بنسخة احتياطية خارج المتصفح.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleDownload}
              className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>تحميل ملف (Save File .json)</span>
            </button>
            <button
              onClick={handleCopy}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-700"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'تم النسخ!' : 'نسخ النص'}</span>
            </button>
          </div>
        </div>

        {/* Section 2: Import Backup */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2.5">
          <span className="text-xs font-black text-slate-200">استرجاع تقدم سابق (Import)</span>
          <p className="text-[11px] text-slate-400">
            الصق بيانات الحفظ بتنسيق JSON لاستعادة جزيرتك ووحوشك:
          </p>
          <textarea
            value={importText}
            onChange={(e) => {
              setImportText(e.target.value);
              setErrorMsg('');
            }}
            placeholder='الصق نص الحفظ هنا (مثال: {"playerName": "..."})'
            className="w-full h-20 p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-[11px] font-mono text-slate-300 focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={handleImport}
            className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>استيراد واسترجاع التقدم الآن</span>
          </button>
        </div>

        {/* Section 3: Reset */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={handleReset}
            className="text-[11px] text-red-400 hover:text-red-300 font-bold flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة ضبط اللعبة للبداية</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-slate-400 hover:text-white"
          >
            إغلاق
          </button>
        </div>
      </motion.div>
    </div>
  );
};
