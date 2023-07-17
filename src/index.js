const {config} = require('dotenv')
config();

const axios = require('axios');


const {Client, MessageEmbed, MessageAttachment} = require('discord.js');
const { Command } = require('discord.js-commando');
const client = new Client();

const prefix = "!";

client.on('ready', () =>{
    console.log(`Bot is ready as ${client.user.tag}`);
});

client.on('message', async message =>{
    if(!message.content.startsWith(prefix)){
        return;
    }
    const args = message.content
        .slice(prefix.length)
        .trim()
        .split(/ +/g);
    const command = args.shift().toLowerCase();
    console.log(args);
    console.log(message.content);
 
    if(command.includes('steam')){
        const game = message.content.split("steam")[1].trim()
        const { "applist": { apps } } = 
            await axios.get("https://api.steampowered.com/ISteamApps/GetAppList/v2/").then(res => res.data).catch(err => console.log("rip"));


        const appIds = apps.filter(app => app.name.toLowerCase().includes(game.toLowerCase())).map(app => app.appid)
        let appsName = apps.filter(app => app.name.toLowerCase().includes(game.toLowerCase())).map(app => app.name)
        console.log(appsName)
        console.log(appIds)
        if (appIds.length === 0) message.reply("Eso no existe bro")
        else {if(appIds.length > 10){
            message.reply("Hay demasiados resultados para tu busqueda por favor se mas especifico") 
            } else { message.reply(`Estas son los resultados de la busqueda elije alguno`)
                    for(let i = 0;i<appsName.length;i++){
                    message.channel.send(`${appsName[i]}`)}

                
                //message.reply(`Estas son los resultados de la busqueda elije alguno ${appsName}`)
            appIds.forEach(async (appId) => {
                try {
                const { [appId]: { success, data } } = await axios.get(`https://store.steampowered.com/api/appdetails?cc=ar&appids=${appId}`).then(res => res.data).catch(err => console.log("rip"));
            
                if (success && !!data.price_overview) {
                    const { currency, final, initial, discount_percent } = data.price_overview;
                    const score = data.metacritic;
                    const currencyFormatted = currency + "$"
                    const priceWithoutTaxes = (final / 100).toFixed(2)
                    const priceWithTaxes = (priceWithoutTaxes * 1.65).toFixed(2)
                    const initialPrice = (initial / 100).toFixed(2)
                    const hasDiscount = discount_percent != 0;
                    const descuento = discount_percent + "%"                  
                    console.log(`The price is ${currencyFormatted} ${priceWithoutTaxes} without taxes`)
                    console.log(`The price is ${currencyFormatted} ${priceWithTaxes} with taxes`)
                    const embedGame = new MessageEmbed()
                        .setTitle(data.name)
                        .setDescription(`${data.short_description}\n${hasDiscount ? `\n**Precio Inicial** ***${currencyFormatted} ${initialPrice}***\n**Descuento: ${descuento}**\n` : ""}\n **Precio sin impuestos** ***${currencyFormatted} ${priceWithoutTaxes}*** \n **Precio con impuestos** ***${currencyFormatted} ${priceWithTaxes}***`)
                        .setImage(data.header_image)
                        .setColor(0x8b00db)
                        .setURL(data.website)

                    if(score) embedGame.setFooter(`puntaje del juego: ${score.score}`)
                    message.reply("Te dejo lo que me pediste bro", {
                        embed: embedGame
                    });
                }
            } catch (error) {
                console.log("Error", error)
            }
            })
            }
        }
        console.log("Done!");
    }
})
client.login(process.env.DISCORD_TOKEN)
