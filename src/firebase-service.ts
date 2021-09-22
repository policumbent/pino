import * as admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://policumbent-2021-default-rtdb.firebaseio.com',
  // projectId: 'policumbent-2021',
});

export default admin;
