import app from './app';
import { mqtt } from './services';

const PORT = process.env.PORT || 3001;

mqtt.initMQTT();

/* Activate the sever */

app.listen(PORT, () => {
  // tslint:disable-next-line:no-console
  console.log(`🌲 [server]: Pino is running at http://localhost:${PORT}`);
});
