import React, { useState, useEffect, useMemo } from 'react';
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
  REALISTIC_ARENAS,
  BattleArenaTheme,
  SPECIES_CATALOG,
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
  MapPin,
  Check,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { MonsterBattleSprite } from './MonsterBattleSprite';

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
  // Navigation & Screen States
  const [selectedStage, setSelectedStage] = useState<BattleStage>(CAMPAIGN_STAGES[0]);
  const [inspectingStage, setInspectingStage] = useState<BattleStage | null>(null);
  const [inActiveBattle, setInActiveBattle] = useState<boolean>(false);

  // Realistic Arena Selection (defaults to the iconic Monster Legends Desert Canyon)
  const [selectedArenaId, setSelectedArenaId] = useState<string>('desert_canyon');
  const [isArenaSelectorOpen, setIsArenaSelectorOpen] = useState<boolean>(false);
  const [isTeamSelectorOpen, setIsTeamSelectorOpen] = useState<boolean>(false);

  // Selected player team monster IDs (3 monsters)
  const [selectedPlayerMonsterIds, setSelectedPlayerMonsterIds] = useState<string[]>(() => {
    return playerState.monsters.slice(0, 3).map((m) => m.id);
  });

  // Active Combat State
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

  // Current active arena theme object
  const currentArena: BattleArenaTheme = useMemo(() => {
    return (
      REALISTIC_ARENAS.find((a) => a.id === selectedArenaId) ||
      REALISTIC_ARENAS[0]
    );
  }, [selectedArenaId]);

  // Player team monsters objects for inspection & battle
  const currentTeamMonsters: Monster[] = useMemo(() => {
    const list: Monster[] = [];
    selectedPlayerMonsterIds.forEach((id) => {
      const found = playerState.monsters.find((m) => m.id === id);
      if (found) list.push(found);
    });
    // Fallback if less than 3
    if (list.length < 3) {
      playerState.monsters.forEach((m) => {
        if (!list.some((existing) => existing.id === m.id) && list.length < 3) {
          list.push(m);
        }
      });
    }
    return list;
  }, [selectedPlayerMonsterIds, playerState.monsters]);

  // Stage preview enemy monsters objects
  const stageEnemyMonsters: Monster[] = useMemo(() => {
    const stage = inspectingStage || selectedStage;
    return stage.enemies.map((e) => createMonsterInstance(e.speciesId, e.level));
  }, [inspectingStage, selectedStage]);

  // Open Stage Preparation Screen (Monster Legends team preview)
  const openStagePreparation = (stage: BattleStage) => {
    setSelectedStage(stage);
    setInspectingStage(stage);
  };

  // Launch the active battle
  const startActiveBattle = () => {
    const stage = inspectingStage || selectedStage;
    setSelectedStage(stage);

    // Initialize player combat team
    const pCombat: BattleMonster[] = currentTeamMonsters.map((m, idx) => ({
      monster: JSON.parse(JSON.stringify(m)),
      isAi: false,
      position: idx,
      currentHp: m.maxHp,
      currentStamina: m.maxStamina,
      skillCooldowns: {},
      statusEffects: [],
      isDefeated: false,
    }));

    // Initialize enemy combat team
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
    setBattleLog([`بدأت معركة ${stage.nameAr} في ${currentArena.nameAr}! جهّز وحوشك.`]);

    // Choose first to move by highest speed
    const all = [...pCombat, ...eCombat];
    all.sort((a, b) => b.monster.speed - a.monster.speed);
    const first = all[0];
    setActiveTurnMonsterId(first.monster.id);

    // Default select first skill if player monster
    if (!first.isAi) {
      setSelectedSkill(first.monster.skills[0] || null);
      setSelectedTargetId(eCombat[0].monster.id);
    }
  };

  // Add floating combat popup text
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

  // Turn execution with immutable state updates
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

    // Play attack animation & audio
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

    // Sound triggers
    if (skill.animationKey === 'attack_meteor_special') {
      sound.playMeteorStrike();
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 500 / battleSpeed);
    } else if (skill.animationKey === 'attack_thunder_strike') {
      sound.playThunder();
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 400 / battleSpeed);
    } else if (skill.animationKey === 'attack_nature_vines') {
      sound.playVineWhip();
    } else if (skill.animationKey === 'attack_earth_shatter') {
      sound.playEarthShatter();
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 400 / battleSpeed);
    } else if (skill.animationKey === 'attack_water_surge') {
      sound.playHeal();
    } else {
      sound.playFireClaws();
    }

    // Calculate Damage / Healing
    const isHealing = skill.effectType === 'heal';
    let baseDamage = skill.power;
    let multiplier = 1;

    if (target && !isHealing) {
      // Monster Legends type advantages: 2.5x strong, 0.5x weak
      const strongVs = ELEMENT_ADVANTAGES[skill.element] || [];
      const weakVs = ELEMENT_DISADVANTAGES[skill.element] || [];

      if (strongVs.includes(target.monster.element)) {
        multiplier = 2.5;
        addFloatingText(target.monster.id, 'فعّال جداً! (2.5x)', 'text-amber-300 font-extrabold', true);
      } else if (weakVs.includes(target.monster.element)) {
        multiplier = 0.5;
        addFloatingText(target.monster.id, 'ضعيف التأثير (0.5x)', 'text-slate-400');
      }
    }

    const calculatedDamage = Math.max(
      15,
      Math.round(
        baseDamage *
          (attacker.monster.attack / (target ? target.monster.defense : 100)) *
          multiplier *
          (0.9 + Math.random() * 0.2)
      )
    );

    // Immutable state application
    setPlayerMonsters((prevPlayers) => {
      setEnemyMonsters((prevEnemies) => {
        let updatedPlayers = [...prevPlayers];
        let updatedEnemies = [...prevEnemies];

        // Deduct attacker stamina & set cooldown
        const updateAttackerTeam = (team: BattleMonster[]) =>
          team.map((bm) => {
            if (bm.monster.id === attacker.monster.id) {
              return {
                ...bm,
                currentStamina: Math.max(0, bm.currentStamina - skill.staminaCost),
                skillCooldowns: {
                  ...bm.skillCooldowns,
                  [skill.id]: skill.cooldown,
                },
              };
            }
            return bm;
          });

        if (attacker.isAi) {
          updatedEnemies = updateAttackerTeam(updatedEnemies);
        } else {
          updatedPlayers = updateAttackerTeam(updatedPlayers);
        }

        // Apply skill effects to target or all targets
        if (isHealing) {
          const healAmount = skill.effectValue || 250;
          const healTeam = (team: BattleMonster[]) =>
            team.map((bm) => {
              if (!bm.isDefeated) {
                const newHp = Math.min(bm.monster.maxHp, bm.currentHp + healAmount);
                addFloatingText(bm.monster.id, `+${healAmount} HP`, 'text-emerald-400 font-black');
                return { ...bm, currentHp: newHp };
              }
              return bm;
            });

          if (attacker.isAi) {
            updatedEnemies = healTeam(updatedEnemies);
          } else {
            updatedPlayers = healTeam(updatedPlayers);
          }
        } else if (target) {
          const applyTargetDamage = (team: BattleMonster[]) =>
            team.map((bm) => {
              if (bm.monster.id === target.monster.id && !bm.isDefeated) {
                const newHp = Math.max(0, bm.currentHp - calculatedDamage);
                const isCrit = multiplier > 1.2;
                addFloatingText(
                  bm.monster.id,
                  `-${calculatedDamage}`,
                  isCrit ? 'text-red-400 font-black' : 'text-orange-400 font-bold',
                  isCrit
                );

                const newEffects = [...bm.statusEffects];
                if (skill.effectType === 'burn') {
                  newEffects.push({
                    type: 'burn',
                    duration: 3,
                    value: 40,
                  });
                } else if (skill.effectType === 'stun') {
                  newEffects.push({
                    type: 'stun',
                    duration: 1,
                    value: 0,
                  });
                }

                return {
                  ...bm,
                  currentHp: newHp,
                  isDefeated: newHp <= 0,
                  statusEffects: newEffects,
                };
              }
              return bm;
            });

          if (target.isAi) {
            updatedEnemies = applyTargetDamage(updatedEnemies);
          } else {
            updatedPlayers = applyTargetDamage(updatedPlayers);
          }
        }

        // Update battle log
        const logMsg = `${attacker.monster.nameAr.split(' ')[0]} نفّذ [${skill.nameAr}] ${
          target ? `ضد ${target.monster.nameAr.split(' ')[0]}` : ''
        } ${isHealing ? 'واستعاد الفريق صحته' : `وأحدث ${calculatedDamage} ضرر!`}`;
        setBattleLog((prev) => [logMsg, ...prev.slice(0, 15)]);

        // Check victory / defeat
        const allEnemiesDead = updatedEnemies.every((m) => m.isDefeated);
        const allPlayersDead = updatedPlayers.every((m) => m.isDefeated);

        if (allEnemiesDead) {
          setTimeout(() => {
            sound.playVictory();
            setBattleResult('victory');
            handleVictoryRewards();
          }, 700 / battleSpeed);
        } else if (allPlayersDead) {
          setTimeout(() => {
            sound.playHit();
            setBattleResult('defeat');
          }, 700 / battleSpeed);
        } else {
          // Advance to next turn
          setTimeout(() => advanceTurn(), 600 / battleSpeed);
        }

        return updatedEnemies;
      });
      return prevPlayers;
    });
  };

  // Recharge monster stamina
  const rechargeMonster = (monster: BattleMonster) => {
    sound.playCoin();
    addFloatingText(monster.monster.id, '+45 استحمال', 'text-cyan-300 font-bold');

    const updateStamina = (team: BattleMonster[]) =>
      team.map((bm) => {
        if (bm.monster.id === monster.monster.id) {
          return {
            ...bm,
            currentStamina: Math.min(bm.monster.maxStamina, bm.currentStamina + 45),
          };
        }
        return bm;
      });

    if (monster.isAi) {
      setEnemyMonsters(updateStamina);
    } else {
      setPlayerMonsters(updateStamina);
    }

    setBattleLog((prev) => [
      `${monster.monster.nameAr.split(' ')[0]} أخذ دوراً للاستراحة واستعادة الطاقة.`,
      ...prev.slice(0, 15),
    ]);

    setTimeout(() => advanceTurn(), 500 / battleSpeed);
  };

  // Advance turn order
  const advanceTurn = () => {
    setActiveVfx(null);

    setPlayerMonsters((currentPlayers) => {
      setEnemyMonsters((currentEnemies) => {
        const allLiving = [...currentPlayers, ...currentEnemies].filter((m) => !m.isDefeated);
        if (allLiving.length === 0) return currentEnemies;

        const currentIndex = allLiving.findIndex((m) => m.monster.id === activeTurnMonsterId);
        const nextIndex = (currentIndex + 1) % allLiving.length;
        const nextMonster = allLiving[nextIndex];

        // Process cooldown decrements and status effect ticks
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

        // Check Stun status
        const isStunned = nextMonster.statusEffects.some((ef) => ef.type === 'stun');
        if (isStunned) {
          addFloatingText(nextMonster.monster.id, 'مشلول هذا الدور!', 'text-yellow-400 font-bold');
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

  // AI Turn handling
  useEffect(() => {
    if (!inActiveBattle || battleResult) return;

    const activeMonster = [...playerMonsters, ...enemyMonsters].find(
      (m) => m.monster.id === activeTurnMonsterId && !m.isDefeated
    );

    if (!activeMonster) return;

    if (activeMonster.isAi || (!activeMonster.isAi && autoBattle)) {
      const timer = setTimeout(() => {
        if (activeMonster.currentStamina < 20) {
          rechargeMonster(activeMonster);
          return;
        }

        const availableSkills = activeMonster.monster.skills.filter((sk) => {
          const cd = activeMonster.skillCooldowns[sk.id] || 0;
          return cd === 0 && activeMonster.currentStamina >= sk.staminaCost;
        });

        const skillToUse =
          availableSkills.length > 0
            ? availableSkills[Math.floor(Math.random() * availableSkills.length)]
            : activeMonster.monster.skills[activeMonster.monster.skills.length - 1];

        const opponentTeam = activeMonster.isAi ? playerMonsters : enemyMonsters;
        const aliveOpponents = opponentTeam.filter((m) => !m.isDefeated);
        if (aliveOpponents.length === 0) return;

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

  // Handle victory rewards and distribute XP
  const handleVictoryRewards = () => {
    const updatedState: PlayerState = {
      ...playerState,
      gold: playerState.gold + selectedStage.rewards.gold,
      food: playerState.food + selectedStage.rewards.food,
      xp: playerState.xp + selectedStage.rewards.xp,
      completedStages: Math.max(playerState.completedStages, selectedStage.id),
    };

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

  // Turn order queue for living monsters
  const turnQueue = useMemo(() => {
    return [...playerMonsters, ...enemyMonsters].filter((m) => !m.isDefeated);
  }, [playerMonsters, enemyMonsters]);

  // Toggle monster in team selection
  const toggleMonsterInTeam = (monsterId: string) => {
    if (selectedPlayerMonsterIds.includes(monsterId)) {
      if (selectedPlayerMonsterIds.length <= 1) {
        alert('يجب أن تحتوي التشكيلة على وحش واحد على الأقل!');
        return;
      }
      setSelectedPlayerMonsterIds((prev) => prev.filter((id) => id !== monsterId));
    } else {
      if (selectedPlayerMonsterIds.length >= 3) {
        alert('الحد الأقصى للتشكيلة هو 3 وحوش!');
        return;
      }
      setSelectedPlayerMonsterIds((prev) => [...prev, monsterId]);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-2 sm:p-4 md:p-6 max-w-7xl mx-auto w-full select-none">
      {/* ============================================================== */}
      {/* VIEW 1: CAMPAIGN STAGE DIRECTORY                               */}
      {/* ============================================================== */}
      {!inspectingStage && !inActiveBattle && (
        <div className="flex flex-col gap-6">
          <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
                <Swords className="w-4 h-4" />
                <span>حملة معارك Monster Legends (3v3 Arena Campaign)</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white">
                اختر مرحلة المعركة القادمة
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                قاتل فرق الوحوش الأسطورية الحقيقية في حلبات واقعية مذهلة واكسب الذهب والغذاء والجواهر.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsArenaSelectorOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold border border-amber-500/30 transition-colors shadow-sm"
              >
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>الساحة: {currentArena.nameAr.split(' ')[0]}</span>
              </button>

              <button
                onClick={onReturnToIsland}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-colors"
              >
                <span>العودة للجزيرة</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CAMPAIGN_STAGES.map((stage) => {
              const isUnlocked = stage.id <= playerState.completedStages + 1;
              const isCompleted = stage.id <= playerState.completedStages;

              return (
                <div
                  key={stage.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    isUnlocked
                      ? 'bg-slate-900/90 border-slate-800 hover:border-amber-500/60 shadow-lg'
                      : 'bg-slate-950/60 border-slate-900 opacity-55'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-mono text-amber-400 font-bold">{stage.subtitle}</span>
                      <h3 className="text-base font-extrabold text-white mt-0.5">{stage.nameAr}</h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                        <span>Lv.{stage.recommendedLevel}</span>
                        <span>·</span>
                        <span className="text-amber-300 font-bold">{stage.difficulty}</span>
                      </div>
                    </div>

                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        <Check className="w-3 h-3" />
                        <span>مكتملة</span>
                      </span>
                    ) : (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          stage.difficulty === 'زعيم'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {stage.difficulty}
                      </span>
                    )}
                  </div>

                  {/* Stage Opponents Avatars */}
                  <div className="flex items-center gap-2 py-1">
                    <span className="text-[10px] text-slate-400 font-bold">الخصوم:</span>
                    <div className="flex items-center -space-x-2">
                      {stage.enemies.map((e, idx) => {
                        const spec = SPECIES_CATALOG[e.speciesId];
                        return (
                          <div
                            key={idx}
                            className="w-7 h-7 rounded-full border border-slate-700 overflow-hidden bg-slate-950 shadow-xs"
                            title={`${spec?.nameAr || e.speciesId} (Lv.${e.level})`}
                          >
                            <img
                              src={spec?.avatar}
                              alt={e.speciesId}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rewards preview */}
                  <div className="flex items-center justify-between text-[11px] font-bold bg-slate-950/70 px-3 py-1.5 rounded-xl border border-slate-800">
                    <span className="text-amber-400">+{stage.rewards.gold} ذهب</span>
                    <span className="text-emerald-400">+{stage.rewards.food} طعام</span>
                    <span className="text-purple-400">+{stage.rewards.xp} XP</span>
                  </div>

                  <button
                    onClick={() => openStagePreparation(stage)}
                    disabled={!isUnlocked}
                    className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
                      isUnlocked
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isUnlocked ? 'معاينة وتجهيز التشكيلة' : 'مرحلة مقفلة'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 2: TEAM PREPARATION & STAGE PREVIEW (Monster Legends UI)  */}
      {/* ============================================================== */}
      {inspectingStage && !inActiveBattle && (
        <div className="flex flex-col gap-4">
          {/* Top Bar with Stage Title & Close */}
          <div className="flex items-center justify-between bg-slate-900/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-800 shadow-md">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setInspectingStage(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="الرجوع لقائمة المراحل"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">{inspectingStage.nameAr}</h3>
                <span className="text-xs text-amber-400 font-bold">{inspectingStage.subtitle} · صعوبة {inspectingStage.difficulty}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsArenaSelectorOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold border border-amber-500/30"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">تبديل الساحة:</span>
                <span>{currentArena.nameAr.split(' ')[0]}</span>
              </button>

              <button
                onClick={() => setIsTeamSelectorOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 rounded-xl text-xs font-bold border border-cyan-500/30"
              >
                <Users className="w-3.5 h-3.5" />
                <span>تعديل الفريق</span>
              </button>
            </div>
          </div>

          {/* Authentic Monster Legends Team Lineup Stage */}
          <div className="relative w-full min-h-[480px] sm:min-h-[540px] md:min-h-[600px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col justify-between p-4 sm:p-6">
            {/* Realistic HD Arena Backdrop */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-700"
              style={{ backgroundImage: `url('${currentArena.image}')` }}
            />
            {/* Subtle atmospheric vignette */}
            <div className={`absolute inset-0 bg-gradient-to-t ${currentArena.overlayTint} pointer-events-none`} />

            {/* Top Team Headers */}
            <div className="relative z-10 flex items-center justify-between text-xs sm:text-sm font-black">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/80 backdrop-blur-md text-white border border-blue-400 shadow-lg">
                <Shield className="w-3.5 h-3.5" />
                <span>فريقك الأسطوري ({currentTeamMonsters.length}/3)</span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/80 backdrop-blur-md text-white border border-red-400 shadow-lg">
                <Skull className="w-3.5 h-3.5" />
                <span>فريق الخصم ({stageEnemyMonsters.length}/3)</span>
              </div>
            </div>

            {/* Stepped Monster Legends Team Staging Area (Real illustrated monsters on realistic arena terrain) */}
            <div className="relative z-10 w-full h-full my-auto grid grid-cols-2 gap-4 items-center">
              {/* Player 3 Monsters on Left (stepped depth formation) */}
              <div className="relative flex flex-col justify-around h-[360px] sm:h-[420px]">
                {currentTeamMonsters.map((monster, idx) => (
                  <div
                    key={monster.id}
                    className={`relative flex items-center gap-3 transition-transform ${
                      idx === 1 ? 'translate-x-6 sm:translate-x-12 scale-105' : 'scale-95'
                    }`}
                  >
                    {/* Real Full Monster Figure with Breathing Idle */}
                    <motion.div
                      animate={{ y: [0, -6, 0], scaleY: [1, 1.02, 1] }}
                      transition={{ repeat: Infinity, duration: 2.8 + idx * 0.4, ease: 'easeInOut' }}
                      className="relative w-24 h-28 sm:w-32 sm:h-38 md:w-38 md:h-44 flex items-center justify-center"
                    >
                      {/* Contact shadow on arena ground */}
                      <div className="absolute -bottom-2 w-20 sm:w-28 h-5 bg-black/60 rounded-full blur-xs pointer-events-none" />
                      <img
                        src={monster.avatar}
                        alt={monster.name}
                        className="w-full h-full object-contain filter drop-shadow-[0_12px_20px_rgba(0,0,0,0.85)]"
                      />
                    </motion.div>

                    {/* Monster Legends Nameplate Badge: (Rarity) Name Lvl X */}
                    <div className="bg-slate-950/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-700/80 flex flex-col items-center gap-0.5 shadow-xl text-center">
                      <div className="flex items-center gap-1 text-[11px] sm:text-xs font-black text-white">
                        <span className="w-4 h-4 rounded-full bg-gradient-to-b from-amber-300 to-amber-600 text-slate-950 font-black text-[9px] flex items-center justify-center">
                          {monster.stars >= 3 ? 'L' : monster.stars === 2 ? 'R' : 'C'}
                        </span>
                        <span>{monster.nameAr.split(' ')[0]}</span>
                        <span className="text-amber-400 font-mono text-[10px]">Lvl {monster.level}</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-300">
                        {monster.element === 'fire' && '🔥 ناري'}
                        {monster.element === 'water' && '💧 مائي'}
                        {monster.element === 'earth' && '⛰️ أرضي'}
                        {monster.element === 'nature' && '🌿 طبيعي'}
                        {monster.element === 'thunder' && '⚡ رعدي'}
                        {monster.element === 'dark' && '🌑 ظلامي'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enemy 3 Monsters on Right (stepped depth formation) */}
              <div className="relative flex flex-col justify-around h-[360px] sm:h-[420px] items-end">
                {stageEnemyMonsters.map((monster, idx) => (
                  <div
                    key={idx}
                    className={`relative flex items-center flex-row-reverse gap-3 transition-transform ${
                      idx === 1 ? '-translate-x-6 sm:-translate-x-12 scale-105' : 'scale-95'
                    }`}
                  >
                    {/* Real Full Monster Figure with Breathing Idle */}
                    <motion.div
                      animate={{ y: [0, -6, 0], scaleY: [1, 1.02, 1] }}
                      transition={{ repeat: Infinity, duration: 2.8 + idx * 0.4, ease: 'easeInOut' }}
                      className="relative w-24 h-28 sm:w-32 sm:h-38 md:w-38 md:h-44 flex items-center justify-center -scale-x-100"
                    >
                      {/* Contact shadow on arena ground */}
                      <div className="absolute -bottom-2 w-20 sm:w-28 h-5 bg-black/60 rounded-full blur-xs pointer-events-none" />
                      <img
                        src={monster.avatar}
                        alt={monster.name}
                        className="w-full h-full object-contain filter drop-shadow-[0_12px_20px_rgba(0,0,0,0.85)]"
                      />
                    </motion.div>

                    {/* Monster Legends Nameplate Badge: (Rarity) Name Lvl X */}
                    <div className="bg-slate-950/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-700/80 flex flex-col items-center gap-0.5 shadow-xl text-center">
                      <div className="flex items-center gap-1 text-[11px] sm:text-xs font-black text-white">
                        <span className="w-4 h-4 rounded-full bg-gradient-to-b from-red-400 to-red-700 text-white font-black text-[9px] flex items-center justify-center">
                          {monster.stars >= 3 ? 'L' : monster.stars === 2 ? 'R' : 'C'}
                        </span>
                        <span>{monster.nameAr.split(' ')[0]}</span>
                        <span className="text-red-400 font-mono text-[10px]">Lvl {monster.level}</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-300">
                        {monster.element === 'fire' && '🔥 ناري'}
                        {monster.element === 'water' && '💧 مائي'}
                        {monster.element === 'earth' && '⛰️ أرضي'}
                        {monster.element === 'nature' && '🌿 طبيعي'}
                        {monster.element === 'thunder' && '⚡ رعدي'}
                        {monster.element === 'dark' && '🌑 ظلامي'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Action Command Bar (Exact buttons from Monster Legends: CHANGE TEAM & FIGHT!) */}
            <div className="relative z-10 flex items-center justify-center gap-4 pt-4 border-t border-slate-800/80">
              <button
                onClick={() => setIsTeamSelectorOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-sm rounded-2xl shadow-xl border border-cyan-400/50 transition-transform active:scale-95"
              >
                تعديل الفريق (CHANGE TEAM)
              </button>

              <button
                onClick={startActiveBattle}
                className="px-10 py-3.5 bg-gradient-to-r from-red-600 via-amber-500 to-yellow-500 hover:from-red-500 hover:to-yellow-400 text-slate-950 font-black text-base rounded-2xl shadow-[0_0_35px_rgba(245,158,11,0.8)] border border-yellow-300 transition-transform active:scale-95 flex items-center gap-2"
              >
                <Swords className="w-5 h-5 fill-current" />
                <span>بدء القتال! (FIGHT!)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 3: ACTIVE 3v3 REALISTIC BATTLE ARENA                      */}
      {/* ============================================================== */}
      {inActiveBattle && (
        <div className="flex flex-col gap-3">
          {/* Top Arena Header: Stage Name, Live Arena Switcher, Turn Queue, Speed & Auto */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-800 shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-white">{selectedStage.nameAr}</span>
              <button
                onClick={() => setIsArenaSelectorOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-[11px] font-bold border border-amber-500/30"
                title="تغيير ساحة المعركة الحالية"
              >
                <MapPin className="w-3 h-3 text-amber-400" />
                <span>الساحة: {currentArena.nameAr.split(' ')[0]}</span>
              </button>
            </div>

            {/* Dynamic Turn Order Queue Icons */}
            <div className="hidden md:flex items-center gap-1.5 bg-slate-950/70 px-3 py-1 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold ml-1">ترتيب الأدوار:</span>
              {turnQueue.slice(0, 5).map((bm, idx) => {
                const isActive = bm.monster.id === activeTurnMonsterId;
                return (
                  <div
                    key={bm.monster.id}
                    className={`relative w-6 h-6 rounded-full overflow-hidden border-2 transition-all ${
                      isActive
                        ? 'border-yellow-400 ring-2 ring-yellow-400/50 scale-110 z-10'
                        : bm.isAi
                        ? 'border-red-500/60 opacity-70'
                        : 'border-blue-500/60 opacity-70'
                    }`}
                    title={bm.monster.nameAr}
                  >
                    <img src={bm.monster.avatar} alt={bm.monster.name} className="w-full h-full object-cover" />
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              {/* Auto Battle */}
              <button
                onClick={() => setAutoBattle(!autoBattle)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
                  autoBattle
                    ? 'bg-red-500/20 border-red-500 text-red-300 ring-1 ring-red-500/50'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                {autoBattle ? 'تلقائي (AUTO ON)' : 'تلقائي (AUTO)'}
              </button>

              {/* Speed Toggle */}
              <button
                onClick={() => setBattleSpeed(battleSpeed === 1 ? 2 : battleSpeed === 2 ? 4 : 1)}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-amber-400"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>{battleSpeed}x</span>
              </button>

              {/* Surrender */}
              <button
                onClick={() => {
                  if (confirm('هل تريد الانسحاب من المعركة؟')) {
                    setInActiveBattle(false);
                  }
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold"
              >
                انسحاب
              </button>
            </div>
          </div>

          {/* REALISTIC BATTLEFIELD ARENA STAGE */}
          <div
            className={`relative w-full min-h-[500px] sm:min-h-[560px] md:min-h-[640px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col justify-between p-3 sm:p-5 md:p-6 transition-transform ${
              screenShake ? 'translate-x-2 -translate-y-2' : ''
            }`}
          >
            {/* Realistic Arena HD Backdrop */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-700 pointer-events-none"
              style={{ backgroundImage: `url('${currentArena.image}')` }}
            />
            {/* Subtle atmospheric gradient tint */}
            <div className={`absolute inset-0 bg-gradient-to-t ${currentArena.overlayTint} pointer-events-none`} />

            {/* Environmental Ambient Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {currentArena.ambientParticle === 'ember' && (
                <div className="absolute inset-0">
                  <div className="absolute bottom-10 left-1/4 w-2 h-2 rounded-full bg-amber-400 blur-xs animate-ping" />
                  <div className="absolute bottom-20 left-1/2 w-3 h-3 rounded-full bg-red-500 blur-xs animate-pulse" />
                  <div className="absolute bottom-16 right-1/3 w-2 h-2 rounded-full bg-yellow-300 blur-xs animate-bounce" />
                </div>
              )}
              {currentArena.ambientParticle === 'spark' && (
                <div className="absolute inset-0 opacity-40">
                  <div className="absolute top-10 left-1/3 w-1 h-8 bg-cyan-300 rotate-12 blur-xs animate-pulse" />
                  <div className="absolute top-20 right-1/4 w-1 h-6 bg-yellow-300 -rotate-12 blur-xs animate-ping" />
                </div>
              )}
            </div>

            {/* --- REALISTIC SPELL VFX OVERLAYS --- */}
            {/* Meteor Strike VFX */}
            {activeVfx?.key === 'attack_meteor_special' && (
              <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-red-950/80 mix-blend-multiply"
                />
                <motion.div
                  initial={{ x: -250, y: -250, scale: 0.4 }}
                  animate={{ x: 300, y: 160, scale: 1.5 }}
                  transition={{ duration: 0.45 / battleSpeed, ease: 'easeIn' }}
                  className="absolute top-8 left-16 w-48 h-48 rounded-full bg-radial from-yellow-200 via-amber-500 to-red-700 shadow-[0_0_120px_rgba(239,68,68,1)] flex items-center justify-center"
                >
                  <Flame className="w-28 h-28 text-yellow-100 animate-spin" />
                </motion.div>
              </div>
            )}

            {/* Thunder Strike VFX */}
            {activeVfx?.key === 'attack_thunder_strike' && (
              <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: [1, 0.4, 1, 0], scaleY: [1, 1, 1, 1] }}
                  transition={{ duration: 0.5 / battleSpeed }}
                  className="w-12 h-full bg-gradient-to-b from-white via-cyan-300 to-yellow-300 shadow-[0_0_100px_rgba(250,204,21,1)] blur-xs"
                />
              </div>
            )}

            {/* Water Surge Tidal Deluge VFX */}
            {activeVfx?.key === 'attack_water_surge' && (
              <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden flex items-center justify-center">
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: '100%', opacity: [0.3, 0.9, 0] }}
                  transition={{ duration: 0.55 / battleSpeed }}
                  className="h-32 bg-gradient-to-r from-transparent via-cyan-400 to-blue-600 blur-sm shadow-[0_0_80px_rgba(6,182,212,1)]"
                />
              </div>
            )}

            {/* Nature Vine Lash VFX */}
            {activeVfx?.key === 'attack_nature_vines' && (
              <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.2, rotate: -45 }}
                  animate={{ scale: [0.5, 1.4, 0], rotate: 45 }}
                  transition={{ duration: 0.45 / battleSpeed }}
                  className="w-64 h-64 border-4 border-dashed border-emerald-400 shadow-[0_0_60px_rgba(16,185,129,1)] rounded-full"
                />
              </div>
            )}

            {/* 3v3 REAL MONSTERS BATTLEFIELD (Authentic Stepped Depth Layout) */}
            <div className="relative z-10 w-full h-full my-auto grid grid-cols-2 gap-4 items-center min-h-[380px] sm:min-h-[440px]">
              {/* Player Team (Left side - 3 real animated monsters with contact shadows & runic discs) */}
              <div className="relative flex flex-col justify-around h-full py-2">
                {playerMonsters.map((bm, idx) => (
                  <div
                    key={bm.monster.id}
                    className={`relative transition-transform ${
                      idx === 1 ? 'translate-x-4 sm:translate-x-10 scale-105 z-20' : 'scale-95 z-10'
                    }`}
                  >
                    <MonsterBattleSprite
                      battleMonster={bm}
                      isCurrentTurn={bm.monster.id === activeTurnMonsterId}
                      isSelectedTarget={false}
                      isAttacking={bm.monster.id === attackingMonsterId}
                      isTakingHit={bm.monster.id === hitMonsterId}
                      onSelect={() => {}}
                      floatingTexts={floatingTexts.filter((ft) => ft.targetMonsterId === bm.monster.id)}
                    />
                  </div>
                ))}
              </div>

              {/* Enemy AI Team (Right side - 3 real animated monsters, tap to target) */}
              <div className="relative flex flex-col justify-around h-full py-2 items-end">
                {enemyMonsters.map((bm, idx) => (
                  <div
                    key={bm.monster.id}
                    className={`relative transition-transform ${
                      idx === 1 ? '-translate-x-4 sm:-translate-x-10 scale-105 z-20' : 'scale-95 z-10'
                    }`}
                  >
                    <MonsterBattleSprite
                      battleMonster={bm}
                      isCurrentTurn={bm.monster.id === activeTurnMonsterId}
                      isSelectedTarget={bm.monster.id === selectedTargetId}
                      isAttacking={bm.monster.id === attackingMonsterId}
                      isTakingHit={bm.monster.id === hitMonsterId}
                      onSelect={() => setSelectedTargetId(bm.monster.id)}
                      floatingTexts={floatingTexts.filter((ft) => ft.targetMonsterId === bm.monster.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Turn Action Control Deck (Player Skills Deck) */}
          <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-800 p-3 sm:p-4 md:p-5 flex flex-col gap-3 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">الوحش المهاجم الآن:</span>
                <span className="text-sm font-black text-amber-400">
                  {currentActiveMonster?.monster.nameAr || 'انتظار...'}
                </span>
                {!currentActiveMonster?.isAi && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-extrabold border border-emerald-500/30">
                    أنت المتحكم
                  </span>
                )}
              </div>

              {!currentActiveMonster?.isAi && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => currentActiveMonster && rechargeMonster(currentActiveMonster)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold transition-all"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>شحن الاستحمال (+45)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Skill Cards when player monster is active */}
            {!currentActiveMonster?.isAi ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {currentActiveMonster?.monster.skills.map((skill) => {
                  const cooldown = currentActiveMonster.skillCooldowns[skill.id] || 0;
                  const hasEnoughStamina = currentActiveMonster.currentStamina >= skill.staminaCost;
                  const isReady = cooldown === 0 && hasEnoughStamina;

                  // Target enemy type advantage check
                  const currentEnemyTarget =
                    enemyMonsters.find((m) => m.monster.id === selectedTargetId) ||
                    enemyMonsters.find((m) => !m.isDefeated);
                  const isAdvantage = currentEnemyTarget
                    ? (ELEMENT_ADVANTAGES[skill.element] || []).includes(currentEnemyTarget.monster.element)
                    : false;

                  return (
                    <button
                      key={skill.id}
                      onClick={() => {
                        setSelectedSkill(skill);
                        const target =
                          enemyMonsters.find((m) => m.monster.id === selectedTargetId) ||
                          enemyMonsters.find((m) => !m.isDefeated) ||
                          null;
                        executeSkill(currentActiveMonster, skill, target);
                      }}
                      disabled={!isReady}
                      className={`text-right p-3 rounded-xl border transition-all flex flex-col justify-between gap-1.5 ${
                        isReady
                          ? 'bg-slate-800/90 hover:bg-slate-750 border-slate-700 hover:border-amber-400 active:scale-98 shadow-md'
                          : 'bg-slate-950/60 border-slate-850 opacity-45 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs sm:text-sm text-white">{skill.nameAr}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                            ELEMENT_COLORS[skill.element].bg
                          } ${ELEMENT_COLORS[skill.element].text}`}
                        >
                          {skill.element.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {skill.descriptionAr}
                      </p>

                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 pt-1 border-t border-slate-750">
                        <span className="text-red-400">قوة: {skill.power}</span>
                        <span className="text-cyan-400">طاقة: {skill.staminaCost}</span>
                        {isAdvantage && (
                          <span className="text-amber-300 font-black animate-pulse">2.5x ضرر!</span>
                        )}
                        {cooldown > 0 && <span className="text-amber-400">انتظار: {cooldown}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-3 text-center text-xs text-slate-400 animate-pulse font-bold">
                الخصم يجهز لهجومه القادم...
              </div>
            )}
          </div>

          {/* Live Battle Combat Log */}
          <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-2.5 text-xs text-slate-400 flex flex-col gap-1 max-h-20 overflow-y-auto">
            <span className="font-bold text-slate-300 text-[11px]">سجل المعركة:</span>
            {battleLog.slice(0, 3).map((log, idx) => (
              <div key={idx} className="font-mono text-[10px] text-slate-400">
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
                      لقد هزمت فريق الخصم بنجاح في {currentArena.nameAr} وحصلت على مكافآت المرحلة.
                    </p>

                    <div className="w-full bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-around text-sm font-extrabold">
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-slate-400">ذهب</span>
                        <span className="text-amber-400">+{selectedStage.rewards.gold}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-slate-400">طعام</span>
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
                        setInspectingStage(null);
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
                        onClick={startActiveBattle}
                        className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors"
                      >
                        إعادة المحاولة
                      </button>
                      <button
                        onClick={() => {
                          setInActiveBattle(false);
                          setInspectingStage(null);
                          setBattleResult(null);
                        }}
                        className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                      >
                        العودة للمراحل
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: REALISTIC ARENA SELECTOR                              */}
      {/* ============================================================== */}
      {isArenaSelectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-black text-white">اختيار ساحة المعركة الواقعية</h3>
              </div>
              <button
                onClick={() => setIsArenaSelectorOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              اختر البيئة والساحة الواقعية التي ترغب بخوض المعارك فيها (تتغير الخلفية، الإضاءة، والمؤثرات الجوية فورياً):
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {REALISTIC_ARENAS.map((arena) => {
                const isSelected = arena.id === selectedArenaId;
                return (
                  <div
                    key={arena.id}
                    onClick={() => {
                      sound.playCoin();
                      setSelectedArenaId(arena.id);
                    }}
                    className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition-all flex flex-col ${
                      isSelected
                        ? 'border-amber-400 ring-4 ring-amber-400/40 shadow-xl scale-102'
                        : 'border-slate-800 hover:border-slate-600 opacity-80 hover:opacity-100'
                    }`}
                  >
                    {/* Arena Image Thumbnail */}
                    <div className="relative h-28 w-full bg-slate-950">
                      <img
                        src={arena.image}
                        alt={arena.nameAr}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>الساحة النشطة</span>
                        </div>
                      )}
                    </div>

                    {/* Arena Details */}
                    <div className="p-3 bg-slate-950/90 flex flex-col justify-between flex-1 gap-1.5">
                      <div>
                        <h4 className="text-xs font-black text-white">{arena.nameAr}</h4>
                        <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                          {arena.subtitleAr}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsArenaSelectorOpen(false)}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-md"
              >
                تأكيد واختيار الساحة
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: TEAM SELECTOR (CHANGE TEAM)                           */}
      {/* ============================================================== */}
      {isTeamSelectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-black text-white">تعديل تشكيلة المعركة (3 وحوش)</h3>
              </div>
              <button
                onClick={() => setIsTeamSelectorOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              اختر حتى 3 من وحوشك لخوض المعارك بها ({selectedPlayerMonsterIds.length}/3 محدد):
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {playerState.monsters.map((monster) => {
                const isSelected = selectedPlayerMonsterIds.includes(monster.id);
                const elemColor = ELEMENT_COLORS[monster.element] || ELEMENT_COLORS.fire;

                return (
                  <div
                    key={monster.id}
                    onClick={() => {
                      sound.playCoin();
                      toggleMonsterInTeam(monster.id);
                    }}
                    className={`cursor-pointer rounded-2xl p-3 border-2 transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/30 ring-2 ring-cyan-400/40 shadow-lg'
                        : 'border-slate-800 bg-slate-950/80 hover:border-slate-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 flex-shrink-0">
                      <img src={monster.avatar} alt={monster.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex flex-col flex-1 gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white">{monster.nameAr.split(' ')[0]}</span>
                        <span className="text-amber-400 font-mono text-[11px] font-bold">Lv.{monster.level}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className={`px-1.5 py-0.2 rounded font-bold ${elemColor.bg} ${elemColor.text}`}>
                          {monster.element.toUpperCase()}
                        </span>
                        <span>{monster.maxHp} HP</span>
                        <span>{monster.attack} هجوم</span>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                        isSelected ? 'bg-cyan-500 border-cyan-300 text-slate-950' : 'border-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsTeamSelectorOpen(false)}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black rounded-xl text-xs shadow-md"
              >
                تأكيد التشكيلة
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
