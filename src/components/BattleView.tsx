import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BattleMonster,
  BattleStage,
  ElementType,
  Monster,
  MonsterSkill,
  PlayerState,
} from '../types/game';
import {
  CAMPAIGN_STAGES,
  ELEMENT_ADVANTAGES,
  ELEMENT_COLORS,
  ELEMENT_DISADVANTAGES,
  createMonsterInstance,
} from '../data/monstersData';
import { sound } from '../services/soundEffects';
import {
  Swords,
  Shield,
  Zap,
  RotateCcw,
  Sparkles,
  Trophy,
  Skull,
  Flame,
  FastForward,
  Play,
  ArrowRight,
} from 'lucide-react';
import { MonsterBattleSprite } from './MonsterBattleSprite';
import { BattleArena3D } from './BattleArena3D';

interface BattleViewProps {
  playerState: PlayerState;
  onBattleEnd: (updatedPlayerState: PlayerState, victory: boolean) => void;
  onReturnToIsland: () => void;
}

interface FloatingText {
  id: string;
  targetMonsterId: string;
  text: string;
  color: string;
  isCrit?: boolean;
}

export const BattleView: React.FC<BattleViewProps> = ({
  playerState,
  onBattleEnd,
  onReturnToIsland,
}) => {
  const [selectedStage, setSelectedStage] = useState<BattleStage>(CAMPAIGN_STAGES[0]);
  const [inActiveBattle, setInActiveBattle] = useState<boolean>(false);
  const [playerMonsters, setPlayerMonsters] = useState<BattleMonster[]>([]);
  const [enemyMonsters, setEnemyMonsters] = useState<BattleMonster[]>([]);
  const [activeTurnMonsterId, setActiveTurnMonsterId] = useState<string>('');
  const [selectedSkill, setSelectedSkill] = useState<MonsterSkill | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [autoBattle, setAutoBattle] = useState<boolean>(false);
  const [battleSpeed, setBattleSpeed] = useState<number>(1);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [attackingMonsterId, setAttackingMonsterId] = useState<string | null>(null);
  const [hitMonsterId, setHitMonsterId] = useState<string | null>(null);
  const [activeVfx, setActiveVfx] = useState<{
    key: string;
    targetId: string;
    attackerId: string;
  } | null>(null);
  const [screenShake, setScreenShake] = useState<boolean>(false);
  const [battleResult, setBattleResult] = useState<'victory' | 'defeat' | null>(null);
  const [battleMode, setBattleMode] = useState<'3d' | '2d'>('3d');

  // Initialize a match for the selected stage
  const startStageBattle = (stage: BattleStage) => {
    setSelectedStage(stage);

    // Pick top 3 player monsters
    const chosenPlayerMonsters = playerState.monsters.slice(0, 3);
    const pCombat: BattleMonster[] = chosenPlayerMonsters.map((m, idx) => ({
      monster: JSON.parse(JSON.stringify(m)),
      isAi: false,
      position: idx,
      currentHp: m.maxHp,
      currentStamina: m.maxStamina,
      skillCooldowns: {},
      statusEffects: [],
      isDefeated: false,
    }));

    // Generate enemy team
    const eCombat: BattleMonster[] = stage.enemies.map((enemySpec, idx) => {
      const instance = createMonsterInstance(enemySpec.speciesId, enemySpec.level);
      return {
        monster: instance,
        isAi: true,
        position: idx,
        currentHp: instance.maxHp,
        currentStamina: instance.maxStamina,
        skillCooldowns: {},
        statusEffects: [],
        isDefeated: false,
      };
    });

    setPlayerMonsters(pCombat);
    setEnemyMonsters(eCombat);
    setInActiveBattle(true);
    setBattleResult(null);
    setBattleLog([`بدأت معركة ${stage.nameAr}! جهّز وحوشك للقتال.`]);

    // Choose first to move by highest speed
    const all = [...pCombat, ...eCombat];
    all.sort((a, b) => b.monster.speed - a.monster.speed);
    const first = all[0];
    setActiveTurnMonsterId(first.monster.id);

    // Default select first skill of the first monster if player
    if (!first.isAi) {
      setSelectedSkill(first.monster.skills[0] || null);
      // Auto select first alive enemy
      setSelectedTargetId(eCombat[0].monster.id);
    }
  };

  const addFloatingText = (
    targetMonsterId: string,
    text: string,
    color: string = 'text-amber-400',
    isCrit: boolean = false
  ) => {
    const id = `ft_${Date.now()}_${Math.random()}`;
    setFloatingTexts((prev) => [...prev, { id, targetMonsterId, text, color, isCrit }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id));
    }, 1200 / battleSpeed);
  };

  // Turn execution with 100% Immutable State Updates
  const executeSkill = (
    attacker: BattleMonster,
    skill: MonsterSkill,
    target: BattleMonster | null
  ) => {
    if (!attacker || attacker.isDefeated) return;

    // Check stamina
    if (attacker.currentStamina < skill.staminaCost) {
      addFloatingText(attacker.monster.id, 'طاقة غير كافية!', 'text-amber-300');
      rechargeMonster(attacker);
      return;
    }

    // Play attack sound & vfx
    setActiveVfx({
      key: skill.animationKey,
      targetId: target ? target.monster.id : attacker.monster.id,
      attackerId: attacker.monster.id,
    });

    setAttackingMonsterId(attacker.monster.id);
    if (target) {
      setTimeout(() => {
        setHitMonsterId(target.monster.id);
      }, 200 / battleSpeed);
    }
    setTimeout(() => {
      setAttackingMonsterId(null);
      setHitMonsterId(null);
    }, 550 / battleSpeed);

    if (skill.animationKey === 'attack_meteor_special') {
      sound.playMeteorStrike();
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 500 / battleSpeed);
    } else if (skill.animationKey === 'attack_earth_shatter') {
      sound.playEarthShatter();
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 400 / battleSpeed);
    } else if (skill.animationKey === 'attack_physical_claws_fire') {
      sound.playFireClaws();
    } else if (skill.animationKey === 'attack_dark_bloodplague') {
      sound.playDarkPlague();
    } else if (skill.animationKey === 'attack_thunder_strike') {
      sound.playThunder();
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 350 / battleSpeed);
    } else if (skill.animationKey === 'attack_nature_vines') {
      sound.playVineWhip();
    } else if (skill.animationKey === 'attack_heal_bloom') {
      sound.playHeal();
    } else {
      sound.playHit();
    }

    // Log action
    setBattleLog((prev) => [
      `${attacker.monster.nameAr} استخدم [${skill.nameAr}]!`,
      ...prev.slice(0, 8),
    ]);

    // Compute updated attacker state immutably
    const newAttackerStamina = Math.max(0, attacker.currentStamina - skill.staminaCost);
    const newAttackerCooldowns = {
      ...attacker.skillCooldowns,
      ...(skill.cooldown > 0 ? { [skill.id]: skill.cooldown } : {}),
    };

    // Handle Healing
    if (skill.effectType === 'heal') {
      const healAmount = Math.round(
        (skill.effectValue || 200) * (1 + attacker.monster.attack * 0.005)
      );

      const updateHealTeam = (team: BattleMonster[]) =>
        team.map((bm) => {
          if (bm.monster.id === attacker.monster.id) {
            const healedHp = Math.min(bm.monster.maxHp, bm.currentHp + healAmount);
            addFloatingText(bm.monster.id, `+${healAmount} شفاء`, 'text-emerald-400');
            return {
              ...bm,
              currentHp: healedHp,
              currentStamina: newAttackerStamina,
              skillCooldowns: newAttackerCooldowns,
            };
          }
          if (!bm.isDefeated) {
            const healedHp = Math.min(bm.monster.maxHp, bm.currentHp + healAmount);
            addFloatingText(bm.monster.id, `+${healAmount} شفاء`, 'text-emerald-400');
            return { ...bm, currentHp: healedHp };
          }
          return bm;
        });

      if (attacker.isAi) {
        setEnemyMonsters(updateHealTeam);
      } else {
        setPlayerMonsters(updateHealTeam);
      }

      setTimeout(() => {
        setActiveVfx(null);
        advanceTurn();
      }, 600 / battleSpeed);
      return;
    }

    // Handle Shield/Buff
    if (skill.effectType === 'shield') {
      addFloatingText(attacker.monster.id, `درع منيع!`, 'text-blue-300');

      const updateShieldTeam = (team: BattleMonster[]): BattleMonster[] =>
        team.map((bm) =>
          bm.monster.id === attacker.monster.id
            ? {
                ...bm,
                currentStamina: newAttackerStamina,
                skillCooldowns: newAttackerCooldowns,
                statusEffects: [
                  ...bm.statusEffects.filter((ef) => ef.type !== 'shield'),
                  { type: 'shield' as const, duration: 2, value: skill.effectValue || 220 },
                ],
              }
            : bm
        );

      if (attacker.isAi) {
        setEnemyMonsters(updateShieldTeam);
      } else {
        setPlayerMonsters(updateShieldTeam);
      }

      setTimeout(() => {
        setActiveVfx(null);
        advanceTurn();
      }, 600 / battleSpeed);
      return;
    }

    // Determine target monster IDs to damage
    const opposingTeam = attacker.isAi ? playerMonsters : enemyMonsters;
    let targetIdsToDamage: string[] = [];

    if (skill.target === 'all_enemies') {
      targetIdsToDamage = opposingTeam.filter((m) => !m.isDefeated).map((m) => m.monster.id);
    } else if (target && !target.isDefeated) {
      targetIdsToDamage = [target.monster.id];
    } else {
      const aliveOpponents = opposingTeam.filter((m) => !m.isDefeated);
      if (aliveOpponents.length > 0) {
        targetIdsToDamage = [aliveOpponents[0].monster.id];
      }
    }

    // Calculate damage & effects per target
    let totalDrainHp = 0;
    const targetDamageMap: Record<
      string,
      {
        finalDamage: number;
        isCrit: boolean;
        isDefeated: boolean;
        newEffects: BattleMonster['statusEffects'];
      }
    > = {};

    targetIdsToDamage.forEach((targetId) => {
      const t = opposingTeam.find((m) => m.monster.id === targetId);
      if (!t) return;

      // Element advantage formula
      let multiplier = 1.0;
      let isStrong = false;
      let isWeak = false;

      if (ELEMENT_ADVANTAGES[skill.element]?.includes(t.monster.element)) {
        multiplier = 1.4;
        isStrong = true;
      } else if (ELEMENT_DISADVANTAGES[skill.element]?.includes(t.monster.element)) {
        multiplier = 0.75;
        isWeak = true;
      }

      // Balanced Defense mitigation: Diminishing returns scaling formula
      const defenseFactor = 100 / (100 + t.monster.defense * 0.35);
      const baseDamage = attacker.monster.attack * (skill.power / 65) * 1.25;
      const isCrit = Math.random() < 0.15;
      const critMultiplier = isCrit ? 1.35 : 1.0;
      const variance = 0.95 + Math.random() * 0.1;
      let finalDamage = Math.max(
        18,
        Math.round(baseDamage * defenseFactor * multiplier * critMultiplier * variance)
      );

      // Check Shield absorption on target
      let updatedEffects: BattleMonster['statusEffects'] = [...t.statusEffects];
      const shieldIndex = updatedEffects.findIndex((ef) => ef.type === 'shield');
      if (shieldIndex !== -1) {
        const shieldVal = updatedEffects[shieldIndex].value;
        if (shieldVal >= finalDamage) {
          updatedEffects[shieldIndex] = {
            ...updatedEffects[shieldIndex],
            value: shieldVal - finalDamage,
          };
          addFloatingText(t.monster.id, `امتص الدرع ${finalDamage}!`, 'text-blue-300');
          finalDamage = 0;
        } else {
          finalDamage -= shieldVal;
          updatedEffects = updatedEffects.filter((_, idx) => idx !== shieldIndex);
          addFloatingText(t.monster.id, 'انكسر الدرع!', 'text-blue-400');
        }
      }

      const newHp = Math.max(0, t.currentHp - finalDamage);
      const isDefeated = newHp <= 0;

      if (finalDamage > 0) {
        const label = isCrit
          ? `-${finalDamage} قاضية!`
          : isStrong
          ? `-${finalDamage} فتاك!`
          : isWeak
          ? `-${finalDamage} ضعيف`
          : `-${finalDamage}`;

        addFloatingText(
          t.monster.id,
          label,
          isCrit ? 'text-yellow-300 font-extrabold' : 'text-red-400 font-bold',
          isCrit
        );
      }

      if (isDefeated) {
        setBattleLog((prev) => [
          `سقط ${t.monster.nameAr} في المعركة!`,
          ...prev.slice(0, 8),
        ]);
      }

      // Additional status effects
      if (skill.effectType === 'burn' && Math.random() < 0.75) {
        updatedEffects.push({ type: 'burn' as const, duration: 2, value: 40 });
        addFloatingText(t.monster.id, 'حرق مستمر!', 'text-orange-400');
      } else if (skill.effectType === 'stun' && Math.random() < 0.45) {
        updatedEffects.push({ type: 'stun' as const, duration: 1, value: 1 });
        addFloatingText(t.monster.id, 'شلل وتجميد!', 'text-yellow-400');
      } else if (skill.effectType === 'drain') {
        const drainHp = Math.round(finalDamage * 0.4);
        totalDrainHp += drainHp;
      }

      targetDamageMap[targetId] = {
        finalDamage,
        isCrit,
        isDefeated,
        newEffects: updatedEffects,
      };
    });

    if (totalDrainHp > 0) {
      addFloatingText(attacker.monster.id, `+${totalDrainHp} امتصاص`, 'text-purple-400');
    }

    // Immutably apply updates to attacker team
    const updateAttackerTeam = (team: BattleMonster[]) =>
      team.map((bm) => {
        if (bm.monster.id === attacker.monster.id) {
          const drainedHp = Math.min(bm.monster.maxHp, bm.currentHp + totalDrainHp);
          return {
            ...bm,
            currentHp: drainedHp,
            currentStamina: newAttackerStamina,
            skillCooldowns: newAttackerCooldowns,
          };
        }
        return bm;
      });

    // Immutably apply updates to damaged opponent team
    const updateOpponentTeam = (team: BattleMonster[]) =>
      team.map((bm) => {
        const damageInfo = targetDamageMap[bm.monster.id];
        if (damageInfo) {
          const newHp = Math.max(0, bm.currentHp - damageInfo.finalDamage);
          return {
            ...bm,
            currentHp: newHp,
            isDefeated: newHp <= 0,
            statusEffects: damageInfo.newEffects,
          };
        }
        return bm;
      });

    if (attacker.isAi) {
      setEnemyMonsters(updateAttackerTeam);
      setPlayerMonsters(updateOpponentTeam);
    } else {
      setPlayerMonsters(updateAttackerTeam);
      setEnemyMonsters(updateOpponentTeam);
    }

    setTimeout(() => {
      setActiveVfx(null);
      advanceTurn();
    }, 600 / battleSpeed);
  };

  // Recharging stamina with immutable updates
  const rechargeMonster = (monsterCombat: BattleMonster) => {
    const updateRecharge = (team: BattleMonster[]) =>
      team.map((bm) =>
        bm.monster.id === monsterCombat.monster.id
          ? {
              ...bm,
              currentStamina: Math.min(
                bm.monster.maxStamina,
                bm.currentStamina + 45
              ),
            }
          : bm
      );

    setPlayerMonsters(updateRecharge);
    setEnemyMonsters(updateRecharge);

    addFloatingText(monsterCombat.monster.id, '+45 استرجاع طاقة', 'text-cyan-400');
    setBattleLog((prev) => [
      `${monsterCombat.monster.nameAr} استعاد طاقة الاستحمال (+45)`,
      ...prev.slice(0, 8),
    ]);
    advanceTurn();
  };

  // Next turn progression with immutable state checks
  const advanceTurn = () => {
    // Check end conditions first
    setPlayerMonsters((currentPlayers) => {
      setEnemyMonsters((currentEnemies) => {
        const allEnemiesDefeated = currentEnemies.every((m) => m.isDefeated);
        const allPlayersDefeated = currentPlayers.every((m) => m.isDefeated);

        if (allEnemiesDefeated) {
          sound.playVictory();
          setBattleResult('victory');
          handleVictoryRewards();
          return currentEnemies;
        }

        if (allPlayersDefeated) {
          setBattleResult('defeat');
          return currentEnemies;
        }

        // Determine next active monster in initiative order
        const allLiving = [...currentPlayers, ...currentEnemies].filter((m) => !m.isDefeated);
        if (allLiving.length === 0) return currentEnemies;

        const currentIndex = allLiving.findIndex((m) => m.monster.id === activeTurnMonsterId);
        const nextIndex = (currentIndex + 1) % allLiving.length;
        const nextMonster = allLiving[nextIndex];

        // Process cooldown decrements and status effect ticks immutably
        const tickTeam = (team: BattleMonster[]) =>
          team.map((bm) => {
            if (bm.monster.id === nextMonster.monster.id) {
              const newCooldowns: Record<string, number> = {};
              Object.entries(bm.skillCooldowns).forEach(([key, val]) => {
                if (val > 0) newCooldowns[key] = val - 1;
              });

              let currentHp = bm.currentHp;
              bm.statusEffects.forEach((ef) => {
                if (ef.type === 'burn' || ef.type === 'poison') {
                  currentHp = Math.max(0, currentHp - ef.value);
                  addFloatingText(bm.monster.id, `-${ef.value} ضرر حرق`, 'text-orange-400');
                }
              });

              const updatedEffects = bm.statusEffects
                .map((ef) => ({ ...ef, duration: ef.duration - 1 }))
                .filter((ef) => ef.duration > 0);

              return {
                ...bm,
                currentHp,
                isDefeated: currentHp <= 0,
                skillCooldowns: newCooldowns,
                statusEffects: updatedEffects,
              };
            }
            return bm;
          });

        if (nextMonster.isAi) {
          setEnemyMonsters(tickTeam);
        } else {
          setPlayerMonsters(tickTeam);
        }

        // Stun check
        const isStunned = nextMonster.statusEffects.some((ef) => ef.type === 'stun');
        if (isStunned) {
          addFloatingText(nextMonster.monster.id, 'مجمّد هذا الدور!', 'text-yellow-400');
          setActiveTurnMonsterId(nextMonster.monster.id);
          setTimeout(() => advanceTurn(), 600 / battleSpeed);
          return currentEnemies;
        }

        setActiveTurnMonsterId(nextMonster.monster.id);

        if (!nextMonster.isAi) {
          setSelectedSkill(nextMonster.monster.skills[0] || null);
          const aliveEnemy = currentEnemies.find((e) => !e.isDefeated);
          if (aliveEnemy) setSelectedTargetId(aliveEnemy.monster.id);
        }

        return currentEnemies;
      });
      return currentPlayers;
    });
  };

  // AI Turn handling automatically
  useEffect(() => {
    if (!inActiveBattle || battleResult) return;

    const activeMonster = [...playerMonsters, ...enemyMonsters].find(
      (m) => m.monster.id === activeTurnMonsterId && !m.isDefeated
    );

    if (!activeMonster) return;

    // AI Turn or Player in Auto Mode
    if (activeMonster.isAi || (!activeMonster.isAi && autoBattle)) {
      const timer = setTimeout(() => {
        // AI Decision
        // 1. Check if stamina low -> recharge
        if (activeMonster.currentStamina < 20) {
          rechargeMonster(activeMonster);
          return;
        }

        // 2. Select best skill
        const availableSkills = activeMonster.monster.skills.filter((sk) => {
          const cd = activeMonster.skillCooldowns[sk.id] || 0;
          return cd === 0 && activeMonster.currentStamina >= sk.staminaCost;
        });

        const skillToUse =
          availableSkills.length > 0
            ? availableSkills[Math.floor(Math.random() * availableSkills.length)]
            : activeMonster.monster.skills[activeMonster.monster.skills.length - 1]; // basic strike

        // 3. Select target: weakest alive target or random alive target
        const opponentTeam = activeMonster.isAi ? playerMonsters : enemyMonsters;
        const aliveOpponents = opponentTeam.filter((m) => !m.isDefeated);
        if (aliveOpponents.length === 0) return;

        // Sort by lowest HP to finish off
        aliveOpponents.sort((a, b) => a.currentHp - b.currentHp);
        const target = aliveOpponents[0];

        executeSkill(activeMonster, skillToUse, target);
      }, 700 / battleSpeed);

      return () => clearTimeout(timer);
    }
  }, [
    activeTurnMonsterId,
    inActiveBattle,
    battleResult,
    autoBattle,
    battleSpeed,
    playerMonsters,
    enemyMonsters,
  ]);

  const handleVictoryRewards = () => {
    const updatedState: PlayerState = {
      ...playerState,
      gold: playerState.gold + selectedStage.rewards.gold,
      food: playerState.food + selectedStage.rewards.food,
      xp: playerState.xp + selectedStage.rewards.xp,
      completedStages: Math.max(playerState.completedStages, selectedStage.id),
    };

    // Distribute XP to player monsters
    updatedState.monsters = updatedState.monsters.map((m) => {
      const wasInTeam = playerMonsters.some((pm) => pm.monster.id === m.id);
      if (wasInTeam) {
        let newXp = m.xp + selectedStage.rewards.xp;
        let newLevel = m.level;
        let maxXp = m.maxXp;
        while (newXp >= maxXp) {
          newXp -= maxXp;
          newLevel += 1;
          maxXp = newLevel * 100;
        }
        return {
          ...m,
          level: newLevel,
          xp: newXp,
          maxXp,
          maxHp: Math.round(m.maxHp * 1.08),
          attack: Math.round(m.attack * 1.07),
          defense: Math.round(m.defense * 1.07),
        };
      }
      return m;
    });

    onBattleEnd(updatedState, true);
  };

  const currentActiveMonster = [...playerMonsters, ...enemyMonsters].find(
    (m) => m.monster.id === activeTurnMonsterId
  );

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full">
      {/* If not in active battle, show Campaign Stage Selection */}
      {!inActiveBattle ? (
        <div className="flex flex-col gap-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
                <Swords className="w-4 h-4" />
                <span>حملة معارك 3 ضد 3 (Monster Colosseum Campaign)</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                اختر ساحة المعركة القادمة
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                قاتل فرق الوحوش التي يتحكم بها الذكاء الاصطناعي واكسب الذهب والغذاء ونقاط الخبرة
                لترقية وحوشك.
              </p>
            </div>

            <button
              onClick={onReturnToIsland}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
            >
              <span>العودة للجزيرة</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Stages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CAMPAIGN_STAGES.map((stage) => {
              const isUnlocked = stage.id <= playerState.completedStages + 1;
              return (
                <div
                  key={stage.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                    isUnlocked
                      ? 'bg-slate-900/90 border-slate-800 hover:border-amber-500/60 shadow-lg'
                      : 'bg-slate-950/60 border-slate-850 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-mono text-amber-400">{stage.subtitle}</span>
                      <h3 className="text-lg font-bold text-white mt-0.5">{stage.nameAr}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                        <span>المستوى المقترح: {stage.recommendedLevel}</span>
                        <span>·</span>
                        <span>الصعوبة: {stage.difficulty}</span>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        stage.difficulty === 'زعيم'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {stage.difficulty}
                    </span>
                  </div>

                  {/* Rewards preview */}
                  <div className="flex items-center gap-4 text-xs font-bold bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <span className="text-amber-400">+{stage.rewards.gold} ذهب</span>
                    <span className="text-emerald-400">+{stage.rewards.food} غذاء</span>
                    <span className="text-purple-400">+{stage.rewards.xp} XP</span>
                  </div>

                  <button
                    onClick={() => startStageBattle(stage)}
                    disabled={!isUnlocked}
                    className={`w-full py-3 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all ${
                      isUnlocked
                        ? 'bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-slate-950 shadow-md active:scale-98'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{isUnlocked ? 'بدء معركة 3 ضد 3' : 'مرحلة مقفلة'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Active 3v3 Battle Arena */
        <div className="flex flex-col gap-4">
          {/* Top Arena Header: Stage Name, Speed & Auto Battle Toggles */}
          <div className="flex items-center justify-between bg-slate-900/90 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-sm font-extrabold text-white">{selectedStage.nameAr}</span>
              <span className="text-xs text-slate-400 hidden sm:inline">
                {selectedStage.subtitle}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* 3D vs 2D Battle Switcher */}
              <button
                onClick={() => setBattleMode(battleMode === '3d' ? '2d' : '3d')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition-all shadow-xs"
                title="تبديل العرض بين ثلاثي الأبعاد وكلاسيكي"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{battleMode === '3d' ? 'ساحة 3D مجسمة' : 'عرض 2D'}</span>
              </button>

              {/* Auto Battle */}
              <button
                onClick={() => setAutoBattle(!autoBattle)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                  autoBattle
                    ? 'bg-red-500/20 border-red-500 text-red-300 ring-1 ring-red-500/50'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {autoBattle ? 'قتال تلقائي (AUTO ON)' : 'تلقائي (AUTO)'}
              </button>

              {/* Speed Toggle */}
              <button
                onClick={() => setBattleSpeed(battleSpeed === 1 ? 2 : 1)}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold text-amber-400"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>{battleSpeed}x</span>
              </button>

              {/* Surrender / Escape */}
              <button
                onClick={() => setInActiveBattle(false)}
                className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg text-xs font-semibold"
              >
                انسحاب
              </button>
            </div>
          </div>

          {/* Battlefield Arena Stage (3D Real Monster Arena by Default) */}
          {battleMode === '3d' ? (
            <div
              className={`relative transition-transform ${
                screenShake ? 'translate-x-2 -translate-y-2' : ''
              }`}
            >
              <BattleArena3D
                playerMonsters={playerMonsters}
                enemyMonsters={enemyMonsters}
                activeTurnMonsterId={activeTurnMonsterId}
                selectedTargetId={selectedTargetId}
                attackingMonsterId={attackingMonsterId}
                hitMonsterId={hitMonsterId}
                activeVfx={activeVfx}
                floatingTexts={floatingTexts}
                onSelectTarget={setSelectedTargetId}
              />
            </div>
          ) : (
            /* Classic 2D Arena with Animated Sprites */
            <div
              className={`relative w-full min-h-[480px] sm:min-h-[540px] md:min-h-[620px] bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col justify-between p-3 sm:p-5 md:p-6 transition-transform ${
                screenShake ? 'translate-x-2 -translate-y-2' : ''
              }`}
            >
              {/* Arena Backdrop Image */}
              <div
                className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-45 mix-blend-luminosity"
                style={{ backgroundImage: `url('/src/assets/images/battle_arena_colosseum_1794261177610.jpg')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/80 pointer-events-none" />

              {/* --- METEOR STRIKE VFX OVERLAY IN BATTLE --- */}
              {activeVfx?.key === 'attack_meteor_special' && (
                <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-red-950/80 mix-blend-multiply"
                  />
                  <motion.div
                    initial={{ x: -200, y: -200, scale: 0.5 }}
                    animate={{ x: 260, y: 140, scale: 1.4 }}
                    transition={{ duration: 0.45 / battleSpeed, ease: 'easeIn' }}
                    className="absolute top-10 left-20 w-44 h-44 rounded-full bg-radial from-yellow-200 via-amber-500 to-red-700 shadow-[0_0_100px_rgba(239,68,68,1)] flex items-center justify-center"
                  >
                    <Flame className="w-24 h-24 text-yellow-100 animate-spin" />
                  </motion.div>
                </div>
              )}

              {/* --- EARTH SHATTER VFX OVERLAY IN BATTLE --- */}
              {activeVfx?.key === 'attack_earth_shatter' && (
                <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '80%' }}
                    transition={{ duration: 0.35 / battleSpeed }}
                    className="absolute bottom-20 left-20 h-6 bg-gradient-to-r from-amber-600 via-emerald-500 to-yellow-400 blur-xs rounded-full shadow-[0_0_35px_rgba(16,185,129,0.9)]"
                  />
                </div>
              )}

              {/* --- FIRE CLAWS VFX OVERLAY --- */}
              {activeVfx?.key === 'attack_physical_claws_fire' && (
                <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.2, opacity: 0 }}
                    animate={{ scale: 1.8, opacity: 1 }}
                    transition={{ duration: 0.3 / battleSpeed }}
                    className="w-48 h-48 border-y-4 border-amber-400 -rotate-45 shadow-[0_0_40px_rgba(245,158,11,1)]"
                  />
                </div>
              )}

              {/* --- DARK BLOODPLAGUE VFX OVERLAY --- */}
              {activeVfx?.key === 'attack_dark_bloodplague' && (
                <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.2, rotate: 0 }}
                    animate={{ scale: 2.2, rotate: 180 }}
                    transition={{ duration: 0.5 / battleSpeed }}
                    className="w-44 h-44 rounded-full border-4 border-dashed border-purple-500 shadow-[0_0_60px_rgba(168,85,247,1)]"
                  />
                </div>
              )}

              {/* Top Row: AI Opponent Team (3 Monsters standing on runic combat pedestals) */}
              <div className="relative z-10 flex items-center justify-end gap-2 sm:gap-6 md:gap-10 pr-2 md:pr-10 pt-2">
                {enemyMonsters.map((bm) => (
                  <MonsterBattleSprite
                    key={bm.monster.id}
                    battleMonster={bm}
                    isCurrentTurn={bm.monster.id === activeTurnMonsterId}
                    isSelectedTarget={bm.monster.id === selectedTargetId}
                    isAttacking={bm.monster.id === attackingMonsterId}
                    isTakingHit={bm.monster.id === hitMonsterId}
                    onSelect={() => setSelectedTargetId(bm.monster.id)}
                    floatingTexts={floatingTexts.filter(
                      (ft) => ft.targetMonsterId === bm.monster.id
                    )}
                  />
                ))}
              </div>

              {/* Bottom Row: Player Team (3 Monsters standing on runic combat pedestals) */}
              <div className="relative z-10 flex items-center justify-start gap-2 sm:gap-6 md:gap-10 pl-2 md:pl-10 pb-2">
                {playerMonsters.map((bm) => (
                  <MonsterBattleSprite
                    key={bm.monster.id}
                    battleMonster={bm}
                    isCurrentTurn={bm.monster.id === activeTurnMonsterId}
                    isSelectedTarget={false}
                    isAttacking={bm.monster.id === attackingMonsterId}
                    isTakingHit={bm.monster.id === hitMonsterId}
                    onSelect={() => {}}
                    floatingTexts={floatingTexts.filter(
                      (ft) => ft.targetMonsterId === bm.monster.id
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Turn Action Control Deck (Shown when it's player monster's turn) */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 md:p-5 flex flex-col gap-3 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">الوحش النشط الآن:</span>
                <span className="text-sm font-extrabold text-amber-400">
                  {currentActiveMonster?.monster.nameAr || 'انتظار...'}
                </span>
                {!currentActiveMonster?.isAi && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                    أنت المتحكم
                  </span>
                )}
              </div>

              {/* Action buttons on the side */}
              {!currentActiveMonster?.isAi && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => currentActiveMonster && rechargeMonster(currentActiveMonster)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-lg text-xs font-bold transition-all"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>شحن الاستحمال (+45)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Skill Cards when player monster is active */}
            {!currentActiveMonster?.isAi ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {currentActiveMonster?.monster.skills.map((skill) => {
                  const cooldown = currentActiveMonster.skillCooldowns[skill.id] || 0;
                  const hasEnoughStamina = currentActiveMonster.currentStamina >= skill.staminaCost;
                  const isReady = cooldown === 0 && hasEnoughStamina;
                  const isSelected = selectedSkill?.id === skill.id;

                  return (
                    <button
                      key={skill.id}
                      onClick={() => {
                        setSelectedSkill(skill);
                        // Trigger attack immediately towards selected target
                        const target =
                          enemyMonsters.find((m) => m.monster.id === selectedTargetId) ||
                          enemyMonsters.find((m) => !m.isDefeated) ||
                          null;
                        executeSkill(currentActiveMonster, skill, target);
                      }}
                      disabled={!isReady}
                      className={`text-right p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
                        isReady
                          ? 'bg-slate-850 hover:bg-slate-800 border-slate-750 hover:border-amber-500 active:scale-98 shadow-md'
                          : 'bg-slate-950/60 border-slate-850 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-white">{skill.nameAr}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            ELEMENT_COLORS[skill.element].bg
                          } ${ELEMENT_COLORS[skill.element].text}`}
                        >
                          {skill.element.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {skill.descriptionAr}
                      </p>

                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 pt-1 border-t border-slate-800">
                        <span className="text-red-400">قوة: {skill.power}</span>
                        <span className="text-cyan-400">استحمال: {skill.staminaCost}</span>
                        {cooldown > 0 && <span className="text-amber-400">انتظار: {cooldown}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-400 animate-pulse">
                الكمبيوتر يفكر في الهجوم القادم...
              </div>
            )}
          </div>

          {/* Real-time Battle Log */}
          <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-3 text-xs text-slate-400 flex flex-col gap-1 max-h-24 overflow-y-auto">
            <span className="font-bold text-slate-300">سجل مجريات المعركة:</span>
            {battleLog.map((log, idx) => (
              <div key={idx} className="font-mono text-[11px] text-slate-400">
                • {log}
              </div>
            ))}
          </div>

          {/* Victory / Defeat Modal */}
          {battleResult && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md bg-slate-900 border-2 border-amber-500 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center gap-4"
              >
                {battleResult === 'victory' ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.6)]">
                      <Trophy className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-white">انتصار ساحق!</h3>
                    <p className="text-xs text-slate-300">
                      لقد هزمت فريق الخصم بنجاح وحصلت على مكافآت المرحلة.
                    </p>

                    {/* Rewards pill list */}
                    <div className="w-full bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-around text-sm font-extrabold">
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-slate-400">ذهب</span>
                        <span className="text-amber-400">+{selectedStage.rewards.gold}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-slate-400">غذاء</span>
                        <span className="text-emerald-400">+{selectedStage.rewards.food}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-slate-400">خبرة XP</span>
                        <span className="text-purple-400">+{selectedStage.rewards.xp}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setInActiveBattle(false);
                        setBattleResult(null);
                      }}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-slate-950 font-black rounded-xl text-sm shadow-lg transition-transform active:scale-95"
                    >
                      استلام الجوائز والعودة
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.6)]">
                      <Skull className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-white">هزيمة في المعركة</h3>
                    <p className="text-xs text-slate-300">
                      سقطت وحوشك أمام الخصم. قم بإطعام وحوشك ورفع مستواها ثم حاول مجدداً!
                    </p>

                    <div className="flex gap-3 w-full">
                      <button
                        onClick={() => startStageBattle(selectedStage)}
                        className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors"
                      >
                        إعادة المحاولة
                      </button>
                      <button
                        onClick={() => {
                          setInActiveBattle(false);
                          setBattleResult(null);
                        }}
                        className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                      >
                        العودة للجزيرة
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
