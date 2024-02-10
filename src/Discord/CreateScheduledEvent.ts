import { Guild, GuildScheduledEventEntityType, GuildScheduledEventPrivacyLevel, Snowflake } from "discord.js"
import { Game } from "src/Types"

const createScheduledEvent = (guild: Guild, channel: Snowflake, game: Game, startTime: Date, endTime: Date) => {
    guild.scheduledEvents.create({
        entityType: GuildScheduledEventEntityType.Voice,
        name: `Rotating Game Night: ${game.name}`,
        privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
        scheduledStartTime: startTime,
        channel,
        description: `Let's get together and play some ${game.name}!`,
        scheduledEndTime: endTime,
    })
}

export default createScheduledEvent
