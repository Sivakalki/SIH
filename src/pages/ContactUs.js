import React, { useState, useContext } from 'react';
import { 
  Row, 
  Col, 
  Typography, 
  Form, 
  Input, 
  Button, 
  Card, 
  Collapse,
  message,
  Layout,
  Menu,
  Avatar,
  Timeline
} from 'antd';
import { 
  MailOutlined, 
  PhoneOutlined, 
  HomeOutlined,
  QuestionCircleOutlined,
  SafetyCertificateOutlined,
  CustomerServiceOutlined,
  ToolOutlined,
  FileSearchOutlined,
  UserOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  PictureOutlined,
  DownloadOutlined,
  LinkOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../components/userContext';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

const ContactUs = () => {
  const navigate = useNavigate();
  const { token, logout } = useContext(UserContext);
  const [form] = Form.useForm();

  const navigationItems = [
    { 
      key: 'home', 
      icon: <HomeOutlined />, 
      label: 'Home', 
      path: '/' 
    },
    { 
      key: 'services', 
      icon: <AppstoreOutlined />, 
      label: 'Services', 
      subMenu: [
        { key: 'certificate-services', label: 'Certificate Services', path: '/services/certificates' },
        { key: 'application-tracking', label: 'Application Tracking', path: '/services/tracking' },
        { key: 'online-payment', label: 'Online Payment', path: '/services/payment' },
        { key: 'document-verification', label: 'Document Verification', path: '/services/verification' }
      ]
    },
    { 
      key: 'gallery', 
      icon: <PictureOutlined />, 
      label: 'Gallery', 
      subMenu: [
        { key: 'photo-gallery', label: 'Photo Gallery', path: '/gallery/photos' },
        { key: 'event-gallery', label: 'Event Gallery', path: '/gallery/events' },
        { key: 'achievement-gallery', label: 'Achievement Gallery', path: '/gallery/achievements' }
      ]
    },
    { 
      key: 'downloads', 
      icon: <DownloadOutlined />, 
      label: 'Downloads', 
      subMenu: [
        { key: 'forms', label: 'Application Forms', path: '/downloads/forms' },
        { key: 'guidelines', label: 'Guidelines', path: '/downloads/guidelines' },
        { key: 'brochures', label: 'Brochures', path: '/downloads/brochures' }
      ]
    },
    { 
      key: 'links', 
      icon: <LinkOutlined />, 
      label: 'Other Links', 
      subMenu: [
        { key: 'government-portals', label: 'Government Portals', path: '/links/government' },
        { key: 'related-departments', label: 'Related Departments', path: '/links/departments' },
        { key: 'useful-websites', label: 'Useful Websites', path: '/links/websites' }
      ]
    },
    { 
      key: 'contact', 
      icon: <MailOutlined />, 
      label: 'Contact Us', 
      subMenu: [
        { key: 'contact-form', label: 'Contact Form', path: '/contactus' },
        { key: 'support-helpline', label: 'Support Helpline', path: '/contact/helpline' },
        { key: 'email-support', label: 'Email Support', path: '/contact/email' }
      ]
    }
  ];

  const contactSectors = [
    {
      title: 'Certificate Services',
      phone: '+91-80-1234-5678',
      email: 'certificates@certitrack.gov.in',
      icon: <SafetyCertificateOutlined />
    },
    {
      title: 'Grievance Redressal',
      phone: '+91-80-9876-5432',
      email: 'grievance@certitrack.gov.in',
      icon: <CustomerServiceOutlined />
    },
    {
      title: 'Technical Support',
      phone: '+91-80-2345-6789',
      email: 'support@certitrack.gov.in',
      icon: <ToolOutlined />
    },
    {
      title: 'Application Tracking',
      phone: '+91-80-3456-7890',
      email: 'tracking@certitrack.gov.in',
      icon: <FileSearchOutlined />
    }
  ];

  const faqData = [
    {
      key: '1',
      label: 'How do I start an application?',
      children: (
        <Paragraph>
          To start an application, navigate to the Home page and click on "Start Application". 
          You'll need to log in or create an account first. Then follow the step-by-step 
          application form to submit your request.
        </Paragraph>
      )
    },
    {
      key: '2',
      label: 'What documents do I need to submit?',
      children: (
        <Paragraph>
          Required documents vary depending on the specific certificate. Generally, 
          you'll need proof of identity, address, and any specific documents related 
          to your application. The application form will provide a detailed list of 
          required documents for each certificate type.
        </Paragraph>
      )
    },
    {
      key: '3',
      label: 'How long does the certification process take?',
      children: (
        <Paragraph>
          Processing time varies depending on the type of certificate and current 
          workload. Typically, most applications are processed within 7-15 working days. 
          You can track your application status through the Application Tracking section.
        </Paragraph>
      )
    },
    {
      key: '4',
      label: 'Can I track my application online?',
      children: (
        <Paragraph>
          Yes, you can track your application status by logging into your account 
          and navigating to the Application Tracking section. You'll need your 
          application reference number to check the current status.
        </Paragraph>
      )
    },
    {
      key: '5',
      label: 'What if I need to update my application?',
      children: (
        <Paragraph>
          If you need to update your application, log in to your account and 
          navigate to the specific application. Most applications can be edited 
          until they reach the final verification stage. Contact our support 
          team if you encounter any issues.
        </Paragraph>
      )
    }
  ];

  const handleSubmit = async (values) => {
    try {
      // TODO: Implement actual form submission logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('Your query has been submitted successfully!');
      form.resetFields();
    } catch (error) {
      message.error('Failed to submit query. Please try again.');
    }
  };

  return (
    <Layout className="min-h-screen">
      {/* Navigation Bar */}
      <Header 
        className="fixed w-full z-10" 
        style={{ 
          background: '#fff', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
          padding: 0, 
          height: 'auto' 
        }}
      >
        <Row align="middle" justify="space-between" style={{ padding: '0 24px' }}>
          <Col>
            <Title level={3} style={{ margin: '16px 0', marginRight: '2rem' }}>
              <span style={{ 
                background: 'linear-gradient(to right, #1890ff, #722ed1)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent' 
              }}>
                CertiTrack
              </span>
            </Title>
          </Col>
          <Col>
            <Menu 
              mode="horizontal" 
              defaultSelectedKeys={['contact']} 
              style={{ 
                borderBottom: 'none',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {navigationItems.map(item => (
                item.subMenu ? (
                  <Menu.SubMenu 
                    key={item.key} 
                    icon={item.icon}
                    title={item.label}
                    style={{ 
                      margin: '0 10px',
                      padding: '0 10px'
                    }}
                  >
                    {item.subMenu.map(subItem => (
                      <Menu.Item 
                        key={subItem.key}
                        onClick={() => navigate(subItem.path)}
                      >
                        {subItem.label}
                      </Menu.Item>
                    ))}
                  </Menu.SubMenu>
                ) : (
                  <Menu.Item 
                    key={item.key} 
                    icon={item.icon}
                    onClick={() => navigate(item.path)}
                    style={{ 
                      margin: '0 10px',
                      padding: '0 10px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {item.label}
                  </Menu.Item>
                )
              ))}
            </Menu>
          </Col>
          <Col>
            <div className="flex justify-end">
              <Button
                icon={<UserOutlined />}
                shape="circle"
              />
            </div>
          </Col>
        </Row>
      </Header>

      <Content style={{ marginTop: '120px', padding: '0 50px' }}>
        <div 
          style={{ 
            background: 'linear-gradient(135deg, #E6F0FF 0%, #EDE7F6 100%)',
            padding: '2rem',
            borderRadius: '8px'
          }}
        >
          <Row gutter={[32, 32]}>
            {/* Left Half: Contact Information and Query Form */}
            <Col xs={24} md={12}>
              <Card 
                title="Contact Information" 
                style={{ 
                  marginBottom: '1rem', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                }}
              >
                {contactSectors.map((sector, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginBottom: '1rem' 
                    }}
                  >
                    {sector.icon}
                    <div style={{ marginLeft: '1rem' }}>
                      <Title level={5} style={{ margin: 0 }}>{sector.title}</Title>
                      <Text type="secondary">
                        <PhoneOutlined /> {sector.phone}
                      </Text>
                      <br />
                      <Text type="secondary">
                        <MailOutlined /> {sector.email}
                      </Text>
                    </div>
                  </div>
                ))}
              </Card>

              <Card 
                title="Submit Your Query" 
                style={{ 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                }}
              >
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                >
                  <Form.Item
                    name="name"
                    label="Your Name"
                    rules={[{ required: true, message: 'Please enter your name' }]}
                  >
                    <Input placeholder="Enter your full name" />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    label="Email Address"
                    rules={[
                      { required: true, message: 'Please enter your email' },
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <Input placeholder="Enter your email address" />
                  </Form.Item>

                  <Form.Item
                    name="query"
                    label="Your Query"
                    rules={[{ required: true, message: 'Please enter your query' }]}
                  >
                    <TextArea 
                      rows={4} 
                      placeholder="Describe your query in detail" 
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      block
                      style={{ 
                        background: 'linear-gradient(to right, #1890ff, #722ed1)',
                        borderColor: 'transparent'
                      }}
                    >
                      Submit Query
                    </Button>
                  </Form.Item>
                </Form>
              </Card>

              <Card 
                title="Frequently Asked Questions" 
                style={{ 
                  marginTop: '1rem', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                }}
              >
                <Collapse 
                  accordion 
                  defaultActiveKey={['1']}
                  expandIcon={({ isActive }) => <QuestionCircleOutlined rotate={isActive ? 90 : 0} />}
                >
                  {faqData.map(faq => (
                    <Panel 
                      key={faq.key} 
                      header={faq.label}
                    >
                      {faq.children}
                    </Panel>
                  ))}
                </Collapse>
              </Card>
            </Col>

            {/* Right Half: Google Maps */}
            <Col xs={24} md={12}>
              <Card 
                title="Our Location" 
                style={{ 
                  height: '55%', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                }}
              >
                <div style={{ width: '100%', height: '500px', overflow: 'hidden', borderRadius: '8px' }}>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.1467467707!2d77.59793857480977!3d12.977718987350219!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517ca4!2sBangalore!5e0!3m2!1sen!2sin!4v1702018800000!5m2!1sen!2sin"
                    width="100%"
                    height="500"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </Card>
              <Card 
                title="Office Hours" 
                style={{ 
                  marginTop: '1rem', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                }}
              >
                <Timeline mode="left">
                  <Timeline.Item label="Monday - Friday">
                    <Text>9:00 AM - 5:00 PM</Text>
                  </Timeline.Item>
                  <Timeline.Item label="Saturday">
                    <Text>10:00 AM - 2:00 PM</Text>
                  </Timeline.Item>
                  <Timeline.Item label="Sunday" dot={<ClockCircleOutlined style={{ fontSize: '16px' }} />}>
                    <Text type="secondary">Closed</Text>
                  </Timeline.Item>
                </Timeline>
              </Card>

              <Card 
                title="Additional Information" 
                style={{ 
                  marginTop: '1rem', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                }}
              >
                <Paragraph>
                  For urgent matters outside of office hours, please contact our 24/7 helpline at <Text strong>+91-80-1234-5678</Text>.
                </Paragraph>
                <Paragraph>
                  For general inquiries, you can also reach us at <Text strong>info@certitrack.gov.in</Text>.
                </Paragraph>
                <Paragraph>
                  Please note that response times may vary depending on the nature and complexity of your query.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
};

export default ContactUs;