import React, { useState } from 'react';
import { Button, Drawer, Avatar, Typography, Menu } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function RiHeader({ userData, logout }) {
    const [drawerVisible, setDrawerVisible] = useState(false);

    return (
        <div className="flex justify-between items-center p-4 bg-white shadow-sm" style={{
            position: 'fixed',
            top: 35,
            right: 90,
            left: 250,  // Width of the sidebar
            zIndex: 1000,
            height: '64px'
        }}>
            <div>
                <Title level={4} style={{ margin: 0 }}>MRO Dashboard</Title>
            </div>
            <div>
                <Button 
                    type="text" 
                    icon={<Avatar icon={<UserOutlined />} />}
                    onClick={() => setDrawerVisible(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    {userData?.full_name || 'Profile'}
                </Button>
            </div>

            <Drawer
                title="Profile"
                placement="right"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                width={300}
            >
                <div className="flex flex-col gap-4">
                    <div className="flex justify-center mb-4">
                        <Avatar size={64} icon={<UserOutlined />} />
                    </div>
                    <div className="text-center mb-4">
                        <Title level={4}>{userData?.full_name}</Title>
                        <p>{userData?.email}</p>
                    </div>
                    <Menu
                        mode="vertical"
                        items={[
                            {
                                key: 'profile',
                                label: 'View Profile',
                                icon: <UserOutlined />,
                            },
                            {
                                key: 'logout',
                                label: 'Logout',
                                danger: true,
                                onClick: () => {
                                    logout();
                                    setDrawerVisible(false);
                                }
                            }
                        ]}
                    />
                </div>
            </Drawer>
        </div>
    );
}
