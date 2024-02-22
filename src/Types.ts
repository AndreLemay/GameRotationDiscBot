import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  Snowflake,
} from "discord.js";
import { DateTime, HourNumbers, WeekdayNumbers } from "luxon";
import { BSON } from "mongodb";

export interface BotConfig {
  mainRotationDays: WeekdayNumbers[];
  secondaryRotationDays: WeekdayNumbers[];
  eventStartHour: HourNumbers;
  scheduleJobRunDay: WeekdayNumbers;
  guildId: Snowflake;
  eventChannelId: Snowflake;
  alertRoleId: Snowflake;
  mainRotationDuration: number;
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
