import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  Snowflake,
} from "discord.js";
import { DateTime } from "luxon";
import { BSON } from "mongodb";

type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface BotConfig {
  mainRotationDays: DayOfWeek[];
  secondaryRotationDays: DayOfWeek[];
  eventStartHour: number;
  scheduleJobRunDay: DayOfWeek;
  guildId: Snowflake;
  eventChannelId: Snowflake;
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
