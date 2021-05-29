import admin from './firebase-service';

export const createUser = async (req: any, res: any) => {
    const {
      email,
      password,
      firstName,
      lastName
    } = req.body;

    const user = await admin.auth().createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    return res.send(user);
  }

  const getAuthToken = (req: any, res: any, next: any) => {
    if (
      req.headers.authorization &&
      req.headers.authorization.split(' ')[0] === 'Bearer'
    ) {
      req.authToken = req.headers.authorization.split(' ')[1];
    } else {
      req.authToken = null;
    }
    next();
  };


  export const checkIfAuthenticated = (req: any, res: any, next: any) =>{
   getAuthToken(req, res, async () => {
      try {
        const { authToken } = req;
        const userInfo = await admin
          .auth()
          .verifyIdToken(authToken);
        req.authId = userInfo.uid;
        return next();
      } catch (e) {
        return res
          .status(401)
          .send({ error: 'You are not authorized to make this request' });
      }
    });
  };