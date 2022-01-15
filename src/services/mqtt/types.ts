export interface HistoryData {
  power: number;
  speed: number;
  heartrate: number;
  cadence: number;
}

export class Sensors implements HistoryData {
  [key: string]: string | number | boolean;

  power: number;
  speed: number;
  heartrate: number;
  cadence: number;

  accX: number;
  accXMax: number;
  accY: number;
  accYMax: number;
  accZ: number;
  accZMax: number;
  bikeName: string;
  cpuTemp: number;
  distance: number;
  // tslint:disable-next-line:variable-name
  distance_2: number;
  gear: number;
  latitude: number;
  longitude: number;
  satellites: number;
  speedGps: number;
  // tslint:disable-next-line:variable-name
  speed_2: number;
  time: number;
  timestamp: 0;
  deviceTypeInt: number;
  last: number;
  connected: boolean;

  constructor(bikeName: string) {
    this.accX = 0;
    this.accXMax = 0;
    this.accY = 0;
    this.accYMax = 0;
    this.accZ = 0;
    this.accZMax = 0;
    this.bikeName = bikeName;
    this.cadence = 0;
    this.cpuTemp = 0;
    this.distance = 0;
    this.distance_2 = 0;
    this.gear = 0;
    this.heartrate = 0;
    this.latitude = 0;
    this.longitude = 0;
    this.satellites = 0;
    this.power = 0;
    this.speed = 0;
    this.speedGps = 0;
    this.speed_2 = 0;
    this.time = 0;
    this.timestamp = 0;
    this.deviceTypeInt = 0;
    this.last = 0;
    this.connected = false;
  }
}

export class WeatherData {
  [key: string]: number;

  temperature: number;
  humidity: number;
  pressure: number;
  // tslint:disable-next-line:variable-name
  wind_speed: number;
  // tslint:disable-next-line:variable-name
  wind_direction: number;
  timestamp: number;

  constructor() {
    this.temperature = 0;
    this.humidity = 0;
    this.pressure = 0;
    this.wind_speed = 0;
    this.wind_direction = 0;
    this.timestamp = 0;
  }
}
