const { Client, GatewayIntentBits, PermissionsBitField, Permissions } = require('discord.js');

const { prefix, token } = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const activities = [
  "Left This One Empty",
  "DipDipper & indra",
  "Rest in Peace Groovy",
  "Under Development",
  "Have a Nice Day",
  "Go Get Some Sleep",
  "What if everything is a simulation?",
  "Our Developer just broke up with his girlfriend.",
  "Stay tuned for more.",
  "What about using .help before shouting?",
]; //You can change your statuses from up, we added a few more at Status and Activity Update v2.

// session opening.
// starting from coding queue


const queue = new Map();

client.on("ready", () => {
    console.log(`${client.user.username} bot aktif!`);
    client.user.setStatus("idle") //You can also use "dnd"(do not disturb), "invisible" and "online", but we wanted to use "idle" because of yellow color of moon.
    setInterval(() => {
      const randomIndex = Math.floor(Math.random() * (activities.length - 1) + 1);
      const newActivity = activities[randomIndex];
  
      client.user.setActivity(newActivity);
    }, 10000); //Status changes after 10.000 Milliseconds, it's about 10 seconds.
});

client.once('reconnecting', () => {
    console.log('Yeniden bağlanıyor!');
});

client.on('message', msg=>{
  if(msg.content === ".help"){
      msg.channel.send('**.play +link** You can play music with this command. **.skip** You can skip songs with that command. **.stop** You can kick bot from your channel with this command.');
    }
});

//Starting of Ticket System

//Ending of Ticket System

//Starting of Music Commands
client.on("message", async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
  
    const serverQueue = queue.get(message.guild.id);
  
    if (message.content.startsWith(`${prefix}play`)) {
      execute(message, serverQueue);
      return;
    } else if (message.content.startsWith(`${prefix}skip`)) {
      skip(message, serverQueue);
      return;
    } else if (message.content.startsWith(`${prefix}stop`)) {
      stop(message, serverQueue);
      return;
    }
});

async function execute(message, serverQueue) {
    const args = message.content.split(" ");
  
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel)
      return message.channel.send(
        `:warning: - Müzik oynatmak için bir ses kanalında olman gerekir!`
      );
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
      return message.channel.send(
        `:warning: - Sunucuya bağlanıp parçayı oynatmak için yeterli yetkiye sahip değilim!`    
      );
    }

    if (message.guild.me.voice.channel && message.member.voice.channel.id !== message.guild.me.voice.channel.id) return message.channel.send(`:warning: - Botun bulunduğu ses kanalında değislin!`);
  
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
      return message.channel.send(`:musical_note: ${song.title} **sıraya eklendi!** :musical_note:`);
    }
}


function skip(message, serverQueue) {
    if (!message.member.voice.channel)
      return message.channel.send(
        `:warning: - Müziği geçmek için ses kanalında olman gerekir!`
      );
    if (!serverQueue)
      return serverQueue.textChannel.send(`:musical_note: **Herhangi bir parça aktif olarak çalınmadığı için geçemem!** :musical_note:`);
    serverQueue.voiceChannel.leave();
}


function stop(message, serverQueue) {
    if (!message.member.voice.channel) return message.channel.send(`:warning: - Ses kanalında değilsin!`);
      
    if (!serverQueue)
      return message.channel.send(`:musical_note: **Herhangi bir parça aktif olarak çalınmadığı için parça durdurulamadı!** :musical_note:`);
      
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
//End of Music Commands

client.login(token);
