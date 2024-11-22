import React, { useState, useEffect } from 'react';
import { Table, Select, Modal, Button, Space, Typography, message, Descriptions, Card, Drawer, Avatar, Progress, Badge, Row, Col, Divider } from 'antd';
import { UserOutlined, LogoutOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, BarChartOutlined, FileTextOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const { Option } = Select;
const { Title, Text } = Typography;

// Mock data for demonstration
const mockVillages = [
  { id: '001', name: 'Village A', vro: 'VRO 1', pendingCount: 5 },
  { id: '002', name: 'Village B', vro: 'VRO 2', pendingCount: 3 },
  { id: '003', name: 'Village C', vro: 'VRO 3', pendingCount: 7 },
];

const mockApplications = [
  { id: 'APP001', name: 'John Doe', village: 'Village A', status: 'pending', submissionDate: '2023-05-01' },
  { id: 'APP002', name: 'Jane Smith', village: 'Village B', status: 'approved', submissionDate: '2023-05-02' },
  { id: 'APP003', name: 'Bob Johnson', village: 'Village C', status: 'rejected', submissionDate: '2023-05-03' },
];

const mockUserData = {
  username: 'John Smith',
  role: 'Mandal Revenue Officer',
  email: 'john.smith@example.com',
  mandal: 'Secunderabad'
};

// Mock function to fetch application count per month
const fetchApplicationCountPerMonth = (villageId) => {
  return [
    { month: 'Jan', count: 10 },
    { month: 'Feb', count: 15 },
    { month: 'Mar', count: 8 },
    { month: 'Apr', count: 12 },
    { month: 'May', count: 20 },
  ];
};

// Mock function to fetch full application details
const fetchFullApplication = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id,
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phoneNumber: '+91 9876543210',
          aadharId: '1234 5678 9012',
          caste: 'General',
        },
        addressInfo: {
          address: '123 Main St, Apartment 4B',
          pincode: '500001',
          ward: 'Ward 7',
          state: 'Telangana',
          district: 'Hyderabad',
          city: 'Hyderabad',
          mandal: 'Secunderabad',
        },
        proofOfResidence: {
          documentType: 'Electricity Bill',
          fileUrl: 'https://example.com/electricity-bill.pdf',
        },
        proofOfDateOfBirth: {
          documentType: 'Passport',
          fileUrl: 'https://example.com/passport.pdf',
        },
        proofOfCaste: {
          documentType: 'Caste Certificate',
          fileUrl: 'https://example.com/caste-certificate.pdf',
        },
        vroRemarks: 'All documents verified and found to be in order.',
      });
    }, 500);
  });
};

