import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, message, Upload, Row, Col, Card, Typography, Divider, Spin } from 'antd';
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { Title, Text } = Typography;

// This would typically come from an API call to the backend
const states = ['Andhra Pradesh', 'Telangana', 'Karnataka'];

export default function ApplicationForm() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchingPincode, setFetchingPincode] = useState(false);
  const [proofOfResidence, setProofOfResidence] = useState('');
  const [proofOfDOB, setProofOfDOB] = useState('');
  const [proofOfCaste, setProofOfCaste] = useState('');
  const [districts, setDistricts] = useState([]);
  const [mandals, setMandals] = useState([]);
  const [cities, setCities] = useState([]);

  const fetchLocationData = async (pincode) => {
    if (pincode.length !== 6) return;

    setFetchingPincode(true);
    try {
      const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = response.data[0];
      if (data.Status === "Success" && data.PostOffice.length > 0) {
        const postOffice = data.PostOffice[0];
        form.setFieldsValue({
          state: postOffice.State,
          district: postOffice.District,
          city: postOffice.Division,
        });
        // In a real application, you would fetch districts, cities, and mandals based on the state and district
        setDistricts([postOffice.District]);
        setCities([postOffice.Division]);
        setMandals([postOffice.Block]);
      } else {
        message.error('No data found for the given pincode');
        form.setFieldsValue({
          state: undefined,
          district: undefined,
          city: undefined,
          mandal: undefined,
        });
        setDistricts([]);
        setCities([]);
        setMandals([]);
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
      message.error('Failed to fetch location data');
    } finally {
      setFetchingPincode(false);
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
    formData.append("addressDetails[village]", values.address);
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
            {/* <Form.Item name="applicationDate" label="Application Date" rules={[{ required: true, message: 'Please select the application date!' }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="applicationArea" label="Application Area" rules={[{ required: true, message: 'Please input the application area!' }]}>
              <Input />
            </Form.Item> */}
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
              rules={[
                { required: true, message: 'Please input your pincode!' },
                { pattern: /^\d{6}$/, message: 'Pincode must be exactly 6 digits!' }
              ]}
            >
              <Input
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length === 6) {
                    fetchLocationData(value);
                  }
                }}
                maxLength={6}
                suffix={fetchingPincode ? <LoadingOutlined /> : null}
              />
            </Form.Item>
            <Form.Item name="ward" label="Ward" rules={[{ required: true, message: 'Please input your ward!' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="state" label="State" rules={[{ required: true, message: 'Please select your state!' }]}>
              <Select
                showSearch
                placeholder="Select state"
                disabled={fetchingPincode}
                filterOption={(input, option) =>
                  option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {states.map(state => (
                  <Option key={state} value={state}>{state}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="district" label="District" rules={[{ required: true, message: 'Please select your district!' }]}>
              <Select
                showSearch
                placeholder="Select district"
                disabled={fetchingPincode}
                filterOption={(input, option) =>
                  option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {districts.map(district => (
                  <Option key={district} value={district}>{district}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="city" label="City" rules={[{ required: true, message: 'Please select your city!' }]}>
              <Select
                showSearch
                placeholder="Select city"
                disabled={fetchingPincode}
                filterOption={(input, option) =>
                  option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {cities.map(city => (
                  <Option key={city} value={city}>{city}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="mandal" label="Mandal" rules={[{ required: true, message: 'Please select your mandal!' }]}>
              <Select
                showSearch
                placeholder="Select mandal"
                disabled={fetchingPincode}
                filterOption={(input, option) =>
                  option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {mandals.map(mandal => (
                  <Option key={mandal} value={mandal}>{mandal}</Option>
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
                  name="aadharIdForDOB"
                  label="Aadhar ID"
                  rules={[
                    { required: true, message: 'Please input your Aadhar ID!' },
                    { pattern: /^\d{12}$/, message: 'Aadhar ID must be exactly 12 digits!' }
                  ]}
                >
                  <Input />
                </Form.Item>
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
                <Form.Item name="panId" label="PAN ID" rules={[{ required: true, message: 'Please input your PAN ID!' }]}>
                  <Input />
                </Form.Item>
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