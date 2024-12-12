import React, { useState, useEffect, useContext } from 'react';
import {
  Table,
  Tag,
  Button,
  Space,
  message,
  Typography,
  Modal,
  Descriptions,
  Spin,
  Empty,
  RefreshOutlined,
  ReloadOutlined
} from 'antd';
import {
  EyeOutlined,
  SyncOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { UserContext } from '../../../components/userContext';
import DashboardLayout from '../../../components/layout/DashboardLayout';

const { Title } = Typography;

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingApplicationId, setLoadingApplicationId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const { token, logout } = useContext(UserContext);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        
        // First, try to fetch from backend
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/myapplications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // If backend fetch successful, use those applications
        if (response.data.applications && response.data.applications.length > 0) {
          setApplications(response.data.applications);
          // Also save to local storage as a cache
          localStorage.setItem('cachedApplications', JSON.stringify(response.data.applications));
        } else {
          // If no applications from backend, check local storage
          const cachedApplications = localStorage.getItem('cachedApplications');
          if (cachedApplications) {
            const parsedApplications = JSON.parse(cachedApplications);
            setApplications(parsedApplications);
            message.info('Showing cached applications');
          }
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        
        // On network error, try to fetch from local storage
        const cachedApplications = localStorage.getItem('cachedApplications');
        if (cachedApplications) {
          const parsedApplications = JSON.parse(cachedApplications);
          setApplications(parsedApplications);
          message.warning('Showing offline applications');
        }
        
        if (error.response?.status === 401) {
          message.error('Session expired. Please login again.');
          logout();
        } else {
          message.error('Failed to fetch applications. Showing offline data if available.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [token, logout]);

  const handleViewApplication = async (applicationId) => {
    try {
      setLoadingApplicationId(applicationId);
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/application/${applicationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedApplication(response.data.data);
      setModalVisible(true);
    } catch (error) {
      message.error('Failed to fetch application details');
      console.error('Error fetching application details:', error);
    } finally {
      setLoadingApplicationId(null);
    }
  };

  const handleRefreshApplications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/myapplications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(response.data.applications);
      localStorage.setItem('cachedApplications', JSON.stringify(response.data.applications));
    } catch (error) {
      console.error('Error refreshing applications:', error);
      message.error('Failed to refresh applications');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Application ID',
      dataIndex: 'application_id',
      key: 'application_id',
    },
    {
      title: 'Full Name',
      dataIndex: 'full_name',
      key: 'full_name',
    },
    {
      title: 'Aadhar Number',
      dataIndex: 'aadhar_num',
      key: 'aadhar_num',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'PENDING' ? 'gold' :
          status === 'APPROVED' ? 'green' :
          status === 'REJECTED' ? 'red' : 'default'
        }>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewApplication(record.application_id)}
            loading={loadingApplicationId === record.application_id}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  const content = (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>My Applications</Title>
        <Button 
          type="primary" 
          icon={<SyncOutlined />} 
          onClick={handleRefreshApplications}
          loading={loading}
        >
          Refresh Applications
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={applications}
        loading={loading}
        rowKey="application_id"
        locale={{
          emptyText: (
            <Empty 
              description="No applications found" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button 
                type="primary" 
                onClick={handleRefreshApplications}
              >
                Refresh Applications
              </Button>
            </Empty>
          )
        }}
      />

      <Modal
        title="Application Details"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {selectedApplication ? (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Application ID">{selectedApplication.application_id}</Descriptions.Item>
            <Descriptions.Item label="Full Name">{selectedApplication.full_name}</Descriptions.Item>
            <Descriptions.Item label="Aadhar Number">{selectedApplication.aadhar_num}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={
                selectedApplication.status === 'PENDING' ? 'gold' :
                selectedApplication.status === 'APPROVED' ? 'green' :
                selectedApplication.status === 'REJECTED' ? 'red' : 'default'
              }>
                {selectedApplication.status}
              </Tag>
            </Descriptions.Item>
            {selectedApplication.caste && (
              <Descriptions.Item label="Caste">{selectedApplication.caste.caste_type}</Descriptions.Item>
            )}
            {selectedApplication.current_stage && (
              <Descriptions.Item label="Current Stage">{selectedApplication.current_stage.role_type}</Descriptions.Item>
            )}
            {selectedApplication.address && (
              <Descriptions.Item label="Address">
                {`${selectedApplication.address.address}, ${selectedApplication.address.sachivalayam}, ${selectedApplication.address.mandal}, ${selectedApplication.address.district}, ${selectedApplication.address.state} - ${selectedApplication.address.pincode}`}
              </Descriptions.Item>
            )}
          </Descriptions>
        ) : (
          <Spin />
        )}
      </Modal>
    </>
  );

  return (
    <DashboardLayout loading={loading}>
      {content}
    </DashboardLayout>
  );
};

export default MyApplications;
