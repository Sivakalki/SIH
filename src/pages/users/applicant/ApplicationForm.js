import React, { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import {
  Form,
  Button,
  Card,
  Steps,
  Layout,
  message,
  Menu,
  Avatar,
  Typography,
  Spin
} from 'antd';
import {
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
import PersonalInfoForm from '../../../components/forms/PersonalInfoForm';
import AddressForm from '../../../components/forms/AddressForm';
import DocumentUploadForm from '../../../components/forms/DocumentUploadForm';
import '../../../styles/Dashboard.css';

const { Step } = Steps;
const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const MAX_FILE_SIZE = 1024 * 1024; // 1MB

const schema = z.object({
  aadharNumber: z.string().min(12, "Aadhar number must be 12 digits").max(12, "Aadhar number must be 12 digits"),
  fullName: z.string().min(1, "Full name is required"),
  dateOfBirth: z.any().refine((val) => val instanceof Date || val === null, "Date of birth is required"),
  gender: z.string({ required_error: "Gender is required" }),
  religion_id: z.any().refine((val) => val !== undefined && val !== null && val !== '', "Religion is required"),
  caste_id: z.any().refine((val) => val !== undefined && val !== null && val !== '', "Caste is required"),
  subCaste: z.string().min(1, "Sub caste is required"),
  parentReligion_id: z.any().refine((val) => val !== undefined && val !== null && val !== '', "Parent religion is required"),
  parentGuardianType: z.string().min(1, "Guardian type is required"),
  parentGuardianName: z.string().min(1, "Guardian name is required"),
  maritalStatus: z.string({ required_error: "Marital status is required" }),
  phoneNumber: z.string().length(10, "Phone number must be exactly 10 digits"),
  email: z.string().email("Invalid email address"),
  pincode: z.string().min(1, "Pincode is required"),
  state: z.string().min(1, "State is required"),
  district: z.string().min(1, "District is required"),
  mandal: z.string().min(1, "Mandal is required"),
  address: z.string().min(1, "Address is required"),
  sachivalayam: z.string().min(1, "Sachivalayam is required"),
  proofOfResidence: z.string().min(1, "Proof of residence type is required"),
  proofOfDOB: z.string().min(1, "Proof of DOB type is required"),
  proofOfCaste: z.string().min(1, "Proof of caste type is required"),
  aadharCardImage: z.any().optional(),
  electricityBillImage: z.any().optional(),
  gasBillImage: z.any().optional(),
  aadharCardImageForDOB: z.any().optional(),
  panCardImage: z.any().optional(),
  sscCertificateImage: z.any().optional(),
  fatherCasteCertificateImage: z.any().optional(),
  motherCasteCertificateImage: z.any().optional(),
});

function ApplicationForm() {
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      proofOfResidence: '',
      proofOfDOB: '',
      proofOfCaste: '',
      aadharNumber: '',
      fullName: '',
      gender: '',
      religion_id: '',
      caste_id: '',
      subCaste: '',
      parentReligion_id: '',
      parentGuardianType: '',
      parentGuardianName: '',
      maritalStatus: '',
      phoneNumber: '',
      email: '',
      pincode: '',
      state: '',
      district: '',
      mandal: '',
      address: '',
      sachivalayam: ''
    }
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [addressData, setAddressData] = useState([]);
  const [pincodes, setPincodes] = useState([]);
  const [sachivalayamOptions, setSachivalayamOptions] = useState([]);
  const [isAadharVerified, setIsAadharVerified] = useState(false);
  const [isAadharExisting, setIsAadharExisting] = useState(false);
  const [proofOfResidence, setProofOfResidence] = useState('');
  const [proofOfDOB, setProofOfDOB] = useState('');
  const [proofOfCaste, setProofOfCaste] = useState('');
  const { token, logout } = useContext(UserContext);

  const [collapsed, setCollapsed] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifyingAadhar, setVerifyingAadhar] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinalSubmit = async () => {
    if (!isAadharVerified) {
      message.error('Please verify your Aadhar number before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = await handleSubmit(async (data) => {
        // Create FormData object
        const formData = new FormData();

        // Add personal info fields
        formData.append('aadharNumber', data.aadharNumber || '');
        formData.append('fullName', data.fullName || '');
        formData.append('dateOfBirth', data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : '');
        formData.append('gender', data.gender || '');
        formData.append('religion_id', data.religion_id || '');
        formData.append('caste_id', data.caste_id || '');
        formData.append('subCaste', data.subCaste || '');
        formData.append('parentReligion_id', data.parentReligion_id || '');
        formData.append('parentGuardianType', data.parentGuardianType || '');
        formData.append('parentGuardianName', data.parentGuardianName || '');
        formData.append('maritalStatus', data.maritalStatus || '');
        formData.append('phoneNumber', data.phoneNumber || '');
        formData.append('email', data.email || '');

        // Add address fields
        formData.append('pincode', data.pincode || '');
        formData.append('state', data.state || '');
        formData.append('district', data.district || '');
        formData.append('mandal', data.mandal || '');
        formData.append('address', data.address || '');
        formData.append('sachivalayam', data.sachivalayam || '');

        // Add document proof types
        formData.append('proofOfResidence', data.proofOfResidence || '');
        formData.append('proofOfDOB', data.proofOfDOB || '');
        formData.append('proofOfCaste', data.proofOfCaste || '');

        // Add document files
        if (data.aadharCardImage?.[0]) {
          formData.append('aadharCardImage', data.aadharCardImage[0]);
        }
        if (data.electricityBillImage?.[0]) {
          formData.append('electricityBillImage', data.electricityBillImage[0]);
        }
        if (data.gasBillImage?.[0]) {
          formData.append('gasBillImage', data.gasBillImage[0]);
        }
        if (data.aadharCardImageForDOB?.[0]) {
          formData.append('aadharCardImageForDOB', data.aadharCardImageForDOB[0]);
        }
        if (data.panCardImage?.[0]) {
          formData.append('panCardImage', data.panCardImage[0]);
        }
        if (data.sscCertificateImage?.[0]) {
          formData.append('sscCertificateImage', data.sscCertificateImage[0]);
        }
        if (data.fatherCasteCertificateImage?.[0]) {
          formData.append('fatherCasteCertificateImage', data.fatherCasteCertificateImage[0]);
        }
        if (data.motherCasteCertificateImage?.[0]) {
          formData.append('motherCasteCertificateImage', data.motherCasteCertificateImage[0]);
        }

        return formData;
      })();

      // Make the API call
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/applications`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Application submitted successfully:', response.data);
      message.success('Application submitted successfully');
      navigate('/applicant/applications');
    } catch (error) {
      console.error('Error submitting application:', error);
      if (error.response?.data?.message) {
        message.error(`Error: ${error.response.data.message}`);
      } else {
        message.error('Please fill in all required fields correctly');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
      key: 'reports',
      icon: <BarsOutlined />,
      label: 'Reports',
      onClick: () => navigate('/applicant/reports')
    }
  ];

  useEffect(() => {
    const fetchAddressData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/getAllLocationDetails`);
        if (response.status === 400) {
          message.error("There are no VRO present here");
        }
        setAddressData(response.data);
        const uniquePincodes = [...new Set(response.data.map(item => item.pincode))];
        setPincodes(uniquePincodes);
      } catch (error) {
        console.error('Error fetching address data:', error);
        message.error('Unable to fetch the data');
      }
    };

    fetchAddressData();
  }, [process.env.REACT_APP_BACKEND_URL]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/users/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserData(res.data.user);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token]);

  const verifyAadhar = async (aadharNumber) => {
    console.log(aadharNumber);
    if (!aadharNumber) {
      message.error('Please enter Aadhar number first');
      return;
    }

    try {
      setVerifyingAadhar(true);
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/check_aadhaar/${aadharNumber}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log(response.data.numOfApplications)
      if (response.data.numOfApplications == 0) {
        setIsAadharVerified(true);
        message.success('Aadhar verified successfully!');
      } 
      else if(response.data.numOfApplications >= 1){
        setIsAadharExisting(true);
        message.error('Aadhar number already exists');  
      }
      else {
        message.error('Invalid Aadhar number. Please check and try again.');
      }
    } catch (error) {
      console.error('Error verifying Aadhar:', error);
      if (error.response?.status === 401) {
        message.error('Session expired. Please login again.');
        logout();
      } else {
        message.error('Failed to verify Aadhar. Please try again.');
      }
    } finally {
      setVerifyingAadhar(false);
    }
  };

  const handlePincodeChange = (value) => {
    const selectedAddresses = addressData.filter(item => item.pincode === value);

    if (selectedAddresses.length > 0) {
      const sachivalayams = selectedAddresses.map(item => item.sachivalayam);
      setValue('sachivalayam', '');
      setValue('state', selectedAddresses[0].state);
      setValue('district', selectedAddresses[0].district);
      setValue('mandal', selectedAddresses[0].mandal);
      setSachivalayamOptions(sachivalayams);
    } else {
      setSachivalayamOptions([]);
    }
  };

  const steps = [
    {
      title: 'Personal Information',
      content: (
        <PersonalInfoForm 
          control={control}
          errors={errors}
          isAadharVerified={isAadharVerified}
          onAadharVerify={verifyAadhar}
          verifyingAadhar={verifyingAadhar}
        />
      )
    },
    {
      title: 'Address Details',
      content: (
        <AddressForm 
          control={control}
          errors={errors}
          pincodes={pincodes}
          sachivalayamOptions={sachivalayamOptions}
          handlePincodeChange={handlePincodeChange}
        />
      )
    },
    {
      title: 'Documents',
      content: (
        <DocumentUploadForm 
          control={control}
          errors={errors}
        />
      )
    }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        style={{
          background: '#fff',
          boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 10
        }}
      >
        <div style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '16px',
          position: 'sticky',
          top: 0,
          background: '#fff',
          zIndex: 1
        }}>
          <Title level={3} className="certitrack-title" style={{ display: collapsed ? 'none' : 'block' }}>
            CertiTrack
          </Title>
        </div>
        <Menu
          className="custom-menu"
          mode="inline"
          selectedKeys={['new-application']}
          items={menuItems}
          style={{ borderRight: 0 }}
          
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-end',
          gap: '16px',
          boxShadow: '0 2px 8px 0 rgba(29,35,41,.05)',
          position: 'fixed',
          right: 0,
          top: 0,
          left: collapsed ? 80 : 200,
          zIndex: 9,
          transition: 'all 0.2s'
        }}>
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: '20px', color: '#4169E1' }} />}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#4169E1' }} />
            <span style={{ color: '#4169E1', fontWeight: 500 }}>
              {userData?.name || 'User'}
            </span>
          </div>
          {/* <Button
            type="text"
            icon={<LogoutOutlined style={{ color: '#4169E1' }} />}
            onClick={logout}
          /> */}
        </Header>
        <Content style={{ 
          margin: '24px', 
          marginTop: '88px', 
          minHeight: 280,
          overflow: 'auto',
          height: 'calc(100vh - 88px)',
          padding: '0 24px 24px'
        }}>
          <Card>
            <Steps current={currentStep} style={{ marginBottom: 24 }}>
              {steps.map(item => (
                <Step key={item.title} title={item.title} />
              ))}
            </Steps>

            <Form 
              layout="vertical"
              onSubmit={(e) => {
                e.preventDefault();
                if (currentStep === steps.length - 1) {
                  handleFinalSubmit();
                }
              }}
            >
              {steps[currentStep].content}

              <div style={{ marginTop: 24, textAlign: 'right' }}>
                {currentStep > 0 && (
                  <Button style={{ marginRight: 8 }} onClick={() => setCurrentStep(currentStep - 1)}>
                    Previous
                  </Button>
                )}
                {currentStep < steps.length - 1 && (
                  <Button type="primary" onClick={() => setCurrentStep(currentStep + 1)}>
                    Next
                  </Button>
                )}
                {currentStep === steps.length - 1 && (
                  <Button 
                    type="primary" 
                    onClick={(e) => {
                      e.preventDefault();
                      handleFinalSubmit();
                    }}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Submit Application
                  </Button>
                )}
              </div>
            </Form>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
}

export default ApplicationForm;
