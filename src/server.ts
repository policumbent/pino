import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan'; // logging middleware
import { check, validationResult } from 'express-validator'; // validation middleware

import { checkIfAuthenticated, checkIfAdmin } from './auth-middleware';
import { createUser, setUserAdmin } from './auth-service';
import { bikeValues, weatherValues } from './mqtt-service';

import { getData } from './influx-test';

const app = express();
const PORT = 3001;

app.use(morgan('dev'));
app.use(express.json());
app.use(cors()); // cors abilitati

// app.use(cors({
//   origin: 'https://alice.policumbent.it'
// }));

/* General APIs */

/* Retrive live data for defined bike (from mqtt)
 *
 * params: @bike -> bike id
 */
app.get(
  '/api/activities/last/:bike',
  checkIfAuthenticated,
  [check('bike').isString()],
  async (req: any, res: any) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(422).json({ err: err.array() });
    }
    const bike = req.params.bike;

    try {
      const data = bikeValues[bike];
      res.status(200).json(data);
    } catch {
      res.status(500).json({
        err: 'Unable to retrive live data',
      });
    }
  },
);

/* Retrive live data from all weather stations (from mqtt) */
app.get('/api/weather/last', checkIfAuthenticated, async (req: any, res: any) => {
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
app.get(
  '/api/weather/last/:station',
  checkIfAuthenticated,
  [check('station').isString()],
  async (req: any, res: any) => {
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
  },
);

/* Retrive history data for defined bike (from influxdb)
 *
 * params: @bike -> bike id
 * query:  @n -> data length
 */
app.get(
  '/api/activities/last/:bike',
  checkIfAuthenticated,
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
app.get('/api/alice/config', checkIfAuthenticated, async (_: any, res: any) => {
  try {
    res.status(200).json({ msg: 'WIP api, nothing to see here' });
  } catch {
    res.status(500).json({
      err: 'WIP api, nothing to see here',
    });
  }
});

/* Retrive comments */
app.get('/api/alice/comments', checkIfAuthenticated, async (_: any, res: any) => {
  try {
    res.status(200).json({ msg: 'WIP api, nothing to see here' });
  } catch {
    res.status(500).json({
      err: 'WIP api, nothing to see here',
    });
  }
});

/* Retrive notifications */
app.get('/api/alice/notification', checkIfAuthenticated, async (_: any, res: any) => {
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

/* TEST API */

app.get('/test', checkIfAuthenticated, (req: any, res: any) =>
  res.status(200).json({ msg: 'You are authenticated' }),
);

app.get('/testadmin', checkIfAdmin, (req: any, res: any) =>
  res.status(200).json({ msg: 'You are admin' }),
);

app.get('/query', checkIfAuthenticated, (req: any, res: any) => {
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
