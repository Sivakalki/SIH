import React, { useState, useEffect, useContext } from 'react';
import { Input, Table, Select, Button, Space, Typography, message, Card, Drawer, Avatar, Modal, Badge, Spin, Descriptions, Tag } from 'antd';
import { EyeOutlined, UserOutlined, LogoutOutlined, FileTextOutlined, BellOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import { Link } from 'react-router-dom';
import StatisticCard from './utils/statistic-card';
import NotificationDrawer from './utils/notification-drawer';
import { UserContext } from '../../../components/userContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';


const { Title } = Typography;
const { Option } = Select;

const NavItem = ({ to, children, isActive, onClick }) => (
    <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`px-4 py-2 rounded-md cursor-pointer ${isActive ? 'bg-secondary text-white' : 'text-white hover:bg-secondary/10'
            }`}
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


export default function MyReports() {
    const [applications, setApplications] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [profileDrawerVisible, setProfileDrawerVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [notificationDrawerVisible, setNotificationDrawerVisible] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [remarksDrawerVisible, setRemarksDrawerVisible] = useState(false);
    const [userData, setUserData] = useState(null);
    const [notifications, setNotifications] = useState(mockNotifications);
    const { token, logout } = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [userLoading, setUserLoading] = useState(true);
    const [activeNavItem, setActiveNavItem] = useState('myReports');
    const [role, setRole] = useState("");
    const navigate = useNavigate()
    const [filterStatus, setFilterStatus] = useState('All');
    const [loadingApplicationId, setLoadingApplicationId] = useState(null);
    const [isEditingDescription, setIsEditingDescription] = useState(false); // Manage edit state
    const [editedDescription, setEditedDescription] = useState(''); // Manage edited description value
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
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/svro/get_reports`, {
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
            title: 'Report ID',
            dataIndex: 'report_id',
            key: 'report_id',
        },
        {
            title: 'Application ID',
            dataIndex: 'application_id',
            key: 'id',
        },
        {
            title: 'Applicant Name',
            dataIndex: 'applicant_name',
            key: 'name',
        },
        {
            title: 'Any Rejections',
            dataIndex: 'rejections',
            key: 'name',
            render: (rejections) => (
                <span style={{
                    color: rejections ? '#f5222d' : '#8c8c8c', // Red for rejections, dark gray for "No Rejections"
                    fontStyle: rejections ? 'normal' : 'italic',
                }}>
                    {rejections || 'No Rejections'}
                </span>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'role_type',
            render: (status) => (
                <span style={{
                    color: status === 'pending' ? '#faad14' : status === 'completed' ? '#52c41a' : '#f5222d',
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
                    onClick={() => handleCompleteReport(record.report_id)}
                    loading={loadingApplicationId === record.application_id}
                >
                    View Complete Report
                </Button>
            ),
        },
    ];

    const handleCompleteReport = async (id) => {
        setLoadingApplicationId(id);
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/svro/get_report/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Include token in Authorization header
                },
            });
            setSelectedApplication(response.data.data);
            console.log(response.data.data, " is the selected application")
            setModalVisible(true);
        } catch (error) {
            message.error('Failed to load application details');
        } finally {
            setLoadingApplicationId(null);
        }
    };

    const openDrawer = () => {
        setDrawerVisible(true);
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

    const unreadNotificationsCount = notifications.filter(n => !n.read).length;
    const handleNavigate = (path) => {
        const basePath = "/svro2"; // Define your base path
        if (path === 'dashboard') {
            console.log("ented here")
            navigate(`${basePath}`)
        } else {
            console.log("NEthered herre")
            navigate(`${basePath}/${path}`);
        }
    }

    const submitDescriptionEdit = async (id) => {
        try {
            const response = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/svro/edit_report/${id}`,
                {
                    description: editedDescription, // Pass the data to update in the body
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include token in Authorization header
                    },
                }
            );
            setSelectedApplication((prev) => ({
                ...prev,
                description: response.data.description,
            }));
            setIsEditingDescription(false);
            message.success(response.data.message)
            // Refresh the data or update local state
        } catch (error) {
            console.log(error)
            message.error("Failed to submit report");
        }
    };
    return (
        <div className="vro-dashboard bg-background min-h-screen">
            <nav className="bg-primary text-white p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <img src="/certitrack.jpg" alt="CertiTrack Logo" className="h-8 w-8 logo" />
                    <Title level={3} className="text-white m-0">CertiTrack</Title>
                </div>
                <div className="flex items-center space-x-4">
                    <NavItem to="/dashboard" isActive={activeNavItem === 'dashboard'} onClick={() => handleNavigate('dashboard')}>Dashboard</NavItem>
                    <NavItem to="/applications" isActive={activeNavItem === 'applications'} onClick={() => handleNavigate('applications')}>Applications</NavItem>
                    <NavItem to="/field-verification" isActive={activeNavItem === 'field-verification'} onClick={() => handleNavigate('field-verification')}>Field Verification</NavItem>
                    <NavItem to="/myReports" isActive={activeNavItem === 'myReports'} onClick={() => handleNavigate('myReports')}>MyReports</NavItem>
                </div>
                <div className="flex items-center space-x-4">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button type="text" icon={<QuestionCircleOutlined />} className="text-white" />
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Badge count={unreadNotificationsCount} overflowCount={99}>
                            <Button type="text" icon={<BellOutlined />} onClick={openNotificationDrawer} className="text-white" aria-label="Notifications" />
                        </Badge>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button type="text" icon={<UserOutlined />} onClick={openProfileDrawer} className="text-white">
                            {userData?.name}
                        </Button>
                    </motion.div>
                </div>
            </nav>
            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <Title level={2} style={{ margin: 0, color: '#1890ff' }}>VRO Dashboard</Title>
                    <Space>
                        <Select
                            defaultValue="All"
                            style={{ width: 120 }}
                            onChange={handleFilterChange}
                        >
                            <Option value="All">All</Option>
                            <Option value="SVRO">SVRO</Option>
                            <Option value="MVRO">MVRO</Option>
                            <Option value="MRO">MRO</Option>
                            <Option value="RI">RI</Option>
                        </Select>
                        <Button icon={<UserOutlined />} onClick={openDrawer}>Profile</Button>
                    </Space>
                </div>
                <Table
                    columns={columns}
                    dataSource={filteredApplications}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    style={{ overflowX: 'auto' }}
                    loading={loading}
                />
            </Card>
            <Modal
                title={<Title level={3}>Full Application Details</Title>}
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={[
                    <Button key="back" onClick={() => setModalVisible(false)}>
                        Back
                    </Button>,
                ]}
                width={800}
            >
                {selectedApplication && (
                    <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '16px' }}>
                        {/* Report Description Section */}
                        <Card title="Report Details" style={{ marginBottom: '16px' }}>
                            <Descriptions column={1}>
                                <Descriptions.Item label="Description">
                                    {isEditingDescription ? (
                                        <Input.TextArea
                                            value={editedDescription}
                                            onChange={(e) => setEditedDescription(e.target.value)}
                                            rows={4}
                                        />
                                    ) : (
                                        selectedApplication.description
                                    )}
                                </Descriptions.Item>
                                <Descriptions.Item label="Application ID">
                                    {selectedApplication.application_id}
                                </Descriptions.Item>
                                <Descriptions.Item label="Applicant Name">
                                    {selectedApplication.application.full_name}
                                </Descriptions.Item>
                            </Descriptions>
                            {!isEditingDescription ? (
                                <Button
                                    type="primary"
                                    style={{ marginTop: '16px' }}
                                    onClick={() => {
                                        setIsEditingDescription(true);
                                        setEditedDescription(selectedApplication.description);
                                    }}
                                >
                                    Edit Description
                                </Button>
                            ) : (
                                <div style={{ marginTop: '16px' }}>
                                    <Button
                                        type="primary"
                                        onClick={() => {
                                            submitDescriptionEdit(selectedApplication.report_id);
                                            setIsEditingDescription(false);
                                        }}
                                    >
                                        Submit
                                    </Button>
                                    <Button
                                        style={{ marginLeft: '8px' }}
                                        onClick={() => setIsEditingDescription(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </Card>

                        {/* Application Details Section */}
                        <div>
                            <Title level={4} style={{ marginTop: '16px' }}>
                                Application Details
                            </Title>
                            <Card title="Applicant Information" style={{ marginBottom: '16px' }}>
                                <Descriptions column={2}>
                                    <Descriptions.Item label="Full Name">
                                        {selectedApplication.application.full_name}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Date of Birth">
                                        {new Date(selectedApplication.application.dob).toLocaleDateString()}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Gender">
                                        {selectedApplication.application.gender}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Religion">
                                        {selectedApplication.application.religion}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Sub Caste">
                                        {selectedApplication.application.sub_caste}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Marital Status">
                                        {selectedApplication.application.marital_status}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Aadhar Number">
                                        {selectedApplication.application.aadhar_num}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Phone Number">
                                        {selectedApplication.application.phone_num}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Email">
                                        {selectedApplication.application.email}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Parent/Guardian Name">
                                        {selectedApplication.application.parent_guardian_name}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Application Status">
                                        {selectedApplication.application.status}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </div>
                    </div>
                )}
            </Modal>


            <Drawer
                title="User Profile"
                placement="right"
                onClose={closeProfileDrawer}
                open={profileDrawerVisible}
            >
                <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <Avatar size={64} icon={<UserOutlined />} />
                        <div>
                            <h2 className="text-xl font-semibold">{userData.name}</h2>
                            <p className="text-gray-500">{userData.role}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p>{userData.email}</p>
                    </div>
                    <Button block onClick={() => {
                        message.info('Navigating to full profile page');
                        closeProfileDrawer();
                    }}>
                        View Full Profile
                    </Button>
                    <Button danger block onClick={() => {
                        logout();
                        closeProfileDrawer();
                    }}>
                        <LogoutOutlined /> Logout
                    </Button>
                </div>
            </Drawer>

            <NotificationDrawer
                visible={notificationDrawerVisible}
                onClose={closeNotificationDrawer}
                notifications={notifications}
                setNotifications={setNotifications}
            />
        </div>
    );
}

