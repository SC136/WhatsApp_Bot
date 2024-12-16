const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const Kitsu = require('search-kitsu');
const API = new Kitsu();

const client = new Client({
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
    authStrategy: new LocalAuth()
});


client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// Listening to all incoming messages
// client.on('message_create', message => {
// 	console.log(message.body);
// });

// client.on('message_create', message => {
// 	if (message.body === '!ping') {
// 		// send back "pong" to the chat the message was sent in
// 		client.sendMessage(message.from, 'pong');
// 	}
// });

client.on('message_create', message => {
    if (message.body === 'hi' || message.body === "Hi") {
        // reply back "pong" directly to the message
        message.reply('hello\nshallow');
    }
});

client.on('message_create', async message => {
    if (message.fromMe) return;

    try {
        if (message.body.startsWith("anime") || message.body.startsWith("Anime")) {
            const args = message.body.trim().split(/ +/).slice(1);
            // Check if any arguments were provided after "anime"
            if (args.length === 0) {
                return message.reply("Please provide an anime name.\nExample: anime Naruto");
            }

            const query = encodeURIComponent(args.join(' '));
            const results = await API.searchAnime(query);

            if (!results || results.length === 0) {
                return message.reply("No anime found by that query");
            }

            const anime = results[0];
            const media = await MessageMedia.fromUrl(anime.posterImage ? anime.posterImage.original : `https://i.imgur.com/iIAhC6O.png`);

            await message.reply(
                `*${anime.titles.en}*\n${anime.titles.ja_jp}\n\n_${anime.synopsis}_\n\nAverage Rating ▸ ${anime.avgRating}\n\nType ▸ ${anime.showType}\n\nStatus ▸ ${anime.status}\n\nEpisode Count ▸ ${anime.epCount}\n\nNSFW ▸ ${anime.nsfw}`,
                undefined,
                { media }
            );
        }
    } catch (error) {
        message.reply("ERROR: no anime found by that query");
        console.log(error);
    }
});



client.on('message', async (msg) => {
    const chat = await msg.getChat();
    let user = await msg.getContact();
    await chat.sendMessage(`Hello @${user.id.user}`, {
        mentions: [user]
    });

    // OR

    // let userPhone = '123456789';
    // await chat.sendMessage(`Hello @${userPhone}`, {
    //     mentions: [userPhone + 'c.us']
    // });
});






client.initialize();
