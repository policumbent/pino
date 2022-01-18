import path from 'path';
import * as rfs from 'rotating-file-stream';

import { firebase } from './services';
import { Sensors, HistoryData } from './services/mqtt/types';

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

/**
 * Parse mqtt message and get destination based on its topic
 *
 * @param topic
 * @returns
 */
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
      const userInfo = await firebase.auth().verifyIdToken(authToken);
      return userInfo.admin;
    } catch (e) {
      return false;
    }
  } else {
    return false;
  }
}

/**
 * Don't expose sensible data like `power` and `heartrate`
 *
 * @param data
 * @returns
 */
export function protectData(data: Sensors | HistoryData | undefined): any {
  if (data) {
    data.power = -1;
    data.heartrate = -1;
  }

  return data;
}

/**
 * Create a rotating file stream for logging
 *
 * @returns
 */
export function logStream() {
  return rfs.createStream('access.log', {
    interval: '1d', // rotate daily
    path: path.join(__dirname, '..', 'log'),
  });
}
