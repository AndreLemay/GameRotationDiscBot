import { SlashCommandBuilder } from "discord.js"

export default {
    data: new SlashCommandBuilder()
        .setName("ConfigureBot")
        .setDescription("Configure the bot for your server")
        .addChannelOption((option) => option.setName("Channel").setDescription("Select the voice channel")),
    execute: async () => {},
}
