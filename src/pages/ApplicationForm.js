import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import moment from 'moment';
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Radio,
  Upload,
  Card,
  message,
  ConfigProvider,
  Space,
  Row,
  Col,
  Typography
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';

const { Option } = Select;
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

  const [addressData, setAddressData] = useState([]);
  const [pincodes, setPincodes] = useState([]);
  const [sachivalayamOptions, setSachivalayamOptions] = useState([]);
  const [isAadharVerified, setIsAadharVerified] = useState(false);
  const [isAadharExisting, setIsAadharExisting] = useState(false);
  const [proofOfResidence, setProofOfResidence] = useState('');
  const [proofOfDOB, setProofOfDOB] = useState('');
  const [proofOfCaste, setProofOfCaste] = useState('');

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
  }, []);

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

  const castes = [
    { caste_id: 1, name: 'OC' },
    { caste_id: 2, name: 'OBC' },
    { caste_id: 3, name: 'ST' },
    { caste_id: 4, name: 'SC' },
  ];

  const religions = [
    { religion_id: 1, name: 'HINDU' },
    { religion_id: 2, name: 'CHRISTIAN' },
    { religion_id: 3, name: 'MUSLIM' },
    { religion_id: 4, name: 'NOA' },
  ];

  const parentGuardianTypes = [
    { id: 1, type: 'FATHER' },
    { id: 2, type: 'MOTHER' },
    { id: 3, type: 'SIBILING' },
  ];

  const verifyAadhar = async () => {
    const aadharNum = watch('aadhar_num');
    if (!aadharNum || aadharNum.replace(/\s/g, '').length !== 12) {
      message.error('Please enter a valid 12-digit Aadhar number');
      return;
    }

    try {
      console.log("Verifying Aadhar:", aadharNum);
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/check_aadhaar/${aadharNum.replace(/\s/g, "")}`
      );
      console.log("Aadhar verification response:", response.data);
    
      if (response.data && typeof response.data === "object") {
        const numOfApplications = response.data.numOfApplications;
    
        if (numOfApplications === 0) {
          setIsAadharVerified(true);
          setIsAadharExisting(false);
          message.success("Aadhar verified successfully. You can proceed with the application.");
        } else if (numOfApplications > 0) {
          setIsAadharVerified(false);
          setIsAadharExisting(true);
          message.error("This Aadhar ID already exists. Please enter a new one.");
        } else {
          throw new Error("Unexpected numOfApplications value");
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error verifying Aadhar:", error);
      message.error(`Error verifying Aadhar: ${error.message}`);
      setIsAadharVerified(false);
      setIsAadharExisting(false);
    }
  };

  const onSubmit = async (data) => {
    const jsonPayload = {};
    const filesPayload = new FormData();
  
    // Convert data to JSON object
    Object.entries(data).forEach(([key, value]) => {
      if (value && value.fileList) {
        // For Ant Design's Upload component, add the files to FormData
        filesPayload.append(key, value.fileList[0].originFileObj);
      } else if (typeof value === 'object' && !(value instanceof File)) {
        // Handle nested objects like address details
        jsonPayload[key] = value;
      } else if (value instanceof File) {
        // Add individual files to FormData
        filesPayload.append(key, value);
      } else {
        jsonPayload[key] = value;
      }
    });
  
    console.log('JSON Payload:', JSON.stringify(jsonPayload)); // Debugging
    console.log('FormData Files:', Array.from(filesPayload.entries())); // Debugging
  
    try {
      // Combine JSON data and files into one request
      const combinedPayload = new FormData();
      combinedPayload.append('data', new Blob([JSON.stringify(jsonPayload)], { type: 'application/json' }));
      Array.from(filesPayload.entries()).forEach(([key, file]) => {
        combinedPayload.append(key, file);
      });
  
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/application`, combinedPayload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      console.log('Application submitted successfully:', response.data);
      message.success('Application submitted successfully');
  
      // Send confirmation email
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/send-confirmation-email`, {
        email: data.email,
        name: data.full_name,
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      message.error('Error submitting application');
    }
  };
  
  

  const beforeUpload = (file) => {
    const isLt1M = file.size / 1024 / 1024 < 1;
    if (!isLt1M) {
      message.error('File must be smaller than 1MB!');
    }
    return false;
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  return (
    <ConfigProvider>
      <Card title="Application Form" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Aadhar Number" validateStatus={errors.aadhar_num ? 'error' : ''} help={errors.aadhar_num?.message}>
                <Space>
                  <Controller
                    name="aadhar_num"
                    control={control}
                    rules={{ required: true, pattern: /^\d{4}\s\d{4}\s\d{4}$/ }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="xxxx xxxx xxxx"
                        maxLength={14}
                        onChange={(e) => {
                          const formatted = e.target.value
                            .replace(/\s/g, '')
                            .match(/.{1,4}/g)
                            ?.join(' ') || '';
                          field.onChange(formatted);
                        }}
                        disabled={isAadharVerified}
                      />
                    )}
                  />
                  <Button onClick={verifyAadhar} disabled={isAadharVerified}>
                    Verify Aadhar
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>

          {isAadharVerified && <p style={{ color: 'green' }}>Aadhar verified successfully. Please complete the form.</p>}
          {isAadharExisting && <p style={{ color: 'red' }}>This Aadhar ID already exists. Please enter a new one.</p>}

          {isAadharVerified && (
            <>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Full Name" validateStatus={errors.full_name ? 'error' : ''} help={errors.full_name?.message}>
                    <Controller
                      name="full_name"
                      control={control}
                      render={({ field }) => <Input {...field} />}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Date of Birth" validateStatus={errors.dob ? 'error' : ''} help={errors.dob?.message}>
                    <Controller
                      name="dob"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          format="YYYY-MM-DD"
                          disabledDate={(current) => current && current > moment()}
                          onChange={(date) => field.onChange(date ? date.toDate() : null)}
                          value={field.value ? moment(field.value) : null}
                        />
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Gender" validateStatus={errors.gender ? 'error' : ''} help={errors.gender?.message}>
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <Radio.Group {...field}>
                          <Radio value="MALE">Male</Radio>
                          <Radio value="FEMALE">Female</Radio>
                          <Radio value="OTHER">Other</Radio>
                        </Radio.Group>
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Religion" validateStatus={errors.religion ? 'error' : ''} help={errors.religion?.message}>
                    <Controller
                      name="religion"
                      control={control}
                      render={({ field }) => (
                        <Select {...field} showSearch optionFilterProp="children">
                          {religions.map((religion) => (
                            <Option key={religion.religion_id} value={religion.name}>
                              {religion.name}
                            </Option>
                          ))}
                        </Select>
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Caste" validateStatus={errors.caste_id ? 'error' : ''} help={errors.caste_id?.message}>
                    <Controller
                      name="caste_id"
                      control={control}
                      render={({ field }) => (
                        <Select {...field} showSearch optionFilterProp="children">
                          {castes.map((caste) => (
                            <Option key={caste.caste_id} value={caste.caste_id}>
                              {caste.name}
                            </Option>
                          ))}
                        </Select>
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Sub Caste" validateStatus={errors.sub_caste ? 'error' : ''} help={errors.sub_caste?.message}>
                    <Controller
                      name="sub_caste"
                      control={control}
                      render={({ field }) => <Input {...field} />}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Parent Religion" validateStatus={errors.parent_religion ? 'error' : ''} help={errors.parent_religion?.message}>
                    <Controller
                      name="parent_religion"
                      control={control}
                      render={({ field }) => <Input {...field} />}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Parent/Guardian Type" validateStatus={errors.parent_guardian_id ? 'error' : ''} help={errors.parent_guardian_id?.message}>
                    <Controller
                      name="parent_guardian_id"
                      control={control}
                      render={({ field }) => (
                        <Select {...field} showSearch optionFilterProp="children">
                          {parentGuardianTypes.map((type) => (
                            <Option key={type.id} value={type.type}>
                              {type.type}
                            </Option>
                          ))}
                        </Select>
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Parent/Guardian Name" validateStatus={errors.parent_guardian_name ? 'error' : ''} help={errors.parent_guardian_name?.message}>
                    <Controller
                      name="parent_guardian_name"
                      control={control}
                      render={({ field }) => <Input {...field} />}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Marital Status" validateStatus={errors.marital_status ? 'error' : ''} help={errors.marital_status?.message}>
                    <Controller
                      name="marital_status"
                      control={control}
                      render={({ field }) => (
                        <Select {...field} showSearch optionFilterProp="children">
                          <Option value="SINGLE">Single</Option>
                          <Option value="MARRIED">Married</Option>
                          <Option value="DIVORCED">Divorced</Option>
                          <Option value="WIDOWED">Widowed</Option>
                        </Select>
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Phone Number" validateStatus={errors.phone_num ? 'error' : ''} help={errors.phone_num?.message}>
                    <Controller
                      name="phone_num"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          maxLength={10}
                          onKeyPress={(event) => {
                            if (!/[0-9]/.test(event.key)) {
                              event.preventDefault();
                            }
                          }}
                        />
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Email" validateStatus={errors.email ? 'error' : ''} help={errors.email?.message}>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="email"
                          onBlur={(e) => {
                            const email = e.target.value;
                            if (email && !email.endsWith('@gmail.com')) {
                              message.error('Email must be a valid Gmail address');
                            }
                          }}
                        />
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Pincode" validateStatus={errors.pincode ? 'error' : ''} help={errors.pincode?.message}>
                    <Controller
                      name="pincode"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          showSearch
                          optionFilterProp="children"
                          onChange={(value) => {
                            field.onChange(value);
                            handlePincodeChange(value);
                          }}
                        >
                          {pincodes.map((pincode) => (
                            <Option key={pincode} value={pincode}>
                              {pincode}
                            </Option>
                          ))}
                        </Select>
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="State" validateStatus={errors.state ? 'error' : ''} help={errors.state?.message}>
                    <Controller
                      name="state"
                      control={control}
                      render={({ field }) => <Input {...field} readOnly />}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="District" validateStatus={errors.district ? 'error' : ''} help={errors.district?.message}>
                    <Controller
                      name="district"
                      control={control}
                      render={({ field }) => <Input {...field} readOnly />}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Mandal" validateStatus={errors.mandal ? 'error' : ''} help={errors.mandal?.message}>
                    <Controller
                      name="mandal"
                      control={control}
                      render={({ field }) => <Input {...field} readOnly />}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Sachivalayam" validateStatus={errors.sachivalayam ? 'error' : ''} help={errors.sachivalayam?.message}>
                    <Controller
                      name="sachivalayam"
                      control={control}
                      render={({ field }) => (
                        <Select {...field} showSearch optionFilterProp="children">
                          {sachivalayamOptions.map((sachivalayam, index) => (
                            <Option key={index} value={sachivalayam}>
                              {sachivalayam}
                            </Option>
                          ))}
                        </Select>
                      )}
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Address" validateStatus={errors.address ? 'error' : ''} help={errors.address?.message}>
                    <Controller
                      name="address"
                      control={control}
                      render={({ field }) => <Input.TextArea {...field} />}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={24} md={8}>
                  <Title level={4}>Proof of Residence</Title>
                  <Form.Item name="proofOfResidence" label="Document Type" validateStatus={errors.proofOfResidence ? 'error' : ''} help={errors.proofOfResidence?.message}>
                    <Controller
                      name="proofOfResidence"
                      control={control}
                      render={({ field }) => (
                        <Select 
                          {...field} 
                          onChange={(value) => {
                            field.onChange(value);
                            setProofOfResidence(value);
                          }}
                        >
                          <Option value="aadhaar">Aadhar Card</Option>
                          <Option value="electricity">Electricity Bill</Option>
                          <Option value="gas">Gas Bill</Option>
                        </Select>
                      )}
                    />
                  </Form.Item>
                  {proofOfResidence === 'aadhaar' && (
                    <Form.Item
                      name="aadharCardImage"
                      label="Aadhar Card Image"
                      valuePropName="fileList"
                      getValueFromEvent={normFile}
                      validateStatus={errors.aadharCardImage ? 'error' : ''}
                      help={errors.aadharCardImage?.message}
                    >
                      <Controller
                        name="aadharCardImage"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Upload
                            name="aadharCardImage"
                            listType="picture"
                            maxCount={1}
                            accept=".pdf,.jpg,.png"
                            beforeUpload={beforeUpload}
                            fileList={value}
                            onChange={(info) => {
                              onChange(info.fileList);
                            }}
                          >
                            <Button icon={<UploadOutlined />}>Click to upload</Button>
                          </Upload>
                        )}
                      />
                    </Form.Item>
                  )}
                  {proofOfResidence === 'electricity' && (
                    <Form.Item
                      name="electricityBillImage"
                      label="Electricity Bill Image"
                      valuePropName="fileList"
                      getValueFromEvent={normFile}
                      validateStatus={errors.electricityBillImage ? 'error' : ''}
                      help={errors.electricityBillImage?.message}
                    >
                      <Controller
                        name="electricityBillImage"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Upload
                            name="electricityBillImage"
                            listType="picture"
                            accept=".pdf,.jpg,.png"
                            maxCount={1}
                            beforeUpload={beforeUpload}
                            fileList={value}
                            onChange={(info) => {
                              onChange(info.fileList);
                            }}
                          >
                            <Button icon={<UploadOutlined />}>Click to upload</Button>
                          </Upload>
                        )}
                      />
                    </Form.Item>
                  )}
                  {proofOfResidence === 'gas' && (
                    <Form.Item
                      name="gasBillImage"
                      label="Gas Bill Image"
                      valuePropName="fileList"
                      getValueFromEvent={normFile}
                      validateStatus={errors.gasBillImage ? 'error' : ''}
                      help={errors.gasBillImage?.message}
                    >
                      <Controller
                        name="gasBillImage"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Upload
                            name="gasBillImage"
                            listType="picture"
                            accept=".pdf,.jpg,.png"
                            maxCount={1}
                            beforeUpload={beforeUpload}
                            fileList={value}
                            onChange={(info) => {
                              onChange(info.fileList);
                            }}
                          >
                            <Button icon={<UploadOutlined />}>Click to upload</Button>
                          </Upload>
                        )}
                      />
                    </Form.Item>
                  )}
                </Col>
                <Col span={24} md={8}>
                  <Title level={4}>Proof of Date of Birth</Title>
                  <Form.Item name="proofOfDOB" label="Document Type" validateStatus={errors.proofOfDOB ? 'error' : ''} help={errors.proofOfDOB?.message}>
                    <Controller
                      name="proofOfDOB"
                      control={control}
                      render={({ field }) => (
                        <Select 
                          {...field} 
                          onChange={(value) => {
                            field.onChange(value);
                            setProofOfDOB(value);
                          }}
                        >
                          <Option value="aadhar">Aadhar Card</Option>
                          <Option value="pan">PAN Card</Option>
                          <Option value="ssc">SSC Certificate</Option>
                        </Select>
                      )}
                    />
                  </Form.Item>
                  {proofOfDOB === 'aadhar' && (
                    <Form.Item
                      name="aadharCardImageForDOB"
                      label="Aadhar Card Image"
                      valuePropName="fileList"
                      getValueFromEvent={normFile}
                      validateStatus={errors.aadharCardImageForDOB ? 'error' : ''}
                      help={errors.aadharCardImageForDOB?.message}
                    >
                      <Controller
                        name="aadharCardImageForDOB"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Upload
                            name="aadharCardImageForDOB"
                            listType="picture"
                            accept=".pdf,.jpg,.png"
                            maxCount={1}
                            beforeUpload={beforeUpload}
                            fileList={value}
                            onChange={(info) => {
                              onChange(info.fileList);
                            }}
                          >
                            <Button icon={<UploadOutlined />}>Click to upload</Button>
                          </Upload>
                        )}
                      />
                    </Form.Item>
                  )}
                  {proofOfDOB === 'pan' && (
                    <Form.Item
                      name="panCardImage"
                      label="PAN Card Image"
                      valuePropName="fileList"
                      getValueFromEvent={normFile}
                      validateStatus={errors.panCardImage ? 'error' : ''}
                      help={errors.panCardImage?.message}
                    >
                      <Controller
                        name="panCardImage"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Upload
                            name="panCardImage"
                            listType="picture"
                            accept=".pdf,.jpg,.png"
                            maxCount={1}
                            beforeUpload={beforeUpload}
                            fileList={value}
                            onChange={(info) => {
                              onChange(info.fileList);
                            }}
                          >
                            <Button icon={<UploadOutlined />}>Click to upload</Button>
                          </Upload>
                        )}
                      />
                    </Form.Item>
                  )}
                  {proofOfDOB === 'ssc' && (
                    <Form.Item
                      name="sscCertificateImage"
                      label="SSC Certificate Image"
                      valuePropName="fileList"
                      getValueFromEvent={normFile}
                      validateStatus={errors.sscCertificateImage ? 'error' : ''}
                      help={errors.sscCertificateImage?.message}
                    >
                      <Controller
                        name="sscCertificateImage"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Upload
                            name="sscCertificateImage"
                            listType="picture"
                            accept=".pdf,.jpg,.png"
                            maxCount={1}
                            beforeUpload={beforeUpload}
                            fileList={value}
                            onChange={(info) => {
                              onChange(info.fileList);
                            }}
                          >
                            <Button icon={<UploadOutlined />}>Click to upload</Button>
                          </Upload>
                        )}
                      />
                    </Form.Item>
                  )}
                </Col>
                <Col span={24} md={8}>
                  <Title level={4}>Proof of Caste</Title>
                  <Form.Item name="proofOfCaste" label="Document Type" validateStatus={errors.proofOfCaste ? 'error' : ''} help={errors.proofOfCaste?.message}>
                    <Controller
                      name="proofOfCaste"
                      control={control}
                      render={({ field }) => (
                        <Select 
                          {...field} 
                          onChange={(value) => {
                            field.onChange(value);
                            setProofOfCaste(value);
                          }}
                        >
                          <Option value="father">Father's Caste Certificate</Option>
                          <Option value="mother">Mother's Caste Certificate</Option>
                        </Select>
                      )}
                    />
                  </Form.Item>
                  {proofOfCaste === 'father' && (
                    <Form.Item
                      name="fatherCasteCertificateImage"
                      label="Father's Caste Certificate Image"
                      valuePropName="fileList"
                      getValueFromEvent={normFile}
                      validateStatus={errors.fatherCasteCertificateImage ? 'error' : ''}
                      help={errors.fatherCasteCertificateImage?.message}
                    >
                      <Controller
                        name="fatherCasteCertificateImage"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Upload
                            name="fatherCasteCertificateImage"
                            listType="picture"
                            maxCount={1}
                            accept=".pdf,.jpg,.png"
                            beforeUpload={beforeUpload}
                            fileList={value}
                            onChange={(info) => {
                              onChange(info.fileList);
                            }}
                          >
                            <Button icon={<UploadOutlined />}>Click to upload</Button>
                          </Upload>
                        )}
                      />
                    </Form.Item>
                  )}
                  {proofOfCaste === 'mother' && (
                    <Form.Item
                      name="motherCasteCertificateImage"
                      label="Mother's Caste Certificate Image"
                      valuePropName="fileList"
                      getValueFromEvent={normFile}
                      validateStatus={errors.motherCasteCertificateImage ? 'error' : ''}
                      help={errors.motherCasteCertificateImage?.message}
                    >
                      <Controller
                        name="motherCasteCertificateImage"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <Upload
                            name="motherCasteCertificateImage"
                            listType="picture"
                            accept=".pdf,.jpg,.png"
                            maxCount={1}
                            beforeUpload={beforeUpload}
                            fileList={value}
                            onChange={(info) => {
                              onChange(info.fileList);
                            }}
                          >
                            <Button icon={<UploadOutlined />}>Click to upload</Button>
                          </Upload>
                        )}
                      />
                    </Form.Item>
                  )}
                </Col>
              </Row>
            </>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit Application
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </ConfigProvider>
  );
}

export default ApplicationForm;

