import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Typography, message, Card, Modal, Descriptions, Spin, Tag, Drawer, Avatar } from 'antd';
import { EyeOutlined, FileTextOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { UserContext } from '../../../components/userContext';
import StatisticCard from './utils/statistic-card';
import SvroLayout from '../../../components/layout/SvroLayout';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

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

export default function MyReports() {
    const [applications, setApplications] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [userLoading, setUserLoading] = useState(true);
    const [role, setRole] = useState("");
    const [modalLoading, setModalLoading] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
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
        fetchReports();
    }, [token]); // token is stable and from context

    useEffect(() => {
        if (role && role !== "SVRO") {
            setErrorMessage("Access denied. Only SVROs are allowed to view this page.");
            setUserLoading(false);
        }
    }, [role]);

    const fetchData = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/users/user`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setRole(res.data.role);
            setUserData(res.data.user);
        } catch (e) {
            if (handleApiError(e)) return;
            setErrorMessage("Token expired. Login again");
            console.error('Error getting profile details:', e);
        } finally {
            setUserLoading(false);
        }
    };

    const fetchReports = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/svro/get_reports`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setApplications(response.data.data);
        } catch (error) {
            if (handleApiError(error)) return;
            message.error('Failed to fetch reports');
        } finally {
            setLoading(false);
        }
    };

    const handleViewReport = async (report) => {
        setModalVisible(true);
        setModalLoading(true);
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/svro/get_report/${report.report_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setSelectedApplication(response.data.data); // Access the data property from response
        } catch (error) {
            if (handleApiError(error)) return;
            message.error('Failed to fetch report details');
        } finally {
            setModalLoading(false);
        }
    };

    const openDrawer = () => {
        setDrawerVisible(true);
    };

    const closeDrawer = () => {
        setDrawerVisible(false);
    };

    const columns = [
        {
            title: 'Report ID',
            dataIndex: 'report_id',
            key: 'report_id',
        },
        {
            title: 'Application ID',
            dataIndex: 'application_id',
            key: 'application_id',
        },
        {
            title: 'Applicant Name',
            dataIndex: 'applicant_name',
            key: 'applicant_name',
        },
        {
            title: 'Created At',
            dataIndex: 'created_time',
            key: 'created_time',
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'completed' ? 'green' : 'blue'}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewReport(record)}
                >
                    View
                </Button>
            ),
        },
    ];

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

    return (
        <SvroLayout logout={logout}>
            <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <Title level={2} style={{ margin: 0, color: '#1890ff' }}>My Reports</Title>
                    <Button type="text" onClick={openDrawer} icon={<UserOutlined />} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <StatisticCard
                        title="Total Reports"
                        value={applications.length}
                        icon={<FileTextOutlined style={{ color: '#1890ff' }} />}
                        backgroundColor="#e6f7ff"
                        borderColor="#91d5ff"
                        textColor="#1890ff"
                    />
                    <StatisticCard
                        title="Completed Reports"
                        value={applications.filter(app => app.status.toUpperCase() === 'COMPLETED').length}
                        icon={<FileTextOutlined style={{ color: '#52c41a' }} />}
                        backgroundColor="#f6ffed"
                        borderColor="#b7eb8f"
                        textColor="#52c41a"
                    />
                    <StatisticCard
                        title="Pending Reports"
                        value={applications.filter(app => app.status.toUpperCase() === 'PENDING').length}
                        icon={<FileTextOutlined style={{ color: '#faad14' }} />}
                        backgroundColor="#fff7e6"
                        borderColor="#ffd591"
                        textColor="#faad14"
                    />
                </div>

                <Card className="shadow-md">
                    <Table
                        columns={columns}
                        dataSource={applications}
                        rowKey="id"
                        loading={loading}
                    />
                </Card>

                <Modal
                    visible={modalVisible}
                    title="Report Details"
                    onCancel={() => {
                        setModalVisible(false);
                        setSelectedApplication(null);
                    }}
                    footer={null}
                    width={800}
                >
                    {modalLoading ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <Spin size="large" />
                        </div>
                    ) : selectedApplication ? (
                        <Descriptions bordered column={2}>
                            <Descriptions.Item label="Report ID" span={2}>
                                {selectedApplication.report_id}
                            </Descriptions.Item>
                            <Descriptions.Item label="Application ID" span={2}>
                                {selectedApplication.application_id}
                            </Descriptions.Item>
                            <Descriptions.Item label="Applicant Name" span={2}>
                                {selectedApplication.applicant_name}
                            </Descriptions.Item>
                            <Descriptions.Item label="Status" span={2}>
                                <span style={{
                                    color: selectedApplication.status === 'PENDING' ? '#faad14' : '#52c41a',
                                    textTransform: 'capitalize',
                                    fontWeight: 'bold',
                                }}>
                                    {selectedApplication.status}
                                </span>
                            </Descriptions.Item>
                            <Descriptions.Item label="Description" span={2}>
                                {selectedApplication.description}
                            </Descriptions.Item>
                        </Descriptions>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            No report data available
                        </div>
                    )}
                </Modal>

                <Drawer
                    title="Profile"
                    placement="right"
                    onClose={closeDrawer}
                    open={drawerVisible}
                    width={400}
                >
                    {userData && (
                        <>
                            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                <Avatar size={64} icon={<UserOutlined />} />
                                <Title level={4} style={{ marginTop: '16px', marginBottom: '4px' }}>{userData.name}</Title>
                                <Tag color="blue">{role}</Tag>
                            </div>
                            <Descriptions bordered column={1}>
                                <Descriptions.Item label="Email">{userData.email}</Descriptions.Item>
                                <Descriptions.Item label="Phone">{userData.phone || 'Not provided'}</Descriptions.Item>
                                <Descriptions.Item label="Department">{userData.department || 'Not provided'}</Descriptions.Item>
                            </Descriptions>
                            <div style={{ marginTop: '24px', textAlign: 'center' }}>
                                <Button type="primary" danger icon={<LogoutOutlined />} onClick={logout}>
                                    Logout
                                </Button>
                            </div>
                        </>
                    )}
                </Drawer>
            </div>
        </SvroLayout>
    );
}
