import React, { useState, useEffect, useContext } from 'react';
import {
  Layout,
  Menu,
  Typography,
  Card,
  Row,
  Col,
  Badge,
  Button,
  Space,
  Spin,
  Calendar,
  Select,
  message,
  Avatar,
  Drawer
} from 'antd';
import {
  HomeOutlined,
  FileTextOutlined,
  CalendarOutlined,
  BarsOutlined,
  CheckCircleOutlined,
  LogoutOutlined,
  BellOutlined,
  UserOutlined,
  QuestionCircleOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  FileSearchOutlined
} from '@ant-design/icons';
import { UserContext } from '../../../components/userContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Line } from '@ant-design/plots';
import { Link } from 'react-router-dom';
import StatisticCard from './utils/statistic-card';
import NotificationDrawer from './utils/notification-drawer';
import ApplicationDetailsModal from '../../../components/modals/ApplicationDetailsModal';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import '../../../styles/Dashboard.css';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const NavItem = ({ to, children, isActive }) => {
  const navigate = useNavigate();
  const handleClick = (e) => {
    e.preventDefault();
    navigate(to);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`px-4 py-2 rounded-md cursor-pointer ${isActive ? 'bg-secondary text-white' : 'text-white hover:bg-secondary/10'}`}
      onClick={handleClick}
    >
      {children}
    </motion.div>
  );
};

const mockNotifications = [
  { id: 1, message: 'New application submitted', read: false },
  { id: 2, message: 'Application #1234 approved', read: true },
  { id: 3, message: 'Reminder: Review pending applications', read: false },
];

const monthRanges = {
  'Jan-Jul': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  'Aug-Dec': ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

const NewsTicker = ({ news }) => {
  return (
    <div style={{
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      background: '#4169E1',
      padding: '8px 0',
      color: '#FFFFFF',
      width: '100%'
    }}>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: "-100%" }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ display: 'inline-block' }}
      >
        {news.join(' • ')}
      </motion.div>
    </div>
  );
};

