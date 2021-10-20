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

  static async get() {
    const data = await db.ref('alice/config').get();
    const config = new Config(data.val());

    return config;
  }

  static async set(value: Config) {
    await db.ref('alice/config').set(value);

    return value;
  }

  static async update(value: Config) {
    const config = await this.get();

    for (const key of Object.keys(config)) {
      const old = config[key];
      value[key] = value[key] || old;
    }

    return await this.set(value);
  }
}

interface Comment {
  id: number;
  message: string;
  timestamp: string;
  username: string;
}

export class Comments extends Array<Comment> {
  constructor(data: any[]) {
    super(...data);
  }

  static async get() {
    const data = await db.ref('alice/comments').get();
    const comments = new Comments(data.val() || []);

    return comments;
  }

  static async set(value: Comments | null) {
    await db.ref('alice/comments').set(value);

    return value;
  }

  static async update(value: Comments) {
    const comments = await this.get();
    comments.push(...value);

    return await this.set(comments);
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
}

export default db;
