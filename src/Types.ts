import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
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
  guildId: Snowflake;
  name: string;
  description: string;
  popularity: number;
  lastEventDate: DateTime | null;
}

export interface Event {
  game: Game;
  date: DateTime;
}

export interface BotCommand {
  data:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">;
  execute: (interaction: ChatInputCommandInteraction) => void;
}
