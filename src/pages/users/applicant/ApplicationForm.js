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
  Spin,
  Modal,
  Select
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

const applicationSchema = z.object({
  // Personal Info Validation
  full_name: z.string().min(2, { message: "Full name must be at least 2 characters" }),
  dob: z.date().refine(date => {
    const age = calculateAge(date);
    return age >= 18 && age <= 100;
  }, { message: "You must be between 18 and 100 years old" }),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], { message: "Invalid gender selection" }),
  religion: z.string().min(2, { message: "Religion must be specified" }),
  caste: z.string().optional(),
  sub_caste: z.string().optional(),
  parent_religion: z.string().min(2, { message: "Parent's religion must be specified" }),
  parent_guardian_type: z.enum(['FATHER', 'MOTHER', 'GUARDIAN'], { message: "Invalid guardian type" }),
  parent_guardian_name: z.string().min(2, { message: "Parent/Guardian name must be at least 2 characters" }),
  marital_status: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'], { message: "Invalid marital status" }),
  
  // Contact Validation
  aadhar_num: z.string().regex(/^\d{12}$/, { message: "Aadhar number must be 12 digits" }),
  phone_num: z.string().regex(/^[6-9]\d{9}$/, { message: "Invalid Indian mobile number" }),
  email: z.string().email({ message: "Invalid email address" }),

  // Address Validation
  pincode: z.string().regex(/^\d{6}$/, { message: "Pincode must be 6 digits" }),
  state: z.string().min(2, { message: "State must be specified" }),
  district: z.string().min(2, { message: "District must be specified" }),
  mandal: z.string().min(2, { message: "Mandal must be specified" }),
  address: z.string().min(10, { message: "Address must be at least 10 characters" }),
  sachivalayam: z.string().min(2, { message: "Sachivalayam must be specified" }),

  // Document Validation
  addressProof: z.any().refine(file => file && file[0], { message: "Address proof is required" }),
  dobProof: z.any().refine(file => file && file[0], { message: "Date of Birth proof is required" }),
  casteProof: z.any().refine(file => file && file[0], { message: "Caste proof is required" }),
  
  addressProofType: z.string().min(1, { message: "Address proof type is required" }),
  dobProofType: z.string().min(1, { message: "DOB proof type is required" }),
  casteProofType: z.string().min(1, { message: "Caste proof type is required" })
});

const calculateAge = (birthDate) => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

