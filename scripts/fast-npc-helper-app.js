import {
  BOON_OPTIONS,
  FLAW_OPTIONS,
  ROLE_OPTIONS,
  applyFastNPCHelperToActor,
  buildPreview,
  getRoleSelectionData,
  normalizeConfig
} from "./fast-npc-helper-generator.js";

export class FastNPCHelperApp extends FormApplication {
  constructor(actor, options = {}) {
    super({}, options);
    this.actor = actor;
    this.state = this.#buildInitialState(actor);
    this.preview = null;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "fastnpchelper-app",
      title: "Fast NPC Helper",
      template: "modules/fastnpchelper/templates/fast-npc-helper-app.hbs",
      classes: ["pf2e", "fast-npc-helper-app"],
      width: 760,
      height: "auto",
      submitOnChange: false,
      closeOnSubmit: false,
      resizable: true
    });
  }

  async getData() {
    this.preview ??= await buildPreview(this.state);
    const selectionData = getRoleSelectionData(this.state);
    return {
      actor: this.actor,
      roleOptions: ROLE_OPTIONS.map((option) => ({
        ...option,
        selected: option.value === this.state.role
      })),
      boonOptions: BOON_OPTIONS.map((option) => ({
        ...option,
        checked: Boolean(this.state.boons?.[option.value])
      })),
      flawOptions: FLAW_OPTIONS.map((option) => ({
        ...option,
        checked: Boolean(this.state.flaws?.[option.value])
      })),
      loadoutOptions: selectionData.loadoutOptions,
      abilityOptions: selectionData.abilityOptions,
      state: this.state,
      preview: this.preview
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    this.#syncRoleCards(html);

    html.on("input change", "input", async (event) => {
      this.state = this.#readFormState(event);
      this.preview = await buildPreview(this.state);
      this.#renderRoleSelections(html, getRoleSelectionData(this.state));
      this.#syncRoleCards(html);
      this.#renderPreview(html, this.preview);
    });

    html.on("click", "[data-action='cancel']", (event) => {
      event.preventDefault();
      this.close();
    });
  }

  async _updateObject(_event, formData) {
    const expanded = foundry.utils.expandObject(formData);
    const config = normalizeConfig(expanded);
    try {
      await applyFastNPCHelperToActor(this.actor, config);
      ui.notifications.info(`Fast NPC Helper applied to ${this.actor.name}.`);
      this.close();
    } catch (error) {
      console.error(error);
      ui.notifications.error(`Fast NPC Helper failed: ${error.message}`);
    }
  }

  #buildInitialState(actor) {
    const savedConfig = actor.getFlag("fastnpchelper", "lastConfig");
    if (savedConfig) return normalizeConfig(savedConfig);

    return normalizeConfig({
      level: actor.system?.details?.level?.value ?? 1,
      role: "warrior",
      boons: {},
      flaws: {}
    });
  }

  #readFormState(event) {
    const form = event?.currentTarget?.form ?? this.form;
    if (!(form instanceof HTMLFormElement)) {
      return this.state;
    }

    const formData = new FormData(form);
    const flatObject = Object.fromEntries(formData.entries());
    return normalizeConfig(foundry.utils.expandObject(flatObject));
  }

  #syncRoleCards(html) {
    const cards = html.find(".fast-npc-helper-role");
    for (const card of cards) {
      const input = card.querySelector("input[name='role']");
      card.classList.toggle("selected", input?.checked === true);
    }
  }

  #renderPreview(html, preview) {
    const root = html.find("[data-preview-root]")[0];
    if (!root) return;

    root.innerHTML = `
      <div class="fast-npc-helper-preview-header">
        <div>
          <h2>${this.#escapeHtml(preview.heading)}</h2>
          <p>${this.#escapeHtml(preview.summary)}</p>
          <p>${this.#escapeHtml(preview.loadout)}</p>
        </div>
        <p class="fast-npc-helper-runes">${this.#escapeHtml(preview.runeSummary)}</p>
      </div>

      <div class="fast-npc-helper-stat-grid">
        ${preview.stats
          .map(
            (stat) => `
              <div class="fast-npc-helper-stat">
                <span class="fast-npc-helper-stat-label">${this.#escapeHtml(stat.label)}</span>
                <strong>${this.#escapeHtml(String(stat.value))}</strong>
              </div>
            `
          )
          .join("")}
      </div>

      <div class="fast-npc-helper-preview-columns">
        <div>
          <h3>Strikes</h3>
          <ul>
            ${preview.strikes
              .map(
                (strike) => `
                  <li><strong>${this.#escapeHtml(strike.label)}</strong> <span>${this.#escapeHtml(
                    strike.damage
                  )}</span></li>
                `
              )
              .join("")}
          </ul>
        </div>

        <div>
          <h3>Abilities</h3>
          <ul>
            ${preview.abilities.map((ability) => `<li>${this.#escapeHtml(ability)}</li>`).join("")}
          </ul>
        </div>
      </div>

      ${
        preview.spells.length
          ? `
            <div class="fast-npc-helper-spells">
              <h3>Spell Package</h3>
              <ul>
                ${preview.spells.map((spell) => `<li>${this.#escapeHtml(spell)}</li>`).join("")}
              </ul>
            </div>
          `
          : ""
      }
    `;
  }

  #renderRoleSelections(html, selectionData) {
    const loadoutRoot = html.find("[data-loadout-root]")[0];
    if (loadoutRoot) {
      loadoutRoot.innerHTML = selectionData.loadoutOptions
        .map(
          (option) => `
            <label class="fast-npc-helper-option-card ${option.selected ? "selected" : ""}">
              <input type="radio" name="loadout" value="${this.#escapeHtml(option.value)}" ${
                option.selected ? "checked" : ""
              } />
              <span class="fast-npc-helper-option-title">${this.#escapeHtml(option.label)}</span>
              <span class="fast-npc-helper-option-description">${this.#escapeHtml(option.description)}</span>
            </label>
          `
        )
        .join("");
    }

    const abilitiesRoot = html.find("[data-abilities-root]")[0];
    if (abilitiesRoot) {
      abilitiesRoot.innerHTML = selectionData.abilityOptions
        .map(
          (option) => `
            <label class="fast-npc-helper-option-card ${option.checked ? "selected" : ""}">
              <input type="checkbox" name="abilities.${this.#escapeHtml(option.value)}" ${
                option.checked ? "checked" : ""
              } />
              <span class="fast-npc-helper-option-title">${this.#escapeHtml(option.label)}</span>
              <span class="fast-npc-helper-option-description">${this.#escapeHtml(option.description)}</span>
            </label>
          `
        )
        .join("");
    }
  }

  #escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
}
