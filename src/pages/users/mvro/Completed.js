import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Space, Typography, message, Card, Drawer, Avatar, Modal, Form, Input, Spin,  Descriptions, Tag } from 'antd';
import { EyeOutlined, UserOutlined, LogoutOutlined,FileTextOutlined } from '@ant-design/icons';
import axios from 'axios';
import { UserContext } from '../../../components/userContext';
import { useNavigate } from 'react-router-dom';
import MvroLayout from '../../../components/layout/MvroLayout';
import MvroApplicationModal from '../../../components/modals/MvroApplicationModal';
const { Title } = Typography;

export default function CompletedApplicationsMVRO() {
    const [applications, setApplications] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [remarksDrawerVisible, setRemarksDrawerVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [noApplicationsMessage, setNoApplicationsMessage] = useState('');
    const { token, logout } = useContext(UserContext);
    const [userData, setUserData] = useState(null); // Initially null to differentiate between "loading" and "no user"
    const [role, setRole] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [userLoading, setUserLoading] = useState(true);

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
            setErrorMessage("Access denied. Only SVROs are allowed to view this page.");
            setUserLoading(false);
        }
    }, [role]);

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

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/mvro/completed_applications`, {
                headers: {
                    Authorization: `Bearer ${token}`, // Include token in Authorization header
                },
            });
            console.log(response.data, " are the applications")
            setApplications(response.data.data);
            if (response.data.data.length === 0) {
                setNoApplicationsMessage('There are no completed applications.');
            } else {
                setNoApplicationsMessage('');
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
            message.error('Failed to fetch applications');
        } finally {
            setLoading(false);
        }
    };

    const handleViewApplication = (applicationId) => {
        setSelectedApplication(applicationId);
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
    

    const closeRemarksDrawer = () => {
        setRemarksDrawerVisible(false);
    };

    const submitRemarks = async (values) => {
        try {
            console.log(values);
            await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/mvro/create_report/${selectedApplication.application_id}`,
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
                    color: status === 'pending' ? '#faad14' : status === 'RI' ? '#52c41a' : '#f5222d',
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
                >
                    View Full Application
                </Button>
            ),
        },
    ];

    const handleLogout = () => {
        logout();
        setUserData(null);
        closeDrawer();
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

    return (
        <MvroLayout>
            <div>
                <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
                    <Card>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>MVRO Dashboard</Title>
                            <Button icon={<UserOutlined />} onClick={openDrawer}>Profile</Button>
                        </div>
                        <Title level={2}>Completed Applications</Title>
                        <Table
                            columns={columns}
                            dataSource={applications}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                            style={{ overflowX: 'auto' }}
                            loading={loading}
                            locale={{ emptyText: noApplicationsMessage || 'No data' }}
                        />
                    </Card>

                    <MvroApplicationModal
                        visible={modalVisible}
                        applicationId={selectedApplication}
                        onCancel={() => {
                            setModalVisible(false);
                            setSelectedApplication(null);
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

                    <Drawer
                        title="Add Remarks"
                        placement="right"
                        onClose={closeRemarksDrawer}
                        open={remarksDrawerVisible}
                    >
                        <Form onFinish={submitRemarks}>
                            <Form.Item
                                name="remarks"
                                rules={[{ required: true, message: 'Please enter your remarks' }]}
                            >
                                <Input.TextArea rows={4} placeholder="Enter your remarks here" />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    Submit Remarks
                                </Button>
                            </Form.Item>
                        </Form>
                    </Drawer>
                </div>
            </div>
        </MvroLayout>
    );
}
