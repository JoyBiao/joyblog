import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Form, Input, Button, message } from 'antd';
import request from 'service/fetch';
import styles from './index.module.scss';

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 4 },
};

const UserProfile = () => {
  const [form] = Form.useForm();

  useEffect(() => {
    request.get('/api/user/detail').then((res: any) => {
      if (res?.code === 0) {
        console.log(333333);
        console.log(res?.data?.userInfo);
        form.setFieldsValue(res?.data?.userInfo);
      }
    });
  }, [form]);

  const handleSubmit = (values: any) => {
    console.log(99999);
    console.log(values);
    request.post('/api/user/update', { ...values }).then((res: any) => {
      if (res?.code === 0) {
        message.success('Modify successfully');
      } else {
        message.error(res?.msg || 'Modify unsuccessfully');
      }
    });
  };

  return (
    <div className="content-layout">
      <div className={styles.userProfile}>
        <h2>Personal information</h2>
        <div>
          <Form
            {...layout}
            form={form}
            className={styles.form}
            onFinish={handleSubmit}
          >
            <Form.Item label="Username" name="nickname">
              <Input placeholder="Please enter username" />
            </Form.Item>
            <Form.Item label="Job" name="job">
              <Input placeholder="Please enter job" />
            </Form.Item>
            <Form.Item label="Introduction" name="introduce">
              <Input placeholder="Please enter personal introduction" />
            </Form.Item>
            <Form.Item {...tailLayout}>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default observer(UserProfile);
