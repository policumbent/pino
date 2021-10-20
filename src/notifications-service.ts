import admin from './firebase-service';

export async function getTokens(appName: string){
    const db = admin.database();

    const tokens = await (await db.ref(`notifications/${appName}`).get()).val();
    const tokensIt: string [] = [];
    const tokensEn: string [] = [];

    for (const token of Object.keys(tokens))
      tokens[token].lang === 'it' ? tokensIt.push(token) : tokensEn.push(token)

    return({
      tokensIt,
      tokensEn
    })
};

export async function sendNotifications(tokens: string[], title: string, body: string): Promise<void> {
    const payload = {
        notification: {
            title,
            body
        }
    }
    const options = {
        priority: 'high',
        timeToLive: 60 * 60 * 3
      };
    return admin.messaging().sendToDevice(tokens, payload, options)
      .then(response => {
        console.log("Successfully sent message:", response);
      })
      .catch(error => {
        console.log("Error sending message:", error);
      });
}