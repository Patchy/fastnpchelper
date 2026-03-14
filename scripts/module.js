import { FastNPCHelperApp } from "./fast-npc-helper-app.js";
import { MODULE_ID } from "./fast-npc-helper-generator.js";

Hooks.once("init", () => {
  console.log(`${MODULE_ID} | Initializing`);
});

Hooks.on("getActorContextOptions", (_application, menuItems) => {
  menuItems.push({
    name: "Quick NPC",
    icon: '<i class="fas fa-bolt"></i>',
    condition: (li) => {
      if (game.system.id !== "pf2e") return false;

      const actor = getActorFromContext(li);
      return Boolean(actor?.isOwner && actor.type === "npc");
    },
    callback: (li) => {
      const actor = getActorFromContext(li);
      if (!actor) {
        ui.notifications.warn("Fast NPC Helper could not find the selected actor.");
        return;
      }

      if (actor.type !== "npc") {
        ui.notifications.warn("Fast NPC Helper currently supports PF2e NPC actors only.");
        return;
      }

      new FastNPCHelperApp(actor).render(true);
    }
  });
});

function getActorFromContext(li) {
  const element = li instanceof HTMLElement ? li : li?.[0] ?? li?.get?.(0) ?? null;
  const actorId = element?.dataset?.documentId ?? element?.dataset?.entryId ?? null;
  return actorId ? game.actors.get(actorId) : null;
}
