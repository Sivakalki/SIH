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
import { Line } from '@ant-design/plots';

const { Option } = Select;
const { Title, Text, Paragraph } = Typography;

// Mock data
const mockApplications = [
  {
    id: 'APP001',
    name: 'John Doe',
    status: 'pending',
    village: 'Village 1',
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
    mroRemarks: 'All documents verified and found to be in order.'
  },
  {
    id: 'APP002',
    name: 'Jane Smith',
    status: 'approved',
    village: 'Village 2',
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
    mroRemarks: 'All documents verified and found to be in order.'
  },
  {
    id: 'APP003',
    name: 'Bob Johnson',
    status: 'rejected',
    village: 'Village 3',
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
    mroRemarks: 'All documents verified and found to be in order.'
  }
];

const villages = ['All', 'Village 1', 'Village 2', 'Village 3'];

const statisticsData = {
  'Village 1': [
    { month: 'Jan', applications: 10 },
    { month: 'Feb', applications: 15 },
    { month: 'Mar', applications: 20 },
    { month: 'Apr', applications: 18 },
    { month: 'May', applications: 25 },
    { month: 'Jun', applications: 30 },
    { month: 'Jul', applications: 28 },
    { month: 'Aug', applications: 35 },
    { month: 'Sep', applications: 32 },
    { month: 'Oct', applications: 40 },
    { month: 'Nov', applications: 38 },
    { month: 'Dec', applications: 45 }
  ],
  'Village 2': [
    { month: 'Jan', applications: 8 },
    { month: 'Feb', applications: 12 },
    { month: 'Mar', applications: 18 },
    { month: 'Apr', applications: 22 },
    { month: 'May', applications: 20 },
    { month: 'Jun', applications: 28 },
    { month: 'Jul', applications: 25 },
    { month: 'Aug', applications: 30 },
    { month: 'Sep', applications: 28 },
    { month: 'Oct', applications: 35 },
    { month: 'Nov', applications: 32 },
    { month: 'Dec', applications: 40 }
  ],
  'Village 3': [
    { month: 'Jan', applications: 5 },
    { month: 'Feb', applications: 10 },
    { month: 'Mar', applications: 15 },
    { month: 'Apr', applications: 12 },
    { month: 'May', applications: 18 },
    { month: 'Jun', applications: 22 },
    { month: 'Jul', applications: 20 },
    { month: 'Aug', applications: 25 },
    { month: 'Sep', applications: 23 },
    { month: 'Oct', applications: 28 },
    { month: 'Nov', applications: 26 },
    { month: 'Dec', applications: 30 }
  ]
};

const userData = {
  name: 'John Smith',
  role: 'Mandal Revenue Officer',
  email: 'john.smith@gov.in',
  mandal: 'Secunderabad'
};

