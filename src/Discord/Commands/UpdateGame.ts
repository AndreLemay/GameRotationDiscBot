import {
  ActionRowBuilder,
  ComponentType,
  ModalBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { getGames, updateGame } from "../../Database/MongoClient";
import { BotCommand } from "src/Types";

const COMMAND_NAME = "update-game";
const GAME_MENU_ID = "update-game-menu";
const GAME_UPDATE_MODAL = "update-game-modal";
const MODAL_GAME_NAME = "update-game-modal-name";
const MODAL_GAME_DESC = "update-game-modal-desc";
const MODAL_GAME_POPULARITY = "update-game-modal-popularity";

const command: BotCommand = {
  data: new SlashCommandBuilder()
    .setName(COMMAND_NAME)
    .setDescription("Add a game to the rotation"),
  execute: async (interaction) => {
    await interaction.deferReply({ ephemeral: true });
    const games = await getGames();

    const rows = [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(GAME_MENU_ID)
          .addOptions(
            ...games.map((g) =>
              new StringSelectMenuOptionBuilder()
                .setLabel(g.name)
                .setValue(g._id.toString())
            )
          )
      ),
    ];

    const gameSelectResponse = await interaction.editReply({
      content: "Which game would you like to update?",
      components: rows,
    });

    const gameSelectInteraction =
      await gameSelectResponse.awaitMessageComponent<ComponentType.StringSelect>(
        { time: 60_000 }
      );
    const selectedGame = games.find(
      (g) => g._id.toString() === gameSelectInteraction.values[0]
    );

    if (!selectedGame) {
      gameSelectInteraction.reply("Error selecting game, please try again.");
      return;
    }

    const modal = new ModalBuilder()
      .setCustomId(GAME_UPDATE_MODAL)
      .setTitle("Update Game")
      .addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId(MODAL_GAME_NAME)
            .setLabel("Name")
            .setStyle(TextInputStyle.Short)
            .setValue(selectedGame.name)
        ),
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId(MODAL_GAME_DESC)
            .setLabel("Description")
            .setStyle(TextInputStyle.Paragraph)
            .setValue(selectedGame.description)
        ),
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId(MODAL_GAME_POPULARITY)
            .setLabel("Popularity")
            .setStyle(TextInputStyle.Short)
            .setValue(selectedGame.popularity.toString())
        )
      );

    await gameSelectInteraction.showModal(modal);
    const gameUpdateSubmit = await gameSelectInteraction.awaitModalSubmit({
      time: 3_600_000,
    });
    await gameUpdateSubmit.deferReply();

    const name = gameUpdateSubmit.fields.getTextInputValue(MODAL_GAME_NAME);
    const desc = gameUpdateSubmit.fields.getTextInputValue(MODAL_GAME_DESC);
    const popularity = Number(
      gameUpdateSubmit.fields.getTextInputValue(MODAL_GAME_POPULARITY)
    );
    if (!Number.isInteger(popularity) || popularity <= 0) {
      gameUpdateSubmit.editReply(
        `Error: popularity value of ${gameUpdateSubmit.fields.getTextInputValue(
          MODAL_GAME_POPULARITY
        )} is invalid`
      );
      return;
    }

    selectedGame.name = name;
    selectedGame.description = desc;
    selectedGame.popularity = popularity;

    await updateGame(selectedGame);
    gameUpdateSubmit.editReply("Success!");
  },
};

export default command;
