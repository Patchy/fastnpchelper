export const MODULE_ID = "fastnpchelper";

const GENERATED_ITEM_FLAG = `${MODULE_ID}.generated`;
const GENERATED_NOTES_START = "<!-- fastnpchelper:start -->";
const GENERATED_NOTES_END = "<!-- fastnpchelper:end -->";
const SPELL_PACK_ID = "pf2e.spells-srd";
let spellIndexCache = null;

export const ROLE_OPTIONS = [
  { value: "warrior", label: "Warrior", description: "Heavy front-liner with strong melee pressure." },
  { value: "archer", label: "Archer", description: "Mobile ranged attacker with sharp Reflex and Perception." },
  { value: "mage", label: "Mage", description: "Arcane blaster and controller with flexible spells." },
  { value: "priest", label: "Priest", description: "Divine caster with healing, support, and holy pressure." }
];

export const BOON_OPTIONS = [
  { value: "acBoon", label: "AC boon", description: "+2 AC." },
  { value: "movementBoon", label: "Movement boon", description: "+10-foot land Speed." },
  { value: "hpBoon", label: "HP boon", description: "+20% Hit Points." },
  { value: "attackBoon", label: "Attack boon", description: "+2 attack modifier." }
];

export const FLAW_OPTIONS = [
  { value: "willFlaw", label: "Will flaw", description: "-2 Will save." },
  { value: "fortFlaw", label: "Fortitude flaw", description: "-2 Fortitude save." },
  { value: "reflexFlaw", label: "Reflex flaw", description: "-2 Reflex save." },
  { value: "acFlaw", label: "AC flaw", description: "-2 AC." }
];

