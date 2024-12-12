import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Typography, message, Card, Modal, Descriptions, Spin, Tag } from 'antd';
import { EyeOutlined, FileTextOutlined } from '@ant-design/icons';
import { UserContext } from '../../../components/userContext';
import MroLayout from '../../../components/layout/MroLayout';
import axios from 'axios';

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

export default function CompletedApplications() {
    const [applications, setApplications] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [userLoading, setUserLoading] = useState(true);
    const [role, setRole] = useState("");
    const [modalLoading, setModalLoading] = useState(false);
    const { token, logout } = useContext(UserContext);

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
        if (role && role !== "MRO") {
            setErrorMessage("Access denied. Only MROs are allowed to view this page.");
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
        } catch (e) {
            if (handleApiError(e)) return;
            setErrorMessage("Token expired. Login again");
            console.error('Error getting profile details:', e);
        } finally {
            setUserLoading(false);
        }
    };

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/mro/completed_applications`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setApplications(response.data.data);
        } catch (error) {
            if (handleApiError(error)) return;
            message.error('Failed to fetch applications');
        } finally {
            setLoading(false);
        }
    };

    const handleViewApplication = async (id) => {
        setModalVisible(true);
        setModalLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/mro/get_application/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setSelectedApplication(response.data.data);
        } catch (error) {
            if (handleApiError(error)) return;
            message.error('Failed to load application details');
        } finally {
            setModalLoading(false);
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
                <Tag color={status === 'COMPLETED' ? 'green' : 'blue'}>
                    {status}
                </Tag>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="primary"
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
            <MroLayout logout={logout}>
                <div className="flex justify-center items-center min-h-screen">
                    <Spin size="large" />
                </div>
            </MroLayout>
        );
    }

    if (errorMessage) {
        return (
            <MroLayout logout={logout}>
                <div className="flex justify-center items-center min-h-screen">
                    <Title level={3} className="text-red-500">{errorMessage}</Title>
                </div>
            </MroLayout>
        );
    }

    return (
        <MroLayout logout={logout}>
            <div className="mb-6">
                <Title level={2}>Completed Applications</Title>
            </div>

            <Card className="shadow-md">
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
                title="Application Details"
                visible={modalVisible}
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
                    </div>
                ) : null}
            </Modal>
        </MroLayout>
    );
}