export default function MRODashboard() {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [totalApplications, setTotalApplications] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedVillage, setSelectedVillage] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [rejectionModalVisible, setRejectionModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [statisticsModalVisible, setStatisticsModalVisible] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setApplications(mockApplications);
    setTotalApplications(mockApplications);
    filterApplications('all', 'All');
  }, []);

  const filterApplications = (status, village) => {
    setFilterStatus(status);
    setSelectedVillage(village);
    let filtered = applications;
    if (village !== 'All') {
      filtered = filtered.filter(app => app.village === village);
    }
    if (status !== 'all') {
      filtered = filtered.filter(app => app.status === status);
    }
    setFilteredApplications(filtered);

    // Update total applications based on village selection
    if (village === 'All') {
      setTotalApplications(applications);
    } else {
      setTotalApplications(applications.filter(app => app.village === village));
    }
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setModalVisible(true);
  };

  const handleStatusChange = (id, newStatus) => {
    if (newStatus === 'rejected') {
      setRejectionModalVisible(true);
    } else {
      updateApplicationStatus(id, newStatus);
    }
  };

  const updateApplicationStatus = (id, newStatus) => {
    const updatedApps = applications.map(app =>
      app.id === id ? { ...app, status: newStatus, rejectedReason: rejectionReason } : app
    );
    setApplications(updatedApps);
    
    const updatedFilteredApps = filteredApplications.map(app =>
      app.id === id ? { ...app, status: newStatus, rejectedReason: rejectionReason } : app
    );
    setFilteredApplications(updatedFilteredApps);

    // Update total applications
    setTotalApplications(updatedApps.filter(app => selectedVillage === 'All' || app.village === selectedVillage));

    setModalVisible(false);
    setRejectionModalVisible(false);
    setRejectionReason('');
    message.success(`Application ${newStatus}`);

    const updatedVillage = selectedVillage === 'All' ? 'All' : updatedApps.find(app => app.id === id).village;
    updateStatistics(updatedVillage, newStatus);
  };

  const updateStatistics = (village, newStatus) => {
    const villagesToUpdate = village === 'All' ? villages.filter(v => v !== 'All') : [village];
    
    villagesToUpdate.forEach(v => {
      const villageData = statisticsData[v];
      if (villageData) {
        const lastMonth = villageData[villageData.length - 1];
        lastMonth.applications += 1;
      }
    });

    setStatisticsModalVisible(prev => !prev);
    setStatisticsModalVisible(prev => !prev);
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

  const StatisticCard = ({ title, count, status, backgroundColor, icon }) => (
    <Card
      style={{
        cursor: 'pointer',
        backgroundColor,
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
      onClick={() => filterApplications(status, selectedVillage)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Statistic
          title={<span style={{ fontSize: '16px', color: 'rgba(0,0,0,0.85)' }}>{title}</span>}
          value={count}
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

  const renderStatisticsGraph = () => {
    let data;
    if (selectedVillage === 'All') {
      data = Object.values(statisticsData).reduce((acc, villageData) => {
        villageData.forEach((monthData, index) => {
          if (!acc[index]) {
            acc[index] = { month: monthData.month, applications: 0 };
          }
          acc[index].applications += monthData.applications;
        });
        return acc;
      }, []);
    } else {
      data = statisticsData[selectedVillage] || [];
    }

    
const config = {
      data,
      xField: 'month',
      yField: 'applications',
      xAxis: {
        type: 'cat',
      },
      yAxis: {
        label: {
          formatter: (v) => `${v}`,
        },
      },
      smooth: true,
      animation: {
        appear: {
          animation: 'path-in',
          duration: 5000,
        },
      },
    };

    return <Line {...config} />;
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>MRO Dashboard</Title>
            <Text>{userData.name} - MRO of {userData.mandal} Mandal</Text>
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
              count={totalApplications.length}
              status="all"
              backgroundColor="#F5F5F5"
              icon={<FileTextOutlined style={{ fontSize: '24px', opacity: 0.7 }} />}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatisticCard
              title="Approved"
              count={filteredApplications.filter(app => app.status === 'approved').length}
              status="approved"
              backgroundColor="#E6FFE6"
              icon={<CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} />}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatisticCard
              title="Pending"
              count={filteredApplications.filter(app => app.status === 'pending').length}
              status="pending"
              backgroundColor="#FFF7E6"
              icon={<ClockCircleOutlined style={{ fontSize: '24px', color: '#faad14' }} />}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <StatisticCard
              title="Rejected"
              count={filteredApplications.filter(app => app.status === 'rejected').length}
              status="rejected"
              backgroundColor="#FFF1F0"
              icon={<CloseCircleOutlined style={{ fontSize: '24px', color: '#f5222d' }} />}
            />
          </Col>
        </Row>

        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div>
                <label htmlFor="village-filter" style={{ marginRight: '8px', fontWeight: 'bold' }}>Select Village:</label>
                <Select
                  id="village-filter"
                  value={selectedVillage}
                  style={{ width: 120 }}
                  onChange={(value) => filterApplications(filterStatus, value)}
                >
                  {villages.map(village => (
                    <Option key={village} value={village}>{village}</Option>
                  ))}
                </Select>
              </div>
              <Button onClick={() => setStatisticsModalVisible(true)}>
                See Statistics
              </Button>
            </div>
            <div>
              <label htmlFor="status-filter" style={{ marginRight: '8px', fontWeight: 'bold' }}>Filter by Status:</label>
              <Select
                id="status-filter"
                value={filterStatus}
                style={{ width: 120 }}
                onChange={(value) => filterApplications(value, selectedVillage)}
              >
                <Option value="all">All</Option>
                <Option value="approved">Approved</Option>
                <Option value="pending">Pending</Option>
                <Option value="rejected">Rejected</Option>
              </Select>
            </div>
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

      <Modal
        title="Application Details"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button
            key="reject"
            danger
            onClick={() => handleStatusChange(selectedApplication?.id, 'rejected')}
          >
            Reject Application
          </Button>,
          <Button
            key="approve"
            type="primary"
            onClick={() => handleStatusChange(selectedApplication?.id, 'approved')}
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
              <Title level={4} style={{ marginBottom: '16px' }}>MRO Remarks</Title>
              <Card>
                <Paragraph>{selectedApplication.mroRemarks}</Paragraph>
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
        onOk={() => updateApplicationStatus(selectedApplication?.id, 'rejected')}
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

      <Modal
        title="Village Statistics"
        visible={statisticsModalVisible}
        onCancel={() => setStatisticsModalVisible(false)}
        footer={null}
        width={800}
      >
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="year-select" style={{ marginRight: '8px', fontWeight: 'bold' }}>Select Year:</label>
          <Select
            id="year-select"
            value={selectedYear}
            style={{ width: 120 }}
            onChange={setSelectedYear}
          >
            {[2021, 2022, 2023, 2024].map(year => (
              <Option key={year} value={year}>{year}</Option>
            ))}
          </Select>
        </div>
        {renderStatisticsGraph()}
      </Modal>
    </div>
  );
}

