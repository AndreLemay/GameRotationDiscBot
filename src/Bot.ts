import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  Events,
  Collection,
  ChatInputCommandInteraction,
} from "discord.js";
import { getBotConfig, initializeDbConnection } from "./Database/MongoClient";
import { CronJob } from "cron";
import * as Commands from "./Discord/Commands";
import scheduleNextEvents from "./Jobs/ScheduleNextEvents";
import { BotCommand } from "./Types";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
// map of guildId to schedule job for that guild
const scheduleJobs: Map<string, CronJob> = new Map<string, CronJob>();

const commandMap = new Collection<string, BotCommand>();
Object.values(Commands).forEach((command) => {
  if ("data" in command && "execute" in command) {
    commandMap.set(command.data.name, command);
  } else {
    console.log(
      `Error: Malformed command found missing data or execute property`
    );
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commandMap.get(interaction.commandName);

  if (!command) {
    console.error(`No Command found matching ${interaction.commandName}`);
    return;
  }

  try {
    command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing the command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing the command!",
        ephemeral: true,
      });
    }
  }
});

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Client logged in as ${readyClient.user.tag}`);
  await initializeDbConnection();

  // guilds.forEach(async (baseGuild, guildId) => {
  //     const config = await getBotConfig(guildId)
  //     const guild = await baseGuild.fetch()
  //     const scheduleJob = CronJob.from({
  //         cronTime: `0 0 12 * * ${config?.scheduleJobRunDay}`,
  //         onTick: () => {
  //             scheduleNextEvents(guild)
  //         },
  //         start: true,
  //     })
  //     scheduleJobs.set(guildId, scheduleJob)
  // })
});
client.login(process.env.DISCORD_TOKEN);
