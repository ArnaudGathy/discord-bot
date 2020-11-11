import cron from 'node-cron'

const timers = [
  {
    name: "Skadi le brutal",
    loot: "Monture : proto-drake bleu",
    location: '/way 57.8 56.1',
    times: [
      {timer: 'Mercredi, 15:00', cron: '55 14 * * 3'},
      {timer: 'Mercredi, 21:40', cron: '35 21 * * 3'},
      {timer: 'Jeudi, 11:00', cron: '55 10 * * 4'},
      {timer: 'Jeudi, 17:40', cron: '35 17 * * 4'},
      {timer: 'Vendredi, 13:40', cron: '35 13 * * 5'},
      {timer: 'Vendredi, 20:20', cron: '15 20 * * 5'},
      {timer: 'Samedi, 09:40', cron: '35 9 * * 6'},
      {timer: 'Samedi, 16:20', cron: '15 16 * * 6'},
      {timer: 'Samedi, 23:00', cron: '55 22 * * 6'},
      {timer: 'Dimanche, 12:20', cron: '15 12 * * 7'},
      {timer: 'Dimanche, 19:00', cron: '55 18 * * 7'},
    ]
  },
  {
    name: "Bronjahm",
    loot: "Sac 34 places",
    location: '/way 70.7 38.4',
    times: [{timer: 'Mercredi, 9:40', cron: '35 9 * * 3'}]
  }
]

const testTimers = [
  {
    name: "Skadi le brutal",
    loot: "Monture : proto-drake bleu",
    location: '/way 57.8 56.1',
    times: [{cron: '20 17 * * 3', timer: "Mercredi, 17:20"}],
  }
]


const spawnRareChannel = '776098372826038303'

const sendMessage = (client, timer, {name, loot, location}) => {
  const message = `${name} (${loot}) pop dans 5 minutes (${timer}) aux coordonnées : ${location}`
  client.channels.get(spawnRareChannel).send(message)
}

export const runCrons = (client) => {
  testTimers.forEach((timerData) => {
    timerData.times.forEach(time => {
      cron.schedule(time.cron, () => sendMessage(client, time.timer, timerData), {}).start()
    })
  })
}
