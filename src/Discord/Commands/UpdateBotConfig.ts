import {
  ActionRowBuilder,
  ChannelSelectMenuBuilder,
  ChannelSelectMenuInteraction,
  ChannelType,
  ChatInputCommandInteraction,
  ComponentType,
  RoleSelectMenuBuilder,
  RoleSelectMenuInteraction,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { BotCommand, BotConfig } from "src/Types";
import { getBotConfig, updateBotConfig } from "../../Database/MongoClient";
import { WeekdayNumbers } from "luxon";

const COMMAND_NAME = "update-config";
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

const handleChannelCommand = async (
  config: BotConfig,
  interaction: ChatInputCommandInteraction
) => {
  const row = new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
    new ChannelSelectMenuBuilder()
      .setCustomId(OPTIONS.CHANNEL)
      .setChannelTypes(ChannelType.GuildVoice)
      .setDefaultChannels(config.eventChannelId)
  );
  const response = await interaction.editReply({
    content: "Please select the new channel",
    components: [row],
  });
  return await response.awaitMessageComponent<ComponentType.ChannelSelect>({
    time: 60_000,
  });
};

const handleScheduleDayCommand = async (
  config: BotConfig,
  interaction: ChatInputCommandInteraction
) => {
  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(OPTIONS.SCHEDULE_DAY)
      .addOptions(
        ...weekdayOptions.map((weekday) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(weekday.name)
            .setValue(weekday.value.toString())
        )
      )
      .setOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(weekdayOptions[config.scheduleJobRunDay].name)
          .setValue(weekdayOptions[config.scheduleJobRunDay].value.toString())
      )
  );
  const response = await interaction.editReply({
    content: "Please select the day on which the scheduling job should run",
    components: [row],
  });
  return await response.awaitMessageComponent<ComponentType.StringSelect>({
    time: 60_000,
  });
};

const handleRoleCommand = async (
  config: BotConfig,
  interaction: ChatInputCommandInteraction
) => {
  const row = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(
    new RoleSelectMenuBuilder()
      .setCustomId(OPTIONS.ALERT_ROLE)
      .setDefaultRoles(config.alertRoleId)
  );
  const response = await interaction.editReply({
    content: "Please select the new role to be alerted",
    components: [row],
  });
  return await response.awaitMessageComponent<ComponentType.RoleSelect>({
    time: 60_000,
  });
};

const handleMainRotationDaysCommand = async (
  config: BotConfig,
  interaction: ChatInputCommandInteraction
) => {
  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(OPTIONS.MAIN_ROTATION_DAYS)
      .addOptions(
        ...weekdayOptions.map((weekday) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(weekday.name)
            .setValue(weekday.value.toString())
        )
      )
      .setOptions(
        config.mainRotationDays.map((day) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(weekdayOptions[day].name)
            .setValue(weekdayOptions[day].value.toString())
        )
      )
      .setMinValues(1)
      .setMaxValues(7)
  );
  const response = await interaction.editReply({
    content: "Please select the days on which to schedule main rotation games",
    components: [row],
  });
  return await response.awaitMessageComponent<ComponentType.StringSelect>({
    time: 60_000,
  });
};

const handleSecondaryRotationDaysCommand = async (
  config: BotConfig,
  interaction: ChatInputCommandInteraction
) => {
  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(OPTIONS.SECONDARY_ROTATION_DAYS)
      .addOptions(
        ...weekdayOptions.map((weekday) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(weekday.name)
            .setValue(weekday.value.toString())
        )
      )
      .setOptions(
        config.secondaryRotationDays.map((day) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(weekdayOptions[day].name)
            .setValue(weekdayOptions[day].value.toString())
        )
      )
      .setMinValues(1)
      .setMaxValues(7)
  );
  const response = await interaction.editReply({
    content:
      "Please select the days on which to schedule secondary rotation games",
    components: [row],
  });
  return await response.awaitMessageComponent<ComponentType.StringSelect>({
    time: 60_000,
  });
};

