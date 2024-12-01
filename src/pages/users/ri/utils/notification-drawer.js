import React from 'react';
import { Drawer, List, Typography, Button } from 'antd';

const { Text } = Typography;

const NotificationDrawer = ({ visible, onClose, notifications, setNotifications }) => {
  const markAsRead = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) => ({ ...notification, read: true }))
    );
  };

  return (
    <Drawer
      title="Notifications"
      placement="right"
      onClose={onClose}
      open={visible}
      extra={
        <Button onClick={markAllAsRead}>Mark all as read</Button>
      }
    >
      <List
        itemLayout="horizontal"
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button key="read" onClick={() => markAsRead(item.id)} disabled={item.read}>
                {item.read ? 'Read' : 'Mark as read'}
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={<Text strong={!item.read}>{item.message}</Text>}
            />
          </List.Item>
        )}
      />
    </Drawer>
  );
};

export default NotificationDrawer;
