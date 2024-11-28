import React, { useState, useEffect, useContext } from 'react';
import { Table, Select, Modal, Button, Space, Typography, message, Card, Row, Col, Statistic, Divider, Drawer, Input } from 'antd';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { UserContext } from "../../components/userContext";
import axios from 'axios';

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

export default function MVRODashboard() {
  const [applications, setApplications] = useState([]);
  const [riReportApplications, setRIReportApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [rejectionModalVisible, setRejectionModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const [userData, setUserData] = useState(null);
  const { token, logout } = useContext(UserContext);

  useEffect(() => {
    if (token) {
      fetchUserData();
      fetchApplications();
      fetchRIReportApplications();
    }
  }, [token]);

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
      message.error('Failed to fetch user data');
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/applications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setApplications(res.data.applications);
      setFilteredApplications(res.data.applications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      message.error('Failed to fetch applications');
    }
  };

  const fetchRIReportApplications = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/applications/ri-report`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRIReportApplications(res.data.applications);
    } catch (error) {
      console.error('Error fetching RI report applications:', error);
      message.error('Failed to fetch RI report applications');
    }
  };

  const filterApplications = (status) => {
    setFilterStatus(status);
    if (status === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter(app => app.status === status));
    }
  };

  const handleViewApplication = async (application) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/applications/${application.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSelectedApplication(res.data.application);
      setModalVisible(true);
    } catch (error) {
      console.error('Error fetching application details:', error);
      message.error('Failed to fetch application details');
    }
  };

  const handleStatusChange = (id, newStatus, isRIReport = false) => {
    if (newStatus === 'rejected') {
      setRejectionModalVisible(true);
    } else {
      updateApplicationStatus(id, newStatus, isRIReport);
    }
  };

  const updateApplicationStatus = async (id, newStatus, isRIReport = false) => {
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/applications/${id}/status`, 
        { status: newStatus, rejectionReason: rejectionReason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (isRIReport) {
        setRIReportApplications(prevApps => 
          prevApps.map(app => app.id === id ? { ...app, status: newStatus } : app)
        );
      } else {
        setApplications(prevApps => 
          prevApps.map(app => app.id === id ? { ...app, status: newStatus } : app)
        );
        filterApplications(filterStatus);
      }

      setModalVisible(false);
      setRejectionModalVisible(false);
      setRejectionReason('');
      message.success(`Application ${newStatus}`);
    } catch (error) {
      console.error('Error updating application status:', error);
      message.error('Failed to update application status');
    }
  };

  const columns = [
    {
      title: 'Application ID',
      dataIndex: 'id',
      key: 'id',
      responsive: ['md'],
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span style={{
          color: status === 'pending' ? '#faad14' : status === 'approved' ? '#52c41a' : '#f5222d',
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
          onClick={() => handleViewApplication(record)}
          icon={<FileTextOutlined />}
        >
          View Details
        </Button>
      ),
    },
  ];

  // ... (keep the rest of the component code, including Statistic, renderInfoBlock, and renderDocumentBlock)

  return (
    <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>MVRO Dashboard</Title>
            <Text>{userData?.name} - MVRO of {userData?.mandal} Mandal</Text>
          </div>
          <Button
            icon={<UserOutlined />}
            onClick={() => setDrawerVisible(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            Profile
          </Button>
        </div>

        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Total Applications"
              value={applications.length}
              status="all"
              backgroundColor="#F5F5F5"
              icon={<FileTextOutlined style={{ fontSize: '24px', opacity: 0.7 }} />}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Approved"
              value={applications.filter(app => app.status === 'approved').length}
              status="approved"
              backgroundColor="#E6FFE6"
              icon={<CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} />}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Pending"
              value={applications.filter(app => app.status === 'pending').length}
              status="pending"
              backgroundColor="#FFF7E6"
              icon={<ClockCircleOutlined style={{ fontSize: '24px', color: '#faad14' }} />}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Statistic
              title="Rejected"
              value={applications.filter(app => app.status === 'rejected').length}
              status="rejected"
              backgroundColor="#FFF1F0"
              icon={<CloseCircleOutlined style={{ fontSize: '24px', color: '#f5222d' }} />}
            />
          </Col>
        </Row>

        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
          <div>
            <label htmlFor="status-filter" style={{ marginRight: '8px', fontWeight: 'bold' }}>Filter by Status:</label>
            <Select
              id="status-filter"
              value={filterStatus}
              style={{ width: 120 }}
              onChange={filterApplications}
            >
              <Option value="all">All</Option>
              <Option value="approved">Approved</Option>
              <Option value="pending">Pending</Option>
              <Option value="rejected">Rejected</Option>
            </Select>
          </div>
          <Table
            columns={columns}
            dataSource={filteredApplications}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: true }}
          />
        </Space>
      </Card>

      <Card style={{ marginTop: '24px' }}>
        <Title level={3}>Rejected Applications from RI</Title>
        <Table
          columns={columns}
          dataSource={riReportApplications}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      </Card>

      {/* ... (keep the Modal, Drawer, and other UI components) */}

    </div>
  );
}

