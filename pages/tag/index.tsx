import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Tabs, Button, message } from 'antd';
import * as ANTD_ICONS from '@ant-design/icons';
import { useStore } from 'store/index';
import request from 'service/fetch';
import styles from './index.module.scss';

const { TabPane } = Tabs;

interface IUser {
  id: number;
  nickname: string;
  avatar: string;
}

interface ITag {
  id: number;
  title: string;
  icon: string;
  follow_count: number;
  article_count: number;
  users: IUser[];
}

const Tag = () => {
  const store = useStore();
  const [followTags, setFollowTags] = useState<ITag[]>();
  const [allTags, setAllTags] = useState<ITag[]>();
  const [needRefresh, setNeedRefresh] = useState(false);
  const { userId } = store?.user?.userInfo || {};

  useEffect(() => {
    request('/api/tag/get').then((res: any) => {
      if (res?.code === 0) {
        const { followTags = [], allTags = [] } = res?.data || {};
        setFollowTags(followTags);
        setAllTags(allTags);
      }
    })
  }, [needRefresh]);

  const handleUnFollow = (tagId: number) => {
    request.post('/api/tag/follow', {
      type: 'unfollow',
      tagId
    }).then((res: any) => {
      if (res?.code === 0) {
        message.success('unfollow successfully');
        setNeedRefresh(!needRefresh);
      } else {
        message.error(res?.msg || 'unfollow unsuccessfully');
      }
    })
  }

  const handleFollow = (tagId: number) => {
    request.post('/api/tag/follow', {
      type: 'follow',
      tagId
    }).then((res: any) => {
      if (res?.code === 0) {
        message.success('follow successfully');
        setNeedRefresh(!needRefresh);
      } else {
        message.error(res?.msg || 'follow unsuccessfully');
      }
    })
  }

  return (
    <div className='content-layout'>
      <Tabs defaultActiveKey="all">
        <TabPane tab="Followed tags" key="follow" className={styles.tags}>
          {
            followTags?.map(tag => (
              <div key={tag?.title} className={styles.tagWrapper}>
                <div>{(ANTD_ICONS as any)[tag?.icon]?.render()}</div>
                <div className={styles.title}>{tag?.title}</div>
                <div>{tag?.follow_count} Follow {tag?.article_count} Article</div>
                {
                  tag?.users?.find((user) => Number(user?.id) === Number(userId)) ? (
                    <Button type='primary' onClick={() => handleUnFollow(tag?.id)}>Following</Button>
                  ) : (
                    <Button onClick={() => handleFollow(tag?.id)}>Follow</Button>
                  )
                }
              </div>
            ))
          }
        </TabPane>
        <TabPane tab="All tags" key="all" className={styles.tags}>
        {
            allTags?.map(tag => (
              <div key={tag?.title} className={styles.tagWrapper}>
                <div>{(ANTD_ICONS as any)[tag?.icon]?.render()}</div>
                <div className={styles.title}>{tag?.title}</div>
                <div>{tag?.follow_count} Follow {tag?.article_count} Article</div>
                {
                  tag?.users?.find((user) => Number(user?.id) === Number(userId)) ? (
                    <Button type='primary' onClick={() => handleUnFollow(tag?.id)}>Following</Button>
                  ) : (
                    <Button onClick={() => handleFollow(tag?.id)}>Follow</Button>
                  )
                }
              </div>
            ))
          }
        </TabPane>
      </Tabs>
    </div>
  );
};

export default observer(Tag);
