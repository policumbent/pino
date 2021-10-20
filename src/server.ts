import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan'; // logging middleware
import { check, validationResult } from 'express-validator'; // validation middleware

import { checkIfAdmin } from './auth-middleware';
import { createUser, setUserAdmin } from './auth-service';
import { bikeValues, weatherValues } from './mqtt-service';
import { Config, Comments } from './firebase-db';

import { getData } from './influx-test';
import { isAdmin, protectData } from './utils';
import { getTokens, sendNotifications } from './notifications-service';

const app = express();
const PORT = 3001;

app.use(morgan('dev'));
app.use(express.json());
app.use(cors()); // cors abilitati

// app.use(cors({
//   origin: 'https://alice.policumbent.it'
// }));

/* General APIs */

/**
 * Retrive live data for defined bike (from mqtt).
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
    if (data !== undefined) {
      data.connected = Date.now() - data.last < 5000;
    }

    res.status(200).json(data);
  } catch {
    res.status(500).json({
      err: 'Unable to retrive live data',
    });
  }
});

/* Retrive live data from all weather stations (from mqtt) */
app.get('/api/weather/last', (_: any, res: any) => {
  const data = weatherValues;

  try {
    res.status(200).json(data);
  } catch {
    res.status(500).json({
      err: 'Unable to retrive live data',
    });
  }
});

/**
 * Retrive live data for defined weather station (from mqtt)
 *
 * params: @station -> station id
 */
app.get('/api/weather/last/:station', [check('station').isString()], (req: any, res: any) => {
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

/**
 * Retrive history data for defined bike (from influxdb)
 *
 * params: @bike -> bike id
 *         @n -> data length
 */
app.get(
  '/api/activities/last/:bike/:n',
  // checkIfAdmin,
  [check('bike').isString(), check('n').isInt()],
  async (req: any, res: any) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(422).json({ err: err.array() });
    }

    const bike = req.params.bike;
    const len = req.params.n;

    try {
      const placeholder = {
        chart: [],
        miniChart: [],
      };

      res.status(200).json(placeholder);
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
    const config = await Config.get();

    res.status(200).json(config);
  } catch {
    res.status(500).json({
      err: 'Unable to retrive configuration',
    });
  }
});

/** Add new configuration
 *
 * body: @bikeName  -> bike to monitor
 *       @date      -> date countdonw for the run
 *       @startTime -> timer countdown for the run
 *       @trackName -> code for GPS configuration
 */
app.post(
  '/api/alice/config',
  checkIfAdmin,
  [
    check('bikeName').isString(),
    check('date').isDate({ format: 'YYYY-MM-DD' }),
    check('startTime').matches(/^([0-1]?[0-9]|[2][0-3]):([0-5][0-9])(:[0-5][0-9])$/),
    check('trackName').isString(),
  ],
  async (req: any, res: any) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(422).json({ err: err.array() });
    }

    const config = req.body;
    console.log(config);

    try {
      await Config.set(config);

      res.status(200).json(config);
    } catch {
      res.status(500).json({
        err: 'Unable to add new configuration',
      });
    }
  },
);

/** Update configuration (one or more fields)
 *
 * body: @bikeName  -> bike to monitor
 *       @date      -> date countdonw for the run
 *       @startTime -> timer countdown for the run
 *       @trackName -> code for GPS configuration
 */
app.put(
  '/api/alice/config',
  checkIfAdmin,
  [
    check('bikeName').isString().optional(true),
    check('date').isDate({ format: 'YYYY-MM-DD' }).optional(true),
    check('startTime')
      .matches(/^([0-1]?[0-9]|[2][0-3]):([0-5][0-9])(:[0-5][0-9])$/)
      .optional(true),
    check('trackName').isString().optional(true),
  ],
  async (req: any, res: any) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(422).json({ err: err.array() });
    }

    const values = new Config(req.body);

    try {
      const config = await Config.update(values);

      res.status(200).json(config);
    } catch {
      res.status(500).json({
        err: 'Unable to update configuration',
      });
    }
  },
);

/* Retrive comments */
app.get('/api/alice/comments', async (_: any, res: any) => {
  try {
    const comments = await Comments.get();

    res.status(200).json(comments);
  } catch {
    res.status(500).json({
      err: 'Unable to retrive comments',
    });
  }
});

/**
 * Replace all comments
 *
 * body: @comments -> new comments
 */
