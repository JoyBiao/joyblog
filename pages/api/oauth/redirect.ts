import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { Cookie } from 'next-cookie';
import { ironOptions } from 'config/index';
import { ISession } from 'pages/api/index';
import request from 'service/fetch';
import { setCookie } from 'utils/index';
import { prepareConnection } from 'db/index';
import { User, UserAuth } from 'db/entity/index';

export default withIronSessionApiRoute(redirect, ironOptions);


async function redirect(req: NextApiRequest, res: NextApiResponse) {
  const session: ISession = req.session;
  // http://localhost:3000/api/oauth/redirect?code=xxxxx
  const { code } = req?.query || {};
  console.log(111111);
  console.log(code);
  const githubClientID = '911f0816c64787ba8381';
  const githubSecrect = '97533b709a6520bfe2be6cf340ade2bb0ad3c4a9';
  const url = `https://github.com/login/oauth/access_token?client_id=${githubClientID}&client_secret=${githubSecrect}&code=${code}`;

  const result = await request.post(
    url,
    {},
    {
      headers: {
        accept: 'application/json',
      },
    }
  );

  const { access_token } = result as any;
  console.log("222222")
  console.log(access_token)

  const githubUserInfo = await request.get('https://api.github.com/user', {
    headers: {
      accept: 'application/json',
      Authorization: `token ${access_token}`
    }
  })
  
  console.log("333333")
  console.log(githubUserInfo)

  const cookies = Cookie.fromApiRoute(req, res);
  const db = await prepareConnection();
  const userAuth = await db.getRepository(UserAuth).findOne({
    identity_type: 'github',
    identifier: githubClientID
  }, {
    relations: ['user']
  });

  if (userAuth) {
    // 之前登录过的用户，直接从 user 里面获取用户信息，并且更新 credential
    const user = userAuth.user;
    const { id, nickname, avatar } = user;

    userAuth.credential = access_token;

    session.userId = id;
    session.nickname = nickname;
    session.avatar = avatar;

    await session.save();
    setCookie(cookies, { id, nickname, avatar });

    res.writeHead(302, {
      Location: '/'
    });
    console.log(555555)
  } else {
    // Create a new user
    console.log(444444)
    const { login = '', avatar_url = '' } = githubUserInfo as any;
    const user = new User();
    user.nickname = login;
    user.avatar = avatar_url;

    const userAuth = new UserAuth();
    userAuth.identity_type = 'github';
    userAuth.identifier = githubClientID;
    userAuth.credential = access_token;
    userAuth.user = user;

    const userAuthRepo = db.getRepository(UserAuth);
    const resUserAuth = await userAuthRepo.save(userAuth);

    const { id, nickname, avatar } = resUserAuth?.user || {};
    session.userId = id;
    session.nickname = nickname;
    session.avatar = avatar;

    await session.save();

    setCookie(cookies, { id, nickname, avatar });

    res.writeHead(302, {
      Location: '/'
    });
  }
}