function ApplicationForm() {
  const { control, handleSubmit, watch, setValue, formState: { errors }, trigger, getValues } = useForm({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      full_name: '',
      dob: '',
      gender: '',
      religion: '',
      caste: '',
      sub_caste: '',
      parent_religion: '',
      parent_guardian_type: '',
      parent_guardian_name: '',
      marital_status: '',
      aadhar_num: '',
      phone_num: '',
      email: '',
      pincode: '',
      state: '',
      district: '',
      mandal: '',
      address: '',
      sachivalayam: '',
      addressProof: null,
      dobProof: null,
      casteProof: null,
      addressProofType: '',
      dobProofType: '',
      casteProofType: ''
    }
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [addressData, setAddressData] = useState([]);
  const [pincodes, setPincodes] = useState([]);
  const [sachivalayamOptions, setSachivalayamOptions] = useState([]);
  const [isAadharVerified, setIsAadharVerified] = useState(false);
  const [isAadharExisting, setIsAadharExisting] = useState(false);
  const { token, logout } = useContext(UserContext);

  const [collapsed, setCollapsed] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifyingAadhar, setVerifyingAadhar] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    // Validate entire form data
    try {
      // Validate using Zod schema
      const validatedData = applicationSchema.parse(data);
      
      // Prepare form data for submission
      const formData = new FormData();

      // Personal Information
      Object.keys(validatedData).forEach(key => {
        if (key !== 'addressProof' && key !== 'dobProof' && key !== 'casteProof') {
          // Handle special cases like date conversion
          if (key === 'dob') {
            formData.append(key, validatedData[key].toISOString());
          } else {
            formData.append(key, validatedData[key]);
          }
        }
      });

      // Prepare Address Details
      const addressDetails = {
        pincode: validatedData.pincode,
        state: validatedData.state,
        district: validatedData.district,
        mandal: validatedData.mandal,
        address: validatedData.address,
        sachivalayam: validatedData.sachivalayam
      };
      formData.append('addressDetails', JSON.stringify(addressDetails));

      // File Uploads
      const fileFields = ['addressProof', 'dobProof', 'casteProof'];
      fileFields.forEach(field => {
        if (validatedData[field] && validatedData[field][0]) {
          const file = validatedData[field][0];
          
          // Additional file validation
          const maxSize = 5 * 1024 * 1024; // 5MB
          const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
          
          if (file.size > maxSize) {
            throw new Error(`${field} file must be less than 5MB`);
          }
          
          if (!allowedTypes.includes(file.type)) {
            throw new Error(`Invalid file type for ${field}. Only JPEG, PNG, and PDF are allowed.`);
          }
          
          formData.append(field, file);
        }
      });

      // Proof Types
      formData.append('addressProofType', validatedData.addressProofType);
      formData.append('dobProofType', validatedData.dobProofType);
      formData.append('casteProofType', validatedData.casteProofType);

      // Set loading state
      setIsSubmitting(true);

      // Submit to backend
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/application`, 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          // Add timeout and error handling
          timeout: 30000 // 30 seconds timeout
        }
      );

      // Success handling
      message.success('Application submitted successfully!');
      
      // Optional: Navigate to tracking or dashboard
      navigate('/applicant/dashboard');
    } catch (error) {
      // Comprehensive error handling
      if (error instanceof z.ZodError) {
        // Zod validation errors
        const errorMessages = error.errors.map(err => err.message);
        message.error(errorMessages.join(', '));
      } else if (axios.isAxiosError(error)) {
        // Axios specific errors
        if (error.response) {
          // Server responded with an error
          message.error(error.response.data.message || 'Submission failed');
        } else if (error.request) {
          // Request made but no response received
          message.error('No response from server. Please check your network connection.');
        } else {
          // Something else went wrong
          message.error('An unexpected error occurred');
        }
      } else {
        // Generic error handling
        message.error(error.message || 'Submission failed');
      }
    } finally {
      // Always reset submitting state
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
      key: 'application-renewal',
      icon: <FileSearchOutlined />,
      label: 'Application renewal',
      onClick: () => navigate('/applicant/renewal')
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
    // Extensive logging for debugging
    console.log('Pincode Change Triggered:', value);
    console.log('Full Address Data:', addressData);

    // Find matching addresses
    const selectedAddresses = addressData.filter(item => item.pincode === value);
    console.log('Selected Addresses:', selectedAddresses);

    if (selectedAddresses.length > 0) {
      const sachivalayams = selectedAddresses.map(item => item.sachivalayam);
      const uniqueSachivalayams = [...new Set(sachivalayams)];
      console.log('All Sachivalayams:', sachivalayams);
      console.log('Unique Sachivalayams:', uniqueSachivalayams);
      
      setValue('sachivalayam', '');
      setValue('state', selectedAddresses[0].state);
      setValue('district', selectedAddresses[0].district);
      setValue('mandal', selectedAddresses[0].mandal);
      setSachivalayamOptions(uniqueSachivalayams);
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
              onSubmit={handleSubmit(onSubmit)}
            >
              {steps[currentStep].content}

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginTop: 24 
              }}>
                {currentStep > 0 && (
                  <Button 
                    style={{ margin: '0 8px' }} 
                    onClick={() => setCurrentStep(currentStep - 1)}
                  >
                    Previous
                  </Button>
                )}
                {currentStep < steps.length - 1 && (
                  <Button 
                    type="primary" 
                    onClick={() => setCurrentStep(currentStep + 1)}
                  >
                    Next
                  </Button>
                )}
                {currentStep === steps.length - 1 && (
                  <Button 
                    type="primary" 
                    htmlType="submit"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
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