const ROLE_CONFIG = {
  warrior: {
    summary: "Front-line bruiser",
    tradition: null,
    spellAbility: null,
    baseSpeed: 25,
    perception: 2,
    ac: 2,
    hpMultiplier: 16,
    hpFlat: 26,
    saves: { fortitude: 4, reflex: 1, will: 1 },
    attack: 3,
    damage: 3,
    spellDC: 0,
    abilities: { str: 4, dex: 1, con: 3, int: 0, wis: 1, cha: 0 },
    skills: { athletics: 4, intimidation: 3, acrobatics: 1, survival: 2 },
    loadouts: [
      {
        value: "blade-shield",
        label: "Blade and Shield",
        description: "A durable sword-and-board bruiser.",
        strikes: [
          {
            name: "Runed Longsword",
            img: "icons/weapons/swords/sword-broad.webp",
            attackType: "melee",
            traits: ["magical", "versatile-p"],
            damageType: "slashing",
            dieSize: 8,
            note: "A disciplined blade empowered to match the creature's level."
          },
          {
            name: "Shield Bash",
            img: "icons/equipment/shield/heater-steel-segmented.webp",
            attackType: "melee",
            traits: [],
            damageType: "bludgeoning",
            dieSize: 6,
            note: "A compact follow-up strike."
          }
        ]
      },
      {
        value: "greatweapon",
        label: "Great Weapon",
        description: "High-pressure two-handed attacks.",
        strikes: [
          {
            name: "Runed Greatsword",
            img: "icons/weapons/swords/greatsword-guard-gold.webp",
            attackType: "melee",
            traits: ["magical", "versatile-p"],
            damageType: "slashing",
            dieSize: 12,
            note: "A sweeping two-handed strike built for heavy hits."
          },
          {
            name: "Pommel Smash",
            img: "icons/weapons/hammers/hammer-war-rounding.webp",
            attackType: "melee",
            traits: ["agile", "magical"],
            damageType: "bludgeoning",
            dieSize: 6,
            note: "A quick close-in follow-up with the hilt."
          }
        ]
      },
      {
        value: "polearm",
        label: "Polearm",
        description: "Reach, trip pressure, and battlefield control.",
        strikes: [
          {
            name: "Runed Halberd",
            img: "icons/weapons/polearms/halberd-crescent-glowing.webp",
            attackType: "melee",
            traits: ["magical", "reach", "trip"],
            damageType: "slashing",
            dieSize: 10,
            note: "A long hafted weapon that controls the line."
          },
          {
            name: "Haft Strike",
            img: "icons/weapons/staves/staff-simple.webp",
            attackType: "melee",
            traits: ["agile"],
            damageType: "bludgeoning",
            dieSize: 6,
            note: "A close-range strike with the weapon haft."
          }
        ]
      }
    ],
    coreAbilities: [
      "Front-line martial tuned for sustained melee pressure."
    ],
    abilityOptions: [
      {
        value: "shield-wall",
        label: "Shield Wall",
        description: "Tight defensive posture that hardens the front line.",
        notes: "Shield Wall grants an extra point of AC while the warrior braces.",
        modifiers: { ac: 1 }
      },
      {
        value: "combat-grab",
        label: "Combat Grab",
        description: "Locks enemies in place after a solid hit.",
        notes: "Combat Grab lets the warrior keep prey pinned in melee."
      },
      {
        value: "brutal-swing",
        label: "Brutal Swing",
        description: "A punishing opening hit with extra impact.",
        notes: "Brutal Swing adds extra force to the warrior's opening strike.",
        modifiers: { damageBonus: 2 }
      }
    ]
  },
  archer: {
    summary: "Mobile ranged skirmisher",
    tradition: null,
    spellAbility: null,
    baseSpeed: 30,
    perception: 3,
    ac: 1,
    hpMultiplier: 13,
    hpFlat: 18,
    saves: { fortitude: 1, reflex: 4, will: 1 },
    attack: 4,
    damage: 1,
    spellDC: 0,
    abilities: { str: 1, dex: 4, con: 2, int: 1, wis: 2, cha: 0 },
    skills: { acrobatics: 3, athletics: 1, stealth: 4, survival: 2 },
    loadouts: [
      {
        value: "longbow",
        label: "Longbow",
        description: "Classic long-range skirmisher loadout.",
        strikes: [
          {
            name: "Runed Longbow",
            img: "icons/weapons/bows/longbow-recurve-steel.webp",
            attackType: "ranged",
            traits: ["deadly-d10", "magical", "range-increment-100"],
            damageType: "piercing",
            dieSize: 8,
            note: "A ranged strike tuned for quick deployment."
          },
          {
            name: "Shortsword",
            img: "icons/weapons/swords/shortsword-simple.webp",
            attackType: "melee",
            traits: ["agile", "finesse", "magical"],
            damageType: "piercing",
            dieSize: 6,
            note: "A backup melee sidearm."
          }
        ]
      },
      {
        value: "crossbow",
        label: "Crossbow",
        description: "Punchier ranged hits with steadier tempo.",
        strikes: [
          {
            name: "Runed Heavy Crossbow",
            img: "icons/weapons/crossbows/crossbow-simple-brown.webp",
            attackType: "ranged",
            traits: ["magical", "range-increment-120"],
            damageType: "piercing",
            dieSize: 10,
            note: "A heavy ranged hit that rewards careful positioning."
          },
          {
            name: "Hatchet",
            img: "icons/weapons/axes/axe-broad-brown.webp",
            attackType: "melee",
            traits: ["agile", "sweep"],
            damageType: "slashing",
            dieSize: 6,
            note: "A compact backup weapon for close threats."
          }
        ]
      },
      {
        value: "shortbow",
        label: "Shortbow",
        description: "A mobile skirmisher with fast repositioning.",
        strikes: [
          {
            name: "Runed Shortbow",
            img: "icons/weapons/bows/shortbow-recurve.webp",
            attackType: "ranged",
            traits: ["magical", "range-increment-60"],
            damageType: "piercing",
            dieSize: 6,
            note: "A mobile ranged weapon suited for weaving through battle."
          },
          {
            name: "Twin Knives",
            img: "icons/weapons/daggers/dagger-straight-thin.webp",
            attackType: "melee",
            traits: ["agile", "finesse", "thrown-10"],
            damageType: "piercing",
            dieSize: 4,
            note: "Rapid close-range blades for desperate moments."
          }
        ]
      }
    ],
    coreAbilities: [
      "Mobile ranged attacker built to keep distance and angle for clean shots."
    ],
    abilityOptions: [
      {
        value: "hunters-aim",
        label: "Hunter's Aim",
        description: "Steady aim that sharpens the opening shot.",
        notes: "Hunter's Aim improves the archer's first ranged attack on a target.",
        modifiers: { attackBonus: 1 }
      },
      {
        value: "pinning-shot",
        label: "Pinning Shot",
        description: "Shots that slow or root enemies in place.",
        notes: "Pinning Shot makes it harder for targets to escape the archer's kill zone."
      },
      {
        value: "evasive-step",
        label: "Evasive Step",
        description: "Quick footwork after attacking.",
        notes: "Evasive Step gives the archer extra room to reposition safely.",
        modifiers: { speed: 5, saves: { reflex: 1 } }
      }
    ]
  },
  mage: {
    summary: "Arcane controller",
    tradition: "arcane",
    spellAbility: "int",
    baseSpeed: 25,
    perception: 1,
    ac: -1,
    hpMultiplier: 10,
    hpFlat: 14,
    saves: { fortitude: 0, reflex: 2, will: 4 },
    attack: 1,
    damage: 0,
    spellDC: 4,
    abilities: { str: 0, dex: 2, con: 1, int: 4, wis: 2, cha: 1 },
    skills: { arcana: 4, crafting: 2, deception: 2, occultism: 3 },
    loadouts: [
      {
        value: "battle-staff",
        label: "Battle Staff",
        description: "Traditional staff-bearing battlefield mage.",
        strikes: [
          {
            name: "Arcane Staff",
            img: "icons/weapons/staves/staff-ornate-gold-jeweled.webp",
            attackType: "melee",
            traits: ["magical", "two-hand-d8"],
            damageType: "bludgeoning",
            dieSize: 6,
            note: "A fallback strike for a battlefield caster."
          }
        ]
      },
      {
        value: "wand-dagger",
        label: "Wand and Dagger",
        description: "A compact caster who fights from tighter spaces.",
        strikes: [
          {
            name: "Runed Dagger",
            img: "icons/weapons/daggers/dagger-jeweled-purple.webp",
            attackType: "melee",
            traits: ["agile", "finesse", "magical", "thrown-10"],
            damageType: "piercing",
            dieSize: 4,
            note: "A precise magical blade for emergencies."
          },
          {
            name: "Wand Spark",
            img: "icons/weapons/wands/wand-gem-purple.webp",
            attackType: "ranged",
            traits: ["magical", "range-increment-30"],
            damageType: "force",
            dieSize: 4,
            note: "A focused magical dart from the caster's wand."
          }
        ]
      },
      {
        value: "orb-scepter",
        label: "Orb and Scepter",
        description: "An imposing caster focused on arcane projection.",
        strikes: [
          {
            name: "Runed Scepter",
            img: "icons/weapons/maces/mace-flanged-steel.webp",
            attackType: "melee",
            traits: ["magical"],
            damageType: "bludgeoning",
            dieSize: 6,
            note: "A ceremonial focus that can still crack skulls."
          }
        ]
      }
    ],
    coreAbilities: [
      "Arcane caster with a spell package pulled from the SRD compendium."
    ],
    abilityOptions: [
      {
        value: "arcane-ward",
        label: "Arcane Ward",
        description: "A layered force shield that catches glancing blows.",
        notes: "Arcane Ward hardens the mage with a floating layer of force.",
        modifiers: { ac: 1 }
      },
      {
        value: "spell-burst",
        label: "Spell Burst",
        description: "A sharper offensive casting profile.",
        notes: "Spell Burst pushes the mage's offensive spell output higher.",
        modifiers: { spellDC: 1, spellAttack: 1 }
      },
      {
        value: "countermeasure",
        label: "Countermeasure",
        description: "Prepared to unmake hostile magic.",
        notes: "Countermeasure gives the mage a ready answer to enemy spells.",
        modifiers: { saves: { will: 1 } }
      }
    ]
  },
  priest: {
    summary: "Divine support caster",
    tradition: "divine",
    spellAbility: "wis",
    baseSpeed: 25,
    perception: 2,
    ac: 0,
    hpMultiplier: 12,
    hpFlat: 20,
    saves: { fortitude: 2, reflex: 1, will: 4 },
    attack: 2,
    damage: 1,
    spellDC: 4,
    abilities: { str: 1, dex: 1, con: 2, int: 0, wis: 4, cha: 3 },
    skills: { diplomacy: 3, medicine: 4, religion: 4, society: 1 },
    loadouts: [
      {
        value: "mace-shield",
        label: "Mace and Shield",
        description: "A resilient priest standing with the faithful.",
        strikes: [
          {
            name: "Blessed Mace",
            img: "icons/weapons/maces/mace-round-steel.webp",
            attackType: "melee",
            traits: ["magical", "shove"],
            damageType: "bludgeoning",
            dieSize: 6,
            note: "A sanctified weapon for close engagement."
          },
          {
            name: "Shield Slam",
            img: "icons/equipment/shield/round-wooden-boss-steel.webp",
            attackType: "melee",
            traits: [],
            damageType: "bludgeoning",
            dieSize: 6,
            note: "A defensive slam used while holding the line."
          }
        ]
      },
      {
        value: "sacred-staff",
        label: "Sacred Staff",
        description: "A support-focused priest with a ritual staff.",
        strikes: [
          {
            name: "Sacred Staff",
            img: "icons/weapons/staves/staff-ornate-wood.webp",
            attackType: "melee",
            traits: ["magical", "two-hand-d8"],
            damageType: "bludgeoning",
            dieSize: 6,
            note: "A holy focus used in rites and battle alike."
          }
        ]
      },
      {
        value: "warbow",
        label: "Warbow",
        description: "A militant priest who supports from midline range.",
        strikes: [
          {
            name: "Consecrated Bow",
            img: "icons/weapons/bows/longbow-gold.webp",
            attackType: "ranged",
            traits: ["magical", "range-increment-100"],
            damageType: "piercing",
            dieSize: 8,
            note: "A ranged weapon used to deliver divine judgment."
          },
          {
            name: "Sanctified Knife",
            img: "icons/weapons/daggers/dagger-gold-hilt.webp",
            attackType: "melee",
            traits: ["agile", "finesse", "magical"],
            damageType: "piercing",
            dieSize: 4,
            note: "A ritual blade kept close at hand."
          }
        ]
      }
    ],
    coreAbilities: [
      "Divine support caster with healing, protection, and righteous pressure."
    ],
    abilityOptions: [
      {
        value: "healing-burst",
        label: "Healing Burst",
        description: "A pulse of restorative divine energy.",
        notes: "Healing Burst lets the priest stabilize the fight around them.",
        modifiers: { hpFlat: 10 }
      },
      {
        value: "blessed-ward",
        label: "Blessed Ward",
        description: "Protective prayer woven into every defense.",
        notes: "Blessed Ward wraps allies and the priest in a defensive benediction.",
        modifiers: { ac: 1 }
      },
      {
        value: "divine-judgment",
        label: "Divine Judgment",
        description: "A harsher edge on offensive miracles.",
        notes: "Divine Judgment sharpens the priest's offensive spellcasting.",
        modifiers: { spellDC: 1, spellAttack: 1 }
      }
    ]
  }
};

