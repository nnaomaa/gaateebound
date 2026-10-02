const pulseCanvas = document.getElementById("menuPulse");
const pulseCtx = pulseCanvas.getContext("2d");

function resizePulse() {
    pulseCanvas.width = window.innerWidth;
    pulseCanvas.height = window.innerHeight;
}
resizePulse();
window.addEventListener("resize", resizePulse);

let pulseTime = 0;

function drawMenuPulse() {
    pulseTime += 0.011;

    let w = pulseCanvas.width;
    let h = pulseCanvas.height;

    pulseCtx.clearRect(0, 0, w, h);

    let radius = Math.min(w, h) * 0.55;
    let pulse = 0.5 + Math.sin(pulseTime) * 0.5;

    let gradient = pulseCtx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, radius);
    gradient.addColorStop(0,   "rgba(119, 48, 186, " + (0.14 + pulse * 0.14) + ")");
    gradient.addColorStop(0.4, "rgba(119, 40, 200, " + (0.12 + pulse * 0.12) + ")");
    gradient.addColorStop(1,   "rgba(119, 40, 200, 0.12)");

    pulseCtx.fillStyle = gradient;
    pulseCtx.fillRect(0, 0, w, h);

    requestAnimationFrame(drawMenuPulse);
}

drawMenuPulse();

let musicStarted = false;

document.addEventListener('click', function() {
    if (!musicStarted) {
        musicStarted = true;
        menuMusic.play();
    }
});

const menuMusic = new Audio('darkaria_menumusic.mp3');
menuMusic.volume = 0.3;

menuMusic.addEventListener('ended', function() {
    setTimeout(function() { menuMusic.play(); }, 4000);
});

const popSound     = new Audio('System - Pop Up Sound Effect _ Solo leveling.mp3');
const achieveSound = new Audio('achieved-detail.mp3');

let playClass     = "";
window.storedRank = "";

const weaponsForHumans = [
    {
        name: "Kaska's Venom Fang",
        weaponType: "Dagger",
        ability: "Paralyze and Bleed",
        desc: "Paralyze: Prevents a target from moving for ? seconds. Bleed: Causes a target to lose 1% of their health every second for 10 seconds."
    },
    {
        name: "Demon King's Longsword",
        weaponType: "Longsword",
        ability: "Storm of White Flames",
        abilityDesc: "Summons a miniature lightning storm within a certain area and activates automatically whenever the sword is swung",
    },
    {
        name: "Vulcan's Tremor Hammer",
        weaponType: "WarHammer",
        ability: "Magma Fissure",
        abilityDesc: "On activation, this ability triggers a forward attack that deals damage that burns, and slows the enemy."
    },
];

const powers = [
    { name: 'Promethean 🔥', description: 'Wield the primordial fire that birthed civilization. A class designed for overwhelming destruction, turning the battlefield into a scorched wasteland.' },
    { name: 'Cryo ❄️',      description: 'Harness the absolute stillness of the void. A tactical class focused on freezing enemies in their tracks and shattering them with calculated strikes.' },
    { name: 'Overclock ⚡',  description: 'Push your neural links beyond the safety threshold. Command high-frequency electricity to move faster than the eye can follow and strike with ionizing force.' },
    { name: 'Miasma 🧪',    description: 'The breath of decay made manifest. Surround yourself with toxic vapors that erode the armor and life-force of any who dare stand within your presence.' },
];

function howToPlay() {
    document.getElementById("menu-screen").classList.remove("active");
    document.getElementById("howToPlayScreen").classList.add("active");
}

function closeHowToPlay() {
    document.getElementById("howToPlayScreen").classList.remove("active");
    document.getElementById("menu-screen").classList.add("active");
}

// ══════════════════════════════════════════════════════════════
//  CHARACTER SLOTS (3 saves in localStorage)
// ══════════════════════════════════════════════════════════════
const SAVE_PREFIX = 'gatebound_slot_';
const SLOT_COUNT  = 3;
let currentSlot = null;
let loadedSave  = null;

function readSlot(i) {
    try {
        let raw = localStorage.getItem(SAVE_PREFIX + i);
        return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
}

function openSlots() {
    document.getElementById('menu-screen').classList.remove('active');
    document.getElementById('slotScreen').classList.add('active');
    renderSlots();
}

function closeSlots() {
    document.getElementById('slotScreen').classList.remove('active');
    document.getElementById('menu-screen').classList.add('active');
}

function makeEl(tag, cls, text) {
    let e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
}

function renderSlots() {
    let list = document.getElementById('slotList');
    list.innerHTML = '';
    for (let i = 0; i < SLOT_COUNT; i++) {
        let d = readSlot(i);
        let card = makeEl('div', 'slot-card' + (d ? '' : ' empty'));
        let info = makeEl('div', 'slot-info');

        if (d) {
            info.appendChild(makeEl('div', 'slot-name', d.name));
            info.appendChild(makeEl('div', 'slot-meta', d.playClass.toUpperCase() + '  •  ' + d.rank + '-RANK  •  LV. ' + d.level));
        } else {
            info.appendChild(makeEl('div', 'slot-name', 'EMPTY SLOT ' + (i + 1)));
            info.appendChild(makeEl('div', 'slot-meta', 'Create a new character'));
        }
        card.appendChild(info);

        let btns = makeEl('div', 'slot-btns');
        let play = makeEl('button', 'slot-btn', d ? 'CONTINUE' : 'NEW GAME');
        play.addEventListener('click', (function(n) { return function() { selectSlot(n); }; })(i));
        btns.appendChild(play);

        if (d) {
            let del = makeEl('button', 'slot-btn slot-del', 'DELETE');
            del.addEventListener('click', (function(n) {
                return function() {
                    if (confirm('Delete this character permanently?')) {
                        localStorage.removeItem(SAVE_PREFIX + n);
                        renderSlots();
                    }
                };
            })(i));
            btns.appendChild(del);
        }
        card.appendChild(btns);
        list.appendChild(card);
    }
}

function selectSlot(i) {
    currentSlot = i;
    let d = readSlot(i);

    if (!d) {                       // new character -> normal intro flow
        loadedSave = null;
        playGame();
        return;
    }

    loadedSave        = d;          // existing character -> straight into the world
    playClass         = d.playClass;
    window.storedRank = d.rank;

    menuMusic.pause();
    menuMusic.currentTime = 0;
    document.body.style.backgroundColor = 'black';
    document.getElementById('menuPulse').classList.add('hidden');
    document.getElementById('slotScreen').classList.remove('active');

    let screenGame = document.getElementById('screenGame');
    screenGame.classList.add('active');
    screenGame.style.opacity    = '0';
    screenGame.style.transition = 'opacity 1.5s ease';
    setTimeout(function() {
        screenGame.style.opacity = '1';
        startGame();
    }, 100);
}

function playGame() {
    menuMusic.pause();
    menuMusic.currentTime = 0;
    document.body.style.backgroundColor = 'black';

    setTimeout(function() {
        let menuScreen = document.getElementById("menu-screen");
        let menuIntro  = document.getElementById("menu-intro");
        menuScreen.classList.remove('active');
        document.getElementById('slotScreen').classList.remove('active');
        menuIntro.classList.add('active');

        let awakeningWords = document.getElementById("intro-words");

        let randomClass = Math.random();
        if (randomClass < 0.70) {
            playClass = "Hunter";
        } else {
            playClass = "Human";
        }

        setTimeout(function() {
            awakeningWords.style.animation = 'none';
            awakeningWords.offsetWidth;
            awakeningWords.style.animation = 'textFading 2s ease-in-out';
            awakeningWords.textContent = "YOU";
        }, 2000);

        setTimeout(function() {
            awakeningWords.style.animation = 'none';
            awakeningWords.offsetWidth;
            awakeningWords.style.animation = 'textFading 2s ease-in-out';
            awakeningWords.textContent = "ARE";
        }, 5000);

        setTimeout(function() {
            awakeningWords.style.animation = 'none';
            awakeningWords.offsetWidth;
            awakeningWords.style.animation = 'textFading 2s ease-in-out';
            awakeningWords.textContent = "A";
        }, 8000);

        setTimeout(function() {
            awakeningWords.style.animation = 'none';
            awakeningWords.offsetWidth;
            awakeningWords.style.animation = 'textFading 2s ease-in-out';
            awakeningWords.textContent = playClass;
            if (playClass === "Hunter") {
                awakeningWords.style.color    = '#4166f5';
                awakeningWords.style.fontSize = '80px';
            } else {
                awakeningWords.style.color    = '#bebd5a';
                awakeningWords.style.fontSize = '80px';
            }
        }, 12000);

        setTimeout(function() {
            let proceed = document.getElementById("proceedText");
            proceed.style.visibility = 'visible';
            proceed.style.animation  = 'proceedFading 2s ease-in-out';
        }, 15000);

    }, 1000);
}

function proceedToStats() {
    let playRank        = "";
    let randomRank      = Math.random();
    let randomPowerRoll = Math.random();
    let selectedPower;
    let randomWeaponRoll    = Math.random();
    let selectedRandomWeapon;

    if (randomWeaponRoll < 0.33) {
        selectedRandomWeapon = weaponsForHumans[0];
    } else if (randomWeaponRoll < 0.66) {
        selectedRandomWeapon = weaponsForHumans[1];
    } else {
        selectedRandomWeapon = weaponsForHumans[2];
    }

    if (randomPowerRoll < 0.25) {
        selectedPower = powers[0];
    } else if (randomPowerRoll < 0.50) {
        selectedPower = powers[1];
    } else if (randomPowerRoll < 0.75) {
        selectedPower = powers[2];
    } else {
        selectedPower = powers[3];
    }

    if (randomRank < 0.25) {
        playRank = 'E';
    } else if (randomRank < 0.50) {
        playRank = 'D';
    } else if (randomRank < 0.65) {
        playRank = 'C';
    } else if (randomRank < 0.80) {
        playRank = 'B';
    } else if (randomRank < 0.92) {
        playRank = 'A';
    } else {
        playRank = 'S';
    }

    window.storedRank = playRank;

    document.getElementById("menuPulse").classList.add("hidden");
    let menuIntro   = document.getElementById("menu-intro");
    let screenStats = document.getElementById("screen-stats");
    menuIntro.classList.remove('active');
    screenStats.classList.add('active');

    let usernameInput = document.getElementById('uname');
    usernameInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            let playerUsername       = usernameInput.value;
            usernameInput.style.display = 'none';
            let nameDisplay          = document.getElementById('displayName');
            nameDisplay.textContent  = playerUsername;
            nameDisplay.style.display = 'block';
        }
    });

    let topRowStatus = document.querySelector('.status-row');
    setTimeout(function() {
        topRowStatus.style.animation = 'fadeIn 1s ease-in-out forwards';
        popSound.currentTime = 0; popSound.play();
    }, 500);

    let hrDivider = document.querySelector('.divider');
    setTimeout(function() {
        hrDivider.style.animation = 'fadeIn 1s ease-in-out forwards';
        popSound.currentTime = 0; popSound.play();
    }, 1000);

    let nameRow = document.querySelector('.name-row');
    setTimeout(function() {
        nameRow.style.animation = 'fadeIn 1s ease-in-out forwards';
        popSound.currentTime = 0; popSound.play();
    }, 2000);

    let playerClass = document.getElementById('playerClass');
    setTimeout(function() {
        playerClass.style.animation = 'fadeIn 1s ease-in-out forwards';
        popSound.currentTime = 0; popSound.play();
    }, 3000);

    let playerRank = document.getElementById('rank');
    setTimeout(function() {
        playerRank.style.animation = 'fadeIn 1s ease-in-out forwards';
        popSound.currentTime = 0; popSound.play();
    }, 4000);


    let playerTitle = document.getElementById('title');
    setTimeout(function() {
        playerTitle.style.animation = 'fadeIn 1s ease-in-out forwards';
        popSound.currentTime = 0; popSound.play();
    }, 6000);

    let hrDividerSecond = document.querySelectorAll('.divider');
    setTimeout(function() {
        hrDividerSecond[1].style.animation = 'fadeIn 1s ease-in-out forwards';
        popSound.currentTime = 0; popSound.play();
    }, 7000);

    let healthPoints = document.getElementById('healthPoints');
    setTimeout(function() {
        healthPoints.style.animation = 'fadeIn 1s ease-in-out forwards';
        popSound.currentTime = 0; popSound.play();
    }, 8000);

    let manaPool = document.getElementById('manaPool');
    setTimeout(function() {
        manaPool.style.animation = 'fadeIn 1s ease-in-out forwards';
    }, 9000);

    let playerAgility = document.getElementById('agility');
    setTimeout(function() {
        playerAgility.style.animation = 'fadeIn 1s ease-in-out forwards';
        popSound.currentTime = 0; popSound.play();
    }, 10000);

    let playerStrength = document.getElementById('strength');
    setTimeout(function() {
        playerStrength.style.animation = 'fadeIn 1s ease-in-out forwards';
        popSound.currentTime = 0; popSound.play();
    }, 11000);

    setTimeout(function() {
        achieveSound.currentTime = 0; achieveSound.play();
        playerClass.textContent     = "CLASS: " + playClass;
        playerClass.style.animation = 'none';
        playerClass.offsetWidth;
        playerClass.style.animation = 'fadeIn 1s ease-in-out forwards';
    }, 14000);

    setTimeout(function() {
        achieveSound.currentTime = 0; achieveSound.play();
        playerRank.textContent     = "RANK: " + playRank;
        playerRank.style.animation = 'none';
        playerRank.offsetWidth;
        playerRank.style.animation = 'fadeIn 1s ease-in-out forwards';
    }, 15000);


    if (playClass === 'Human') {
        document.getElementById('manaPool').style.display   = 'none';
        

        let humanWeapon = document.createElement('p');
        humanWeapon.classList.add('stat-line');
        setTimeout(function() {
            humanWeapon.textContent     = 'WEAPON: ';
            humanWeapon.style.animation = 'none';
            humanWeapon.offsetWidth;
            humanWeapon.style.animation = 'fadeIn 1s ease-in-out forwards';
        }, 5000);
        document.querySelector('.status-container').insertBefore(humanWeapon, document.getElementById('title'));

        setTimeout(function() {
            achieveSound.currentTime = 0; achieveSound.play();
            humanWeapon.textContent     = 'WEAPON: ' + selectedRandomWeapon.name;
            humanWeapon.style.animation = 'none';
            humanWeapon.offsetWidth;
            humanWeapon.style.animation = 'fadeIn 1s ease-in-out forwards';
        }, 16000);

        setTimeout(function() {
            healthPoints.textContent     = 'HP: 2000';
            healthPoints.style.animation = 'none'; healthPoints.offsetWidth;
            healthPoints.style.animation = 'fadeIn 1s ease-in-out forwards';
            popSound.currentTime = 0; popSound.play();
        }, 18500);
        setTimeout(function() {
            playerAgility.textContent     = 'AGI: 50';
            playerAgility.style.animation = 'none'; playerAgility.offsetWidth;
            playerAgility.style.animation = 'fadeIn 1s ease-in-out forwards';
            popSound.currentTime = 0; popSound.play();
        }, 19200);
        setTimeout(function() {
            playerStrength.textContent     = 'STR: 70';
            playerStrength.style.animation = 'none'; playerStrength.offsetWidth;
            playerStrength.style.animation = 'fadeIn 1s ease-in-out forwards';
            popSound.currentTime = 0; popSound.play();
        }, 20000);
    }

    if (playClass === "Hunter") {
        setTimeout(function() {
            healthPoints.textContent     = 'HP: 1500';
            healthPoints.style.animation = 'none'; healthPoints.offsetWidth;
            healthPoints.style.animation = 'fadeIn 1s ease-in-out forwards';
            popSound.currentTime = 0; popSound.play();
        }, 18500);
        setTimeout(function() {
            manaPool.textContent     = 'MANA: 500';
            manaPool.style.animation = 'none'; manaPool.offsetWidth;
            manaPool.style.animation = 'fadeIn 1s ease-in-out forwards';
            popSound.currentTime = 0; popSound.play();
        }, 19200);
        setTimeout(function() {
            playerAgility.textContent     = 'AGI: 35';
            playerAgility.style.animation = 'none'; playerAgility.offsetWidth;
            playerAgility.style.animation = 'fadeIn 1s ease-in-out forwards';
            popSound.currentTime = 0; popSound.play();
        }, 20000);
        setTimeout(function() {
            playerStrength.textContent     = 'STR: 50';
            playerStrength.style.animation = 'none'; playerStrength.offsetWidth;
            playerStrength.style.animation = 'fadeIn 1s ease-in-out forwards';
            popSound.currentTime = 0; popSound.play();
        }, 20700);
    }

    setTimeout(function() {
        let proceedBtn          = document.getElementById('en');
        proceedBtn.style.visibility = 'visible';
        proceedBtn.style.animation  = 'enterBtnFade 2s ease-in-out forwards';
    }, 23000);
}

function proceedToGuide() {
    let nameDisplay = document.getElementById('displayName');
    let nameWarning = document.getElementById('nameWarning');
    if (nameDisplay.style.display === 'none' || nameDisplay.textContent.trim() === '') {
        nameWarning.style.display = 'block'; return;
    }
    nameWarning.style.display = 'none';

    document.getElementById('screen-stats').classList.remove('active');
    document.getElementById('screenForGuide').classList.add('active');

    let screenTitle   = document.getElementById('sGuideTitle');
    let enterBtn      = document.getElementById('enterWorldBtn');
    let screenContent = document.getElementById('sGuideContent');

    if (playClass === 'Hunter') {
        setTimeout(function() {
            screenTitle.textContent     = 'YOU ARE NOW A HUNTER';
            screenTitle.style.animation = 'none'; screenTitle.offsetWidth;
            screenTitle.style.animation = 'fadeIn 1s ease-in-out forwards';
        }, 500);
        setTimeout(function() {
            screenContent.innerHTML = '<div class="guide-section"><div class="guide-section-title">WHAT IS A HUNTER?</div><p>Hunters are individuals with supernatural abilities beyond human limits. Your rank tells you how you rank among the many hunters in the world of Beyond Human. You have been chosen by the system. Your power is real, so use it wisely.</p></div><div class="guide-section"><div class="guide-section-title">COMBAT</div><p>Left-click to fire your basic bolt at the cursor. Mana fuels your skills — manage it carefully, it regenerates slowly over time.</p></div><div class="guide-section"><div class="guide-section-title">SKILLS — KEYS 1-6</div><p>You unlock a new skill at levels 1, 5, 10, 20, 30 and 40. Every skill scales with your Strength and costs Mana. Press K to spend Skill Points and upgrade skills you have unlocked. Max a skill out to master it.</p></div><div class="guide-section"><div class="guide-section-title">SPECIAL — PRESS F</div><p>At level 10 you unlock Mana Overload: 10 seconds of free skills, bonus damage and auto-firing bolts.</p></div><div class="guide-section"><div class="guide-section-title">RANK UP</div><p>Visit the Association Examiner NPC to see your rank-up quests. Press J anytime to view your Quest Log.</p></div><div class="guide-section"><div class="guide-section-title">YOUR STATS?</div><p>HP - Your life. MANA — fuel for your skills. AGI — how fast you move. STR — increases both your basic attack and skill damage.</p></div>';
            screenContent.style.animation = 'none'; screenContent.offsetWidth;
            screenContent.style.animation = 'fadeIn 1s ease-in-out forwards';
        }, 2000);
    } else {
        setTimeout(function() {
            screenTitle.textContent     = 'YOU ARE NOW A HUMAN';
            screenTitle.style.animation = 'none'; screenTitle.offsetWidth;
            screenTitle.style.animation = 'fadeIn 1s ease-in-out forwards';
        }, 500);
        setTimeout(function() {
            screenContent.innerHTML = '<div class="guide-section"><div class="guide-section-title">WHAT IS A HUMAN?</div><p>Not everyone awakens. You are human, but that does not mean you are weak. Humans rely on equipment, gadgets, and physical strength to survive in a world of monsters.</p></div><div class="guide-section"><div class="guide-section-title">COMBAT</div><p>Left-click to strike at the cursor with your weapon. No mana — your skills run on cooldowns alone.</p></div><div class="guide-section"><div class="guide-section-title">SKILLS — KEYS 1-6</div><p>You unlock a new skill at levels 1, 5, 10, 20, 30 and 40, all scaling with your Strength. Press K to spend Skill Points and upgrade unlocked skills. Max a skill out to master it.</p></div><div class="guide-section"><div class="guide-section-title">SPECIAL — PRESS F</div><p>At level 10 you unlock Unbreakable: 5 seconds of invulnerability with a damage pulse around you.</p></div><div class="guide-section"><div class="guide-section-title">LIMIT BREAK — PRESS SPACE</div><p>Land 15 hits to charge your Limit Break. At full charge the bar glows. Press SPACE — you flash forward, slashing through every enemy in your path.</p></div><div class="guide-section"><div class="guide-section-title">RANK UP</div><p>Visit the Association Examiner NPC to see your rank-up quests. Press J anytime to view your Quest Log.</p></div>';
            screenContent.style.animation = 'none'; screenContent.offsetWidth;
            screenContent.style.animation = 'fadeIn 1s ease-in-out forwards';
        }, 2000);
    }

    setTimeout(function() {
        enterBtn.style.visibility = 'visible';
        enterBtn.style.animation  = 'fadeIn 1s ease-in-out forwards';
    }, 15000);
}

