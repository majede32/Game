import React, { useState } from 'react';
import { motion } from 'motion/react';
import { IslandBuilding, PlayerState } from '../types/game';
import { sound } from '../services/soundEffects';
import { Wheat, Sparkles, X, Check, Clock } from 'lucide-react';

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

  const plantCrop = (crop: CropOption) => {
    if (playerState.gold < crop.goldCost) {
      alert('لا تملك ذهباً كافياً لشراء هذه البذور!');
      return;
    }

    sound.playCoin();
    const updatedBuildings = playerState.buildings.map((b) => {
      if (b.id === buildingId) {
        return {
          ...b,
          currentCrop: crop.nameAr,
          foodAccumulated: crop.foodYield,
          harvestReadyAt: Date.now() + crop.growSeconds * 1000,
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-6"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
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

        <p className="text-xs text-slate-400">
          اختر البذور المناسبة لزراعتها وحصاد الغذاء اللازم لتغذية وتطوير الوحوش في جزيرتك.
        </p>

        {/* Crops Selection */}
        <div className="flex flex-col gap-3">
          {CROPS.map((crop) => (
            <div
              key={crop.id}
              className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between gap-4 hover:border-emerald-500/50 transition-all"
            >
              <div className="flex flex-col gap-1">
                <span className="font-extrabold text-sm text-white">{crop.nameAr}</span>
                <span className="text-xs text-slate-400">{crop.descAr}</span>
                <div className="flex items-center gap-3 text-xs mt-1">
                  <span className="text-emerald-400 font-bold">إنتاج: +{crop.foodYield} طعام</span>
                  <span>·</span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {crop.growSeconds} ثانية
                  </span>
                </div>
              </div>

              <button
                onClick={() => plantCrop(crop)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md whitespace-nowrap active:scale-95 transition-all"
              >
                زراعة ({crop.goldCost} ذهب)
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
