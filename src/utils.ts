/* Sensors costants */
export const bikes = ['taurusx', 'taurus', 'phoenix'];
export const ws = ['ws1', 'ws_test'];

/* Utility for message parsing */

interface Destination {
  id: string;
  type: string;
  name: string;
}

export function getDestinationMessage(topic: string): Destination {
  const elements = topic.split('/');
  return { id: elements[2], type: elements[0], name: elements[1] };
}

export function isBike(data: Destination): boolean {
  return data.type === 'bikes' && bikes.includes(data.name);
}

export function isWeatherStation(data: Destination): boolean {
  return data.type === 'weather_stations' && ws.includes(data.name);
}
