import mqtt from 'mqtt';
import { Sensors } from './sensors';
import { WeatherData } from './weather-data';
import { ws, bikes, getDestinationMessage, isBike, isWeatherStation } from './utils';

import Dict = NodeJS.Dict;

export const bikeValues: Dict<Sensors> = {};
export const weatherValues: Dict<WeatherData> = {};

const client = mqtt.connect({
  protocol: 'mqtts',
  host: 'server.policumbent.it',
  port: 8883,
  rejectUnauthorized: false,
  username: 'stefano',
  password: 'martafaschifo!',
});

bikes.forEach((bike) => (bikeValues[bike] = new Sensors(bike)));
ws.forEach((w) => (weatherValues[w] = new WeatherData()));

client.on('connect', () => {
  bikes.forEach((bike) =>
    client.subscribe(
      `bikes/${bike}/sensors/#`,
      // tslint:disable-next-line:no-console
      (err) =>
        !err ? console.log(`Subscribed to ${bike}`) : console.log(`Unsubscribed from ${bike}`),
    ),
  );

  ws.forEach((w) =>
    client.subscribe(
      `weather_stations/${w}/#`,
      // tslint:disable-next-line:no-console
      (err) => (!err ? console.log(`Subscribed to ${w}`) : console.log(`Unsubscribed from ${w}`)),
    ),
  );
});

client.on('message', (topic: string, message: Buffer) => {
  // tslint:disable-next-line:no-console
  console.log(topic, message.toString());

  const destination = getDestinationMessage(topic);

  if (isBike(destination)) {
    const bike = bikeValues[destination.name]!;
    if (typeof bike[destination.id] === 'number') {
      bike[destination.id] = Number(message);
    } else {
      bike[destination.id] = String(message);
    }
    console.log(bikeValues);
  } else if (isWeatherStation(destination)) {
    weatherValues[destination.name]![destination.id] = Number(message);
    console.log(weatherValues);
  }
});