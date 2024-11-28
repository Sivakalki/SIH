import React, { useState, useEffect, useContext } from 'react';
import { Table, Select, Button, Space, Typography, message, Card,  Drawer, Avatar,Modal, Badge, Spin, Descriptions, Tag } from 'antd';
import {EyeOutlined, UserOutlined, LogoutOutlined, FileTextOutlined,  BellOutlined, QuestionCircleOutlined } from '@ant-design/icons';
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


export default function Applications() {
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
    const [activeNavItem, setActiveNavItem] = useState('applications');
    const [role, setRole] = useState("");
    const navigate = useNavigate()
    const [filterStatus, setFilterStatus] = useState('All');
    const [loadingApplicationId, setLoadingApplicationId] = useState(null);
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
            dataIndex: 'role_type',
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
                    onClick={() => handleViewApplication(record.application_id)}
                    loading={loadingApplicationId === record.application_id}
                >
                    View Full Application
                </Button>
            ),
        },
    ];

    const handleViewApplication = async (id) => {
        setLoadingApplicationId(id);
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/application/${id}`);
            setSelectedApplication(response.data.data);
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

    const unreadNotificationsCount = notifications.filter(n => !n.read).length;
    const handleNavigate = (path) => {
        const basePath = "/svro2"; // Define your base path
        if(path === 'dashboard'){
            console.log("ented here")
            navigate(`${basePath}`)
        }else{
            console.log("NEthered herre")       
            navigate(`${basePath}/${path}`);
        }
    }
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
                    <NavItem to="/corrections" isActive={activeNavItem === 'corrections'} onClick={() => handleNavigate('corrections')}>Corrections</NavItem>
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
                    <Button key="remarks" type="primary" onClick={openRemarksForm}>
                        Add Remarks
                    </Button>,
                ]}
                width={800}
            >
                {selectedApplication && (
                    <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        <Card title="Applicant Information" style={{ marginBottom: '16px' }}>
                            <Descriptions column={2}>
                                <Descriptions.Item label="Applied By">
                                    {selectedApplication.applied_by.name} 
                                </Descriptions.Item>
                                <Descriptions.Item label="Application ID">{selectedApplication.application_id}</Descriptions.Item>
                                <Descriptions.Item label="Status">{selectedApplication.status}</Descriptions.Item>
                                <Descriptions.Item label="Current Stage">{selectedApplication.current_stage.role_type}</Descriptions.Item>
                            </Descriptions>
                        </Card>

                        <Card title="Personal Details" style={{ marginBottom: '16px' }}>
                            <Descriptions column={2}>
                                <Descriptions.Item label="Full Name">{selectedApplication.full_name}</Descriptions.Item>
                                <Descriptions.Item label="Date of Birth">{new Date(selectedApplication.dob).toLocaleDateString()}</Descriptions.Item>
                                <Descriptions.Item label="Gender">{selectedApplication.gender}</Descriptions.Item>
                                <Descriptions.Item label="Religion">{selectedApplication.religion}</Descriptions.Item>
                                <Descriptions.Item label="Caste">{selectedApplication.caste.caste_type}</Descriptions.Item>
                                <Descriptions.Item label="Sub Caste">{selectedApplication.sub_caste}</Descriptions.Item>
                                <Descriptions.Item label="Parent/Guardian">{selectedApplication.parent_guardian_type.type}: {selectedApplication.parent_guardian_name}</Descriptions.Item>
                                <Descriptions.Item label="Marital Status">{selectedApplication.marital_status}</Descriptions.Item>
                                <Descriptions.Item label="Aadhar Number">{selectedApplication.aadhar_num}</Descriptions.Item>
                                <Descriptions.Item label="Phone Number">{selectedApplication.phone_num}</Descriptions.Item>
                                <Descriptions.Item label="Email">{selectedApplication.email}</Descriptions.Item>
                            </Descriptions>
                        </Card>

                        <Card title="Address Details" style={{ marginBottom: '16px' }}>
                            <Descriptions column={2}>
                                <Descriptions.Item label="Address">{selectedApplication.address.address}</Descriptions.Item>
                                <Descriptions.Item label="Pincode">{selectedApplication.address.pincode}</Descriptions.Item>
                                <Descriptions.Item label="State">{selectedApplication.address.state}</Descriptions.Item>
                                <Descriptions.Item label="District">{selectedApplication.address.district}</Descriptions.Item>
                                <Descriptions.Item label="Mandal">{selectedApplication.address.mandal}</Descriptions.Item>
                                <Descriptions.Item label="Sachivalayam">{selectedApplication.address.sachivalayam}</Descriptions.Item>
                            </Descriptions>
                        </Card>

                        <Card title="Proof Types" style={{ marginBottom: '16px' }}>
                            <Descriptions column={2}>
                                <Descriptions.Item label="Address Proof">
                                    {selectedApplication.addressProof ? <FileTextOutlined /> : 'Not Provided'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Caste Proof">
                                    {selectedApplication.casteProof ? <FileTextOutlined /> : 'Not Provided'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Date of Birth Proof">
                                    {selectedApplication.dobProof ? <FileTextOutlined /> : 'Not Provided'}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        <Card title="Roles Allotted">
                            <Descriptions column={2}>
                                <Descriptions.Item label="MVRO">User ID: {selectedApplication.mvro_user.user_id}</Descriptions.Item>
                                <Descriptions.Item label="SVRO">User ID: {selectedApplication.svro_user.user_id}</Descriptions.Item>
                                <Descriptions.Item label="RI">User ID: {selectedApplication.ri_user.user_id}</Descriptions.Item>
                                <Descriptions.Item label="MRO">User ID: {selectedApplication.mro_user.user_id}</Descriptions.Item>
                            </Descriptions>
                        </Card>
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

