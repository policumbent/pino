import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan'; // logging middleware
import { check, validationResult } from 'express-validator'; // validation middleware

import { checkIfAdmin } from './auth-middleware';
import { createUser, setUserAdmin } from './auth-service';
import { bikeValues, weatherValues } from './mqtt-service';
import { getComments, setComments, getConfig, setConfig } from './firebase-db';

import { getData } from './influx-test';
import { isAdmin, protectData } from './utils';

const app = express();
const PORT = 3001;

app.use(morgan('dev'));
app.use(express.json());
app.use(cors()); // cors abilitati

// app.use(cors({
//   origin: 'https://alice.policumbent.it'
// }));

/* General APIs */

/* Retrive live data for defined bike (from mqtt).
 * Show all data if requests is from an admin,
 * otherwise obscure heartrate and power
 *
 * params: @bike -> bike id
 */
app.get('/api/activities/last/:bike', [check('bike').isString()], async (req: any, res: any) => {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(422).json({ err: err.array() });
  }

  const bike = req.params.bike;

  try {
    const admin = await isAdmin(req);
    const sensorsData = bikeValues[bike];
    const data = admin ? sensorsData : protectData(sensorsData);

    res.status(200).json(data);
  } catch {
    res.status(500).json({
      err: 'Unable to retrive live data',
    });
  }
});

/* Retrive live data from all weather stations (from mqtt) */
app.get('/api/weather/last', async (req: any, res: any) => {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(422).json({ err: err.array() });
  }

  try {
    const data = weatherValues;
    res.status(200).json(data);
  } catch {
    res.status(500).json({
      err: 'Unable to retrive live data',
    });
  }
});

/* Retrive live data for defined weather station (from mqtt)
 *
 * params: @station -> station id
 */
app.get('/api/weather/last/:station', [check('station').isString()], async (req: any, res: any) => {
  const err = validationResult(req);
  if (!err.isEmpty()) {
    return res.status(422).json({ err: err.array() });
  }
  const station = req.params.station;

  try {
    const data = weatherValues[station];
    res.status(200).json(data);
  } catch {
    res.status(500).json({
      err: 'Unable to retrive live data',
    });
  }
});

/* Retrive history data for defined bike (from influxdb)
 *
 * params: @bike -> bike id
 * query:  @n -> data length
 */
app.get(
  '/api/activities/last/:bike',
  checkIfAdmin,
  [check('bike').isString(), check('n').isInt()],
  async (req: any, res: any) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(422).json({ err: err.array() });
    }

    const bike = req.params.bike;
    const len = req.query.n;

    try {
      res.status(200).json({ msg: 'WIP api, nothing to see here' });
    } catch {
      res.status(500).json({
        err: 'Unable to retrive data from database',
      });
    }
  },
);

/* ALICE APIs */

/* Retrive current configuration */
app.get('/api/alice/config', async (_: any, res: any) => {
  try {
    const config = await getConfig();

    res.status(200).json(config);
  } catch {
    res.status(500).json({
      err: 'Unable to retrive configuration',
    });
  }
});

/* Retrive comments */
app.get('/api/alice/comments', async (_: any, res: any) => {
  try {
    const comments = await getComments();

    res.status(200).json(comments);
  } catch {
    res.status(500).json({
      err: 'Unable to retrive comments',
    });
  }
});

/* Retrive notifications */
app.get('/api/alice/notification', async (_: any, res: any) => {
  try {
    res.status(200).json({ msg: 'WIP api, nothing to see here' });
  } catch {
    res.status(500).json({
      err: 'WIP api, nothing to see here',
    });
  }
});

/* Users APIs */

/* Create a new user */
app.post('/api/auth/signup', createUser);

/* Create a new admin */
app.post('/api/auth/makeadmin', checkIfAdmin, (req: any, res: any) => setUserAdmin(req, res, true));

/* Remove an admin */
app.post('/api/auth/removeadmin', checkIfAdmin, (req: any, res: any) =>
  setUserAdmin(req, res, false),
);

app.get('/testadmin', checkIfAdmin, (req: any, res: any) =>
  res.status(200).json({ msg: 'You are admin' }),
);

/* TEST API */

app.get('/query', checkIfAdmin, (req: any, res: any) => {
  // test with start: -50h measurement: mqtt_consumer
  const start = req.query.start;
  const measurement = req.query.measurement;

  // to improve the query performance
  getData(start, measurement).then((data) => res.status(200).json(data));
});

app.get('/bike_live', (req: any, res: any) => res.status(200).json(bikeValues));

app.get('/weather_live', (req: any, res: any) => res.status(200).json(weatherValues));

/* Activate the sever */

app.listen(PORT, () => {
  // tslint:disable-next-line:no-console
  console.log(`🌲 [server]: Pino is running at http://localhost:${PORT}`);
});