const SPELL_LIBRARY = {
  mage: {
    cantrips: [
      ["Detect Magic"],
      ["Electric Arc"],
      ["Shield"],
      ["Telekinetic Projectile"]
    ],
    ranked: {
      1: [["Force Barrage", "Magic Missile"], ["Fear"], ["Runic Weapon", "Magic Weapon"]],
      2: [["Mirror Image"], ["Laughing Fit", "Hideous Laughter"], ["Dispel Magic"]],
      3: [["Fireball"], ["Haste"], ["Slow"]],
      4: [["Fly"], ["Dimension Door"], ["Confusion"]],
      5: [["Cone of Cold"], ["Wall of Force"], ["Illusory Scene"]],
      6: [["Chain Lightning"], ["Disintegrate"], ["True Seeing"]],
      7: [["Plane Shift"], ["Prismatic Spray"], ["Spell Turning"]],
      8: [["Maze"], ["Moment of Renewal"], ["Quandary"]],
      9: [["Meteor Swarm"], ["Foresight"], ["Overwhelming Presence"]],
      10: [["Cataclysm"], ["Time Stop"], ["Remake"]]
    }
  },
  priest: {
    cantrips: [
      ["Divine Lance"],
      ["Guidance"],
      ["Shield"],
      ["Stabilize"]
    ],
    ranked: {
      1: [["Heal"], ["Bless"], ["Command"]],
      2: [["Restoration"], ["Spiritual Armament", "Spiritual Weapon"], ["Calm"]],
      3: [["Heroism"], ["Crisis of Faith"], ["Holy Light", "Searing Light"]],
      4: [["Death Ward"], ["Air Walk"], ["Vital Beacon"]],
      5: [["Breath of Life"], ["Flame Strike"], ["Summon Celestial"]],
      6: [["Blade Barrier"], ["Repulsion"], ["Spirit Blast"]],
      7: [["Divine Decree"], ["Regenerate"], ["Sunburst"]],
      8: [["Divine Aura"], ["Moment of Renewal"], ["Canticle of Everlasting Grief"]],
      9: [["Mass Heal"], ["Implosion"], ["Overwhelming Presence"]],
      10: [["Avatar"], ["Miracle"], ["Revival"]]
    }
  }
};

