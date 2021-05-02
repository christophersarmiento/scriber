const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const { AkairoClient, CommandHandler } = require("discord-akairo");
const { MessageEmbed } = require("discord.js");

class Scriber extends AkairoClient {
  constructor() {
    super(
      {
        ownerID: process.env.OWNER_ID,
      },
      {}
    );

    this.constants = {
      infoEmbed: [155, 300, 200],
      errorEmbed: [255, 0, 0],
      successEmbed: [0, 255, 0],
    };

    this.failure = new MessageEmbed()
      .setColor(this.constants.errorEmbed)
      .setDescription("Uh oh! Something went wrong.");

    this.commandHandler = new CommandHandler(this, {
      directory: path.resolve(__dirname, "commands"),
      prefix: ".",
      allowMention: true,
    });

    this.commandHandler.loadAll();
  }

}

const client = new Scriber();
client.login(process.env.DISCORD_TOKEN)