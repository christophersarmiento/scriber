const { Command } = require("discord-akairo");
const { MessageEmbed } = require("discord.js");
const fs = require("fs");
const path = require("path");

const transcriptsPath = path.resolve(__dirname, `../transcripts`);
const recordingsPath = path.resolve(__dirname, `../recordings`);

class StopCommand extends Command {
  constructor() {
    super("stop", {
      aliases: ["stop"],
      category: "utility",
      description: {
        content: "Leave the voice channel and retreive transcript.",
      },
    });
  }
  

  async exec(message) {
    const channel = message.member.voice.channel;

    if (channel == null) {
      return message.channel.send("You must be in a voice channel to start transcribing!");
    } else {
      channel.leave();

      fs.readdir(transcriptsPath, function (err, files) {
        //handling error
        if (err) {
          return console.log("Unable to scan directory: " + err);
        }

        var scripts = [];
        files.forEach((f) => {
          scripts.push(path.resolve(__dirname, `../transcripts/${f}`));
        });
        //listing all files using forEach
        return message.channel.send({ files: scripts })
        //TODO: clear recordings and transcripts directory
      });
      
    }
  }
}

module.exports = StopCommand;