export default function Mro() {
  const [villages, setVillages] = useState(mockVillages);
  const [applications, setApplications] = useState(mockApplications);
  const [filteredApplications, setFilteredApplications] = useState(mockApplications);
  const [filterStatus, setFilterStatus] = useState('all');
  const [applicationModalVisible, setApplicationModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [villageModalVisible, setVillageModalVisible] = useState(false);
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [applicationCountData, setApplicationCountData] = useState([]);
  const [loadingRows, setLoadingRows] = useState({});
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [userData, setUserData] = useState(mockUserData);

  useEffect(() => {
    if (filterStatus === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter(app => app.status === filterStatus));
    }
  }, [filterStatus, applications]);

  const handleViewApplication = async (id) => {
    setLoadingRows(prev => ({ ...prev, [id]: true }));
    try {
      const fullApplication = await fetchFullApplication(id);
      setSelectedApplication(fullApplication);
      setApplicationModalVisible(true);
    } catch (error) {
      message.error('Failed to load application details');
    } finally {
      setLoadingRows(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleViewVillageStats = (village) => {
    setSelectedVillage(village);
    const data = fetchApplicationCountPerMonth(village.id);
    setApplicationCountData(data);
    setVillageModalVisible(true);
  };

  const handleApproveApplication = () => {
    message.success('Application approved');
    setApplicationModalVisible(false);
    // Implement the logic to approve the application
  };

  const handleRejectApplication = () => {
    message.warning('Application rejected');
    setApplicationModalVisible(false);
    // Implement the logic to reject the application
  };

  const openDrawer = () => {
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  const logout = () => {
    message.success('Logged out successfully');
    // Implement logout logic here
  };

  const villageColumns = [
    {
      title: 'Village/Ward Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'VRO',
      dataIndex: 'vro',
      key: 'vro',
    },
    {
      title: 'Pending Applications',
      dataIndex: 'pendingCount',
      key: 'pendingCount',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button 
          icon={<BarChartOutlined />} 
          onClick={() => handleViewVillageStats(record)}
        >
          See Statistics
        </Button>
      ),
    },
  ];

  const applicationColumns = [
    {
      title: 'Application ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Village/Ward',
      dataIndex: 'village',
      key: 'village',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge
          color={status === 'pending' ? 'yellow' : status === 'approved' ? 'green' : 'red'}
          text={status}
        />
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button 
          icon={<EyeOutlined />} 
          onClick={() => handleViewApplication(record.id)}
          loading={loadingRows[record.id]}
        >
          View Full Application
        </Button>
      ),
    },
  ];

  const totalApplications = applications.length;
  const approvedApplications = applications.filter(app => app.status === 'approved').length;
  const pendingApplications = applications.filter(app => app.status === 'pending').length;
  const rejectedApplications = applications.filter(app => app.status === 'rejected').length;

  const summaryCards = [
    {
      title: "Total Applications",
      value: totalApplications,
      icon: <FileTextOutlined style={{ fontSize: "16px" }} />,
    },
    {
      title: "Approved",
      value: approvedApplications,
      icon: <BarChartOutlined style={{ fontSize: "16px", color: "#52c41a" }} />,
      color: "#d1fae5",
    },
    {
      title: "Pending",
      value: pendingApplications,
      icon: <UserOutlined style={{ fontSize: "16px", color: "#faad14" }} />,
      color: "#fef3c7",
    },
    {
      title: "Rejected",
      value: rejectedApplications,
      icon: <ExclamationCircleOutlined style={{ fontSize: "16px", color: "#f5222d" }} />,
      color: "#fee2e2",
    },
  ];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 16px" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>MRO Dashboard</Title>
          <Text strong>{userData.username} - MRO of {userData.mandal} Mandal</Text>
        </div>
        <Button icon={<UserOutlined />} onClick={openDrawer}>Profile</Button>
      </div>

      <Row gutter={[24, 24]}>
        {summaryCards.map((card) => (
          <Col xs={24} sm={12} lg={6} key={card.title}>
            <Card style={{ backgroundColor: card.color || "#f3f4f6" }}>
              <Row justify="space-between" align="middle">
                <Typography.Text strong>{card.title}</Typography.Text>
                {card.icon}
              </Row>
              <Divider />
              <Typography.Title level={3}>{card.value}</Typography.Title>
            </Card>
          </Col>
        ))}
      </Row>

      <Divider />

      <Card style={{ marginBottom: '24px' }}>
        <Title level={4}>Villages/Wards</Title>
        <Table 
          columns={villageColumns} 
          dataSource={villages} 
          rowKey="id"
          pagination={false}
        />
      </Card>

      <Card>
        <Title level={4}>Applications</Title>
        <Space direction="vertical" size="middle" style={{ display: 'flex', width: '100%' }}>
          <div>
            <label htmlFor="status-filter" style={{ marginRight: '8px', fontWeight: 'bold' }}>Filter by Status:</label>
            <Select
              id="status-filter"
              defaultValue="all"
              style={{ width: 120 }}
              onChange={setFilterStatus}
            >
              <Option value="all">All</Option>
              <Option value="pending">Pending</Option>
              <Option value="approved">Approved</Option>
              <Option value="rejected">Rejected</Option>
            </Select>
          </div>
          <Table 
            columns={applicationColumns} 
            dataSource={filteredApplications} 
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Space>
      </Card>

      <Modal
        title={<Title level={3}>Full Application Details</Title>}
        visible={applicationModalVisible}
        onCancel={() => setApplicationModalVisible(false)}
        footer={[
          <Button key="reject" danger icon={<CloseCircleOutlined />} onClick={handleRejectApplication}>
            Reject Application
          </Button>,
          <Button key="approve" type="primary" icon={<CheckCircleOutlined />} onClick={handleApproveApplication}>
            Approve Application
          </Button>,
        ]}
        width={800}
      >
        {selectedApplication && (
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            <Card title="Personal Information" style={{ marginBottom: '16px' }}>
              <Descriptions bordered column={2}>
                <Descriptions.Item label="First Name">{selectedApplication.personalInfo.firstName}</Descriptions.Item>
                <Descriptions.Item label="Last Name">{selectedApplication.personalInfo.lastName}</Descriptions.Item>
                <Descriptions.Item label="Email">{selectedApplication.personalInfo.email}</Descriptions.Item>
                <Descriptions.Item label="Phone Number">{selectedApplication.personalInfo.phoneNumber}</Descriptions.Item>
                <Descriptions.Item label="Aadhar ID">{selectedApplication.personalInfo.aadharId}</Descriptions.Item>
                <Descriptions.Item label="Caste">{selectedApplication.personalInfo.caste}</Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="Address Information" style={{ marginBottom: '16px' }}>
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Address">{selectedApplication.addressInfo.address}</Descriptions.Item>
                <Descriptions.Item label="Pincode">{selectedApplication.addressInfo.pincode}</Descriptions.Item>
                <Descriptions.Item label="Ward">{selectedApplication.addressInfo.ward}</Descriptions.Item>
                <Descriptions.Item label="State">{selectedApplication.addressInfo.state}</Descriptions.Item>
                <Descriptions.Item label="District">{selectedApplication.addressInfo.district}</Descriptions.Item>
                <Descriptions.Item label="City">{selectedApplication.addressInfo.city}</Descriptions.Item>
                <Descriptions.Item label="Mandal">{selectedApplication.addressInfo.mandal}</Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="Document Information" style={{ marginBottom: '16px' }}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <DocumentDisplay
                  label="Proof of Residence"
                  documentType={selectedApplication.proofOfResidence.documentType}
                  fileUrl={selectedApplication.proofOfResidence.fileUrl}
                />
                <DocumentDisplay
                  label="Proof of Date of Birth"
                  documentType={selectedApplication.proofOfDateOfBirth.documentType}
                  fileUrl={selectedApplication.proofOfDateOfBirth.fileUrl}
                />
                <DocumentDisplay
                  label="Proof of Caste"
                  documentType={selectedApplication.proofOfCaste.documentType}
                  fileUrl={selectedApplication.proofOfCaste.fileUrl}
                />
              </Space>
            </Card>

            <Card title="VRO Remarks" style={{ marginBottom: '16px' }}>
              <p>{selectedApplication.vroRemarks}</p>
            </Card>
          </div>
        )}
      </Modal>

      <Modal
        title={<Title level={3}>{selectedVillage ? `${selectedVillage.name} Statistics` : 'Village Statistics'}</Title>}
        visible={villageModalVisible}
        onCancel={() => setVillageModalVisible(false)}
        footer={null}
        width={800}
      >
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={applicationCountData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" label={{ value: 'Months', position: 'insideBottomRight', offset: -10 }} />
            <YAxis label={{ value: 'Application Count', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#8884d8" name="Application Count" />
          </LineChart>
        </ResponsiveContainer>
      </Modal>

      <Drawer
        title="User Profile"
        placement="right"
        onClose={closeDrawer}
        open={drawerVisible}
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar size={64} icon={<UserOutlined />} />
            <div>
              <h2 className="text-xl font-semibold">{userData.username}</h2>
              <p className="text-gray-500">{userData.role}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p>{userData.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Mandal</p>
            <p>{userData.mandal}</p>
          </div>
          <Button block onClick={() => {
            message.info('Navigating to full profile page');
            closeDrawer();
          }}>
            View Full Profile
          </Button>
          <Button danger block onClick={() => {
            logout();
            closeDrawer();
          }}>
            <LogoutOutlined /> Logout
          </Button>
        </div>
      </Drawer>
    </div>
  );
}

function DocumentDisplay({ label, documentType, fileUrl }) {
  return (
    <Card size="small" title={label} extra={<a href={fileUrl} target="_blank" rel="noopener noreferrer">View File</a>}>
      <Space>
        <EyeOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
        <span>{documentType}</span>
      </Space>
    </Card>
  );
}