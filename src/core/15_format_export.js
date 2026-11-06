  // ==== src/core/15_format_export.js — Форматирование чисел и экспорт API ядра (Core) ====
  // ---------- форматирование чисел ----------
  // Большие числа: K, M, B, T, дальше буквы aa, ab … az, ba … (решение пользователя).
  // Три значащие цифры, отбрасываем лишнее вниз, чтобы не показывать больше, чем есть.
  const SHORT = ['', 'K', 'M', 'B', 'T'];
  function suffix(tier) {
    if (tier < SHORT.length) return SHORT[tier];
    let i = tier - SHORT.length, len = 2;
    while (i >= Math.pow(26, len)) { i -= Math.pow(26, len); len++; }   // aa…zz, затем aaa…zzz и т. д.
    let out = '';
    for (let k = 0; k < len; k++) { out = String.fromCharCode(97 + i % 26) + out; i = Math.floor(i / 26); }
    return out;
  }
  // 0.55 (ответ 18): запись чисел — 'short' (1.5K, 2.3aa…) или 'sci' (1.5e12); переключается в настройках
  let numMode = 'short';
  function setNumMode(m) { numMode = m === 'sci' ? 'sci' : 'short'; return numMode; }
  function sci(n) {
    const neg = B.sign(n) < 0, l = B.log10(n), e = Math.floor(l + 1e-12), m = Math.pow(10, l - e);
    return (neg ? '-' : '') + (Math.floor(m * 100 + 1e-9) / 100).toFixed(2).replace(/\.?0+$/, '') + 'e' + e;
  }
  function fmt(n) {
    if (numMode === 'sci' && B.sign(n) !== 0 && (n instanceof Big || (isFinite(n) && Math.abs(n) >= 1e6))) return sci(n);
    if (n instanceof Big) {
      if (n.m < 0) return '-' + fmt(B.neg(n));
      const tier = Math.floor(n.e / 3), v = n.m * Math.pow(10, n.e - tier * 3);
      const dec = v < 10 ? 2 : v < 100 ? 1 : 0, k = Math.pow(10, dec);
      let txt = (Math.floor(v * k + 1e-9) / k).toFixed(dec);
      if (dec) txt = txt.replace(/\.?0+$/, '');
      return txt + suffix(tier);
    }
    if (!isFinite(n)) return '∞';
    const neg = n < 0; n = Math.abs(n);
    if (n < 1000) return (neg ? '-' : '') + Math.floor(n);
    let tier = Math.floor(Math.log10(n) / 3);
    let v = n / Math.pow(10, tier * 3);
    if (v >= 1000) { tier++; v /= 1000; }          // защита от погрешности log10
    if (v < 1) { tier--; v *= 1000; }
    const dec = v < 10 ? 2 : v < 100 ? 1 : 0;
    const k = Math.pow(10, dec);
    let txt = (Math.floor(v * k + 1e-9) / k).toFixed(dec);
    if (dec) txt = txt.replace(/\.?0+$/, '');
    return (neg ? '-' : '') + txt + suffix(tier);
  }


  const Core = {
    B, Big, CONFIG, newState, tap, tick, challengeBoss, goToFloor, buyTap,
    buyAlly, chainList, chainOwned, chainNext, buyChainHero, allyDps, allyDpsAt, autoDps, allyCost, allyMax,
    tapDamageAt, milestoneMultAt, milestonesReached, nextMilestone,
    damageMult, critChance, critMult, softcap,
    trialRecord, trialSync, useAbility, setAbilityAuto, abilityUnlocked, abilityReady,
    soulMult, permMult, goldMult, bossTime, hasHeroAuto, artLevel, artPower, tapHit, expectedDps,
    marketGood, soulsPerMega, marketSync, marketAmount, marketPrice, marketBuy, marketRefresh,
    findCost, findArtifact, shopOffers, shopBuy, shopRefresh, shopBuyCost, shopRefreshCost, shopFound, upgradeArtCost, upgradeArtifact, foundCount, previewSpend,
    canRitual, ritualStartFloor, ritualSouls, ritual, ritualStartGold,
    runeKind, runeValue, bestRune, runePower, createRune, runeUpCost, upgradeRune, mergeable, mergeRunes,
    totemCount, totemMult, totemUpCost, upgradeTotem, bossDmgMult, shardMult,
    treeDef, treeLevel, treePower, branchOpen, treeNodeOpen, treeCost, buyTreeNode,
    setLock, sacrifice, sacrificeValue, needsRareConfirm, selectAllUnlocked, tearOfPortal, heroTrace, traceCost,
    summon, rarityOpen, bannerDef, featuredHeroes, bannerPity, bannerCost, canSummon, starUp, starCost, starFodder, fodderHave, canStar, starMult, evoMult, heroMult, evoCost, canEvolve, evolve, forgeHeart, shardsForBoss, heartsForFloor, bossMaterials, squadAdd, squadRemove, inSquad, contribDps, reserveDps, ticketsForFloor,
    unlockedAt, perkMult, capAt, rankCount, ritualMilestone, setTitle, titlePower, allTitles, roleOf, isFav, toggleFav, heroList, savePreset, loadPreset, claimEverything, equipBestAll, levelBest, nowAffordable, setNumMode, bondActive, activeBonds, bondPower, bondsOf, echoInfo, echoSync, curseMod, curseOffer, acceptCurse, declineCurse, potionDef, potionMult, potionCost, brewPotion, towerMilestones, nextTowerMs, towerMsList, diaryNames, loreLevel, secretFloor, isSecretFloor, secretFind, secretReward, transferPreview, transferProgress, rankCapForEvo, prestigeXp, prestigeNeed, prestigeLevel, prestigeFrames, claimPrestige, setFrame, trophyKey, trophyName, allTrophies, trophyBonus, trophyPower, grantTrophy, tapCap, allyCap, rankCost, canRankUp, rankUp, rankLabel, maxSteps,
    tapDamage, upgradeCost, maxAffordable, enemyMaxHp, killGold, firstClearGold,
    offlineDps, offlineProgress,
    petDef, petLevel, petForm, petPower, petShare, petBonus, petEvoCost, petFrags, canEvolvePet, evolvePet, grantPet, petsCatchUp, lairRank, lairPet, lairSync, keeperRoll, setPet, recallPet, petHit, petDps, squadRawDps,
    boneSlot, boneValue, equippedOn, bonePower, boneMult, rollBone, equipBone, unequipBone, boneUpCost, upgradeBone,
    gradeCost, gradeUpBone, setBoneLock, recycleValue, recycleBones,
    classDef, classNodeOpen, classPower, classUnlocked, classPoints, classFree, canChangeClass, chooseClass, buyClassNode,
    boosterUnlocked, boosterMult, boosterWait, moveBooster,
    eventFor, eventReset, currentEvent, eventBuff, buyEventItem, shopLeft, eventDungeonReward, inboxAdd, claimInbox, claimInboxAll,
    seasonInfo, seasonReset, passLevel, passReward, claimPass, claimPassAll, setPremium, expectedPassLevel, catchupAvailable, useCatchup,
    trailStep, trailProgress, claimTrail, seasonHeroCost, buySeasonHero,
    collectionSets, collectionMult, collectionAllyMult,
    achDef, achValue, achTier, achClaimable, achPoints, achMult, claimAch, claimAllAch, achClaimableCount,
    questsReset, questProgress, questDone, questClaimable, claimQuest, claimAll, claimableCount, questDef,
    dailyReset, attemptsLeft, maxDungeonTier, dungeonReward, personalBosses, personalReward, enterMode, leaveMode,
    floorSteps, biomeOf, biomeName, hallOf, biomeCycle, isFinalBoss, isBiomeStart, rollRare, rareDef,
    ultDesc, perkList,
    dailyClaimedCount, questChestReady, openQuestChest, questChestsReady,
    loginDayIndex, loginAvailable, claimLogin, travelCost, timeTravel,
    serialize, deserialize, fmt,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = Core;
  else root.Core = Core;
})(this);
