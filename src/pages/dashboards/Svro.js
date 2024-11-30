import React, { useState, useEffect } from 'react';
import { Table, Select, Modal, Button, Space, Typography, message, Card, Row, Col, Checkbox, Form, Input, Tooltip, Avatar, Descriptions, Tag, Drawer } from 'antd';
import { EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, MailOutlined, CheckOutlined, ClockCircleOutlined, StopOutlined, UserOutlined, DeleteOutlined, AppstoreOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { Title, Text } = Typography;

// Mock data for demonstration
const mockApplications = [
  { 
    id: 'APP001', 
    fullName: 'John Doe', 
    dateOfBirth: '1990-01-01',
    gender: 'Male',
    email: 'john@example.com',
    phoneNumber: '1234567890',
    caste: 'General',
    subCaste: 'N/A',
    religion: 'Hindu',
    parentReligion: 'Hindu',
    guardianName: 'Jane Doe',
    guardianType: 'Mother',
    maritalStatus: 'Single',
    aadharNumber: '123456789012',
    address: '123 Main St, City',
    pincode: '500001',
    proofOfResidence: { type: 'Aadhar Card', file: 'residence_proof.pdf' },
    proofOfDateOfBirth: { type: 'Birth Certificate', file: 'dob_proof.pdf' },
    proofOfCaste: { type: 'Caste Certificate', file: 'caste_proof.pdf' },
    status: 'pending', 
    submissionDate: '2023-05-01',
    checklistCompleted: false
  },
  // Add more mock applications as needed
];

const verificationChecklist = [
  'Address Verified',
  'Guardian Details Verified',
  'Caste Verified',
  'Personal Information Verified',
  'Documents Verified'
];

const svroInfo = {
  name: 'Jane Smith',
  wardVillage: 'Ward 7, Hyderabad',
  email: 'jane.smith@example.com',
  phone: '+91 9876543210'
};

const Svro = () => {
  const [applications, setApplications] = useState(mockApplications);
  const [filteredApplications, setFilteredApplications] = useState(mockApplications);
  const [filterStatus, setFilterStatus] = useState('all');
  const [applicationModalVisible, setApplicationModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [checklistModalVisible, setChecklistModalVisible] = useState(false);
  const [checklist, setChecklist] = useState({});
  const [rejectionReason, setRejectionReason] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  });
  const [profileDrawerVisible, setProfileDrawerVisible] = useState(false);

  useEffect(() => {
    // In a real application, you would fetch the applications from an API
    setApplications(mockApplications);
    updateStats(mockApplications);
  }, []);

  useEffect(() => {
    if (filterStatus === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter(app => app.status === filterStatus));
    }
  }, [filterStatus, applications]);

  const updateStats = (apps) => {
    const newStats = apps.reduce((acc, app) => {
      acc.total++;
      acc[app.status]++;
      return acc;
    }, { total: 0, pending: 0, accepted: 0, rejected: 0 });
    setStats(newStats);
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setApplicationModalVisible(true);
  };

  const handleCloseApplicationModal = () => {
    setSelectedApplication(null);
    setApplicationModalVisible(false);
  };

  const handleOpenChecklist = (application) => {
    setSelectedApplication(application);
    setChecklist(application.checklist || {});
    setRejectionReason('');
    setChecklistModalVisible(true);
  };

  const handleChecklistItemChange = (item, checked) => {
    setChecklist(prev => ({ ...prev, [item]: checked }));
  };

  const handleAcceptApplication = async () => {
    if (Object.values(checklist).filter(Boolean).length !== verificationChecklist.length) {
      message.error('Please complete all checklist items before accepting.');
      return;
    }

    try {
      // In a real application, you would make an API call here
      // await axios.post('/api/applications/accept', { id: selectedApplication.id });
      
      const updatedApplications = applications.map(app => 
        app.id === selectedApplication.id ? { ...app, status: 'accepted', checklist, checklistCompleted: true } : app
      );
      setApplications(updatedApplications);
      updateStats(updatedApplications);
      message.success('Application accepted and sent to RI for further verification.');
      setChecklistModalVisible(false);
    } catch (error) {
      message.error('Failed to accept application');
    }
  };

  const handleRejectApplication = async () => {
    if (!rejectionReason) {
      message.error('Please provide a reason for rejection.');
      return;
    }

    try {
      // In a real application, you would make API calls here
      // await axios.post('/api/applications/reject', { id: selectedApplication.id, reason: rejectionReason });
      // await axios.post('/api/send-email', { to: selectedApplication.email, subject: 'Application Rejected', body: rejectionReason });
      
      const updatedApplications = applications.map(app => 
        app.id === selectedApplication.id ? { ...app, status: 'rejected', checklist, checklistCompleted: true } : app
      );
      setApplications(updatedApplications);
      updateStats(updatedApplications);
      message.success('Application rejected and email sent to the applicant.');
      setChecklistModalVisible(false);
    } catch (error) {
      message.error('Failed to reject application');
    }
  };

  const handleDeleteApplication = (applicationId) => {
    const updatedApplications = applications.filter(app => app.id !== applicationId);
    setApplications(updatedApplications);
    updateStats(updatedApplications);
    message.success('Application deleted successfully.');
  };

  const columns = [
    {
      title: 'Application ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = '';
        let icon = null;
        switch (status) {
          case 'pending':
            color = '#faad14';
            icon = <ClockCircleOutlined />;
            break;
          case 'accepted':
            color = '#52c41a';
            icon = <CheckCircleOutlined />;
            break;
          case 'rejected':
            color = '#f5222d';
            icon = <CloseCircleOutlined />;
            break;
        }
        return (
          <Space>
            {icon}
            <Text style={{ color, textTransform: 'capitalize', fontWeight: 'bold' }}>
              {status}
            </Text>
          </Space>
        );
      },
    },
    {
      title: 'View Application',
      key: 'view',
      render: (_, record) => (
        <Button icon={<EyeOutlined />} onClick={() => handleViewApplication(record)}>
          View Full Application
        </Button>
      ),
    },
    {
      title: 'Checklist',
      key: 'checklist',
      render: (_, record) => (
        record.checklistCompleted ? (
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteApplication(record.id)}>
            Delete Application
          </Button>
        ) : (
          <Button type="primary" icon={<CheckOutlined />} onClick={() => handleOpenChecklist(record)}>
            Open Checklist
          </Button>
        )
      ),
    },
  ];

  const StatisticCard = ({ title, value, icon, color }) => (
    <Card className="statistic-card" style={{ backgroundColor: color }}>
      <Space direction="vertical" size="small" align="center">
        {icon}
        <Title level={4} style={{ color: '#fff', margin: 0 }}>{value}</Title>
        <Text style={{ color: '#fff' }}>{title}</Text>
      </Space>
    </Card>
  );

  return (
    <div className="svro-dashboard">
      <Card className="dashboard-header">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} className="dashboard-title">SVRO Dashboard</Title>
            <Text strong>{svroInfo.name} - {svroInfo.wardVillage}</Text>
          </Col>
          <Col>
            <Button icon={<UserOutlined />} onClick={() => setProfileDrawerVisible(true)}>
              View Profile
            </Button>
          </Col>
        </Row>
      
        <Row gutter={16} className="statistics-row">
          <Col span={6}>
            <StatisticCard 
              title="Total Applications" 
              value={stats.total} 
              icon={<AppstoreOutlined className="statistic-icon" />} 
              color="#1890ff"
            />
          </Col>
          <Col span={6}>
            <StatisticCard 
              title="Pending" 
              value={stats.pending} 
              icon={<ClockCircleOutlined className="statistic-icon" />} 
              color="#faad14"
            />
          </Col>
          <Col span={6}>
            <StatisticCard 
              title="Accepted" 
              value={stats.accepted} 
              icon={<CheckCircleOutlined className="statistic-icon" />} 
              color="#52c41a"
            />
          </Col>
          <Col span={6}>
            <StatisticCard 
              title="Rejected" 
              value={stats.rejected} 
              icon={<CloseCircleOutlined className="statistic-icon" />} 
              color="#f5222d"
            />
          </Col>
        </Row>

        <Card title="Applications" className="applications-card">
          <Space direction="vertical" size="middle" style={{ display: 'flex', marginBottom: '16px' }}>
            <Select
              defaultValue="all"
              style={{ width: 120 }}
              onChange={setFilterStatus}
            >
              <Option value="all">All</Option>
              <Option value="pending">Pending</Option>
              <Option value="accepted">Accepted</Option>
              <Option value="rejected">Rejected</Option>
            </Select>
          </Space>
          <Table columns={columns} dataSource={filteredApplications} rowKey="id" />
        </Card>
      </Card>

      <Modal
        title="Application Details"
        visible={applicationModalVisible}
        onCancel={handleCloseApplicationModal}
        footer={null}
        width={800}
        className="application-modal"
      >
        {selectedApplication && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Full Name">{selectedApplication.fullName}</Descriptions.Item>
            <Descriptions.Item label="Date of Birth">{selectedApplication.dateOfBirth}</Descriptions.Item>
            <Descriptions.Item label="Gender">{selectedApplication.gender}</Descriptions.Item>
            <Descriptions.Item label="Email">{selectedApplication.email}</Descriptions.Item>
            <Descriptions.Item label="Phone Number">{selectedApplication.phoneNumber}</Descriptions.Item>
            <Descriptions.Item label="Caste">{selectedApplication.caste}</Descriptions.Item>
            <Descriptions.Item label="Sub Caste">{selectedApplication.subCaste}</Descriptions.Item>
            <Descriptions.Item label="Religion">{selectedApplication.religion}</Descriptions.Item>
            <Descriptions.Item label="Parent Religion">{selectedApplication.parentReligion}</Descriptions.Item>
            <Descriptions.Item label="Guardian Name">{selectedApplication.guardianName}</Descriptions.Item>
            <Descriptions.Item label="Guardian Type">{selectedApplication.guardianType}</Descriptions.Item>
            <Descriptions.Item label="Marital Status">{selectedApplication.maritalStatus}</Descriptions.Item>
            <Descriptions.Item label="Aadhar Number">{selectedApplication.aadharNumber}</Descriptions.Item>
            <Descriptions.Item label="Address">{selectedApplication.address}</Descriptions.Item>
            <Descriptions.Item label="Pincode">{selectedApplication.pincode}</Descriptions.Item>
            <Descriptions.Item label="Proof of Residence">
              {selectedApplication.proofOfResidence.type}
              <Button type="link" onClick={() => window.open(selectedApplication.proofOfResidence.file)}>View File</Button>
            </Descriptions.Item>
            <Descriptions.Item label="Proof of Date of Birth">
              {selectedApplication.proofOfDateOfBirth.type}
              <Button type="link" onClick={() => window.open(selectedApplication.proofOfDateOfBirth.file)}>View File</Button>
            </Descriptions.Item>
            <Descriptions.Item label="Proof of Caste">
              {selectedApplication.proofOfCaste.type}
              <Button type="link" onClick={() => window.open(selectedApplication.proofOfCaste.file)}>View File</Button>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Modal
        title="Verification Checklist"
        visible={checklistModalVisible}
        onCancel={() => setChecklistModalVisible(false)}
        footer={[
          <Button key="reject" danger icon={<CloseCircleOutlined />} onClick={handleRejectApplication}>
            Reject
          </Button>,
          <Button key="accept" type="primary" icon={<CheckCircleOutlined />} onClick={handleAcceptApplication}>
            Accept
          </Button>,
        ]}
        width={600}
        className="checklist-modal"
      >
        <Form layout="vertical">
          {verificationChecklist.map((item, index) => (
            <Form.Item key={index}>
              <Checkbox
                checked={checklist[item]}
                onChange={(e) => handleChecklistItemChange(item, e.target.checked)}
              >
                {item}
              </Checkbox>
            </Form.Item>
          ))}
          <Form.Item label="Rejection Reason (if applicable)">
            <Input.TextArea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Provide a reason for rejection"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="SVRO Profile"
        placement="right"
        onClose={() => setProfileDrawerVisible(false)}
        visible={profileDrawerVisible}
        width={400}
        className="profile-drawer"
      >
        <Card className="profile-card">
          <Space align="center" style={{ marginBottom: 16 }}>
            <Avatar size={64} icon={<UserOutlined />} />
            <div>
              <Title level={4}>{svroInfo.name}</Title>
              <Text type="secondary">Sachivalayam Village Revenue Officer</Text>
            </div>
          </Space>
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Ward/Village">{svroInfo.wardVillage}</Descriptions.Item>
            <Descriptions.Item label="Email">{svroInfo.email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{svroInfo.phone}</Descriptions.Item>
          </Descriptions>
        </Card>
      </Drawer>

      <style jsx>{`
        .svro-dashboard {
          padding: 24px;
          background-color: #f0f2f5;
          min-height: 100vh;
        }
        .dashboard-header {
          margin-bottom: 24px;
        }
        .dashboard-title {
          color: #1890ff;
          margin-bottom: 8px;
        }
        .statistics-row {
          margin-top: 24px;
          margin-bottom: 24px;
        }
        .statistic-card {
          text-align: center;
          padding: 16px;
          border-radius: 8px;
        }
        .statistic-icon {
          font-size: 32px;
          color: #fff;
        }
        .applications-card {
          margin-top: 24px;
        }
        .application-modal .ant-descriptions-item-label {
          font-weight: bold;
        }
        .checklist-modal .ant-checkbox-wrapper {
          margin-bottom: 8px;
        }
        .profile-drawer .ant-drawer-body {
          padding: 0;
        }
        .profile-card {
          height: 100%;
        }
      `}</style>
    </div>
  );
};

export default Svro;