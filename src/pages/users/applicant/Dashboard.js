import React, { useState, useEffect, useContext } from 'react';
import { Button, Card, Row, Col, Typography, Spin, Avatar, Drawer, Layout, Menu, Timeline } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  HomeOutlined,
  PlusCircleOutlined,
  FileSearchOutlined,
  BarsOutlined,
  BellOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../../../components/userContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import '../../../styles/Dashboard.css';

const { Title } = Typography;
const { Header, Content, Sider } = Layout;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3 }
  }
};

const NewsTicker = ({ news }) => {
  return (
    <div style={{ 
      overflow: 'hidden', 
      whiteSpace: 'nowrap',
      background: '#4169E1',
      padding: '8px 0',
      color: '#FFFFFF'
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

const StatisticCard = ({ title, count, status, backgroundColor, icon, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    style={{ cursor: 'pointer' }}
  >
    <Card style={{ backgroundColor, borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ margin: 0, fontSize: '16px', color: 'rgba(0, 0, 0, 0.45)' }}>{title}</p>
          <h2 style={{ margin: '8px 0 0', fontSize: '24px' }}>{count}</h2>
        </div>
        <div>{icon}</div>
      </div>
    </Card>
  </motion.div>
);

const ApplicantDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, logout } = useContext(UserContext);
  const [userData, setUserData] = useState(null);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('home');
  const [dashboardData, setDashboardData] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    completedApplications: 0
  });

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
      onClick: () => navigate('/application-form')
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
      key: 'history',
      icon: <BarsOutlined />,
      label: 'History',
      onClick: () => navigate('/applicant/history')
    }
  ];

  const fetchUserData = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/users/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserData(res.data.user);
      setRole(res.data.role);
      
      if (res.data.role !== "APPLICANT") {
        setErrorMessage("Access denied. Only applicants can access this dashboard.");
      }
    } catch (e) {
      console.error('Error getting profile details:', e);
      setErrorMessage("Token expired. Please login again.");
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/applicant/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  useEffect(() => {
    if (!token) {
      setErrorMessage("You are not logged in. Please log in to access this page.");
      setLoading(false);
      return;
    }
    fetchUserData();
  }, [token]);

  useEffect(() => {
    if (token && userData && role === "APPLICANT") {
      fetchDashboardData();
    }
  }, [token, userData, role]);

  useEffect(() => {
    // Set selected menu key based on current path
    const path = location.pathname;
    if (path === '/applicant') setSelectedKey('home');
    else if (path === '/application-form') setSelectedKey('new-application');
    else if (path === '/applicant/applications') setSelectedKey('my-applications');
    else if (path === '/applicant/status') setSelectedKey('application-status');
    else if (path === '/applicant/history') setSelectedKey('history');
  }, [location]);

  if (loading) {
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
        <Button type="primary" onClick={() => navigate('/login')} style={{ marginTop: '20px' }}>
          Go to Login
        </Button>
      </div>
    );
  }

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
                  onClick={() => setDrawerVisible(true)}
                  style={{
                    color: '#FF4500',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 24px',
                    height: '40px',
                    borderRadius: '20px'
                  }}
                >
                  <span style={{ marginLeft: '8px', color: '#FF4500' }}>{userData?.name}</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </Header>
      </Layout>

      <Layout style={{ marginTop: '108px' }}>
        <Sider 
          collapsible 
          collapsed={collapsed} 
          onCollapse={(value) => setCollapsed(value)}
          style={{
            background: '#FFFFFF',
            boxShadow: '2px 0 8px 0 rgba(0,0,0,0.1)',
            position: 'fixed',
            height: 'calc(100vh - 128px)',
            left: 0,
            top: '138px',
            zIndex: 1
          }}
          theme="light"
        >
          <Menu
            theme="light"
            selectedKeys={[selectedKey]}
            mode="inline"
            items={menuItems}
            style={{ 
              borderRight: 0,
              height: '100%',
              paddingTop: '16px'
            }}
            className="custom-menu"
          />
        </Sider>
        
        <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s', marginTop: '20px' }}>
          <Content style={{ margin: '24px 16px', padding: 24, minHeight: '280px' }}>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <Title level={2} style={{ marginBottom: '24px', color: '#333333' }}>
                Welcome to Revenue Department Services
              </Title>
              
              <Row gutter={[16, 16]}>
                <Col xs={24} md={16}>
                  <motion.div variants={itemVariants}>
                    <Card 
                      title="About Revenue Department" 
                      style={{ 
                        marginBottom: '16px',
                        borderRadius: '8px',
                        borderTop: `3px solid #4169E1`
                      }}
                      headStyle={{ color: '#4169E1' }}
                    >
                      <p style={{ color: '#333333' }}>The Revenue Department plays a crucial role in managing land records, collecting revenue, and providing essential services to citizens. Our department is committed to transparent, efficient, and citizen-centric services.</p>
                      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                        <Col span={8}>
                          <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                            <Card type="inner" title="Mission" style={{ background: '#F8F9FA' }}>
                              Providing efficient and transparent revenue services to citizens while maintaining accurate land records.
                            </Card>
                          </motion.div>
                        </Col>
                        <Col span={8}>
                          <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                            <Card type="inner" title="Vision" style={{ background: '#F8F9FA' }}>
                              To be the most citizen-friendly government department with 100% digital service delivery.
                            </Card>
                          </motion.div>
                        </Col>
                        <Col span={8}>
                          <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                            <Card type="inner" title="Values" style={{ background: '#F8F9FA' }}>
                              <ul style={{ paddingLeft: '20px', margin: 0, color: '#333333' }}>
                                <li>Transparency</li>
                                <li>Efficiency</li>
                                <li>Accountability</li>
                                <li>Citizen-First</li>
                              </ul>
                            </Card>
                          </motion.div>
                        </Col>
                      </Row>
                    </Card>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Card 
                      title="Available Services" 
                      style={{ 
                        marginBottom: '16px',
                        borderRadius: '8px',
                        borderTop: `3px solid #87CEEB`
                      }}
                      headStyle={{ color: '#4169E1' }}
                    >
                      <Row gutter={[16, 16]}>
                        {['Land Records', 'Certificates', 'Other Services'].map((service, index) => (
                          <Col span={8} key={service}>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <Card
                                type="inner"
                                title={service}
                                style={{
                                  background: '#F8F9FA',
                                  cursor: 'pointer'
                                }}
                              >
                                <ul style={{ paddingLeft: '20px', margin: 0, color: '#333333' }}>
                                  <li>Service 1</li>
                                  <li>Service 2</li>
                                  <li>Service 3</li>
                                </ul>
                              </Card>
                            </motion.div>
                          </Col>
                        ))}
                      </Row>
                    </Card>
                  </motion.div>
                </Col>

                <Col xs={24} md={8}>
                  <motion.div variants={itemVariants}>
                    <Card 
                      title="Quick Links" 
                      style={{ 
                        marginBottom: '16px',
                        borderRadius: '8px',
                        borderTop: `3px solid #FFD700`
                      }}
                      headStyle={{ color: '#4169E1' }}
                    >
                      {['Apply for New Certificate', 'Check Application Status', 'View Application History'].map((text, index) => (
                        <motion.div
                          key={text}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          style={{ marginBottom: '8px' }}
                        >
                          <Button
                            type={index === 0 ? "primary" : "default"}
                            block
                            style={{
                              background: index === 0 ? '#4169E1' : '#FFFFFF',
                              borderColor: '#4169E1',
                              color: index === 0 ? '#FFFFFF' : '#4169E1'
                            }}
                          >
                            {text}
                          </Button>
                        </motion.div>
                      ))}
                    </Card>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Card 
                      title="Important Updates" 
                      style={{ 
                        marginBottom: '16px',
                        borderRadius: '8px',
                        borderTop: `3px solid #4169E1`
                      }}
                      headStyle={{ color: '#4169E1' }}
                    >
                      <Timeline>
                        <Timeline.Item color="#4169E1">New online service launched</Timeline.Item>
                        <Timeline.Item color="#87CEEB">Updated guidelines</Timeline.Item>
                        <Timeline.Item color="#FFD700">Last date reminder</Timeline.Item>
                      </Timeline>
                    </Card>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Card 
                      title="Contact Support"
                      style={{ 
                        borderRadius: '8px',
                        borderTop: `3px solid #87CEEB`
                      }}
                      headStyle={{ color: '#4169E1' }}
                    >
                      <p style={{ color: '#333333' }}><strong>Helpline:</strong> 1800-XXX-XXXX</p>
                      <p style={{ color: '#333333' }}><strong>Email:</strong> support@revenue.gov.in</p>
                      <p style={{ color: '#333333' }}><strong>Working Hours:</strong> Mon-Sat, 9:00 AM - 5:00 PM</p>
                    </Card>
                  </motion.div>
                </Col>
              </Row>
            </motion.div>
          </Content>
        </Layout>
      </Layout>

      <Drawer
        title={
          <div style={{ color: '#4169E1', borderBottom: `2px solid #4169E1`, paddingBottom: '8px' }}>
            Profile
          </div>
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={300}
        bodyStyle={{ background: '#FFFFFF' }}
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: '#4169E1' }} />
            <Title level={4} style={{ marginTop: '16px', marginBottom: '4px', color: '#333333' }}>
              {userData?.name}
            </Title>
            <p style={{ color: '#666666' }}>{userData?.email}</p>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              type="primary" 
              danger 
              icon={<LogoutOutlined />} 
              onClick={logout} 
              block
              style={{ height: '40px', borderRadius: '20px' }}
            >
              Logout
            </Button>
          </motion.div>
        </motion.div>
      </Drawer>
    </Layout>
  );
};

export default ApplicantDashboard;
