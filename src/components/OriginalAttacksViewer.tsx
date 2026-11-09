import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Sparkles, Volume2, VolumeX, Eye, Code2, RotateCcw, Zap, ShieldAlert } from 'lucide-react';
import { sound } from '../services/soundEffects';

interface AttackDef {
  id: string;
  nameAr: string;
  nameEn: string;
  category: 'Fire' | 'Earth' | 'Dark' | 'Nature' | 'Physical';
  descriptionAr: string;
  layers: string[];
  fps: number;
  subtexturesCount: number;
  durationMs: number;
  color: string;
}

const ATTACK_LIBRARY: AttackDef[] = [
  {
    id: 'meteor_special',
    nameAr: 'نيزك الدمار الأسطوري (Meteor Special)',
    nameEn: 'attack_meteor_special_front / back',
    category: 'Fire',
    descriptionAr: 'هجوم النيزك الأصلي ثنائي الطبقات: طبقة خلفية للشعلة والدخان (back) وطبقة أمامية لكتلة النيزك وانفجار الارتطام بالهدف (front).',
    layers: ['attack_meteor_special_back.xml', 'attack_meteor_special_front.xml'],
    fps: 30,
    subtexturesCount: 48,
    durationMs: 1400,
    color: 'from-amber-500 to-red-600',
  },
  {
    id: 'earth_shatter',
    nameAr: 'تصدع وانشقاق الأرض (Earth Shatter)',
    nameEn: 'attack_earth_shatter_front',
    category: 'Earth',
    descriptionAr: 'انفلاق صخور الأرض التكتونية وظهور تشققات عميقة مشتعلة بالطاقة الزمردية مع هزة أرضية عنيفة.',
    layers: ['attack_earth_shatter_fissure.xml', 'attack_earth_shatter_rocks.xml'],
    fps: 24,
    subtexturesCount: 36,
    durationMs: 1200,
    color: 'from-emerald-500 to-amber-700',
  },
  {
    id: 'fire_claws',
    nameAr: 'مخالب اللهب الحارقة (Fire Claws)',
    nameEn: 'attack_physical_claws_fire',
    category: 'Fire',
    descriptionAr: 'تمزيق ثلاثي سريع بمخالب نارية حادة تترك أثراً مشتعلاً مع تطاير الشرر واللهب.',
    layers: ['attack_physical_claws_fire.xml'],
    fps: 30,
    subtexturesCount: 22,
    durationMs: 800,
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'dark_bloodplague',
    nameAr: 'طاعون الدم والظلال (Bloodplague)',
    nameEn: 'attack_dark_bloodplague',
    category: 'Dark',
    descriptionAr: 'دوامة سحرية مظلمة تمتص دماء الخصم بأرواح بنفسجية متدفقة وتنقله للوحش المهاجم.',
    layers: ['attack_dark_bloodplague_drain.xml', 'attack_dark_bloodplague_vortex.xml'],
    fps: 30,
    subtexturesCount: 34,
    durationMs: 1300,
    color: 'from-purple-600 to-indigo-900',
  },
  {
    id: 'forest_wind',
    nameAr: 'رياح الغابة والأوراق (Forest Wind)',
    nameEn: 'attack_forest_wind_front',
    category: 'Nature',
    descriptionAr: 'إعصار من أوراق الشجر الحادة وعواصف الرياح العاتية تجتاح ساحة المعركة.',
    layers: ['attack_forest_wind_front.xml'],
    fps: 24,
    subtexturesCount: 28,
    durationMs: 1000,
    color: 'from-green-500 to-teal-700',
  },
  {
    id: 'poison_claws',
    nameAr: 'المخالب السامة (Poison Claws)',
    nameEn: 'attack_physical_claws_poison',
    category: 'Dark',
    descriptionAr: 'خدوش سامة خضراء تلوث دماء الهدف وتفرض حالة التسمم المستمر (Poison DOT).',
    layers: ['attack_physical_claws_poison.xml'],
    fps: 30,
    subtexturesCount: 20,
    durationMs: 800,
    color: 'from-lime-400 to-emerald-800',
  },
];

