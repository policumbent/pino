import express from 'express';
import cors from 'cors';

import morgan from 'morgan'; // logging middleware
// import { check, validationResult } from 'express-validator'; // validation middleware
import { checkIfAuthenticated, createUser } from './auth-middleware';
import {values} from "./mqtt-service";

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

app.get('/live', (req: any, res: any) => res.status(200).json(values));

app.listen(PORT, () => {
  // tslint:disable-next-line:no-console
  console.log(`🌲 [server]: Pino is running at http://localhost:${PORT}`);
});

app.post('/auth/signup', createUser);

app.get('/test', checkIfAuthenticated, (req: any, res: any) =>
  res.status(200).json({ msg: 'Pino is authenticated' })
);