function enterWorld() {
    let screenGuide = document.getElementById('screenForGuide');
    let screenGame  = document.getElementById('screenGame');
    screenGuide.style.transition = 'opacity 1.5s ease';
    screenGuide.style.opacity    = '0';
    setTimeout(function() {
        screenGuide.classList.remove('active');
        screenGame.classList.add('active');
        screenGame.style.opacity    = '0';
        screenGame.style.transition = 'opacity 1.5s ease';
        setTimeout(function() {
            screenGame.style.opacity = '1';
            startGame();
        }, 100);
    }, 1500);
}

// ══════════════════════════════════════════════════════════════
//  SKILL DEFINITIONS
// ══════════════════════════════════════════════════════════════
const SKILL_DEFS = {
    Hunter: [
        { slot: 1, name: 'Piercing Bolt',   levelReq: 1,  manaCost: 18, cooldown: 1400,  type: 'pierce',     dmgMult: 1.6, color: '#4d8dff', icon: '➹', desc: 'A reinforced bolt that pierces through every enemy in its path.' },
        { slot: 2, name: 'Shadow Step',     levelReq: 5,  manaCost: 26, cooldown: 4200,  type: 'dash_crit',  dmgMult: 2.0, color: '#b06bff', icon: '⤳', desc: 'Blink toward the cursor, striking everything nearby with a critical hit.' },
        { slot: 3, name: 'Frost Nova',      levelReq: 10, manaCost: 38, cooldown: 6500,  type: 'aoe',        dmgMult: 2.4, radius: 190, slow: true, color: '#66e6ff', icon: '❄', desc: 'Erupts frost around you, damaging and slowing nearby enemies.' },
        { slot: 4, name: 'Chain Lightning', levelReq: 20, manaCost: 48, cooldown: 7500,  type: 'chain',      dmgMult: 1.9, bounces: 4, color: '#ffe94d', icon: '⚡', desc: 'Arcs between the nearest foes, dealing heavy damage that weakens with each jump.' },
        { slot: 5, name: 'Void Barrage',    levelReq: 30, manaCost: 62, cooldown: 9500,  type: 'multi',      dmgMult: 1.4, count: 6, color: '#ff4dd2', icon: '✵', desc: 'Unleashes a spread of void bolts toward the cursor.' },
        { slot: 6, name: "Monarch's Wrath", levelReq: 40, manaCost: 95, cooldown: 21000, type: 'ultimate',   dmgMult: 5.6, radius: 270, color: '#ff2255', icon: '☠', desc: 'ULTIMATE — Detonates a devastating shockwave around you.' },
    ],
    Human: [
        { slot: 1, name: 'Cross Slash',      levelReq: 1,  cooldown: 1200,  type: 'melee_cone', dmgMult: 1.8, range: 150, color: '#f2f2f2', icon: '⚔', desc: 'A wide slash in front of you.' },
        { slot: 2, name: 'Piercing Thrust',  levelReq: 5,  cooldown: 3600,  type: 'dash_line',  dmgMult: 2.1, color: '#55ddff', icon: '➳', desc: 'Lunge forward, impaling everything in your path.' },
        { slot: 3, name: 'Whirlwind',        levelReq: 10, cooldown: 6200,  type: 'aoe',        dmgMult: 2.5, radius: 175, color: '#55ff99', icon: '🌀', desc: 'Spin and strike every enemy around you.' },
        { slot: 4, name: 'Execution Strike', levelReq: 20, cooldown: 7200,  type: 'execute',     dmgMult: 2.0, execBonus: 2.4, color: '#ff3355', icon: '☠', desc: 'A precise strike that deals bonus damage to weakened foes.' },
        { slot: 5, name: 'Battle Fury',      levelReq: 30, cooldown: 15000, type: 'buff',       duration: 8000, dmgBuff: 0.4, spdBuff: 0.3, color: '#ffd000', icon: '🔥', desc: 'Enter a battle rage, boosting your damage and speed.' },
        { slot: 6, name: 'Ragnarok Break',   levelReq: 40, cooldown: 21000, type: 'ultimate',    dmgMult: 6.0, radius: 260, color: '#ff5a2a', icon: '💥', desc: 'ULTIMATE — Slam the ground, shattering everything nearby.' },
    ],
};

// What each skill gains when fully upgraded (mastered)
const MASTERY_TEXT = {
    Hunter: { 1: '3 bolts, bigger, longer range', 2: 'Longer blink, wider hit', 3: '+40% radius, 5s slow, 1.5s freeze', 4: '+3 bounces, less falloff', 5: '+4 bolts, +20% damage', 6: 'Second shockwave + stun' },
    Human:  { 1: 'Full 360 slash, +40% range', 2: 'Longer lunge, wider hit', 3: '+40% radius, hits twice', 4: 'Execute <50% HP, kill resets CD', 5: '+4s duration, heal 25% HP', 6: 'Second shockwave + stun' },
};

// Special ability (press F)
const SPECIAL_DEFS = {
    Hunter: { name: 'Mana Overload', icon: '✺', color: '#9966ff', levelReq: 10, cooldown: 45000, duration: 10000 },
    Human:  { name: 'Unbreakable',   icon: '🛡', color: '#ffd24d', levelReq: 10, cooldown: 40000, duration: 5000 },
};

