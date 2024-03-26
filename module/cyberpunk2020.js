import { CyberpunkActor } from "./actor/actor.js";
import { CyberpunkActorSheet } from "./actor/actor-sheet.js";
import { CyberpunkItem } from "./item/item.js";
import { CyberpunkItemSheet } from "./item/item-sheet.js";

import { preloadHandlebarsTemplates } from "./templates.js";
import { registerHandlebarsHelpers } from "./handlebars-helpers.js"
import * as migrations from "./migrate.js";
import { registerSystemSettings } from "./settings.js"

Hooks.once('init', async function () {

    // Place classes in system namespace for later reference.
    game.cyberpunk = {
        entities: {
            CyberpunkActor,
            CyberpunkItem,
        },
        // A manual migrateworld.
        migrateWorld: migrations.migrateWorld
    };

    // Define custom Document classes
    CONFIG.Actor.documentClass = CyberpunkActor;
    CONFIG.Item.documentClass = CyberpunkItem;

    // Register sheets, unregister original core sheets
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("cyberpunk2020", CyberpunkActorSheet, { makeDefault: true });
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("cyberpunk2020", CyberpunkItemSheet, { makeDefault: true });

    // Register System Settings
    registerSystemSettings();

    registerHandlebarsHelpers();

    // Register and preload templates with Foundry. See templates.js for usage
    preloadHandlebarsTemplates();
});

/**
 * Once the entire VTT framework is initialized, check to see if we should perform a data migration (nabbed from Foundry's 5e module and adapted)
 */
Hooks.once("ready", function() {
    // Determine whether a system migration is required and feasible
    if ( !game.user.isGM ) return;
    const lastMigrateVersion = game.settings.get("cyberpunk2020", "systemMigrationVersion");
    // We do need to try migrating if we haven't run before - as it stands, previous worlds didn't use this setting, or by default had it set to current version

    // The version migrations need to begin - if you make a change from 0.1 to 0.2, this should be 0.2
    const NEEDS_MIGRATION_VERSION = "0.3.0";
    console.log("CYBERPUNK: Last migrated in version: " + lastMigrateVersion);
    const needsMigration = isNewerVersion(NEEDS_MIGRATION_VERSION, lastMigrateVersion);
    if ( !needsMigration ) return;
    migrations.migrateWorld();
});