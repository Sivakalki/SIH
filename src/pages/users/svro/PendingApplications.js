import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Space, Typography, message, Card, Drawer, Avatar, Modal, Form, Input, Spin, Descriptions, Badge, Empty } from 'antd';
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
    const [applicationDetails, setApplicationDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [remarksDrawerVisible, setRemarksDrawerVisible] = useState(false);
    const [resendDrawerVisible, setResendDrawerVisible] = useState(false);
    const [resendDescription, setResendDescription] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
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

    const handleViewApplication = (application) => {
        setSelectedApplication(application);
        setModalVisible(true);
        fetchApplicationDetails(application.application_id);
    };

    const fetchApplicationDetails = async (applicationId) => {
        setLoadingDetails(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/application/${applicationId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setApplicationDetails(response.data.data);
        } catch (error) {
            console.error('Error fetching details:', error);
            message.error('Failed to fetch application details');
        } finally {
            setLoadingDetails(false);
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

    const closeRemarksDrawer = () => {
        setRemarksDrawerVisible(false);
    };

    const submitRemarks = async (values) => {
        try {
            await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/svro/create_report/${applicationDetails.application_id}`,
                { description: values.remarks },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            message.success('Remarks submitted successfully');
            setRemarksDrawerVisible(false);
            fetchApplications();
        } catch (error) {
            if (handleApiError(error)) return;
            console.error('Error submitting remarks:', error);
            message.error('Failed to submit remarks');
        }
    };

    const handleResendApplication = async () => {
        if (!resendDescription.trim()) {
            message.error('Please provide a description');
            return;
        }

        setResendLoading(true);
        try {
            await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/svro/recheck/${applicationDetails.application_id}`,
                {
                    description: resendDescription
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            message.success('Application resent successfully');
            setResendDrawerVisible(false);
            setResendDescription('');
            fetchApplications(); // Refresh the applications list
        } catch (error) {
            if (handleApiError(error)) return;
            message.error('Failed to resend application');
        } finally {
            setResendLoading(false);
        }
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

    return (
        <SvroLayout logout={logout}>
            <div className="pending-applications">
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <Title level={2} style={{ margin: 0, color: '#1890ff' }}>Pending Applications</Title>
                        <Space>
                            <Button onClick={() => navigate('/svro')}>Back to Dashboard</Button>
                            <Button icon={<UserOutlined />} onClick={openDrawer}>Profile</Button>
                        </Space>
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
                    onCancel={() => {
                        setModalVisible(false);
                        setSelectedApplication(null);
                        setApplicationDetails(null);
                    }}
                    footer={[
                        <Button 
                            key="remarks" 
                            type="primary" 
                            onClick={openRemarksForm}
                            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                            disabled={applicationDetails?.reCheck?.length > 0 && applicationDetails.reCheck[0].status !== 'COMPLETED'}
                        >
                            Add Remarks
                        </Button>,
                        <Button 
                            key="resend" 
                            type="primary" 
                            onClick={() => {
                                console.log ("function called")
                                setResendDrawerVisible(true)}}
                            style={{ backgroundColor: '#faad14', borderColor: '#faad14' }}
                            disabled={applicationDetails?.reCheck?.length > 0}
                        >
                            Resend Application
                        </Button>,
                        <Button 
                            key="close" 
                            onClick={() => {
                                setModalVisible(false);
                                setSelectedApplication(null);
                                setApplicationDetails(null);
                            }}
                        >
                            Close
                        </Button>,
                    ]}
                    width={800}
                >
                    {loadingDetails ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <Spin size="large" />
                        </div>
                    ) : applicationDetails ? (
                        <>
                            <Descriptions title="Personal Information" bordered column={2}>
                                <Descriptions.Item label="Full Name">{applicationDetails.full_name || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Date of Birth">
                                    {applicationDetails.dob ? new Date(applicationDetails.dob).toLocaleDateString() : 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Gender">{applicationDetails.gender || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Marital Status">{applicationDetails.marital_status || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Religion">{applicationDetails.religion || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Caste">
                                    {applicationDetails.caste?.caste_type || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Sub Caste">{applicationDetails.sub_caste || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Parent Religion">{applicationDetails.parent_religion || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Parent/Guardian Type">
                                    {applicationDetails.parent_guardian_type?.type || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Parent/Guardian Name">{applicationDetails.parent_guardian_name || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Aadhar Number">{applicationDetails.aadhar_num || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Phone Number">{applicationDetails.phone_num || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Email">{applicationDetails.email || 'N/A'}</Descriptions.Item>
                            </Descriptions>

                            <Descriptions title="Address Details" bordered column={2} style={{ marginTop: '20px' }}>
                                <Descriptions.Item label="Address">{applicationDetails.address?.address || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Pincode">{applicationDetails.address?.pincode || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="State">{applicationDetails.address?.state || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="District">{applicationDetails.address?.district || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Mandal">{applicationDetails.address?.mandal || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Sachivalayam">{applicationDetails.address?.sachivalayam || 'N/A'}</Descriptions.Item>
                            </Descriptions>

                            {applicationDetails.reCheck && applicationDetails.reCheck.length > 0 && (
                                <Descriptions title="Recheck Information" bordered column={1} style={{ marginTop: '20px' }}>
                                    <Descriptions.Item label="Status">
                                        <Badge 
                                            status={applicationDetails.reCheck[0].status === 'PENDING' ? 'processing' : 'success'} 
                                            text={applicationDetails.reCheck[0].status}
                                        />
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Description">{applicationDetails.reCheck[0].description}</Descriptions.Item>
                                    <Descriptions.Item label="Created At">
                                        {new Date(applicationDetails.reCheck[0].created_at).toLocaleString()}
                                    </Descriptions.Item>
                                    {applicationDetails.reCheck[0].status === 'COMPLETED' && (
                                        <>
                                            <Descriptions.Item label="Completed At">
                                                {new Date(applicationDetails.reCheck[0].updated_at).toLocaleString()}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Response">
                                                {applicationDetails.reCheck[0].response || 'No response provided'}
                                            </Descriptions.Item>
                                        </>
                                    )}
                                </Descriptions>
                            )}

                            {applicationDetails.report && applicationDetails.report.length > 0 && (
                                <Descriptions title="Report Information" bordered column={1} style={{ marginTop: '20px' }}>
                                    <Descriptions.Item label="Description">{applicationDetails.report[0].description}</Descriptions.Item>
                                    <Descriptions.Item label="Created At">
                                        {new Date(applicationDetails.report[0].created_at).toLocaleString()}
                                    </Descriptions.Item>
                                </Descriptions>
                            )}
                        </>
                    ) : (
                        <Empty description="No application details available" />
                    )}
                </Modal>

                {/* Add Remarks Drawer */}
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
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                </Drawer>

                {/* Resend Application Drawer */}
                <Drawer
                    title="User Profile"
                    placement="right"
                    onClose={closeDrawer}
                    visible={drawerVisible}
                    width={400}
                >
                    <Card>
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <Avatar size={64} icon={<UserOutlined />} />
                            <Title level={4} style={{ marginTop: '10px', marginBottom: '0' }}>
                                {userData?.name || 'User'}
                            </Title>
                            <p>{userData?.email || 'No email available'}</p>
                        </div>
                        <Descriptions column={1}>
                            <Descriptions.Item label="Role">SVRO</Descriptions.Item>
                            <Descriptions.Item label="Status">Active</Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Drawer>
            </div>
        </SvroLayout>
    );
}
