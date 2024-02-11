import {
  BaseInteraction,
  ChatInputCommandInteraction,
  Interaction,
  SlashCommandBuilder,
} from "discord.js";
import { BotCommand } from "src/Types";

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName("ConfigureBot")
    .setDescription("Configure the bot for your server")
    .addChannelOption((option) =>
      option
        .setName("Channel")
        .setDescription("Select the voice channel events will take place in")
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName("Alert Role")
        .setDescription(
          "Select the Role which will be alerted about upcoming events"
        )
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("Schedule Day")
        .setDescription("Set the day on which the schedule job will run")
        .addChoices(
          { name: "Monday", value: 1 },
          { name: "Tuesday", value: 2 },
          { name: "Wednesday", value: 3 },
          { name: "Thursday", value: 4 },
          { name: "Friday", value: 5 },
          { name: "Saturday", value: 6 },
          { name: "Sunday", value: 7 }
        )
        .setRequired(true)
    ),

  execute: async (interaction: ChatInputCommandInteraction) => {
    const channel = interaction.options.getChannel("Channel");
    const alertRole = interaction.options.getRole("Alert Role");
    const scheduleDay = interaction.options.getInteger("Schedule Day");

    console.log(`Received config command:
        Channel: ${channel?.name}
        Alert Role: ${alertRole?.name}
        Schedule Day: ${scheduleDay}`);
  },
};

export default command;
