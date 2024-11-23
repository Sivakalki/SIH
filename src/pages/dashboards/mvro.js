import React, { useState, useEffect } from 'react';
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

// Example database
const mockApplications = [
  {
    id: 'APP001',
    name: 'John Doe',
    status: 'pending',
    personalInfo: {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phoneNumber: '+91 9876543210',
      aadharId: '1234 5678 9012',
      caste: 'General'
    },
    addressInfo: {
      address: '123 Main St, Apartment 4B',
      pincode: '500001',
      ward: 'Ward 7',
      state: 'Telangana',
      district: 'Hyderabad',
      mandal: 'Secunderabad'
    },
    documents: {
      proofOfResidence: { type: 'Electricity Bill', url: 'https://example.com/electricity-bill.pdf' },
      proofOfDateOfBirth: { type: 'Passport', url: 'https://example.com/passport.pdf' },
      proofOfCaste: { type: 'Caste Certificate', url: 'https://example.com/caste-certificate.pdf' }
    },
    mvroRemarks: 'All documents verified and found to be in order.'
  },
  {
    id: 'APP002',
    name: 'Jane Smith',
    status: 'approved',
    personalInfo: {
      fullName: 'Jane Smith',
      email: 'jane.smith@example.com',
      phoneNumber: '+91 9876543211',
      aadharId: '1234 5678 9013',
      caste: 'OBC'
    },
    addressInfo: {
      address: '456 Park Avenue',
      pincode: '500002',
      ward: 'Ward 12',
      state: 'Telangana',
      district: 'Hyderabad',
      mandal: 'Secunderabad'
    },
    documents: {
      proofOfResidence: { type: 'Rent Agreement', url: 'https://example.com/rent-agreement.pdf' },
      proofOfDateOfBirth: { type: 'Passport', url: 'https://example.com/passport.pdf' },
      proofOfCaste: { type: 'OBC Certificate', url: 'https://example.com/obc-certificate.pdf' }
    },
    mvroRemarks: 'All documents verified and found to be in order.'
  },
  {
    id: 'APP003',
    name: 'Bob Johnson',
    status: 'rejected',
    personalInfo: {
      fullName: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      phoneNumber: '+91 9876543212',
      aadharId: '1234 5678 9014',
      caste: 'SC'
    },
    addressInfo: {
      address: '789 Lake View',
      pincode: '500003',
      ward: 'Ward 15',
      state: 'Telangana',
      district: 'Hyderabad',
      mandal: 'Secunderabad'
    },
    documents: {
      proofOfResidence: { type: 'Gas Bill', url: 'https://example.com/gas-bill.pdf' },
      proofOfDateOfBirth: { type: 'Voter ID', url: 'https://example.com/voter-id.pdf' },
      proofOfCaste: { type: 'SC Certificate', url: 'https://example.com/sc-certificate.pdf' }
    },
    mvroRemarks: 'All documents verified and found to be in order.'
  }
];

const mockRejectedApplications = [
  {
    id: 'APP004',
    name: 'Alice Brown',
    status: 'pending',
    personalInfo: {
      fullName: 'Alice Brown',
      email: 'alice.brown@example.com',
      phoneNumber: '+91 9876543213',
      aadharId: '1234 5678 9015',
      caste: 'General'
    },
    addressInfo: {
      address: '321 Hill Road',
      pincode: '500004',
      ward: 'Ward 18',
      state: 'Telangana',
      district: 'Hyderabad',
      mandal: 'Secunderabad'
    },
    documents: {
      proofOfResidence: { type: 'Water Bill', url: 'https://example.com/water-bill.pdf' },
      proofOfDateOfBirth: { type: 'PAN Card', url: 'https://example.com/pan-card.pdf' },
      proofOfCaste: { type: 'Birth Certificate', url: 'https://example.com/birth-certificate.pdf' }
    },
    mvroRemarks: 'All documents verified and found to be in order.',
    rejectedReason: 'Address proof needs clarification'
  }
];

// Mock user data
const userData = {
  name: 'John Smith',
  role: 'Mandal Village Revenue Officer',
  email: 'john.smith@gov.in',
  mandal: 'Secunderabad'
};



