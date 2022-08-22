import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import morgan from 'morgan'; // logging middleware

import { checkIfAdmin } from './auth-middleware';
import { aliceRouter, userRouter } from './routes';
import { mqtt, influx } from './services';
import { logStream } from './utils';

const app = express();

app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  // log all requests to log files
  app.use(morgan('combined', { stream: logStream() }));

  // log only 4xx and 5xx responses to console
  app.use(
    morgan('dev', {
      skip(_, res) {
        return res.statusCode < 400;
      },
    }),
  );

  // production CORS
  app.use(
    cors({
      origin: ['https://alice.policumbent.it', 'pino.policumbent.it'],
    }),
  );
}
// use poor logging for testing and development
else {
  app.use(morgan('dev'));
  app.use(cors());
}

/* General APIs */

app.use(aliceRouter);
app.use(userRouter);

// todo: remove this on future release
/* TEST API */

app.get('/testadmin', checkIfAdmin, (_: any, res: any) =>
  res.status(200).json({ msg: 'You are admin' }),
);

app.get('/query', checkIfAdmin, (req: any, res: any) => {
  // test with start: -50h measurement: mqtt_consumer
  const start = req.query.start;
  const measurement = req.query.measurement;

  // to improve the query performance
  influx.getData(start, measurement).then((data) => res.status(200).json(data));
});

app.get('/test', (req: any, res: any) => res.status(200).end());

app.get('/bike_live', (req: any, res: any) => res.status(200).json(mqtt.bikeValues));

app.get('/weather_live', (req: any, res: any) => res.status(200).json(mqtt.weatherValues));

export default app;
