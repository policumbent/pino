import { db, messaging } from './firebase/firebase-service';

/**
 * Get a token from firebase db
 *
 * @param {string} service  Registered service, from firebase `notitfication/{services}`
 * @returns An object with token for italian and english
 */
export async function getTokens(service: string) {
  const tokens = await (await db.ref(`notifications/${service}`).get()).val();
  const tokensIt: string[] = [];
  const tokensEn: string[] = [];

  for (const token of Object.keys(tokens))
    tokens[token].lang === 'it' ? tokensIt.push(token) : tokensEn.push(token);

  return {
    tokensIt,
    tokensEn,
  };
}

/**
 * Send a push notification to registered devices
 *
 * @param tokens Registration token of the user
 * @param title
 * @param body
 * @returns {Promise<void>}
 */
export async function send(tokens: string[], title: string, body: string): Promise<void> {
  const payload = {
    notification: {
      title,
      body,
    },
  };
  const options = {
    priority: 'high',
    timeToLive: 60 * 60 * 3,
  };
  return messaging()
    .sendToDevice(tokens, payload, options)
    .then((response) => {
      console.log('Successfully sent message:', response);
    })
    .catch((error) => {
      console.log('Error sending message:', error);
    });
}