export default function MVRODashboard() {
  const [applications, setApplications] = useState([]);
  const [rejectedApps, setRejectedApps] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [rejectionModalVisible, setRejectionModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');


  // const [userType, setUserType] = useState("");
  // const [userData, setUserData] = useState(null);
  // const { token, logout } = useContext(UserContext);
  // const fetchData = async () => {
  //   try {
  //     const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/users/user`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`, // Include token in Authorization header
  //       },
  //     });
  //     setUserData(res.data.user);
  //     setRole(res.data.role);
  //     console.log(res, " is the response data")
  //   } catch (e) {
  //     console.error('There is an error in getting profile details', e);
  //     setUserData(null); // Reset userData if the request fails
  //   }
  // };

  // useEffect(() => {
  //   if (token) {
  //     fetchData();
  //   }
  // }, [token]);
  useEffect(() => {
    setApplications(mockApplications);
    setRejectedApps(mockRejectedApplications);
    setFilteredApplications(mockApplications);
  }, []);

  const filterApplications = (status) => {
    setFilterStatus(status);
    if (status === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter(app => app.status === status));
    }
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setModalVisible(true);
  };

  const handleStatusChange = (id, newStatus, isRejectedApp = false) => {
    if (newStatus === 'rejected') {
      setRejectionModalVisible(true);
    } else {
      updateApplicationStatus(id, newStatus, isRejectedApp);
    }
  };

  const updateApplicationStatus = (id, newStatus, isRejectedApp = false) => {
    if (isRejectedApp) {
      const updatedApps = rejectedApps.map(app =>
        app.id === id ? { ...app, status: newStatus, rejectedReason: rejectionReason } : app
      );
      setRejectedApps(updatedApps);
    } else {
      const updatedApps = applications.map(app =>
        app.id === id ? { ...app, status: newStatus, rejectedReason: rejectionReason } : app
      );
      setApplications(updatedApps);
      filterApplications(filterStatus);
    }
    setModalVisible(false);
    setRejectionModalVisible(false);
    setRejectionReason('');
    message.success(`Application ${newStatus}`);
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

  const StatisticCard = ({ title, value, status, backgroundColor, icon }) => (
    <Card
      style={{
        cursor: 'pointer',
        backgroundColor,
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
      onClick={() => filterApplications(status)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Statistic
          title={<span style={{ fontSize: '16px', color: 'rgba(0,0,0,0.85)' }}>{title}</span>}
          value={value}
          valueStyle={{ fontSize: '24px', color: 'rgba(0,0,0,0.85)' }}
        />
        {icon}
      </div>
    </Card>
  );

  const renderInfoBlock = (title, info) => (
    <div style={{ marginBottom: '24px' }}>
      <Title level={4} style={{ marginBottom: '16px' }}>{title}</Title>
      <Card>
        <Row gutter={[16, 16]}>
          {Object.entries(info).map(([key, value]) => (
            <Col span={12} key={key}>
              <div>
                <Text strong>{key.split(/(?=[A-Z])/).join(' ').replace(/\b\w/g, l => l.toUpperCase())}</Text>
              </div>
              <div>
                <Text>{value}</Text>
              </div>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );

  const renderDocumentBlock = (documents) => (
    <div style={{ marginBottom: '24px' }}>
      <Title level={4} style={{ marginBottom: '16px' }}>Document Information</Title>
      <Card>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
          <tbody>
            {Object.entries(documents).map(([key, value]) => (
              <tr key={key}>
                <td style={{ width: '50%', paddingRight: '16px' }}>
                  <Text strong>{key.split(/(?=[A-Z])/).join(' ').replace(/\b\w/g, l => l.toUpperCase())}</Text>
                </td>
                <td style={{ width: '50%' }}>
                  <Text>{value.type}</Text>
                  <Button type="link" onClick={() => window.open(value.url, '_blank')} style={{ padding: '0', marginLeft: '8px' }}>
                    View File
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );

  return (
    <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>MVRO Dashboard</Title>
            <Text>{userData.name} - MVRO of {userData.mandal} Mandal</Text>
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
            <StatisticCard
              title="Total Applications"
              value={applications.length}
              status="all"
              backgroundColor="#F5F5F5"
              icon={<FileTextOutlined style={{ fontSize: '24px', opacity: 0.7 }} />}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatisticCard
              title="Approved"
              value={applications.filter(app => app.status === 'approved').length}
              status="approved"
              backgroundColor="#E6FFE6"
              icon={<CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} />}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatisticCard
              title="Pending"
              value={applications.filter(app => app.status === 'pending').length}
              status="pending"
              backgroundColor="#FFF7E6"
              icon={<ClockCircleOutlined style={{ fontSize: '24px', color: '#faad14' }} />}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatisticCard
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
          dataSource={rejectedApps}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
        />
      </Card>

      <Modal
        title="Application Details"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button
            key="reject"
            danger
            onClick={() => handleStatusChange(selectedApplication?.id, 'rejected', selectedApplication?.id.startsWith('APP004'))
            }
          >
            Reject Application
          </Button>,
          <Button
            key="approve"
            type="primary"
            onClick={() =>
              handleStatusChange(selectedApplication?.id, 'approved', selectedApplication?.id.startsWith('APP004'))
            }
          >
            Approve Application
          </Button>,
        ]}
        width={800}
      >
        {selectedApplication && (
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {renderInfoBlock('Personal Information', selectedApplication.personalInfo)}
            <Divider />
            {renderInfoBlock('Address Information', selectedApplication.addressInfo)}
            <Divider />
            {renderDocumentBlock(selectedApplication.documents)}
            <Divider />
            <div>
              <Title level={4} style={{ marginBottom: '16px' }}>MVRO Remarks</Title>
              <Card>
                <Paragraph>{selectedApplication.mvroRemarks}</Paragraph>
              </Card>
            </div>
            {selectedApplication.rejectedReason && (
              <>
                <Divider />
                <div>
                  <Title level={4} style={{ marginBottom: '16px', color: '#f5222d' }}>Rejected Reason</Title>
                  <Card style={{ backgroundColor: '#fff1f0', borderColor: '#ffa39e' }}>
                    <Paragraph>{selectedApplication.rejectedReason}</Paragraph>
                  </Card>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title="Reject Application"
        visible={rejectionModalVisible}
        onCancel={() => setRejectionModalVisible(false)}
        onOk={() => updateApplicationStatus(selectedApplication?.id, 'rejected', selectedApplication?.id.startsWith('APP004'))}
      >
        <div style={{ marginBottom: '16px' }}>
          <Text>Please provide a reason for rejecting this application:</Text>
        </div>
        <Input.TextArea
          rows={4}
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="Enter rejection reason"
        />
      </Modal>

      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#f0f2f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserOutlined style={{ fontSize: '24px' }} />
            </div>
            <div>
              <Title level={4} style={{ margin: 0 }}>{userData.name}</Title>
              <Text type="secondary">{userData.role}</Text>
            </div>
          </div>
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={300}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>Email</Text>
            <Text>{userData.email}</Text>
          </div>
          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>Mandal</Text>
            <Text>{userData.mandal}</Text>
          </div>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button block>View Full Profile</Button>
            <Button
              block
              danger
              icon={<LogoutOutlined />}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              Logout
            </Button>
          </Space>
        </div>
      </Drawer>
    </div>
  );
}

