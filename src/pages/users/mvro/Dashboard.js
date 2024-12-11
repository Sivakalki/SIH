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
  Drawer,
  Descriptions
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
import MvroLayout from '../../../components/layout/MvroLayout';
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

export default function MVRODashboard() {
  const [profileDrawerVisible, setProfileDrawerVisible] = useState(false);
  const [notificationDrawerVisible, setNotificationDrawerVisible] = useState(false);
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [news] = useState([
    'Welcome to CertiTrack MVRO Dashboard',
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
    if (userData && role && role !== "MVRO") {
      setErrorMessage("Access denied. Only MVROs are allowed to view this page.");
      setUserLoading(false);
    }
  }, [role]);

  const fetchDashboardData = async () => {
    if (token) {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/mvro/load_dashboard`, {
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
          Authorization: `Bearer ${token}`,
        },
      });
      setUserData(res.data.user);
      setRole(res.data.role);
      console.log(res, " is the response data")
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

  const closeProfileDrawer = () => {
    setProfileDrawerVisible(false);
  };

  const handleLogout = () => {
    logout();
    message.success('Logged out successfully!');
    navigate('/login');
  };

  if (userLoading) {
    // Display a loading spinner while user data is being fetched
    return (
      <MvroLayout logout={logout}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
          <Spin size="large" />
          <Title level={3} style={{ marginTop: '20px' }}>Loading...</Title>
        </div>
      </MvroLayout>
    );
  }

  if (errorMessage) {
    return (
      <MvroLayout logout={logout}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
          <Title level={3} style={{ color: '#f5222d' }}>{errorMessage}</Title>
          {<Button type="primary" onClick={() => navigate('/login')}>Go to Login</Button>}
        </div>
      </MvroLayout>
    );
  }

  const handleNavigate = (item) => {
    setActiveNavItem(item);
  };

  return (
    <MvroLayout logout={logout}>
      <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
        <div className="dashboard-header">
          <div>
            <Title level={2} className="dashboard-title">MVRO Dashboard</Title>
            <p>Welcome, {userData?.name || 'User'}</p>
          </div>
          <Space>
            <Button 
              type="text"
              icon={<BellOutlined style={{ color: '#FF4500' }} />}
              onClick={() => setNotificationDrawerVisible(true)}
              style={{ marginRight: '16px' }}
            >
              <span style={{ color: '#FF4500' }}>Notifications</span>
            </Button>
            <Button 
              type="text"
              icon={<UserOutlined style={{ color: '#FF4500' }} />}
              onClick={openProfileDrawer}
            >
              <span style={{ color: '#FF4500' }}>{userData?.name || 'User'}</span>
            </Button>
          </Space>
        </div>

        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={8} lg={6}>
            <StatisticCard
              title="Total Applications"
              value={dashboardData.totalApplications}
              icon={<FileTextOutlined />}
              color="#4169E1"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <StatisticCard
              title="Completed"
              value={dashboardData.completedApplications}
              icon={<CheckCircleOutlined />}
              color="#52c41a"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <StatisticCard
              title="Pending"
              value={dashboardData.pendingApplications}
              icon={<ClockCircleOutlined />}
              color="#faad14"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <StatisticCard
              title="Reports"
              value={dashboardData.reportSubmissions}
              icon={<FileSearchOutlined />}
              color="#722ed1"
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Monthly Applications" style={{ height: '400px' }}>
              <Line
                data={dashboardData.monthlyData || []}
                xField="month"
                yField="applications"
                smooth={true}
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Recent Activities" style={{ height: '400px' }}>
              {/* Add your recent activities content here */}
            </Card>
          </Col>
        </Row>

        <NotificationDrawer
          visible={notificationDrawerVisible}
          onClose={() => setNotificationDrawerVisible(false)}
          notifications={notifications}
        />

        <Drawer
          title="Profile"
          placement="right"
          onClose={closeProfileDrawer}
          visible={profileDrawerVisible}
          width={300}
        >
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#4169E1' }} />
            <Title level={4} style={{ marginTop: '10px', marginBottom: '0' }}>
              {userData?.name || 'User'}
            </Title>
            <p style={{ color: '#666' }}>{userData?.email}</p>
          </div>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Role">{role}</Descriptions.Item>
            <Descriptions.Item label="District">{userData?.district || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Mandal">{userData?.mandal || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Badge status="success" text="Active" />
            </Descriptions.Item>
          </Descriptions>
          <div style={{ marginTop: '20px' }}>
            <Button type="primary" block onClick={() => navigate('/mvro/profile')}>
              View Full Profile
            </Button>
            <Button danger block onClick={logout} style={{ marginTop: '10px' }}>
              <LogoutOutlined /> Logout
            </Button>
          </div>
        </Drawer>
      </div>
    </MvroLayout>
  );
}