function startGame() {

    let playerName = loadedSave ? loadedSave.name : document.getElementById('displayName').textContent.trim();

    let rankPoints = { 'E': 1, 'D': 4, 'C': 11, 'B': 20, 'A': 28, 'S': 35 };
    let statPoints = rankPoints[window.storedRank] || 0;
    let skillPoints = 2;

    let baseStats = {
        str:  playClass === 'Hunter' ? 50 : 70,
        agi:  playClass === 'Hunter' ? 35 : 50,
        dur:  0,
        mana: playClass === 'Hunter' ? 500 : 0,
    };

    let stats = { str: 0, agi: 0, dur: 0, mana: 0 };

    let skillLevels = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    let skillCooldownEnd = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const MAX_SKILL_LEVEL = 5;
    const skillDefsForClass = SKILL_DEFS[playClass];

    let showStatMenu   = false;
    let showSkillMenu  = false;
    let showJournal    = false;
    let isDead         = false;

    let humanBuffActive   = false;
    let humanBuffEndTime  = 0;
    let humanBuffDmgMult  = 1;
    let humanBuffSpeedMult = 1;

    let enemyZone = { x: 5000, y: 5000, w: 1400, h: 1400 };
    let npcZone   = { x: 3000, y: 3000, w: 120, h: 120, color: '#00ffcc' };
    let examinerZone = { x: 3200, y: 3000, w: 120, h: 120, color: '#ffcc00' };

    let enemies     = [];
    let projectiles = [];
    let skillProjectiles = [];
    let slashTrails = [];
    let effectRings = [];
    let skillFx = [];
    let shakeFrames = 0, shakeMag = 0;

    let showInteractPrompt    = false;
    let showExaminerPrompt    = false;
    let showExaminerMenu      = false;
    let inDungeon             = false;
    let dungeonWave           = 0;
    let dungeonEnemies        = [];
    let dungeonProjectiles    = [];
    let waveCleared           = false;
    let bossSpawned           = false;
    let dungeonComplete       = false;
    let dungeonClearBannerHideAt = 0;

    let dungeonCooldownMs    = 25000;
    let lastDungeonClearTime = -Infinity;

    let totalKills          = 0;
    let totalDungeonClears  = 0;

    // ── new state ──
    let levelUpBanner = null;          // big LEVEL UP text
    let bossWarnEnd   = 0;             // boss countdown end time
    let dungeonRunId  = 0;             // stops old timers from affecting new runs
    let lastDungeonExp = 0;
    let counters = { damage: 0, skillUses: 0, special: 0, spent: 0, limit: 0, mana: 0, flawless: 0, fast: 0, clearsByRank: {} };
    let dungeonRunStart = 0, dungeonHit = false;
    const SPECIAL = SPECIAL_DEFS[playClass];
    let specialEnd = 0, specialCdEnd = 0, lastAutoFire = 0, lastPulse = 0;

    let toastQueue = [];

    function overloadOn()     { return playClass === 'Hunter' && Date.now() < specialEnd; }
    function specialDmgMult() { return overloadOn() ? 1.3 : 1; }

    // STR now adds flat damage AND a % multiplier for every point you invest
    function basicDamage() {
        return Math.floor(((playClass === 'Hunter' ? 14 : 22) + stats.str * 1.2) * (1 + stats.str * 0.05));
    }
    function strBonusPct() {
        return Math.round(((1 + stats.str * 0.05) * (1 + stats.str * 1.2 / (playClass === 'Hunter' ? 14 : 22)) - 1) * 100);
    }

    // Dungeon EXP = bigger base + a share of the EXP needed for your current level
    function dungeonExpFor(tier, idx) {
        return Math.floor(tier.expReward * 1.3 + player.expToNext * (0.35 + idx * 0.07));
    }

    // ══════════════════════════════════════════════════════════
    //  RANK-UP QUEST SYSTEM
    // ══════════════════════════════════════════════════════════

    const RANK_ORDER = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS'];
    const RANK_COLORS = { 'E': '#aaaaaa', 'D': '#88ccff', 'C': '#ffdd55', 'B': '#ff9900', 'A': '#ff4455', 'S': '#cc44ff', 'SS': '#ff66cc', 'SSS': '#ffffff' };
    function isMaxRank() { return window.storedRank === RANK_ORDER[RANK_ORDER.length - 1]; }

    const RANK_UP_QUESTS = {
        'E':   { killsNeeded: 50,   dungeonClears: 2,  dungeonRank: 'E',   levelNeeded: 3  },
        'D':   { killsNeeded: 120,  dungeonClears: 3,  dungeonRank: 'D',   levelNeeded: 8  },
        'C':   { killsNeeded: 250,  dungeonClears: 5,  dungeonRank: 'C',   levelNeeded: 15 },
        'B':   { killsNeeded: 500,  dungeonClears: 8,  dungeonRank: 'B',   levelNeeded: 24 },
        'A':   { killsNeeded: 900,  dungeonClears: 12, dungeonRank: 'A',   levelNeeded: 34 },
        'S':   { killsNeeded: 1800, dungeonClears: 20, dungeonRank: 'S',   levelNeeded: 45 },
        'SS':  { killsNeeded: 3000, dungeonClears: 30, dungeonRank: 'SS',  levelNeeded: 60 },
        'SSS': null,
    };

    let rankUpProgress = {
        kills:         0,
        dungeonClears: 0,
        lastClearedRank: '',
    };

    let showRankUpOverlay  = false;
    let rankUpOverlayTimer = 0;
    let rankUpNewRank      = '';

    // bigger rewards for ranking up
    const RANK_UP_BONUS_POINTS = { 'D': 10, 'C': 16, 'B': 24, 'A': 34, 'S': 50, 'SS': 70, 'SSS': 100 };
    const RANK_UP_SKILL_POINTS = { 'D': 4, 'C': 5, 'B': 6, 'A': 8, 'S': 10, 'SS': 12, 'SSS': 16 };

    function currentQuest() {
        return RANK_UP_QUESTS[window.storedRank] || null;
    }

    function questComplete() {
        let q = currentQuest();
        if (!q) return false;
        return rankUpProgress.kills         >= q.killsNeeded
            && rankUpProgress.dungeonClears >= q.dungeonClears
            && player.level                 >= q.levelNeeded;
    }

    function doRankUp() {
        let idx = RANK_ORDER.indexOf(window.storedRank);
        if (idx < 0 || idx >= RANK_ORDER.length - 1) return;
        let newRank = RANK_ORDER[idx + 1];
        window.storedRank = newRank;

        rankUpProgress.kills         = 0;
        rankUpProgress.dungeonClears = 0;
        rankUpProgress.lastClearedRank = '';

        statPoints  += RANK_UP_BONUS_POINTS[newRank] || 0;
        skillPoints += RANK_UP_SKILL_POINTS[newRank] || 0;

        rankUpNewRank      = newRank;
        showRankUpOverlay  = true;
        rankUpOverlayTimer = 240;

        achieveSound.currentTime = 0;
        achieveSound.play();
    }

    // ══════════════════════════════════════════════════════════
    //  QUEST LOG (take a quest to track it)
    // ══════════════════════════════════════════════════════════
    const QUEST_POOL = [];
    function Q(type, target, minLevel, reward, extra) {
        QUEST_POOL.push(Object.assign({ type: type, target: target, minLevel: minLevel, reward: reward }, extra || {}));
    }
    Q('kills', 15, 1, { statPoints: 2 });
    Q('skilluse', 25, 1, { expPct: 0.30 });
    Q('dungeons', 1, 1, { expPct: 0.35 });
    Q('damage', 2000, 1, { skillPoints: 1 });
    Q('level', 5, 1, { skillPoints: 2 });
    Q('spent', 5, 2, { expPct: 0.20 });
    Q('mana', 400, 3, { skillPoints: 2 }, { cls: 'Hunter' });
    Q('limit', 3, 3, { skillPoints: 2 }, { cls: 'Human' });
    Q('kills', 60, 3, { statPoints: 5 });
    Q('fast', 1, 4, { expPct: 0.40 });
    Q('flawless', 1, 5, { statPoints: 5 });
    Q('dungeons', 3, 5, { statPoints: 4, skillPoints: 1 });
    Q('tierclear', 2, 5, { expPct: 0.40 }, { rank: 'D' });
    Q('level', 10, 6, { skillPoints: 3 });
    Q('special', 1, 8, { statPoints: 5 });
    Q('mastery', 1, 8, { statPoints: 8, skillPoints: 2 });
    Q('damage', 20000, 8, { statPoints: 6 });
    Q('kills', 150, 8, { statPoints: 8 });
    Q('flawless', 3, 10, { statPoints: 8, skillPoints: 2 });
    Q('special', 5, 10, { statPoints: 8 });
    Q('tierclear', 3, 10, { expPct: 0.45 }, { rank: 'C' });
    Q('skilluse', 200, 10, { skillPoints: 3 });
    Q('rank', 1, 12, { statPoints: 10, skillPoints: 3 }, { rank: 'B' });
    Q('fast', 3, 14, { statPoints: 10 });
    Q('level', 20, 15, { statPoints: 10, skillPoints: 4 });
    Q('damage', 200000, 15, { statPoints: 10 });
    Q('kills', 400, 16, { statPoints: 12, skillPoints: 3 });
    Q('tierclear', 5, 16, { expPct: 0.50 }, { rank: 'B' });
    Q('mastery', 3, 18, { statPoints: 15, skillPoints: 4 });
    Q('flawless', 6, 20, { statPoints: 12, skillPoints: 4 });
    Q('spent', 100, 20, { skillPoints: 5 });
    Q('rank', 1, 22, { statPoints: 15, skillPoints: 4 }, { rank: 'A' });
    Q('tierclear', 5, 24, { expPct: 0.50 }, { rank: 'A' });
    Q('level', 30, 25, { statPoints: 15, skillPoints: 6 });
    Q('special', 20, 25, { statPoints: 15 });
    Q('fast', 8, 25, { statPoints: 15, skillPoints: 5 });
    Q('damage', 5000000, 28, { statPoints: 20 });
    Q('kills', 1000, 28, { statPoints: 20, skillPoints: 6 });
    Q('rank', 1, 30, { statPoints: 25, skillPoints: 6 }, { rank: 'S' });
    Q('tierclear', 10, 32, { expPct: 0.60 }, { rank: 'S' });
    Q('mastery', 6, 34, { statPoints: 30, skillPoints: 8 });
    Q('level', 45, 40, { statPoints: 25, skillPoints: 8 });
    Q('rank', 1, 45, { statPoints: 30, skillPoints: 8 }, { rank: 'SS' });
    Q('tierclear', 10, 48, { expPct: 0.60 }, { rank: 'SS' });
    Q('flawless', 15, 50, { statPoints: 30, skillPoints: 10 });
    Q('rank', 1, 55, { statPoints: 40, skillPoints: 10 }, { rank: 'SSS' });
    Q('tierclear', 10, 58, { expPct: 0.70 }, { rank: 'SSS' });
    Q('level', 60, 55, { statPoints: 40, skillPoints: 12 });
    const MAX_ACTIVE_QUESTS = 3;

    function questDesc(q) {
        let n = q.target, pl = n === 1 ? '' : 's';
        switch (q.type) {
            case 'level':     return 'Reach Level ' + n;
            case 'kills':     return 'Defeat ' + n.toLocaleString() + ' monsters';
            case 'dungeons':  return 'Clear ' + n + ' dungeon' + pl;
            case 'skilluse':  return 'Use skills ' + n + ' times';
            case 'special':   return 'Use your Special Ability ' + n + (n === 1 ? ' time' : ' times');
            case 'damage':    return 'Deal ' + n.toLocaleString() + ' total damage';
            case 'spent':     return 'Spend ' + n + ' stat points';
            case 'mastery':   return 'Master ' + n + ' skill' + pl;
            case 'flawless':  return 'Clear ' + n + ' dungeon' + pl + ' without taking damage';
            case 'fast':      return 'Clear ' + n + ' dungeon' + pl + ' in under 2 minutes';
            case 'mana':      return 'Spend ' + n + ' mana on skills';
            case 'limit':     return 'Use Limit Break ' + n + ' times';
            case 'tierclear': return 'Clear ' + n + ' ' + q.rank + '-Rank dungeon' + pl;
            case 'rank':      return 'Reach ' + q.rank + '-Rank';
        }
        return '';
    }

    // state: 'available' -> 'active' -> 'done'
    let journalQuests = QUEST_POOL.map(function(q, i) {
        return { id: 'n' + i, type: q.type, target: q.target, reward: q.reward, minLevel: q.minLevel, rank: q.rank, cls: q.cls,
                 desc: questDesc(q), state: 'available', base: 0 };
    });

    function fmtNum(n) {
        if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
        if (n >= 1e4) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
        return String(Math.floor(n));
    }
    function myQuests() { return journalQuests.filter(function(q) { return !q.cls || q.cls === playClass; }); }

    function questValue(q) {
        switch (q.type) {
            case 'level':     return player.level;
            case 'kills':     return totalKills;
            case 'dungeons':  return totalDungeonClears;
            case 'skilluse':  return counters.skillUses;
            case 'special':   return counters.special;
            case 'damage':    return counters.damage;
            case 'spent':     return counters.spent;
            case 'flawless':  return counters.flawless;
            case 'fast':      return counters.fast;
            case 'mana':      return counters.mana;
            case 'limit':     return counters.limit;
            case 'tierclear': return counters.clearsByRank[q.rank] || 0;
            case 'mastery':   return Object.keys(skillLevels).filter(function(k) { return skillLevels[k] >= MAX_SKILL_LEVEL; }).length;
            case 'rank':      return playerRankIndex() >= RANK_ORDER.indexOf(q.rank) ? 1 : 0;
        }
        return 0;
    }
    function questProgress(q) {
        let absolute = q.type === 'level' || q.type === 'mastery' || q.type === 'rank';
        let v = absolute ? questValue(q) : questValue(q) - q.base;
        return Math.max(0, Math.min(v, q.target));
    }
    function activeQuests() { return journalQuests.filter(function(q) { return q.state === 'active'; }); }
    function visibleQuests() {
        let ri = playerRankIndex();
        let avail = journalQuests.filter(function(q) {
            return q.state === 'available'
                && (!q.cls || q.cls === playClass)
                && player.level >= q.minLevel - 3
                && (q.type !== 'tierclear' || RANK_ORDER.indexOf(q.rank) <= ri);
        });
        return activeQuests().concat(avail).slice(0, 7);
    }
    function questRewardText(q) {
        let r = [];
        if (q.reward.expPct)      r.push('+' + Math.round(q.reward.expPct * 100) + '% LVL EXP');
        if (q.reward.statPoints)  r.push('+' + q.reward.statPoints + ' Stat Pts');
        if (q.reward.skillPoints) r.push('+' + q.reward.skillPoints + ' Skill Pts');
        return r.join('  ');
    }
    function takeQuest(q) {
        if (q.state !== 'available') return;
        if (activeQuests().length >= MAX_ACTIVE_QUESTS) { pushToast('MAX ' + MAX_ACTIVE_QUESTS + ' ACTIVE QUESTS', '#ff8888'); return; }
        q.state = 'active';
        q.base = questValue(q);
        pushToast('QUEST ACCEPTED: ' + q.desc, '#88ccff');
        popSound.currentTime = 0; popSound.play();
    }
    function journalLayout() {
        let rows = visibleQuests();
        let pw = 660, rowH = 50, ph = 100 + Math.max(1, rows.length) * rowH + 20;
        return { rows: rows, pw: pw, rowH: rowH, ph: ph, px: canvas.width / 2 - pw / 2, py: canvas.height / 2 - ph / 2 };
    }
    function checkJournalQuests() {
        let act = activeQuests();
        for (let i = 0; i < act.length; i++) {
            let q = act[i];
            if (questProgress(q) >= q.target) {
                q.state = 'done';
                if (q.reward.expPct) grantExp(Math.floor(player.expToNext * q.reward.expPct));
                if (q.reward.statPoints) statPoints += q.reward.statPoints;
                if (q.reward.skillPoints) skillPoints += q.reward.skillPoints;
                pushToast('QUEST COMPLETE: ' + q.desc, '#88ff88');
                popSound.currentTime = 0; popSound.play();
            }
        }
    }

    function pushToast(text, color) {
        toastQueue.push({ text: text, color: color || '#ffffff', life: 210, maxLife: 210 });
    }

    const DUNGEON_TIERS = [
        { rank: 'E',   label: 'E-RANK DUNGEON',   color: '#88ff88', hpMult: 0.6, dmgMult: 1,   expReward: 900   },
        { rank: 'D',   label: 'D-RANK DUNGEON',   color: '#88ccff', hpMult: 1,   dmgMult: 1.1, expReward: 1500  },
        { rank: 'C',   label: 'C-RANK DUNGEON',   color: '#ffdd55', hpMult: 1.7, dmgMult: 1.25, expReward: 2300 },
        { rank: 'B',   label: 'B-RANK DUNGEON',   color: '#ff9900', hpMult: 2.4, dmgMult: 1.5, expReward: 3600  },
        { rank: 'A',   label: 'A-RANK DUNGEON',   color: '#ff4455', hpMult: 3.5, dmgMult: 1.9, expReward: 5500  },
        { rank: 'S',   label: 'S-RANK DUNGEON',   color: '#cc44ff', hpMult: 8,   dmgMult: 2.5, expReward: 9000  },
        { rank: 'SS',  label: 'SS-RANK DUNGEON',  color: '#ff66cc', hpMult: 18,  dmgMult: 3.2, expReward: 16000 },
        { rank: 'SSS', label: 'SSS-RANK DUNGEON', color: '#ffffff', hpMult: 40,  dmgMult: 4,   expReward: 28000 },
    ];

    function playerRankIndex() { return RANK_ORDER.indexOf(window.storedRank); }
    function unlockedTiers()   { return DUNGEON_TIERS.slice(0, playerRankIndex() + 1); }
    // higher tiers have more waves, hit harder and spawn more enemies
    function normalWaves() { return 2 + Math.floor(selectedTierIndex / 2); }
    function bossWaveNum() { return normalWaves() + 1; }
    function tierDmg()     { return DUNGEON_TIERS[selectedTierIndex].dmgMult; }

    let selectedTierIndex = 0;

    let DUNGEON_X = 7000;
    let DUNGEON_Y = 200;

    function spawnDungeonWave() {
        dungeonWave++;
        dungeonEnemies     = [];
        dungeonProjectiles = [];
        waveCleared        = false;

        let tier = DUNGEON_TIERS[selectedTierIndex];

        if (dungeonWave === bossWaveNum()) {
            dungeonEnemies.push({
                x: DUNGEON_X + 600, y: DUNGEON_Y + 300,
                size: 65, color: '#ff0000',
                hp: Math.floor(2000 * tier.hpMult), maxHp: Math.floor(2000 * tier.hpMult),
                alive: true, type: 'boss', lastShot: 0,
                chargeTimer: 0, chargeCooldown: 10000,
                charging: false, chargeDx: 0, chargeDy: 0, chargeFrames: 0
            });
            bossSpawned = true;
            return;
        }

        let hpScale = Math.floor((80 + (dungeonWave - 1) * 60) * tier.hpMult);
        let perWave = 5 + Math.floor(selectedTierIndex / 2);

        for (let i = 0; i < perWave; i++) {
            dungeonEnemies.push({
                x: DUNGEON_X + 500 + Math.random() * 300, y: DUNGEON_Y + 100 + i * 100,
                size: 30, color: '#ff6600', hp: hpScale, maxHp: hpScale,
                alive: true, type: 'rusher', lastShot: 0
            });
        }
        for (let i = 0; i < perWave; i++) {
            dungeonEnemies.push({
                x: DUNGEON_X + 900 + Math.random() * 200, y: DUNGEON_Y + 100 + i * 100,
                size: 30, color: '#cc44ff', hp: hpScale, maxHp: hpScale,
                alive: true, type: 'shooter', lastShot: 0
            });
        }
    }

    const slashImg = new Image();
    slashImg.src   = 'slash1.jpg';

    const canvas = document.getElementById('gameCanvas');
    const ctx    = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('resize', function() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    let WORLD_WIDTH  = 10000;
    let WORLD_HEIGHT = 10000;

    let player = {
        x: WORLD_WIDTH / 2,
        y: WORLD_HEIGHT / 2,
        size: 30, speed: 15, level: 1,
        hp:    playClass === 'Hunter' ? 1500 : 2000,
        maxHp: playClass === 'Hunter' ? 1500 : 2000,
        mana:    playClass === 'Hunter' ? 500 : 0,
        maxMana: playClass === 'Hunter' ? 500 : 0,
        exp: 0, expToNext: 100,
    };

    let displayedHp   = player.hp;
    let displayedMana = player.mana;
    let displayedExp  = player.exp;

    // ── EXP / LEVELING ─────────────────────────────────────────
    function grantExp(amount) {
        player.exp += amount;
        while (player.exp >= player.expToNext) {
            player.exp -= player.expToNext;
            player.level++;
            player.expToNext = Math.floor(player.expToNext * 1.4);
            refreshMobHp();

            // 3 stat points per level, +1 more for every 10 levels (on top of rank points)
            let gainSp = 3 + Math.floor(player.level / 10);
            statPoints  += gainSp;
            skillPoints += 1;

            let prevB = (levelUpBanner && levelUpBanner.life > 0) ? levelUpBanner : null;
            levelUpBanner = {
                level: player.level,
                stat:  (prevB ? prevB.stat : 0) + gainSp,
                skill: (prevB ? prevB.skill : 0) + 1,
                life: 200
            };
        }
    }

    // Kill EXP now scales with your level so purple mobs never give "nothing"
    function mobMaxHp() { return Math.floor(100 * Math.pow(1.11, player.level - 1)); }
    function refreshMobHp() {
        for (let i = 0; i < enemies.length; i++) {
            let e = enemies[i];
            let r = e.maxHp > 0 ? e.hp / e.maxHp : 1;
            e.maxHp = mobMaxHp();
            if (e.alive) e.hp = Math.max(1, r * e.maxHp);
        }
    }

    function killExpValue() {
        return inDungeon
            ? Math.floor(30 + player.level * 4 + player.expToNext * 0.02)
            : Math.floor(45 + player.level * 6 + player.expToNext * 0.05);
    }

    function damageEnemy(e, dmg) {
        if (!e.alive) return;
        e.hp -= dmg;
        counters.damage += Math.floor(dmg);
        registerHit();
        if (e.hp <= 0) {
            e.alive = false;
            if (!inDungeon) e.deadTimer = Date.now();
            grantExp(killExpValue());
            totalKills++;
            registerKill();
        }
    }

    let camera = { x: 0, y: 0 };
    let keys   = {};

    let showHelp = false;

    window.addEventListener('keydown', function(e) {
        if (e.key.toLowerCase() === 'h') showHelp = !showHelp;
    });

    window.addEventListener('keydown', function(e) { keys[e.key.toLowerCase()] = true;  });
    window.addEventListener('keyup',   function(e) { keys[e.key.toLowerCase()] = false; });

    // E — enter dungeon near gate keeper
    window.addEventListener('keydown', function(e) {
        if (e.key.toLowerCase() !== 'e') return;
        if (!showInteractPrompt || inDungeon) return;
        let now = Date.now();
        if (now - lastDungeonClearTime < dungeonCooldownMs) return;
        inDungeon = true; dungeonWave = 0; dungeonEnemies = []; dungeonProjectiles = [];
        bossSpawned = false; dungeonComplete = false; dungeonClearBannerHideAt = 0;
        bossWarnEnd = 0; dungeonRunId++;
        dungeonRunStart = Date.now(); dungeonHit = false;
        player.x = DUNGEON_X + 200; player.y = DUNGEON_Y + 300;
        spawnDungeonWave();
    });

    // X — Examiner panel
    window.addEventListener('keydown', function(e) {
        if (e.key.toLowerCase() !== 'x') return;
        if (!showExaminerPrompt) return;
        showExaminerMenu = !showExaminerMenu;
    });

    // R — rank up
    window.addEventListener('keydown', function(e) {
        if (e.key.toLowerCase() !== 'r') return;
        if (!showExaminerPrompt) return;
        if (!questComplete()) return;
        if (isMaxRank()) return;
        doRankUp();
    });

    window.addEventListener('keydown', function(e) {
        if (e.key.toLowerCase() === 'c') {
            showStatMenu = !showStatMenu;
            if (showStatMenu) { showExaminerMenu = false; showSkillMenu = false; showJournal = false; }
        }
    });

    window.addEventListener('keydown', function(e) {
        if (e.key.toLowerCase() === 'k') {
            showSkillMenu = !showSkillMenu;
            if (showSkillMenu) { showStatMenu = false; showExaminerMenu = false; showJournal = false; }
        }
    });

    window.addEventListener('keydown', function(e) {
        if (e.key.toLowerCase() === 'j') {
            showJournal = !showJournal;
            if (showJournal) { showStatMenu = false; showExaminerMenu = false; showSkillMenu = false; }
        }
    });

    window.addEventListener('keydown', function(e) {
        if (!showInteractPrompt || inDungeon) return;
        let tiers = unlockedTiers();
        if (e.key.toLowerCase() === 'q') selectedTierIndex = Math.min(selectedTierIndex + 1, tiers.length - 1);
        if (e.key.toLowerCase() === 'z') selectedTierIndex = Math.max(selectedTierIndex - 1, 0);
    });

    // F — class special ability
    window.addEventListener('keydown', function(e) {
        if (e.key.toLowerCase() !== 'f') return;
        if (showStatMenu || showSkillMenu || showJournal || showExaminerMenu) return;
        let t = Date.now();
        if (player.level < SPECIAL.levelReq) {
            pushToast(SPECIAL.name.toUpperCase() + ' UNLOCKS AT LV.' + SPECIAL.levelReq, '#aaaaaa');
            return;
        }
        if (t < specialEnd || t < specialCdEnd) return;
        specialEnd = t + SPECIAL.duration;
        counters.special++;
        specialCdEnd = t + SPECIAL.cooldown;
        lastPulse = 0; lastAutoFire = 0;
        let cx = player.x + player.size / 2, cy = player.y + player.size / 2;
        if (playClass === 'Hunter') player.mana = player.maxMana;
        else player.hp = Math.min(player.maxHp, player.hp + player.maxHp * 0.15);
        effectRings.push({ x: cx, y: cy, radius: 10, maxRadius: 320, life: 40, maxLife: 40, color: SPECIAL.color });
        pushToast(SPECIAL.name.toUpperCase() + ' ACTIVATED', SPECIAL.color);
        achieveSound.currentTime = 0; achieveSound.play();
    });

    // Limit Break (Human)
    let hitCount            = 0;
    const HITS_FOR_LIMIT    = 15;
    let limitReady          = false;
    let limitBreakActive    = false;
    let limitBreakFrames    = 0;
    let limitDashVx         = 0;
    let limitDashVy         = 0;
    const LIMIT_BREAK_SPEED  = 28;
    const LIMIT_BREAK_FRAMES = 18;

    window.addEventListener('keydown', function(e) {
        if (e.code !== 'Space') return;
        if (playClass !== 'Human') return;
        if (!limitReady || limitBreakActive) return;
        e.preventDefault();

        limitReady       = false;
        hitCount         = 0;
        limitBreakActive = true;
        limitBreakFrames = LIMIT_BREAK_FRAMES;
        counters.limit++;

        let vx = 0, vy = 0;
        if (keys['w']) vy = -1;
        if (keys['s']) vy =  1;
        if (keys['a']) vx = -1;
        if (keys['d']) vx =  1;

        if (vx === 0 && vy === 0) {
            let cx = player.x + player.size / 2;
            let cy = player.y + player.size / 2;
            let dx = mouseX - cx;
            let dy = mouseY - cy;
            let d  = Math.sqrt(dx * dx + dy * dy) || 1;
            vx = dx / d; vy = dy / d;
        } else {
            let d = Math.sqrt(vx * vx + vy * vy);
            vx /= d; vy /= d;
        }

        limitDashVx = vx * LIMIT_BREAK_SPEED;
        limitDashVy = vy * LIMIT_BREAK_SPEED;

        for (let t = 0; t < 18; t++) {
            slashTrails.push({
                x: player.x + player.size / 2,
                y: player.y + player.size / 2,
                vx: (Math.random() - 0.5) * 6 + vx * 3,
                vy: (Math.random() - 0.5) * 6 + vy * 3,
                life: 22 + Math.floor(Math.random() * 12),
                maxLife: 34,
                size: 4 + Math.random() * 6,
            });
        }
    });

    let lastClickTime = 0;
    let clickCooldown = 260;

    let mouseX = 0;
    let mouseY = 0;

    canvas.addEventListener('mousemove', function(e) {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left + camera.x;
        mouseY = e.clientY - rect.top  + camera.y;
    });

    canvas.addEventListener('click', function(e) {
        // ── Stat menu clicks ────────────────────────────────────
        if (showStatMenu) {
            let mw       = 360;
            let rowCount = playClass === 'Hunter' ? 4 : 3;
            let mh       = 68 + rowCount * 52 + 36;
            let mx       = canvas.width / 2 - mw / 2;
            let my       = canvas.height / 2 - mh / 2;
            let rows     = playClass === 'Hunter' ? ['str','agi','dur','mana'] : ['str','agi','dur'];

            for (let i = 0; i < rows.length; i++) {
                let key  = rows[i];
                let btnX = mx + mw - 90;
                let btnY = my + 52 + i * 52 - 14;

                if (e.clientX >= btnX && e.clientX <= btnX + 72 &&
                    e.clientY >= btnY && e.clientY <= btnY + 24) {
                    if (statPoints <= 0) return;
                    statPoints--; stats[key]++; counters.spent++;
                    if (key === 'agi')  player.speed = 25 + stats.agi * 0.3;
                    if (key === 'dur')  { player.maxHp += 100; player.hp = Math.min(player.hp + 100, player.maxHp); }
                    if (key === 'mana') { player.maxMana += 50; player.mana = Math.min(player.mana + 50, player.maxMana); }
                }
            }
            return;
        }

        // ── Skill upgrade menu clicks ───────────────────────────
        if (showSkillMenu) {
            let mw = 420;
            let mh = 78 + skillDefsForClass.length * 50 + 20;
            let mx = canvas.width / 2 - mw / 2;
            let my = canvas.height / 2 - mh / 2;

            for (let i = 0; i < skillDefsForClass.length; i++) {
                let def = skillDefsForClass[i];
                let ry  = my + 66 + i * 50;
                let unlocked = player.level >= def.levelReq;
                let lvl = skillLevels[def.slot] || 0;
                let canUpgrade = unlocked && skillPoints > 0 && lvl < MAX_SKILL_LEVEL;

                let btnX = mx + mw - 96, btnY = ry - 12;
                if (canUpgrade && e.clientX >= btnX && e.clientX <= btnX + 76 &&
                    e.clientY >= btnY && e.clientY <= btnY + 24) {
                    skillPoints--;
                    skillLevels[def.slot] = lvl + 1;
                    if (lvl + 1 >= MAX_SKILL_LEVEL) {
                        // mastery reward
                        statPoints += 3;
                        pushToast('SKILL MASTERED: ' + def.name + ' (+3 stat pts)', '#ffe066');
                        achieveSound.currentTime = 0; achieveSound.play();
                    }
                }
            }
            return;
        }

        // ── Quest log clicks (TAKE QUEST) ───────────────────────
        if (showJournal) {
            let L = journalLayout();
            for (let i = 0; i < L.rows.length; i++) {
                let q = L.rows[i], ry = L.py + 84 + i * L.rowH;
                let bx = L.px + L.pw - 116, by = ry - 18;
                if (q.state === 'available' && e.clientX >= bx && e.clientX <= bx + 96 &&
                    e.clientY >= by && e.clientY <= by + 28) {
                    takeQuest(q);
                }
            }
            return;
        }
        if (showExaminerMenu) return;

        // ── basic attack ────────────────────────────────────────
        let now = Date.now();
        if (now - lastClickTime < clickCooldown) return;
        lastClickTime = now;

        let startX = player.x + player.size / 2;
        let startY = player.y + player.size / 2;
        let dx     = mouseX - startX;
        let dy     = mouseY - startY;
        let dist   = Math.sqrt(dx * dx + dy * dy);
        if (!dist) return;

        let baseDmg  = basicDamage() * specialDmgMult();
        if (humanBuffActive) baseDmg *= humanBuffDmgMult;

        projectiles.push({
            x: startX, y: startY,
            dx: (dx / dist) * 15,
            dy: (dy / dist) * 15,
            size: 6,
            distanceTraveled: 0,
            maxDistance: 800,
            dmg: baseDmg,
        });
    });

    // ── Skills ───────────────────────────────────────────────────
    function computeSkillDamage(def) {
        let baseDmg  = basicDamage() * specialDmgMult();
        let lvl      = skillLevels[def.slot] || 0;
        let dmg      = baseDmg * def.dmgMult * (1 + lvl * 0.12);
        if (playClass === 'Human' && humanBuffActive) dmg *= humanBuffDmgMult;
        return Math.floor(dmg);
    }

    function tryUseSkill(slotNum) {
        if (showStatMenu || showSkillMenu || showJournal) return;
        let def = skillDefsForClass[slotNum - 1];
        if (!def) return;
        if (player.level < def.levelReq) return;
        let now = Date.now();
        if (now < (skillCooldownEnd[slotNum] || 0)) return;
        if (playClass === 'Hunter' && !overloadOn() && player.mana < def.manaCost) return;

        let dmg = computeSkillDamage(def);
        if (playClass === 'Hunter' && !overloadOn()) { player.mana -= def.manaCost; counters.mana += def.manaCost; }
        counters.skillUses++;
        // mastered skills have 15% shorter cooldown
        skillCooldownEnd[slotNum] = now + def.cooldown * ((skillLevels[slotNum] || 0) >= MAX_SKILL_LEVEL ? 0.85 : 1);
        executeSkillEffect(def, dmg);
    }

    for (let n = 1; n <= 6; n++) {
        window.addEventListener('keydown', (function(slotNum) {
            return function(e) {
                if (e.key === String(slotNum)) tryUseSkill(slotNum);
            };
        })(n));
    }

    // damages everything in a radius, optional slow / stun (ms)
    function aoeHit(px, py, radius, dmg, slowMs, stunMs) {
        let tg = inDungeon ? dungeonEnemies : enemies;
        let t = Date.now();
        for (let i = 0; i < tg.length; i++) {
            let e = tg[i];
            if (!e.alive) continue;
            if (Math.hypot(e.x + e.size / 2 - px, e.y + e.size / 2 - py) < radius) {
                damageEnemy(e, dmg);
                if (slowMs) e.slowUntil = t + slowMs;
                if (stunMs) e.stunUntil = t + stunMs;
            }
        }
    }

    function addFx(o) { o.maxLife = o.life; skillFx.push(o); }
    function addShake(frames, mag) { shakeFrames = Math.max(shakeFrames, frames); shakeMag = Math.max(shakeMag, mag); }
    function makeCracks(n, segs) {
        let out = [];
        for (let k = 0; k < n; k++) {
            let ang = k * Math.PI * 2 / n + (Math.random() - 0.5) * 0.3, r = 0, pts = [{ x: 0, y: 0 }];
            for (let sI = 0; sI < segs; sI++) {
                r += (1 / segs) * (0.8 + Math.random() * 0.4);
                ang += (Math.random() - 0.5) * 0.35;
                pts.push({ x: Math.cos(ang) * r, y: Math.sin(ang) * r });
            }
            out.push(pts);
        }
        return out;
    }

    // every skill draws its own effect here
    function drawSkillFx() {
        for (let i = 0; i < skillFx.length; i++) {
            let f = skillFx[i];
            let p = 1 - f.life / f.maxLife;   // 0 -> 1
            let a = 1 - p;
            ctx.save();
            switch (f.type) {
                case 'flash': {
                    let g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
                    g.addColorStop(0, f.color); g.addColorStop(1, 'rgba(255,255,255,0)');
                    ctx.globalAlpha = a * 0.85; ctx.fillStyle = g;
                    ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (0.6 + p), 0, Math.PI * 2); ctx.fill();
                    break;
                }
                case 'ember': {
                    ctx.globalAlpha = a; ctx.fillStyle = f.color; ctx.shadowBlur = 8; ctx.shadowColor = f.color;
                    ctx.beginPath(); ctx.arc(f.x, f.y, f.r * a + 0.5, 0, Math.PI * 2); ctx.fill();
                    break;
                }
                case 'crossSlash': {          // Human 1: big X slashes
                    let n = f.big ? 4 : 1;
                    for (let k = 0; k < n; k++) {
                        ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.ang + k * Math.PI / 2);
                        let d = f.len * 0.65, arm = f.len * 0.5 * Math.min(1, p * 4 + 0.25) * 0.7;
                        ctx.globalAlpha = a; ctx.lineCap = 'round'; ctx.shadowBlur = 18; ctx.shadowColor = '#ffe680';
                        for (let sg = -1; sg <= 1; sg += 2) {
                            ctx.beginPath(); ctx.moveTo(d - arm, sg * arm); ctx.lineTo(d + arm, -sg * arm);
                            ctx.strokeStyle = 'rgba(255,230,128,0.85)'; ctx.lineWidth = 14 * a + 3; ctx.stroke();
                            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5 * a + 1; ctx.stroke();
                        }
                        ctx.restore();
                    }
                    break;
                }
                case 'thrust': {              // Human 2: spear lunge
                    let dx = f.x2 - f.x1, dy = f.y2 - f.y1, L = Math.hypot(dx, dy) || 1;
                    ctx.translate(f.x1, f.y1); ctx.rotate(Math.atan2(dy, dx));
                    ctx.globalAlpha = a; ctx.shadowBlur = 16; ctx.shadowColor = f.color;
                    for (let o = -1; o <= 1; o++) {
                        ctx.strokeStyle = 'rgba(85,221,255,0.4)'; ctx.lineWidth = 3;
                        ctx.beginPath(); ctx.moveTo(0, o * 12); ctx.lineTo(L, o * 12 * (1 - p * 0.6)); ctx.stroke();
                    }
                    let reach = L * Math.min(1, p * 3 + 0.3);
                    ctx.fillStyle = '#e6fbff';
                    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(reach - 26, -9 * a - 3); ctx.lineTo(reach + 14, 0); ctx.lineTo(reach - 26, 9 * a + 3); ctx.closePath(); ctx.fill();
                    break;
                }
                case 'whirl': {               // Human 3: spinning blades
                    ctx.translate(player.x + player.size / 2, player.y + player.size / 2);
                    ctx.globalAlpha = a; ctx.lineCap = 'round'; ctx.shadowBlur = 16; ctx.shadowColor = f.color;
                    let R = f.r * (0.45 + 0.55 * Math.min(1, p * 2.2));
                    for (let k = 0; k < 4; k++) {
                        let st = p * Math.PI * 5 + k * Math.PI / 2;
                        ctx.beginPath(); ctx.arc(0, 0, R, st, st + 1.1); ctx.strokeStyle = f.color; ctx.lineWidth = 12 * a + 3; ctx.stroke();
                        ctx.beginPath(); ctx.arc(0, 0, R, st + 0.55, st + 1.1); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4 * a + 1; ctx.stroke();
                    }
                    ctx.globalAlpha = a * 0.5; ctx.beginPath(); ctx.arc(0, 0, R * 0.55, -p * 6, -p * 6 + 2.2); ctx.lineWidth = 5; ctx.strokeStyle = f.color; ctx.stroke();
                    break;
                }
                case 'execute': {             // Human 4: guillotine slash + crosshair
                    ctx.translate(f.x, f.y); ctx.globalAlpha = a; ctx.shadowBlur = 20; ctx.shadowColor = '#ff0033';
                    let g = ctx.createRadialGradient(0, 0, 0, 0, 0, 70);
                    g.addColorStop(0, 'rgba(255,0,50,0.55)'); g.addColorStop(1, 'rgba(255,0,50,0)');
                    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 70, 0, Math.PI * 2); ctx.fill();
                    let sl = Math.min(1, p * 4 + 0.2); ctx.lineCap = 'round';
                    ctx.beginPath(); ctx.moveTo(-50, -90); ctx.lineTo(-50 + 100 * sl, -90 + 180 * sl);
                    ctx.strokeStyle = '#ff3355'; ctx.lineWidth = 12 * a + 3; ctx.stroke();
                    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4 * a + 1; ctx.stroke();
                    let cr = 50 * (1.4 - 0.6 * Math.min(1, p * 3));
                    ctx.strokeStyle = '#ff3355'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, cr, 0, Math.PI * 2); ctx.stroke();
                    for (let k = 0; k < 4; k++) {
                        let an = k * Math.PI / 2;
                        ctx.beginPath(); ctx.moveTo(Math.cos(an) * cr * 0.7, Math.sin(an) * cr * 0.7); ctx.lineTo(Math.cos(an) * cr * 1.4, Math.sin(an) * cr * 1.4); ctx.stroke();
                    }
                    break;
                }
                case 'fury': {                // Human 5: flame burst
                    ctx.translate(f.x, f.y); ctx.globalAlpha = a; ctx.shadowBlur = 18; ctx.shadowColor = '#ff9900';
                    let rr = 30 + 110 * p;
                    for (let k = 0; k < 14; k++) {
                        let an = k * Math.PI * 2 / 14 + p * 0.6;
                        ctx.fillStyle = k % 2 ? '#ffd000' : '#ff6a00';
                        ctx.beginPath();
                        ctx.moveTo(Math.cos(an - 0.12) * rr * 0.6, Math.sin(an - 0.12) * rr * 0.6);
                        ctx.lineTo(Math.cos(an) * rr * 1.25, Math.sin(an) * rr * 1.25);
                        ctx.lineTo(Math.cos(an + 0.12) * rr * 0.6, Math.sin(an + 0.12) * rr * 0.6);
                        ctx.closePath(); ctx.fill();
                    }
                    break;
                }
                case 'quake': {               // Human 6: ground slam with cracks
                    ctx.translate(f.x, f.y);
                    let R = f.r * Math.min(1, p * 2.2);
                    ctx.globalAlpha = a * 0.35; ctx.fillStyle = '#552200';
                    ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill();
                    ctx.globalAlpha = a; ctx.strokeStyle = f.color; ctx.lineWidth = 14 * a + 2; ctx.shadowBlur = 20; ctx.shadowColor = f.color;
                    ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
                    ctx.strokeStyle = '#ffb070'; ctx.lineWidth = 3; ctx.globalAlpha = Math.min(1, a * 1.6);
                    let lim = Math.min(1, p * 2.5);
                    for (let c = 0; c < f.cracks.length; c++) {
                        let pts = f.cracks[c], upto = Math.floor(lim * (pts.length - 1));
                        ctx.beginPath(); ctx.moveTo(0, 0);
                        for (let q = 1; q <= upto; q++) ctx.lineTo(pts[q].x * f.r, pts[q].y * f.r);
                        ctx.stroke();
                    }
                    break;
                }
                case 'shadow': {              // Hunter 2: dark afterimages + smoke
                    let n = 8;
                    for (let k = 0; k < n; k++) {
                        let t = k / (n - 1);
                        let gx = f.x1 + (f.x2 - f.x1) * t, gy = f.y1 + (f.y2 - f.y1) * t;
                        ctx.globalAlpha = a * (0.15 + 0.5 * t); ctx.fillStyle = k % 2 ? '#6a2bd9' : '#2a0f55';
                        ctx.shadowBlur = 14; ctx.shadowColor = f.color;
                        ctx.fillRect(gx - player.size / 2, gy - player.size / 2, player.size, player.size);
                    }
                    ctx.shadowBlur = 0;
                    ctx.globalAlpha = a * 0.4; ctx.fillStyle = '#7a3cff';
                    ctx.beginPath(); ctx.arc(f.x1, f.y1, 40 * (1 + p), 0, Math.PI * 2); ctx.fill();
                    ctx.globalAlpha = a * 0.5; ctx.fillStyle = '#b06bff';
                    ctx.beginPath(); ctx.arc(f.x2, f.y2, 55 * (1 + p * 0.6), 0, Math.PI * 2); ctx.fill();
                    break;
                }
                case 'frost': {               // Hunter 3: ice shards + snowflake
                    ctx.translate(f.x, f.y);
                    let R = f.r * Math.min(1, p * 2.5);
                    ctx.shadowBlur = 14; ctx.shadowColor = '#66e6ff';
                    ctx.globalAlpha = a * 0.25; ctx.fillStyle = '#aef2ff';
                    ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill();
                    ctx.globalAlpha = a;
                    for (let k = 0; k < 16; k++) {
                        let an = k * Math.PI * 2 / 16, len = R * (k % 2 ? 0.8 : 1);
                        ctx.fillStyle = k % 2 ? '#bff6ff' : '#ffffff';
                        ctx.beginPath();
                        ctx.moveTo(Math.cos(an - 0.07) * R * 0.25, Math.sin(an - 0.07) * R * 0.25);
                        ctx.lineTo(Math.cos(an) * len, Math.sin(an) * len);
                        ctx.lineTo(Math.cos(an + 0.07) * R * 0.25, Math.sin(an + 0.07) * R * 0.25);
                        ctx.closePath(); ctx.fill();
                    }
                    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3;
                    for (let k = 0; k < 6; k++) {
                        let an = k * Math.PI / 3, cx = Math.cos(an), cy = Math.sin(an);
                        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(cx * 44, cy * 44);
                        ctx.moveTo(cx * 28, cy * 28); ctx.lineTo(Math.cos(an + 0.6) * 40, Math.sin(an + 0.6) * 40);
                        ctx.moveTo(cx * 28, cy * 28); ctx.lineTo(Math.cos(an - 0.6) * 40, Math.sin(an - 0.6) * 40);
                        ctx.stroke();
                    }
                    break;
                }
                case 'lightning': {           // Hunter 4: jagged bolts between targets
                    let zig = [];
                    for (let j = 0; j < f.pts.length - 1; j++) {
                        let A = f.pts[j], B = f.pts[j + 1], dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1;
                        let nx = -dy / L, ny = dx / L, steps = 8;
                        for (let t = 0; t <= steps; t++) {
                            let k = t / steps, jag = (t === 0 || t === steps) ? 0 : (Math.random() - 0.5) * 34;
                            zig.push({ x: A.x + dx * k + nx * jag, y: A.y + dy * k + ny * jag });
                        }
                    }
                    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
                    let passes = [[f.color, 10, 0.35], [f.color, 4, 0.9], ['#ffffff', 1.8, 1]];
                    for (let q = 0; q < passes.length; q++) {
                        ctx.globalAlpha = passes[q][2] * Math.min(1, a * 1.5); ctx.strokeStyle = passes[q][0]; ctx.lineWidth = passes[q][1];
                        ctx.shadowBlur = q === 0 ? 20 : 0; ctx.shadowColor = f.color;
                        ctx.beginPath();
                        for (let z = 0; z < zig.length; z++) { if (z === 0) ctx.moveTo(zig[z].x, zig[z].y); else ctx.lineTo(zig[z].x, zig[z].y); }
                        ctx.stroke();
                    }
                    break;
                }
                case 'runes': {               // Hunter 6: rune circle + pentagram
                    ctx.translate(f.x, f.y);
                    let R = f.r * Math.min(1, p * 2);
                    if (p < 0.15) { ctx.globalAlpha = (0.15 - p) / 0.15 * 0.5; ctx.fillStyle = '#ffffff'; ctx.fillRect(-3000, -3000, 6000, 6000); }
                    let g = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(1, R));
                    g.addColorStop(0, 'rgba(255,34,85,0.55)'); g.addColorStop(1, 'rgba(90,0,30,0.1)');
                    ctx.globalAlpha = a; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill();
                    ctx.rotate(p * 3); ctx.strokeStyle = f.color; ctx.lineWidth = 4; ctx.shadowBlur = 22; ctx.shadowColor = f.color;
                    ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
                    ctx.beginPath(); ctx.arc(0, 0, R * 0.82, 0, Math.PI * 2); ctx.stroke();
                    ctx.beginPath();
                    for (let k = 0; k <= 5; k++) {
                        let an = (k * 2 % 5) * Math.PI * 2 / 5 - Math.PI / 2;
                        if (k === 0) ctx.moveTo(Math.cos(an) * R * 0.82, Math.sin(an) * R * 0.82); else ctx.lineTo(Math.cos(an) * R * 0.82, Math.sin(an) * R * 0.82);
                    }
                    ctx.stroke();
                    for (let k = 0; k < 24; k++) {
                        let an = k * Math.PI * 2 / 24;
                        ctx.beginPath(); ctx.moveTo(Math.cos(an) * R * 0.86, Math.sin(an) * R * 0.86); ctx.lineTo(Math.cos(an) * R * 0.97, Math.sin(an) * R * 0.97); ctx.stroke();
                    }
                    break;
                }
            }
            ctx.restore();
        }
    }

    function executeSkillEffect(def, dmg) {
        let M = (skillLevels[def.slot] || 0) >= MAX_SKILL_LEVEL;   // mastered?
        let targets = inDungeon ? dungeonEnemies : enemies;
        let px = player.x + player.size / 2, py = player.y + player.size / 2;
        let dx = mouseX - px, dy = mouseY - py;
        let dist = Math.sqrt(dx * dx + dy * dy) || 1;
        let ux = dx / dist, uy = dy / dist, aim = Math.atan2(uy, ux);

        switch (def.type) {
            case 'pierce': {
                let offs = M ? [-0.12, 0, 0.12] : [0];
                for (let k = 0; k < offs.length; k++) {
                    let a = aim + offs[k];
                    skillProjectiles.push({ x: px, y: py, dx: Math.cos(a) * 17, dy: Math.sin(a) * 17, size: M ? 12 : 9, distanceTraveled: 0, maxDistance: M ? 1400 : 950, dmg: M ? dmg * 1.15 : dmg, color: def.color, shape: 'bolt', hitSet: new Set() });
                }
                addFx({ type: 'flash', x: px + ux * 34, y: py + uy * 34, r: 40, color: def.color, life: 10 });
                break;
            }
            case 'multi': {
                let count = (def.count || 5) + (M ? 4 : 0);
                for (let i = 0; i < count; i++) {
                    let angle = aim + (i - (count - 1) / 2) * 0.17;
                    skillProjectiles.push({ x: px, y: py, dx: Math.cos(angle) * 13, dy: Math.sin(angle) * 13, size: 9, distanceTraveled: 0, maxDistance: 750, dmg: dmg * 0.7 * (M ? 1.2 : 1), color: def.color, shape: 'void', hitSet: new Set() });
                }
                addFx({ type: 'flash', x: px, y: py, r: 60, color: def.color, life: 12 });
                break;
            }
            case 'chain': {
                let cx = px, cy = py, pts = [{ x: px, y: py }];
                let remaining = targets.filter(function(e) { return e.alive; });
                let bouncesLeft = (def.bounces || 3) + (M ? 3 : 0);
                let curDmg = dmg;
                while (bouncesLeft > 0 && remaining.length) {
                    let nearest = null, nd = Infinity;
                    for (let i = 0; i < remaining.length; i++) {
                        let e = remaining[i];
                        let d = Math.hypot(e.x + e.size / 2 - cx, e.y + e.size / 2 - cy);
                        if (d < nd) { nd = d; nearest = e; }
                    }
                    if (!nearest || nd > 550) break;
                    damageEnemy(nearest, curDmg);
                    cx = nearest.x + nearest.size / 2; cy = nearest.y + nearest.size / 2;
                    pts.push({ x: cx, y: cy });
                    addFx({ type: 'flash', x: cx, y: cy, r: 36, color: def.color, life: 12 });
                    remaining = remaining.filter(function(e) { return e !== nearest && e.alive; });
                    curDmg *= M ? 0.92 : 0.8;
                    bouncesLeft--;
                }
                if (pts.length < 2) pts.push({ x: px + ux * 220, y: py + uy * 220 });
                addFx({ type: 'lightning', pts: pts, color: def.color, life: 18 });
                break;
            }
            case 'aoe': {
                let radius = (def.radius || 160) * (M ? 1.4 : 1);
                aoeHit(px, py, radius, dmg, def.slow ? (M ? 5000 : 3000) : 0, (M && def.slow) ? 1500 : 0);
                if (def.slow) {
                    addFx({ type: 'frost', x: px, y: py, r: radius, life: 36 });               // Frost Nova
                } else {
                    addFx({ type: 'whirl', r: radius, color: def.color, life: 30 });            // Whirlwind
                    if (M) {
                        setTimeout(function() {
                            aoeHit(player.x + player.size / 2, player.y + player.size / 2, radius, dmg * 0.8, 0, 0);
                            addFx({ type: 'whirl', r: radius, color: def.color, life: 30 });
                        }, 250);
                    }
                }
                break;
            }
            case 'dash_crit':
            case 'dash_line': {
                let dashDist = M ? 320 : 220;
                player.x = Math.max(0, Math.min(WORLD_WIDTH - player.size, player.x + ux * dashDist));
                player.y = Math.max(0, Math.min(WORLD_HEIGHT - player.size, player.y + uy * dashDist));
                let npx = player.x + player.size / 2, npy = player.y + player.size / 2;
                if (def.type === 'dash_crit') addFx({ type: 'shadow', x1: px, y1: py, x2: npx, y2: npy, color: def.color, life: 28 });
                else addFx({ type: 'thrust', x1: px, y1: py, x2: npx, y2: npy, color: def.color, life: 20 });
                let hitR = M ? 190 : 145;
                for (let i = 0; i < targets.length; i++) {
                    let e = targets[i];
                    if (!e.alive) continue;
                    if (Math.hypot(e.x + e.size / 2 - npx, e.y + e.size / 2 - npy) < hitR) {
                        damageEnemy(e, dmg * (def.type === 'dash_crit' ? 1.5 : 1));
                    }
                }
                break;
            }
            case 'melee_cone': {
                let range = (def.range || 140) * (M ? 1.4 : 1);
                for (let i = 0; i < targets.length; i++) {
                    let e = targets[i];
                    if (!e.alive) continue;
                    let edx = e.x + e.size / 2 - px, edy = e.y + e.size / 2 - py;
                    let ed = Math.hypot(edx, edy) || 1;
                    if (ed < range && ((edx / ed) * ux + (edy / ed) * uy) > (M ? -1.1 : 0.25)) damageEnemy(e, dmg);
                }
                addFx({ type: 'crossSlash', x: px, y: py, ang: aim, len: range, big: M, life: 16 });
                break;
            }
            case 'execute': {
                let nearest = null, nd = Infinity;
                for (let i = 0; i < targets.length; i++) {
                    let e = targets[i];
                    if (!e.alive) continue;
                    let d = Math.hypot(e.x + e.size / 2 - px, e.y + e.size / 2 - py);
                    if (d < nd && d < 420) { nd = d; nearest = e; }
                }
                if (nearest) {
                    let finalDmg = dmg;
                    if (nearest.hp / nearest.maxHp < (M ? 0.5 : 0.3)) finalDmg *= (def.execBonus || 2);
                    damageEnemy(nearest, finalDmg);
                    addFx({ type: 'execute', x: nearest.x + nearest.size / 2, y: nearest.y + nearest.size / 2, life: 24 });
                    if (M && !nearest.alive) { skillCooldownEnd[def.slot] = 0; pushToast('EXECUTION - COOLDOWN RESET', def.color); }
                }
                break;
            }
            case 'buff': {
                humanBuffActive    = true;
                humanBuffEndTime   = Date.now() + (def.duration || 8000) + (M ? 4000 : 0);
                humanBuffDmgMult   = 1 + (def.dmgBuff || 0.4);
                humanBuffSpeedMult = 1 + (def.spdBuff || 0.3);
                if (M) player.hp = Math.min(player.maxHp, player.hp + player.maxHp * 0.25);
                addFx({ type: 'fury', x: px, y: py, life: 30 });
                for (let k = 0; k < 22; k++) {
                    addFx({ type: 'ember', x: px, y: py, vx: (Math.random() - 0.5) * 6, vy: -1 - Math.random() * 4, r: 3 + Math.random() * 4, life: 30, color: Math.random() < 0.5 ? '#ffd000' : '#ff6a00' });
                }
                break;
            }
            case 'ultimate': {
                let radius = def.radius || 260;
                let blast = function(mult, stun) {
                    let cx = player.x + player.size / 2, cy = player.y + player.size / 2;
                    aoeHit(cx, cy, radius, dmg * mult, 0, stun);
                    if (playClass === 'Human') addFx({ type: 'quake', x: cx, y: cy, r: radius, color: def.color, cracks: makeCracks(11, 7), life: 46 });
                    else addFx({ type: 'runes', x: cx, y: cy, r: radius, color: def.color, life: 50 });
                    addShake(18, 14);
                };
                blast(1, M ? 1500 : 0);
                if (M) setTimeout(function() { blast(0.7, 1500); }, 600);
                break;
            }
        }
    }

    let worldObjects = [
        { x: 800,  y: 800,  w: 60, h: 60, color: '#fff'    },
        { x: 1500, y: 1200, w: 80, h: 40, color: '#ffeeff' },
        { x: 400,  y: 1800, w: 50, h: 50, color: '#fffeff' },
        { x: 2200, y: 600,  w: 70, h: 70, color: '#fff'    },
    ];

    let mapProps = [];
    (function generateMapProps() {
        let types = ['tree', 'rock', 'ruin'];
        for (let i = 0; i < 220; i++) {
            let x = Math.random() * WORLD_WIDTH;
            let y = Math.random() * WORLD_HEIGHT;
            if (Math.hypot(x - npcZone.x, y - npcZone.y) < 260) continue;
            if (Math.hypot(x - examinerZone.x, y - examinerZone.y) < 260) continue;
            if (Math.hypot(x - WORLD_WIDTH/2, y - WORLD_HEIGHT/2) < 220) continue;
            mapProps.push({ x: x, y: y, type: types[Math.floor(Math.random() * types.length)], scale: 0.7 + Math.random() * 0.9, rot: Math.random() * Math.PI * 2 });
        }
    })();

    function drawMapProps() {
        for (let i = 0; i < mapProps.length; i++) {
            let p = mapProps[i];
            if (p.x < camera.x - 100 || p.x > camera.x + canvas.width + 100) continue;
            if (p.y < camera.y - 100 || p.y > camera.y + canvas.height + 100) continue;

            if (p.type === 'tree') {
                ctx.fillStyle = '#2a1a10';
                ctx.fillRect(p.x - 4 * p.scale, p.y, 8 * p.scale, 22 * p.scale);
                ctx.fillStyle = 'rgba(30, 90, 45, 0.85)';
                ctx.beginPath(); ctx.arc(p.x, p.y - 6 * p.scale, 20 * p.scale, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = 'rgba(40, 120, 60, 0.7)';
                ctx.beginPath(); ctx.arc(p.x - 8 * p.scale, p.y - 14 * p.scale, 13 * p.scale, 0, Math.PI * 2); ctx.fill();
            } else if (p.type === 'rock') {
                ctx.fillStyle = 'rgba(90, 90, 100, 0.55)';
                ctx.beginPath();
                ctx.moveTo(p.x - 14 * p.scale, p.y + 8 * p.scale);
                ctx.lineTo(p.x - 6 * p.scale, p.y - 10 * p.scale);
                ctx.lineTo(p.x + 8 * p.scale, p.y - 12 * p.scale);
                ctx.lineTo(p.x + 15 * p.scale, p.y + 6 * p.scale);
                ctx.closePath(); ctx.fill();
            } else {
                ctx.strokeStyle = 'rgba(180, 160, 110, 0.35)';
                ctx.lineWidth = 2;
                ctx.strokeRect(p.x - 16 * p.scale, p.y - 16 * p.scale, 32 * p.scale, 32 * p.scale);
                ctx.beginPath();
                ctx.moveTo(p.x - 16 * p.scale, p.y - 16 * p.scale);
                ctx.lineTo(p.x + 16 * p.scale, p.y + 16 * p.scale);
                ctx.stroke();
            }
        }
    }

    function spawnEnemies() {
        for (let i = 0; i < 15; i++) {
            enemies.push({
                x: enemyZone.x + Math.random() * enemyZone.w,
                y: enemyZone.y + Math.random() * enemyZone.h,
                size: 30, color: "#b030ff", alive: true,
                hp: mobMaxHp(), maxHp: mobMaxHp(), deadTimer: null
            });
        }
    }
    spawnEnemies();

    function registerHit() {
        if (playClass !== 'Human' || limitReady || limitBreakActive) return;
        hitCount++;
        if (hitCount >= HITS_FOR_LIMIT) { limitReady = true; hitCount = HITS_FOR_LIMIT; }
    }

    function registerKill() {
        let q = currentQuest();
        if (q && rankUpProgress.kills < q.killsNeeded) {
            rankUpProgress.kills++;
        }
    }

    function update() {
        let hpAtFrameStart = player.hp;

        if (player.hp <= 0 && !isDead) {
            isDead = true; isDead = false;
            player.hp = player.maxHp;
            player.x  = WORLD_WIDTH / 2; player.y = WORLD_HEIGHT / 2;
            inDungeon = false; dungeonEnemies = []; dungeonProjectiles = []; projectiles = []; skillProjectiles = [];
            bossWarnEnd = 0; dungeonRunId++; specialEnd = 0;
            limitBreakActive = false; limitBreakFrames = 0;
        }

        if (showRankUpOverlay && rankUpOverlayTimer > 0) {
            rankUpOverlayTimer--;
            if (rankUpOverlayTimer <= 0) showRankUpOverlay = false;
        }

        if (playClass === 'Hunter') {
            player.mana = Math.min(player.maxMana, player.mana + 0.14);
        }

        if (humanBuffActive && Date.now() >= humanBuffEndTime) {
            humanBuffActive = false; humanBuffDmgMult = 1; humanBuffSpeedMult = 1;
        }

        // ── Special ability effects ──
        let nowS = Date.now();
        if (nowS < specialEnd) {
            let pcx = player.x + player.size / 2, pcy = player.y + player.size / 2;
            if (playClass === 'Hunter') {
                // Mana Overload: fast mana regen + auto-firing piercing bolts
                player.mana = Math.min(player.maxMana, player.mana + 0.6);
                if (nowS - lastAutoFire > 220) {
                    let tg = inDungeon ? dungeonEnemies : enemies, best = null, bd = 750;
                    for (let i = 0; i < tg.length; i++) {
                        let e = tg[i]; if (!e.alive) continue;
                        let d = Math.hypot(e.x + e.size / 2 - pcx, e.y + e.size / 2 - pcy);
                        if (d < bd) { bd = d; best = e; }
                    }
                    if (best) {
                        lastAutoFire = nowS;
                        let ddx = best.x + best.size / 2 - pcx, ddy = best.y + best.size / 2 - pcy;
                        let dd = Math.hypot(ddx, ddy) || 1;
                        skillProjectiles.push({ x: pcx, y: pcy, dx: ddx / dd * 16, dy: ddy / dd * 16, size: 6, distanceTraveled: 0, maxDistance: 800, dmg: basicDamage() * 1.3, color: SPECIAL.color, shape: 'spark', hitSet: new Set() });
                    }
                }
            } else if (nowS - lastPulse > 500) {
                // Unbreakable: damage pulse every 0.5s
                lastPulse = nowS;
                aoeHit(pcx, pcy, 230, basicDamage() * 2, 0, 0);
                effectRings.push({ x: pcx, y: pcy, radius: 10, maxRadius: 230, life: 22, maxLife: 22, color: SPECIAL.color });
            }
        }

        let baseSpeed = 15 + stats.agi * 0.3;
        player.speed  = baseSpeed * (playClass === 'Human' && humanBuffActive ? humanBuffSpeedMult : 1);

        checkJournalQuests();

        displayedHp   += (player.hp - displayedHp) * 0.15;
        displayedMana += (player.mana - displayedMana) * 0.15;
        displayedExp  += (player.exp - displayedExp) * 0.15;

        for (let i = toastQueue.length - 1; i >= 0; i--) {
            toastQueue[i].life--;
            if (toastQueue[i].life <= 0) toastQueue.splice(i, 1);
        }

        // Limit Break dash
        if (limitBreakActive) {
            player.x += limitDashVx;
            player.y += limitDashVy;
            limitBreakFrames--;

            if (limitBreakFrames % 2 === 0) {
                for (let t = 0; t < 5; t++) {
                    slashTrails.push({
                        x: player.x + player.size / 2 + (Math.random() - 0.5) * 20,
                        y: player.y + player.size / 2 + (Math.random() - 0.5) * 20,
                        vx: (Math.random() - 0.5) * 3,
                        vy: (Math.random() - 0.5) * 3,
                        life: 14 + Math.floor(Math.random() * 8),
                        maxLife: 22,
                        size: 3 + Math.random() * 5,
                    });
                }
            }

            let limitDmg = 160 + stats.str * 3;
            let px = player.x + player.size / 2;
            let py = player.y + player.size / 2;
            let hitEnemyList = inDungeon ? dungeonEnemies : enemies;
            for (let j = 0; j < hitEnemyList.length; j++) {
                let e = hitEnemyList[j];
                if (!e.alive) continue;
                let ex = e.x + e.size / 2, ey = e.y + e.size / 2;
                let d  = Math.sqrt((px - ex) * (px - ex) + (py - ey) * (py - ey));
                if (d < player.size / 2 + e.size / 2 + 20) {
                    if (!e._limitHitThisDash) {
                        e._limitHitThisDash = true;
                        damageEnemy(e, limitDmg);
                    }
                }
            }

            if (limitBreakFrames <= 0) {
                limitBreakActive = false;
                let allE = inDungeon ? dungeonEnemies : enemies;
                for (let j = 0; j < allE.length; j++) delete allE[j]._limitHitThisDash;
            }
        }

        if (!limitBreakActive) {
            if (keys['w']) player.y -= player.speed;
            if (keys['s']) player.y += player.speed;
            if (keys['a']) player.x -= player.speed;
            if (keys['d']) player.x += player.speed;
        }

        player.x = Math.max(0, Math.min(WORLD_WIDTH  - player.size, player.x));
        player.y = Math.max(0, Math.min(WORLD_HEIGHT - player.size, player.y));

        camera.x = player.x - canvas.width  / 2 + player.size / 2;
        camera.y = player.y - canvas.height / 2 + player.size / 2;
        camera.x = Math.max(0, Math.min(WORLD_WIDTH  - canvas.width,  camera.x));
        camera.y = Math.max(0, Math.min(WORLD_HEIGHT - canvas.height, camera.y));

        // Gate Keeper proximity
        let npcCX = npcZone.x + npcZone.w / 2;
        let npcCY = npcZone.y + npcZone.h / 2;
        let plCX  = player.x + player.size / 2;
        let plCY  = player.y + player.size / 2;
        showInteractPrompt = Math.sqrt((plCX - npcCX) * (plCX - npcCX) + (plCY - npcCY) * (plCY - npcCY)) < 120;

        // Examiner proximity
        let exCX = examinerZone.x + examinerZone.w / 2;
        let exCY = examinerZone.y + examinerZone.h / 2;
        showExaminerPrompt = Math.sqrt((plCX - exCX) * (plCX - exCX) + (plCY - exCY) * (plCY - exCY)) < 140;
        if (!showExaminerPrompt) showExaminerMenu = false;

        let nowMs = Date.now();
        for (let i = 0; i < enemies.length; i++) {
            let e = enemies[i];
            if (!e.alive && e.deadTimer !== null && nowMs - e.deadTimer >= 8000) {
                e.alive = true; e.maxHp = mobMaxHp(); e.hp = e.maxHp; e.deadTimer = null;
                e.x = enemyZone.x + Math.random() * enemyZone.w;
                e.y = enemyZone.y + Math.random() * enemyZone.h;
            }
        }

        for (let i = slashTrails.length - 1; i >= 0; i--) {
            let t = slashTrails[i];
            t.x += t.vx; t.y += t.vy; t.life--;
            if (t.life <= 0) slashTrails.splice(i, 1);
        }

        for (let i = skillFx.length - 1; i >= 0; i--) {
            let f = skillFx[i];
            if (f.vy !== undefined) { f.x += f.vx || 0; f.y += f.vy; }
            f.life--;
            if (f.life <= 0) skillFx.splice(i, 1);
        }
        if (shakeFrames > 0) { shakeFrames--; if (shakeFrames === 0) shakeMag = 0; }
        // class auras: embers rising off the player while buffs / specials are active
        if (humanBuffActive && Math.random() < 0.7) {
            addFx({ type: 'ember', x: player.x + player.size / 2 + (Math.random() - 0.5) * 26, y: player.y + player.size, vx: (Math.random() - 0.5) * 0.8, vy: -1.2 - Math.random() * 1.6, r: 3 + Math.random() * 3, life: 26, color: Math.random() < 0.5 ? '#ffd000' : '#ff6a00' });
        }
        if (Date.now() < specialEnd && Math.random() < 0.8) {
            addFx({ type: 'ember', x: player.x + player.size / 2 + (Math.random() - 0.5) * 30, y: player.y + player.size / 2, vx: (Math.random() - 0.5) * 1.2, vy: -1 - Math.random() * 1.5, r: 3 + Math.random() * 3, life: 28, color: playClass === 'Hunter' ? '#c9a8ff' : '#ffe27a' });
        }
        for (let i = effectRings.length - 1; i >= 0; i--) {
            effectRings[i].life--;
            if (effectRings[i].life <= 0) effectRings.splice(i, 1);
        }

        // dungeon banner finished -> back to the Gate Keeper
        if (dungeonComplete && dungeonClearBannerHideAt > 0 && nowMs >= dungeonClearBannerHideAt) {
            dungeonComplete          = false;
            inDungeon                = false;
            dungeonClearBannerHideAt = 0;
            player.x = npcZone.x + 45;
            player.y = npcZone.y + 140;
            dungeonEnemies = []; dungeonProjectiles = []; projectiles = []; skillProjectiles = [];
        }

        // basic-attack projectiles
        for (let i = projectiles.length - 1; i >= 0; i--) {
            let p = projectiles[i];
            p.x += p.dx; p.y += p.dy;
            p.distanceTraveled += Math.sqrt(p.dx * p.dx + p.dy * p.dy);
            let hit = false;

            let targetList = inDungeon ? dungeonEnemies : enemies;
            for (let j = targetList.length - 1; j >= 0; j--) {
                let e = targetList[j];
                if (!e.alive) continue;
                let ex   = e.x + e.size / 2;
                let ey   = e.y + e.size / 2;
                let dist = Math.sqrt((p.x - ex) * (p.x - ex) + (p.y - ey) * (p.y - ey));
                if (dist < p.size + e.size / 2) {
                    damageEnemy(e, p.dmg);
                    hit = true; break;
                }
            }
            if (hit || p.distanceTraveled > p.maxDistance) projectiles.splice(i, 1);
        }

        // skill projectiles (pierce via hitSet)
        for (let i = skillProjectiles.length - 1; i >= 0; i--) {
            let p = skillProjectiles[i];
            p.x += p.dx; p.y += p.dy;
            p.distanceTraveled += Math.sqrt(p.dx * p.dx + p.dy * p.dy);

            let targetList = inDungeon ? dungeonEnemies : enemies;
            for (let j = 0; j < targetList.length; j++) {
                let e = targetList[j];
                if (!e.alive || p.hitSet.has(e)) continue;
                let ex = e.x + e.size / 2, ey = e.y + e.size / 2;
                let dist = Math.sqrt((p.x - ex) * (p.x - ex) + (p.y - ey) * (p.y - ey));
                if (dist < p.size + e.size / 2) {
                    damageEnemy(e, p.dmg);
                    p.hitSet.add(e);
                }
            }
            if (p.distanceTraveled > p.maxDistance) skillProjectiles.splice(i, 1);
        }

        if (inDungeon) {
            let now = Date.now();

            for (let i = 0; i < dungeonEnemies.length; i++) {
                let e = dungeonEnemies[i];
                if (!e.alive) continue;
                if (e.stunUntil && now < e.stunUntil) continue;   // frozen / stunned
                let slowed = e.slowUntil && now < e.slowUntil;
                let speedMod = slowed ? 0.35 : 1;

                if (e.type === 'rusher') {
                    let dx = player.x - e.x, dy = player.y - e.y;
                    let d  = Math.sqrt(dx * dx + dy * dy);
                    e.x += (dx / d) * 2.5 * speedMod; e.y += (dy / d) * 2.5 * speedMod;
                    if (d < e.size + player.size) player.hp = Math.max(0, player.hp - 0.3 * tierDmg());
                }

                if (e.type === 'shooter' && now - e.lastShot > 5000) {
                    e.lastShot = now;
                    let dx = player.x - e.x, dy = player.y - e.y;
                    let d  = Math.sqrt(dx * dx + dy * dy);
                    dungeonProjectiles.push({ x: e.x, y: e.y, dx: (dx/d)*4, dy: (dy/d)*4, size: 8, distanceTraveled: 0, maxDistance: 1200 });
                }

                if (e.type === 'boss') {
                    let enraged = e.hp / e.maxHp < 0.5;
                    if (enraged) e.color = '#ff7700';
                    if (now - e.lastShot > (enraged ? 1400 : 2500)) {
                        e.lastShot = now;
                        let dx = player.x - e.x, dy = player.y - e.y;
                        let d  = Math.sqrt(dx * dx + dy * dy);
                        let offsets = enraged ? [-0.5, -0.25, 0, 0.25, 0.5] : [-0.3, 0, 0.3];
                        for (let o = 0; o < offsets.length; o++) {
                            dungeonProjectiles.push({ x: e.x, y: e.y, dx: (dx/d + offsets[o])*5, dy: (dy/d + offsets[o])*5, size: 10, distanceTraveled: 0, maxDistance: 1400 });
                        }
                    }

                    if (!e.charging && now - e.chargeTimer > e.chargeCooldown) {
                        e.charging = true; e.chargeTimer = now; e.chargeFrames = 40;
                        let dx = player.x - e.x, dy = player.y - e.y;
                        let d  = Math.sqrt(dx * dx + dy * dy);
                        e.chargeDx = (dx / d) * 28; e.chargeDy = (dy / d) * 28;
                    }

                    if (e.charging) {
                        e.x += e.chargeDx; e.y += e.chargeDy;
                        e.chargeFrames--;
                        if (e.chargeFrames <= 0) e.charging = false;
                    } else {
                        let dx = player.x - e.x, dy = player.y - e.y;
                        let d  = Math.sqrt(dx * dx + dy * dy);
                        e.x += (dx / d) * 1.2; e.y += (dy / d) * 1.2;
                    }

                    let bdx = player.x - e.x, bdy = player.y - e.y;
                    if (Math.sqrt(bdx * bdx + bdy * bdy) < e.size + player.size) {
                        player.hp = Math.max(0, player.hp - (e.charging ? 2.5 : 0.8) * tierDmg());
                    }
                }
            }

            for (let i = dungeonProjectiles.length - 1; i >= 0; i--) {
                let p = dungeonProjectiles[i];
                p.x += p.dx; p.y += p.dy;
                p.distanceTraveled += Math.sqrt(p.dx * p.dx + p.dy * p.dy);
                let dx = p.x - (player.x + player.size / 2);
                let dy = p.y - (player.y + player.size / 2);
                if (Math.sqrt(dx * dx + dy * dy) < p.size + player.size / 2) {
                    player.hp = Math.max(0, player.hp - 80 * tierDmg());
                    dungeonProjectiles.splice(i, 1); continue;
                }
                if (p.distanceTraveled > p.maxDistance) dungeonProjectiles.splice(i, 1);
            }

            let allDead = true;
            for (let i = 0; i < dungeonEnemies.length; i++) {
                if (dungeonEnemies[i].alive) { allDead = false; break; }
            }

            if (!waveCleared && allDead) {
                waveCleared = true;
                if (dungeonWave < bossWaveNum()) {
                    // 5 second warning before the boss, 2 seconds between normal waves
                    let delay = dungeonWave === normalWaves() ? 5000 : 2000;
                    if (dungeonWave === normalWaves()) bossWarnEnd = Date.now() + 5000;
                    let rid = dungeonRunId;
                    setTimeout(function() {
                        if (rid === dungeonRunId && inDungeon) spawnDungeonWave();
                    }, delay);
                } else {
                    dungeonComplete          = true;
                    lastDungeonClearTime     = Date.now();
                    dungeonClearBannerHideAt = Date.now() + 4000;

                    let tier = DUNGEON_TIERS[selectedTierIndex];
                    lastDungeonExp = dungeonExpFor(tier, selectedTierIndex);
                    grantExp(lastDungeonExp);
                    totalDungeonClears++;
                    counters.clearsByRank[tier.rank] = (counters.clearsByRank[tier.rank] || 0) + 1;
                    if (!dungeonHit) counters.flawless++;
                    if (Date.now() - dungeonRunStart < 120000) counters.fast++;

                    let q = currentQuest();
                    if (q && tier.rank === q.dungeonRank) {
                        rankUpProgress.dungeonClears++;
                        rankUpProgress.lastClearedRank = tier.rank;
                    }
                }
            }
        }

        // Unbreakable: no damage taken while active
        if (playClass === 'Human' && Date.now() < specialEnd) {
            player.hp = Math.max(player.hp, hpAtFrameStart);
        }

        if (inDungeon && !dungeonComplete && player.hp < hpAtFrameStart) dungeonHit = true;
        document.getElementById("inGameHelp").style.display = showHelp ? "block" : "none";

        draw();
        requestAnimationFrame(update);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(-camera.x + (shakeFrames > 0 ? (Math.random() - 0.5) * shakeMag : 0), -camera.y + (shakeFrames > 0 ? (Math.random() - 0.5) * shakeMag : 0));

        let spawnGrad = ctx.createRadialGradient(WORLD_WIDTH/2, WORLD_HEIGHT/2, 0, WORLD_WIDTH/2, WORLD_HEIGHT/2, 900);
        spawnGrad.addColorStop(0, 'rgba(120,90,180,0.10)');
        spawnGrad.addColorStop(1, 'rgba(120,90,180,0)');
        ctx.fillStyle = spawnGrad;
        ctx.fillRect(WORLD_WIDTH/2 - 900, WORLD_HEIGHT/2 - 900, 1800, 1800);

        let dangerGrad = ctx.createRadialGradient(enemyZone.x + enemyZone.w/2, enemyZone.y + enemyZone.h/2, 0, enemyZone.x + enemyZone.w/2, enemyZone.y + enemyZone.h/2, 1000);
        dangerGrad.addColorStop(0, 'rgba(180,40,40,0.10)');
        dangerGrad.addColorStop(1, 'rgba(180,40,40,0)');
        ctx.fillStyle = dangerGrad;
        ctx.fillRect(enemyZone.x - 500, enemyZone.y - 500, enemyZone.w + 1000, enemyZone.h + 1000);

        ctx.strokeStyle = 'rgba(60, 120, 70, 0.35)';
        ctx.lineWidth = 1;
        let gridSize = 100;
        let startX = Math.floor(camera.x / gridSize) * gridSize;
        let endX   = startX + canvas.width  + gridSize;
        let startY = Math.floor(camera.y / gridSize) * gridSize;
        let endY   = startY + canvas.height + gridSize;

        for (let gx = startX; gx <= endX; gx += gridSize) {
            if (gx < 0 || gx > WORLD_WIDTH) continue;
            ctx.beginPath(); ctx.moveTo(gx, Math.max(0, startY)); ctx.lineTo(gx, Math.min(WORLD_HEIGHT, endY)); ctx.stroke();
        }
        for (let gy = startY; gy <= endY; gy += gridSize) {
            if (gy < 0 || gy > WORLD_HEIGHT) continue;
            ctx.beginPath(); ctx.moveTo(Math.max(0, startX), gy); ctx.lineTo(Math.min(WORLD_WIDTH, endX), gy); ctx.stroke();
        }

        drawMapProps();

        for (let i = 0; i < worldObjects.length; i++) {
            ctx.fillStyle = worldObjects[i].color;
            ctx.fillRect(worldObjects[i].x, worldObjects[i].y, worldObjects[i].w, worldObjects[i].h);
        }

        // Gate Keeper NPC
        ctx.fillStyle = npcZone.color;
        ctx.fillRect(npcZone.x, npcZone.y, npcZone.w, npcZone.h);
        ctx.fillStyle = '#000'; ctx.font = 'bold 11px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('NPC', npcZone.x + npcZone.w/2, npcZone.y + npcZone.h/2 + 4);
        ctx.textAlign = 'left';

        // Examiner NPC
        ctx.fillStyle = examinerZone.color;
        ctx.fillRect(examinerZone.x, examinerZone.y, examinerZone.w, examinerZone.h);
        ctx.fillStyle = '#000'; ctx.font = 'bold 9px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('EXAMINER', examinerZone.x + examinerZone.w/2, examinerZone.y + examinerZone.h/2 + 4);
        ctx.textAlign = 'left';

        for (let i = 0; i < slashTrails.length; i++) {
            let t = slashTrails[i];
            let alpha = t.life / t.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle   = '#ffffff';
            ctx.beginPath(); ctx.arc(t.x, t.y, t.size * alpha, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;

        for (let i = 0; i < effectRings.length; i++) {
            let r = effectRings[i];
            let prog = 1 - r.life / r.maxLife;
            ctx.globalAlpha = 1 - prog;
            ctx.strokeStyle = r.color;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius + (r.maxRadius - r.radius) * prog, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;

        drawSkillFx();

        // player (special ability glow)
        if (limitBreakActive) {
            ctx.shadowBlur  = 30; ctx.shadowColor = '#ffffff'; ctx.fillStyle = '#ffffff';
        } else if (Date.now() < specialEnd) {
            ctx.shadowBlur = 30; ctx.shadowColor = SPECIAL.color;
            ctx.fillStyle = playClass === 'Hunter' ? '#c9a8ff' : '#fff2b0';
        } else if (humanBuffActive) {
            ctx.shadowBlur  = 22; ctx.shadowColor = '#ff6600'; ctx.fillStyle = '#ffaa55';
        } else {
            ctx.fillStyle = playClass === 'Hunter' ? '#4166f5' : '#e8c832';
        }
        ctx.fillRect(player.x, player.y, player.size, player.size);
        ctx.shadowBlur = 0;

        for (let i = 0; i < enemies.length; i++) {
            let e = enemies[i]; if (!e.alive) continue;
            ctx.fillStyle = e.color; ctx.fillRect(e.x, e.y, e.size, e.size);
            ctx.fillStyle = '#2a0000'; ctx.fillRect(e.x, e.y - 12, e.size, 7);
            ctx.fillStyle = '#ff4444'; ctx.fillRect(e.x, e.y - 12, e.size * Math.max(0, e.hp / e.maxHp), 7);
            ctx.fillStyle = '#ffffff'; ctx.font = 'bold 12px Orbitron, sans-serif'; ctx.fillText('LV.' + player.level + '  ' + Math.ceil(e.hp), e.x - 8, e.y - 17);
        }

        if (inDungeon) {
            for (let i = 0; i < dungeonEnemies.length; i++) {
                let e = dungeonEnemies[i]; if (!e.alive) continue;
                ctx.fillStyle = e.color; ctx.fillRect(e.x, e.y, e.size, e.size);
                ctx.fillStyle = '#2a0000'; ctx.fillRect(e.x, e.y - 12, e.size, 7);
                ctx.fillStyle = '#ff4444'; ctx.fillRect(e.x, e.y - 12, e.size * Math.max(0, e.hp / e.maxHp), 7);
            }
            for (let i = 0; i < dungeonProjectiles.length; i++) {
                let p = dungeonProjectiles[i];
                ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = '#ff3333'; ctx.fill();
            }
        }

        for (let i = 0; i < projectiles.length; i++) {
            let p = projectiles[i];
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.atan2(p.dy, p.dx));
            ctx.beginPath(); ctx.arc(0, 0, p.size * 3, -Math.PI / 2, Math.PI / 2);
            ctx.lineWidth   = 6;
            ctx.strokeStyle = playClass === 'Hunter' ? '#4166f5' : '#e8c832';
            ctx.stroke(); ctx.restore();
        }

        for (let i = 0; i < skillProjectiles.length; i++) {
            let p = skillProjectiles[i];
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.atan2(p.dy, p.dx));
            if (p.shape === 'bolt') {                       // Piercing Bolt: long glowing lance
                let len = 90, w = p.size * 0.8;
                let g = ctx.createLinearGradient(-len, 0, 0, 0);
                g.addColorStop(0, 'rgba(77,141,255,0)'); g.addColorStop(1, p.color);
                ctx.shadowBlur = 16; ctx.shadowColor = p.color;
                ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-len, 0); ctx.lineTo(0, -w); ctx.lineTo(0, w); ctx.closePath(); ctx.fill();
                ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(-6, -w * 0.9); ctx.lineTo(p.size * 2.4, 0); ctx.lineTo(-6, w * 0.9); ctx.closePath(); ctx.fill();
            } else if (p.shape === 'void') {                // Void Barrage: dark pulsing orbs
                let pulse = 1 + Math.sin(Date.now() / 60 + p.x * 0.01) * 0.15;
                ctx.shadowBlur = 18; ctx.shadowColor = p.color;
                for (let t = 3; t >= 1; t--) {
                    ctx.globalAlpha = 0.18 * (4 - t); ctx.fillStyle = p.color;
                    ctx.beginPath(); ctx.arc(-t * 10, 0, p.size * (1.1 - t * 0.18), 0, Math.PI * 2); ctx.fill();
                }
                ctx.globalAlpha = 1;
                let g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 1.6 * pulse);
                g.addColorStop(0, '#10001f'); g.addColorStop(0.55, '#10001f'); g.addColorStop(0.62, p.color); g.addColorStop(1, 'rgba(255,77,210,0)');
                ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, p.size * 1.6 * pulse, 0, Math.PI * 2); ctx.fill();
            } else if (p.shape === 'spark') {               // Mana Overload auto-bolts
                ctx.shadowBlur = 10; ctx.shadowColor = p.color; ctx.fillStyle = p.color;
                ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(0, -4); ctx.lineTo(8, 0); ctx.lineTo(0, 4); ctx.closePath(); ctx.fill();
                ctx.fillStyle = '#ffffff'; ctx.fillRect(-4, -1.5, 10, 3);
            } else {
                ctx.beginPath(); ctx.arc(0, 0, p.size * 3, -Math.PI / 2, Math.PI / 2);
                ctx.lineWidth = 7; ctx.strokeStyle = p.color; ctx.stroke();
            }
            ctx.restore();
        }

        ctx.restore();
        drawHUD();
    }

    function drawHUD() {
        // ── Status panel ────────────────────────────────────────
        let panelW = 310, padX = 18, padY = 18;
        let panelH = playClass === 'Hunter' ? 156 : 126;
        let accent = playClass === 'Hunter' ? '#4166f5' : '#e8c832';

        let panelGrad = ctx.createLinearGradient(padX, padY, padX, padY + panelH);
        panelGrad.addColorStop(0, 'rgba(16,16,28,0.93)');
        panelGrad.addColorStop(1, 'rgba(4,4,10,0.96)');
        ctx.fillStyle = panelGrad;
        roundRect(ctx, padX, padY, panelW, panelH, 10); ctx.fill();
        ctx.strokeStyle = accent; ctx.lineWidth = 2; ctx.stroke();

        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        roundRect(ctx, padX + 10, padY + 10, 66, 66, 8); ctx.fill();
        ctx.fillStyle = accent; ctx.font = 'bold 32px Orbitron, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(player.level, padX + 43, padY + 52);
        ctx.fillStyle = '#bbbbbb'; ctx.font = 'bold 10px Share Tech Mono, monospace';
        ctx.fillText('LEVEL', padX + 43, padY + 68);
        ctx.textAlign = 'left';

        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 15px Orbitron, sans-serif';
        ctx.fillText((playerName || 'HUNTER').toUpperCase(), padX + 90, padY + 26);
        ctx.fillStyle = RANK_COLORS[window.storedRank] || '#888'; ctx.font = 'bold 13px Orbitron, sans-serif';
        ctx.fillText(window.storedRank + '-RANK  -  ' + playClass.toUpperCase(), padX + 90, padY + 46);

        let bx = padX + 90, by = padY + 64, barW = panelW - 90 - 14, barH = 12;

        function drawBar(label, value, max, color) {
            ctx.font = 'bold 11px Share Tech Mono, monospace';
            ctx.fillStyle = '#dddddd'; ctx.textAlign = 'left';  ctx.fillText(label, bx, by - 4);
            ctx.fillStyle = '#ffffff'; ctx.textAlign = 'right'; ctx.fillText(Math.ceil(value) + ' / ' + Math.floor(max), bx + barW, by - 4);
            ctx.textAlign = 'left';
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            roundRect(ctx, bx, by, barW, barH, 5); ctx.fill();
            let ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
            let bg = ctx.createLinearGradient(bx, 0, bx + barW, 0);
            bg.addColorStop(0, color[0]); bg.addColorStop(1, color[1]);
            ctx.fillStyle = bg;
            roundRect(ctx, bx, by, Math.max(0, barW * ratio), barH, 5); ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1;
            roundRect(ctx, bx, by, barW, barH, 5); ctx.stroke();
        }

        if (Date.now() - lastSaveTime < 1800) {
            ctx.save();
            ctx.globalAlpha = 0.8 * (1 - (Date.now() - lastSaveTime) / 1800);
            ctx.fillStyle = '#88ff88'; ctx.font = 'bold 12px Orbitron, sans-serif'; ctx.textAlign = 'left';
            ctx.fillText('PROGRESS SAVED', 18, canvas.height - 14);
            ctx.restore();
        }

        let hpRatio = displayedHp / player.maxHp;
        let hpColor = hpRatio > 0.5 ? ['#5cff6a', '#2fbf3f'] : hpRatio > 0.25 ? ['#ffcc55', '#ff9922'] : ['#ff6666', '#cc2222'];
        drawBar('HP', displayedHp, player.maxHp, hpColor);
        by += barH + 20;

        if (playClass === 'Hunter') {
            drawBar('MANA', displayedMana, player.maxMana, ['#77aaff', '#4166f5']);
            by += barH + 20;
        }

        drawBar('EXP', displayedExp, player.expToNext, ['#ffe066', '#e8c832']);

        let aq = activeQuests();
        if (aq.length) {
            let ty = padY + panelH + 14, rowH = 46, th = 38 + aq.length * rowH;
            ctx.fillStyle = 'rgba(4,6,16,0.88)'; roundRect(ctx, padX, ty, panelW, th, 8); ctx.fill();
            ctx.strokeStyle = '#88ccff'; ctx.lineWidth = 2; roundRect(ctx, padX, ty, panelW, th, 8); ctx.stroke();
            ctx.fillStyle = '#88ccff'; ctx.font = 'bold 13px Orbitron, sans-serif'; ctx.textAlign = 'left';
            ctx.fillText('ACTIVE QUESTS', padX + 12, ty + 22);
            for (let qi = 0; qi < aq.length; qi++) {
                let q = aq[qi], qy = ty + 46 + qi * rowH, pr = questProgress(q), tbw = panelW - 24 - 84;
                ctx.fillStyle = '#ffffff'; ctx.font = 'bold 12px Share Tech Mono, monospace'; ctx.textAlign = 'left';
                ctx.fillText(q.desc, padX + 12, qy);
                ctx.fillStyle = '#333'; ctx.fillRect(padX + 12, qy + 8, tbw, 9);
                ctx.fillStyle = pr >= q.target ? '#88ff88' : '#ffe066'; ctx.fillRect(padX + 12, qy + 8, tbw * (pr / q.target), 9);
                ctx.strokeStyle = '#777'; ctx.lineWidth = 1; ctx.strokeRect(padX + 12, qy + 8, tbw, 9);
                ctx.fillStyle = '#ffffff'; ctx.textAlign = 'right';
                ctx.fillText(fmtNum(pr) + ' / ' + fmtNum(q.target), padX + panelW - 12, qy + 17);
            }
            ctx.textAlign = 'left';
        }

        // Minimap (bigger, brighter)
        let mmSize = 160, mmPad = 18;
        let mmX = canvas.width - mmSize - mmPad, mmY = mmPad;
        ctx.fillStyle = 'rgba(6,6,14,0.88)';
        roundRect(ctx, mmX, mmY, mmSize, mmSize, 8); ctx.fill();
        ctx.strokeStyle = accent; ctx.lineWidth = 2;
        roundRect(ctx, mmX, mmY, mmSize, mmSize, 8); ctx.stroke();

        let scaleX = mmSize / WORLD_WIDTH, scaleY = mmSize / WORLD_HEIGHT;
        let npcMmX = mmX + npcZone.x * scaleX, npcMmY = mmY + npcZone.y * scaleY;
        ctx.fillStyle = '#00ffcc'; ctx.beginPath(); ctx.arc(npcMmX, npcMmY, 5, 0, Math.PI*2); ctx.fill();
        let exMmX = mmX + examinerZone.x * scaleX, exMmY = mmY + examinerZone.y * scaleY;
        ctx.fillStyle = '#ffcc00'; ctx.beginPath(); ctx.arc(exMmX, exMmY, 5, 0, Math.PI*2); ctx.fill();
        let ezMmX = mmX + enemyZone.x * scaleX, ezMmY = mmY + enemyZone.y * scaleY;
        ctx.fillStyle = '#ff4444'; ctx.fillRect(ezMmX - 5, ezMmY - 5, 10, 10);
        let plMmX = mmX + player.x * scaleX, plMmY = mmY + player.y * scaleY;
        ctx.fillStyle = accent;
        ctx.beginPath(); ctx.arc(plMmX, plMmY, 5.5, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = '#cccccc'; ctx.font = 'bold 10px Orbitron, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('GATE', npcMmX, npcMmY - 9);
        ctx.fillText('EXAM', exMmX,  exMmY  - 9);
        ctx.fillText('DEN',  ezMmX,  ezMmY  - 9);

        // key hints under the minimap
        let hints = [['[C] STATS', statPoints], ['[K] SKILLS', skillPoints], ['[J] QUESTS', activeQuests().length + ' active']];
        let hy = mmY + mmSize + 12;
        ctx.fillStyle = 'rgba(4,6,16,0.88)'; roundRect(ctx, mmX, hy, mmSize, 16 + hints.length * 22, 8); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1; roundRect(ctx, mmX, hy, mmSize, 16 + hints.length * 22, 8); ctx.stroke();
        for (let hi = 0; hi < hints.length; hi++) {
            let hot = hints[hi][1] !== 0 && hints[hi][1] !== '0 active';
            ctx.fillStyle = hot ? accent : '#aaaaaa'; ctx.font = 'bold 12px Orbitron, sans-serif';
            ctx.textAlign = 'left';  ctx.fillText(hints[hi][0], mmX + 12, hy + 26 + hi * 22);
            ctx.textAlign = 'right'; ctx.fillText(String(hints[hi][1]), mmX + mmSize - 12, hy + 26 + hi * 22);
        }
        ctx.textAlign = 'left';

        let slotSize  = 84, slotGap = 12;
        let totalW    = (slotSize * 6) + (slotGap * 5);
        let barStartX = canvas.width / 2 - totalW / 2;
        let barStartY = canvas.height - slotSize - 24;

        ctx.fillStyle = 'rgba(0,0,0,0.9)';
        roundRect(ctx, barStartX-12, barStartY-12, totalW+24, slotSize+24, 8); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1; ctx.stroke();

        let now = Date.now();
        for (let i = 0; i < skillDefsForClass.length; i++) {
            let def = skillDefsForClass[i];
            let slotX = barStartX + i * (slotSize + slotGap), slotY = barStartY;
            let unlocked = player.level >= def.levelReq;
            let cdEnd = skillCooldownEnd[def.slot] || 0;
            let onCooldown = now < cdEnd;
            let cdRatio = onCooldown ? Math.min(1, (cdEnd - now) / def.cooldown) : 0;
            let lvl = skillLevels[def.slot] || 0;

            ctx.fillStyle = '#0d0d0d'; roundRect(ctx, slotX, slotY, slotSize, slotSize, 6); ctx.fill();
            ctx.strokeStyle = unlocked ? def.color : 'rgba(255,255,255,0.15)';
            ctx.lineWidth = lvl >= MAX_SKILL_LEVEL ? 4 : 2.4; roundRect(ctx, slotX, slotY, slotSize, slotSize, 6); ctx.stroke();

            if (unlocked) {
                ctx.fillStyle = def.color; ctx.font = '34px Orbitron, sans-serif'; ctx.textAlign = 'center';
                ctx.globalAlpha = onCooldown ? 0.35 : 1;
                ctx.fillText(def.icon, slotX + slotSize/2, slotY + slotSize/2 + 10);
                ctx.globalAlpha = 1;

                if (onCooldown) {
                    ctx.fillStyle = 'rgba(0,0,0,0.6)';
                    ctx.fillRect(slotX, slotY + slotSize * (1 - cdRatio), slotSize, slotSize * cdRatio);
                    ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Orbitron, sans-serif';
                    ctx.fillText(Math.ceil((cdEnd - now)/1000), slotX + slotSize/2, slotY + slotSize/2 + 5);
                }

                ctx.fillStyle = '#fff'; ctx.font = 'bold 13px Orbitron, sans-serif';
                ctx.fillText(def.slot, slotX + 11, slotY + 13);

                if (lvl > 0) {
                    ctx.fillStyle = '#ffe066'; ctx.font = '11px Share Tech Mono, monospace';
                    ctx.fillText(lvl >= MAX_SKILL_LEVEL ? 'MAX' : '+' + lvl, slotX + slotSize - 14, slotY + 12);
                }

                if (playClass === 'Hunter') {
                    ctx.fillStyle = (overloadOn() || player.mana >= def.manaCost) ? '#77aaff' : '#553355';
                    ctx.font = '10px Share Tech Mono, monospace';
                    ctx.fillText(overloadOn() ? 'FREE' : def.manaCost, slotX + slotSize/2, slotY + slotSize - 5);
                }
            } else {
                ctx.fillStyle = '#333'; ctx.font = '24px Orbitron, sans-serif'; ctx.textAlign = 'center';
                ctx.fillText('🔒', slotX + slotSize/2, slotY + slotSize/2 + 2);
                ctx.fillStyle = '#666'; ctx.font = 'bold 12px Orbitron, sans-serif';
                ctx.fillText('Lv.' + def.levelReq, slotX + slotSize/2, slotY + slotSize - 8);
            }
            ctx.textAlign = 'left';
        }

        // ── Special ability slot (F) ─────────────────────────────
        {
            let sx = barStartX + totalW + 26, sy = barStartY;
            let unl = player.level >= SPECIAL.levelReq;
            let act = now < specialEnd, onCd = !act && now < specialCdEnd;
            ctx.fillStyle = '#0d0d0d'; roundRect(ctx, sx, sy, slotSize, slotSize, 6); ctx.fill();
            ctx.strokeStyle = unl ? SPECIAL.color : 'rgba(255,255,255,0.15)'; ctx.lineWidth = act ? 3.5 : 1.8;
            roundRect(ctx, sx, sy, slotSize, slotSize, 6); ctx.stroke();
            ctx.textAlign = 'center';
            if (unl) {
                ctx.globalAlpha = onCd ? 0.35 : 1; ctx.fillStyle = SPECIAL.color; ctx.font = '34px Orbitron, sans-serif';
                ctx.fillText(SPECIAL.icon, sx + slotSize / 2, sy + slotSize / 2 + 8); ctx.globalAlpha = 1;
                if (onCd) {
                    let r = (specialCdEnd - now) / SPECIAL.cooldown;
                    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(sx, sy + slotSize * (1 - r), slotSize, slotSize * r);
                }
                ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Orbitron, sans-serif';
                if (act) ctx.fillText(Math.ceil((specialEnd - now) / 1000) + 's', sx + slotSize / 2, sy + slotSize / 2 + 28);
                else if (onCd) ctx.fillText(Math.ceil((specialCdEnd - now) / 1000), sx + slotSize / 2, sy + slotSize / 2 + 28);
                ctx.font = 'bold 13px Orbitron, sans-serif'; ctx.fillText('F', sx + 11, sy + 13);
                ctx.fillStyle = SPECIAL.color; ctx.font = '10px Orbitron, sans-serif';
                ctx.fillText('SPECIAL', sx + slotSize / 2, sy + slotSize - 6);
            } else {
                ctx.fillStyle = '#333'; ctx.font = '24px Orbitron, sans-serif'; ctx.fillText('🔒', sx + slotSize / 2, sy + slotSize / 2 + 2);
                ctx.fillStyle = '#666'; ctx.font = 'bold 12px Orbitron, sans-serif'; ctx.fillText('Lv.' + SPECIAL.levelReq, sx + slotSize / 2, sy + slotSize - 8);
            }
            ctx.textAlign = 'left';
        }

        // Human Limit Break bar
        if (playClass === 'Human') {
            let ratio    = Math.min(hitCount / HITS_FOR_LIMIT, 1);
            let isReady  = limitReady && !limitBreakActive;
            let isActive = limitBreakActive;
            let lbW = totalW, lbX = barStartX, lbY = barStartY - 46, lbH = 24;

            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            roundRect(ctx, lbX - 10, lbY - 4, lbW + 20, lbH + 8, 5); ctx.fill();

            if (isReady || isActive) { ctx.shadowBlur = 14; ctx.shadowColor = '#ffffff'; }
            ctx.fillStyle = isActive ? '#aaddff' : isReady ? '#ffffff' : '#c8a800';
            roundRect(ctx, lbX, lbY, lbW * (isActive ? 1 : ratio), lbH, 4); ctx.fill();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = isReady || isActive ? '#ffffff' : '#604000'; ctx.lineWidth = 1.5;
            roundRect(ctx, lbX, lbY, lbW, lbH, 4); ctx.stroke();
            ctx.fillStyle = isReady || isActive ? '#fff' : '#d8b800';
            ctx.font = 'bold 14px Orbitron, sans-serif'; ctx.textAlign = 'center';
            let label = isActive ? '— LIMIT BREAK —' : isReady ? '[ SPACE ]  LIMIT BREAK' : 'LIMIT BREAK  ' + hitCount + ' / ' + HITS_FOR_LIMIT;
            ctx.fillText(label, canvas.width / 2, lbY + 17);
            ctx.textAlign = 'left';

            if (humanBuffActive) {
                let secLeft = Math.ceil((humanBuffEndTime - Date.now())/1000);
                ctx.fillStyle = '#ffaa55'; ctx.font = 'bold 15px Orbitron, sans-serif'; ctx.textAlign = 'center';
                ctx.fillText('🔥 BATTLE FURY  ' + secLeft + 's', canvas.width/2, lbY - 14);
                ctx.textAlign = 'left';
            }
        }

        // ── Gate Keeper interact panel ──────────────────────────
        if (showInteractPrompt && !inDungeon && !showExaminerMenu) {
            let cooldownRemaining = Math.max(0, dungeonCooldownMs - (now - lastDungeonClearTime));
            let onCooldown        = cooldownRemaining > 0;
            let tiers             = unlockedTiers();
            let clampedIdx        = Math.min(selectedTierIndex, tiers.length - 1);
            let activeTier        = tiers[clampedIdx];

            let pw = 520, tierRowH = 54;
            let panelHgt = 110 + tiers.length * tierRowH + 60;
            let px = canvas.width / 2 - pw / 2, py = canvas.height / 2 - panelHgt / 2;

            ctx.fillStyle = 'rgba(4,6,16,0.93)';
            roundRect(ctx, px, py, pw, panelHgt, 10); ctx.fill();
            ctx.strokeStyle = activeTier.color; ctx.lineWidth = 2; ctx.stroke();

            ctx.fillStyle = '#00ffcc'; ctx.font = 'bold 11px Orbitron, sans-serif'; ctx.textAlign = 'center';
            ctx.fillText('GATE KEEPER', canvas.width/2, py + 22);
            ctx.fillStyle = '#888'; ctx.font = '9px Orbitron, sans-serif';
            ctx.fillText('SELECT DUNGEON TIER', canvas.width/2, py + 38);

            ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(px+20, py+48); ctx.lineTo(px+pw-20, py+48); ctx.stroke();

            let rowStartY = py + 58;
            for (let ti = 0; ti < tiers.length; ti++) {
                let tier     = tiers[ti];
                let rowY     = rowStartY + ti * tierRowH;
                let isActive = (ti === clampedIdx);
                let rowPad   = 16, rowX = px + rowPad, rowW = pw - rowPad * 2;

                ctx.fillStyle = isActive ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.02)';
                roundRect(ctx, rowX, rowY+2, rowW, tierRowH-6, 6); ctx.fill();
                ctx.strokeStyle = isActive ? tier.color : 'rgba(255,255,255,0.08)';
                ctx.lineWidth   = isActive ? 2 : 1; ctx.stroke();

                let badgeSize = 34, badgeX = rowX + 10, badgeY = rowY + (tierRowH - badgeSize) / 2 - 2;
                ctx.fillStyle = isActive ? tier.color : 'rgba(255,255,255,0.1)';
                roundRect(ctx, badgeX, badgeY, badgeSize, badgeSize, 5); ctx.fill();
                ctx.fillStyle = isActive ? '#000' : '#555'; ctx.font = 'bold 18px Orbitron, sans-serif';
                ctx.textAlign = 'center'; ctx.fillText(tier.rank, badgeX + badgeSize/2, badgeY + badgeSize - 9);

                ctx.fillStyle = isActive ? tier.color : '#777';
                ctx.font      = isActive ? 'bold 14px Orbitron, sans-serif' : '12px Orbitron, sans-serif';
                ctx.textAlign = 'left'; ctx.fillText(tier.label, badgeX + badgeSize + 14, rowY + 22);
                ctx.fillStyle = '#555'; ctx.font = '9px Orbitron, sans-serif';
                ctx.fillText('+' + dungeonExpFor(tier, ti) + ' EXP on clear', badgeX + badgeSize + 14, rowY + 37);

                let diffLevel = ti + 1, dotRadius = 5, dotGap = 14;
                let dotsStartX = rowX + rowW - rowPad - (DUNGEON_TIERS.length * dotGap);
                for (let d = 0; d < DUNGEON_TIERS.length; d++) {
                    let dotX = dotsStartX + d * dotGap, dotY = rowY + tierRowH / 2 - 2;
                    ctx.beginPath(); ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
                    if (d < diffLevel) { ctx.fillStyle = isActive ? tier.color : '#444'; ctx.fill(); }
                    else { ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 1; ctx.stroke(); }
                }
            }

            let footerY = rowStartY + tiers.length * tierRowH + 10;
            ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(px+20, footerY); ctx.lineTo(px+pw-20, footerY); ctx.stroke();
            footerY += 18;

            if (onCooldown) {
                let secondsLeft = Math.ceil(cooldownRemaining / 1000);
                ctx.fillStyle = '#ff5555'; ctx.font = 'bold 15px Orbitron, sans-serif'; ctx.textAlign = 'center';
                ctx.fillText('COOLDOWN  ' + secondsLeft + 's', canvas.width/2, footerY + 14);
                let cdRatio2 = 1 - (cooldownRemaining / dungeonCooldownMs);
                let cdBarW = pw - 80, cdBarX = px + 40, cdBarY = footerY + 24;
                ctx.fillStyle = '#1a0000'; roundRect(ctx, cdBarX, cdBarY, cdBarW, 8, 4); ctx.fill();
                ctx.fillStyle = '#ff5555'; roundRect(ctx, cdBarX, cdBarY, cdBarW * cdRatio2, 8, 4); ctx.fill();
            } else {
                ctx.fillStyle = '#fff'; ctx.font = 'bold 17px Orbitron, sans-serif'; ctx.textAlign = 'center';
                ctx.fillText('[E]  ENTER DUNGEON', canvas.width/2, footerY + 14);
                ctx.fillStyle = '#555'; ctx.font = '10px Orbitron, sans-serif';
                ctx.fillText('[Q] Move Up  •  [Z] Move Down', canvas.width/2, footerY + 32);
            }
            ctx.textAlign = 'left';
        }

        // ── EXAMINER PROMPT ──────────────────────────────────────
        if (showExaminerPrompt && !inDungeon && !showExaminerMenu) {
            let isMaxed = isMaxRank();
            let ready   = questComplete();

            ctx.fillStyle = 'rgba(0,0,0,0.82)';
            roundRect(ctx, canvas.width/2 - 230, canvas.height/2 - 40, 460, 90, 8); ctx.fill();
            ctx.strokeStyle = '#ffcc00'; ctx.lineWidth = 1.5; ctx.stroke();

            ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 12px Orbitron, sans-serif'; ctx.textAlign = 'center';
            ctx.fillText('ASSOCIATION EXAMINER', canvas.width/2, canvas.height/2 - 18);
            ctx.fillStyle = '#ffffff'; ctx.font = '10px Orbitron, sans-serif';

            if (isMaxed) {
                ctx.fillText('You have reached ' + window.storedRank + '-RANK. Maximum rank.', canvas.width/2, canvas.height/2 + 2);
            } else if (ready) {
                ctx.fillStyle = '#88ff88';
                ctx.fillText('Rank-up requirements met!', canvas.width/2, canvas.height/2 + 2);
                ctx.fillStyle = '#aaa'; ctx.font = '9px Orbitron, sans-serif';
                ctx.fillText('[X] View Quests   [R] RANK UP', canvas.width/2, canvas.height/2 + 20);
            } else {
                ctx.fillText('[X] View Rank-Up Quests', canvas.width/2, canvas.height/2 + 2);
                ctx.fillStyle = '#aaa'; ctx.font = '9px Orbitron, sans-serif';
                ctx.fillText('Current Rank: ' + window.storedRank, canvas.width/2, canvas.height/2 + 20);
            }
            ctx.textAlign = 'left';
        }

        // ── EXAMINER QUEST PANEL ─────────────────────────────────
        if (showExaminerMenu && !inDungeon) {
            let q       = currentQuest();
            let isMaxed = isMaxRank();
            let ready   = questComplete();

            let pw = 440, ph = isMaxed ? 140 : 280;
            let px = canvas.width / 2 - pw / 2, py = canvas.height / 2 - ph / 2;

            ctx.fillStyle = 'rgba(4,6,16,0.95)';
            roundRect(ctx, px, py, pw, ph, 10); ctx.fill();
            ctx.strokeStyle = ready ? '#88ff88' : '#ffcc00'; ctx.lineWidth = 2; ctx.stroke();

            ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 12px Orbitron, sans-serif'; ctx.textAlign = 'center';
            ctx.fillText('RANK-UP QUESTS', canvas.width/2, py + 24);

            let rc = RANK_COLORS;
            ctx.fillStyle = rc[window.storedRank] || '#888'; ctx.font = 'bold 20px Orbitron, sans-serif';
            ctx.fillText(window.storedRank + '  →  ' + (isMaxed ? 'MAX' : RANK_ORDER[RANK_ORDER.indexOf(window.storedRank) + 1]), canvas.width/2, py + 50);

            ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(px+20, py+60); ctx.lineTo(px+pw-20, py+60); ctx.stroke();

            if (isMaxed) {
                ctx.fillStyle = '#cc44ff'; ctx.font = '11px Orbitron, sans-serif';
                ctx.fillText('You have reached the highest rank.', canvas.width/2, py + 90);
                ctx.fillStyle = '#555'; ctx.font = '9px Orbitron, sans-serif';
                ctx.fillText('[X] Close', canvas.width/2, py + 115);
            } else {
                let reqs = [
                    { label: 'KILLS',          current: rankUpProgress.kills,         needed: q.killsNeeded },
                    { label: q.dungeonRank + '-RANK CLEARS', current: rankUpProgress.dungeonClears, needed: q.dungeonClears },
                    { label: 'LEVEL',          current: player.level,                 needed: q.levelNeeded },
                ];

                for (let ri = 0; ri < reqs.length; ri++) {
                    let req   = reqs[ri];
                    let ry    = py + 80 + ri * 56;
                    let done  = req.current >= req.needed;
                    let ratio = Math.min(req.current / req.needed, 1);

                    ctx.fillStyle = done ? '#88ff88' : '#aaaaaa';
                    ctx.font = 'bold 10px Orbitron, sans-serif'; ctx.textAlign = 'left';
                    ctx.fillText((done ? '✓ ' : '') + req.label, px + 24, ry + 4);

                    ctx.fillStyle = '#333'; ctx.fillRect(px + 24, ry + 12, pw - 48, 10);
                    ctx.fillStyle = done ? '#88ff88' : '#ffcc00';
                    ctx.fillRect(px + 24, ry + 12, (pw - 48) * ratio, 10);
                    ctx.strokeStyle = '#555'; ctx.lineWidth = 1; ctx.strokeRect(px + 24, ry + 12, pw - 48, 10);

                    ctx.fillStyle = '#fff'; ctx.font = '9px Orbitron, sans-serif'; ctx.textAlign = 'right';
                    ctx.fillText(Math.min(req.current, req.needed) + ' / ' + req.needed, px + pw - 24, ry + 22);
                }

                ctx.textAlign = 'center';
                if (ready) {
                    ctx.fillStyle = '#88ff88'; ctx.font = 'bold 11px Orbitron, sans-serif';
                    ctx.fillText('[ R ]  RANK UP', canvas.width/2, py + ph - 20);
                } else {
                    ctx.fillStyle = '#555'; ctx.font = '9px Orbitron, sans-serif';
                    ctx.fillText('[X] Close', canvas.width/2, py + ph - 20);
                }
            }
            ctx.textAlign = 'left';
        }

        // ── QUEST LOG ────────────────────────────────────────────
        if (showJournal) {
            let L = journalLayout();
            let doneCount = journalQuests.filter(function(q) { return q.state === 'done'; }).length;
            ctx.fillStyle = 'rgba(4,6,16,0.95)';
            roundRect(ctx, L.px, L.py, L.pw, L.ph, 10); ctx.fill();
            ctx.strokeStyle = '#88ffcc'; ctx.lineWidth = 2; ctx.stroke();
            ctx.fillStyle = '#88ffcc'; ctx.font = 'bold 14px Orbitron, sans-serif'; ctx.textAlign = 'center';
            ctx.fillText('QUEST LOG', canvas.width / 2, L.py + 28);
            ctx.fillStyle = '#888'; ctx.font = '10px Orbitron, sans-serif';
            ctx.fillText('Active ' + activeQuests().length + ' / ' + MAX_ACTIVE_QUESTS + '   |   Completed ' + doneCount + ' / ' + myQuests().length, canvas.width / 2, L.py + 48);
            ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(L.px + 20, L.py + 58); ctx.lineTo(L.px + L.pw - 20, L.py + 58); ctx.stroke();

            if (L.rows.length === 0) {
                ctx.fillStyle = '#88ff88'; ctx.font = '12px Orbitron, sans-serif';
                ctx.fillText('All quests complete!', canvas.width / 2, L.py + 100);
            }

            let slotsFree = activeQuests().length < MAX_ACTIVE_QUESTS;
            for (let i = 0; i < L.rows.length; i++) {
                let q = L.rows[i], ry = L.py + 84 + i * L.rowH;
                let isAct = q.state === 'active';
                ctx.textAlign = 'left';
                ctx.fillStyle = isAct ? '#ffe066' : '#dddddd'; ctx.font = 'bold 12px Share Tech Mono, monospace';
                ctx.fillText((isAct ? '> ' : '  ') + q.desc, L.px + 20, ry);
                ctx.fillStyle = '#888'; ctx.font = '10px Share Tech Mono, monospace';
                ctx.fillText('  Reward: ' + questRewardText(q), L.px + 20, ry + 16);

                if (isAct) {
                    let prog = questProgress(q), bw = 176, qbx = L.px + L.pw - 196;
                    ctx.textAlign = 'right'; ctx.fillStyle = '#fff'; ctx.font = '10px Share Tech Mono, monospace';
                    ctx.fillText('IN PROGRESS  ' + fmtNum(prog) + ' / ' + fmtNum(q.target), L.px + L.pw - 20, ry - 6);
                    ctx.fillStyle = '#333'; ctx.fillRect(qbx, ry + 2, bw, 9);
                    ctx.fillStyle = '#ffe066'; ctx.fillRect(qbx, ry + 2, bw * (prog / q.target), 9);
                    ctx.strokeStyle = '#555'; ctx.strokeRect(qbx, ry + 2, bw, 9);
                } else {
                    let qbx = L.px + L.pw - 116, qby = ry - 18;
                    ctx.fillStyle = slotsFree ? '#88ccff' : '#2a2a2a';
                    roundRect(ctx, qbx, qby, 96, 28, 5); ctx.fill();
                    ctx.fillStyle = slotsFree ? '#000' : '#666'; ctx.font = 'bold 10px Orbitron, sans-serif'; ctx.textAlign = 'center';
                    ctx.fillText('TAKE QUEST', qbx + 48, qby + 18);
                }
                ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(L.px + 16, ry + 30); ctx.lineTo(L.px + L.pw - 16, ry + 30); ctx.stroke();
            }
            ctx.textAlign = 'center'; ctx.fillStyle = '#555'; ctx.font = '10px Orbitron, sans-serif';
            ctx.fillText('[J] Close', canvas.width / 2, L.py + L.ph - 10);
            ctx.textAlign = 'left';
        }

        // ── BOSS WARNING (5s countdown) ──────────────────────────
        if (inDungeon && bossWarnEnd > Date.now()) {
            let secs = Math.ceil((bossWarnEnd - Date.now()) / 1000);
            ctx.save();
            ctx.globalAlpha = 0.65 + 0.35 * Math.sin(Date.now() / 120);
            ctx.textAlign = 'center'; ctx.shadowBlur = 25; ctx.shadowColor = '#ff0022'; ctx.fillStyle = '#ff3344';
            ctx.font = 'bold 44px Orbitron, sans-serif';
            ctx.fillText('BOSS APPEARS IN ' + secs, canvas.width / 2, canvas.height * 0.3);
            ctx.shadowBlur = 0; ctx.fillStyle = '#ffffff'; ctx.font = '16px Orbitron, sans-serif';
            ctx.fillText('Prepare yourself...', canvas.width / 2, canvas.height * 0.3 + 34);
            ctx.restore(); ctx.textAlign = 'left';
        }

        if (inDungeon && !dungeonComplete) {
            let isBossW = dungeonWave === bossWaveNum();
            ctx.fillStyle = isBossW ? '#ff4444' : '#ffffff';
            ctx.font = 'bold 13px Orbitron, sans-serif'; ctx.textAlign = 'center';
            ctx.shadowBlur = 8; ctx.shadowColor = '#000'; ctx.font = 'bold 22px Orbitron, sans-serif';
            ctx.fillText(DUNGEON_TIERS[selectedTierIndex].rank + '-RANK  -  ' + (isBossW ? 'BOSS' : 'WAVE ' + dungeonWave + ' / ' + normalWaves()), canvas.width/2, 38);
            ctx.font = 'bold 15px Share Tech Mono, monospace'; ctx.fillStyle = '#dddddd';
            let elapsed = Math.floor((Date.now() - dungeonRunStart) / 1000);
            ctx.fillText('TIME ' + Math.floor(elapsed / 60) + ':' + ('0' + (elapsed % 60)).slice(-2) + '   (under 2:00 = fast clear)', canvas.width/2, 62);
            ctx.shadowBlur = 0;
            ctx.textAlign = 'left';
        }

        if (dungeonComplete) {
            let tier = DUNGEON_TIERS[selectedTierIndex];
            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            roundRect(ctx, canvas.width/2 - 180, canvas.height/2 - 50, 360, 100, 6); ctx.fill();
            ctx.fillStyle = '#e8c832'; ctx.font = 'bold 16px Orbitron, sans-serif'; ctx.textAlign = 'center';
            ctx.fillText('DUNGEON CLEARED', canvas.width/2, canvas.height/2 - 10);
            ctx.fillStyle = tier.color; ctx.font = '11px Orbitron, sans-serif';
            ctx.fillText('+' + lastDungeonExp + ' EXP', canvas.width/2, canvas.height/2 + 14);
            ctx.fillStyle = '#aaa'; ctx.font = '10px Orbitron, sans-serif';
            ctx.fillText('Returning to the Gate Keeper...', canvas.width/2, canvas.height/2 + 34);
            ctx.textAlign = 'left';
        }

        // ── Toast notifications (bigger) ────────────────────────
        for (let i = 0; i < toastQueue.length; i++) {
            let t = toastQueue[i];
            let alpha = t.life > 40 ? 1 : t.life / 40;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            let tw = 400, th = 36, tx = canvas.width/2 - tw/2, ty = 260 + i * 44;
            roundRect(ctx, tx, ty, tw, th, 6); ctx.fill();
            ctx.strokeStyle = t.color; ctx.lineWidth = 1.4; roundRect(ctx, tx, ty, tw, th, 6); ctx.stroke();
            ctx.fillStyle = t.color; ctx.font = 'bold 13px Orbitron, sans-serif'; ctx.textAlign = 'center';
            ctx.fillText(t.text, canvas.width/2, ty + 23);
            ctx.textAlign = 'left';
            ctx.globalAlpha = 1;
        }

        // ── BIG LEVEL UP BANNER ─────────────────────────────────
        if (levelUpBanner && levelUpBanner.life > 0) {
            levelUpBanner.life--;
            let a = Math.min(1, levelUpBanner.life / 40);
            ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center';
            ctx.shadowBlur = 30; ctx.shadowColor = '#e8c832'; ctx.fillStyle = '#ffe066';
            ctx.font = 'bold 72px Orbitron, sans-serif';
            ctx.fillText('LEVEL UP!', canvas.width / 2, canvas.height * 0.2);
            ctx.shadowBlur = 0; ctx.fillStyle = '#ffffff'; ctx.font = 'bold 30px Orbitron, sans-serif';
            ctx.fillText('LEVEL ' + levelUpBanner.level, canvas.width / 2, canvas.height * 0.2 + 42);
            ctx.fillStyle = '#e8c832'; ctx.font = '18px Orbitron, sans-serif';
            ctx.fillText('+' + levelUpBanner.stat + ' STAT POINTS   |   +' + levelUpBanner.skill + ' SKILL POINTS', canvas.width / 2, canvas.height * 0.2 + 72);
            ctx.restore(); ctx.textAlign = 'left';
        }

        // ── RANK-UP overlay ──────────────────────────────────────
        if (showRankUpOverlay && rankUpOverlayTimer > 0) {
            let progress = rankUpOverlayTimer / 240;
            let alpha    = Math.sin(progress * Math.PI);

            let rc = RANK_COLORS;
            let rColor = rc[rankUpNewRank] || '#fff';

            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,' + (alpha * 0.7) + ')';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.globalAlpha = alpha;
            ctx.fillStyle   = rColor;
            ctx.font        = 'bold 22px Orbitron, sans-serif';
            ctx.textAlign   = 'center';
            ctx.fillText('RANK UP', canvas.width/2, canvas.height/2 - 60);

            ctx.font      = 'bold 90px Orbitron, sans-serif';
            ctx.shadowBlur  = 40;
            ctx.shadowColor = rColor;
            ctx.fillText(rankUpNewRank, canvas.width/2, canvas.height/2 + 20);
            ctx.shadowBlur  = 0;

            ctx.fillStyle = '#ffffff';
            ctx.font      = '14px Orbitron, sans-serif';
            ctx.fillText(rankUpNewRank + '-RANK ACHIEVED', canvas.width/2, canvas.height/2 + 60);

            let bonus = RANK_UP_BONUS_POINTS[rankUpNewRank] || 0;
            let sBonus = RANK_UP_SKILL_POINTS[rankUpNewRank] || 0;
            ctx.fillStyle = '#e8c832';
            ctx.font      = '11px Orbitron, sans-serif';
            ctx.fillText('+' + bonus + ' stat points  •  +' + sBonus + ' skill points', canvas.width/2, canvas.height/2 + 86);

            ctx.restore();
            ctx.textAlign = 'left';
        }

        // ── Stat menu ────────────────────────────────────────────
        if (showStatMenu) {
            let rows = [];
            if (playClass === 'Hunter') {
                rows = [
                    { key: 'str',  label: 'STR',  icon: '⚔',  desc: 'Attack & skill damage', val: baseStats.str + stats.str,  extra: 'DMG +' + strBonusPct() + '%' },
                    { key: 'agi',  label: 'AGI',  icon: '💨', desc: 'Movement speed',    val: baseStats.agi + stats.agi,  extra: '' },
                    { key: 'dur',  label: 'DUR',  icon: '🛡',  desc: 'Max HP (+100/pt)', val: stats.dur,                  extra: 'HP: ' + player.maxHp },
                    { key: 'mana', label: 'MANA', icon: '🌀',  desc: 'Max Mana (+50/pt)',val: player.maxMana,             extra: '' },
                ];
            } else {
                rows = [
                    { key: 'str', label: 'STR', icon: '⚔',  desc: 'Attack & skill damage', val: baseStats.str + stats.str, extra: 'DMG +' + strBonusPct() + '%' },
                    { key: 'agi', label: 'AGI', icon: '💨', desc: 'Movement speed',    val: baseStats.agi + stats.agi, extra: '' },
                    { key: 'dur', label: 'DUR', icon: '🛡',  desc: 'Max HP (+100/pt)', val: stats.dur,                 extra: 'HP: ' + player.maxHp },
                ];
            }

            let mw = 360, mh = 68 + rows.length * 52 + 36;
            let mx = canvas.width/2 - mw/2, my = canvas.height/2 - mh/2;

            ctx.fillStyle = 'rgba(8,8,18,0.94)';
            roundRect(ctx, mx, my, mw, mh, 10); ctx.fill();
            ctx.strokeStyle = playClass === 'Hunter' ? '#4166f5' : '#e8c832'; ctx.lineWidth = 1.5; ctx.stroke();

            ctx.fillStyle = playClass === 'Hunter' ? '#4166f5' : '#e8c832';
            ctx.font = 'bold 12px Orbitron, sans-serif'; ctx.textAlign = 'left';
            ctx.fillText('CHARACTER STATS', mx+16, my+22);
            ctx.fillStyle = statPoints > 0 ? '#e8c832' : '#555'; ctx.font = '10px Orbitron, sans-serif'; ctx.textAlign = 'right';
            ctx.fillText(statPoints + ' pts  •  [C] close', mx+mw-16, my+22);

            ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(mx+12, my+32); ctx.lineTo(mx+mw-12, my+32); ctx.stroke();

            for (let i = 0; i < rows.length; i++) {
                let row = rows[i], ry = my + 52 + i * 52;

                ctx.fillStyle = '#ccc'; ctx.font = '13px Orbitron, sans-serif'; ctx.textAlign = 'left';
                ctx.fillText(row.icon + '  ' + row.label, mx+16, ry);
                ctx.fillStyle = '#555'; ctx.font = '8px Orbitron, sans-serif';
                ctx.fillText(row.desc, mx+16, ry+14);
                ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Orbitron, sans-serif'; ctx.textAlign = 'center';
                ctx.fillText(row.val, mx+mw/2, ry+4);
                if (row.extra !== '') {
                    ctx.fillStyle = '#888'; ctx.font = '8px Orbitron, sans-serif';
                    ctx.fillText(row.extra, mx+mw/2, ry+17);
                }

                let btnX = mx+mw-90, btnY = ry-14, canUp = statPoints > 0;
                ctx.fillStyle = canUp ? (playClass === 'Hunter' ? '#4166f5' : '#e8c832') : '#2a2a2a';
                roundRect(ctx, btnX, btnY, 72, 24, 4); ctx.fill();
                ctx.fillStyle = canUp ? '#fff' : '#555'; ctx.font = 'bold 9px Orbitron, sans-serif'; ctx.textAlign = 'center';
                ctx.fillText('+ UPGRADE', btnX+36, btnY+15);

                if (i < rows.length - 1) {
                    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.moveTo(mx+12, ry+28); ctx.lineTo(mx+mw-12, ry+28); ctx.stroke();
                }
            }
            ctx.textAlign = 'left';
        }

        // ── Skill upgrade menu ───────────────────────────────────
        if (showSkillMenu) {
            let mw = 420, mh = 78 + skillDefsForClass.length * 50 + 20;
            let mx = canvas.width/2 - mw/2, my = canvas.height/2 - mh/2;

            ctx.fillStyle = 'rgba(8,8,18,0.95)';
            roundRect(ctx, mx, my, mw, mh, 10); ctx.fill();
            ctx.strokeStyle = playClass === 'Hunter' ? '#4166f5' : '#e8c832'; ctx.lineWidth = 1.5; ctx.stroke();

            ctx.fillStyle = playClass === 'Hunter' ? '#4166f5' : '#e8c832';
            ctx.font = 'bold 12px Orbitron, sans-serif'; ctx.textAlign = 'left';
            ctx.fillText('SKILL UPGRADES', mx+16, my+22);
            ctx.fillStyle = skillPoints > 0 ? '#e8c832' : '#555'; ctx.font = '10px Orbitron, sans-serif'; ctx.textAlign = 'right';
            ctx.fillText(skillPoints + ' pts  •  [K] close', mx+mw-16, my+22);

            ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(mx+12, my+34); ctx.lineTo(mx+mw-12, my+34); ctx.stroke();

            for (let i = 0; i < skillDefsForClass.length; i++) {
                let def = skillDefsForClass[i];
                let ry  = my + 66 + i * 50;
                let unlocked = player.level >= def.levelReq;
                let lvl = skillLevels[def.slot] || 0;

                ctx.fillStyle = unlocked ? def.color : '#444';
                ctx.font = '20px Orbitron, sans-serif'; ctx.textAlign = 'left';
                ctx.fillText(def.icon, mx + 16, ry + 4);

                ctx.fillStyle = unlocked ? '#eee' : '#555'; ctx.font = 'bold 11px Orbitron, sans-serif';
                ctx.fillText(def.name, mx + 46, ry - 4);
                ctx.fillStyle = lvl >= MAX_SKILL_LEVEL ? '#ffe066' : '#666'; ctx.font = '8px Share Tech Mono, monospace';
                ctx.fillText(unlocked
                    ? (lvl >= MAX_SKILL_LEVEL ? 'MASTERED: ' + MASTERY_TEXT[playClass][def.slot] : 'Lv.' + lvl + ' / ' + MAX_SKILL_LEVEL + ' upgrades')
                    : ('Unlocks at Lv.' + def.levelReq), mx + 46, ry + 9);

                for (let p = 0; p < MAX_SKILL_LEVEL; p++) {
                    ctx.fillStyle = p < lvl ? def.color : 'rgba(255,255,255,0.12)';
                    ctx.fillRect(mx + 46 + p * 16, ry + 16, 12, 5);
                }

                let canUpgrade = unlocked && skillPoints > 0 && lvl < MAX_SKILL_LEVEL;
                let btnX = mx + mw - 96, btnY = ry - 12;
                ctx.fillStyle = canUpgrade ? (playClass === 'Hunter' ? '#4166f5' : '#e8c832') : '#2a2a2a';
                roundRect(ctx, btnX, btnY, 76, 24, 4); ctx.fill();
                ctx.fillStyle = canUpgrade ? '#fff' : '#555'; ctx.font = 'bold 9px Orbitron, sans-serif'; ctx.textAlign = 'center';
                ctx.fillText(lvl >= MAX_SKILL_LEVEL ? 'MAXED' : '+ UPGRADE', btnX + 38, btnY + 15);
            }
            ctx.textAlign = 'left';
        }
    }

    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y); ctx.quadraticCurveTo(x+w, y, x+w, y+r);
        ctx.lineTo(x+w, y+h-r); ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
        ctx.lineTo(x+r, y+h); ctx.quadraticCurveTo(x, y+h, x, y+h-r);
        ctx.lineTo(x, y+r); ctx.quadraticCurveTo(x, y, x+r, y);
        ctx.closePath();
    }

    // ══════════════════════════════════════════════════════════
    //  SAVE / LOAD
    // ══════════════════════════════════════════════════════════
    let lastSaveTime = 0;

    function buildSave() {
        return {
            v: 1,
            name: playerName,
            playClass: playClass,
            rank: window.storedRank,
            level: player.level, exp: player.exp, expToNext: player.expToNext,
            maxHp: player.maxHp, maxMana: player.maxMana,
            statPoints: statPoints, skillPoints: skillPoints,
            stats: stats, skillLevels: skillLevels,
            totalKills: totalKills, totalDungeonClears: totalDungeonClears,
            rankUpProgress: rankUpProgress,
            quests: journalQuests.map(function(q) { return { id: q.id, state: q.state, base: q.base }; }),
            selectedTierIndex: selectedTierIndex,
            counters: counters,
            savedAt: Date.now()
        };
    }

    function saveGame() {
        if (currentSlot === null) return;
        try {
            localStorage.setItem(SAVE_PREFIX + currentSlot, JSON.stringify(buildSave()));
            lastSaveTime = Date.now();
        } catch (e) { /* storage full or blocked */ }
    }

    function applySave(d) {
        player.level     = d.level     || 1;
        player.exp       = d.exp       || 0;
        player.expToNext = d.expToNext || 100;
        player.maxHp     = d.maxHp;  player.hp   = d.maxHp;
        player.maxMana   = d.maxMana || 0; player.mana = player.maxMana;
        statPoints  = d.statPoints  || 0;
        skillPoints = d.skillPoints || 0;
        Object.assign(stats, d.stats || {});
        Object.assign(skillLevels, d.skillLevels || {});
        totalKills         = d.totalKills || 0;
        totalDungeonClears = d.totalDungeonClears || 0;
        Object.assign(rankUpProgress, d.rankUpProgress || {});
        Object.assign(counters, d.counters || {});
        refreshMobHp();
        (d.quests || []).forEach(function(sq) {
            let q = journalQuests.find(function(x) { return x.id === sq.id; });
            if (q) { q.state = sq.state; q.base = sq.base || 0; }
        });
        selectedTierIndex = Math.min(d.selectedTierIndex || 0, unlockedTiers().length - 1);
        // always resume next to the Gate Keeper
        player.x = npcZone.x + 45; player.y = npcZone.y + 140;
        displayedHp = player.hp; displayedMana = player.mana; displayedExp = player.exp;
    }

    if (loadedSave) applySave(loadedSave);
    else saveGame();                                   // claim the slot for a new character

    setInterval(saveGame, 3000);                       // autosave
    window.addEventListener('beforeunload', saveGame);
    document.addEventListener('visibilitychange', function() { if (document.hidden) saveGame(); });

    update();
}
