import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Space, Typography, message, Card, Drawer, Avatar, Modal, Form, Input, Spin, Descriptions, Badge, Empty, DatePicker } from 'antd';
import { CalendarOutlined, UserOutlined, LogoutOutlined, FileTextOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import { UserContext } from '../../../components/userContext';
import SvroLayout from '../../../components/layout/SvroLayout';
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
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [userData, setUserData] = useState(null);
    const { token, logout } = useContext(UserContext);

    useEffect(() => {
        fetchApplications();
        fetchUserData();
    }, [token]);

    const fetchApplications = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/svro/pending_applications`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setApplications(response.data.data);
        } catch (error) {
            if (error.response?.status === 401) {
                message.error('Session expired. Please login again.');
                logout();
            } else {
                message.error('Failed to fetch applications');
            }
        } finally {
            setLoading(false);
        }
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

    const fetchUserData = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/users/user`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUserData(res.data.user);
        } catch (error) {
            console.error('Error fetching user data:', error);
            if (error.response?.status === 401) {
                message.error('Session expired. Please login again.');
                logout();
            }
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
            
            // For PUT request, use the event_id from calendar_event
            const url = isEdit 
                ? `${process.env.REACT_APP_BACKEND_URL}/svro/calendar/${record.calendar_event.id}`
                : `${process.env.REACT_APP_BACKEND_URL}/svro/calendar/${record.application_id}`;
            
            console.log(`${isEdit ? 'Updating' : 'Creating'} calendar event:`, {
                url,
                body: { date: formattedDate },
                method: isEdit ? 'PUT' : 'POST'
            });

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
                console.log('Response from backend:', response.data);
                message.success(`Appointment ${isEdit ? 'updated' : 'scheduled'} successfully`);
                fetchApplications();
                setSelectedDate(null);
                setShowSubmitButton(false);
                setEditMode(false);
                setEditingRecord(null);
            }
        } catch (error) {
            console.error('Error scheduling appointment:', error);
            if (error.response?.status === 401) {
                message.error('Session expired. Please login again.');
                logout();
            } else {
                message.error(error.response?.data?.message || `Failed to ${record.calendar_event ? 'update' : 'schedule'} appointment`);
            }
        }
    };

    const handleEdit = (record) => {
        setEditMode(true);
        setEditingRecord(record);
        setSelectedDate(null);
    };

    const openDrawer = () => {
        setDrawerVisible(true);
    };

    const closeDrawer = () => {
        setDrawerVisible(false);
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
                <Badge status={status === 'SVRO' ? 'processing' : 'success'} text={status} />
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
                        <><DatePicker
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
                        )}</>
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

    return (
        <SvroLayout logout={logout}>
            <div className="schedule-applications">
                <Card
                    title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Title level={3}>Schedule Applications</Title>
                        </div>
                    }
                    extra={
                        <Space>
                            <Button type="primary" onClick={fetchApplications}>
                                Refresh
                            </Button>
                            <Button icon={<UserOutlined />} onClick={openDrawer}>Profile</Button>
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
                        <><Descriptions title="Personal Information" bordered column={2}>
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
                        </Descriptions></>
                    ) : (
                        <Empty description="No application details available" />
                    )}
                </Modal>

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
