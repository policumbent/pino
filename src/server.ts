import express from "express";

const app = express();

const PORT = 3001;

app.listen(PORT, () => {
  // tslint:disable-next-line:no-console
  console.log(`🌲 [server]: Pino is running at http://localhost:${PORT}`);
});

app.get('/', (req: any, res: any) => res.send('Pino is born'));

app.get('/ueue', (req: any, res: any) => res.send('Pino is crying'));

app.post("/kiss",(req: any, res: any) => res.send('Pino doesn\'t cry anymore'))
