import mqtt from 'mqtt';

const client = mqtt.connect({
  protocol: 'mqtts',
  host: 'server.policumbent.it',
  port: 8883,
  rejectUnauthorized: false,
  username: 'stefano',
  password: 'martafaschifo!',
});

client.on('connect', () => {
  client.subscribe('presence', (err: any) => {
    if (!err) {
      client.publish('presence', 'Hello mqtt');
    }
  });
});

client.on('message', (topic: string, message: any) => {
  // message is Buffer
  console.log(message.toString());
  client.end();
});
