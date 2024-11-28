import React, { useState, useEffect, useContext } from 'react';
import { Table, Select, Button, Space, Typography, message, Card, Row, Col, Drawer, Avatar, Badge, Spin } from 'antd';
import { UserOutlined, LogoutOutlined, FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, BellOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import { Link } from 'react-router-dom';
import StatisticCard from './utils/statistic-card';
import NotificationDrawer from './utils/notification-drawer';
import { UserContext } from '../../../components/userContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';


const { Option } = Select;
const { Title } = Typography;

// Mock function to fetch application data
const fetchApplicationData = async () => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalApplications: 100,
        pendingApplications: 30,
        completedApplications: 60,
        resentApplications: 10,
        monthlyData: [
          { year: 2022, month: 'Jan', applications: 10 },
          { year: 2022, month: 'Feb', applications: 15 },
          { year: 2022, month: 'Mar', applications: 20 },
          { year: 2022, month: 'Apr', applications: 25 },
          { year: 2022, month: 'May', applications: 30 },
          { year: 2022, month: 'Jun', applications: 35 },
          { year: 2022, month: 'Jul', applications: 40 },
          { year: 2022, month: 'Aug', applications: 38 },
          { year: 2022, month: 'Sep', applications: 0 },
          { year: 2022, month: 'Oct', applications: 45 },
          { year: 2022, month: 'Nov', applications: 50 },
          { year: 2022, month: 'Dec', applications: 55 },
          { year: 2023, month: 'Jan', applications: 12 },
          { year: 2023, month: 'Feb', applications: 18 },
          { year: 2023, month: 'Mar', applications: 22 },
          { year: 2023, month: 'Apr', applications: 28 },
          { year: 2023, month: 'May', applications: 33 },
          { year: 2023, month: 'Jun', applications: 38 },
          { year: 2023, month: 'Jul', applications: 42 },
          { year: 2023, month: 'Aug', applications: 0 },
          { year: 2023, month: 'Sep', applications: 0 },
          { year: 2023, month: 'Oct', applications: 48 },
          { year: 2023, month: 'Nov', applications: 52 },
          { year: 2023, month: 'Dec', applications: 58 },
        ],
      });
    }, 1000);
  });
};

const NavItem = ({ to, children, isActive, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`px-4 py-2 rounded-md cursor-pointer ${
      isActive ? 'bg-secondary text-white' : 'text-white hover:bg-secondary/10'
    }`}
    onClick={onClick} // Attach onClick for navigation
  >
    <Link to={to}>{children}</Link>
  </motion.div>
);

// Mock notifications data
const mockNotifications = [
  { id: 1, message: 'New application submitted', read: false },
  { id: 2, message: 'Application #1234 approved', read: true },
  { id: 3, message: 'Reminder: Review pending applications', read: false },
];

