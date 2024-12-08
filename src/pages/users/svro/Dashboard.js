import React, { useState, useEffect, useContext } from 'react';
import { Table, Select, Button, Space, Typography, message, Card, Row, Col, Drawer, Avatar, Badge, Spin, Layout, Menu, Calendar, Tooltip } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CloseCircleOutlined, 
  BellOutlined, 
  QuestionCircleOutlined,
  HomeOutlined,
  PlusCircleOutlined,
  FileSearchOutlined,
  BarsOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import StatisticCard from './utils/statistic-card';
import NotificationDrawer from './utils/notification-drawer';
import ApplicationDetailsModal from '../../../components/modals/ApplicationDetailsModal';
import { UserContext } from '../../../components/userContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import '../../../styles/Dashboard.css';

const { Option } = Select;
const { Title } = Typography;
const { Header, Content, Sider } = Layout;

// Mock function to fetch application data
// const fetchApplicationData = async (token) => {
//   // Simulate API call
//   if(token){
//     try{
//       const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/svro/load_dashboard`,{
//         headers:{
//           Authorization : `Bearer ${token}`
//         }
//       });
//       if (response.data) {
//         console.log("Application stats:", response.data); // Log the data
//         return response.data;
//       } else {
//         console.error("Unexpected response format:", response);
//         message.error("Invalid response from the server");
//       }
//     }
//     catch(e){
//       message.error("There is an error");
//     }
//   }
// };

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
      className={`px-4 py-2 rounded-md cursor-pointer ${isActive ? 'bg-secondary text-white' : 'text-white hover:bg-secondary/10'
      }`}
      onClick={handleClick}
    >
      {children}
    </motion.div>
  );
};

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

