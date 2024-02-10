import { Guild } from "discord.js"
import { shuffle, sortBy } from "lodash"
import { DateTime } from "luxon"
import { getBotConfig, getGames } from "src/Database/MongoClient"
import createScheduledEvent from "src/Discord/CreateScheduledEvent"

const scheduleNextEvents = async (guild: Guild) => {
    const config = await getBotConfig(guild.id)
    const rotationGames = await getGames()
    const mainRotation = rotationGames.slice(0, 8)
    const secondaryRotation = sortBy(rotationGames.slice(8), "lastEventDate")

    // get main rotation events that ran in the past week and re-schedule them for 4 weeks in the future
    const mainToReschedule = mainRotation.filter((game) => {
        return game.lastEventDate.diffNow("days").days < 7
    })

    const shuffledDays = shuffle(config?.mainRotationDays)
    mainToReschedule.forEach((game, i) => {
        const weekToSchedule = DateTime.now().startOf("day").plus({ weeks: 3 })
        const startDate = weekToSchedule.set({
            weekday: shuffledDays[i],
            hour: config?.eventStartHour,
        })
        const endDate = startDate.set({
            hour: 23,
            minute: 59,
        })
        createScheduledEvent(guild, config!.eventChannelId, game, startDate.toJSDate(), endDate.toJSDate())
    })

    // for how many secondary rotation days we have, get the oldest that many secondary games and reschedule them
    const secondaryToReschedule = secondaryRotation.slice(config?.secondaryRotationDays.length)
    secondaryToReschedule.forEach((game, i) => {
        const weekToSchedule = DateTime.now()
            .startOf("day")
            .plus({ weeks: secondaryRotation.length / config!.secondaryRotationDays.length })
        const startDate = weekToSchedule.set({
            weekday: config?.secondaryRotationDays[i],
            hour: config?.eventStartHour,
        })
        const endDate = startDate.set({
            hour: 23,
            minute: 59,
        })
        createScheduledEvent(guild, config!.eventChannelId, game, startDate.toJSDate(), endDate.toJSDate())
    })
}

export default scheduleNextEvents
