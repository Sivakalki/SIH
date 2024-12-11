import React, { useState, useEffect, useContext } from 'react';
import { Table, Select, Button, Space, Typography, message, Card, Drawer, Avatar, Modal, Badge, Spin, Descriptions, Form, Input, Tag } from 'antd';
import { EyeOutlined, UserOutlined, LogoutOutlined, FileTextOutlined, BellOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import { Link } from 'react-router-dom';
import StatisticCard from './utils/statistic-card';
import NotificationDrawer from './utils/notification-drawer';
import { UserContext } from '../../../components/userContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MvroLayout from '../../../components/layout/MvroLayout';
import MvroApplicationModal from '../../../components/modals/MvroApplicationModal';
import { motion } from 'framer-motion';

const { Title } = Typography;
const { Option } = Select;

const NavItem = ({ to, children, isActive, onClick }) => (
    <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`px-4 py-2 rounded-md cursor-pointer ${isActive ? 'bg-secondary text-white' : 'text-white hover:bg-secondary/10'}`}
        onClick={onClick} // Attach onClick for navigation
    >
        <Link to={to}>{children}</Link>
    </motion.div>
);

// Mock notifications data
const mockNotifications = [
    { id: 1, message: 'New application submitted', read: false },
    { id: 2, message: 'Application #1234 approved', read: true },
    { id: 3, message: 'Reminder: Review pending applications', read: false },
];

export default function ApplicationsMvro() {
    const [applications, setApplications] = useState([]);
    const [selectedApplicationId, setSelectedApplicationId] = useState(null);
    const [profileDrawerVisible, setProfileDrawerVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [notificationDrawerVisible, setNotificationDrawerVisible] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [userData, setUserData] = useState(null);
    const [notifications, setNotifications] = useState(mockNotifications);
    const { token, logout } = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [userLoading, setUserLoading] = useState(true);
    const [activeNavItem, setActiveNavItem] = useState('applications');
    const [role, setRole] = useState("");
    const navigate = useNavigate();
    const [filterStatus, setFilterStatus] = useState('All');
    const [loadingApplicationId, setLoadingApplicationId] = useState(null);
    const [report, SetReport] = useState([]);
    const [remarksDrawerVisible, setRemarksDrawerVisible] = useState(false);
    const [filter, setFilter] = useState('All');

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
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/mvro/pending_applications`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Include token in Authorization header
                },
            });
            console.log(response.data, " are the applications")
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
                    Authorization: `Bearer ${token}`, // Include token in Authorization header
                },
            });
            setUserData(res.data.user);
            setRole(res.data.role);
            console.log(res, " is the response data")
        } catch (e) {
            setErrorMessage("Token expired. Login again")
            console.error('There is an error in getting profile details', e);
            setUserData(null); // Reset userData if the request fails
        } finally {
            setUserLoading(false); // Stop loading after data is fetched
        }
    };
    if (userLoading) {
        // Display a loading spinner while user data is being fetched
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
                <Spin size="large" />
                <Title level={3} style={{ marginTop: '20px' }}>Loading...</Title>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
                <Title level={3} style={{ color: '#f5222d' }}>{errorMessage}</Title>
                {<Button type="primary" onClick={() => navigate('/login')}>Go to Login</Button>}
            </div>
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
            title: 'Status',
            dataIndex: 'current_stage',
            key: 'current_stage',
            render: (status) => (
                <span style={{
                    color: status === 'MVRO' ? '#faad14' : status === 'SVRO' ? '#f5222d' : '#52c41a',
                    textTransform: 'capitalize',
                    fontWeight: 'bold',
                }}>
                    {status}
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
                    loading={loadingApplicationId === record.application_id}
                >
                    View Full Application
                </Button>
            ),
        },
    ];

    const handleViewApplication = (id) => {
        setSelectedApplicationId(id);
        setModalVisible(true);
    };

    const openDrawer = () => {
        setDrawerVisible(true);
    };

    const closeDrawer = () => {
        setDrawerVisible(false);
    };

    const openRemarksForm = () => {
        setRemarksDrawerVisible(true);
    };

    const openProfileDrawer = () => {
        setProfileDrawerVisible(true);
    };

    const closeProfileDrawer = () => {
        setProfileDrawerVisible(false);
    };

    const openNotificationDrawer = () => {
        setNotificationDrawerVisible(true);
    };

    const closeNotificationDrawer = () => {
        setNotificationDrawerVisible(false);
    };

    const handleFilterChange = (value) => {
        setFilterStatus(value);
    };

    const filteredApplications = applications.filter(app =>
        filterStatus === 'All' || app.role_type === filterStatus
    );

    const filteredApplicationsByStage = applications.filter(application => {
        return filter === 'All' || application.current_stage === filter;
    });

    const submitRemarks = async (values) => {
        try {
            console.log(values);
            await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/mvro/create_report/${selectedApplicationId}`,
                { description: values.remarks }, 
                 // This is the request body
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            message.success('Remarks submitted successfully');
            setModalVisible(false);
            fetchApplications(); // Refresh the applications list
        } catch (error) {
            console.error('Error submitting remarks:', error);
            message.error('Failed to submit remarks');
        }
    };

    const unreadNotificationsCount = notifications.filter(n => !n.read).length;
    const handleNavigate = (path) => {
        const basePath = "/mvro"; // Define your base path
        if (path === 'dashboard') {
            console.log("ented here")
            navigate(`${basePath}`)
        } else {
            console.log("NEthered herre")
            navigate(`${basePath}/${path}`);
        }
    }

    const handleFilterChangeStage = (value) => {
        setFilter(value);
    };

    return (
        <MvroLayout logout={logout}>
            <div style={{ padding: '24px' }}>
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <Title level={2}>Applications</Title>
                        <Button icon={<UserOutlined />} onClick={openDrawer}>Profile</Button>
                    </div>
                    <Select
                        placeholder="Select Current Stage"
                        onChange={handleFilterChangeStage}
                        defaultValue="All"
                        style={{ width: 200, marginBottom: 20 }}
                    >   
                        <Option value="All">All</Option>
                        <Option value="MVRO">MVRO</Option>
                        <Option value="SVRO">SVRO</Option>
                        <Option value="RI">RI</Option>
                        <Option value="MRO">MRO</Option>
                    </Select>
                    <Table
                        columns={columns}
                        dataSource={filter === 'All' ? applications : filteredApplicationsByStage}
                        loading={loading}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Total ${total} items`,
                        }}
                    />
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
                    onClose={closeDrawer}
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
