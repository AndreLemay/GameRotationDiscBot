import {
  Guild,
  GuildScheduledEvent,
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
  Snowflake,
} from "discord.js";
import { shuffle, sortBy } from "lodash";
import { DateTime } from "luxon";
import { getBotConfig, getGames } from "src/Database/MongoClient";
import { Game } from "src/Types";

const createScheduledEvent = (
  guild: Guild,
  channel: Snowflake,
  game: Game,
  startTime: Date,
  endTime: Date
) => {
  guild.scheduledEvents.create({
    entityType: GuildScheduledEventEntityType.Voice,
    name: `Rotating Game Night: ${game.name}`,
    privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
    scheduledStartTime: startTime,
    channel,
    description: `Let's get together and play some ${game.name}!`,
    scheduledEndTime: endTime,
  });
};

const scheduleNextEvents = async (guild: Guild) => {
  const config = await getBotConfig(guild.id);
  if (!config) {
    throw new Error(`Failed to retrieve bot config for Guild: ${guild.name}`);
  }
  const rotationGames = await getGames();
  if (rotationGames.length == 0) {
    console.log(
      `No games configured for guild ${guild.name} - skipping scheduling`
    );
    return;
  }
  const useSecondaryRotation =
    config.mainRotationDays.length < rotationGames.length;
  const mainRotationTotal =
    config.mainRotationDays.length * config.mainRotationDuration;

  if (mainRotationTotal > rotationGames.length)
    console.log(
      `Guild ${guild.name}: Not enough games to fill configured main rotation, doing what we can`
    );

  const mainRotation = useSecondaryRotation
    ? rotationGames.slice(0, mainRotationTotal)
    : rotationGames;
  const secondaryRotation = useSecondaryRotation
    ? sortBy(rotationGames.slice(mainRotationTotal), "lastEventDate")
    : [];

  // get main rotation events that ran in the past week or have never run and re-schedule them
  const mainToReschedule = mainRotation.filter((game) => {
    return (
      game.lastEventDate === null || game.lastEventDate.diffNow("days").days < 7
    );
  });

  const shuffledDays = shuffle(config.mainRotationDays);
  const weekToSchedule = DateTime.now()
    .startOf("day")
    .plus({ weeks: config.mainRotationDuration - 1 });
  mainToReschedule.forEach((game, i) => {
    let startDate = weekToSchedule.set({
      weekday: shuffledDays[i],
      hour: config.eventStartHour,
    });
    if (startDate.weekday < weekToSchedule.weekday)
      startDate = startDate.plus({ week: 1 });

    const endDate = startDate.set({
      hour: 23,
      minute: 59,
    });
    createScheduledEvent(
      guild,
      config.eventChannelId,
      game,
      startDate.toJSDate(),
      endDate.toJSDate()
    );
  });

  // for how many secondary rotation days we have, get the oldest that many secondary games and reschedule them
  const secondaryToReschedule = secondaryRotation.slice(
    config.secondaryRotationDays.length
  );
  secondaryToReschedule.forEach((game, i) => {
    const weekToSchedule = DateTime.now()
      .startOf("day")
      .plus({
        weeks: secondaryRotation.length / config.secondaryRotationDays.length,
      });
    let startDate = weekToSchedule.set({
      weekday: config.secondaryRotationDays[i],
      hour: config.eventStartHour,
    });
    if (startDate.weekday < weekToSchedule.weekday)
      startDate = startDate.plus({ week: 1 });

    const endDate = startDate.set({
      hour: 23,
      minute: 59,
    });
    createScheduledEvent(
      guild,
      config.eventChannelId,
      game,
      startDate.toJSDate(),
      endDate.toJSDate()
    );
  });
};

export default scheduleNextEvents;
