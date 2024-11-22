import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, message, Upload, Row, Col, Card, Typography, Divider, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { Title } = Typography;

export default function ApplicationForm() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [addressData, setAddressData] = useState([]);
  const [proofOfResidence, setProofOfResidence] = useState('');
  const [proofOfDOB, setProofOfDOB] = useState('');
  const [proofOfCaste, setProofOfCaste] = useState('');
  const [pincodes, setPincodes] = useState([]);
  const [selectedPincode, setSelectedPincode] = useState(null);

  useEffect(() => {
    const fetchAddressData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/getAllLocationDetails`);
        setAddressData(response.data);
        const uniquePincodes = [...new Set(response.data.map(item => item.pincode))];
        setPincodes(uniquePincodes);
      } catch (error) {
        console.error('Error fetching address data:', error);
        message.error('Failed to fetch address data');
      }
    };

    fetchAddressData();
  }, []);

  const handlePincodeChange = (value) => {
    setSelectedPincode(value);
    const selectedAddress = addressData.find(item => item.pincode === value);
    if (selectedAddress) {
      form.setFieldsValue({
        state: selectedAddress.state,
        district: selectedAddress.district,
        mandal: selectedAddress.mandal,
        village: selectedAddress.village,
      });
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    console.log(values);

    // Prepare the data for the backend
    const formData = new FormData();

    formData.append("firstname", values.firstName);
    formData.append("lastname", values.lastName);
    formData.append("email", values.email);
    formData.append("phone", values.phoneNumber);
    formData.append("aadharID", values.aadharId);
    formData.append("caste", values.caste);
    formData.append("addressDetails[village]", values.village);
    formData.append("addressDetails[mandal]", values.mandal);
    formData.append("addressDetails[pincode]", values.pincode);
    formData.append("addressDetails[address]", values.address);
    formData.append("addressDetails[state]", values.state);
    formData.append("addressDetails[district]", values.district);
    formData.append("addressDetails[city]", values.city);
    formData.append("addressDetails[ward]", values.ward);

    // Adding proof types
    formData.append("addressProofType", values.proofOfResidence);
    formData.append("dobProofType", values.proofOfDOB);
    formData.append("casteProofType", values.proofOfCaste);

    // Handle file uploads for each proof
    if (values.electricityBillImage && values.electricityBillImage.length > 0) {
      formData.append("addressProof", values.electricityBillImage[0].originFileObj);
    }

    if (values.motherCasteCertificateImage && values.motherCasteCertificateImage.length > 0) {
      formData.append("casteProof", values.motherCasteCertificateImage[0].originFileObj);
    }

    if (values.sscCertificateImage && values.sscCertificateImage.length > 0) {
      formData.append("dobProof", values.sscCertificateImage[0].originFileObj);
    }

    // Now, send the data to the backend
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/application`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        message.success('Application submitted successfully');
        form.resetFields();
      }
    } catch (error) {
      message.error('Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  return (
    <Card style={{ width: '100%', maxWidth: 1200, margin: '0 auto', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>Caste Application Form</Title>
      <Form
        form={form}
        name="casteApplicationForm"
        onFinish={onFinish}
        layout="vertical"
        requiredMark="optional"
      >
        <Row gutter={24}>
          <Col span={24} md={12}>
            <Title level={4}>Personal Information</Title>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="firstName" label="First Name" rules={[{ required: true, message: 'Please input your first name!' }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="lastName" label="Last Name" rules={[{ required: true, message: 'Please input your last name!' }]}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Please input a valid email!' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="phoneNumber" label="Phone Number" rules={[{ required: true, message: 'Please input your phone number!' }]}>
              <Input />
            </Form.Item>
            <Form.Item
              name="aadharId"
              label="Aadhar ID"
              rules={[
                { required: true, message: 'Please input your Aadhar ID!' },
                { pattern: /^\d{12}$/, message: 'Aadhar ID must be exactly 12 digits!' }
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="caste" label="Caste" rules={[{ required: true, message: 'Please select your caste!' }]}>
              <Select>
                {['General', 'OBC', 'SC', 'ST'].map(caste => (
                  <Option key={caste} value={caste}>{caste}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={24} md={12}>
            <Title level={4}>Address Information</Title>
            <Form.Item name="address" label="Address" rules={[{ required: true, message: 'Please input your address!' }]}>
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item
              name="pincode"
              label="Pincode"
              rules={[{ required: true, message: 'Please select your pincode!' }]}
            >
              <Select
                showSearch
                placeholder="Select pincode"
                onChange={handlePincodeChange}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {pincodes.map(pincode => (
                  <Option key={pincode} value={pincode}>{pincode}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="state" label="State" rules={[{ required: true, message: 'Please select your state!' }]}>
              <Select disabled={!selectedPincode}>
                {[...new Set(addressData.map(item => item.state))].map(state => (
                  <Option key={state} value={state}>{state}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="district" label="District" rules={[{ required: true, message: 'Please select your district!' }]}>
              <Select disabled={!selectedPincode}>
                {addressData
                  .filter(item => item.pincode === selectedPincode)
                  .map(item => (
                    <Option key={item.district} value={item.district}>{item.district}</Option>
                  ))}
              </Select>
            </Form.Item>
            <Form.Item name="mandal" label="Mandal" rules={[{ required: true, message: 'Please select your mandal!' }]}>
              <Select disabled={!selectedPincode}>
                {addressData
                  .filter(item => item.pincode === selectedPincode)
                  .map(item => (
                    <Option key={item.mandal} value={item.mandal}>{item.mandal}</Option>
                  ))}
              </Select>
            </Form.Item>
            <Form.Item name="village" label="Village" rules={[{ required: true, message: 'Please select your village!' }]}>
              <Select disabled={!selectedPincode}>
                {addressData
                  .filter(item => item.pincode === selectedPincode)
                  .map(item => (
                    <Option key={item.village} value={item.village}>{item.village}</Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Divider />
        <Row gutter={24}>
          <Col span={24} md={8}>
            <Title level={4}>Proof of Residence</Title>
            <Form.Item name="proofOfResidence" label="Document Type" rules={[{ required: true, message: 'Please select the document type!' }]}>
              <Select onChange={(value) => setProofOfResidence(value)}>
                <Option value="aadhaar">Aadhar Card</Option>
                <Option value="electricity">Electricity Bill</Option>
                <Option value="gas">Gas Bill</Option>
              </Select>
            </Form.Item>
            {proofOfResidence === 'aadhaar' && (
              <>
                {/* <Form.Item
                  name="aadharIdForResidence"
                  label="Aadhar ID"
                  rules={[
                    { required: true, message: 'Please input your Aadhar ID!' },
                    { pattern: /^\d{12}$/, message: 'Aadhar ID must be exactly 12 digits!' }
                  ]}
                >
                  <Input />
                </Form.Item> */}
                <Form.Item
                  name="aadharCardImage"
                  label="Aadhar Card Image"
                  valuePropName="fileList"
                  getValueFromEvent={normFile}
                  rules={[{ required: true, message: 'Please upload Aadhar Card image' }]}
                >
                  <Upload
                    name="aadharCardImage"
                    listType="picture"
                    maxCount={1}
                    accept=".pdf,.jpg,.png"
                    beforeUpload={(file) => {
                      const isLt1M = file.size / 1024 / 1024 < 1;
                      if (!isLt1M) {
                        message.error('File must be smaller than 1MB!');
                      }
                      return false; // Prevent auto upload
                    }}
                  >
                    <Button icon={<UploadOutlined />}>Click to upload</Button>
                  </Upload>
                </Form.Item>
              </>
            )}
            {proofOfResidence === 'electricity' && (
              <Form.Item
                name="electricityBillImage"
                label="Electricity Bill Image"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                rules={[{ required: true, message: 'Please upload Electricity Bill image' }]}
              >
                <Upload
                  name="electricityBillImage"
                  listType="picture"
                  accept=".pdf,.jpg,.png"
                  maxCount={1}
                  beforeUpload={(file) => {
                    const isLt1M = file.size / 1024 / 1024 < 1;
                    if (!isLt1M) {
                      message.error('File must be smaller than 1MB!');
                    }
                    return false;
                  }}
                >
                  <Button icon={<UploadOutlined />}>Click to upload</Button>
                </Upload>
              </Form.Item>
            )}
            {proofOfResidence === 'gas' && (
              <Form.Item
                name="gasBillImage"
                label="Gas Bill Image"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                rules={[{ required: true, message: 'Please upload Gas Bill image' }]}
              >
                <Upload
                  name="gasBillImage"
                  listType="picture"
                  accept=".pdf,.jpg,.png"
                  maxCount={1}
                  beforeUpload={(file) => {
                    const isLt1M = file.size / 1024 / 1024 < 1;
                    if (!isLt1M) {
                      message.error('File must be smaller than 1MB!');
                    }
                    return false;
                  }}
                >
                  <Button icon={<UploadOutlined />}>Click to upload</Button>
                </Upload>
              </Form.Item>
            )}
          </Col>
          <Col span={24} md={8}>
            <Title level={4}>Proof of Date of Birth</Title>
            <Form.Item name="proofOfDOB" label="Document Type" rules={[{ required: true, message: 'Please select the document type!' }]}>
              <Select onChange={(value) => setProofOfDOB(value)}>
                <Option value="aadhar">Aadhar Card</Option>
                <Option value="pan">PAN Card</Option>
                <Option value="ssc">SSC Certificate</Option>
              </Select>
            </Form.Item>
            {proofOfDOB === 'aadhar' && (
              <>
                <Form.Item
                  name="aadharCardImageForDOB"
                  label="Aadhar Card Image"
                  valuePropName="fileList"
                  getValueFromEvent={normFile}
                  rules={[{ required: true, message: 'Please upload Aadhar Card image' }]}
                >
                  <Upload
                    name="aadharCardImageForDOB"
                    listType="picture"
                    accept=".pdf,.jpg,.png"
                    maxCount={1}
                    beforeUpload={(file) => {
                      const isLt1M = file.size / 1024 / 1024 < 1;
                      if (!isLt1M) {
                        message.error('File must be smaller than 1MB!');
                      }
                      return false;
                    }}
                  >
                    <Button icon={<UploadOutlined />}>Click to upload</Button>
                  </Upload>
                </Form.Item>
              </>
            )}
            {proofOfDOB === 'pan' && (
              <>
                
                <Form.Item
                  name="panCardImage"
                  label="PAN Card Image"
                  valuePropName="fileList"
                  getValueFromEvent={normFile}
                  rules={[{ required: true, message: 'Please upload PAN Card image' }]}
                >
                  <Upload
                    name="panCardImage"
                    listType="picture"
                    accept=".pdf,.jpg,.png"
                    maxCount={1}
                    beforeUpload={(file) => {
                      const isLt1M = file.size / 1024 / 1024 < 1;
                      if (!isLt1M) {
                        message.error('File must be smaller than 1MB!');
                      }
                      return false;
                    }}
                  >
                    <Button icon={<UploadOutlined />}>Click to upload</Button>
                  </Upload>
                </Form.Item>
              </>
            )}
            {proofOfDOB === 'ssc' && (
              <Form.Item
                name="sscCertificateImage"
                label="SSC Certificate Image"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                rules={[{ required: true, message: 'Please upload SSC Certificate image' }]}
              >
                <Upload
                  name="sscCertificateImage"
                  listType="picture"
                  accept=".pdf,.jpg,.png"
                  maxCount={1}

                  beforeUpload={(file) => {
                    const isLt1M = file.size / 1024 / 1024 < 1;
                    if (!isLt1M) {
                      message.error('File must be smaller than 1MB!');
                    }
                    return false;
                  }}
                >
                  <Button icon={<UploadOutlined />}>Click to upload</Button>
                </Upload>
              </Form.Item>
            )}
          </Col>
          <Col span={24} md={8}>
            <Title level={4}>Proof of Caste</Title>
            <Form.Item name="proofOfCaste" label="Document Type" rules={[{ required: true, message: 'Please select the document type!' }]}>
              <Select onChange={(value) => setProofOfCaste(value)}>
                <Option value="father">Father's Caste Certificate</Option>
                <Option value="mother">Mother's Caste Certificate</Option>
              </Select>
            </Form.Item>
            {proofOfCaste === 'father' && (
              <Form.Item
                name="fatherCasteCertificateImage"
                label="Father's Caste Certificate Image"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                rules={[{ required: true, message: "Please upload Father's Caste Certificate image" }]}
              >
                <Upload
                  name="fatherCasteCertificateImage"
                  listType="picture"
                  maxCount={1}
                  accept=".pdf,.jpg,.png"
                  beforeUpload={(file) => {
                    const isLt1M = file.size / 1024 / 1024 < 1;
                    if (!isLt1M) {
                      message.error('File must be smaller than 1MB!');
                    }
                    return false;
                  }}
                >
                  <Button icon={<UploadOutlined />}>Click to upload</Button>
                </Upload>
              </Form.Item>
            )}
            {proofOfCaste === 'mother' && (
              <Form.Item
                name="motherCasteCertificateImage"
                label="Mother's Caste Certificate Image"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                rules={[{ required: true, message: "Please upload Mother's Caste Certificate image" }]}
              >
                <Upload
                  name="motherCasteCertificateImage"
                  listType="picture"
                  accept=".pdf,.jpg,.png"
                  maxCount={1}
                  beforeUpload={(file) => {
                    const isLt1M = file.size / 1024 / 1024 < 1;
                    if (!isLt1M) {
                      message.error('File must be smaller than 1MB!');
                    }
                    return false;
                  }}
                >
                  <Button icon={<UploadOutlined />}>Click to upload</Button>
                </Upload>
              </Form.Item>
            )}
          </Col>
        </Row>
        <Divider />
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={loading || !form.isFieldsTouched()}
          >
            Submit Application
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}