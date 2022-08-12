import { flux } from '@influxdata/influxdb-client';
import path from 'path';
import * as rfs from 'rotating-file-stream';

import { firebase } from './services';
import { Sensors, HistoryData } from './services/mqtt/types';

/* Sensors costants */
export const ws = ['ws1', 'ws_test'];

/* Utility for message parsing */

interface MqttMessage {
  type: string;
  name: string;
  datatype: string;
  sensor: string;
}
export interface AntData {
  timestamp: number;
  speed: number;
  distance: number;
  cadence: number;
  power: number;
  heartrate: number;
}
export interface GpsData {
  timestamp: number;
  timestampGPS: string;
  speed: number;
  distance: number;
  latitude: number;
  longitude: number;
  altitude: number;
  satellites: number;
  distance2timing: number;
}
export interface GearData {
  timestamp: number;
  gear: number;
}
/**
 * Parse mqtt message and get destination based on its topic
 *
 * @param topic
 * @returns
 */
export function getMqttMessageInfo(topic: string): MqttMessage {
  const elements = topic.split('/');
  return { type: elements[0], name: elements[1], datatype: elements[2], sensor: elements[3] };
}

export function isBike(data: MqttMessage, bikes: string[]): boolean {
  return data.type === 'bikes' && bikes.includes(data.name);
}

export function isWeatherStation(data: MqttMessage): boolean {
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
