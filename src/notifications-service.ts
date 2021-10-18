import e from 'express';
import admin from './firebase-service';

export async function getTokens(appName: string){
    const db = admin.database();
    const tokens = db.ref(`notifications/test`).get();
    const tokensIt = [];
    const tokensEn = [];
    console.log(tokens);
    return(tokens)
};

function sendNotifications(tokens: string[], title: string, body: string): void {
    const payload = {
        notification: {
            title,
            body
        }
    }
    const options = {
        priority: "medium",
        timeToLive: 60 * 60 * 3
      };
    admin.messaging().sendToDevice(tokens, payload, options)
      .then(function(response) {
        console.log("Successfully sent message:", response);
      })
      .catch(function(error) {
        console.log("Error sending message:", error);
      });
}