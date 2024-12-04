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
  aadhar_num: z.string().refine((value) => value.replace(/\s/g, '').length === 12, {
    message: "Aadhar number must be 12 digits",
  }),
  full_name: z.string().min(1, "Full name is required"),
  dob: z.date({ required_error: "Date of birth is required" }),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], { required_error: "Gender is required" }),
  religion: z.string().min(1, "Religion is required"),
  caste_id: z.number().int().positive("Caste is required"),
  sub_caste: z.string().min(1, "Sub caste is required"),
  parent_religion: z.string().min(1, "Parent religion is required"),
  parent_guardian_id: z.string().min(1, "Parent/Guardian type is required"),
  parent_guardian_name: z.string().min(1, "Parent/Guardian name is required"),
  marital_status: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"], { required_error: "Marital status is required" }),
  phone_num: z.string().length(10, "Phone number must be exactly 10 digits").regex(/^\d+$/, "Phone number must contain only digits"),
  email: z.string().email("Invalid email address").regex(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, "Email must be a valid Gmail address"),
  pincode: z.string().min(1, "Pincode is required"),
  state: z.string().min(1, "State is required"),
  district: z.string().min(1, "District is required"),
  mandal: z.string().min(1, "Mandal is required"),
  sachivalayam: z.string().min(1, "Sachivalayam is required"),
  address: z.string().min(1, "Address is required"),
  proofOfResidence: z.string().min(1, "Proof of residence type is required"),
  proofOfDOB: z.string().min(1, "Proof of date of birth type is required"),
  proofOfCaste: z.string().min(1, "Proof of caste type is required"),
  aadharCardImage: z.array(z.any()).min(1, "Aadhar Card image is required").optional(),
  electricityBillImage: z.array(z.any()).min(1, "Electricity Bill image is required").optional(),
  gasBillImage: z.array(z.any()).min(1, "Gas Bill image is required").optional(),
  aadharCardImageForDOB: z.array(z.any()).min(1, "Aadhar Card image for DOB is required").optional(),
  panCardImage: z.array(z.any()).min(1, "PAN Card image is required").optional(),
  sscCertificateImage: z.array(z.any()).min(1, "SSC Certificate image is required").optional(),
  fatherCasteCertificateImage: z.array(z.any()).min(1, "Father's Caste Certificate image is required").optional(),
  motherCasteCertificateImage: z.array(z.any()).min(1, "Mother's Caste Certificate image is required").optional(),
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

  const onSubmit = async (data) => {
    if (!isAadharVerified) {
      message.error('Please verify your Aadhar number before submitting');
      return;
    }

    const formData = new FormData();

    // Prepare the JSON data
    const jsonData = {
      full_name: data.full_name,
      dob: data.dob,
      gender: data.gender,
      religion: data.religion,
      caste: data.caste_id,
      sub_caste: data.sub_caste,
      parent_religion: data.parent_religion,
      parent_guardian_type: data.parent_guardian_id,
      parent_guardian_name: data.parent_guardian_name,
      marital_status: data.marital_status,
      aadhar_num: data.aadhar_num,
      phone_num: data.phone_num,
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

    // Append file uploads
    // Map the file fields to the expected multer fields
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

    // Add DOB proof
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

    // Add caste proof
    if (data.fatherCasteCertificateImage?.[0]) {
      formData.append('casteProof', data.fatherCasteCertificateImage[0].originFileObj);
      formData.append("casteProofType", "FATHER");
    } else if (data.motherCasteCertificateImage?.[0]) {
      formData.append('casteProof', data.motherCasteCertificateImage[0].originFileObj);
      formData.append("casteProofType", "MOTHER");
    }

    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/application`, formData, {
        headers: { 'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
         },
      });
      console.log('Application submitted successfully:', response.data);
      message.success('Application submitted successfully');
    } catch (error) {
      console.error('Error submitting application:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        message.error(`Error submitting application: ${error.response.data.message || 'Please try again.'}`);
      } else if (error.request) {
        // The request was made but no response was received
        message.error('Error submitting application: No response from server. Please try again.');
      } else {
        // Something happened in setting up the request that triggered an Error
        message.error('Error submitting application: Please check your form and try again.');
      }
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
          setProofOfResidence={setProofOfResidence}
          setProofOfDOB={setProofOfDOB}
          setProofOfCaste={setProofOfCaste}
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

            <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
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
                  <Button type="primary" htmlType="submit">
                    Submit
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
