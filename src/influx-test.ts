import { InfluxDB, FluxTableMetaData, flux, fluxDuration } from '@influxdata/influxdb-client';

// You can generate a Token from the "Tokens Tab" in the UI
const token = process.env.INFLUX_TOKEN;
const org = 'policumbent';
const bucket = 'policumbent';

const client = new InfluxDB({ url: 'https://server.policumbent.it:9002', token });
const queryApi = client.getQueryApi(org);
// const queryApi = client.getQueryApi(org)

export const getData = (start: string, measurement: string): Promise<any> => {
  const parsedStart = fluxDuration(start);

  const query = flux`from(bucket: ${bucket})
      |> range(start: ${parsedStart})
      |> filter(fn: (r) => r[\"_measurement\"] == ${measurement})\
      |> yield(name: "mean")`;

  return queryApi.collectRows(query);
};
