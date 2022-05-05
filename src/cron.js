import moment from 'moment-timezone'
import {channels} from './constants/channels'
const Discord = require('discord.js')

// Get ref_date from wowhead link of each mob
const timers = [
  {
    name: 'Skadi le brutal',
    loot: 'Monture : proto-drake bleu',
    loot_icon:
      'https://wow.zamimg.com/uploads/screenshots/normal/109195-reins-of-the-blue-proto-drake.jpg',
    location: '/way 57.8 56.1',
    url: 'https://www.wowhead.com/npc=174062/skadi-the-ruthless',
    icon:
      'https://wow.zamimg.com/uploads/screenshots/normal/993107-skadi-the-ruthless.jpg',
    ref_date: '2020-11-15 05:40',
  },
  {
    name: 'Bronjahm',
    loot: 'Sac 34 places',
    loot_icon:
      'https://wow.zamimg.com/images/wow/icons/large/inv_misc_bag_26_spellfire.jpg',
    location: '/way 70.7 38.4',
    url: 'https://www.wowhead.com/npc=174058/bronjahm',
    icon:
      'https://wow.zamimg.com/uploads/screenshots/normal/993294-bronjahm.jpg',
    ref_date: '2020-11-15 07:00',
  },
]

const min = 60 * 1000
const hour = min * 60

// Format date to string like: "Sunday 20:00"
const formatDate = time => {
  return `${time.locale('fr').format('dddd')} ${time
    .locale('fr')
    .format('kk:mm')}`
}

const sendMessage = (
  client,
  {name, loot, location, url, icon, loot_icon},
  timer,
  diff
) => {
  const printableSpawnDate = formatDate(timer)
  const printableNextSpawnDate = formatDate(timer.add(3, 'h').add(20, 'm'))

  const message = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(name)
    .setDescription(`${loot}\nPop dans **10 minutes (${printableSpawnDate})**`)
    .setURL(url)
    .setThumbnail(icon)
    .addField('Localisation', `\`${location}\``)
    .setImage(loot_icon)
    .setFooter(
      printableNextSpawnDate
        ? `Prochain spawn le ${printableNextSpawnDate}`
        : 'Pas de prochaine date encodée'
    )

  client.channels
    .get(channels.spawnRareChannel)
    .send({embeds: [message]})
    .then(message => message.pin())
}

export const runCrons = client => {
  timers.forEach(timerData => {
    let cursor = moment.tz(timerData.ref_date, 'Europe/Paris')
    const dateNow = moment.tz('Europe/Paris')

    // Increment cursor by 6 hours and 40 minutes from reference date
    // to get next spawn time.
    for (
      cursor = moment.tz(timerData.ref_date, 'Europe/Paris');
      cursor < dateNow;
      cursor.add(3, 'h').add(20, 'm')
    ) {}

    // cursor is now the next spawn date
    // so we calculate how long we setTimeout
    const timeUntilNextSpawn = cursor.diff(dateNow)

    // So setTimeout until next one spawn minus 10 minutes
    setTimeout(() => {
      // Send first message for next spawn
      // Pass timeUntilNextSpawn to sendMessage in case of reboot of the bot when
      // spawn date before the last 10 minutes
      sendMessage(client, timerData, cursor, timeUntilNextSpawn)

      // As we are sync now, we can setIntervale every 6h40
      setInterval(() => {
        sendMessage(client, timerData, cursor, timeUntilNextSpawn)
      }, 6 * hour + 40 * min)
    }, timeUntilNextSpawn - 10 * min)
  })
}
