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
  aadharNumber: z.string().refine((value) => value?.replace(/\s/g, '').length === 12, {
    message: "Aadhar number must be 12 digits",
  }),
  fullName: z.string().min(1, "Full name is required"),
  dateOfBirth: z.any().refine((val) => val instanceof Date, {
    message: "Date of birth is required"
  }),
  gender: z.string({ required_error: "Gender is required" }),
  religion_id: z.number({ required_error: "Religion is required" }),
  caste_id: z.number({ required_error: "Caste is required" }),
  subCaste: z.string().min(1, "Sub caste is required"),
  parentReligion_id: z.number({ required_error: "Parent religion is required" }),
  parentGuardianType: z.string().min(1, "Guardian type is required"),
  parentGuardianName: z.string().min(1, "Guardian name is required"),
  maritalStatus: z.string({ required_error: "Marital status is required" }),
  phoneNumber: z.string().min(10, "Phone number must be 10 digits"),
  email: z.string().email("Invalid email address").refine((email) => email.endsWith("@gmail.com"), {
    message: "Only Gmail addresses are allowed",
  }),
  // Address fields
  pincode: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  mandal: z.string().optional(),
  address: z.string().optional(),
  sachivalayam: z.string().optional(),
  // Document proof fields
  proofOfResidence: z.string().optional(),
  proofOfDOB: z.string().optional(),
  proofOfCaste: z.string().optional(),
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

  const handleFinalSubmit = () => {
    console.log("Final Submit");
    if (!isAadharVerified) {
      message.error('Please verify your Aadhar number before submitting');
      return;
    }
    setIsSubmitting(true);
    handleSubmit(
      async (data) => {
        try {
          console.log("Submitting application...", data);

          const formData = new FormData();

          // Convert date to string format
          const dob = data.dateOfBirth ? data.dateOfBirth.format('YYYY-MM-DD') : null;

          // Prepare the JSON data
          const jsonData = {
            full_name: data.fullName,
            dob: dob,
            gender: data.gender,
            religion: data.religion_id,
            caste: data.caste_id,
            sub_caste: data.subCaste,
            parent_religion: data.parentReligion_id,
            parent_guardian_type: data.parentGuardianType,
            parent_guardian_name: data.parentGuardianName,
            marital_status: data.maritalStatus,
            aadhar_num: data.aadharNumber,
            phone_num: data.phoneNumber,
            email: data.email,
            addressDetails: {
              pincode: data.pincode,
              state: data.state,
              district: data.district,
              mandal: data.mandal,
              address: data.address,
              sachivalayam: data.sachivalayam
            }
          };

          // Append the JSON data
          formData.append('data', JSON.stringify(jsonData));

          // Log the data being sent
          console.log('Sending data:', jsonData);

          // Append file uploads based on proof types
          if (data.proofOfResidence) {
            if (data.proofOfResidence === 'aadhaar' && data.aadharCardImage?.[0]) {
              formData.append('addressProof', data.aadharCardImage[0].originFileObj);
              formData.append("addressProofType", "AADHAR");
            } else if (data.proofOfResidence === 'electricity' && data.electricityBillImage?.[0]) {
              formData.append('addressProof', data.electricityBillImage[0].originFileObj);
              formData.append("addressProofType", "ELECTRICITY");
            } else if (data.proofOfResidence === 'gas' && data.gasBillImage?.[0]) {
              formData.append('addressProof', data.gasBillImage[0].originFileObj);
              formData.append("addressProofType", "GAS");
            }
          }

          // Add DOB proof
          if (data.proofOfDOB) {
            if (data.proofOfDOB === 'aadhar' && data.aadharCardImageForDOB?.[0]) {
              formData.append('dobProof', data.aadharCardImageForDOB[0].originFileObj);
              formData.append("dobProofType", "AADHAR");
            } else if (data.proofOfDOB === 'pan' && data.panCardImage?.[0]) {
              formData.append('dobProof', data.panCardImage[0].originFileObj);
              formData.append("dobProofType", "PAN");
            } else if (data.proofOfDOB === 'ssc' && data.sscCertificateImage?.[0]) {
              formData.append('dobProof', data.sscCertificateImage[0].originFileObj);
              formData.append("dobProofType", "SSC");
            }
          }

          // Add caste proof
          if (data.proofOfCaste) {
            if (data.fatherCasteCertificateImage?.[0]) {
              formData.append('casteProof', data.fatherCasteCertificateImage[0].originFileObj);
              formData.append("casteProofType", "FATHER");
            } else if (data.motherCasteCertificateImage?.[0]) {
              formData.append('casteProof', data.motherCasteCertificateImage[0].originFileObj);
              formData.append("casteProofType", "MOTHER");
            }
          }

          const response = await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}/api/application`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
              },
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
            message.error('Failed to submit application. Please try again.');
          }
        } finally {
          setIsSubmitting(false);
        }
      },
      (errors) => {
        console.error('Validation errors:', errors);
        message.error('Please check all required fields');
        setIsSubmitting(false);
      }
    )();
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
