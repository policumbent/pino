import { InfluxDB, flux, fluxDuration, fluxInteger, fluxString } from '@influxdata/influxdb-client';

// You can generate a Token from the "Tokens Tab" in the UI
const org = 'policumbent';
const bucket = 'policumbent';
const token = process.env.INFLUX_TOKEN;

const client = new InfluxDB({ url: 'https://server.policumbent.it:9002', token });
const queryApi = client.getQueryApi(org);

export const getData = (start: string, measurement: string): Promise<any> => {
  const parsedStart = fluxDuration(start);

  const query = flux`from(bucket: ${bucket})
      |> range(start: ${parsedStart})
      |> filter(fn: (r) => r[\"_measurement\"] == ${measurement})\
      |> yield(name: "mean")`;

  return queryApi.collectRows(query);
};

export async function getLastActivity(n: number, bike: string){
  const _duration = fluxDuration("-12h")
  const _n = fluxInteger(n)
  const topics = [
    `bikes/${bike}/sensors/speed`,
    `bikes/${bike}/sensors/power`,
    `bikes/${bike}/sensors/cadence`,
    `bikes/${bike}/sensors/heartrate`,
  ]
  const query = flux`from(bucket: "policumbent")
    |> range(start: ${_duration})
    |> filter(fn: (r) => r["_measurement"] == "mqtt_consumer")
    |> filter(fn: (r) => r["topic"] == ${topics[0]} or r["topic"] == ${topics[1]} or r["topic"] == ${topics[2]} or r["topic"] == ${topics[3]})
    |> limit(n: ${_n})`;
    return queryApi
      .collectRows(query)
};
