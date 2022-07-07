import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { Cookie } from 'next-cookie';
import { ironOptions } from 'config/index';
import { ISession } from 'pages/api/index';
import { setCookie } from 'utils/index';
import { prepareConnection } from 'db/index';
import { User, UserAuth } from 'db/entity/index';

export default withIronSessionApiRoute(login, ironOptions);

async function login(req: NextApiRequest, res: NextApiResponse) {
  const session: ISession = req.session;
  const cookies = Cookie.fromApiRoute(req, res);
  const { phone = '', identity_type = 'phone' } = req.body;
  const db = await prepareConnection();
  const userAuthRepo = db.getRepository(UserAuth);

  // if (String(session.verifyCode) === String(verify)) {
 
    const userAuth = await userAuthRepo.findOne(
      {
        identity_type,
        identifier: phone,
      },
      {
        relations: ['user'],
      }
    );

    if (userAuth) {
      // existing user
      const user = userAuth.user;
      const { id, nickname, avatar } = user;

      session.userId = id;
      session.nickname = nickname;
      session.avatar = avatar;

      await session.save();

      setCookie(cookies, { id, nickname, avatar });

      res?.status(200).json({
        code: 0,
        msg: 'Login successfully',
        data: {
          userId: id,
          nickname,
          avatar,
        },
      });
    } else {
      // new user
      const user = new User();
      user.nickname = `User_${Math.floor(Math.random() * 10000)}`;
      user.avatar = '/images/avatar.jpg';
      user.job = 'null';
      user.introduce = 'null';

      const userAuth = new UserAuth();
      userAuth.identifier = phone;
      userAuth.identity_type = identity_type;
      userAuth.credential = session.verifyCode;
      userAuth.user = user;

      const resUserAuth = await userAuthRepo.save(userAuth);
      const {
        user: { id, nickname, avatar },
      } = resUserAuth;

      session.userId = id;
      session.nickname = nickname;
      session.avatar = avatar;

      await session.save();

      setCookie(cookies, { id, nickname, avatar });

      res?.status(200).json({
        code: 0,
        msg: 'Login successfully',
        data: {
          userId: id,
          nickname,
          avatar,
        },
      });
    }
  // } else {
  //   res?.status(200).json({ code: -1, msg: 'Incorrect verification code' });
  // }
}
