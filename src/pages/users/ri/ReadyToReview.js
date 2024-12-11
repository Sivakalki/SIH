import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Typography, message, Card } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { UserContext } from '../../../components/userContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RiLayout from '../../../components/layout/RiLayout';
import RiApplicationModal from '../../../components/modals/RiApplicationModal';
import RiHeader from '../../../components/header/RiHeader';

const { Title } = Typography;

export default function ReadyToReviewRI() {
    const [applications, setApplications] = useState([]);
    const [selectedApplicationId, setSelectedApplicationId] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const { token, logout } = useContext(UserContext);
    const [userData, setUserData] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [userLoading, setUserLoading] = useState(true);
    const [role, setRole] = useState("");
    const navigate = useNavigate();
    const [loadingApplicationId, setLoadingApplicationId] = useState(null);

    useEffect(() => {
        if (!token) {
            setErrorMessage("You are not logged in. Please log in to access this page.");
            setUserLoading(false);
            return;
        }
        fetchUserProfile();
    }, [token]);

    useEffect(() => {
        if (userData && role === "RI") {
            fetchApplications();
        }
    }, [userData, role]);

    useEffect(() => {
        if (userData && role && role !== "RI") {
            setErrorMessage("Access denied. Only RIs are allowed to view this page.");
            setUserLoading(false);
        }
    }, [role]);

    const fetchUserProfile = async () => {
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
            console.error('Error fetching user profile:', e);
        } finally {
            setUserLoading(false);
        }
    };

    const fetchApplications = async () => {
        setLoading(true);
        console.log("called this")
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/ri/ready_to_review`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // Ensure the response data is an array and add key property
            const formattedData = Array.isArray(response.data.data) ? response.data.data : [];
            setApplications(formattedData.map(app => ({
                ...app,
                key: app.id || app.application_id // Ensure each row has a unique key
            })));
        } catch (error) {
            message.error('Failed to fetch applications');
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Application ID',
            dataIndex: 'application_id',
            key: 'application_id',
        },
        {
            title: 'Applicant Name',
            dataIndex: 'full_name',
            key: 'full_name',
        },
        {
            title: 'Status',
            dataIndex: 'current_stage',
            key: 'current_stage',
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
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Button
                    icon={<EyeOutlined />}
                    onClick={() => handleViewApplication(record.application_id)}
                    loading={loadingApplicationId === record.application_id}
                >
                    View
                </Button>
            ),
        },
    ];

    const handleViewApplication = (id) => {
        setSelectedApplicationId(id);
        setModalVisible(true);
    };

    if (userLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Title level={3}>Loading...</Title>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Title level={3} className="text-red-500">{errorMessage}</Title>
                <Button type="primary" onClick={() => navigate('/login')}>Go to Login</Button>
            </div>
        );
    }

    return (
        <RiLayout logout={logout}>
            <RiHeader userData={userData} logout={logout} />
            <div style={{ 
                padding: '24px',
                marginTop: '80px', // Increased height for the header
                height: 'calc(100vh - 80px)',
                overflowY: 'auto'
            }}>
                <Card>
                    <Title level={2} style={{ marginBottom: '24px' }}>Ready To Review Applications</Title>
                    <Table
                        columns={columns}
                        dataSource={applications}
                        loading={loading}
                        rowKey="key"
                    />
                </Card>

                <RiApplicationModal
                    visible={modalVisible}
                    applicationId={selectedApplicationId}
                    onCancel={() => {
                        setModalVisible(false);
                        setSelectedApplicationId(null);
                    }}
                    onUpdate={fetchApplications}
                />
            </div>
        </RiLayout>
    );
}