function clampLevel(level) {
  return Math.max(-1, Math.min(25, Number(level) || 0));
}

function normalizeBooleanMap(source = {}) {
  return Object.fromEntries(
    Object.entries(source).map(([key, value]) => [key, Boolean(value)])
  );
}

function getRoleData(role) {
  return ROLE_CONFIG[ROLE_CONFIG[role] ? role : "warrior"];
}

function getDefaultLoadout(role) {
  return getRoleData(role).loadouts[0]?.value ?? "";
}

function normalizeRoleAbilityMap(source = {}, role) {
  const validOptions = getRoleData(role).abilityOptions;
  const normalized = {};

  for (const option of validOptions) {
    normalized[option.value] = Boolean(source?.[option.value]);
  }

  if (!Object.values(normalized).some(Boolean) && validOptions.length) {
    normalized[validOptions[0].value] = true;
  }

  return normalized;
}

export function normalizeConfig(raw = {}) {
  const role = ROLE_CONFIG[raw.role] ? raw.role : "warrior";
  const roleData = getRoleData(role);
  const loadout = roleData.loadouts.some((option) => option.value === raw.loadout)
    ? raw.loadout
    : getDefaultLoadout(role);

  return {
    level: clampLevel(raw.level),
    role,
    loadout,
    abilities: normalizeRoleAbilityMap(raw.abilities, role),
    boons: normalizeBooleanMap(raw.boons),
    flaws: normalizeBooleanMap(raw.flaws)
  };
}

export function getRoleSelectionData(config) {
  const normalized = normalizeConfig(config);
  const roleData = getRoleData(normalized.role);
  return {
    loadoutOptions: roleData.loadouts.map((option) => ({
      ...option,
      selected: option.value === normalized.loadout
    })),
    abilityOptions: roleData.abilityOptions.map((option) => ({
      ...option,
      checked: Boolean(normalized.abilities?.[option.value])
    }))
  };
}

function scalingStep(level) {
  return Math.max(0, Math.floor((level + 1) / 5));
}

function getSelectedLoadout(role, loadoutValue) {
  const roleData = getRoleData(role);
  return roleData.loadouts.find((option) => option.value === loadoutValue) ?? roleData.loadouts[0];
}

function getSelectedAbilityOptions(role, abilityMap = {}) {
  return getRoleData(role).abilityOptions.filter((option) => abilityMap[option.value]);
}

function roleAbilityMods(level, role) {
  const step = scalingStep(level);
  const base = ROLE_CONFIG[role].abilities;
  return {
    str: base.str + (base.str >= 4 ? step : Math.floor(step / 2)),
    dex: base.dex + (base.dex >= 4 ? step : Math.floor(step / 2)),
    con: base.con + (base.con >= 3 ? step : Math.floor(step / 2)),
    int: base.int + (base.int >= 4 ? step : Math.floor(step / 2)),
    wis: base.wis + (base.wis >= 4 ? step : Math.floor(step / 2)),
    cha: base.cha + (base.cha >= 3 ? step : Math.floor(step / 2))
  };
}