export default function VRODashboard() {
  const [profileDrawerVisible, setProfileDrawerVisible] = useState(false);
  const [notificationDrawerVisible, setNotificationDrawerVisible] = useState(false);
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState(mockNotifications);
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
    monthlyData: []
  });
  const [selectedYear, setSelectedYear] = useState('2023');
  const [role, setRole] = useState("");
  const [selectedRange, setSelectedRange] = useState('all');
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [news] = useState([
    'Welcome to CertiTrack SVRO Dashboard',
    'New application verification guidelines updated',
    'Monthly reports due by end of the month',
    'System maintenance scheduled for next weekend',
    'New field verification protocol implemented'
  ]);

  const [loading, setLoading] = useState(true);
  const [scheduledApplications, setScheduledApplications] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);

  useEffect(() => {
    if (!token) {
      setErrorMessage("You are not logged in. Please log in to access this page.");
      setUserLoading(false);
      return;
    }
    fetchData();
    fetchDashboardData();
    // fetchScheduledApplications();
  }, [token]);

  useEffect(() => {
    if (userData && role && role !== "SVRO") {
      setErrorMessage("Access denied. Only SVROs are allowed to view this page.");
      setUserLoading(false);
    }
  }, [role]);

  const fetchDashboardData = async () => {
    if (token) {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/svro/load_dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data) {
          console.log("Dashboard data:", response.data);
          setDashboardData(response.data);
          setLoading(false);
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
      console.log(res, " is the response data")
    } catch (e) {
      setErrorMessage("Token expired. Login again")
      console.error('There is an error in getting profile details', e);
      setUserData(null); // Reset userData if the request fails
    } finally {
      setUserLoading(false); // Stop loading after data is fetched
    }
  };

  // const fetchScheduledApplications = async () => {
  //   try {
  //     const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/svro/scheduled_applications`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     if (response.data && response.data.data) {
  //       setScheduledApplications(response.data.data);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching scheduled applications:', error);
  //     message.error('Failed to fetch scheduled applications');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const dateCellRender = (value) => {
    const date = value.format('YYYY-MM-DD');
    const eventsForDate = dashboardData?.upcomingEvents?.filter(event => {
      const eventDate = dayjs(event.date).format('YYYY-MM-DD');
      return eventDate === date;
    }) || [];

    if (eventsForDate.length === 0) return null;

    return (
      <motion.ul
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        style={{ listStyle: 'none', margin: 0, padding: 0 }}
      >
        {eventsForDate.map((event, index) => (
          <motion.li
            key={event.event_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Tooltip 
              title={`Application ID: ${event.application_id}\nApplicant: ${event.applicant_name}`}
            >
              <div
                style={{
                  backgroundColor: '#1890ff',
                  color: '#fff',
                  borderRadius: '4px',
                  padding: '2px 4px',
                  marginBottom: '2px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 4px rgba(24, 144, 255, 0.2)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.backgroundColor = '#40a9ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.backgroundColor = '#1890ff';
                }}
              >
                <a
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedApplicationId(event.application_id);
                    setModalVisible(true);
                  }}
                  style={{ color: '#fff' }}
                >
                  {event.applicant_name} (#{event.application_id})
                </a>
              </div>
            </Tooltip>
          </motion.li>
        ))}
      </motion.ul>
    );
  };

  const calendarStyle = {
    '.ant-picker-calendar': {
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    '.ant-picker-cell': {
      transition: 'all 0.3s ease',
    },
    '.ant-picker-cell:hover': {
      backgroundColor: '#f0f5ff',
    },
    '.ant-picker-calendar-date-today': {
      borderColor: '#1890ff',
    },
    '.ant-picker-cell-selected .ant-picker-calendar-date': {
      backgroundColor: '#e6f7ff',
    }
  };

  if (userLoading) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Spin size="large" />
        </div>
      </Layout>
    );
  }

  if (errorMessage) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#FFFFFF' }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          <Title level={3} style={{ color: '#f5222d', marginBottom: '24px' }}>{errorMessage}</Title>
          <Button type="primary" onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </div>
      </Layout>
    );
  }

  if (!userData) {
    return (
      <Layout style={{ minHeight: '100vh', background: '#FFFFFF' }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          <Title level={3} style={{ color: '#f5222d', marginBottom: '24px' }}>
            Unable to load user data. Please try again.
          </Title>
          <Button type="primary" onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </div>
      </Layout>
    );
  }

  const menuItems = [
    {
      key: 'dashboard',
      icon: <HomeOutlined />,
      label: 'Dashboard',
      onClick: () => setActiveNavItem('dashboard')
    },
    {
      key: 'applications',
      icon: <FileTextOutlined />,
      label: 'Applications',
      onClick: () => navigate('/svro/applications')
    },
    {
      key: 'schedule',
      icon: <CalendarOutlined />,
      label: 'Schedule Applications',
      onClick: () => navigate('/svro/schedule')
    },
    {
      key: 'reports',
      icon: <BarsOutlined />,
      label: 'Reports',
      onClick: () => navigate('/svro/reports')
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      <Layout style={{ width: '100%', position: 'fixed', top: 0, zIndex: 2, background: '#FFFFFF' }}>
        <Header style={{ 
          padding: '0',
          background: '#FFFFFF',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          height: 'auto',
          width: '100%'
        }}>
          <NewsTicker news={[
            "New online service for income certificate launched",
            "Updated guidelines for caste certificate applications",
            "Last date for property tax payment: 31st March 2024",
            "E-filing system maintenance scheduled for next weekend"
          ]} />
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '0 24px',
            height: '64px',
            background: '#FFFFFF'
          }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Title level={3} className="certitrack-title">
                CertiTrack
              </Title>
            </motion.div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  type="text"
                  icon={<BellOutlined style={{ color: '#FF4500' }} />}
                  onClick={() => setNotificationDrawerVisible(true)}
                  style={{ 
                    marginRight: '16px',
                    color: '#FF4500'
                  }}
                >
                  <span style={{ color: '#FF4500' }}>Notifications</span>
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  type="text"
                  icon={<UserOutlined style={{ color: '#FF4500' }} />}
                  onClick={() => setProfileDrawerVisible(true)}
                  style={{
                    color: '#FF4500',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 24px',
                    height: '40px',
                    borderRadius: '20px'
                  }}
                >
                  <span style={{ marginLeft: '8px', color: '#FF4500' }}>
                    {userData ? userData.name : 'User'}
                  </span>
                </Button>
              </motion.div>
            </div>
          </div>
        </Header>
      </Layout>
      <Layout style={{ 
        marginLeft: collapsed ? 80 : 250,
        transition: 'all 0.2s',
        minHeight: '100vh',
        background: '#f5f5f5',
        marginTop: '108px'
      }}>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          style={{
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
            overflow: 'auto',
            height: 'calc(100vh - 108px)', 
            position: 'fixed',
            left: 0,
            top: 108,
            zIndex: 1,
            boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
          }}
          width={250}
        >
          {/* <div style={{ 
            height: '64px', 
            display: 'flex', 
            alignItems: 'center',
            padding: '0 24px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <Title level={4} style={{ margin: 0, color: '#4169E1' }}>
              CertiTrack
            </Title>
          </div> */}
          <Menu

            mode="inline"
            selectedKeys={[activeNavItem]}
            style={{ 
              border: 'none',
              padding: '16px 0',
              marginTop:'32px'

            }}
            items={[
              {
                key: 'dashboard',
                icon: <HomeOutlined style={{ fontSize: '18px' }} />,
                label: 'Dashboard',
                onClick: () => setActiveNavItem('dashboard')
              },
              {
                key: 'applications',
                icon: <FileTextOutlined style={{ fontSize: '18px' }} />,
                label: 'Applications',
                onClick: () => navigate('/svro/applications')
              },
              {
                key: 'schedule',
                icon: <CalendarOutlined style={{ fontSize: '18px' }} />,
                label: 'Schedule Applications',
                onClick: () => navigate('/svro/schedule')
              },
              {
                key: 'reports',
                icon: <BarsOutlined style={{ fontSize: '18px' }} />,
                label: 'Reports',
                onClick: () => navigate('/svro/reports')
              }
            ]}
          />
        </Sider>
        <Content style={{ 
          padding: '24px',
          minHeight: 'calc(100vh - 108px)',
          background: '#f5f5f5'
        }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', marginTop: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div className="dashboard-header">
              <div>
                <Title level={2} className="dashboard-title">SVRO Dashboard</Title>
                <p>Welcome, {userData?.name || 'User'}</p>
              </div>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col xs={24} lg={12}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <StatisticCard
                        title="Total Applications"
                        value={dashboardData.total_applications || 0}
                        icon={<FileTextOutlined />}
                        color="#1890ff"
                      />
                    </motion.div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <StatisticCard
                      title="Completed"
                      value={dashboardData.completedApplications}
                      to="/svro/completed"
                      backgroundColor="#f6ffed"
                      borderColor="#b7eb8f"
                      textColor="#52c41a"
                      icon={<CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} />}
                    />
                  </Col>
                  <Col xs={24} sm={12}>
                    <StatisticCard
                      title="Pending"
                      value={dashboardData.pendingApplications}
                      to="/svro/Pending"
                      backgroundColor="#fff7e6"
                      borderColor="#ffd591"
                      textColor="#faad14"
                      icon={<ClockCircleOutlined style={{ fontSize: '24px', color: '#faad14' }} />}
                    />
                  </Col>
                  <Col xs={24} sm={12}>
                    <StatisticCard
                      title="Reports"
                      value={dashboardData.reportNotificatios}
                      to="/svro/reports"
                      backgroundColor="#f9f0ff"
                      borderColor="#d3adf7"
                      textColor="#722ed1"
                      icon={<FileSearchOutlined style={{ fontSize: '24px', color: '#722ed1' }} />}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              {/* Left Column - Graph */}
              <Col xs={24} lg={12}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card 
                    title="Application Statistics"
                    style={{ height: '100%' }}
                    bodyStyle={{ height: 'calc(100% - 87px)', padding: '12px' }}
                  >
                    <Line 
                      data={dashboardData.monthlyData || [
                        { month: 'Jan', applications: 30, year: '2023' },
                        { month: 'Feb', applications: 45, year: '2023' },
                        { month: 'Mar', applications: 35, year: '2023' },
                        { month: 'Apr', applications: 50, year: '2023' },
                        { month: 'May', applications: 40, year: '2023' },
                        { month: 'Jun', applications: 60, year: '2023' }
                      ]}
                      xField="month"
                      yField="applications"
                      seriesField="year"
                      smooth={true}
                      animation={{
                        appear: {
                          animation: 'path-in',
                          duration: 1000,
                        },
                      }}
                      tooltip={{
                        showMarkers: true,
                        shared: true,
                        showCrosshairs: true,
                        crosshairs: {
                          type: 'xy',
                        },
                      }}
                      xAxis={{
                        label: {
                          autoRotate: false,
                          style: {
                            fill: '#666',
                            fontSize: 12,
                          },
                        },
                      }}
                      yAxis={{
                        label: {
                          style: {
                            fill: '#666',
                            fontSize: 12,
                          },
                        },
                        grid: {
                          line: {
                            style: {
                              stroke: '#f0f0f0',
                              lineWidth: 1,
                              lineDash: [4, 4],
                            },
                          },
                        },
                      }}
                      point={{
                        size: 5,
                        shape: 'circle',
                        style: {
                          fill: '#4169E1',
                          stroke: '#fff',
                          lineWidth: 2,
                        },
                      }}
                      color="#4169E1"
                      height={400}
                      style={{ height: '100%' }}
                    />
                  </Card>
                </motion.div>
              </Col>

              {/* Right Column - Calendar */}
              <Col xs={24} lg={12}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card 
                    title={
                      <Space>
                        <CalendarOutlined style={{ color: '#1890ff' }} />
                        <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
                          Upcoming Appointments
                        </span>
                      </Space>
                    }
                    loading={loading}
                    style={{ 
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                      height: '100%'
                    }}
                    bodyStyle={{ 
                      padding: '12px',
                      height: 'calc(100% - 87px)',
                      overflow: 'auto'
                    }}
                  >
                    <Calendar 
                      dateCellRender={dateCellRender}
                      style={{ 
                        ...calendarStyle,
                      }}
                      fullscreen={false}
                    />
                  </Card>
                </motion.div>
              </Col>
            </Row>
          </div>
        </Content>
      </Layout>

      <NotificationDrawer
        visible={notificationDrawerVisible}
        onClose={() => setNotificationDrawerVisible(false)}
        notifications={notifications}
      />

      <Drawer
        title="Profile"
        placement="right"
        onClose={() => setProfileDrawerVisible(false)}
        visible={profileDrawerVisible}
        width={300}
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#4169E1' }} />
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
            setProfileDrawerVisible(false);
          }}>
            View Full Profile
          </Button>
          <Button danger block onClick={() => {
            logout();
            setProfileDrawerVisible(false);
          }}>
            <LogoutOutlined /> Logout
          </Button>
        </div>
      </Drawer>

      <ApplicationDetailsModal
        visible={modalVisible}
        applicationId={selectedApplicationId}
        onCancel={() => {
          setModalVisible(false);
          setSelectedApplicationId(null);
        }}
      />
    </Layout>
  );
}
