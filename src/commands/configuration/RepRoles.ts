import { RepRoles } from "@/mongo/schemas/RepRoles";
import type { DiscordClient } from "@/registry/DiscordClient";
import BaseCommand, {
    type DiscordChatInputCommandInteraction
} from "@/registry/Structure/BaseCommand";
import {
    PermissionFlagsBits,
    SlashCommandBuilder
} from "discord.js";

export default class FeedbackChannelCommand extends BaseCommand {
    constructor() {
        super(
            new SlashCommandBuilder()
                .setName("rep_roles")
                .setDescription("Modify reputation roles (for mods)")
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName("add")
                        .setDescription("Add a role for a certain rep")
                        .addRoleOption((option) =>
                            option
                                .setName("role")
                                .setDescription(
                                    "The role to give"
                                )
                                .setRequired(true)
                        )
                        .addIntegerOption((option) =>
                            option
                                .setName("rep")
                                .setDescription("The amount of reputation required")
                                .setRequired(true)
                        )
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName("remove")
                        .setDescription("Remove a feedback channel")
                        .addRoleOption((option) =>
                            option
                                .setName("role")
                                .setDescription("The role to remove")
                                .setRequired(true)
                        )
                )
                .setDMPermission(false)
                .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        );
    }

    async execute(
        client: DiscordClient<true>,
        interaction: DiscordChatInputCommandInteraction<"cached">
    ) {
        const role = interaction.options.getRole("role", true);

        if (!role) {
            interaction.reply({
                content: "An error occurred",
                ephemeral: true
            });

            return;
        }

        switch (interaction.options.getSubcommand()) {
            case "add": {
                const repDoc = await RepRoles.findOne({
                    roleId: role.id
                });
                if (repDoc) {
                    interaction.reply({
                        content: `${role} is already given to users (at ${repDoc.rep} rep)`,
                        ephemeral: true
                    });

                    return;
                }

                const rep = interaction.options.getInteger("rep");
                await RepRoles.create({
                    guildId: interaction.guildId,
                    roleId: role.id,
                    rep
                });

                await interaction.reply({
                    content: `Successfully added ${role} to be given to all users with at least ${rep} rep`,
                    ephemeral: true
                });

                break;
            }
            case "remove": {
                const doc = await RepRoles.findOne({
                    roleId: role.id
                });

                if (!doc) {
                    interaction.reply({
                        content: "This role isn't given to people via rep",
                        ephemeral: true
                    });

                    return;
                }

                doc.deleteOne();

                await interaction.reply({
                    content: `Successfully removed ${role} from being given at ${doc.rep} rep`,
                    ephemeral: true
                });

                break;
            }
            default:
                break;
        }
    }
}