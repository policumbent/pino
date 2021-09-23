import admin from './firebase-service';

const db = admin.database();

export class Config {
  [key: string]: string;

  bikeName: string;
  date: string;
  startTime: string;
  trackName: string;

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

    for (const key in config) {
      const old = config[key];
      value[key] = value[key] || old;
    }

    return await this.set(value);
  }
}

export class Comments extends Array<string> {
  constructor(data: string[]) {
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

  static async updateSingle(value: string, position: number) {
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