const handleMainRotationDurationCommand = async (
  config: BotConfig,
  interaction: ChatInputCommandInteraction
) => {
  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(OPTIONS.MAIN_ROTATION_DURATION)
      .addOptions(
        { label: "1", value: "1" },
        { label: "2", value: "2" },
        { label: "3", value: "3" },
        { label: "4", value: "4" },
        { label: "5", value: "5" },
        { label: "6", value: "6" },
        { label: "7", value: "7" },
        { label: "8", value: "8" }
      )
      .setOptions({
        label: config.mainRotationDuration.toString(),
        value: config.mainRotationDuration.toString(),
      })
  );
  const response = await interaction.editReply({
    content: "Please enter the number of weeks the main rotation should last",
    components: [row],
  });
  return await response.awaitMessageComponent<ComponentType.StringSelect>({
    time: 60_000,
  });
};

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription("Update the configuration for your server")
    .addSubcommand((command) =>
      command
        .setName(`${COMMAND_NAME}-${OPTIONS.CHANNEL}`)
        .setDescription("Update the channel in which events take place")
    )
    .addSubcommand((command) =>
      command
        .setName(`${COMMAND_NAME}-${OPTIONS.ALERT_ROLE}`)
        .setDescription("Update the role that gets alerted to events")
    )
    .addSubcommand((command) =>
      command
        .setName(`${COMMAND_NAME}-${OPTIONS.SCHEDULE_DAY}`)
        .setDescription("Update the on which the scheduling job runs")
    )
    .addSubcommand((command) =>
      command
        .setName(`${COMMAND_NAME}-${OPTIONS.MAIN_ROTATION_DURATION}`)
        .setDescription(
          "Update the number of weeks a single rotation should last"
        )
    )
    .addSubcommand((command) =>
      command
        .setName(`${COMMAND_NAME}-${OPTIONS.MAIN_ROTATION_DAYS}`)
        .setDescription(
          "Update the days on which main rotation games will be scheduled"
        )
    )
    .addSubcommand((command) =>
      command
        .setName(`${COMMAND_NAME}-${OPTIONS.SECONDARY_ROTATION_DAYS}`)
        .setDescription(
          "Update the days on which secondary rotation games will be scheduled"
        )
    ),
  execute: async (interaction: ChatInputCommandInteraction) => {
    if (interaction.guildId === null) {
      await interaction.reply("Error: Invalid GuildId");
      return;
    }

    await interaction.deferReply();
    const config = await getBotConfig(interaction.guildId);

    if (config === null) {
      await interaction.editReply(
        "Error: Existing bot configuration could not be found. Please run the /configure-bot command to set up the initial configuration."
      );
      return;
    }

    let collectedInteraction:
      | ChannelSelectMenuInteraction
      | RoleSelectMenuInteraction
      | StringSelectMenuInteraction;

    if (interaction.commandName.endsWith(OPTIONS.CHANNEL)) {
      collectedInteraction = await handleChannelCommand(config, interaction);
      const selectedChannel = collectedInteraction.values[0];
      config.eventChannelId = selectedChannel;
    } else if (interaction.commandName.endsWith(OPTIONS.ALERT_ROLE)) {
      collectedInteraction = await handleRoleCommand(config, interaction);
      const selectedRole = collectedInteraction.values[0];
      config.alertRoleId = selectedRole;
    } else if (interaction.commandName.endsWith(OPTIONS.SCHEDULE_DAY)) {
      collectedInteraction = await handleScheduleDayCommand(
        config,
        interaction
      );
      const selectedDay = collectedInteraction.values[0];
      config.scheduleJobRunDay = +selectedDay as WeekdayNumbers;
    } else if (interaction.commandName.endsWith(OPTIONS.MAIN_ROTATION_DAYS)) {
      collectedInteraction = await handleMainRotationDaysCommand(
        config,
        interaction
      );
      config.mainRotationDays = collectedInteraction.values.map(
        (v) => +v as WeekdayNumbers
      );
    } else if (
      interaction.commandName.endsWith(OPTIONS.SECONDARY_ROTATION_DAYS)
    ) {
      collectedInteraction = await handleSecondaryRotationDaysCommand(
        config,
        interaction
      );
      config.mainRotationDays = collectedInteraction.values.map(
        (v) => +v as WeekdayNumbers
      );
    } else if (
      interaction.commandName.endsWith(OPTIONS.MAIN_ROTATION_DURATION)
    ) {
      collectedInteraction = await handleMainRotationDurationCommand(
        config,
        interaction
      );
      const selectedDuration = collectedInteraction.values[0];
      config.mainRotationDuration = +selectedDuration;
    } else {
      console.log(
        `Error: received invalid subcommand - ${interaction.commandName}`
      );
      interaction.editReply(
        "Error: received invalid command, please try again"
      );
      return;
    }

    collectedInteraction.deferUpdate();
    await updateBotConfig(config);
    collectedInteraction.update("Success!");
  },
};

export default command;
