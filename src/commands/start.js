const { Command } = require("discord-akairo");
const { MessageEmbed } = require("discord.js");
const fs = require('fs');
const path = require("path");

const speech = require("@google-cloud/speech");

const options = {
  keyFilename: path.resolve(__dirname, '../gcp.json'),
  projectId: "scriber",
};

const transcriptFile = path.resolve(__dirname, `../transcripts/tanscript_${Date.now()}.txt`);

class StartCommand extends Command {
  constructor() {
    super("start", {
      aliases: ["start"],
      category: "utility",
      description: {
        content: "Join a voice channel and begin transcribing.",
      },
    });
  }

  async exec(message) {
    const channel = message.member.voice.channel
    
    if (channel == null) {
      return message.channel.send("You must be in a voice channel to start transcribing!");
    }
    else {
      channel
        .join()
        .then((connection) => {
          const transcriber = new speech.SpeechClient(options);

          const config = {
            encoding: "LINEAR16",
            sampleRateHertz: 48000,
            languageCode: "en-US",
            audioChannelCount: 2,
          };

          connection.setSpeaking(0);

          connection.on('speaking', function (member, speaking) {
            if (speaking) {
              const audioFileName = path.resolve(
                __dirname,
                `../recordings/${member.id}_${Date.now()}.pcm`
              );
              
              const audio = connection.receiver.createStream(member, { mode: "pcm" });
              audio.pipe(fs.createWriteStream(audioFileName));
              audio.on("end", function () {
                fs.stat(audioFileName, async (err, stat) => {
                  if (!err && stat.size) {
                    const file = fs.readFileSync(audioFileName);
                    const audioBytes = file.toString("base64");
                    const audio = {
                      content: audioBytes,
                    };
                    
                    const request = {
                      audio: audio,
                      config: config,
                    };
                    const [response] = await transcriber.recognize(request);
                    const transcription = response.results
                      .map((result) => result.alternatives[0].transcript)
                      .join("\n");
                    
                    if (transcription != ""){
                      let toWrite = `${member.username}: ${transcription}\n`;
                      fs.appendFile(transcriptFile, toWrite, function (err) {
                        if (err) {
                          console.log('failed')
                        } else {
                          console.log('wrote to file')
                          // done
                        }
                      });
                    }
                    
                  }
                });
              });
            }
          });
        })
    }
    
  }
}

module.exports = StartCommand;