export default function RIDashboard() {
  const [profileDrawerVisible, setProfileDrawerVisible] = useState(false);
  const [notificationDrawerVisible, setNotificationDrawerVisible] = useState(false);
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [news] = useState([
    'Welcome to CertiTrack RI Dashboard',
    'New application verification guidelines updated',
    'Monthly reports due by end of the month',
    'System maintenance scheduled for next weekend',
    'New field verification protocol implemented'
  ]);
  const { token, logout } = useContext(UserContext);
  const [errorMessage, setErrorMessage] = useState("");
  const [userLoading, setUserLoading] = useState(true);
  const [activeNavItem, setActiveNavItem] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState({
    pendingApplications: 0,
    completedApplications: 0,
    totalApplications: 0,
    reportNotifications: 0,
    reCheckApplications: 0,
    reportSubmissions: 0,
    readyToReview: 0,
    monthlyData: []
  });
  const [selectedYear, setSelectedYear] = useState('2023');
  const [role, setRole] = useState("");
  const [selectedRange, setSelectedRange] = useState('all');
  const [loading, setLoading] = useState(true);
  const [scheduledApplications, setScheduledApplications] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!token) {
      setErrorMessage("You are not logged in. Please log in to access this page.");
      setUserLoading(false);
      return;
    }
    fetchData();
    fetchDashboardData();
  }, [token]);

  useEffect(() => {
    if (userData && role && role !== "RI") {
      setErrorMessage("Access denied. Only RIs are allowed to view this page.");
      setUserLoading(false);
    }
  }, [role]);

  const fetchDashboardData = async () => {
    if (token) {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/ri/load_dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data) {
          console.log("Dashboard data:", response.data);
          setDashboardData(response.data);
        } else {
          console.error("Unexpected response format:", response);
          message.error("Invalid response from the server");
        }
      } catch (e) {
        console.error("Error fetching dashboard data:", e);
        message.error("Failed to fetch dashboard data.");
      }
    }
  };

  const fetchData = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/users/user`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in Authorization header
        },
      });
      setUserData(res.data.user);
      setRole(res.data.role);
    } catch (e) {
      setErrorMessage("Token expired. Login again")
      console.error('There is an error in getting profile details', e);
      setUserData(null); // Reset userData if the request fails
    } finally {
      setUserLoading(false); // Stop loading after data is fetched
    }
  };

  const config = {
    data: dashboardData.monthlyData,
    xField: 'month',
    yField: 'applications',
    seriesField: 'year',
    smooth: true,
    tooltip: {
      showMarkers: true,
    },
    xAxis: {
      label: {
        autoRotate: false,
      },
    },
  };

  const openProfileDrawer = () => {
    setProfileDrawerVisible(true);
  };

  const handleLogout = () => {
    logout();
    message.success('Logged out successfully!');
    navigate('/login');
  };

  if (userLoading) {
    // Display a loading spinner while user data is being fetched
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
        <Spin size="large" />
        <Title level={3} style={{ marginTop: '20px' }}>Loading...</Title>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
        <Title level={3} style={{ color: '#f5222d' }}>{errorMessage}</Title>
        {<Button type="primary" onClick={() => navigate('/login')}>Go to Login</Button>}
      </div>
    );
  }

  const handleNavigate = (item) => {
    setActiveNavItem(item);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div className="news-ticker" style={{
        background: '#4169E1',
        color: 'white',
        padding: '28px',
        textAlign: 'center',
        marginBottom: '2px',
        width: '100%',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000
      }}>
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: "-100%" }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ display: 'inline-block', fontSize: '16px' }}
        >
          New online service for income certificate launched • Updated guidelines for caste certificate applications • Last date for property tax payment: 31st March
        </motion.div>
      </div>

      <Layout style={{ minHeight: '100vh', marginTop: '80px' }}>
        <Sider
          collapsible={false}
          style={{
            background: '#fff',
            boxShadow: '1px 0 0 0 #f0f0f0',
            position: 'fixed',
            height: '100vh',
            left: 0,
            top: '80px',
            zIndex: 999
          }}
          width={250}
        >
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <Title level={3} style={{
              margin: 0,
              color: '#1890ff',
              fontWeight: 600,
              letterSpacing: '0.5px'
            }}>
              CertiTrack
            </Title>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            onClick={({ key }) => navigate(key)}
            items={[
              {
                key: '/ri',
                icon: <HomeOutlined />,
                label: 'Dashboard',
              },
              {
                key: '/ri/applications',
                icon: <FileTextOutlined />,
                label: 'Applications',
              },
              {
                key: '/ri/completed',
                icon: <FileTextOutlined />,
                label: 'Completed Applications',
              },

              {
                key: '/ri/reports',
                icon: <BarsOutlined />,
                label: 'Reports',
              }
            ]}
            style={{
              border: 'none',
              padding: '8px 0',
              height: 'calc(100vh - 80px)',
              overflowY: 'auto'
            }}
          />
        </Sider>

        <Layout style={{ marginLeft: '250px' }}>
          <Header style={{
            padding: '0 16px',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            position: 'fixed',
            width: 'calc(100% - 250px)',
            top: '80px',
            right: 0,
            zIndex: 999
          }}>
            <Space>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button type="text" icon={<QuestionCircleOutlined />} />
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Badge count={notifications.filter(n => !n.read).length} overflowCount={99}>
                  <Button type="text" icon={<BellOutlined />} onClick={() => setNotificationDrawerVisible(true)} />
                </Badge>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button type="text" icon={<UserOutlined />} onClick={openProfileDrawer}>
                  {userData?.name}
                </Button>
              </motion.div>
            </Space>
          </Header>

          <Content style={{ margin: '88px 16px 24px', minHeight: 280 }}>
            <Title level={2} style={{ marginBottom: '8px' }}>RI Dashboard</Title>
            <Typography.Text style={{ marginBottom: '24px', display: 'block' }}>
              Welcome, {userData?.name}
            </Typography.Text>

            <Row gutter={[16, 16]}>
              <Col span={10}>
                <Space direction="vertical" style={{ width: '100%' }} size={16}>
                  
                  <Card
                    style={{
                      background: '#f5f5f5',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                    bodyStyle={{ padding: '24px' }}
                    onClick={() => navigate('/ri/applications')}
                    hoverable
                  >
                    <Space direction="vertical" size={8}>
                      <Space size={12}>
                        <FileTextOutlined style={{ fontSize: '24px', color: '#595959' }} />
                        <Typography.Text strong>Total Applications</Typography.Text>
                      </Space>
                      <Typography.Title level={2} style={{ margin: 0 }}>
                        {dashboardData.totalApplications}
                      </Typography.Title>
                    </Space>
                  </Card>

                  <Card
                    style={{
                      background: '#e6fffb',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      cursor: 'pointer'
                    }}
                    bodyStyle={{ padding: '24px' }}
                    onClick={() => navigate('/ri/pending')}
                    hoverable
                  >
                    <Space direction="vertical" size={8}>
                      <Space size={12}>
                        <BarChartOutlined style={{ fontSize: '24px', color: '#13c2c2' }} />
                        <Typography.Text strong style={{ color: '#13c2c2' }}>Ready to Review</Typography.Text>
                      </Space>
                      <Typography.Title level={2} style={{ margin: 0, color: '#13c2c2' }}>
                        {dashboardData.readyApplications || 0}
                      </Typography.Title>
                    </Space>
                  </Card>
                  <Card
                    style={{
                      background: '#f6ffed',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                    bodyStyle={{ padding: '24px' }}
                    onClick={() => navigate('/ri/completed')}
                    hoverable
                  >
                    <Space direction="vertical" size={8}>
                      <Space size={12}>
                        <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                        <Typography.Text strong style={{ color: '#52c41a' }}>Completed</Typography.Text>
                      </Space>
                      <Typography.Title level={2} style={{ margin: 0, color: '#52c41a' }}>
                        {dashboardData.completedApplications}
                      </Typography.Title>
                    </Space>
                  </Card>

                  <Card
                    style={{
                      background: '#fff7e6',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                    bodyStyle={{ padding: '24px' }}
                    onClick={() => navigate('/ri/pending')}
                    hoverable
                  >
                    <Space direction="vertical" size={8}>
                      <Space size={12}>
                        <ClockCircleOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />
                        <Typography.Text strong style={{ color: '#fa8c16' }}>Pending</Typography.Text>
                      </Space>
                      <Typography.Title level={2} style={{ margin: 0, color: '#fa8c16' }}>
                        {dashboardData.pendingApplications}
                      </Typography.Title>
                    </Space>
                  </Card>


                  <Card
                    style={{
                      background: '#f9f0ff',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                    bodyStyle={{ padding: '24px' }}
                    onClick={() => navigate('/ri/reports')}
                    hoverable
                  >
                    <Space direction="vertical" size={8}>
                      <Space size={12}>
                        <FileSearchOutlined style={{ fontSize: '24px', color: '#722ed1' }} />
                        <Typography.Text strong style={{ color: '#722ed1' }}>Reports</Typography.Text>
                      </Space>
                      <Typography.Title level={2} style={{ margin: 0, color: '#722ed1' }}>
                        {dashboardData.reportSubmissions}
                      </Typography.Title>
                    </Space>
                  </Card>
                </Space>
              </Col>

              <Col span={14}>
                <Card
                  title="Application Statistics"
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <Line {...config} />
                </Card>
              </Col>
            </Row>
          </Content>
        </Layout>
      </Layout>
      <Drawer
        title="User Profile"
        placement="right"
        onClose={() => setProfileDrawerVisible(false)}
        visible={profileDrawerVisible}
        bodyStyle={{ padding: '20px' }}
      >
        <p style={{ fontWeight: 'bold' }}><strong>Name:</strong> {userData?.name}</p>
        <p style={{ fontWeight: 'bold' }}><strong>Email:</strong> {userData?.email}</p>
        <p style={{ fontWeight: 'bold' }}><strong>Role:</strong> {userData?.role}</p>
        <Button type="primary" danger onClick={handleLogout} style={{ marginTop: '20px' }}>
          Logout
        </Button>
      </Drawer>
    </div>
  );
}
