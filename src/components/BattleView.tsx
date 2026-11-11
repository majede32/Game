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
  calculateMonsterRuneBonuses,
  MULTIPLAYER_LEAGUES,
  generateMultiplayerOpponents,
  SimulatedOpponent,
  FACTION_COLOSSEUMS,
  ColosseumTier,
  RUNE_CONFIGS,
  createRuneInstance,
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
  Crown,
  Award,
  Star,
  Compass,
  Target,
  RefreshCw,
  Gift,
} from 'lucide-react';
import { MonsterBattleSprite } from './MonsterBattleSprite';
import { BattlePrepScreen } from './battle/BattlePrepScreen';
import { BattleCombatArena } from './battle/BattleCombatArena';
import { BattleResultsModal } from './battle/BattleResultsModal';
import { TeamSelectorModal } from './battle/TeamSelectorModal';
import { ArenaSelectorModal } from './battle/ArenaSelectorModal';

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
  // Navigation & Screen Modes ('campaign' | 'multiplayer' | 'colosseum')
  const [activeBattleMode, setActiveBattleMode] = useState<'campaign' | 'multiplayer' | 'colosseum'>('campaign');
  const [selectedStage, setSelectedStage] = useState<BattleStage>(CAMPAIGN_STAGES[0]);
  const [inspectingStage, setInspectingStage] = useState<BattleStage | null>(null);
  const [inActiveBattle, setInActiveBattle] = useState<boolean>(false);

  // Multiplayer League State
  const [multiplayerOpponents, setMultiplayerOpponents] = useState<SimulatedOpponent[]>(() =>
    generateMultiplayerOpponents(playerState.trophies || 1080)
  );
  const [activeOpponent, setActiveOpponent] = useState<SimulatedOpponent | null>(null);

  // Colosseum State
  const [selectedColosseumTierId, setSelectedColosseumTierId] = useState<string>('stone_colosseum');
  const [selectedColosseumNode, setSelectedColosseumNode] = useState<number>(1);

  // Rewards tracking for victory popup
  const [lastEarnedRewards, setLastEarnedRewards] = useState<{
    gold: number;
    food: number;
    xp: number;
    gems: number;
    trophies?: number;
    runeRewardName?: string;
  } | null>(null);

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
  const startActiveBattle = (
    modeOverride?: 'campaign' | 'multiplayer' | 'colosseum',
    overrideEnemies?: { speciesId: string; level: number }[],
    overrideTitle?: string
  ) => {
    const mode = modeOverride || activeBattleMode;
    const stage = inspectingStage || selectedStage;
    if (mode === 'campaign') {
      setSelectedStage(stage);
    }

    // 1. Calculate team speed bonus from equipped team speed runes
    let teamSpeedBonus = 0;
    currentTeamMonsters.forEach((m) => {
      const b = calculateMonsterRuneBonuses(m);
      teamSpeedBonus += b.teamSpeedFlatBonus;
    });

    // 2. Build player combat team with rune enhancements
    const pCombat: BattleMonster[] = currentTeamMonsters.map((m, idx) => {
      const b = calculateMonsterRuneBonuses(m);
      const boostedHp = Math.round(m.maxHp * (1 + b.hpBonusPercent / 100));
      const boostedAttack = Math.round(m.attack * (1 + b.attackBonusPercent / 100));
      const boostedSpeed = m.speed + b.speedFlatBonus + teamSpeedBonus;

      const monsterCopy = JSON.parse(JSON.stringify(m));
      monsterCopy.maxHp = boostedHp;
      monsterCopy.currentHp = boostedHp;
      monsterCopy.attack = boostedAttack;
      monsterCopy.speed = boostedSpeed;

      return {
        monster: monsterCopy,
        isAi: false,
        position: idx,
        currentHp: boostedHp,
        currentStamina: m.maxStamina,
        skillCooldowns: {},
        statusEffects: [],
        isDefeated: false,
      };
    });

    // 3. Build enemy combat team based on mode
    let enemyDefs: { speciesId: string; level: number }[] = [];
    let battleTitle = '';

    if (mode === 'multiplayer' && activeOpponent) {
      enemyDefs = activeOpponent.monsters;
      battleTitle = `دوري الكؤوس ضد ${activeOpponent.name}`;
    } else if (mode === 'colosseum') {
      const tier = FACTION_COLOSSEUMS.find((t) => t.id === selectedColosseumTierId) || FACTION_COLOSSEUMS[0];
      const baseLvl = selectedColosseumTierId === 'stone_colosseum' ? 12 : selectedColosseumTierId === 'bronze_colosseum' ? 24 : 38;
      const nodeLvl = baseLvl + selectedColosseumNode * 2;

      const pool = Object.values(SPECIES_CATALOG).filter((s) => tier.allowedRarities.includes(s.rarity));
      const chosenPool = pool.length >= 3 ? pool : Object.values(SPECIES_CATALOG);

      enemyDefs = [
        { speciesId: chosenPool[0].speciesId, level: nodeLvl },
        { speciesId: chosenPool[1 % chosenPool.length].speciesId, level: nodeLvl + 1 },
        { speciesId: chosenPool[2 % chosenPool.length].speciesId, level: nodeLvl },
      ];
      battleTitle = `${tier.nameAr} - الجولة ${selectedColosseumNode}`;
    } else {
      enemyDefs = overrideEnemies || stage.enemies;
      battleTitle = overrideTitle || stage.nameAr;
    }

    const eCombat: BattleMonster[] = enemyDefs.map((enemySpec, idx) => {
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
    setBattleLog([`بدأت معركة ${battleTitle} في ${currentArena.nameAr}! جهّز وحوشك.`]);

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

  // Ambient environmental audio based on active arena
  useEffect(() => {
    if (inActiveBattle) {
      sound.playArenaAmbience(selectedArenaId);
    } else {
      sound.stopArenaAmbience();
    }
    return () => {
      sound.stopArenaAmbience();
    };
  }, [inActiveBattle, selectedArenaId]);

  // Handle victory rewards and distribute XP
  const handleVictoryRewards = () => {
    let earnedGold = 0;
    let earnedFood = 0;
    let earnedXp = 0;
    let earnedGems = 0;
    let earnedTrophies = 0;
    let runeName: string | undefined = undefined;

    let updatedTrophies = playerState.trophies || 1080;
    let updatedLeague = playerState.league || 'Bronze';
    let updatedCompletedStages = playerState.completedStages;
    const updatedRunes = [...(playerState.runesInventory || [])];
    const updatedColosseumScores = { ...(playerState.colosseumScores || {}) };

    if (activeBattleMode === 'multiplayer' && activeOpponent) {
      earnedTrophies = activeOpponent.rewardTrophies;
      updatedTrophies += earnedTrophies;

      // Determine league based on trophies
      if (updatedTrophies >= 4000) updatedLeague = 'Legendary';
      else if (updatedTrophies >= 3000) updatedLeague = 'Champion';
      else if (updatedTrophies >= 2000) updatedLeague = 'Gold';
      else if (updatedTrophies >= 1200) updatedLeague = 'Silver';
      else updatedLeague = 'Bronze';

      const tierCfg = MULTIPLAYER_LEAGUES.find((l) => l.id === updatedLeague) || MULTIPLAYER_LEAGUES[0];
      earnedGold = tierCfg.chestRewards.gold;
      earnedFood = tierCfg.chestRewards.food;
      earnedGems = tierCfg.chestRewards.gems;
      earnedXp = 800;

      // Award a rune from the victory chest
      const runeTypes: ('life' | 'strength' | 'speed' | 'team_speed')[] = ['life', 'strength', 'speed', 'team_speed'];
      const randomType = runeTypes[Math.floor(Math.random() * runeTypes.length)];
      const rewardRune = createRuneInstance(randomType, tierCfg.chestRewards.runeTier);
      updatedRunes.push(rewardRune);
      runeName = rewardRune.nameAr;

      // Refresh simulated opponents
      setMultiplayerOpponents(generateMultiplayerOpponents(updatedTrophies));
    } else if (activeBattleMode === 'colosseum') {
      const tier = FACTION_COLOSSEUMS.find((t) => t.id === selectedColosseumTierId) || FACTION_COLOSSEUMS[0];
      earnedGold = Math.round(tier.baseRewardGold * (1 + (selectedColosseumNode - 1) * 0.3));
      earnedFood = Math.round(earnedGold * 0.7);
      earnedXp = 1200;
      earnedGems = 15;

      const nodeScore = selectedColosseumNode * 1500;
      updatedColosseumScores[tier.id] = (updatedColosseumScores[tier.id] || 0) + nodeScore;

      // Random Tier 2 Rune
      const runeTypes: ('life' | 'strength' | 'speed' | 'team_speed')[] = ['life', 'strength', 'speed', 'team_speed'];
      const rewardRune = createRuneInstance(runeTypes[Math.floor(Math.random() * runeTypes.length)], 2);
      updatedRunes.push(rewardRune);
      runeName = rewardRune.nameAr;
    } else {
      // Campaign mode
      earnedGold = selectedStage.rewards.gold;
      earnedFood = selectedStage.rewards.food;
      earnedXp = selectedStage.rewards.xp;
      earnedGems = Math.random() < selectedStage.rewards.gemChance ? 5 : 0;
      updatedCompletedStages = Math.max(playerState.completedStages, selectedStage.id);
    }

    setLastEarnedRewards({
      gold: earnedGold,
      food: earnedFood,
      xp: earnedXp,
      gems: earnedGems,
      trophies: earnedTrophies > 0 ? earnedTrophies : undefined,
      runeRewardName: runeName,
    });

    const updatedState: PlayerState = {
      ...playerState,
      gold: playerState.gold + earnedGold,
      food: playerState.food + earnedFood,
      gems: playerState.gems + earnedGems,
      xp: playerState.xp + earnedXp,
      trophies: updatedTrophies,
      league: updatedLeague,
      completedStages: updatedCompletedStages,
      runesInventory: updatedRunes,
      colosseumScores: updatedColosseumScores,
    };

    updatedState.monsters = updatedState.monsters.map((m) => {
      const wasInTeam = playerMonsters.some((pm) => pm.monster.id === m.id);
      if (wasInTeam) {
        let newXp = m.xp + earnedXp;
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
        <div className="flex flex-col gap-5">
          {/* Main Battle Mode Header */}
          <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-slate-800 p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
                <Swords className="w-4 h-4" />
                <span>حلبات ومعارك MONSTERR (Monster Legends 3v3 Master Combat)</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white">
                اختر ساحة ونمط المعركة
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                معارك 3 ضد 3 بتأثيرات 10 عناصر، تعويذات رونز مجهزة، ودوريات كؤوس للمتصدرين.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button
                onClick={() => setIsArenaSelectorOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-amber-300 rounded-xl text-xs font-bold border border-amber-500/30 transition shadow-sm"
              >
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>الساحة: {currentArena.nameAr.split(' ')[0]}</span>
              </button>

              <button
                onClick={() => setIsTeamSelectorOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 rounded-xl text-xs font-bold border border-cyan-500/30 transition shadow-sm"
              >
                <Users className="w-4 h-4 text-cyan-400" />
                <span>تشكيلة الفريق ({selectedPlayerMonsterIds.length}/3)</span>
              </button>

              <button
                onClick={onReturnToIsland}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition"
              >
                <span>الجزيرة</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3 Battle Modes Tabs */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 p-1.5 bg-slate-950/80 border border-slate-800 rounded-2xl">
            <button
              onClick={() => setActiveBattleMode('campaign')}
              className={`py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 ${
                activeBattleMode === 'campaign'
                  ? 'bg-amber-500 text-slate-950 shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span className="truncate">خريطة المغامرة (Adventure)</span>
            </button>

            <button
              onClick={() => setActiveBattleMode('multiplayer')}
              className={`py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 ${
                activeBattleMode === 'multiplayer'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              <span className="truncate">دوري الكؤوس (Multiplayer)</span>
            </button>

            <button
              onClick={() => setActiveBattleMode('colosseum')}
              className={`py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 ${
                activeBattleMode === 'colosseum'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span className="truncate">كولوسيوم الفصائل (Colosseum)</span>
            </button>
          </div>

          {/* TAB 1: CAMPAIGN / ADVENTURE MAP */}
          {activeBattleMode === 'campaign' && (
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
                        <span className="text-[11px] font-mono text-amber-400 font-bold">
                          {stage.subtitle}
                        </span>
                        <h3 className="text-base font-extrabold text-white mt-0.5">
                          {stage.nameAr}
                        </h3>
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
          )}

          {/* TAB 2: MULTIPLAYER LEAGUES (دوري الكؤوس) */}
          {activeBattleMode === 'multiplayer' && (
            <div className="flex flex-col gap-6">
              {/* Player League Header Card */}
              {(() => {
                const curTrophies = playerState.trophies || 1080;
                const curLeagueTier =
                  MULTIPLAYER_LEAGUES.find((l) => l.id === (playerState.league || 'Bronze')) ||
                  MULTIPLAYER_LEAGUES[0];

                const nextTierIdx = MULTIPLAYER_LEAGUES.findIndex((l) => l.id === curLeagueTier.id) + 1;
                const nextTier = MULTIPLAYER_LEAGUES[nextTierIdx];

                return (
                  <div
                    className={`p-5 rounded-3xl border border-slate-700 bg-gradient-to-r ${curLeagueTier.badgeBg} shadow-2xl flex flex-col md:flex-row items-center justify-between gap-5`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-5xl">{curLeagueTier.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs uppercase tracking-wider font-extrabold text-amber-300">
                            الدوري التنافسي الحالي
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-black bg-black/40 text-white border border-white/20">
                            {curLeagueTier.nameAr}
                          </span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black text-white mt-1 flex items-center gap-2">
                          <span>{curTrophies}</span>
                          <span className="text-amber-400 text-lg sm:text-xl">🏆 كأس (Trophies)</span>
                        </h3>
                        <p className="text-xs text-slate-200 mt-1">
                          كل فوز يمنحك +30 كأس وصندوق جوائز دوري يحتوي ذهب، جواهر، وتعويذات رونز!
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-2 bg-black/40 p-4 rounded-2xl border border-white/10 w-full md:w-auto">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                        <Gift className="w-4 h-4 text-amber-400" />
                        <span>مكافآت صندوق النصر:</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-200">
                        <span>💰 +{curLeagueTier.chestRewards.gold} ذهب</span>
                        <span>💎 +{curLeagueTier.chestRewards.gems} جواهر</span>
                        <span>✨ رون Lv.{curLeagueTier.chestRewards.runeTier}</span>
                      </div>
                      {nextTier && (
                        <span className="text-[11px] text-slate-400 mt-1">
                          الدوري القادم ({nextTier.nameAr}) يبدأ عند {nextTier.minTrophies} كأس
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Opponents Section */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-red-400" />
                    <span>الخصوم المنافسون في الدوري (Matched Opponents):</span>
                  </h3>
                  <button
                    onClick={() =>
                      setMultiplayerOpponents(
                        generateMultiplayerOpponents(playerState.trophies || 1080)
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>تحديث الخصوم</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {multiplayerOpponents.map((opp) => (
                    <div
                      key={opp.id}
                      className="bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-4 shadow-xl flex flex-col justify-between gap-4 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-black text-sm text-white">{opp.name}</h4>
                          <span className="text-xs text-amber-400 font-bold flex items-center gap-1 mt-0.5">
                            🏆 {opp.trophies} كأس
                          </span>
                        </div>
                        <span className="px-2 py-1 rounded-lg text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          +{opp.rewardTrophies} كؤوس
                        </span>
                      </div>

                      {/* Opponent Defense Squad */}
                      <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 font-bold block mb-2">
                          تشكيلة الدفاع للخصم:
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          {opp.monsters.map((m, idx) => {
                            const spec = SPECIES_CATALOG[m.speciesId] || SPECIES_CATALOG.pyrodrake;
                            return (
                              <div
                                key={idx}
                                className="flex flex-col items-center p-1.5 bg-slate-900 rounded-lg border border-slate-800"
                              >
                                <img
                                  src={spec.avatar}
                                  alt={spec.nameAr}
                                  className="w-11 h-11 rounded-lg object-cover border border-slate-700 mb-1"
                                />
                                <span className="text-[10px] font-bold text-white truncate max-w-full">
                                  {spec.nameAr.split(' ')[0]}
                                </span>
                                <span className="text-[9px] text-amber-400 font-bold">
                                  Lv.{m.level}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setActiveOpponent(opp);
                          startActiveBattle('multiplayer', opp.monsters, `دوري الكؤوس ضد ${opp.name}`);
                        }}
                        className="w-full py-2.5 rounded-xl font-black text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md flex items-center justify-center gap-2 transition active:scale-95"
                      >
                        <Swords className="w-4 h-4 text-amber-300" />
                        <span>هجوم (Attack)!</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FACTION COLOSSEUM (كولوسيوم الفصائل حسب الندرة) */}
          {activeBattleMode === 'colosseum' && (
            <div className="flex flex-col gap-6">
              {/* Colosseum Tiers selector */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {FACTION_COLOSSEUMS.map((tier) => {
                  const isSelected = selectedColosseumTierId === tier.id;
                  const score = playerState.colosseumScores?.[tier.id] || 0;

                  // Check if player's team satisfies rarity restriction
                  const isTeamEligible = currentTeamMonsters.every((m) =>
                    tier.allowedRarities.includes(m.rarity)
                  );

                  return (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedColosseumTierId(tier.id)}
                      className={`cursor-pointer p-5 rounded-3xl border transition-all flex flex-col justify-between gap-4 ${
                        isSelected
                          ? `bg-gradient-to-b ${tier.gradient} border-amber-500 shadow-2xl ring-2 ring-amber-500/40`
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-3xl">{tier.icon}</span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-black bg-black/40 text-amber-400 border border-white/10">
                            نقاطك: {score}
                          </span>
                        </div>

                        <h4 className="text-lg font-black text-white mt-2">{tier.nameAr}</h4>
                        <p className="text-xs text-amber-300 font-bold">{tier.subtitleAr}</p>
                        <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                          {tier.descriptionAr}
                        </p>
                      </div>

                      {/* Rarity & Eligibility badge */}
                      <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          الندرة: {tier.allowedRarities.join(', ')}
                        </span>
                        {isTeamEligible ? (
                          <span className="text-[10px] font-black text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded">
                            فريقك مؤهل ✅
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-red-300 bg-red-950/60 border border-red-500/40 px-2 py-0.5 rounded">
                            وحوش غير مؤهلة ⚠️
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Challenge Nodes for selected Colosseum */}
              {(() => {
                const tier =
                  FACTION_COLOSSEUMS.find((t) => t.id === selectedColosseumTierId) ||
                  FACTION_COLOSSEUMS[0];
                const isTeamEligible = currentTeamMonsters.every((m) =>
                  tier.allowedRarities.includes(m.rarity)
                );

                return (
                  <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="text-base font-black text-white">
                          جولات {tier.nameAr} (Nodes 1-5):
                        </h4>
                        <p className="text-xs text-slate-400">
                          كل جولة ترفع قوة الخصوم وتضاعف مكافآت الذهب والجواهر ورونز المستوى المتقدم.
                        </p>
                      </div>

                      {!isTeamEligible && (
                        <button
                          onClick={() => setIsTeamSelectorOpen(true)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition"
                        >
                          عدّل فريقك ليتوافق مع الندرة ({tier.allowedRarities.join('/')})
                        </button>
                      )}
                    </div>

                    {/* Nodes row */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {[1, 2, 3, 4, 5].map((node) => {
                        const isSelected = selectedColosseumNode === node;
                        return (
                          <button
                            key={node}
                            onClick={() => setSelectedColosseumNode(node)}
                            className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                              isSelected
                                ? 'bg-purple-600/30 border-purple-500 text-white shadow-lg'
                                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <span className="text-xs font-black text-amber-400">
                              الجولة {node}
                            </span>
                            <span className="text-sm font-black text-white">
                              +{node * 1500} نقطة
                            </span>
                            <span className="text-[10px] text-slate-400">
                              صعوبة {node === 5 ? 'زعيم الحلبة' : `مستوى ${12 + node * 3}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => startActiveBattle('colosseum')}
                      disabled={!isTeamEligible}
                      className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition ${
                        isTeamEligible
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Swords className="w-5 h-5 text-amber-300" />
                      <span>
                        {isTeamEligible
                          ? `دخول الجولة ${selectedColosseumNode} في ${tier.nameAr}`
                          : 'الفريق الحالي غير مطابق لشروط ندرة الحلبة'}
                      </span>
                    </button>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 2: TEAM PREPARATION & STAGE PREVIEW (Monster Legends UI)  */}
      {/* ============================================================== */}
      {inspectingStage && !inActiveBattle && (
        <BattlePrepScreen
          stageTitle={inspectingStage.nameAr}
          stageSubtitle={`${inspectingStage.subtitle} · صعوبة ${inspectingStage.difficulty}`}
          currentArena={currentArena}
          playerTeam={currentTeamMonsters}
          enemyTeam={stageEnemyMonsters}
          onStartFight={() => startActiveBattle()}
          onChangeTeam={() => setIsTeamSelectorOpen(true)}
          onOpenArenaSelector={() => setIsArenaSelectorOpen(true)}
          onClose={() => setInspectingStage(null)}
        />
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

                    <div className="w-full bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-3">
                      <div className="grid grid-cols-3 gap-2 text-center text-xs font-black">
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block mb-0.5">ذهب</span>
                          <span className="text-amber-400">
                            +{lastEarnedRewards?.gold || selectedStage.rewards.gold}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block mb-0.5">طعام</span>
                          <span className="text-emerald-400">
                            +{lastEarnedRewards?.food || selectedStage.rewards.food}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block mb-0.5">خبرة XP</span>
                          <span className="text-purple-400">
                            +{lastEarnedRewards?.xp || selectedStage.rewards.xp}
                          </span>
                        </div>
                      </div>

                      {lastEarnedRewards?.trophies && (
                        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-blue-950/60 border border-blue-500/40 text-xs font-black text-blue-300">
                          <span>كؤوس الدوري المكتسبة:</span>
                          <span className="text-amber-300">+{lastEarnedRewards.trophies} 🏆</span>
                        </div>
                      )}

                      {lastEarnedRewards?.runeRewardName && (
                        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-purple-950/60 border border-purple-500/40 text-xs font-black text-purple-300">
                          <span>صندوق النصر (تعويذة رون):</span>
                          <span className="text-amber-300">✨ {lastEarnedRewards.runeRewardName}</span>
                        </div>
                      )}
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
                        onClick={() => startActiveBattle()}
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
        <ArenaSelectorModal
          selectedArenaId={selectedArenaId}
          onSelectArena={(arenaId) => {
            sound.playCoin();
            setSelectedArenaId(arenaId);
          }}
          onClose={() => setIsArenaSelectorOpen(false)}
        />
      )}

      {/* ============================================================== */}
      {/* MODAL 2: TEAM SELECTOR (CHANGE TEAM)                           */}
      {/* ============================================================== */}
      {isTeamSelectorOpen && (
        <TeamSelectorModal
          monsters={playerState.monsters}
          selectedMonsterIds={selectedPlayerMonsterIds}
          onToggleMonster={(monsterId) => {
            sound.playCoin();
            toggleMonsterInTeam(monsterId);
          }}
          onClose={() => setIsTeamSelectorOpen(false)}
        />
      )}
    </div>
  );
};
