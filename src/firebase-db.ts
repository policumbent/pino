import admin from './firebase-service';

const db = admin.database();

interface Config {
  prova: string;
}

export async function getConfig() {
  const config = await db.ref('alice/config').get();

  return config;
}

export function setConfig(value: Config) {
  db.ref('alice').set({
    config: value,
  });
}

export async function getComments() {
  const comments = await db.ref('alice/comments').get();

  return comments;
}

export function setComments(value: string[]) {
  db.ref('alice').set({
    comments: value.join(';'),
  });
}

export default db;
