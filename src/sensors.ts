export class Sensors {
  [key: string]: string | number;

  accX: number;
  accXMax: number;
  accY: number;
  accYMax: number;
  accZ: number;
  accZMax: number;
  bikeName: string;
  cadence: number;
  cpuTemp: number;
  distance: number;
  // tslint:disable-next-line:variable-name
  distance_2: number;
  gear: number;
  heartrate: number;
  latitude: number;
  longitude: number;
  satellites: number;
  power: number;
  speed: number;
  speedGps: number;
  // tslint:disable-next-line:variable-name
  speed_2: number;
  time: number;
  timestamp: 0;
  deviceTypeInt: number;

  constructor(bikename: string) {
    this.accX = 0;
    this.accXMax = 0;
    this.accY = 0;
    this.accYMax = 0;
    this.accZ = 0;
    this.accZMax = 0;
    this.bikeName = bikename;
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
  }
}