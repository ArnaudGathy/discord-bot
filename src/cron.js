import cron from 'node-cron'
import {channels} from './constants/channels'
const Discord = require('discord.js');

const timers = [
  {
    name: 'Skadi le brutal',
    loot: 'Monture : proto-drake bleu',
    loot_icon: 'https://wow.zamimg.com/uploads/screenshots/normal/109195-reins-of-the-blue-proto-drake.jpg',
    location: '/way 57.8 56.1',
    url: 'https://www.wowhead.com/npc=174062/skadi-the-ruthless',
    icon: 'https://wow.zamimg.com/uploads/screenshots/normal/993107-skadi-the-ruthless.jpg',
    times: [
      {timer: 'Dimanche, 19:00', cron: '55 18 * * 7'},
      {timer: 'Lundi, 01:40', cron: '30 1 * * 1'},
      {timer: 'Lundi, 08:20', cron: '10 8 * * 1'},
      {timer: 'Lundi, 15:00', cron: '50 14 * * 1'},
      {timer: 'Lundi, 21:40', cron: '30 21 * * 1'},
    ],
  },
  {
    name: 'Bronjahm',
    loot: 'Sac 34 places',
    loot_icon: 'https://wow.zamimg.com/images/wow/icons/large/inv_misc_bag_26_spellfire.jpg',
    location: '/way 70.7 38.4',
    url: 'https://www.wowhead.com/npc=174058/bronjahm',
    icon: 'https://wow.zamimg.com/uploads/screenshots/normal/993294-bronjahm.jpg',
    times: [
      {timer: 'Dimanche, 20:20', cron: '15 20 * * 7'},
      {timer: 'Lundi, 09:40', cron: '30 9 * * 1'},
      {timer: 'Lundi, 16:20', cron: '10 16 * * 1'},
      {timer: 'Lundi, 23:00', cron: '50 22 * * 1'},
    ],
  },
]

const sendMessage = (client, timer, { name, loot, location, url, icon, loot_icon }, nextSpawn) => {
  let message = new Discord.RichEmbed()
    .setColor('#0099ff')
    .setTitle(name)
    .setDescription(`${loot}\nPop dans **10 minutes (${timer})**`)
    .setURL(url)
    .setThumbnail(icon)
    .addField('Localisation', `\`${location}\``)
    .setImage(loot_icon)
    .setFooter(nextSpawn ? `Prochain spawn le ${nextSpawn.timer}` : 'Pas de prochaine date encodée')

  client.channels.get(channels.spawnRareChannel).send(message)
}

export const runCrons = (client) => {
  timers.forEach((timerData) =>
    timerData.times.forEach((time, i) =>
      cron
        .schedule(
          time.cron,
          () => sendMessage(client, time.timer, timerData, i + 1 >= timerData.times.length ?
            undefined : timerData.times[i + 1]),
          {}
        )
        .start()
    )
  )
}