function computeStats(config) {
  const roleData = ROLE_CONFIG[config.role];
  const level = config.level;
  const tier = scalingStep(level);
  const abilityMods = roleAbilityMods(level, config.role);
  const loadout = getSelectedLoadout(config.role, config.loadout);
  const selectedAbilities = getSelectedAbilityOptions(config.role, config.abilities);

  const stats = {
    level,
    role: config.role,
    roleLabel: ROLE_OPTIONS.find((option) => option.value === config.role)?.label ?? config.role,
    summary: roleData.summary,
    loadoutLabel: loadout.label,
    loadoutDescription: loadout.description,
    ac: 17 + level + roleData.ac,
    hp: Math.max(8, roleData.hpFlat + ((level + 1) * roleData.hpMultiplier)),
    speed: roleData.baseSpeed,
    perception: 5 + level + roleData.perception,
    saves: {
      fortitude: 5 + level + roleData.saves.fortitude,
      reflex: 5 + level + roleData.saves.reflex,
      will: 5 + level + roleData.saves.will
    },
    attackBonus: 7 + level + roleData.attack,
    damageBonus: 3 + Math.max(0, level) + roleData.damage + tier,
    spellDC: roleData.tradition ? 17 + level + roleData.spellDC : null,
    spellAttack: roleData.tradition ? 7 + level + roleData.spellDC : null,
    abilityMods,
    skills: buildSkillProfile(level, config.role, abilityMods),
    strikes: [],
    runeSummary: buildRuneSummary(level, roleData),
    abilitiesText: [
      ...roleData.coreAbilities,
      ...selectedAbilities.map((option) => `${option.label}: ${option.notes}`)
    ]
  };

  applyAdjustments(stats, config);
  applyMagicItemFudge(stats, config.role, roleData);
  applySelectedAbilityModifiers(stats, selectedAbilities);
  stats.strikes = loadout.strikes.map((strike, index) => buildStrike(level, strike, stats, index));

  return stats;
}

function buildSkillProfile(level, role, abilityMods) {
  const roleSkills = ROLE_CONFIG[role].skills;
  const baseMap = {
    acrobatics: abilityMods.dex,
    arcana: abilityMods.int,
    athletics: abilityMods.str,
    crafting: abilityMods.int,
    deception: abilityMods.cha,
    diplomacy: abilityMods.cha,
    intimidation: abilityMods.cha,
    medicine: abilityMods.wis,
    nature: abilityMods.wis,
    occultism: abilityMods.int,
    performance: abilityMods.cha,
    religion: abilityMods.wis,
    society: abilityMods.int,
    stealth: abilityMods.dex,
    survival: abilityMods.wis,
    thievery: abilityMods.dex
  };

  for (const [skill, bonus] of Object.entries(roleSkills)) {
    baseMap[skill] = 4 + level + bonus;
  }

  return baseMap;
}

function applyAdjustments(stats, config) {
  const { boons, flaws } = config;

  if (boons.acBoon) stats.ac += 2;
  if (boons.movementBoon) stats.speed += 10;
  if (boons.hpBoon) stats.hp = Math.round(stats.hp * 1.2);
  if (boons.attackBoon) stats.attackBonus += 2;

  if (flaws.willFlaw) stats.saves.will -= 2;
  if (flaws.fortFlaw) stats.saves.fortitude -= 2;
  if (flaws.reflexFlaw) stats.saves.reflex -= 2;
  if (flaws.acFlaw) stats.ac -= 2;
}

function applySelectedAbilityModifiers(stats, selectedAbilities) {
  for (const ability of selectedAbilities) {
    const modifiers = ability.modifiers ?? {};
    if (Number.isFinite(modifiers.ac)) stats.ac += modifiers.ac;
    if (Number.isFinite(modifiers.speed)) stats.speed += modifiers.speed;
    if (Number.isFinite(modifiers.hpFlat)) stats.hp += modifiers.hpFlat;
    if (Number.isFinite(modifiers.attackBonus)) stats.attackBonus += modifiers.attackBonus;
    if (Number.isFinite(modifiers.damageBonus)) stats.damageBonus += modifiers.damageBonus;
    if (Number.isFinite(modifiers.perception)) stats.perception += modifiers.perception;

    if (Number.isFinite(modifiers.spellDC) && stats.spellDC !== null) {
      stats.spellDC += modifiers.spellDC;
    }

    if (Number.isFinite(modifiers.spellAttack) && stats.spellAttack !== null) {
      stats.spellAttack += modifiers.spellAttack;
    }

    if (modifiers.saves) {
      for (const [save, bonus] of Object.entries(modifiers.saves)) {
        if (save in stats.saves && Number.isFinite(bonus)) {
          stats.saves[save] += bonus;
        }
      }
    }
  }
}

function buildRuneSummary(level, roleData) {
  if (level >= 19) {
    return roleData.tradition
      ? "Major striking, layered armor magic, and apex caster focus."
      : "Major striking with layered property runes and apex defensive magic.";
  }

  if (level >= 12) {
    return roleData.tradition
      ? "Greater striking, reinforced defenses, and a strong magical focus."
      : "Greater striking with notable property runes and reinforced defenses.";
  }

  if (level >= 4) {
    return roleData.tradition
      ? "Striking weapon scaling with light rune support and a growing caster focus."
      : "Striking weapon scaling with light property and armor support.";
  }

  return roleData.tradition
    ? "Mundane-grade gear supported by an apprentice magical focus."
    : "Mundane-grade gear with light magical support.";
}

function getWeaponPropertyDamageBonus(level) {
  if (level >= 20) return 3;
  if (level >= 14) return 2;
  if (level >= 8) return 1;
  return 0;
}

function getArmorMagicBonuses(level) {
  return {
    acBonus: level >= 19 ? 2 : level >= 11 ? 1 : 0,
    saveBonus: level >= 20 ? 2 : level >= 9 ? 1 : 0
  };
}

