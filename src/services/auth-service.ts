import { auth } from './firebase/firebase-service';

export const createUser = async (req: any, res: any) => {
  const { email, password, firstName, lastName } = req.body;

  const user = await auth().createUser({
    email,
    password,
    displayName: `${firstName} ${lastName}`,
  });

  return res.send(user);
};

export const setUserAdmin = async (req: any, res: any, value: boolean) => {
  const { email } = req.body;

  if (!email || email.length < 1) return res.status(400).json({ msg: 'Email required' });

  auth()
    .getUserByEmail(email)
    .catch((err) => {
      res.status(400).json({ msg: 'User not found' });
    })
    .then((user: any) => {
      return auth().setCustomUserClaims(user.uid, {
        admin: value,
      });
    })
    .then(() => {
      res
        .status(200)
        .json({ msg: value ? `${email} is now admin` : `${email} removed from admin` });
    })
    .catch((err) => {
      res.status(500).json({ msg: 'Server error' });
    });
};
