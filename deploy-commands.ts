import "dotenv/config";
import {
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from "discord.js";
import * as Commands from "./src/Discord/Commands";

const discToken = process.env.DISCORD_TOKEN!;
const discClientId = process.env.DISCORD_CLIENT_ID!;

const commandsJson: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
const commandNames: string[] = [];
Object.values(Commands).forEach((command) => {
  if ("data" in command && "execute" in command) {
    commandsJson.push(command.data.toJSON());
    commandNames.push(command.data.name);
  } else {
    console.log(`Malformed command skipped`);
  }
});

const rest = new REST().setToken(discToken);

(async () => {
  try {
    console.log(
      `Beginning refresh of (/) commands, found ${commandsJson.length}:`
    );
    commandNames.forEach((name) => console.log(name));

    const data: any = await rest.put(Routes.applicationCommands(discClientId), {
      body: commandsJson,
    });

    console.log(`Successfully refreshed ${data.length} commands`);
  } catch (error) {
    console.error(error);
  }
})();
