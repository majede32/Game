import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { IslandBuilding, PlayerState } from '../types/game';
import { sound } from '../services/soundEffects';
import { Wheat, Sparkles, X, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

interface FarmModalProps {
  buildingId: string;
  playerState: PlayerState;
  onClose: () => void;
  onUpdateState: (updated: PlayerState) => void;
}

interface CropOption {
  id: string;
  nameAr: string;
  goldCost: number;
  foodYield: number;
  growSeconds: number;
  descAr: string;
}

const CROPS: CropOption[] = [
  {
    id: 'crop_berry',
    nameAr: 'توت أزرق سريع (Blue Berries)',
    goldCost: 80,
    foodYield: 150,
    growSeconds: 15,
    descAr: 'محصول سريع النمو يوفر وجبات سريعة للوحوش الصغيرة.',
  },
  {
    id: 'crop_pepper',
    nameAr: 'فلفل التنين البركاني (Dragon Pepper)',
    goldCost: 250,
    foodYield: 500,
    growSeconds: 45,
    descAr: 'ثمار حارة ملتهبة تفضلها وحوش النار وتمنح كمية كبيرة من الغذاء.',
  },
  {
    id: 'crop_root',
    nameAr: 'جذور الصخور الكريستالية (Magma Root)',
    goldCost: 600,
    foodYield: 1400,
    growSeconds: 120,
    descAr: 'محصول فائق المغذيات يغذي الوحوش الكبيرة ويرفع مستواها بسرعة.',
  },
];

export const FarmModal: React.FC<FarmModalProps> = ({
  buildingId,
  playerState,
  onClose,
  onUpdateState,
}) => {
  const farm = playerState.buildings.find((b) => b.id === buildingId);
  const [now, setNow] = useState<number>(Date.now());

  // Live timer tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const harvestReadyAt = farm?.harvestReadyAt || 0;
  const isGrowing = harvestReadyAt > now;
  const hasUncollectedFood = (farm?.foodAccumulated || 0) > 0;
  const isReadyToHarvest = !isGrowing && hasUncollectedFood;
  const isFarmEmpty = !isGrowing && !hasUncollectedFood;

  const secondsRemaining = Math.max(0, Math.ceil((harvestReadyAt - now) / 1000));
  const totalDuration = farm?.growthDurationSeconds || 30;
  const growthPercent = isGrowing
    ? Math.min(100, Math.round(((totalDuration - secondsRemaining) / totalDuration) * 100))
    : 100;

  const harvestCrop = () => {
    if (!farm || !isReadyToHarvest) return;

    const yieldAmount = farm.foodAccumulated || 150;
    sound.playCoin();

    const updatedBuildings = playerState.buildings.map((b) => {
      if (b.id === buildingId) {
        return {
          ...b,
          currentCrop: undefined,
          foodAccumulated: 0,
          harvestReadyAt: undefined,
          plantedAt: undefined,
          growthDurationSeconds: undefined,
          cropYield: undefined,
        };
      }
      return b;
    });

    onUpdateState({
      ...playerState,
      food: playerState.food + yieldAmount,
      xp: playerState.xp + 45,
      buildings: updatedBuildings,
    });
  };

  const plantCrop = (crop: CropOption) => {
    if (isGrowing) {
      alert('لا يمكنك الزراعة الآن! يوجد محصول قيد النمو في هذه المزرعة.');
      return;
    }

    if (hasUncollectedFood) {
      alert('يجب حصاد المحصول الجاهز أولاً قبل زراعة محصول جديد!');
      return;
    }

    if (playerState.gold < crop.goldCost) {
      alert('لا تملك ذهباً كافياً لشراء هذه البذور!');
      return;
    }

    sound.playCoin();
    const readyTimestamp = Date.now() + crop.growSeconds * 1000;

    const updatedBuildings = playerState.buildings.map((b) => {
      if (b.id === buildingId) {
        return {
          ...b,
          currentCrop: crop.nameAr,
          foodAccumulated: crop.foodYield,
          plantedAt: Date.now(),
          growthDurationSeconds: crop.growSeconds,
          harvestReadyAt: readyTimestamp,
          cropYield: crop.foodYield,
        };
      }
      return b;
    });

    const updatedState: PlayerState = {
      ...playerState,
      gold: playerState.gold - crop.goldCost,
      buildings: updatedBuildings,
    };

    onUpdateState(updatedState);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-5"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Wheat className="w-6 h-6 text-emerald-400" />
            <h3 className="text-xl font-extrabold text-white">
              {farm?.nameAr || 'مزرعة محاصيل الوحوش'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Farm Status Card */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-400">حالة المزرعة الحالية:</span>
            {isGrowing ? (
              <span className="text-amber-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>قيد النمو (متبقي {secondsRemaining} ثانية)</span>
              </span>
            ) : isReadyToHarvest ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>جاهز للحصاد فوراً!</span>
              </span>
            ) : (
              <span className="text-slate-400">فارغة وجاهزة للزراعة</span>
            )}
          </div>

          {isGrowing && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                <span>المحصول: {farm?.currentCrop}</span>
                <span className="text-emerald-400 font-mono">+{farm?.foodAccumulated} طعام</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${growthPercent}%` }}
                />
              </div>
            </div>
          )}

          {isReadyToHarvest && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="text-xs text-emerald-300 font-bold">
                اكتمل نمو {farm?.currentCrop}! انقر لحصاد المحصول وإضافته لمخزن الغذاء.
              </div>
              <button
                onClick={harvestCrop}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 whitespace-nowrap"
              >
                حصاد (+{farm?.foodAccumulated} طعام)
              </button>
            </div>
          )}
        </div>

        {/* Warning if crop in progress */}
        {isGrowing && (
          <div className="flex items-center gap-2 p-3 bg-amber-950/60 border border-amber-800/80 rounded-xl text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>لا يمكن زراعة بذور جديدة حتى ينتهي نمو المحصول الحالي ويتم حصاده بالكامل.</span>
          </div>
        )}

        {/* Crops Selection */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-bold text-slate-400">
            {isFarmEmpty ? 'اختر البذور المناسبة للزراعة:' : 'قائمة البذور المتاحة للمزرعة:'}
          </span>
          <div className="flex flex-col gap-2.5">
            {CROPS.map((crop) => {
              const canAfford = playerState.gold >= crop.goldCost;
              const canPlantThis = isFarmEmpty && canAfford;

              return (
                <div
                  key={crop.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                    canPlantThis
                      ? 'bg-slate-950/80 border-slate-800 hover:border-emerald-500/50'
                      : 'bg-slate-950/40 border-slate-850 opacity-60'
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-extrabold text-sm text-white">{crop.nameAr}</span>
                    <span className="text-xs text-slate-400">{crop.descAr}</span>
                    <div className="flex items-center gap-3 text-xs mt-0.5">
                      <span className="text-emerald-400 font-bold">إنتاج: +{crop.foodYield} طعام</span>
                      <span>·</span>
                      <span className="text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        {crop.growSeconds} ثانية
                      </span>
                    </div>
                  </div>

                  <button
                    disabled={!canPlantThis}
                    onClick={() => plantCrop(crop)}
                    className={`px-4 py-2 font-extrabold text-xs rounded-xl shadow-md whitespace-nowrap transition-all ${
                      canPlantThis
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95 cursor-pointer'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {!canAfford
                      ? 'ذهب غير كافٍ'
                      : !isFarmEmpty
                      ? 'المزرعة مشغولة'
                      : `زراعة (${crop.goldCost} ذهب)`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
