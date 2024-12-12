import React, { useState, useContext, useEffect } from 'react';
import {
  Card,
  Steps,
  Button,
  Input,
  message,
  Typography,
  Spin,
  Tag,
  Space
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import { UserContext } from '../../../components/userContext';
import DashboardLayout from '../../../components/layout/DashboardLayout';

const { Title } = Typography;

const ApplicationStatus = () => {
  const [applicationId, setApplicationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [applicationData, setApplicationData] = useState(null);
  const { token, logout } = useContext(UserContext);

  const handleTrack = async () => {
    if (!applicationId) {
      message.error('Please enter an application ID');
      return;
    }

    try {
      setTrackingLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/application_status/${applicationId}`,
        {
          headers: { Authorization: `Bearer ${token} `}
        }
      );
      setApplicationData(response.data.application);
      message.success('Application status retrieved successfully');
    } catch (error) {
      console.error('Error fetching application status:', error);
      message.error('Failed to fetch application status');
    } finally {
      setTrackingLoading(false);
    }
  };


  const getStepStatus = (roleType) => {
    if (!applicationData) return 'wait';
    
    const stages = ['SVRO', 'MVRO', 'RI', 'MRO'];
    const currentIndex = stages.indexOf(applicationData.current_stage.role_type);
    const roleIndex = stages.indexOf(roleType);

    if (currentIndex === -1) return 'wait';
    if (roleIndex < currentIndex) return 'finish';
    if (roleIndex === currentIndex) return 'process';
    return 'wait';
  };

  const content = (
    <>
      <Title level={2}>Track Application</Title>
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <Input
            placeholder="Enter Application ID"
            value={applicationId}
            onChange={e => setApplicationId(e.target.value)}
            style={{ maxWidth: '300px' }}
          />
          <Button 
            type="primary" 
            icon={<SearchOutlined />} 
            onClick={handleTrack}
            loading={trackingLoading}
          >
            Track
          </Button>
        </div>

        {applicationData && (
          <div>
            <Card title="Application Details" style={{ marginBottom: 24 }}>
              <div style={{ marginBottom: 24 }}>
                <p><strong>Application ID:</strong> {applicationData.application_id}</p>
                <p><strong>Full Name:</strong> {applicationData.full_name}</p>
                <p>
                  <strong>Status:</strong>{' '}
                  <Tag color={
                    applicationData.status === 'PENDING' ? 'gold' :
                    applicationData.status === 'APPROVED' ? 'green' :
                    applicationData.status === 'REJECTED' ? 'red' : 'default'
                  }>
                    {applicationData.status}
                  </Tag>
                </p>
                <p><strong>Current Stage:</strong> {applicationData.current_stage.role_type}</p>
              </div>

              <Steps
                current={['SVRO', 'MVRO', 'RI', 'MRO'].indexOf(applicationData.current_stage.role_type)}
                items={[
                  {
                    title: 'SVRO',
                    status: getStepStatus('SVRO'),
                  },
                  {
                    title: 'MVRO',
                    status: getStepStatus('MVRO'),
                  },
                  {
                    title: 'RI',
                    status: getStepStatus('RI'),
                  },
                  {
                    title: 'MRO',
                    status: getStepStatus('MRO'),
                  },
                ]}
              />
            </Card>
          </div>
        )}
      </Card>
    </>
  );

  return (
    <DashboardLayout loading={loading}>
      {content}
    </DashboardLayout>
  );
};

export default ApplicationStatus;