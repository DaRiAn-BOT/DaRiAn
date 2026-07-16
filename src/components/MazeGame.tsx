import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createMaze, type Point } from "../lib/maze";
import { armors, shields, weapons, type InventoryItem } from "../lib/equipment";
import BossBattle from "./BossBattle";
import BackpackMenu from "./BackpackMenu";
import MazeBoard from "./MazeBoard";
import MainMenu from "./MainMenu";
import GameOver from "./GameOver";
import { startExplorationMusic, startMusic, stopMusic } from "../lib/music";
import { loadProgress, saveProgress } from "../lib/saveGame";
import { sounds } from "../lib/sounds";
import { storyClues } from "../lib/story";
import {
  emptyStats,
  loadLifetimeStats,
  saveLifetimeStats,
  type GameStats,
  type LifetimeStats,
} from "../lib/statistics";
import StatisticsScreen from "./StatisticsScreen";
import { useMazeControls } from "./useMazeControls";
import ControlsScreen from "./ControlsScreen";
import SoundSettings from "./SoundSettings";
import AchievementsScreen from "./AchievementsScreen";
import AchievementToast from "./AchievementToast";
import { useAchievements } from "./useAchievements";
import { TOTAL_LEVELS } from "../lib/gameConfig";
import { supabase } from "../lib/supabase";
import AccountScreen from "./AccountScreen";
import OpeningCutscene from "./OpeningCutscene";
import SkinSelection from "./SkinSelection";
import DeviceSelection from "./DeviceSelection";
import ShopScreen from "./ShopScreen";
import { claimDailyEcho } from "../lib/dailyReward";
import { loadNickname, NICKNAME_EVENT } from "../lib/playerProfile";
import {
  chasePlayer,
  createMiniMonsters,
  MINI_MONSTER_DAMAGE,
  type MiniMonster,
} from "../lib/miniMonsters";

type Screen =
  | "start"
  | "account"
  | "statistics"
  | "achievements"
  | "controls"
  | "sound"
  | "shop"
  | "device-select"
  | "skin-select"
  | "intro"
  | "maze"
  | "clue"
  | "battle"
  | "upgrade"
  | "backpack"
  | "lost"
  | "won";
const equipmentLevels = [5, 7, 10, 14, 15, 20];

