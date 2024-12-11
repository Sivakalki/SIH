import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Space, Typography, message, Card, Spin, Empty, Badge, Drawer, Avatar } from 'antd';
import { EyeOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import { UserContext } from '../../../components/userContext';
import { useNavigate } from 'react-router-dom';
import MvroLayout from '../../../components/layout/MvroLayout';
import MvroApplicationModal from '../../../components/modals/MvroApplicationModal';

const { Title } = Typography;

export default function PendingApplicationsMVRO() {
    const [applications, setApplications] = useState([]);
    const [selectedApplicationId, setSelectedApplicationId] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [userLoading, setUserLoading] = useState(true);
    const [role, setRole] = useState("");
    const [userData, setUserData] = useState(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const { token, logout } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setErrorMessage("You are not logged in. Please log in to access this page.");
            setUserLoading(false);
            return;
        }
        fetchData();
        fetchApplications();
    }, [token]);

    useEffect(() => {
        if (userData && role && role !== "MVRO") {
            setErrorMessage("Access denied. Only MVROs are allowed to view this page.");
            setUserLoading(false);
        }
    }, [role]);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/mvro/ready_to_review`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setApplications(response.data.data);
        } catch (error) {
            message.error('Failed to fetch applications');
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/users/user`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUserData(res.data.user);
            setRole(res.data.role);
        } catch (e) {
            setErrorMessage("Token expired. Login again");
            console.error('Error getting profile details:', e);
            setUserData(null);
        } finally {
            setUserLoading(false);
        }
    };

    const handleViewApplication = (applicationId) => {
        setSelectedApplicationId(applicationId);
        setModalVisible(true);
    };

    const handleApiError = (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                message.error('Session expired. Please login again.');
                return true;
            }
            message.error(error.response.data.message || 'An error occurred');
        } else if (error.request) {
            message.error('Network error. Please check your connection.');
        } else {
            message.error('An error occurred');
        }
        return false;
    };

    if (userLoading) {
        return (
            <MvroLayout logout={logout}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
                    <Spin size="large" />
                    <Title level={3} style={{ marginTop: '20px' }}>Loading...</Title>
                </div>
            </MvroLayout>
        );
    }

    if (errorMessage) {
        return (
            <MvroLayout logout={logout}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
                    <Title level={3} style={{ color: '#f5222d' }}>{errorMessage}</Title>
                    <Button type="primary" onClick={() => navigate('/login')}>Go to Login</Button>
                </div>
            </MvroLayout>
        );
    }

    const columns = [
        {
            title: 'Application ID',
            dataIndex: 'application_id',
            key: 'id',
        },
        {
            title: 'Name',
            dataIndex: 'full_name',
            key: 'name',
        },
        {
            title: 'Address',
            key: 'address',
            render: (_, record) => (
                <span>
                    {record.address ? `${record.address.address}, ${record.address.district}, ${record.address.state}` : 'N/A'}
                </span>
            ),
        },
        {
            title: 'Caste',
            key: 'caste',
            render: (_, record) => (
                <span>
                    {record.caste ? record.caste.caste_type : 'N/A'}
                </span>
            ),
        },
        {
            title: 'Current Stage',
            key: 'current_stage',
            render: (_, record) => (
                <span>
                    {record.current_stage ? record.current_stage.role_type : 'N/A'}
                </span>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button
                    icon={<EyeOutlined />}
                    onClick={() => handleViewApplication(record.application_id)}
                    type="primary"
                >
                    Review
                </Button>
            ),
        },
    ];

    return (
        <MvroLayout logout={logout}>
            <div className="pending-applications" style={{ padding: '24px' }}>
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <Title level={2} style={{ margin: 0, color: '#1890ff' }}>Ready to Review Applications</Title>
                        <Space>
                            <Button onClick={() => navigate('/mvro')}>Back to Dashboard</Button>
                            <Button icon={<UserOutlined />} onClick={() => setDrawerVisible(true)}>Profile</Button>
                        </Space>
                    </div>
                    
                    {applications.length === 0 ? (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <span style={{ color: '#666' }}>
                                    No applications are currently ready for review.
                                    <br />
                                    New applications will appear here when they are assigned to you.
                                </span>
                            }
                        >
                            <Button type="primary" onClick={() => navigate('/mvro')}>
                                Return to Dashboard
                            </Button>
                        </Empty>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={applications}
                            rowKey="application_id"
                            pagination={{ 
                                pageSize: 10,
                                showTotal: (total) => `Total ${total} applications`
                            }}
                            loading={loading}
                        />
                    )}
                </Card>

                <MvroApplicationModal
                    visible={modalVisible}
                    applicationId={selectedApplicationId}
                    onCancel={() => {
                        setModalVisible(false);
                        setSelectedApplicationId(null);
                    }}
                    onUpdate={fetchApplications}
                />

                <Drawer
                    title="User Profile"
                    placement="right"
                    onClose={() => setDrawerVisible(false)}
                    open={drawerVisible}
                >
                    {userData && (
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <Avatar size={64} icon={<UserOutlined />} />
                                <div>
                                    <h2 className="text-xl font-semibold">{userData.name}</h2>
                                    <p className="text-gray-500">{role}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p>{userData.email}</p>
                            </div>
                        </div>
                    )}
                </Drawer>
            </div>
        </MvroLayout>
    );
}
