import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Space, Typography, message, Card, Drawer, Avatar, Modal, Form, Input, Spin,  Descriptions, Tag } from 'antd';
import { EyeOutlined, UserOutlined, LogoutOutlined,FileTextOutlined } from '@ant-design/icons';
import axios from 'axios';
import { UserContext } from '../../../components/userContext';
import { useNavigate } from 'react-router-dom';
const { Title } = Typography;

export default function CompletedApplications() {
    const [applications, setApplications] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [remarksDrawerVisible, setRemarksDrawerVisible] = useState(false);
    const [loading, setLoading] = useState(false);
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
        if (userData && role && role !== "SVRO") {
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

    const handleViewApplication = async (id) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/application/${id}`);
            setSelectedApplication(response.data.data);
            setModalVisible(true);
            console.log(response.data.data)
        } catch (error) {
            message.error('Failed to load application details');
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
            await axios.post(`/api/applications/${selectedApplication.application_id}/remarks`, values);
            message.success('Remarks submitted successfully');
            closeRemarksDrawer();
            setModalVisible(false);
            fetchApplications(); // Refresh the applications list
        } catch (error) {
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
                >
                    View Full Application
                </Button>
            ),
        },
    ];

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
        <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <Title level={2} style={{ margin: 0, color: '#1890ff' }}>VRO Dashboard</Title>
                    <Button icon={<UserOutlined />} onClick={openDrawer}>Profile</Button>
                </div>
                <Table
                    columns={columns}
                    dataSource={applications}
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
                        <Button block onClick={() => navigate('/profile')}>
                            View Full Profile
                        </Button>
                        <Button
                            danger
                            block
                            onClick={() => {
                                logout();
                                setUserData(null);
                                closeDrawer();
                            }}
                        >
                            <LogoutOutlined /> Logout
                        </Button>
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
    );
}

