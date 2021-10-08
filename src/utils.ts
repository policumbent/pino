import admin from './firebase-service';
import { Sensors } from './sensors';

/* Sensors costants */
export const bikes = ['taurusx', 'taurus', 'phoenix'];
export const ws = ['ws1', 'ws_test'];

/* Utility for message parsing */

interface Destination {
  id: string;
  type: string;
  name: string;
  datatype: string;
}

export function getDestinationMessage(topic: string): Destination {
  const elements = topic.split('/');
  return { id: elements[3], type: elements[0], name: elements[1], datatype: elements[2] };
}

export function isBike(data: Destination): boolean {
  return data.type === 'bikes' && bikes.includes(data.name);
}

export function isWeatherStation(data: Destination): boolean {
  return data.type === 'weather_stations' && ws.includes(data.name);
}

/* Utility for request parsing */

export async function isAdmin(req: any) {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    try {
      const authToken = req.headers.authorization.split(' ')[1];
      const userInfo = await admin.auth().verifyIdToken(authToken);
      return userInfo.admin;
    } catch (e) {
      return false;
    }
  } else {
    return false;
  }
}

export function protectData(data: Sensors | undefined) {
  if (data) {
    data.power = -1;
    data.heartrate = -1;
  }

  return data;
}
