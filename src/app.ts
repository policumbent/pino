import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import morgan from 'morgan'; // logging middleware
import bodyParser from "body-parser";

import { checkIfAdmin } from './auth-middleware';
import { aliceRouter, userRouter } from './routes';
import { mqtt } from './services';
import { logStream } from './utils';
import {get_bikes, upload} from "./services/sql-service";
import fileUpload from "express-fileupload";
import {upload_db} from "./services/localdb-service";


const app = express();

app.use(bodyParser.json({
  limit: '50mb'
}));

app.use(bodyParser.urlencoded({
  limit: '50mb',
  parameterLimit: 100000,
  extended: true
}));

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
// enable files upload
app.use(fileUpload({
  createParentPath: true,
  safeFileNames:  true,
  abortOnLimit: true,
}));
// todo: remove this on future release
/* TEST API */

app.get('/testadmin', checkIfAdmin, (_: any, res: any) =>
  res.status(200).json({ msg: 'You are admin' }),
);

// app.get('/query', checkIfAdmin, (req: any, res: any) => {
//   // test with start: -50h measurement: mqtt_consumer
//   const start = req.query.start;
//   const measurement = req.query.measurement;
//
//   // to improve the query performance
//   influx.getData(start, measurement).then((data) => res.status(200).json(data));
// });

app.get('/test', (req: any, res: any) => res.status(200).end());

app.get('/bike_live', (req: any, res: any) => res.status(200).json(mqtt.bikeValues));

app.get('/weather_live', (req: any, res: any) => res.status(200).json(mqtt.weatherValues));

app.get('/bikes', (req: any, res: any) => {
  get_bikes().then((data) => res.status(200).json(data));
});

// app.get('/last_timestamp', (req: any, res: any) => {
//   get_bikes().then((data) => res.status(200).json(data));
// });

app.post('/data/:module/:bike_id', checkIfAdmin, (req: any, res: any) => {
  upload(
    req.params.module,
    req.params.bike_id,
    req.body)
    .then( uploaded_lines => res.json({uploaded_lines, total_lines: req.body.length}).status(201).end())
});

app.post('/upload_db', async (req, res) => {
  try {
    if (!req.files || req.files.db_file == undefined) {
      res.send({
        status: false,
        message: 'No file uploaded'
      });
    } else{
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      upload_db(req);
      //send response
      res.send({
        status: true,
        message: 'File is uploaded'
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

export default app;