function getCasterMagicBonuses(level) {
  return {
    spellBonus: level >= 21 ? 3 : level >= 15 ? 2 : level >= 7 ? 1 : 0,
    personalBonus: level >= 19 ? 2 : level >= 11 ? 1 : 0
  };
}

function applyMagicItemFudge(stats, role, roleData) {
  const weaponPropertyDamage = getWeaponPropertyDamageBonus(stats.level);
  const armorMagic = getArmorMagicBonuses(stats.level);
  const casterMagic = getCasterMagicBonuses(stats.level);

  if (weaponPropertyDamage) {
    stats.damageBonus += weaponPropertyDamage;
  }

  if (armorMagic.acBonus) {
    stats.ac += armorMagic.acBonus;
  }

  if (armorMagic.saveBonus) {
    stats.saves.fortitude += armorMagic.saveBonus;
    stats.saves.reflex += armorMagic.saveBonus;
    stats.saves.will += armorMagic.saveBonus;
  }

  if (roleData.tradition) {
    if (stats.spellDC !== null) stats.spellDC += casterMagic.spellBonus;
    if (stats.spellAttack !== null) stats.spellAttack += casterMagic.spellBonus;
    if (casterMagic.personalBonus) {
      stats.perception += casterMagic.personalBonus;
      applyCasterPersonalBonus(stats.skills, role, casterMagic.personalBonus);
    }
  }

  const notes = [];
  if (weaponPropertyDamage) notes.push(`weapon damage +${weaponPropertyDamage}`);
  if (armorMagic.acBonus) notes.push(`armor value +${armorMagic.acBonus} AC`);
  if (armorMagic.saveBonus) notes.push(`resilient defense +${armorMagic.saveBonus} saves`);
  if (roleData.tradition && casterMagic.spellBonus) notes.push(`focus item +${casterMagic.spellBonus} spellcasting`);
  if (roleData.tradition && casterMagic.personalBonus) notes.push(`personal wards +${casterMagic.personalBonus} perception/skills`);

  if (notes.length) {
    stats.abilitiesText.push(`Implied gear budget: ${notes.join(", ")}.`);
  }
}

function applyCasterPersonalBonus(skills, role, bonus) {
  const boostedSkills =
    role === "mage"
      ? ["arcana", "occultism", "crafting"]
      : role === "priest"
        ? ["religion", "medicine", "diplomacy"]
        : [];

  for (const skill of boostedSkills) {
    if (skill in skills) {
      skills[skill] += bonus;
    }
  }
}

function getWeaponDiceCount(level) {
  if (level >= 19) return 4;
  if (level >= 12) return 3;
  if (level >= 4) return 2;
  return 1;
}

function buildStrike(level, strike, stats, index) {
  const diceCount = getWeaponDiceCount(level);
  const agilePenalty = strike.traits.includes("agile") ? 1 : 0;
  const attackBonus = stats.attackBonus - index - agilePenalty;
  const damage = `${diceCount}d${strike.dieSize}+${stats.damageBonus}`;
  const label = `${strike.name} +${attackBonus}`;
  return {
    ...strike,
    attackBonus,
    damage,
    label
  };
}

function highestSpellRank(level) {
  if (level < 1) return 1;
  return Math.min(10, Math.ceil((level + 1) / 2));
}

async function buildSpellSources(config, stats) {
  const roleData = ROLE_CONFIG[config.role];
  if (!roleData.tradition) {
    return { entrySource: null, spellSources: [], previewLines: [] };
  }

  const pack = game.packs.get(SPELL_PACK_ID);
  if (!pack) {
    return {
      entrySource: null,
      spellSources: [],
      previewLines: ["Spell pack not found: expected pf2e.spells-srd."]
    };
  }

  const library = SPELL_LIBRARY[config.role];
  const rank = highestSpellRank(config.level);
  const slotData = buildSpellSlots(rank);
  const entrySource = {
    name: `${stats.roleLabel} Spellcasting`,
    type: "spellcastingEntry",
    img: "icons/svg/book.svg",
    system: {
      description: { value: `<p>Generated ${stats.roleLabel.toLowerCase()} spellcasting.</p>`, gm: "" },
      rules: [],
      slug: slugify(`${config.role}-spellcasting`),
      publication: buildPublicationData(),
      traits: { otherTags: [] },
      ability: { value: roleData.spellAbility },
      spelldc: { value: stats.spellAttack, dc: stats.spellDC },
      tradition: { value: roleData.tradition },
      prepared: { value: "spontaneous", flexible: false, validItems: null },
      showSlotlessLevels: { value: true },
      proficiency: { slug: "spellcasting", value: Math.min(4, 2 + Math.floor(Math.max(config.level, 0) / 7)) },
      slots: slotData,
      autoHeightenLevel: { value: null }
    },
    flags: buildGeneratedFlags()
  };

  const previewLines = [];
  const spellSources = [];
  const cantrips = await fetchSpellSources(pack, library.cantrips, 0);
  if (cantrips.length) {
    previewLines.push(`Cantrips: ${cantrips.map((spell) => spell.name).join(", ")}`);
    spellSources.push(...cantrips.map((spell) => ({ ...spell, system: { ...spell.system, location: { value: null, autoHeightenLevel: rank } } })));
  }

  for (let currentRank = 1; currentRank <= rank; currentRank += 1) {
    const requested = library.ranked[currentRank] ?? library.ranked[Math.min(10, currentRank)];
    if (!requested) continue;
    const spells = await fetchSpellSources(pack, requested, currentRank);
    if (!spells.length) continue;
    previewLines.push(`Rank ${currentRank}: ${spells.map((spell) => spell.name).join(", ")}`);
    spellSources.push(...spells);
  }

  return { entrySource, spellSources, previewLines };
}