app.post(
  '/api/alice/comments',
  checkIfAdmin,
  [
    check('comments').isArray(),
    check('comments.*.id').isInt(),
    check('comments.*.message').isString(),
    check('comments.*.timestamp').isISO8601(),
    check('comments.*.username').isString(),
  ],
  async (req: any, res: any) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(422).json({ err: err.array() });
    }

    const comments = new Comments(req.body.comments);

    try {
      await Comments.set(comments);

      res.status(200).json(comments);
    } catch {
      res.status(500).json({
        err: 'Unable to replace all comments',
      });
    }
  },
);

/**
 * Add new comments
 *
 * body: @comments -> new comments to add
 */
app.put(
  '/api/alice/comments',
  checkIfAdmin,
  check('comments').isArray(),
  check('comments.*.id').isInt(),
  check('comments.*.message').isString(),
  check('comments.*.timestamp').isISO8601(),
  check('comments.*.username').isString(),
  async (req: any, res: any) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(422).json({ err: err.array() });
    }

    const newComments = new Comments(req.body.comments);

    try {
      const comments = await Comments.update(newComments);

      res.status(200).json(comments);
    } catch {
      res.status(500).json({
        err: 'Unable to add new comments',
      });
    }
  },
);

/**
 * Update or add a single comment in defined position
 *
 * params: @pos -> comment position into array
 * body: @comment -> comment to add
 */
app.put(
  '/api/alice/comments/:pos',
  checkIfAdmin,
  [
    check('pos').isInt({ min: 0 }),
    check('comment').isObject(),
    check('comment.id').isInt(),
    check('comment.message').isString(),
    check('comment.timestamp').isISO8601(),
    check('comment.username').isString(),
  ],
  async (req: any, res: any) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(422).json({ err: err.array() });
    }

    const pos = req.params.pos;
    const newComment = req.body.comment;

    try {
      const comments = await Comments.updateSingle(newComment, pos - 1);

      res.status(200).json(comments);
    } catch {
      res.status(500).json({
        err: `Unable to update comment in position ${pos}`,
      });
    }
  },
);

/* Delete all comments */
app.delete('/api/alice/comments', checkIfAdmin, async (_: any, res: any) => {
  try {
    await Comments.set(null);

    res.status(200).json('Deleted all comments');
  } catch {
    res.status(500).json({
      err: 'Unable to delete comments',
    });
  }
});

/* Retrive notifications */
app.get('/api/alice/notifications', async (_: any, res: any) => {
  try {
    const placeholder = [{ id: 1, message: 'notifica di prova', public: true }];
    res.status(200).json(placeholder);
  } catch {
    res.status(500).json({
      err: 'Unable to retrive notifications',
    });
  }
});

/**
 * Send push notification
 *
 * body: @titleIt  -> notification title IT
 *       @titleEn  -> notification title EN
 *       @messageIt -> italian message
 *       @messageEn -> english message
 */
app.post(
  '/api/alice/push_notification',
  checkIfAdmin,
  [
    check('titleIt').isString(),
    check('titleEn').isString(),
    check('messageIt').isString(),
    check('messageEn').isString(),
  ],
  async (req: any, res: any) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(422).json({ err: err.array() });
    }

    const notification = req.body;

    try {
      const tokens = await getTokens('test');

      if (tokens.tokensIt.length > 0)
        sendNotifications(tokens.tokensIt, notification.titleIt, notification.messageIt);
      if (tokens.tokensEn.length > 0)
        sendNotifications(tokens.tokensEn, notification.titleEn, notification.messageEn);

      if (tokens.tokensIt.length === 0 && tokens.tokensEn.length === 0)
        res.status(500).json({
          err: 'No notifications tokens found',
        });
      else res.status(200).json('Notifications sent');
    } catch {
      res.status(500).json({
        err: 'Unable to send notifications',
      });
    }
  },
);

/* Users APIs */

/* Create a new user */
app.post('/api/auth/signup', createUser);

/* Create a new admin */
app.post('/api/auth/makeadmin', checkIfAdmin, (req: any, res: any) => setUserAdmin(req, res, true));

/* Remove an admin */
app.post('/api/auth/removeadmin', checkIfAdmin, (req: any, res: any) =>
  setUserAdmin(req, res, false),
);

app.get('/testadmin', checkIfAdmin, (_: any, res: any) =>
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
