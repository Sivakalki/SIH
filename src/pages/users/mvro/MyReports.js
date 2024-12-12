import React, { useState, useEffect, useContext } from 'react';
import { Input, Table, Select, Button, Space, Typography, message, Card, Drawer, Avatar, Modal, Spin, Descriptions, Tag } from 'antd';
import { EyeOutlined, UserOutlined, FileTextOutlined, LogoutOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import { UserContext } from '../../../components/userContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import MvroLayout from '../../../components/layout/MvroLayout';

const { Title } = Typography;
const { Option } = Select;

export default function MVROMyReports() {
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userData, setUserData] = useState(null);
  const { token, logout } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userLoading, setUserLoading] = useState(true);
  const [role, setRole] = useState("");
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('All');
  const [loadingApplicationId, setLoadingApplicationId] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [profileDrawerVisible, setProfileDrawerVisible] = useState(false);

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
      setErrorMessage("Access denied. Only MVROs are allowed to view this page.");
      setUserLoading(false);
    }
  }, [role]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/mvro/get_reports`, {
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
      console.log(res, " is the response data");
    } catch (e) {
      setErrorMessage("Token expired. Login again");
      console.error('There is an error in getting profile details', e);
      setUserData(null);
    } finally {
      setUserLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Kolkata' };
    return new Date(dateString).toLocaleString('en-IN', options);
  };

  const updateReport = async () => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/mvro/edit_report/${selectedApplication.report_id}`, {
        description: editedDescription,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      message.success('Report updated successfully!');
      fetchApplications(); // Refresh the applications list
      setDrawerVisible(false);
      setModalVisible(false); 
    } catch (error) {
      message.error('Failed to update report.');
      console.error('Error updating report:', error);
    }
  };

  const openDrawer = () => {
    setEditedDescription(selectedApplication.description);
    setDrawerVisible(true);
  };

  const openProfileDrawer = () => {
    setProfileDrawerVisible(true);
  };

  const closeProfileDrawer = () => {
    setProfileDrawerVisible(false);
  };

  if (userLoading) {
    return (
      <MvroLayout logout={logout}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Spin size="large" />
        </div>
      </MvroLayout>
    );
  }

  if (errorMessage) {
    return (
      <MvroLayout logout={logout}>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <Typography.Text type="danger">{errorMessage}</Typography.Text>
        </div>
      </MvroLayout>
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
      key: 'application_id',
    },
    {
      title: 'Applicant Name',
      dataIndex: 'applicant_name',
      key: 'applicant_name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Approved' ? 'green' : status === 'Rejected' ? 'red' : 'blue'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewApplication(record)}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setModalVisible(true);
  };

  return (
    <MvroLayout logout={logout}>
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Title level={2}>My Reports</Title>
          <Button type="text" onClick={openProfileDrawer} icon={<UserOutlined />} />
        </div>

        <Card className="w-full">
          <div className="flex justify-between items-center mb-4">
            <Title level={4}>My Reports</Title>
            <Select
              defaultValue="All"
              style={{ width: 120 }}
              onChange={(value) => setFilterStatus(value)}
            >
              <Option value="All">All</Option>
              <Option value="Pending">Pending</Option>
              <Option value="Approved">Approved</Option>
              <Option value="Rejected">Rejected</Option>
            </Select>
          </div>
          <Table
            columns={columns}
            dataSource={applications}
            loading={loading}
            rowKey="id"
          />
        </Card>

        <Modal
          title="Application Details"
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={[
            <Button key="update" type="primary" onClick={openDrawer}>
              Edit Report
            </Button>,
            <Button key="back" onClick={() => setModalVisible(false)}>
              Cancel
            </Button>,
          ]}
          width={800}
        >
          {selectedApplication && (
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Application ID">{selectedApplication.application_id}</Descriptions.Item>
              <Descriptions.Item label="Applicant Name">{formatDate(selectedApplication.applicant_name)}</Descriptions.Item>
              <Descriptions.Item label="Status">{selectedApplication.status}</Descriptions.Item>
              <Descriptions.Item label="Created At">{formatDate(selectedApplication.created_time)}</Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {selectedApplication.description}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>

        <Drawer
          title="Edit Report Description"
          placement="right"
          onClose={() => setDrawerVisible(false)}
          visible={drawerVisible}
        >
          <Input.TextArea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            rows={4}
          />
          <Button type="primary" onClick={updateReport} style={{ marginTop: '16px' }}>
            Submit
          </Button>
        </Drawer>

        <Drawer
          title="User Profile"
          placement="right"
          onClose={closeProfileDrawer}
          open={profileDrawerVisible}
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
              <div>
                <Button type="primary" danger icon={<LogoutOutlined />} onClick={logout}>
                  Logout
                </Button>
              </div>
            </div>
          )}
        </Drawer>
      </div>
    </MvroLayout>
  );
}
