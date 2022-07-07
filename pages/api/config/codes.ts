export const EXCEPTION_USER = {
  NOT_LOGIN: {
    code: 1001,
    msg: 'not login',
  },
  NOT_FOUND: {
    code: 1002,
    msg: 'Cannot find the user',
  },
};

export const EXCEPTION_ARTICLE = {
  PUBLISH_FAILED: {
    code: 2001,
    msg: 'Post article unsuccessfully',
  },
  UPDATE_FAILED: {
    code: 2002,
    msg: 'Update article unsuccessfully',
  },
  NOT_FOUND: {
    code: 2003,
    msg: 'Cannot find the article',
  },
};

export const EXCEPTION_TAG = {
  FOLLOW_FAILED: {
    code: 3001,
    msg: 'Fail to follow/unfollow',
  },
};

export const EXCEPTION_COMMENT = {
  PUBLISH_FAILED: {
    code: 4001,
    msg: 'Post unsuccessfully',
  },
};
