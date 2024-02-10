import "dotenv/config"
import { Client, GatewayIntentBits, Events } from "discord.js"
import { getBotConfig, initializeDbConnection } from "./Database/MongoClient"
import { CronJob } from "cron"
import scheduleNextEvents from "./Jobs/ScheduleNextEvents"

const client = new Client({ intents: [GatewayIntentBits.Guilds] })
// map of guildId to schedule job for that guild
const scheduleJobs: Map<string, CronJob> = new Map<string, CronJob>()

client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Client logged in as ${readyClient.user.tag}`)
    await initializeDbConnection()

    const guilds = await readyClient.guilds.fetch()
    guilds.forEach(async (baseGuild, guildId) => {
        const guild = await baseGuild.fetch()
        const channels = await guild.channels.fetch()
        const firstVoiceChannel = channels.filter((chan) => chan?.isVoiceBased()).first()
        console.log(`First Voice Channel: ${firstVoiceChannel?.}`)
    })
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
})
client.login(process.env.DISCORD_TOKEN)
