import express from 'express';
import morgan from 'morgan'; // logging middleware
import { check, validationResult } from 'express-validator'; // validation middleware

const app = express();
const PORT = 3001;

app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req: any, res: any) => res.status(200).json({ msg: 'Pino is born' }));

app.get('/ueue', (req: any, res: any) => res.status(200).json({ msg: 'Pino is crying' }));

app.post('/kiss', (req: any, res: any) =>
  res.status(200).json({ msg: `Pino doesn't cry anymore` }),
);

app.listen(PORT, () => {
  // tslint:disable-next-line:no-console
  console.log(`🌲 [server]: Pino is running at http://localhost:${PORT}`);
});