function buildSpellSlots(highestRankValue) {
  const slots = {};
  for (let rank = 0; rank <= 10; rank += 1) {
    const max = rank === 0 ? 0 : rank > highestRankValue ? 0 : rank === highestRankValue ? 2 : 3;
    slots[`slot${rank}`] = {
      value: max,
      max,
      prepared: []
    };
  }
  return slots;
}

async function fetchSpellSources(pack, requestedGroups, rank) {
  const results = [];
  for (const aliases of requestedGroups) {
    const source = await fetchSpellByAliases(pack, aliases, rank);
    if (source) results.push(source);
  }
  return results;
}

async function fetchSpellByAliases(pack, aliases, rank) {
  const index = await getSpellIndex(pack);
  for (const alias of aliases) {
    const indexed = index.find((entry) => entry.name?.toLowerCase() === alias.toLowerCase());
    if (!indexed?._id) continue;
    const spell = await pack.getDocument(indexed._id);
    if (!spell) continue;
    const source = spell.toObject();
    delete source._id;
    delete source.folder;
    delete source.sort;
    delete source.ownership;
    source.flags = foundry.utils.mergeObject(source.flags ?? {}, buildGeneratedFlags());
    source.system.location = {
      value: null,
      heightenedLevel: rank,
      autoHeightenLevel: rank === 0 ? highestSpellRank(Math.max(1, source.system.level?.value ?? 1)) : undefined
    };
    return source;
  }
  return null;
}

async function getSpellIndex(pack) {
  if (spellIndexCache) return spellIndexCache;
  spellIndexCache = await pack.getIndex({ fields: ["name"] });
  return spellIndexCache;
}

function buildActorUpdate(actor, config, stats) {
  const notes = buildGeneratedNotes(actor?.system?.details?.publicNotes ?? "", config, stats);
  return {
    [`flags.${MODULE_ID}.lastConfig`]: config,
    "system.details.level.value": stats.level,
    "system.details.blurb": `${stats.roleLabel} quick template`,
    "system.details.publicNotes": notes,
    "system.attributes.ac.value": stats.ac,
    "system.attributes.hp.max": stats.hp,
    "system.attributes.hp.value": stats.hp,
    "system.attributes.hp.details": `${stats.roleLabel} template HP`,
    "system.attributes.speed.value": stats.speed,
    "system.attributes.speed.details": stats.runeSummary,
    "system.attributes.speed.otherSpeeds": [],
    "system.perception.mod": stats.perception,
    "system.perception.details": `${stats.roleLabel} template perception`,
    "system.saves.fortitude.value": stats.saves.fortitude,
    "system.saves.reflex.value": stats.saves.reflex,
    "system.saves.will.value": stats.saves.will,
    "system.saves.fortitude.saveDetail": "",
    "system.saves.reflex.saveDetail": "",
    "system.saves.will.saveDetail": "",
    "system.abilities.str.mod": stats.abilityMods.str,
    "system.abilities.dex.mod": stats.abilityMods.dex,
    "system.abilities.con.mod": stats.abilityMods.con,
    "system.abilities.int.mod": stats.abilityMods.int,
    "system.abilities.wis.mod": stats.abilityMods.wis,
    "system.abilities.cha.mod": stats.abilityMods.cha,
    "system.skills.acrobatics.base": stats.skills.acrobatics,
    "system.skills.arcana.base": stats.skills.arcana,
    "system.skills.athletics.base": stats.skills.athletics,
    "system.skills.crafting.base": stats.skills.crafting,
    "system.skills.deception.base": stats.skills.deception,
    "system.skills.diplomacy.base": stats.skills.diplomacy,
    "system.skills.intimidation.base": stats.skills.intimidation,
    "system.skills.medicine.base": stats.skills.medicine,
    "system.skills.nature.base": stats.skills.nature,
    "system.skills.occultism.base": stats.skills.occultism,
    "system.skills.performance.base": stats.skills.performance,
    "system.skills.religion.base": stats.skills.religion,
    "system.skills.society.base": stats.skills.society,
    "system.skills.stealth.base": stats.skills.stealth,
    "system.skills.survival.base": stats.skills.survival,
    "system.skills.thievery.base": stats.skills.thievery
  };
}

