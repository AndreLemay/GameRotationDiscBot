import {
  ActionRowBuilder,
  ChannelType,
  ChatInputCommandInteraction,
  ComponentType,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { BotCommand } from "src/Types";
import { updateBotConfig } from "../../Database/MongoClient";
import { WeekdayNumbers } from "luxon";

const COMMAND_NAME = "configure-bot";
const OPTIONS = {
  CHANNEL: "channel",
  ALERT_ROLE: "alert-role",
  SCHEDULE_DAY: "schedule-day",
  MAIN_ROTATION_DAYS: "main-rotation-days",
  SECONDARY_ROTATION_DAYS: "secondary-rotation-days",
  MAIN_ROTATION_DURATION: "main-rotation-duration",
};
const weekdayOptions = [
  { name: "Monday", value: 1 },
  { name: "Tuesday", value: 2 },
  { name: "Wednesday", value: 3 },
  { name: "Thursday", value: 4 },
  { name: "Friday", value: 5 },
  { name: "Saturday", value: 6 },
  { name: "Sunday", value: 7 },
];

const mainRotationRows = [
  new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(OPTIONS.MAIN_ROTATION_DAYS)
      .setPlaceholder("Main rotation days")
      .addOptions(
        ...weekdayOptions.map((weekday) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(weekday.name)
            .setValue(weekday.value.toString())
        )
      )
      .setMinValues(1)
      .setMaxValues(7)
  ),
];

const secondaryRotationRows = [
  new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(OPTIONS.SECONDARY_ROTATION_DAYS)
      .setPlaceholder("Secondary rotation days")
      .addOptions(
        ...weekdayOptions.map((weekday) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(weekday.name)
            .setValue(weekday.value.toString())
        )
      )
      .setMinValues(1)
      .setMaxValues(7)
  ),
];

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription("Configure the bot for your server")
    .addChannelOption((option) =>
      option
        .setName(OPTIONS.CHANNEL)
        .setDescription("Select the voice channel events will take place in")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildVoice)
    )
    .addRoleOption((option) =>
      option
        .setName(OPTIONS.ALERT_ROLE)
        .setDescription(
          "Select the Role which will be alerted about upcoming events"
        )
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName(OPTIONS.SCHEDULE_DAY)
        .setDescription("Set the day on which the schedule job will run")
        .addChoices(...weekdayOptions)
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName(OPTIONS.MAIN_ROTATION_DURATION)
        .setDescription(
          "How many weeks the main rotation should last before it resets"
        )
        .setMinValue(1)
        .setMaxValue(8)
        .setRequired(true)
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    const channel = interaction.options.getChannel(OPTIONS.CHANNEL, true);
    const alertRole = interaction.options.getRole(OPTIONS.ALERT_ROLE, true);
    const scheduleDay = interaction.options.getInteger(
      OPTIONS.SCHEDULE_DAY,
      true
    ) as WeekdayNumbers;
    const mainRotationDuration = interaction.options.getInteger(
      OPTIONS.MAIN_ROTATION_DURATION,
      true
    );

    const mainSelection: WeekdayNumbers[] = [];
    const secondarySelection: WeekdayNumbers[] = [];
    try {
      let mainRotationResponse = await interaction.reply({
        content: "Please select main rotation days",
        components: mainRotationRows,
        ephemeral: true,
      });
      const collectedMainRotation =
        await mainRotationResponse.awaitMessageComponent<ComponentType.StringSelect>(
          {
            time: 60_000,
          }
        );
      mainSelection.push(
        ...collectedMainRotation.values.map((v) => +v as WeekdayNumbers)
      );

      const secondaryRotationResponse = await collectedMainRotation.update({
        content: "Please select secondary rotation days",
        components: secondaryRotationRows,
      });
      const collectedSecondaryRotation =
        await secondaryRotationResponse.awaitMessageComponent<ComponentType.StringSelect>(
          {
            time: 60_000,
          }
        );
      secondarySelection.push(
        ...collectedSecondaryRotation.values.map((v) => +v as WeekdayNumbers)
      );

      await collectedSecondaryRotation.deferUpdate();

      if (interaction.guildId !== null) {
        await updateBotConfig({
          guildId: interaction.guildId,
          eventChannelId: channel.id,
          scheduleJobRunDay: scheduleDay,
          alertRoleId: alertRole.id,
          mainRotationDays: mainSelection,
          secondaryRotationDays: secondarySelection,
          eventStartHour: 12,
          mainRotationDuration: mainRotationDuration,
        });
        await collectedSecondaryRotation.editReply({
          content: "Bot successfully configured!",
          components: [],
        });
      } else {
        await collectedSecondaryRotation.editReply({
          content: "Error: GuildId not found",
          components: [],
        });
      }
    } catch (error) {
      console.error(error);
      await interaction.editReply(
        "Response not received within 1 minutes - command cancelled"
      );
    }
  },
};

export default command;
