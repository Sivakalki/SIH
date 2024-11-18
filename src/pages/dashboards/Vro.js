import React, { useState, useEffect } from 'react';
import { Table, Select, Modal, Button, Space, Typography, message, Descriptions, Divider, Card, Image, Drawer, Avatar } from 'antd';
import { EyeOutlined, FileOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title } = Typography;

// Mock data for demonstration
const mockApplications = [
  { id: '001', name: 'John Doe', status: 'pending' },
  { id: '002', name: 'Jane Smith', status: 'completed' },
  { id: '003', name: 'Bob Johnson', status: 'rejected' },
  // Add more mock data as needed
];

// Mock user data
const mockUserData = {
  username: 'VRO Officer',
  role: 'Village Revenue Officer',
  email: 'vro@example.com'
};

// Mock function to fetch full application details
const fetchFullApplication = (id) => {
  // Simulate API call
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
      });
    }, 500);
  });
};

export default function VRODashboard() {
  const [applications, setApplications] = useState(mockApplications);
  const [filteredApplications, setFilteredApplications] = useState(mockApplications);
  const [filterStatus, setFilterStatus] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
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
      setModalVisible(true);
    } catch (error) {
      message.error('Failed to load application details');
    } finally {
      setLoadingRows(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleSendToMRO = () => {
    message.success('Application sent to MRO');
    setModalVisible(false);
    // Implement the logic to send to MRO
  };

  const handleRejectApplication = () => {
    message.warning('Application rejected');
    setModalVisible(false);
    // Implement the logic to reject the application
  };

  const openDrawer = () => {
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  const logout = () => {
    // Implement logout logic here
    message.success('Logged out successfully');
    // Redirect to login page or perform other logout actions
  };

  const columns = [
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
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
          onClick={() => handleViewApplication(record.id)}
          loading={loadingRows[record.id]}
        >
          View Full Application
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>VRO Dashboard</Title>
          <Button icon={<UserOutlined />} onClick={openDrawer}>Profile</Button>
        </div>
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
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
              <Option value="completed">Completed</Option>
              <Option value="rejected">Rejected</Option>
            </Select>
          </div>
          <Table 
            columns={columns} 
            dataSource={filteredApplications} 
            rowKey="id"
            pagination={{ pageSize: 10 }}
            style={{ overflowX: 'auto' }}
          />
        </Space>
      </Card>
      <Modal
        title={<Title level={3}>Full Application Details</Title>}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="reject" danger onClick={handleRejectApplication}>
            Reject Application
          </Button>,
          <Button key="sendMRO" type="primary" onClick={handleSendToMRO}>
            Send to MRO
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
          </div>
        )}
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
        <FileOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
        <span>{documentType}</span>
      </Space>
    </Card>
  );
}