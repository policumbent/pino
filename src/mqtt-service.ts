import mqtt from 'mqtt'
import {Sensors} from './sensors'
import Dict = NodeJS.Dict;

const client = mqtt.connect({
  protocol: 'mqtts',
  host: 'server.policumbent.it',
  port: 8883,
  rejectUnauthorized : false,
  username: 'stefano',
  password: 'martafaschifo!'
})

const bikes = ['taurusx', 'taurus', 'phoenix'];

export const values: Dict<Sensors> = {}

bikes.forEach(bike => values[bike] = new Sensors(bike))

client.on('connect', () => {

  bikes.forEach(bike => client.subscribe(`bikes/${bike}/sensors/#`,
    // tslint:disable-next-line:no-console
    (err) => !err ? console.log(`Subscribed to ${bike}`): console.log(`Unsubscribed from ${bike}`)));
})

client.on('message', (topic: string, message: Buffer) => {
  // tslint:disable-next-line:no-console
  console.log(topic, message.toString());
  const elements = topic.split('/');
  const bikeName = elements[1]
  if (!bikes.includes(bikeName))
    return;
  // todo: gabri vieni in mio soccorso?
  //  devo fare l'update dei valori ma typescript
  //  si incazza se faccio accesso stile dizionario
  // @ts-ignore
  values[bikeName][elements[3]] = (typeof values[bikeName][elements[3]] === "number") ?
    parseFloat(message.toString()) : message.toString();
  // tslint:disable-next-line:no-console
  console.log(values);
})
