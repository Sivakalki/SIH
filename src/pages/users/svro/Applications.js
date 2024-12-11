import React, { useState, useEffect, useContext } from 'react';
import { Layout, Menu, Table, Button, Typography, message, Card, Avatar, Badge, Modal, Descriptions, Spin, Select, Form, Input, Drawer } from 'antd';
import { 
  HomeOutlined, 
  FileTextOutlined, 
  BarsOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  EyeOutlined 
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../../../components/userContext';
import SvroLayout from '../../../components/layout/SvroLayout';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const handleApiError = (error) => {
    if (error.response) {
        if (error.response.status === 401) {
            message.error('Session expired. Please login again.');
            return true;
        }
        message.error(error.response.data.message || 'An error occurred');
    } else if (error.request) {
        message.error('Network error. Please check your connection.');
    } else {
        message.error('An error occurred');
    }
    return false;
};

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingButtons, setLoadingButtons] = useState({});
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [applicationDetails, setApplicationDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [currentStageFilter, setCurrentStageFilter] = useState('ALL');
  const [remarksDrawerVisible, setRemarksDrawerVisible] = useState(false);
  const [resendDrawerVisible, setResendDrawerVisible] = useState(false);
  const [resendDescription, setResendDescription] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const { token, logout } = useContext(UserContext);
  const [userData, setUserData] = useState(null);
  const [role, setRole] = useState("");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setErrorMessage("You are not logged in. Please log in to access this page.");
      setUserLoading(false);
      return;
    }
    fetchData();
    fetchApplications();
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
          Authorization: `Bearer ${token}`,
        },
      });
      setUserData(res.data.user);
      setRole(res.data.role);
    } catch (e) {
      if (handleApiError(e)) return;
      setErrorMessage("Token expired. Login again");
      console.error('Error getting profile details:', e);
      setUserData(null);
    } finally {
      setUserLoading(false);
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/svro/all_applications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setApplications(response.data.data);
    } catch (error) {
      if (handleApiError(error)) return;
      message.error('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const openDrawer = () => {
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  const handleViewApplication = async (application) => {
    setLoadingButtons(prev => ({ ...prev, [application.app_id]: true }));
    setModalVisible(true);
    setSelectedApplication(application);
    setLoadingDetails(true);
    
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/application/${application.app_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Application details:', response.data);
      setApplicationDetails(response.data.data);
    } catch (error) {
      if (handleApiError(error)) return;
      message.error('Failed to fetch application details');
    } finally {
      setLoadingDetails(false);
      setLoadingButtons(prev => ({ ...prev, [application.app_id]: false }));
    }
  };

  const handleStageFilterChange = (value) => {
    console.log('Selected stage:', value); // Log the selected stage
    setCurrentStageFilter(value);
  };

  const filteredApplications = applications.filter(app => {
    if (!currentStageFilter || currentStageFilter === 'ALL') return true;
    console.log('Filtering for stage:', currentStageFilter); // Log the current stage filter
    return app.current_stage === currentStageFilter; // Compare directly with current_stage
  });

  console.log('Filtered Applications:', filteredApplications); // Log the filtered applications

  console.log('Applications:', applications);
  console.log('Application Objects:', applications);
  console.log('DataSource for Table:', filteredApplications);

  const columns = [
    {
      title: 'Application ID',
      dataIndex: 'app_id',
      key: 'app_id',
    },
    {
      title: 'Full Name',
      dataIndex: 'full_name',
      key: 'full_name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={status === 'PENDING' ? 'processing' : 'success'} 
          text={status}
        />
      ),
    },
    {
      title: 'Current Stage',
      dataIndex: 'current_stage',
      key: 'current_stage',
      render: (stage) => stage || 'Not Started',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<EyeOutlined />}
          loading={loadingButtons[record.app_id]}
          onClick={() => handleViewApplication(record)}
        >
          View
        </Button>
      ),
    },
  ];

  const openRemarksForm = () => {
    setRemarksDrawerVisible(true);
  };

  const closeRemarksDrawer = () => {
    setRemarksDrawerVisible(false);
  };

  const submitRemarks = async (values) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/svro/create_report/${applicationDetails.application_id}`,
        { description: values.remarks },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      message.success('Remarks submitted successfully');
      setRemarksDrawerVisible(false);
      fetchApplications();
    } catch (error) {
      if (handleApiError(error)) return;
      console.error('Error submitting remarks:', error);
      message.error('Failed to submit remarks');
    }
  };

  const handleTokenExpiration = () => {
    logout();
    Modal.error({
      title: 'Session Expired',
      content: (
        <div>
          <p>Your session has expired. Please login again to continue.</p>
          <Button 
            type="primary" 
            onClick={() => navigate('/login')}
            style={{ marginTop: '16px' }}
          >
            Login Again
          </Button>
        </div>
      ),
      okButtonProps: { style: { display: 'none' } }
    });
  };

  const handleResendApplication = async () => {
    if (!resendDescription.trim()) {
      message.error('Please provide a description');
      return;
    }

    setResendLoading(true);
    try {
      console.log(applicationDetails)
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/svro/recheck/${applicationDetails.application_id}`,
        {
          description: resendDescription
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      message.success('Application resent successfully');
      setResendDrawerVisible(false);
      setResendDescription('');
      fetchApplications(); // Refresh the applications list
    } catch (error) {
      if (handleApiError(error)) return;
      message.error('Failed to resend application');
    } finally {
      setResendLoading(false);
    }
  };

  if (userLoading) {
    return (
      <SvroLayout logout={logout}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
          <Spin size="large" />
          <Title level={3} style={{ marginTop: '20px' }}>Loading...</Title>
        </div>
      </SvroLayout>
    );
  }

  if (errorMessage) {
    return (
      <SvroLayout logout={logout}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
          <Title level={3} style={{ color: '#f5222d' }}>{errorMessage}</Title>
          {<Button type="primary" onClick={() => navigate('/login')}>Go to Login</Button>}
        </div>
      </SvroLayout>
    );
  }

  return (
    <SvroLayout logout={logout}>
      <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>Applications</Title>
          </div>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <Select
              placeholder="Select Current Stage"
              onChange={handleStageFilterChange}
              defaultValue="ALL"
              style={{ width: 200, marginBottom: 20 }}
            >
              <Select.Option value="ALL">All</Select.Option>
              <Select.Option value="SVRO">SVRO</Select.Option>
              <Select.Option value="MVRO">MVRO</Select.Option>
              <Select.Option value="RI">RI</Select.Option>
              <Select.Option value="MRO">MRO</Select.Option>
            </Select>
          </div>
          <Table 
            columns={columns} 
            dataSource={filteredApplications}
            rowKey="app_id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} items`,
            }}
          />
        </Card>

        <Modal
          title={<Title level={3}>Application Details</Title>}
          visible={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setSelectedApplication(null);
            setApplicationDetails(null);
          }}
          footer={null}
          width={800}
        >
          {loadingDetails ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin size="large" />
            </div>
          ) : applicationDetails && (
            <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <Card title="Personal Information" style={{ marginBottom: '16px' }}>
                <Descriptions column={2}>
                  <Descriptions.Item label="Full Name">{applicationDetails.full_name}</Descriptions.Item>
                  <Descriptions.Item label="Application ID">{applicationDetails.application_id}</Descriptions.Item>
                  <Descriptions.Item label="Date of Birth">{new Date(applicationDetails.dob).toLocaleDateString()}</Descriptions.Item>
                  <Descriptions.Item label="Gender">{applicationDetails.gender}</Descriptions.Item>
                  <Descriptions.Item label="Religion">{applicationDetails.religion}</Descriptions.Item>
                  <Descriptions.Item label="Caste">{applicationDetails.caste?.caste_type}</Descriptions.Item>
                  <Descriptions.Item label="Sub Caste">{applicationDetails.sub_caste}</Descriptions.Item>
                  <Descriptions.Item label="Parent Religion">{applicationDetails.parent_religion}</Descriptions.Item>
                  <Descriptions.Item label="Marital Status">{applicationDetails.marital_status}</Descriptions.Item>
                  <Descriptions.Item label="Aadhar Number">{applicationDetails.aadhar_num}</Descriptions.Item>
                  <Descriptions.Item label="Phone Number">{applicationDetails.phone_num}</Descriptions.Item>
                  <Descriptions.Item label="Email">{applicationDetails.email}</Descriptions.Item>
                </Descriptions>
              </Card>

              <Card title="Parent/Guardian Information" style={{ marginBottom: '16px' }}>
                <Descriptions column={2}>
                  <Descriptions.Item label="Guardian Type">{applicationDetails.parent_guardian_type?.type}</Descriptions.Item>
                  <Descriptions.Item label="Guardian Name">{applicationDetails.parent_guardian_name}</Descriptions.Item>
                </Descriptions>
              </Card>

              <Card title="Address Information" style={{ marginBottom: '16px' }}>
                <Descriptions column={2}>
                  <Descriptions.Item label="Address">{applicationDetails.address?.address}</Descriptions.Item>
                  <Descriptions.Item label="Pincode">{applicationDetails.address?.pincode}</Descriptions.Item>
                  <Descriptions.Item label="State">{applicationDetails.address?.state}</Descriptions.Item>
                  <Descriptions.Item label="District">{applicationDetails.address?.district}</Descriptions.Item>
                  <Descriptions.Item label="Mandal">{applicationDetails.address?.mandal}</Descriptions.Item>
                  <Descriptions.Item label="Sachivalayam">{applicationDetails.address?.sachivalayam}</Descriptions.Item>
                </Descriptions>
              </Card>

              <Card title="Documents" style={{ marginBottom: '16px' }}>
                <Descriptions column={2}>
                  <Descriptions.Item label="Address Proof">
                    {applicationDetails.addressProof ? (
                      <Button type="link" onClick={() => window.open(applicationDetails.addressProof, '_blank')}>
                        View Document
                      </Button>
                    ) : 'Not Uploaded'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Caste Proof">
                    {applicationDetails.casteProof ? (
                      <Button type="link" onClick={() => window.open(applicationDetails.casteProof, '_blank')}>
                        View Document
                      </Button>
                    ) : 'Not Uploaded'}
                  </Descriptions.Item>
                  <Descriptions.Item label="DOB Proof">
                    {applicationDetails.dobProof ? (
                      <Button type="link" onClick={() => window.open(applicationDetails.dobProof, '_blank')}>
                        View Document
                      </Button>
                    ) : 'Not Uploaded'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Card title="Application Status" style={{ marginBottom: '16px' }}>
                <Descriptions column={2}>
                  <Descriptions.Item label="Status">
                    <Badge 
                      status={applicationDetails.status === 'PENDING' ? 'processing' : 'success'} 
                      text={applicationDetails.status}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item 
                    label={
                      <span style={{ 
                        backgroundColor: '#1890ff',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: 'bold'
                      }}>
                        Current Stage
                      </span>
                    }
                  >
                    <div style={{
                      backgroundColor: '#e6f7ff',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid #91d5ff',
                      color: '#1890ff',
                      fontWeight: 'bold'
                    }}>
                      {applicationDetails.current_stage || 'Not Started'}
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Created At">{new Date(applicationDetails.created_at).toLocaleString()}</Descriptions.Item>
                  <Descriptions.Item label="Updated At">{new Date(applicationDetails.updated_at).toLocaleString()}</Descriptions.Item>
                  {applicationDetails.rejection_reason && (
                    <Descriptions.Item label="Rejection Reason">{applicationDetails.rejection_reason}</Descriptions.Item>
                  )}
                </Descriptions>
              </Card>

              <Card title="Officials Information" style={{ marginBottom: '16px' }}>
                <Descriptions column={2}>
                  <Descriptions.Item label="MVRO Details">
                    {`${applicationDetails.mvro_user?.mandal || 'N/A'} - ${applicationDetails.mvro_user?.district || 'N/A'}`}
                  </Descriptions.Item>
                  <Descriptions.Item label="SVRO Details">
                    {`${applicationDetails.svro_user?.mandal || 'N/A'} - ${applicationDetails.svro_user?.sachivalayam || 'N/A'}`}
                  </Descriptions.Item>
                  <Descriptions.Item label="RI Details">
                    {`${applicationDetails.ri_user?.mandal || 'N/A'} - ${applicationDetails.ri_user?.district || 'N/A'}`}
                  </Descriptions.Item>
                  <Descriptions.Item label="MRO Details">
                    {`${applicationDetails.mro_user?.mandal || 'N/A'} - ${applicationDetails.mro_user?.district || 'N/A'}`}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </div>
          )}
        </Modal>

        <Drawer
          title="Add Remarks"
          placement="right"
          onClose={closeRemarksDrawer}
          open={remarksDrawerVisible}
        >
          <Form onFinish={submitRemarks}>
            <Form.Item
              name="remarks"
              rules={[{ required: true, message: 'Please enter your remarks' }]}
            >
              <Input.TextArea rows={4} placeholder="Enter your remarks here" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit Remarks
              </Button>
            </Form.Item>
          </Form>
        </Drawer>

        <Drawer
          title="Resend Application"
          placement="right"
          onClose={() => {
            setResendDrawerVisible(false);
            setResendDescription('');
          }}
          visible={resendDrawerVisible}
          width={400}
          footer={
            <div style={{ textAlign: 'right' }}>
              <Button onClick={() => setResendDrawerVisible(false)} style={{ marginRight: 8 }}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                onClick={handleResendApplication}
                loading={resendLoading}
                style={{ backgroundColor: '#faad14', borderColor: '#faad14' }}
              >
                Submit
              </Button>
            </div>
          }
        >
          <Form layout="vertical">
            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true, message: 'Please provide a description' }]}
            >
              <Input.TextArea 
                rows={4} 
                value={resendDescription}
                onChange={(e) => setResendDescription(e.target.value)}
                placeholder="Enter reason for resending application"
              />
            </Form.Item>
          </Form>
        </Drawer>

        <Drawer
          title="User Profile"
          placement="right"
          onClose={closeDrawer}
          visible={drawerVisible}
          width={400}
        >
          <Card>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <Avatar size={64} icon={<UserOutlined />} />
              <Title level={4} style={{ marginTop: '10px', marginBottom: '0' }}>
                {userData?.name || 'User'}
              </Title>
              <p>{userData?.email || 'No email available'}</p>
            </div>
            <Descriptions column={1}>
              <Descriptions.Item label="Role">{role}</Descriptions.Item>
              <Descriptions.Item label="Status">Active</Descriptions.Item>
            </Descriptions>
          </Card>
        </Drawer>
      </div>
    </SvroLayout>
  );
}
