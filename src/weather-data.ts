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
