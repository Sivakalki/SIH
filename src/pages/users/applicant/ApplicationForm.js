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
  const { control, handleSubmit, watch, setValue, formState: { errors }, trigger, getValues } = useForm({
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

  // Comprehensive Proof Type Mapping
  const getProofType = (proofKey) => {
    const proofTypeMap = {
      // Address Proof Types
      'aadharCardImage': 'AADHAR',
      'electricityBillImage': 'ELECTRICITY_BILL',
      'gasBillImage': 'GAS_BILL',

      // DOB Proof Types
      'aadharCardImageForDOB': 'AADHAR',
      'panCardImage': 'PAN_CARD',
      'sscCertificateImage': 'SSC_CERTIFICATE',

      // Caste Proof Types
      'fatherCasteCertificateImage': 'FATHER_CASTE_CERTIFICATE',
      'motherCasteCertificateImage': 'MOTHER_CASTE_CERTIFICATE'
    };
    return proofTypeMap[proofKey] || 'UNKNOWN';
  };

  const handleFinalSubmit = async () => {
    // Validate Aadhar verification
    if (!isAadharVerified) {
      message.error('Please verify your Aadhar number before submitting');
      return;
    }

    // Trigger form validation
    const isValid = await trigger();
    if (!isValid) {
      message.error('Please fill out all required fields correctly');
      return;
    }

    setIsSubmitting(true);

    try {
      // Collect form data
      const formData = new FormData();

      // Personal Information
      const personalFields = [
        { key: 'full_name', value: getValues('fullName') },
        { 
          key: 'dob', 
          value: getValues('dateOfBirth') 
            ? new Date(getValues('dateOfBirth')).toISOString().split('T')[0] 
            : null 
        },
        { key: 'gender', value: getValues('gender') },
        { key: 'religion', value: getValues('religion_id') },
        { key: 'caste', value: getValues('caste_id') },
        { key: 'sub_caste', value: getValues('subCaste') },
        { key: 'parent_religion', value: getValues('parentReligion_id') },
        { key: 'parent_guardian_type', value: getValues('parentGuardianType') },
        { key: 'parent_guardian_name', value: getValues('parentGuardianName') },
        { key: 'marital_status', value: getValues('maritalStatus') },
        { key: 'aadhar_num', value: getValues('aadharNumber') },
        { key: 'phone_num', value: getValues('phoneNumber') },
        { key: 'email', value: getValues('email') }
      ];

      // Debug log
      console.log('Form Values:', {
        caste_id: getValues('caste_id'),
        parsed_caste: parseInt(getValues('caste_id')),
        all_values: getValues()
      });

      // Create a JSON object for personal and address data
      const jsonData = {};
      
      // Add personal fields to JSON
      personalFields.forEach(field => {
        if (field.value !== null && field.value !== undefined) {
          jsonData[field.key] = field.value;
        }
      });

      // Add address details
      const addressDetails = {
        pincode: getValues('pincode'),
        state: getValues('state'),
        district: getValues('district'),
        mandal: getValues('mandal'),
        address: getValues('address'),
        sachivalayam: getValues('sachivalayam')
      };
      jsonData['addressDetails'] = addressDetails;

      // Convert the JSON data to a string and append to FormData
      formData.append('jsonData', JSON.stringify(jsonData));

      // Proof of Residence
      const residenceProofOptions = [
        { file: getValues('aadharCardImage')?.[0], key: 'aadharCardImage' },
        { file: getValues('electricityBillImage')?.[0], key: 'electricityBillImage' },
        { file: getValues('gasBillImage')?.[0], key: 'gasBillImage' }
      ];
      const residenceProof = residenceProofOptions.find(proof => proof.file);
      
      if (!residenceProof) {
        throw new Error('Proof of Residence is required (Aadhar Card, Electricity Bill, or Gas Bill)');
      }
      
      formData.append('addressProof', residenceProof.file);
      formData.append('addressProofType', getProofType(residenceProof.key));

      // Proof of DOB
      const dobProofOptions = [
        { file: getValues('aadharCardImageForDOB')?.[0], key: 'aadharCardImageForDOB' },
        { file: getValues('panCardImage')?.[0], key: 'panCardImage' },
        { file: getValues('sscCertificateImage')?.[0], key: 'sscCertificateImage' }
      ];
      const dobProof = dobProofOptions.find(proof => proof.file);
      
      if (!dobProof) {
        throw new Error('Proof of Date of Birth is required (Aadhar Card, Pan Card, or SSC Certificate)');
      }
      
      formData.append('dobProof', dobProof.file);
      formData.append('dobProofType', getProofType(dobProof.key));

      // Proof of Caste
      const casteProofOptions = [
        { file: getValues('fatherCasteCertificateImage')?.[0], key: 'fatherCasteCertificateImage' },
        { file: getValues('motherCasteCertificateImage')?.[0], key: 'motherCasteCertificateImage' }
      ];
      const casteProof = casteProofOptions.find(proof => proof.file);
      
      if (!casteProof) {
        throw new Error('Proof of Caste is required (Father\'s or Mother\'s Caste Certificate)');
      }
      
      formData.append('casteProof', casteProof.file);
      formData.append('casteProofType', getProofType(casteProof.key));

      // Optional Additional Files
      const optionalFiles = [
        { key: 'sscCertificateImage', file: getValues('sscCertificateImage')?.[0] },
        { key: 'panCardImage', file: getValues('panCardImage')?.[0] },
        { key: 'gasBillImage', file: getValues('gasBillImage')?.[0] },
        { key: 'electricityBillImage', file: getValues('electricityBillImage')?.[0] }
      ];

      optionalFiles.forEach(({ key, file }) => {
        if (file && key !== dobProof.key && key !== residenceProof.key && key !== casteProof.key) {
          formData.append(key, file);
        }
      });

      // Debug: Log form data contents
      console.log('Submission Payload:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: `, value);
      }

      // Submit application
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/application`, 
        formData, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Success handling
      message.success('Application submitted successfully');
      navigate('/applicant/applications');

    } catch (error) {
      // Comprehensive error handling
      console.error('Submission Error:', error);

      if (error.response) {
        // Backend returned an error response
        const errorMessage = error.response.data.message || 
                             error.response.data.error || 
                             'Backend submission error';
        message.error(errorMessage);
        console.error('Backend Error Details:', {
          errorMessage,
          fullErrorResponse: error.response.data
        });
      } else if (error.request) {
        // Request made but no response received
        message.error('No response from server. Please check your network connection.');
        console.error('No response received:', error.request);
      } else {
        // Error in setting up the request
        message.error(error.message || 'Error preparing application submission');
        console.error('Request Setup Error:', error.message);
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
