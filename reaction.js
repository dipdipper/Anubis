const Discord = require('discord.js');

const user = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION']});

user.on('messageReactionAdd', async (reaction,user) => {
    if (reaction.partial) {
        try {
            await reaction.fetch();

        } catch(error) {
            console.log(`Birşeyler yanlış gitti. Hata:`, error);
            return;
        }

    }

    console.log(`${reaction.message.author}'n mesajı "${reaction.message.content}" reaksiyon kazandı!`);
    
    // end
    
});

// adding some admin commands.

user.on('message', message => {
    if (!user.hasPermission('MANAGE_MESSAGES'))
        return message.channel.send(
            'Yeterli yetkiye sahip değilsin.'
         );
    
    if (message.content == '!reaksiyonsil') {
        message.reactions.removeAll();
        message.reply('Mesajlardan reaksiyonları başarıyla sildin.');
    } else {
        message.reply('Yeteri yetkiniz yok.');
    }
  }
});




