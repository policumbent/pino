import dayjs from 'dayjs';

import admin from './firebase-service';

const db = admin.database();

export class Config {
  [key: string]: string;

  bikeName: string; // taurusx, taurus, phoenix
  date: string; // YYYY-MM-DD
  startTime: string; // hh:mm:ss
  trackName: string; // bm, balocco or orbassano

  constructor(data: any) {
    this.bikeName = data.bikeName || null;
    this.date = data.date || null;
    this.startTime = data.startTime || null;
    this.trackName = data.trackName || null;
  }

  static refDB() {
    return db.ref('alice/config');
  }

  static async get() {
    const data = await this.refDB().get();
    const config = new Config(data.val());

    return config;
  }

  static set(value: Config) {
    this.refDB().set(value);

    return value;
  }

  static async update(value: Config) {
    const config = await this.get();

    for (const key of Object.keys(config)) {
      const old = config[key];
      value[key] = value[key] || old;
    }

    return this.set(value);
  }
}

interface Comment {
  message: string;
  timestamp: string;
  username: string;
}

export class Comments extends Array<Comment> {
  static commentId: number | null = null;

  constructor(data: any[]) {
    const ts = dayjs().add(2, 'hour').format('YYYY-MM-DD HH:mm:ss');
    let tsData = [];
    if (Array.isArray(data))
      tsData = data.map((d) => ({ timestamp: d.timestamp || ts, ...d }));

    super(...tsData);
  }

  static refDB() {
    return db.ref('alice/comments');
  }

  static async get() {
    const data = await this.refDB().get();
    const comments = new Comments(data.val() || []);

    return comments;
  }

  static async set(value: Comments | null) {
    this.refDB().set(value);

    return value;
  }

  static async update(value: Comments) {
    const comments = await this.get();
    comments.push(...value);
    await this.refDB().set(comments);
  }

  static async updateSingle(value: Comment, position: number) {
    const comments = await this.get();

    if (position < comments.length) {
      comments[position] = value;
    } else {
      position = comments.length;
      comments[position] = value;
    }

    return await this.set(comments);
  }

  static async removeSingle(position: number) {
    const comments = await this.get();
    
    if (position < comments.length) {
      comments.splice(position, 1);
    } 

    return await this.set(comments);
  }
}

export class Token extends String {
  static refDB() {
    return db.ref('notifications/alice/tokens');
  }

  /**
   * Retrive all client tokens form firebase db
   *
   * @return
   *   All tokens
   */
  static async get() {
    const data = await this.refDB().get();
    const tokens = await data.val();

    return tokens;
  }
  /**
   * Add a client token to firebase db
   *
   * @param {Token} value
   */
  static push(token: Token) {
    const v = { token, lang: 'it' };
    db.ref('notifications/alice/tokens/' + token).set(v);
  }

  /**
   * Replace all client tokens
   *
   * @param value
   */
  static set(value: Token[]) {
    this.refDB().set(value);
  }
}

export default db;