function buildGeneratedNotes(existingNotes, config, stats) {
  const adjustmentLabels = [
    ...BOON_OPTIONS.filter((option) => config.boons[option.value]).map((option) => option.label),
    ...FLAW_OPTIONS.filter((option) => config.flaws[option.value]).map((option) => option.label)
  ];

  const generatedBlock = [
    GENERATED_NOTES_START,
    `<section class="fast-npc-helper-notes">`,
    `<h2>${stats.roleLabel} Template</h2>`,
    `<p>Level ${stats.level} ${stats.roleLabel.toLowerCase()} built by ${MODULE_ID}.</p>`,
    `<p>Loadout: ${stats.loadoutLabel}.</p>`,
    `<p>${stats.runeSummary}</p>`,
    `<ul>`,
    ...stats.abilitiesText.map((entry) => `<li>${entry}</li>`),
    `</ul>`,
    adjustmentLabels.length ? `<p>Adjustments: ${adjustmentLabels.join(", ")}</p>` : "",
    `</section>`,
    GENERATED_NOTES_END
  ].filter(Boolean).join("");

  if (!existingNotes?.includes(GENERATED_NOTES_START)) {
    return `${existingNotes ?? ""}${existingNotes ? "<hr>" : ""}${generatedBlock}`;
  }

  const pattern = new RegExp(`${escapeRegExp(GENERATED_NOTES_START)}[\\s\\S]*?${escapeRegExp(GENERATED_NOTES_END)}`);
  return existingNotes.replace(pattern, generatedBlock);
}

function buildMeleeItemSource(strike) {
  return {
    name: strike.name,
    type: "melee",
    img: strike.img,
    system: {
      description: { value: `<p>${strike.note}</p>`, gm: "" },
      rules: [],
      slug: slugify(strike.name),
      publication: buildPublicationData(),
      traits: { value: strike.traits, otherTags: [] },
      damageRolls: {
        primary: {
          damage: strike.damage,
          damageType: strike.damageType,
          category: null
        }
      },
      bonus: { value: strike.attackBonus },
      attackEffects: { value: [] }
    },
    flags: buildGeneratedFlags()
  };
}

function buildPublicationData() {
  return {
    title: "Fast NPC Helper",
    authors: "Patchy",
    license: "ORC",
    remaster: true
  };
}

function buildGeneratedFlags() {
  return {
    [MODULE_ID]: {
      generated: true
    }
  };
}

function hasGeneratedFlag(item) {
  return Boolean(item?.flags?.[MODULE_ID]?.generated);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function buildQuickNPC(config) {
  const normalized = normalizeConfig(config);
  const stats = computeStats(normalized);
  const actorUpdate = buildActorUpdate(null, normalized, stats);
  const itemSources = stats.strikes.map((strike) => buildMeleeItemSource(strike));
  const spellBundle = await buildSpellSources(normalized, stats);

  return {
    config: normalized,
    stats,
    actorUpdate,
    itemSources,
    spellBundle
  };
}

export async function buildPreview(config) {
  const quickNpc = await buildQuickNPC(config);
  return {
    heading: `Level ${quickNpc.stats.level} ${quickNpc.stats.roleLabel}`,
    summary: quickNpc.stats.summary,
    loadout: `${quickNpc.stats.loadoutLabel}: ${quickNpc.stats.loadoutDescription}`,
    stats: [
      { label: "AC", value: quickNpc.stats.ac },
      { label: "HP", value: quickNpc.stats.hp },
      { label: "Speed", value: `${quickNpc.stats.speed} ft.` },
      { label: "Perception", value: formatModifier(quickNpc.stats.perception) },
      { label: "Fort", value: formatModifier(quickNpc.stats.saves.fortitude) },
      { label: "Ref", value: formatModifier(quickNpc.stats.saves.reflex) },
      { label: "Will", value: formatModifier(quickNpc.stats.saves.will) },
      { label: "Attack", value: formatModifier(quickNpc.stats.attackBonus) },
      {
        label: "Spell DC",
        value: quickNpc.stats.spellDC ? quickNpc.stats.spellDC : "None"
      }
    ],
    runeSummary: quickNpc.stats.runeSummary,
    strikes: quickNpc.stats.strikes.map((strike) => ({
      label: strike.label,
      damage: `${strike.damage} ${strike.damageType}`
    })),
    abilities: [...quickNpc.stats.abilitiesText],
    spells: [...quickNpc.spellBundle.previewLines]
  };
}

function formatModifier(value) {
  return value >= 0 ? `+${value}` : String(value);
}

export async function applyFastNPCHelperToActor(actor, config) {
  if (!actor || actor.type !== "npc") {
    throw new Error("Fast NPC Helper can only be applied to PF2e NPC actors.");
  }

  const quickNpc = await buildQuickNPC(config);
  quickNpc.actorUpdate["system.details.publicNotes"] = buildGeneratedNotes(
    actor.system?.details?.publicNotes ?? "",
    quickNpc.config,
    quickNpc.stats
  );

  const generatedIds = actor.items.filter((item) => hasGeneratedFlag(item)).map((item) => item.id);
  if (generatedIds.length) {
    await actor.deleteEmbeddedDocuments("Item", generatedIds);
  }

  await actor.update(quickNpc.actorUpdate);

  let spellEntry = null;
  if (quickNpc.spellBundle.entrySource) {
    const [createdEntry] = await actor.createEmbeddedDocuments("Item", [quickNpc.spellBundle.entrySource]);
    spellEntry = createdEntry;
  }

  const baseItems = [...quickNpc.itemSources];
  if (baseItems.length) {
    await actor.createEmbeddedDocuments("Item", baseItems);
  }

  if (spellEntry && quickNpc.spellBundle.spellSources.length) {
    const spellSources = quickNpc.spellBundle.spellSources.map((spellSource) => {
      const source = foundry.utils.deepClone(spellSource);
      source.system.location = {
        ...source.system.location,
        value: spellEntry.id
      };
      return source;
    });
    await actor.createEmbeddedDocuments("Item", spellSources);
  }

  return quickNpc;
}
