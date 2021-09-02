import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import morgan from 'morgan'; // logging middleware
import { check, validationResult } from 'express-validator'; // validation middleware
import { checkIfAuthenticated, checkIfAdmin } from './auth-middleware';
import { createUser, setUserAdmin } from './auth-service';
import { getData } from './influx-test';
import {bikeValues, weatherValues} from "./mqtt-service";

const app = express();
const PORT = 3001;

app.use(morgan('dev'));
app.use(express.json());
app.use(cors()); // cors abilitati

// app.use(cors({
//   origin: 'https://alice.policumbent.it'
// }));

app.get('/', (req: any, res: any) => res.status(200).json({ msg: 'Pino is born' }));

app.get('/ueue', (req: any, res: any) => res.status(200).json({ msg: 'Pino is crying' }));

app.post('/kiss', (req: any, res: any) =>
  res.status(200).json({ msg: `Pino doesn't cry anymore` }),
);

app.post('/auth/signup', createUser);

app.post('/auth/makeadmin', checkIfAdmin, (req: any, res: any) => {
  setUserAdmin(req, res, true);
});
app.post('/auth/removeadmin', checkIfAdmin, (req: any, res: any) => {
  setUserAdmin(req, res, false);
});

app.get('/test', checkIfAuthenticated, (req: any, res: any) =>
  res.status(200).json({ msg: 'You are authenticated' }),
);

app.get('/testadmin', checkIfAdmin, (req: any, res: any) =>
  res.status(200).json({ msg: 'You are admin' }),
);

app.get('/query', checkIfAdmin, (req: any, res: any) => {
  // test with start: -50h measurement: mqtt_consumer
  const start = req.query.start;
  const measurement = req.query.measurement;

  // to improve the query performance
  getData(start, measurement).then((data) => res.status(200).json(data));
});

app.get('/bike_live', (req: any, res: any) => res.status(200).json(bikeValues));
app.get('/weather_live', (req: any, res: any) => res.status(200).json(weatherValues));

app.listen(PORT, () => {
  // tslint:disable-next-line:no-console
  console.log(`🌲 [server]: Pino is running at http://localhost:${PORT}`);
});
