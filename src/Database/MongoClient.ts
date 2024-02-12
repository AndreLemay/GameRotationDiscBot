import { Snowflake } from "discord.js";
import { MongoClient, Collection, WithId } from "mongodb";
import { BotConfig, Game } from "src/Types";

const uri = "mongodb://localhost:27017";

let collections: { games?: Collection<Game>; config?: Collection<BotConfig> } =
  {};

export const initializeDbConnection = async () => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("GameRotation");
  collections.games = db.collection("Games");
  collections.config = db.collection("Config");
};

export const getGames = async () => {
  if (!collections.games)
    throw new Error(
      "Tried to use DB before connection was initialized - call connectToDB first."
    );

  return await collections.games
    .find(
      {},
      {
        sort: { popularity: -1 },
      }
    )
    .toArray();
};

export const updateGame = async (game: WithId<Game>) => {
  if (!collections.games)
    throw new Error(
      "Tried to use DB before connection was initialized - call connectToDB first."
    );

  return await collections.games.updateOne({ _id: game._id }, game);
};

export const getBotConfig = async (guildId: Snowflake) => {
  if (!collections.config)
    throw new Error(
      "Tried to use DB before connection was initialized - call connectToDB first."
    );

  return await collections.config.findOne({ guildId });
};

export const updateBotConfig = async (config: BotConfig) => {
  if (!collections.config)
    throw new Error(
      "Tried to use DB before connection was initialized - call connectToDB first."
    );

  return await collections.config.updateOne(
    { guildId: config.guildId },
    { $set: config },
    { upsert: true }
  );
};
