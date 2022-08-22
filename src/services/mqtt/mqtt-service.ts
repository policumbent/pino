import mqtt from 'mqtt';
import { Sensors, WeatherData } from './types';
import { ws, getMqttMessageInfo, isBike, isWeatherStation } from '../../utils';
import {get_bikes_names} from "../sql-service";
import {insert_ant_data_alice, insert_gps_data_alice, insert_gear_data_alice} from "../sql-service";

import Dict = NodeJS.Dict;

export const bikeValues: Dict<Sensors> = {};
export const weatherValues: Dict<WeatherData> = {};
const keys = Object.keys(new Sensors(''));

/** Inizialize and setup mqtt instance */
export async function initMQTT() {
  const bikes = await get_bikes_names();
  console.log(bikes)
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
  // tslint:disable-next-line:no-console
  console.log('Connection to MQTT...');

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
    const mqttMessageInfo = getMqttMessageInfo(topic);
    console.log(message.toString());
    console.log(topic);
    if (mqttMessageInfo.type == 'bikes'){
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const bike = bikeValues[mqttMessageInfo.name]!;
      if(mqttMessageInfo.datatype == 'sensors'){
        const data = JSON.parse(message.toString());
        if(mqttMessageInfo.sensor == 'ant'){
          insert_ant_data_alice(data, mqttMessageInfo.name);
        }
        else if(mqttMessageInfo.sensor == 'gps'){
          insert_gps_data_alice({...data}, mqttMessageInfo.name);
          data.speedGps = data.speed;
          delete data.speed;
          delete data.distance;
        }
        else if(mqttMessageInfo.sensor == 'gear'){
          insert_gear_data_alice(data, mqttMessageInfo.name);
        }
        for (const item in data) {
          if (keys.includes(item))
            bike[item] = data[item];
          bike.last = Date.now();
        }
      }
    }
/*    if (isBike(destination, bikes)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const bike = bikeValues[destination.name]!;
      if (typeof bike[destination.id] === 'number') {
        bike[destination.id] = Number(message);
        console.log(message);
      } else {
        bike[destination.id] = String(message);
      }
      bike.last = Date.now();
    } else if (isWeatherStation(destination)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      weatherValues[destination.name]![destination.id] = Number(message);
    }*/
  });
}