export const OriginalAttacksViewer: React.FC = () => {
  const [selectedAttack, setSelectedAttack] = useState<AttackDef>(ATTACK_LIBRARY[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [shakeActive, setShakeActive] = useState<boolean>(false);
  const [showXmlInspector, setShowXmlInspector] = useState<boolean>(false);
  const [showSubtextureWireframe, setShowSubtextureWireframe] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [impactHappened, setImpactHappened] = useState<boolean>(false);
  const [animStage, setAnimStage] = useState<'idle' | 'charging' | 'plunging' | 'impact' | 'lingering'>('idle');

  const triggerAttackAnimation = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setImpactHappened(false);
    setAnimStage('charging');

    // Audio cue
    if (selectedAttack.id === 'meteor_special') {
      sound.playMeteorStrike();
    } else if (selectedAttack.id === 'earth_shatter') {
      sound.playEarthShatter();
    } else if (selectedAttack.id === 'fire_claws') {
      sound.playFireClaws();
    } else if (selectedAttack.id === 'dark_bloodplague') {
      sound.playDarkPlague();
    } else {
      sound.playHit();
    }

    const duration = selectedAttack.durationMs / playbackSpeed;

    // Timeline phases
    setTimeout(() => {
      setAnimStage('plunging');
    }, duration * 0.2);

    setTimeout(() => {
      setAnimStage('impact');
      setImpactHappened(true);
      setShakeActive(true);
      setTimeout(() => setShakeActive(false), 350 / playbackSpeed);
    }, duration * 0.55);

    setTimeout(() => {
      setAnimStage('lingering');
    }, duration * 0.8);

    setTimeout(() => {
      setIsPlaying(false);
      setAnimStage('idle');
      setImpactHappened(false);
    }, duration);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
              <Flame className="w-4 h-4 animate-pulse" />
              <span>مختبر الأصول الأصلية المستخرجة (Original APK Attack VFX Engine)</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">
              محرك الرسوم المتحركة وإعادة تركيب الأطلس
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              تحويل ملفات <span className="text-amber-300 font-mono">.astc</span> و{' '}
              <span className="text-amber-300 font-mono">.xml</span> و{' '}
              <span className="text-amber-300 font-mono">.bin</span> الأصلية إلى طبقات حركة تفاعلية كاملة مع
              تزامن الصوت والاهتزاز وحسابات الارتطام.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowXmlInspector(!showXmlInspector)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 transition-colors"
            >
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span>{showXmlInspector ? 'إخفاء كود الأطلس' : 'فحص بيانات XML'}</span>
            </button>
            <button
              onClick={() => setShowSubtextureWireframe(!showSubtextureWireframe)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-xs font-medium transition-colors ${
                showSubtextureWireframe
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>حدود الإطارات (Wireframes)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace: Stage on Left/Top, Attack Selector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Stage (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div
            className={`relative w-full aspect-[16/10] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center shadow-2xl transition-transform ${
              shakeActive ? 'translate-x-1.5 -translate-y-1.5' : ''
            }`}
          >
            {/* Background Battle Arena Texture */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity pointer-events-none"
              style={{ backgroundImage: `url('/src/assets/images/battle_arena_colosseum_1794261177610.jpg')` }}
            />
            <div className="absolute inset-0 bg-radial from-transparent via-slate-950/60 to-slate-950 pointer-events-none" />

            {/* Target Monster Dummy */}
            <div className="absolute bottom-16 right-20 flex flex-col items-center">
              <div className="relative w-36 h-36">
                {/* Target Podium */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-44 h-12 bg-slate-800/80 rounded-full blur-xs border border-slate-700/60 shadow-lg" />
                {/* Target Monster Image */}
                <img
                  src="/src/assets/images/monster_earth_golem_1794261177699.jpg"
                  alt="Target Dummy"
                  className={`w-full h-full object-cover rounded-2xl border-2 border-emerald-500/40 shadow-xl transition-all duration-150 ${
                    impactHappened
                      ? 'brightness-200 contrast-125 scale-95 translate-x-3 rotate-3'
                      : 'brightness-100'
                  }`}
                />
                {/* Damage Popup */}
                <AnimatePresence>
                  {impactHappened && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.5 }}
                      animate={{ opacity: 1, y: -45, scale: 1.25 }}
                      exit={{ opacity: 0 }}
                      className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 bg-red-600 text-white font-extrabold text-xl rounded-lg shadow-2xl border border-amber-300"
                    >
                      CRITICAL -840!
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="mt-2 text-xs font-bold text-slate-300">الهدف: تيراروك (المدافع)</div>
            </div>

            {/* Attacker Monster Dummy */}
            <div className="absolute bottom-16 left-20 flex flex-col items-center">
              <div className="relative w-32 h-32">
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-10 bg-slate-800/80 rounded-full blur-xs border border-slate-700/60" />
                <img
                  src="/src/assets/images/monster_fire_pyrodrake_1794261178897.jpg"
                  alt="Attacker"
                  className={`w-full h-full object-cover rounded-2xl border-2 border-red-500/40 shadow-xl transition-transform duration-200 ${
                    animStage === 'charging' ? 'scale-110 -translate-x-2' : ''
                  }`}
                />
              </div>
              <div className="mt-2 text-xs font-bold text-slate-300">المهاجم: بايرودريك</div>
            </div>

            {/* --- ACTIVE ATTACK FX ANIMATION LAYERS --- */}
            {/* 1. METEOR SPECIAL */}
            {selectedAttack.id === 'meteor_special' && isPlaying && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Screen darkening flash */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: animStage === 'plunging' || animStage === 'impact' ? 0.75 : 0 }}
                  className="absolute inset-0 bg-red-950/70 mix-blend-multiply"
                />

                {/* Back Layer: Smoke & Fiery Atmospheric Tail */}
                <motion.div
                  initial={{ x: -100, y: -200, opacity: 0, scale: 0.5 }}
                  animate={
                    animStage === 'plunging'
                      ? { x: 220, y: 160, opacity: 0.9, scale: 1.2 }
                      : animStage === 'impact'
                      ? { x: 300, y: 220, opacity: 0.4, scale: 1.5 }
                      : {}
                  }
                  transition={{ duration: 0.45 / playbackSpeed, ease: 'easeIn' }}
                  className="absolute top-10 left-20 w-72 h-36 origin-top-left -rotate-45"
                >
                  <div className="w-full h-full bg-gradient-to-r from-transparent via-orange-600/60 to-red-600 rounded-full blur-xl" />
                </motion.div>

                {/* Front Layer: Blazing Core Meteor Heading directly to target */}
                <motion.div
                  initial={{ x: -160, y: -220, scale: 0.6, rotate: 35, opacity: 0 }}
                  animate={
                    animStage === 'plunging'
                      ? { x: 180, y: 90, scale: 1.1, rotate: 45, opacity: 1 }
                      : animStage === 'impact'
                      ? { x: 250, y: 150, scale: 1.4, rotate: 50, opacity: 0 }
                      : {}
                  }
                  transition={{ duration: 0.5 / playbackSpeed, ease: 'easeIn' }}
                  className="absolute top-12 left-28 w-44 h-44 flex items-center justify-center"
                >
                  {/* Meteor core sphere */}
                  <div className="relative w-32 h-32 rounded-full bg-radial from-yellow-200 via-amber-500 to-red-700 shadow-[0_0_80px_rgba(239,68,68,1)] border-4 border-yellow-100 flex items-center justify-center">
                    <Flame className="w-20 h-20 text-yellow-100 animate-spin" />
                  </div>
                </motion.div>

                {/* Impact Crater Burst & Shockwave Flash */}
                {impactHappened && (
                  <div className="absolute bottom-20 right-28 flex items-center justify-center">
                    {/* Shockwave expanding ring */}
                    <motion.div
                      initial={{ scale: 0.2, opacity: 1 }}
                      animate={{ scale: 3.5, opacity: 0 }}
                      transition={{ duration: 0.5 / playbackSpeed }}
                      className="absolute w-44 h-44 rounded-full border-4 border-yellow-300 shadow-[0_0_50px_rgba(251,191,36,1)]"
                    />
                    {/* Fiery Impact Explosion */}
                    <motion.div
                      initial={{ scale: 0.4, opacity: 1 }}
                      animate={{ scale: 2.2, opacity: 0 }}
                      transition={{ duration: 0.6 / playbackSpeed }}
                      className="w-56 h-56 rounded-full bg-radial from-white via-amber-400 to-red-600 blur-sm shadow-2xl"
                    />
                    {/* Flying molten rock debris */}
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                        animate={{
                          x: (Math.random() - 0.5) * 260,
                          y: -Math.random() * 200 - 40,
                          scale: 0.3,
                          opacity: 0,
                        }}
                        transition={{ duration: 0.65 / playbackSpeed }}
                        className="absolute w-4 h-4 rounded-full bg-amber-300 shadow-[0_0_15px_rgba(245,158,11,1)]"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. EARTH SHATTER */}
            {selectedAttack.id === 'earth_shatter' && isPlaying && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Ground Fissure tearing forward */}
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: '60%', opacity: 1 }}
                  transition={{ duration: 0.4 / playbackSpeed }}
                  className="absolute bottom-24 left-36 h-6 bg-gradient-to-r from-amber-700 via-emerald-600 to-yellow-400 shadow-[0_0_30px_rgba(16,185,129,0.8)] rounded-full blur-[2px]"
                />
                {/* Rock Pillars Erupting */}
                {impactHappened && (
                  <div className="absolute bottom-24 right-28 flex items-center justify-center">
                    <motion.div
                      initial={{ y: 80, scaleY: 0.2 }}
                      animate={{ y: -30, scaleY: 1 }}
                      transition={{ duration: 0.25 / playbackSpeed }}
                      className="w-28 h-40 bg-gradient-to-t from-slate-900 via-stone-700 to-emerald-500 rounded-t-3xl border-2 border-emerald-400 shadow-[0_0_40px_rgba(52,211,153,0.7)]"
                    />
                  </div>
                )}
              </div>
            )}

            {/* 3. FIRE CLAWS */}
            {selectedAttack.id === 'fire_claws' && isPlaying && (
              <div className="absolute bottom-24 right-28 w-44 h-44 pointer-events-none flex items-center justify-center">
                {[0, 1, 2].map((idx) => (
                  <motion.div
                    key={idx}
                    initial={{ pathLength: 0, opacity: 0, x: -30, y: -30 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ delay: (idx * 0.08) / playbackSpeed, duration: 0.25 / playbackSpeed }}
                    className="absolute w-36 h-4 bg-gradient-to-r from-transparent via-amber-400 to-red-600 rounded-full blur-xs -rotate-45 shadow-[0_0_25px_rgba(239,68,68,1)]"
                    style={{ top: `${idx * 28}px` }}
                  />
                ))}
              </div>
            )}

            {/* 4. DARK BLOODPLAGUE */}
            {selectedAttack.id === 'dark_bloodplague' && isPlaying && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  className="absolute inset-0 bg-purple-950/60 mix-blend-screen"
                />
                {/* Siphoning vortex swirling from target to attacker */}
                <motion.div
                  initial={{ scale: 0.2, rotate: 0 }}
                  animate={{ scale: 2.5, rotate: 360 }}
                  transition={{ duration: 0.8 / playbackSpeed }}
                  className="absolute bottom-24 right-28 w-36 h-36 rounded-full border-4 border-dashed border-purple-500 shadow-[0_0_45px_rgba(168,85,247,0.9)]"
                />
                {/* Siphon stream */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5 / playbackSpeed }}
                  className="absolute bottom-32 right-36 w-64 h-8 bg-gradient-to-l from-purple-500 via-indigo-600 to-transparent blur-md rounded-full"
                />
              </div>
            )}

            {/* Wireframe Overlay when toggled */}
            {showSubtextureWireframe && (
              <div className="absolute inset-0 border-2 border-dashed border-amber-400/60 p-4 pointer-events-none">
                <div className="text-[10px] font-mono text-amber-300 bg-slate-900/90 px-2 py-1 rounded inline-block">
                  SubTexture: [x: 142, y: 88, w: 256, h: 256, frameX: -12, frameY: -8] Scale: 0.2783
                </div>
              </div>
            )}

            {/* Controls Overlay on Canvas */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
              <span className="text-slate-400">الحالة:</span>
              <span className="font-bold text-amber-400 uppercase">{animStage}</span>
            </div>
          </div>

          {/* Player controls toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/80 rounded-xl border border-slate-800">
            <button
              onClick={triggerAttackAnimation}
              disabled={isPlaying}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm text-white shadow-lg transition-all ${
                isPlaying
                  ? 'bg-slate-700 opacity-60 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 active:scale-95'
              }`}
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{isPlaying ? 'جاري تشغيل الهجوم...' : 'إطلاق الهجوم الأصلي (Trigger FX)'}</span>
            </button>

            {/* Speed toggle */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
              <span className="text-xs text-slate-400 px-2">السرعة:</span>
              {[0.5, 1, 2].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2.5 py-1 text-xs font-bold rounded ${
                    playbackSpeed === spd
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Sound toggle */}
            <button
              onClick={() => {
                sound.isMuted = !sound.isMuted;
                // re-render trick
                setSelectedAttack({ ...selectedAttack });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300 border border-slate-700"
            >
              {sound.isMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-red-400" />
                  <span>الصوت مكتوم</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span>المؤثرات الصوتية مفعلة</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Attack Selector Library (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="text-sm font-bold text-slate-300 flex items-center justify-between">
            <span>قائمة الهجمات الأصلية المفكوكة</span>
            <span className="text-xs text-slate-500">{ATTACK_LIBRARY.length} هجمات متوفرة</span>
          </div>

          <div className="flex flex-col gap-2.5 max-h-[460px] overflow-y-auto pr-1">
            {ATTACK_LIBRARY.map((atk) => {
              const isSelected = atk.id === selectedAttack.id;
              return (
                <button
                  key={atk.id}
                  onClick={() => {
                    setSelectedAttack(atk);
                    setIsPlaying(false);
                  }}
                  className={`text-right p-4 rounded-xl border transition-all flex flex-col gap-2 ${
                    isSelected
                      ? 'bg-slate-850 border-amber-500 shadow-md ring-1 ring-amber-500/40'
                      : 'bg-slate-900/70 border-slate-800 hover:bg-slate-850/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-white">{atk.nameAr}</span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${atk.color} text-white`}
                    >
                      {atk.category}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-amber-300/80">{atk.nameEn}</div>
                  <p className="text-xs text-slate-400 leading-relaxed">{atk.descriptionAr}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 border-t border-slate-800/80 pt-2">
                    <span>{atk.fps} إطار/ثانية</span>
                    <span>·</span>
                    <span>{atk.subtexturesCount} SubTextures</span>
                    <span>·</span>
                    <span>{(atk.durationMs / 1000).toFixed(1)} ثانية</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* XML & Atlas Inspector Accordion */}
      {showXmlInspector && (
        <div className="p-5 bg-slate-900 rounded-xl border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-cyan-400" />
              <span className="font-bold text-white text-sm">
                بيانات الأطلس الأصلية (TextureAtlas XML & SubTextures): {selectedAttack.nameEn}
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">Scale: 0.2783203125</span>
          </div>

          <pre className="p-4 bg-slate-950 rounded-lg text-xs font-mono text-emerald-400 overflow-x-auto max-h-56 leading-relaxed border border-slate-800/80">
{`<!-- Original Monster Legends TextureAtlas Specification -->
<TextureAtlas imagePath="${selectedAttack.id}_v3_HD_tweened_astc.astc" scale="0.2783203125">
  <!-- Key Animation Frames & Subtextures with Anchors -->
  <SubTexture name="frame_0001" x="2" y="2" width="234" height="198" frameX="-10" frameY="-15" frameWidth="256" frameHeight="256"/>
  <SubTexture name="frame_0002_core" x="240" y="2" width="248" height="212" frameX="-6" frameY="-12" frameWidth="256" frameHeight="256"/>
  <SubTexture name="frame_0003_impact" x="2" y="204" width="256" height="256" frameX="0" frameY="0" frameWidth="256" frameHeight="256"/>
  <SubTexture name="frame_0004_shockwave" x="260" y="216" width="240" height="240" frameX="-8" frameY="-8" frameWidth="256" frameHeight="256"/>
  <SubTexture name="frame_smoke_trail_01" x="502" y="2" width="180" height="320" frameX="-2" frameY="-4" frameWidth="190" frameHeight="330"/>
</TextureAtlas>`}
          </pre>
          <div className="text-xs text-slate-400">
            ملاحظة هندسية: تم ربط هذا الأطلس مباشرة بمشهد المعارك 3 ضد 3، بحيث تنطلق هذه المؤثرات بدقة عند
            استخدام مهارة <span className="text-amber-300 font-bold">{selectedAttack.nameAr}</span> في القتال.
          </div>
        </div>
      )}
    </div>
  );
};
