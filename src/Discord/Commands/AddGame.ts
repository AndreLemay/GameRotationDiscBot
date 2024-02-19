import { SlashCommandBuilder } from "discord.js";
import { updateGame } from "../../Database/MongoClient";
import { BotCommand } from "src/Types";

const COMMAND_NAME = "add-game";
const GAME_TITLE = "add-game-title";
const GAME_DESC = "add-game-desc";
const GAME_POPULARITY = "add-game-popularity";

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription("Add a game to the rotation")
    .addStringOption((option) =>
      option.setName(GAME_TITLE).setDescription("Title").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName(GAME_DESC).setDescription("Description").setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName(GAME_POPULARITY)
        .setDescription(
          "How popular is this game? Enter any number, higher = more popular."
        )
        .setRequired(true)
    ),
  execute: async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    const title = interaction.options.getString(GAME_TITLE, true);
    const desc = interaction.options.getString(GAME_DESC, true);
    const popularity = interaction.options.getInteger(GAME_POPULARITY, true);

    await updateGame({
      guildId: interaction.guildId!,
      name: title,
      description: desc,
      popularity: popularity,
      lastEventDate: null,
    });
    await interaction.editReply("Got it!");
  },
};

export default command;
