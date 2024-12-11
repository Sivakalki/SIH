import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Space, Typography, message, Card, Drawer, Avatar, Modal, Form, Input, Spin,  Descriptions, Tag, Badge } from 'antd';
import { EyeOutlined, UserOutlined, LogoutOutlined,FileTextOutlined } from '@ant-design/icons';
import axios from 'axios';
import { UserContext } from '../../../components/userContext';
import { useNavigate } from 'react-router-dom';
import SvroLayout from '../../../components/layout/SvroLayout';
const { Title } = Typography;

export default function CompletedApplications() {
    const [applications, setApplications] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [profileDrawerVisible, setProfileDrawerVisible] = useState(false);
    const [remarksDrawerVisible, setRemarksDrawerVisible] = useState(false);
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

    const fetchData = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/users/user`, {
                headers: {
                    Authorization: `Bearer ${token}`, 
                },
            });
            setUserData(res.data.user);
            setRole(res.data.role);
            console.log(res, " is the response data")
        } catch (e) {
            setErrorMessage("Token expired. Login again")
            console.error('There is an error in getting profile details', e);
            setUserData(null); 
        } finally {
            setUserLoading(false); 
        }
    };

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/svro/completed_applications`, {
                headers: {
                    Authorization: `Bearer ${token}`, 
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
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/application/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`, 
                },
            });
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
            console.log(values);
            await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/mvro/create_report/${selectedApplication.application_id}`,
                { description: values.remarks }, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            message.success('Remarks submitted successfully');
            setModalVisible(false);
            fetchApplications(); 
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
            title: 'Current Status',
            dataIndex: 'current_stage',
            key: 'current_stage',
            render: (status) => (
                <span style={{
                    color: status === 'MVRO' ? '#faad14' : status === 'MRO' ? '#52c41a' : '#f5222d',
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
                    {<Button type="primary" onClick={() => navigate('/login')}>Go to Login</Button>}
                </div>
            </SvroLayout>
        );
    }

    return (
        <SvroLayout logout={logout}>
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
                    title={<Title level={3}>Application Details</Title>}
                    visible={modalVisible}
                    onCancel={() => {
                        setModalVisible(false);
                        setSelectedApplication(null);
                    }}
                    footer={
                        selectedApplication?.current_stage?.role_type === 'SVRO' ? [
                            <Button key="remarks" type="primary" onClick={openRemarksForm}>
                                Add Remarks
                            </Button>
                        ] : null
                    }
                    width={800}
                >
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <Spin size="large" />
                        </div>
                    ) : selectedApplication && (
                        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                            <Card title="Personal Information" style={{ marginBottom: '16px' }}>
                                <Descriptions column={2}>
                                    <Descriptions.Item label="Full Name">{selectedApplication.full_name}</Descriptions.Item>
                                    <Descriptions.Item label="Application ID">{selectedApplication.application_id}</Descriptions.Item>
                                    <Descriptions.Item label="Date of Birth">{new Date(selectedApplication.dob).toLocaleDateString()}</Descriptions.Item>
                                    <Descriptions.Item label="Gender">{selectedApplication.gender}</Descriptions.Item>
                                    <Descriptions.Item label="Religion">{selectedApplication.religion}</Descriptions.Item>
                                    <Descriptions.Item label="Caste">{selectedApplication.caste?.caste_type}</Descriptions.Item>
                                    <Descriptions.Item label="Sub Caste">{selectedApplication.sub_caste}</Descriptions.Item>
                                    <Descriptions.Item label="Parent Religion">{selectedApplication.parent_religion}</Descriptions.Item>
                                    <Descriptions.Item label="Marital Status">{selectedApplication.marital_status}</Descriptions.Item>
                                    <Descriptions.Item label="Aadhar Number">{selectedApplication.aadhar_num}</Descriptions.Item>
                                    <Descriptions.Item label="Phone Number">{selectedApplication.phone_num}</Descriptions.Item>
                                    <Descriptions.Item label="Email">{selectedApplication.email}</Descriptions.Item>
                                </Descriptions>
                            </Card>

                            <Card title="Parent/Guardian Information" style={{ marginBottom: '16px' }}>
                                <Descriptions column={2}>
                                    <Descriptions.Item label="Guardian Type">{selectedApplication.parent_guardian_type?.type}</Descriptions.Item>
                                    <Descriptions.Item label="Guardian Name">{selectedApplication.parent_guardian_name}</Descriptions.Item>
                                </Descriptions>
                            </Card>

                            <Card title="Address Information" style={{ marginBottom: '16px' }}>
                                <Descriptions column={2}>
                                    <Descriptions.Item label="Address">{selectedApplication.address?.address}</Descriptions.Item>
                                    <Descriptions.Item label="Pincode">{selectedApplication.address?.pincode}</Descriptions.Item>
                                    <Descriptions.Item label="State">{selectedApplication.address?.state}</Descriptions.Item>
                                    <Descriptions.Item label="District">{selectedApplication.address?.district}</Descriptions.Item>
                                    <Descriptions.Item label="Mandal">{selectedApplication.address?.mandal}</Descriptions.Item>
                                    <Descriptions.Item label="Sachivalayam">{selectedApplication.address?.sachivalayam}</Descriptions.Item>
                                </Descriptions>
                            </Card>

                            <Card title="Documents" style={{ marginBottom: '16px' }}>
                                <Descriptions column={2}>
                                    <Descriptions.Item label="Address Proof">
                                        {selectedApplication.addressProof ? (
                                            <Button type="link" onClick={() => window.open(selectedApplication.addressProof, '_blank')}>
                                                View Document
                                            </Button>
                                        ) : 'Not Uploaded'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Caste Proof">
                                        {selectedApplication.casteProof ? (
                                            <Button type="link" onClick={() => window.open(selectedApplication.casteProof, '_blank')}>
                                                View Document
                                            </Button>
                                        ) : 'Not Uploaded'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="DOB Proof">
                                        {selectedApplication.dobProof ? (
                                            <Button type="link" onClick={() => window.open(selectedApplication.dobProof, '_blank')}>
                                                View Document
                                            </Button>
                                        ) : 'Not Uploaded'}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>

                            <Card title="Application Status" style={{ marginBottom: '16px' }}>
                                <Descriptions column={2}>
                                    <Descriptions.Item label="Status">
                                        <Badge 
                                            status={selectedApplication.status === 'PENDING' ? 'processing' : 'success'} 
                                            text={selectedApplication.status}
                                        />
                                    </Descriptions.Item>
                                    <Descriptions.Item 
                                        label={
                                            <span style={{ 
                                                backgroundColor: '#1890ff',
                                                color: 'white',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontWeight: 'bold'
                                            }}>
                                                Current Stage
                                            </span>
                                        }
                                    >
                                        <div style={{
                                            backgroundColor: '#e6f7ff',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            border: '1px solid #91d5ff',
                                            color: '#1890ff',
                                            fontWeight: 'bold'
                                        }}>
                                            {selectedApplication.current_stage?.role_type || 'Not Started'}
                                        </div>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Created At">{new Date(selectedApplication.created_at).toLocaleString()}</Descriptions.Item>
                                    <Descriptions.Item label="Updated At">{new Date(selectedApplication.updated_at).toLocaleString()}</Descriptions.Item>
                                    {selectedApplication.rejection_reason && (
                                        <Descriptions.Item label="Rejection Reason" span={2}>
                                            {selectedApplication.rejection_reason}
                                        </Descriptions.Item>
                                    )}
                                </Descriptions>
                            </Card>
                        </div>
                    )}
                </Modal>

                <Drawer
                    title="Add Remarks"
                    placement="right"
                    onClose={closeRemarksDrawer}
                    visible={remarksDrawerVisible}
                    width={400}
                >
                    <Form onFinish={submitRemarks}>
                        <Form.Item
                            name="remarks"
                            rules={[{ required: true, message: 'Please enter your remarks' }]}
                        >
                            <Input.TextArea
                                rows={4}
                                placeholder="Enter your remarks here..."
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Submit Remarks
                            </Button>
                        </Form.Item>
                    </Form>
                </Drawer>

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
