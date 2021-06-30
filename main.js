const Discord = require('discord.js');
const { komut, token } = require('./config.json');
const ytdl = require('ytdl-core');

const client = new Discord.Client();


// session opening.
// starting from coding queue
//music code session

const queue = new Map();

client.once('ready', () => {
    console.log('Hazır!');
});

client.once('reconnecting', () => {
    console.log('Yeniden bağlanıyor!');
});

client.on("message", async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(komut)) return;
  
    const serverQueue = queue.get(message.guild.id);
  
    if (message.content.startsWith(`${komut}play`)) {
      execute(message, serverQueue);
      return;
    } else if (message.content.startsWith(`${komut}skip`)) {
      skip(message, serverQueue);
      return;
    } else if (message.content.startsWith(`${komut}stop`)) {
      stop(message, serverQueue);
      return;
    } else {
      message.channel.send("Geçerli bir komut girilmeli!");
    }
});

async function execute(message, serverQueue) {
    const args = message.content.split(" ");
  
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.channel.send(
        "Müzik oynatmak için bir ses kanalında olman gerekir!"
      );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return message.channel.send(
        "Sunucuya bağlanıp parçayı oynatmak için yeterli yetkiye sahip değilim!"
      );
    }
  
    const songInfo = await ytdl.getInfo(args[1]);
    const song = {
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
     };
  
    if (!serverQueue) {
      const queueContruct = {
        textChannel: message.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: [],
        volume: 5,
        playing: true
      };
  
      queue.set(message.guild.id, queueContruct);
  
      queueContruct.songs.push(song);
  
      try {
        var connection = await voiceChannel.join();
        queueContruct.connection = connection;
        play(message.guild, queueContruct.songs[0]);
      } catch (err) {
        console.log(err);
        queue.delete(message.guild.id);
        return message.channel.send(err);
      }
    } else {
      serverQueue.songs.push(song);
      return message.channel.send(`${song.title} sıraya eklendi!`);
    }
}


function skip(message, serverQueue) {
    if (!message.member.voice.channel)
      return message.channel.send(
        "Müziği geçmek için ses kanalında olman gerekir!"
      );
    if (!serverQueue)
      return message.channel.send("Herhangi bir parça çalınmadığı için müziği geçemem!");
    serverQueue.connection.dispatcher.end();
}


function stop(message, serverQueue) {
    if (!message.member.voice.channel)
      return message.channel.send(
        "Müziği durdurmak için ses kanalında olammn gerekir!"
      );
      
    if (!serverQueue)
      return message.channel.send("Herhangi bir parça çalınmıyor!");
      
    serverQueue.songs = [];
    serverQueue.connection.dispatcher.end();
}


function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
      serverQueue.voiceChannel.leave();
      queue.delete(guild.id);
      return;
    }
  
    const dispatcher = serverQueue.connection
      .play(ytdl(song.url))
      .on("finish", () => {
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
      })
      .on("error", error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    serverQueue.textChannel.send(`:musical_note: Müzik oynatılıyor: **${song.title}**! :musical_note:`);
}


client.login(token);
