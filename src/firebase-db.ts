import admin from './firebase-service';

const db = admin.database();

interface Config {
  [key: string]: string;

  bikeName: string;
  date: string;
  startTime: string;
  trackName: string;
}

type Comments = string[];

export function newConfig(data: any): Config {
  const config = {
    bikeName: data.bikeName || null,
    date: data.date || null,
    startTime: data.startTime || null,
    trackName: data.trackName || null,
  };

  return config;
}

export async function getConfig() {
  const data = await db.ref('alice/config').get();
  const config = data.val() as Config;

  return config;
}

export async function setConfig(value: Config) {
  await db.ref('alice/config').set(value);
}

export async function updateConfig(value: Config) {
  const config = await getConfig();
  for (const key in config) {
    const old = config[key];
    config[key] = value[key] || old;
  }

  await setConfig(config);
  return config;
}

export async function getComments() {
  const data = await db.ref('alice/comments').get();
  const comments = data.val() as Comments;

  return comments;
}

export async function setComments(value: Comments) {
  await db.ref('alice/comments').set(value);
}

export async function updateComments(value: Comments) {
  const oldComments = await getComments();
  const comments = oldComments?.concat(value) || [];

  await setComments(comments);
  return comments;
}

export async function updateSingleComment(value: string, position: number) {
  const comments = await getComments();

  if (position < comments.length) {
    comments[position] = value;
  } else {
    position = comments.length;
    comments[position] = value;
  }
  await setComments(comments);
  return { comments, position };
}

export default db;
