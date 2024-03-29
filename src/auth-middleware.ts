import { auth } from './firebase-service';

const getAuthToken = (req: any, res: any, next: any) => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    req.authToken = req.headers.authorization.split(' ')[1];
  } else {
    req.authToken = null;
  }
  next();
};

export const checkIfAuthenticated = (req: any, res: any, next: any) => {
  getAuthToken(req, res, async () => {
    try {
      const { authToken } = req;
      const userInfo = await auth().verifyIdToken(authToken);
      req.authId = userInfo.uid;
      return next();
    } catch (e) {
      return res.status(401).send({ error: 'You are not authorized to make this request' });
    }
  });
};

export const checkIfAdmin = (req: any, res: any, next: any) => {
  getAuthToken(req, res, async () => {
    try {
      const { authToken } = req;
      const userInfo = await auth().verifyIdToken(authToken);
      if (userInfo.admin === true) {
        req.authId = userInfo.uid;
        return next();
      }

      throw new Error('unauthorized');
    } catch (e) {
      return res.status(401).send({ error: 'You are not authorized to make this request' });
    }
  });
};