const monthRanges = {
  'Jan-Jul': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  'Aug-Dec': ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

export default function VRODashboard() {
  const [applications, setApplications] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [profileDrawerVisible, setProfileDrawerVisible] = useState(false);
  const [notificationDrawerVisible, setNotificationDrawerVisible] = useState(false);
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState(mockNotifications);
  const { token, logout } = useContext(UserContext);
  const [errorMessage, setErrorMessage] = useState("");
  const [userLoading, setUserLoading] = useState(true);
  const [activeNavItem, setActiveNavItem] = useState('dashboard');
  const [applicationStats, setApplicationStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    completedApplications: 0,
    resentApplications: 0,
    monthlyData: [],
  });
  const [selectedYear, setSelectedYear] = useState('2023');
  const [role, setRole] = useState("");
  const [selectedRange, setSelectedRange] = useState('all');
  const navigate = useNavigate()
  useEffect(() => {
    if (!token) {
      setErrorMessage("You are not logged in. Please log in to access this page.");
      setUserLoading(false);
      return;
    }
    fetchData();
    fetchApplicationData().then(data => {
      setApplicationStats(data);
      // You would typically fetch and set the applications data here as well
    });
  }, [token]);

  useEffect(() => {
    if (userData && role && role !== "SVRO") {
      setErrorMessage("Access denied. Only SVROs are allowed to view this page.");
      setUserLoading(false);
    }
  }, [role]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/users/user`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in Authorization header
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

  const openProfileDrawer = () => {
    setProfileDrawerVisible(true);
  };

  const closeProfileDrawer = () => {
    setProfileDrawerVisible(false);
  };

  const openNotificationDrawer = () => {
    setNotificationDrawerVisible(true);
  };

  const closeNotificationDrawer = () => {
    setNotificationDrawerVisible(false);
  };

  const filteredData = applicationStats.monthlyData.filter(item => {
    const matchesYear = selectedYear === 'all' || item.year.toString() === selectedYear;
    const matchesRange =
      selectedRange === 'all' ||
      (monthRanges[selectedRange] && monthRanges[selectedRange].includes(item.month));
    return matchesYear && matchesRange && item.applications > 0;
  });

  const config = {
    data: filteredData,
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
  const handleNavigate=(path)=>{
    navigate(`${path}`)
  }
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="vro-dashboard bg-background min-h-screen">
      <nav className="bg-primary text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img src="/certitrack.jpg" alt="CertiTrack Logo" className="h-8 w-8 logo" />
          <Title level={3} className="text-white m-0">CertiTrack</Title>
        </div>
        <div className="flex items-center space-x-4">
          <NavItem to="/dashboard" isActive={activeNavItem === 'dashboard'} onClick={() => handleNavigate('dashboard')}>Dashboard</NavItem>
          <NavItem to="/applications" isActive={activeNavItem === 'applications'} onClick={() => handleNavigate('applications')}>Applications</NavItem>
          <NavItem to="/field-verification" isActive={activeNavItem === 'field-verification'} onClick={() => handleNavigate('field-verification')}>Field Verification</NavItem>
          <NavItem to="/corrections" isActive={activeNavItem === 'corrections'} onClick={() => handleNavigate('corrections')}>Corrections</NavItem>
        </div>
        <div className="flex items-center space-x-4">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button type="text" icon={<QuestionCircleOutlined />} className="text-white" />
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Badge count={unreadNotificationsCount} overflowCount={99}>
              <Button type="text" icon={<BellOutlined />} onClick={openNotificationDrawer} className="text-white" aria-label="Notifications" />
            </Badge>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button type="text" icon={<UserOutlined />} onClick={openProfileDrawer} className="text-white">
              {userData?.name}
            </Button>
          </motion.div>
        </div>
      </nav>
      <Card className="main-card">
        <div className="dashboard-header">
          <div>
            <Title level={2} className="dashboard-title">VRO Dashboard</Title>
            <p>Welcome, {userData.name}</p>
          </div>
        </div>

        <Row gutter={[16, 16]} className="dashboard-content">
          <Col xs={24} lg={12}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Link href="/total-applications" passHref>
                  <StatisticCard
                    title="Total Applications"
                    count={applicationStats.totalApplications}
                    status="all"
                    backgroundColor="#F5F5F5"
                    icon={<FileTextOutlined style={{ fontSize: '24px', opacity: 0.7 }} />}
                  />
                </Link>
              </Col>
              <Col xs={24} sm={12}>
                <Link href="/completed-applications" passHref>
                  <StatisticCard
                    title="Completed"
                    count={applicationStats.completedApplications}
                    status="completed"
                    backgroundColor="#E6FFE6"
                    icon={<CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} />}
                  />
                </Link>
              </Col>
              <Col xs={24} sm={12}>
                <Link href="/pending-applications" passHref>
                  <StatisticCard
                    title="Pending"
                    count={applicationStats.pendingApplications}
                    status="pending"
                    backgroundColor="#FFF7E6"
                    icon={<ClockCircleOutlined style={{ fontSize: '24px', color: '#faad14' }} />}
                  />
                </Link>
              </Col>
              <Col xs={24} sm={12}>
                <Link href="/resent-applications" passHref>
                  <StatisticCard
                    title="Resent"
                    count={applicationStats.resentApplications}
                    status="resent"
                    backgroundColor="#FFF1F0"
                    icon={<CloseCircleOutlined style={{ fontSize: '24px', color: '#f5222d' }} />}
                  />
                </Link>
              </Col>
            </Row>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Monthly Applications">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <Select
                    defaultValue="2023"
                    style={{ width: 120 }}
                    onChange={setSelectedYear}
                  >
                    <Option value="2022">2022</Option>
                    <Option value="2023">2023</Option>
                  </Select>
                  <Select
                    defaultValue="all"
                    style={{ width: 120 }}
                    onChange={setSelectedRange}
                  >
                    <Option value="all">All Months</Option>
                    <Option value="Jan-Jul">Jan-Jul</Option>
                    <Option value="Aug-Dec">Aug-Dec</Option>
                  </Select>
                </Space>
                <Line {...config} />
              </Space>
            </Card>
          </Col>
        </Row>

        {/* <Space direction="vertical" size="middle" style={{ display: 'flex', marginTop: '24px' }}>
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
            dataSource={applications} 
            rowKey="id"
            pagination={{ pageSize: 10 }}
            style={{ overflowX: 'auto' }}
          />
        </Space> */}
      </Card>

      <Drawer
        title="User Profile"
        placement="right"
        onClose={closeProfileDrawer}
        open={profileDrawerVisible}
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar size={64} icon={<UserOutlined />} />
            <div>
              <h2 className="text-xl font-semibold">{userData.name}</h2>
              <p className="text-gray-500">{userData.role}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p>{userData.email}</p>
          </div>
          <Button block onClick={() => {
            message.info('Navigating to full profile page');
            closeProfileDrawer();
          }}>
            View Full Profile
          </Button>
          <Button danger block onClick={() => {
            logout();
            closeProfileDrawer();
          }}>
            <LogoutOutlined /> Logout
          </Button>
        </div>
      </Drawer>

      <NotificationDrawer
        visible={notificationDrawerVisible}
        onClose={closeNotificationDrawer}
        notifications={notifications}
        setNotifications={setNotifications}
      />
    </div>
  );
}

