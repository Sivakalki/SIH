import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Space, Typography, message, Card, Modal, Form, Input, Spin, Descriptions, Badge, DatePicker } from 'antd';
import { CalendarOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import { UserContext } from '../../../components/userContext';
import MroLayout from '../../../components/layout/MroLayout';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function ScheduleApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [applicationDetails, setApplicationDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showSubmitButton, setShowSubmitButton] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [userLoading, setUserLoading] = useState(true);
    const [role, setRole] = useState("");
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
            handleApiError(e);
            setErrorMessage("Token expired. Login again");
            console.error('Error getting profile details:', e);
        } finally {
            setUserLoading(false);
        }
    };

    const handleApiError = (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                message.error('Session expired. Please login again.');
                logout();
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

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/mro/pending_applications`, {
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

    const fetchApplicationDetails = async (applicationId) => {
        setLoadingDetails(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/mro/get_application/${applicationId}`, {
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

    const handleViewApplication = (application) => {
        setSelectedApplication(application);
        setModalVisible(true);
        fetchApplicationDetails(application.application_id);
    };

    const handleDateSelect = (date, record) => {
        setSelectedDate(date);
        setShowSubmitButton(true);
        setEditingRecord(record);
    };

    const handleScheduleSubmit = async (record) => {
        try {
            const formattedDate = selectedDate.format('YYYY-MM-DD');
            const isEdit = record.calendar_event !== null;
            
            const url = isEdit 
                ? `${process.env.REACT_APP_BACKEND_URL}/mro/calendar/${record.calendar_event.id}`
                : `${process.env.REACT_APP_BACKEND_URL}/mro/calendar/${record.application_id}`;

            const response = await axios({
                method: isEdit ? 'put' : 'post',
                url,
                data: {
                    date: formattedDate
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if (response.data) {
                message.success(`Appointment ${isEdit ? 'updated' : 'scheduled'} successfully`);
                fetchApplications();
                setSelectedDate(null);
                setShowSubmitButton(false);
                setEditMode(false);
                setEditingRecord(null);
            }
        } catch (error) {
            console.error('Error scheduling appointment:', error);
            if (handleApiError(error)) return;
            message.error(error.response?.data?.message || `Failed to ${record.calendar_event ? 'update' : 'schedule'} appointment`);
        }
    };

    const handleEdit = (record) => {
        setEditMode(true);
        setEditingRecord(record);
        setSelectedDate(null);
    };

    const columns = [
        {
            title: 'Application ID',
            dataIndex: 'application_id',
            key: 'application_id',
        },
        {
            title: 'Full Name',
            dataIndex: 'full_name',
            key: 'full_name',
        },
        {
            title: 'Status',
            dataIndex: 'current_stage',
            key: 'current_stage',
            render: (status) => (
                <Badge status={status === 'MRO' ? 'processing' : 'success'} text={status} />
            ),
        },
        {
            title: 'Scheduled Date',
            dataIndex: 'calendar_event',
            key: 'calendar_event',
            render: (calendar_event) => {
                if (calendar_event && calendar_event.event_date) {
                    return dayjs(calendar_event.event_date).format('DD MMM YYYY');
                }
                return 'Not Scheduled';
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    {(!record.calendar_event || (editMode && editingRecord?.application_id === record.application_id)) ? (
                        <>
                            <DatePicker
                                onChange={(date) => handleDateSelect(date, record)}
                                disabledDate={(current) => {
                                    const today = new Date();
                                    const twoMonthsLater = new Date();
                                    twoMonthsLater.setMonth(twoMonthsLater.getMonth() + 2);
                                    return current && (current.valueOf() < today.valueOf() || 
                                           current.valueOf() > twoMonthsLater.valueOf());
                                }}
                            />
                            {showSubmitButton && selectedDate && editingRecord?.application_id === record.application_id && (
                                <Button
                                    type="primary"
                                    onClick={() => handleScheduleSubmit(record)}
                                >
                                    {record.calendar_event ? 'Update' : 'Submit'}
                                </Button>
                            )}
                        </>
                    ) : (
                        <Button
                            type="primary"
                            onClick={() => handleEdit(record)}
                        >
                            Edit Schedule
                        </Button>
                    )}
                    <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewApplication(record)}
                    >
                        View
                    </Button>
                </Space>
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
            <div style={{ padding: 24 }}>
                <Title level={2}>
                    <CalendarOutlined /> MRO Dashboard - Schedule Applications
                </Title>
                <Card
                    title={<Title level={3}>Schedule Applications</Title>}
                    extra={
                        <Space>
                            <Button type="primary" onClick={fetchApplications}>
                                Refresh
                            </Button>
                        </Space>
                    }
                >
                    <Table
                        dataSource={applications}
                        columns={columns}
                        rowKey="application_id"
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
                            key="close" 
                            onClick={() => {
                                setModalVisible(false);
                                setSelectedApplication(null);
                                setApplicationDetails(null);
                            }}
                        >
                            Close
                        </Button>
                    ]}
                    width={800}
                >
                    {loadingDetails ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <Spin size="large" />
                        </div>
                    ) : applicationDetails ? (
                        <div>
                            <Card title="Personal Information" style={{ marginBottom: '16px' }}>
                                <Descriptions column={2}>
                                    <Descriptions.Item label="Full Name">{applicationDetails.full_name}</Descriptions.Item>
                                    <Descriptions.Item label="Application ID">{applicationDetails.application_id}</Descriptions.Item>
                                    <Descriptions.Item label="Date of Birth">{new Date(applicationDetails.dob).toLocaleDateString()}</Descriptions.Item>
                                    <Descriptions.Item label="Gender">{applicationDetails.gender}</Descriptions.Item>
                                    <Descriptions.Item label="Religion">{applicationDetails.religion}</Descriptions.Item>
                                    <Descriptions.Item label="Caste">{applicationDetails.caste?.caste_type}</Descriptions.Item>
                                    <Descriptions.Item label="Sub Caste">{applicationDetails.sub_caste}</Descriptions.Item>
                                    <Descriptions.Item label="Marital Status">{applicationDetails.marital_status}</Descriptions.Item>
                                    <Descriptions.Item label="Aadhar Number">{applicationDetails.aadhar_num}</Descriptions.Item>
                                    <Descriptions.Item label="Phone Number">{applicationDetails.phone_num}</Descriptions.Item>
                                    <Descriptions.Item label="Email">{applicationDetails.email}</Descriptions.Item>
                                </Descriptions>
                            </Card>

                            <Card title="Parent/Guardian Information">
                                <Descriptions column={2}>
                                    <Descriptions.Item label="Guardian Type">{applicationDetails.parent_guardian_type?.type}</Descriptions.Item>
                                    <Descriptions.Item label="Guardian Name">{applicationDetails.parent_guardian_name}</Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            No application details found
                        </div>
                    )}
                </Modal>
            </div>
        </MroLayout>
    );
}
