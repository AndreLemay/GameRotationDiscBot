import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  Snowflake,
} from "discord.js";
import { DateTime } from "luxon";
import { BSON } from "mongodb";

export interface BotConfig {
  mainRotationDays: number[];
  secondaryRotationDays: number[];
  eventStartHour: number;
  scheduleJobRunDay: number;
  guildId: Snowflake;
  eventChannelId: Snowflake;
  alertRoleId: Snowflake;
}

export interface Game extends BSON.Document {
  name: string;
  popularity: number;
  lastEventDate: DateTime;
}

export interface Event {
  game: Game;
  date: DateTime;
}

export interface BotCommand {
  data: Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">;
  execute: (interaction: ChatInputCommandInteraction) => void;
}
