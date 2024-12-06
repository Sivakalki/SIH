import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Space, Typography, message, Card, Drawer, Avatar, Modal, Form, Input, Spin, Descriptions } from 'antd';
import { EyeOutlined, UserOutlined, LogoutOutlined, FileTextOutlined } from '@ant-design/icons';
import axios from 'axios';
import { UserContext } from '../../../components/userContext';
import { useNavigate } from 'react-router-dom';
import SvroLayout from '../../../components/layout/SvroLayout';

const { Title } = Typography;

export default function PendingApplications() {
    const [applications, setApplications] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [userLoading, setUserLoading] = useState(true);
    const [role, setRole] = useState("");
    const [userData, setUserData] = useState(null);
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
        if (userData && role && role !== "SVRO") {
            setErrorMessage("Access denied. Only SVROs are allowed to view this page.");
            setUserLoading(false);
        }
    }, [role]);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/svro/pending_applications`, {
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

    if (userLoading) {
        return (
            <SvroLayout logout={logout}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
                    <Spin size="large" />
                    <Title level={3} style={{ marginTop: '20px' }}>Loading...</Title>
                </div>
            </SvroLayout>
        );
    }

    if (errorMessage) {
        return (
            <SvroLayout logout={logout}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
                    <Title level={3} style={{ color: '#f5222d' }}>{errorMessage}</Title>
                    <Button type="primary" onClick={() => navigate('/login')}>Go to Login</Button>
                </div>
            </SvroLayout>
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
            title: 'Current Stage',
            dataIndex: 'current_stage',
            key: 'current_stage',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <span style={{
                    color: '#faad14',
                    textTransform: 'capitalize',
                    fontWeight: 'bold',
                }}>
                    Pending
                </span>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button
                    icon={<EyeOutlined />}
                    onClick={() => handleViewApplication(record)}
                >
                    View Details
                </Button>
            ),
        },
    ];

    const handleViewApplication = (application) => {
        setSelectedApplication(application);
        setModalVisible(true);
    };

    return (
        <SvroLayout logout={logout}>
            <div className="pending-applications">
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <Title level={2} style={{ margin: 0, color: '#1890ff' }}>Pending Applications</Title>
                        <Button onClick={() => navigate('/svro')}>Back to Dashboard</Button>
                    </div>
                    <Table
                        columns={columns}
                        dataSource={applications}
                        rowKey="application_id"
                        pagination={{ pageSize: 10 }}
                        loading={loading}
                    />
                </Card>

                <Modal
                    title={<Title level={3}>Application Details</Title>}
                    visible={modalVisible}
                    onCancel={() => setModalVisible(false)}
                    footer={null}
                    width={800}
                >
                    {selectedApplication && (
                        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            <Card title="Applicant Information" style={{ marginBottom: '16px' }}>
                                <Descriptions column={2}>
                                    <Descriptions.Item label="Full Name">{selectedApplication.full_name}</Descriptions.Item>
                                    <Descriptions.Item label="Application ID">{selectedApplication.application_id}</Descriptions.Item>
                                    <Descriptions.Item label="Status">Pending</Descriptions.Item>
                                    <Descriptions.Item label="Current Stage">{selectedApplication.current_stage}</Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </div>
                    )}
                </Modal>
            </div>
        </SvroLayout>
    );
}