export default function MazeGame() {
  const saved = useMemo(loadProgress, []);
  const [clues, setClues] = useState(saved?.clues ?? 0);
  const [attackDamage, setAttackDamage] = useState(saved?.attackDamage ?? 1.5);
  const [cameraMode, setCameraMode] = useState<2 | 3>(
    saved?.cameraMode === 2 ? 2 : 3,
  );
  const [weaponLevel, setWeaponLevel] = useState(saved?.weaponLevel ?? 0);
  const [shieldLevel, setShieldLevel] = useState(saved?.shieldLevel ?? 0);
  const [armorLevel, setArmorLevel] = useState(saved?.armorLevel ?? 0);
  const [lootFound, setLootFound] = useState(saved?.lootFound ?? false);
  const [potionFound, setPotionFound] = useState(saved?.potionFound ?? false);
  const [potions, setPotions] = useState(saved?.potions ?? 0);
  const [sealShards, setSealShards] = useState(saved?.sealShards ?? 0);
  const [dailyReward, setDailyReward] = useState(0);
  const [selectedSkin, setSelectedSkin] = useState(saved?.selectedSkin ?? 0);
  const [controlMode, setControlMode] = useState<'computer' | 'phone'>(saved?.controlMode ?? 'computer');
  const [fullscreenActive, setFullscreenActive] = useState(false);
  const [facing] = useState<"up" | "down" | "left" | "right">("down");
  const [walkStep, setWalkStep] = useState(false);
  const [mazeAttacking, setMazeAttacking] = useState(false);
  const [hitMonsterId, setHitMonsterId] = useState<number | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>(
    saved?.inventory ?? [
      { kind: "weapon", level: 0 },
      { kind: "shield", level: 0 },
      { kind: "armor", level: 0 },
    ],
  );
  const maze = useMemo(() => createMaze(clues + 1), [clues]);
  const [monsters, setMonsters] = useState<MiniMonster[]>(
    saved?.monsters ?? createMiniMonsters(maze, clues + 1),
  );
  const monstersRef = useRef(monsters);
  const mazeMaxHp = 100 + clues * 2.5;
  const [mazeHp, setMazeHp] = useState(saved?.mazeHp ?? mazeMaxHp);
  const safeSavedPlayer = getSafePoint(maze, saved?.player);
  const [player, setPlayer] = useState<Point>(safeSavedPlayer);
  const playerRef = useRef(player);
  const [checkpoint, setCheckpoint] = useState<Point>(
    getSafePoint(maze, saved?.checkpoint ?? safeSavedPlayer),
  );
  const [screen, setScreen] = useState<Screen>(
    () => screenFromPath(saved?.active ?? false),
  );
  const [battleBackpackOpen, setBattleBackpackOpen] = useState(false);
  const [runStarted, setRunStarted] = useState(saved?.active ?? false);
  const [hasLost, setHasLost] = useState(saved?.hasLost ?? false);
  const [stats, setStats] = useState<GameStats>(saved?.stats ?? emptyStats);
  const [lifetimeStats, setLifetimeStats] = useState<LifetimeStats>(() =>
    loadLifetimeStats(saved?.stats),
  );
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [accountNickname, setAccountNickname] = useState<string | null>(
    loadNickname,
  );
  const { achievements, unlock, notification } = useAchievements(
    saved?.achievements ?? [],
    stats,
  );
  const bossNumber = clues + 1;
  const monsterInRange = monsters.some((enemy) => Math.abs(enemy.x - player.x) + Math.abs(enemy.y - player.y) === 1);
  const addStat = useCallback((key: keyof GameStats) => {
    setStats((current) => ({ ...current, [key]: current[key] + 1 }));
    setLifetimeStats((current) => ({ ...current, [key]: current[key] + 1 }));
  }, []);

  useEffect(() => saveLifetimeStats(lifetimeStats), [lifetimeStats]);
  useEffect(() => {
    const reward = claimDailyEcho();
    if (!reward) return;
    setSealShards((value) => value + reward);
    setDailyReward(reward);
    const timer = window.setTimeout(() => setDailyReward(0), 4500);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => { monstersRef.current = monsters; }, [monsters]);
  useEffect(() => { playerRef.current = player; }, [player]);
  useEffect(() => {
    const detectFullscreen = () => setFullscreenActive(Boolean(document.fullscreenElement) || Math.abs(window.innerHeight - window.screen.height) < 5);
    detectFullscreen();
    document.addEventListener('fullscreenchange', detectFullscreen);
    window.addEventListener('resize', detectFullscreen);
    return () => { document.removeEventListener('fullscreenchange', detectFullscreen); window.removeEventListener('resize', detectFullscreen); };
  }, []);
  useEffect(() => {
    const path = pathForScreen(screen);
    if (window.location.pathname !== path) window.history.pushState({ screen }, "", path);
    document.title = titleForScreen(screen);
  }, [screen]);
  useEffect(() => {
    const openBrowserPage = () => setScreen(screenFromPath(runStarted));
    window.addEventListener("popstate", openBrowserPage);
    return () => window.removeEventListener("popstate", openBrowserPage);
  }, [runStarted]);
  useEffect(() => {
    const setAccount = (email?: string, nickname?: unknown) => {
      setAccountEmail(email ?? null);
      setAccountNickname(
        typeof nickname === "string" && nickname ? nickname : loadNickname(),
      );
    };
    void supabase.auth
      .getUser()
      .then(({ data }) =>
        setAccount(data.user?.email, data.user?.user_metadata.nickname),
      );
    const { data } = supabase.auth.onAuthStateChange((_event, session) =>
      setAccount(session?.user.email, session?.user.user_metadata.nickname),
    );
    const updateNickname = (event: Event) =>
      setAccountNickname((event as CustomEvent<string>).detail);
    window.addEventListener(NICKNAME_EVENT, updateNickname);
    return () => {
      data.subscription.unsubscribe();
      window.removeEventListener(NICKNAME_EVENT, updateNickname);
    };
  }, []);

  useEffect(() => {
    saveProgress({
      active: runStarted,
      clues,
      attackDamage,
      cameraMode,
      cameraAngle: 0,
      weaponLevel,
      shieldLevel,
      armorLevel,
      lootFound,
      selectedSkin,
      facing,
      inventory,
      player: screen === "battle" || screen === "clue" ? checkpoint : player,
      checkpoint,
      achievements,
      hasLost,
      stats,
      monsters,
      mazeHp,
      potionFound,
      potions,
      controlMode,
      sealShards,
    });
  }, [
    achievements,
    armorLevel,
    attackDamage,
    cameraMode,
    controlMode,
    sealShards,
    checkpoint,
    clues,
    facing,
    hasLost,
    inventory,
    lootFound,
    mazeHp,
    monsters,
    player,
    potionFound,
    potions,
    runStarted,
    screen,
    selectedSkin,
    shieldLevel,
    stats,
    weaponLevel,
  ]);

  useEffect(() => {
    if (!runStarted || screen === "start" || screen === "statistics") return;
    const timer = window.setInterval(() => addStat("seconds"), 1000);
    return () => window.clearInterval(timer);
  }, [addStat, runStarted, screen]);

  useEffect(() => {
    if (screen !== "maze" || !monsters.length) return;
    const moveTimer = window.setInterval(() => {
      setMonsters((current) => {
        const moved = chasePlayer(current, playerRef.current, maze.cells);
        monstersRef.current = moved;
        return moved;
      });
    }, controlMode === "phone" ? 900 : 500);
    return () => window.clearInterval(moveTimer);
  }, [controlMode, maze.cells, monsters.length, screen]);

  useEffect(() => {
    if (screen !== "maze" || !monsters.length) return;
    const attackers = monsters.filter(
      (enemy) => enemy.hp > 0 && Math.abs(enemy.x - player.x) + Math.abs(enemy.y - player.y) === 1,
    ).length;
    if (!attackers) return;
    const attackerSnapshot = monsters
      .filter((enemy) => enemy.hp > 0 && Math.abs(enemy.x - player.x) + Math.abs(enemy.y - player.y) === 1)
      .map((enemy) => `${enemy.id}:${enemy.x}:${enemy.y}`)
      .join('|');
    const timer = window.setTimeout(() => {
      const currentPlayer = playerRef.current;
      const currentAttackers = monstersRef.current.filter(
        (enemy) => enemy.hp > 0 && Math.abs(enemy.x - currentPlayer.x) + Math.abs(enemy.y - currentPlayer.y) === 1,
      );
      const currentSnapshot = currentAttackers.map((enemy) => `${enemy.id}:${enemy.x}:${enemy.y}`).join('|');
      if (!currentAttackers.length || currentSnapshot !== attackerSnapshot) return;
      sounds.hit();
      setMazeHp((health) => {
        const healthAfterHit = Math.max(0, health - currentAttackers.length * MINI_MONSTER_DAMAGE);
        if (healthAfterHit > 0) return healthAfterHit;
        playerRef.current = checkpoint;
        setPlayer(checkpoint);
        const respawned = createMiniMonsters(maze, clues + 1);
        monstersRef.current = respawned;
        setMonsters(respawned);
        return mazeMaxHp;
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [checkpoint, clues, maze, mazeHp, mazeMaxHp, monsters, player, screen]);

  useEffect(() => {
    if (!saved?.active) return;
    const resumeMusic = () => {
      startExplorationMusic();
      window.removeEventListener("keydown", resumeMusic);
      window.removeEventListener("pointerdown", resumeMusic);
    };
    window.addEventListener("keydown", resumeMusic, { once: true });
    window.addEventListener("pointerdown", resumeMusic, {
      once: true,
      capture: true,
    });
    return () => {
      window.removeEventListener("keydown", resumeMusic);
      window.removeEventListener("pointerdown", resumeMusic, true);
    };
  }, [saved]);

  const move = useCallback(
    (dx: number, dy: number) => {
      if (screen !== "maze") return;
      setPlayer((current) => {
        const next = { x: current.x + dx, y: current.y + dy };
        if (!maze.cells[next.y]?.[next.x]) return current;
        const monster = monsters.find(
          (enemy) => enemy.x === next.x && enemy.y === next.y,
        );
        if (monster) {
          return current;
        }
        sounds.step();
        addStat("steps");
        setWalkStep((step) => !step);
        if (!potionFound && maze.potion.x === next.x && maze.potion.y === next.y) {
          sounds.pickup();
          setPotions((count) => count + 1);
          setPotionFound(true);
        }
        if (!lootFound && maze.loot?.x === next.x && maze.loot.y === next.y) {
          sounds.pickup();
          addStat("items");
          const currentLevel =
            maze.loot.kind === "weapon"
              ? weaponLevel
              : maze.loot.kind === "shield"
                ? shieldLevel
                : armorLevel;
          const maxLevel = 2;
          const item = {
            kind: maze.loot.kind,
            level: Math.min(currentLevel + 1, maxLevel),
          };
          if (item.kind === "weapon") setWeaponLevel(item.level);
          else if (item.kind === "shield") setShieldLevel(item.level);
          else setArmorLevel(item.level);
          setInventory((items) =>
            items.some(
              (saved) => saved.kind === item.kind && saved.level === item.level,
            )
              ? items
              : [...items, item],
          );
          setLootFound(true);
          setScreen("upgrade");
        }
        if (next.x === maze.clue.x && next.y === maze.clue.y) {
          setCheckpoint(current);
          setScreen("clue");
        }
        playerRef.current = next;
        return next;
      });
    },
    [
      addStat,
      armorLevel,
      attackDamage,
      lootFound,
      maze,
      monsters,
      mazeMaxHp,
      mazeHp,
      potionFound,
      screen,
      shieldLevel,
      weaponLevel,
    ],
  );

  const attackMonster = useCallback(() => {
    if (screen !== "maze") return;
    sounds.attack();
    setMazeAttacking(true);
    window.setTimeout(() => setMazeAttacking(false), 420);
    const currentPlayer = playerRef.current;
    const target = monstersRef.current.find((enemy) => enemy.hp > 0 && Math.abs(enemy.x - currentPlayer.x) + Math.abs(enemy.y - currentPlayer.y) === 1);
    if (!target) return;
    setHitMonsterId(target.id);
    window.setTimeout(() => setHitMonsterId(null), 420);
    addStat("attacks");
    const damage = attackDamage + weaponLevel * 0.5;
    setMonsters((enemies) => {
      const damaged = enemies.flatMap((enemy) => enemy.id !== target.id ? [enemy] : enemy.hp <= damage ? [] : [{ ...enemy, hp: Math.round((enemy.hp - damage) * 10) / 10 }]);
      monstersRef.current = damaged;
      return damaged;
    });
  }, [addStat, attackDamage, monsters, player, screen, weaponLevel]);

  useMazeControls({ screen, move, attack: attackMonster, setScreen, setCameraMode });

  const winBattle = (shieldOnly: boolean) => {
    addStat("bosses");
    setSealShards((value) => value + 7);
    if (shieldOnly) unlock("shield_only");
    if (hasLost) unlock("comeback");
    if (bossNumber === TOTAL_LEVELS) {
      setLifetimeStats((current) => ({
        ...current,
        victories: current.victories + 1,
      }));
      unlock("conqueror");
      if (stats.seconds < 30 * 60) unlock("speedrunner");
      if (!hasLost) unlock("no_defeats");
      if (weaponLevel === 0 && shieldLevel === 0 && armorLevel === 0)
        unlock("weak_gear");
      setClues(TOTAL_LEVELS);
      setRunStarted(false);
      stopMusic();
      setScreen("won");
      return;
    }
    const nextMaze = createMaze(bossNumber + 1);
    setClues(bossNumber);
    setPlayer(nextMaze.start);
    setCheckpoint(nextMaze.start);
    setLootFound(false);
    setPotionFound(false);
    setMonsters(createMiniMonsters(nextMaze, bossNumber + 1));
    setMazeHp(100 + bossNumber * 2.5);
    setAttackDamage((current) => Math.round((current + 0.3) * 10) / 10);
    setScreen("maze");
  };
  const restart = () => {
    const first = createMaze(1);
    stopMusic();
    setLifetimeStats((current) => ({ ...current, games: current.games + 1 }));
    setRunStarted(true);
    setHasLost(false);
    setStats({ ...emptyStats });
    setClues(0);
    setAttackDamage(1.5);
    setWeaponLevel(0);
    setShieldLevel(0);
    setArmorLevel(0);
    setInventory([
      { kind: "weapon", level: 0 },
      { kind: "shield", level: 0 },
      { kind: "armor", level: 0 },
    ]);
    setLootFound(false);
    setPotionFound(false);
    setPotions(0);
    setMazeHp(100);
    setMonsters(createMiniMonsters(first, 1));
    setPlayer(first.start);
    setCheckpoint(first.start);
    setScreen("device-select");
  };
  const exitGame = () => {
    stopMusic();
    if (screen !== "maze") setPlayer(checkpoint);
    setScreen("start");
  };
  const continueGame = () => {
    startExplorationMusic();
    setScreen("maze");
  };
  const showGameOver = () => {
    setHasLost(true);
    addStat("defeats");
    startMusic();
    setScreen("lost");
  };
  const retryBattle = () => {
    startExplorationMusic();
    setScreen("battle");
  };
  const recordAction = (action: "attack" | "shield") =>
    addStat(action === "attack" ? "attacks" : "shields");
  const equip = (item: InventoryItem) => {
    if (item.kind === "weapon") setWeaponLevel(item.level);
    else if (item.kind === "shield") setShieldLevel(item.level);
    else setArmorLevel(item.level);
  };
  const buyShopItem = (offer: InventoryItem & { price: number }) => {
    if (sealShards < offer.price || inventory.some((item) => item.kind === offer.kind && item.level === offer.level)) return;
    sounds.pickup(); setSealShards((value) => value - offer.price); setInventory((items) => [...items, { kind: offer.kind, level: offer.level }]);
  };
  const usePotion = () => {
    if (potions < 1 || mazeHp >= mazeMaxHp) return;
    sounds.pickup();
    setPotions((count) => count - 1);
    setMazeHp((health) => Math.min(mazeMaxHp, health + 50));
  };

  useEffect(() => {
    if (screen !== "battle") return;
    const toggleBattleBackpack = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key !== "e" && key !== "у") return;
      event.preventDefault(); sounds.menu(); setBattleBackpackOpen((open) => !open);
    };
    window.addEventListener("keydown", toggleBattleBackpack);
    return () => window.removeEventListener("keydown", toggleBattleBackpack);
  }, [screen]);

  useEffect(() => {
    if (screen !== "clue") return;
    const enterBattle = (event: KeyboardEvent) => { if (event.code === "Enter") { event.preventDefault(); setScreen("battle"); } };
    window.addEventListener("keydown", enterBattle);
    return () => window.removeEventListener("keydown", enterBattle);
  }, [screen]);

  useEffect(() => {
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.code !== "Escape" || screen === "start") return;
      event.preventDefault();
      sounds.menu();
      if (battleBackpackOpen) { setBattleBackpackOpen(false); return; }
      if (screen === "backpack") {
        setScreen("maze");
        return;
      }
      stopMusic();
      if (screen !== "maze") setPlayer(checkpoint);
      setScreen("start");
    };
    window.addEventListener("keydown", closeWithEscape);
    return () => window.removeEventListener("keydown", closeWithEscape);
  }, [battleBackpackOpen, checkpoint, screen]);

  return (
    <section className={`game-shell ${controlMode === "phone" ? "phone-controls" : "computer-controls"} ${fullscreenActive && controlMode === 'computer' ? 'hide-cursor' : ''}`}>
      {screen !== "device-select" && <button className="fullscreen-toggle" onClick={() => void toggleFullscreen(controlMode)} aria-label="Переключить полноэкранный режим">⛶</button>}
      {![
        "start",
        "account",
        "statistics",
        "achievements",
        "controls",
        "sound",
        "device-select",
        "skin-select",
        "intro",
        "won",
      ].includes(screen) && (
        <button
          className="exit-game"
          onClick={exitGame}
          aria-label="Выйти в главное меню"
        >
          ×
        </button>
      )}
      <header>
        <div>
          <p className="eyebrow">
            ПРИКЛЮЧЕНИЕ ·{" "}
            {accountNickname ?? (accountEmail ? "Игрок" : "Гость")}
          </p>
          <h1>Тайны лабиринта</h1>
        </div>
        <div className="counter">
          <strong>{clues}</strong>
          <span>/ {TOTAL_LEVELS} подсказок</span>
        </div>
      </header>
      <div className="progress">
        <i style={{ width: `${(clues / TOTAL_LEVELS) * 100}%` }} />
      </div>
      {screen === "maze" && (
        <>
          <div className="checkpoint">
            ◆ {accountNickname ?? (accountEmail ? "Игрок" : "Гость")} · Чекпоинт
            сохранён · Страж {bossNumber}
          </div>
          <MazeBoard
            level={bossNumber}
            maze={maze}
            player={player}
            playerName={accountNickname ?? (accountEmail ? "Игрок" : "Гость")}
            playerHp={mazeHp}
            playerMaxHp={mazeMaxHp}
            checkpoint={checkpoint}
            monsters={monsters}
            cameraMode={cameraMode}
            lootFound={lootFound}
            potionFound={potionFound}
            skin={selectedSkin}
            facing={facing}
            walkStep={walkStep}
            attackAnimation={mazeAttacking}
            hitMonsterId={hitMonsterId}
            onMove={move}
          />
          {controlMode === "phone" && <button className="phone-backpack" onClick={() => setScreen("backpack")}>РЮКЗАК</button>}
          <button className={`maze-attack-button ${monsterInRange ? "enemy-near" : ""}`} onClick={attackMonster}>
            <span className="attack-icon" aria-hidden="true">⚔</span>
            <span className="attack-copy"><strong>АТАКОВАТЬ</strong><small>{monsterInRange ? "ВРАГ В ЗОНЕ УДАРА" : "БЛИЖНИЙ УДАР"}</small></span>
            <kbd>ПРОБЕЛ</kbd>
          </button>
          <p className={`attack-status ${monsterInRange ? "danger" : ""}`}>
            {monsterInRange ? "ВРАГ РЯДОМ — ЖМИ ПРОБЕЛ!" : "Подойди к монстру на соседнюю клетку и нажми пробел"}
          </p>
        </>
      )}
      {screen === "battle" && (
        <><BossBattle
          key={bossNumber}
          number={bossNumber}
          attackDamage={attackDamage}
          heroStartHp={mazeHp}
          heroMaxHp={100 + clues * 2.5}
          weaponLevel={weaponLevel}
          shieldLevel={shieldLevel}
          armorLevel={armorLevel}
          skin={selectedSkin}
          onAction={recordAction}
          onHeroHealthChange={setMazeHp}
          onWin={winBattle}
          onLose={showGameOver}
        />
        <button className="battle-backpack-button" onClick={() => setBattleBackpackOpen(true)}>РЮКЗАК · E / У</button>
        {battleBackpackOpen && <div className="battle-backpack-overlay"><BackpackMenu items={inventory} potions={potions} health={mazeHp} maxHealth={mazeMaxHp} equipped={{ weapon: weaponLevel, shield: shieldLevel, armor: armorLevel }} onEquip={equip} onUsePotion={usePotion} onClose={() => setBattleBackpackOpen(false)} /></div>}
        </>
      )}
      {screen === "clue" && (
        <Overlay
          className="clue-overlay"
          icon="?"
          title={`Подсказка ${bossNumber} найдена`}
          text={`${storyClues[bossNumber - 1]}${equipmentLevels.includes(bossNumber + 1) ? " На следующем уровне в одном из тупиков тебя что-то ждёт." : ""}`}
          button="Приготовиться к бою"
          onClick={() => setScreen("battle")}
        />
      )}
      {screen === "upgrade" && (
        <Overlay
          icon={
            maze.loot?.kind === "weapon"
              ? "⚔"
              : maze.loot?.kind === "armor"
                ? "♟"
                : "◆"
          }
          title="Снаряжение найдено!"
          text={
            maze.loot?.kind === "weapon"
              ? `${weapons[weaponLevel].name}: ${weapons[weaponLevel].effect}`
              : maze.loot?.kind === "armor"
                ? `${armors[armorLevel].name}: ${armors[armorLevel].effect}`
                : `${shields[shieldLevel].name}: ${shields[shieldLevel].effect}`
          }
          button="Продолжить путь"
          onClick={() => setScreen("maze")}
        />
      )}
      {screen === "backpack" && (
        <BackpackMenu
          items={inventory}
          potions={potions}
          health={mazeHp}
          maxHealth={mazeMaxHp}
          equipped={{
            weapon: weaponLevel,
            shield: shieldLevel,
            armor: armorLevel,
          }}
          onEquip={equip}
          onUsePotion={usePotion}
          onClose={() => setScreen("maze")}
        />
      )}
      {screen === "start" && (
        <MainMenu
          canContinue={runStarted}
          accountEmail={accountEmail}
          sealShards={sealShards}
          onStart={() => (accountEmail ? restart() : setScreen("account"))}
          onContinue={continueGame}
          onAchievements={() => setScreen("achievements")}
          onShop={() => setScreen("shop")}
          onStats={() => setScreen("statistics")}
          onSound={() => setScreen("sound")}
          onAccount={() => setScreen("account")}
        />
      )}
      {screen === "shop" && <ShopScreen level={bossNumber} shards={sealShards} inventory={inventory} onBuy={buyShopItem} onClose={() => setScreen("start")} />}
      {screen === "account" && (
        <AccountScreen
          email={accountEmail}
          nickname={accountNickname}
          onNicknameChange={setAccountNickname}
          onClose={() => setScreen("start")}
          onGuest={restart}
        />
      )}
      {screen === "achievements" && (
        <AchievementsScreen
          unlocked={achievements}
          onClose={() => setScreen("start")}
        />
      )}
      {screen === "statistics" && (
        <StatisticsScreen
          stats={stats}
          lifetime={lifetimeStats}
          onClose={() => setScreen("start")}
        />
      )}
      {screen === "controls" && (
        <ControlsScreen onClose={() => setScreen("start")} />
      )}
      {screen === "sound" && (
        <SoundSettings
          onClose={() => setScreen("start")}
          onControls={() => setScreen("controls")}
        />
      )}
      {screen === "intro" && (
        <OpeningCutscene onFinish={() => { startExplorationMusic(); setScreen("maze"); }} />
      )}
      {screen === "device-select" && (
        <DeviceSelection onComputer={() => { setControlMode('computer'); setScreen('skin-select'); }} onPhone={() => { setControlMode('phone'); void enableLandscapeMode(); setScreen('skin-select'); }} />
      )}
      {screen === "skin-select" && (
        <SkinSelection selectedSkin={selectedSkin} onSelect={setSelectedSkin} onConfirm={() => setScreen("intro")} />
      )}
      {notification && <AchievementToast achievement={notification} />}
      {dailyReward > 0 && <div className="daily-reward-toast" role="status"><i>◈</i><span><small>ЕЖЕДНЕВНАЯ НАГРАДА</small><strong>+{dailyReward} Эха Лабиринта</strong></span></div>}
      {screen === "lost" && (
        <GameOver
          bossNumber={bossNumber}
          onRetry={retryBattle}
          onExit={exitGame}
        />
      )}
      {screen === "won" && (
        <Overlay
          icon="♛"
          title="Лабиринт пройден!"
          text={`Все ${TOTAL_LEVELS} подсказок найдены, а Король Лабиринта побеждён. Игра завершена!`}
          button="Начать заново"
          onClick={restart}
        />
      )}
      {screen === "maze" && (
        <p className="hint"><strong>ПРОБЕЛ — АТАКОВАТЬ</strong> · E / У — рюкзак · Q / Й — переключить камеру</p>
      )}
    </section>
  );
}

function Overlay({
  className = "",
  icon,
  title,
  text,
  button,
  onClick,
}: {
  className?: string;
  icon: string;
  title: string;
  text: string;
  button: string;
  onClick: () => void;
}) {
  return (
    <div className={`story-card ${className}`}>
      <span>{icon}</span>
      <h2>{title}</h2>
      <p>{text}</p>
      <button onClick={onClick}>{button}</button>
    </div>
  );
}

function getSafePoint(
  maze: ReturnType<typeof createMaze>,
  point?: Point,
): Point {
  return point && maze.cells[point.y]?.[point.x] ? point : maze.start;
}

async function enableLandscapeMode() {
  try {
    const element = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };
    if (!document.fullscreenElement) {
      if (element.requestFullscreen) await element.requestFullscreen();
      else await element.webkitRequestFullscreen?.();
    }
  } catch { /* Fullscreen может быть запрещён. */ }
  try {
    const orientation = screen.orientation as ScreenOrientation & { lock?: (mode: "landscape") => Promise<void> };
    await orientation.lock?.("landscape");
  } catch { /* Используется CSS-поворот ниже. */ }
}

async function toggleFullscreen(mode: 'computer' | 'phone') {
  if (document.fullscreenElement) { await document.exitFullscreen(); return; }
  if (mode === 'phone') await enableLandscapeMode();
  else try { await document.documentElement.requestFullscreen(); } catch { /* Запрос отклонён браузером. */ }
}

function pathForScreen(screen: Screen) {
  if (screen === 'start') return '/';
  if (screen === 'sound') return '/settings';
  if (screen === 'account') return '/account';
  if (screen === 'achievements') return '/achievements';
  if (screen === 'statistics') return '/statistics';
  if (screen === 'controls') return '/controls';
  if (screen === 'shop') return '/shop';
  return '/play';
}

function screenFromPath(hasSave: boolean): Screen {
  const pages: Record<string, Screen> = { '/settings': 'sound', '/account': 'account', '/achievements': 'achievements', '/statistics': 'statistics', '/controls': 'controls', '/shop': 'shop' };
  if (pages[window.location.pathname]) return pages[window.location.pathname];
  if (window.location.pathname === '/play') return hasSave ? 'maze' : 'start';
  return hasSave ? 'maze' : 'start';
}

function titleForScreen(screen: Screen) {
  const names: Partial<Record<Screen, string>> = { start: 'Тайны лабиринта', sound: 'Настройки', account: 'Аккаунт', achievements: 'Достижения', statistics: 'Статистика', controls: 'Управление', shop: 'Лавка между стен' };
  return `${names[screen] ?? 'Лабиринт'} — Тайны лабиринта`;
}
