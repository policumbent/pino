import mqtt from 'mqtt'
import {Sensors} from './sensors'
import Dict = NodeJS.Dict;
import {WeatherData} from "./weather-data";

const client = mqtt.connect({
  protocol: 'mqtts',
  host: 'server.policumbent.it',
  port: 8883,
  rejectUnauthorized: false,
  username: 'stefano',
  password: 'martafaschifo!',
});

const bikes = ['taurusx', 'taurus', 'phoenix'];
const ws = ['ws1', 'ws_test']

export const bikeValues: Dict<Sensors> = {}
export const weatherValues: Dict<WeatherData> = {}

bikes.forEach(bike => bikeValues[bike] = new Sensors(bike))
ws.forEach(w => weatherValues[w] = new WeatherData())

client.on('connect', () => {

  bikes.forEach(bike => client.subscribe(`bikes/${bike}/sensors/#`,
    // tslint:disable-next-line:no-console
    (err) => !err ? console.log(`Subscribed to ${bike}`): console.log(`Unsubscribed from ${bike}`)));

  ws.forEach(w => client.subscribe(`weather_stations/${w}/#`,
    // tslint:disable-next-line:no-console
    (err) => !err ? console.log(`Subscribed to ${w}`): console.log(`Unsubscribed from ${w}`)));

})

client.on('message', (topic: string, message: Buffer) => {
  // tslint:disable-next-line:no-console
  console.log(topic, message.toString())
  const elements = topic.split('/');
  if(elements[0] === 'bikes') {
    const bikeName = elements[1]
    if (!bikes.includes(bikeName))
      return;
    // todo: gabri vieni in mio soccorso?
    //  devo fare l'update dei valori ma typescript
    //  si incazza se faccio accesso stile dizionario
    // @ts-ignore
    bikeValues[bikeName][elements[3]] = (typeof bikeValues[bikeName][elements[3]] === "number") ?
      parseFloat(message.toString()) : message.toString();
    console.log(bikeValues);
  }
  else if (elements[0] === 'weather_stations'){
    const wsName = elements[1]
    if (!ws.includes(wsName))
      return;
    // @ts-ignore
    weatherValues[wsName][elements[2]] = parseFloat(message.toString());
    console.log(weatherValues);
  }
})
