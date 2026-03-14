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
    ],
    abilitiesText: [
      "Attack of Opportunity style reaction.",
      "Brutal follow-through that pressures adjacent foes."
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
    ],
    abilitiesText: [
      "Pinning volley that punishes clustered enemies.",
      "Skirmisher movement that keeps distance while attacking."
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
    ],
    abilitiesText: [
      "Arcane countermeasure keyed to the creature's spell tradition.",
      "Spell barrage package selected from the SRD spell compendium."
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
    strikes: [
      {
        name: "Blessed Mace",
        img: "icons/weapons/maces/mace-round-steel.webp",
        attackType: "melee",
        traits: ["magical", "shove"],
        damageType: "bludgeoning",
        dieSize: 6,
        note: "A sanctified weapon for close engagement."
      }
    ],
    abilitiesText: [
      "Healing prayer that reinforces nearby allies.",
      "Protective ward keyed to divine devotion."
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

export function normalizeConfig(raw = {}) {
  const role = ROLE_CONFIG[raw.role] ? raw.role : "warrior";
  return {
    level: clampLevel(raw.level),
    role,
    boons: normalizeBooleanMap(raw.boons),
    flaws: normalizeBooleanMap(raw.flaws)
  };
}

function scalingStep(level) {
  return Math.max(0, Math.floor((level + 1) / 5));
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

  const stats = {
    level,
    role: config.role,
    roleLabel: ROLE_OPTIONS.find((option) => option.value === config.role)?.label ?? config.role,
    summary: roleData.summary,
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
    runeSummary: buildRuneSummary(level),
    abilitiesText: [...roleData.abilitiesText]
  };

  applyAdjustments(stats, config);
  stats.strikes = roleData.strikes.map((strike, index) => buildStrike(level, strike, stats, index));

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

function buildRuneSummary(level) {
  if (level >= 16) return "Major striking with high-grade potency.";
  if (level >= 10) return "Greater striking with solid potency.";
  if (level >= 4) return "Striking weapon scaling with level.";
  return "Mundane-grade gear with light magical support.";
}

function buildStrike(level, strike, stats, index) {
  const diceCount = Math.min(4, Math.max(1, 1 + Math.floor(Math.max(level, 0) / 5)));
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
    license: "All Rights Reserved",
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
