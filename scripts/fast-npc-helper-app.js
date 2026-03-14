import {
  BOON_OPTIONS,
  FLAW_OPTIONS,
  ROLE_OPTIONS,
  applyFastNPCHelperToActor,
  buildPreview,
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
      state: this.state,
      preview: this.preview
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.on("input change", "input", async () => {
      this.state = this.#readFormState(html);
      this.preview = await buildPreview(this.state);
      this.render(false);
    });

    html.on("click", "[data-action='cancel']", (event) => {
      event.preventDefault();
      this.close();
    });
  }

  async _updateObject(_event, formData) {
    const expanded = foundry.utils.expandObject(formData);
    const config = normalizeConfig(expanded);
    await applyFastNPCHelperToActor(this.actor, config);
    ui.notifications.info(`Fast NPC Helper applied to ${this.actor.name}.`);
    this.close();
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

  #readFormState(html) {
    const form = html.find("form")[0];
    const formData = new FormDataExtended(form);
    return normalizeConfig(foundry.utils.expandObject(formData.object));
  }
}
