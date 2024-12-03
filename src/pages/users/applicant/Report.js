import React, { useState, useEffect, useContext } from 'react';
import {
  Card,
  Table,
  Row,
  Col,
  DatePicker,
  Button,
  Select,
  Typography,
  Layout,
  Menu,
  Avatar
} from 'antd';
import {
  DownloadOutlined,
  PrinterOutlined,
  UserOutlined,
  HomeOutlined,
  PlusCircleOutlined,
  FileTextOutlined,
  FileSearchOutlined,
  BarsOutlined,
  LogoutOutlined,
  BellOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../../../components/userContext';
import axios from 'axios';
import '../../../styles/Dashboard.css';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Header, Content, Sider } = Layout;

const Report = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([]);
  const [status, setStatus] = useState('ALL');
  const { token, logout } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: 'Home',
      onClick: () => navigate('/applicant')
    },
    {
      key: 'new-application',
      icon: <PlusCircleOutlined />,
      label: 'Create New Application',
      onClick: () => navigate('/applicant/new-application')
    },
    {
      key: 'my-applications',
      icon: <FileTextOutlined />,
      label: 'My Applications',
      onClick: () => navigate('/applicant/applications')
    },
    {
      key: 'application-status',
      icon: <FileSearchOutlined />,
      label: 'Application Status',
      onClick: () => navigate('/applicant/status')
    },
    {
      key: 'reports',
      icon: <BarsOutlined />,
      label: 'Reports',
      onClick: () => navigate('/applicant/reports')
    }
  ];

  const columns = [
    {
      title: 'Application ID',
      dataIndex: 'application_id',
      key: 'application_id',
    },
    {
      title: 'Submission Date',
      dataIndex: 'submission_date',
      key: 'submission_date',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Processing Time (Days)',
      dataIndex: 'processing_time',
      key: 'processing_time',
    },
    {
      title: 'Comments',
      dataIndex: 'comments',
      key: 'comments',
    }
  ];

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {
        status: status !== 'ALL' ? status : undefined,
        startDate: dateRange[0]?.format('YYYY-MM-DD'),
        endDate: dateRange[1]?.format('YYYY-MM-DD'),
      };

      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/applicant/reports`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params
        }
      );
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [token, status, dateRange]);

  const handleExport = () => {
    // Implement export functionality
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div className="logo">
          <Avatar size={48} icon={<UserOutlined />} />
        </div>
        <Menu
          theme="dark"
          selectedKeys={['reports']}
          mode="inline"
          items={menuItems}
        />
        <Menu
          theme="dark"
          selectable={false}
          mode="inline"
          items={[
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: 'Logout',
              onClick: logout,
            },
          ]}
          style={{ position: 'absolute', bottom: 0, width: '100%' }}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header style={{ padding: 15, background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 24px' }}>
            <Title level={4} style={{ margin: 0, flex: 1 }}>
              Application Reports
            </Title>
            <BellOutlined style={{ fontSize: '20px', marginRight: '24px' }} />
            <Avatar icon={<UserOutlined />} />
          </div>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          <Card>
            <Row gutter={[16, 16]} align="middle" justify="space-between">
              <Col>
                <RangePicker
                  onChange={setDateRange}
                  style={{ marginRight: '16px' }}
                />
                <Select
                  value={status}
                  onChange={setStatus}
                  style={{ width: 120 }}
                >
                  <Select.Option value="ALL">All Status</Select.Option>
                  <Select.Option value="PENDING">Pending</Select.Option>
                  <Select.Option value="APPROVED">Approved</Select.Option>
                  <Select.Option value="REJECTED">Rejected</Select.Option>
                </Select>
              </Col>
              <Col>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleExport}
                  style={{ marginRight: '8px' }}
                >
                  Export
                </Button>
                <Button
                  icon={<PrinterOutlined />}
                  onClick={handlePrint}
                >
                  Print
                </Button>
              </Col>
            </Row>

            <Table
              style={{ marginTop: '16px' }}
              columns={columns}
              dataSource={reports}
              loading={loading}
              rowKey="application_id"
              pagination={{
                pageSize: 10,
                showTotal: (total) => `Total ${total} items`
              }}
            />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Report;
