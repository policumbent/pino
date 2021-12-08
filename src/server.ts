import app from './app';
import { initMQTT } from './mqtt-service';

const PORT = process.env.PORT || 3001;

initMQTT();

/* Activate the sever */

app.listen(PORT, () => {
  // tslint:disable-next-line:no-console
  console.log(`🌲 [server]: Pino is running at http://localhost:${PORT}`);
});
