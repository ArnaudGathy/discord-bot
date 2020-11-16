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
      {timer: 'Dimanche, 19:00', cron: '50 18 * * 7'},
      {timer: 'Lundi, 01:40', cron: '30 1 * * 1'},
      {timer: 'Lundi, 08:20', cron: '10 8 * * 1'},
      {timer: 'Lundi, 15:00', cron: '50 14 * * 1'},
      {timer: 'Lundi, 21:40', cron: '30 21 * * 1'},
      {timer: 'Mardi, 11:00', cron: '50 10 * * 2'},
      {timer: 'Mardi, 17:40', cron: '30 17 * * 2'},
      {timer: 'Mercredi, 00:20', cron: '10 0 * * 3'},
      {timer: 'Mercredi, 07:00', cron: '50 6 * * 3'},
      {timer: 'Mercredi, 20:20', cron: '10 20 * * 3'},
      {timer: 'Jeudi, 03:00', cron: '50 2 * * 4'},
      {timer: 'Jeudi, 09:40', cron: '30 6 * * 4'},
      {timer: 'Jeudi, 16:20', cron: '10 16 * * 4'},
      {timer: 'Jeudi, 23:00', cron: '50 22 * * 4'},
      {timer: 'Vendredi, 05:40', cron: '30 5 * * 5'},
      {timer: 'Vendredi, 12:20', cron: '10 12 * * 5'},
      {timer: 'Vendredi, 19:00', cron: '50 18 * * 5'},
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
      {timer: 'Dimanche, 20:20', cron: '10 20 * * 7'},
      {timer: 'Lundi, 09:40', cron: '30 9 * * 1'},
      {timer: 'Lundi, 16:20', cron: '10 16 * * 1'},
      {timer: 'Lundi, 23:00', cron: '50 22 * * 1'},
      {timer: 'Mardi, 05:40', cron: '30 5 * * 2'},
      {timer: 'Mardi, 12:20', cron: '10 12 * * 2'},
      {timer: 'Mardi, 19:00', cron: '50 18 * * 2'},
      {timer: 'Mercredi, 01:40', cron: '30 1 * * 3'},
      {timer: 'Mercredi, 08:20', cron: '10 8 * * 3'},
      {timer: 'Mercredi, 15:00', cron: '50 14 * * 3'},
      {timer: 'Mercredi, 21:40', cron: '30 21 * * 3'},
      {timer: 'Jeudi, 04:20', cron: '10 4 * * 4'},
      {timer: 'Jeudi, 11:00', cron: '50 10 * * 4'},
      {timer: 'Jeudi, 17:40', cron: '30 17 * * 4'},
      {timer: 'Vendredi, 00:20', cron: '10 0 * * 5'},
      {timer: 'Vendredi, 07:00', cron: '50 6 * * 5'},
      {timer: 'Vendredi, 13:40', cron: '30 13 * * 5'},
      {timer: 'Vendredi, 21:20', cron: '10 21 * * 5'},
    ],
  },
]

const sendMessage = (client, timer, { name, loot, location, url, icon, loot_icon }, nextSpawn) => {
  const message = new Discord.RichEmbed()
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
