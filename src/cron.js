import cron from 'node-cron'

const timers = [
  {
    name: "Skadi le brutal",
    loot: "Monture : proto-drake bleu",
    location: '/way 57.8 56.1',
    times: [{timer: 'Mercredi, 8:20', cron: '0 15 8 ? * WED *'}]
  },
  {
    name: "Bronjahm",
    loot: "Sac 34 places",
    location: '/way 70.7 38.4',
    times: [{timer: 'Mercredi, 9:40', cron: '0 35 9 ? * WED *'}]
  }
]

const testTimers = [
  {
    name: 'cron 1',
    times: [{cron: '* * * * *'}],
  },
  {
    name: 'TEST',
    times: [{cron: '* * * * *'}],
  }
]

const testBotChannel = '486618253813088276'
const spawnRareChannel = '776098372826038303'

// Pop dans 6 minutes (attaquable dans 8 minutes)

const sendMessage = (client) => client.channels.get(testBotChannel).send(`Test timer CRON`)

export const runCrons = (client) => {
  testTimers.forEach(timer => {
    timer.times.forEach(time => {
      cron.schedule(time.cron, () => sendMessage(client), {}).start()
    })
  })
}
