import React, { useState } from 'react';
import { Form, Input, Button, Select, message, Upload } from 'antd';
import { UserOutlined, HomeOutlined, UploadOutlined } from '@ant-design/icons';

const { Option } = Select;

const ApplicationForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    applicationArea: '',
    applicationDate: '',
    location: '',
    village: '',
    city: '',
    mandal: '',
    pincode: '',
    district: '',
    proofOfResidence: '',
    proofOfDOB: '',
    proofOfCaste: '',
    residenceFile: null,
    dobFile: null,
    casteFile: null,
  });

  // Handle form submission
  const onFinish = (values) => {
    console.log('Received values from form: ', values);
    message.success('Application submitted successfully!');
  };

  // Handle file upload
  const handleUpload = (fileType, file) => {
    setFormData((prevData) => ({
      ...prevData,
      [fileType]: file,
    }));
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '50px 0' }}>
      <h2 style={{ textAlign: 'center' }}>Caste Certificate Application</h2>
      <Form
        name="application"
        onFinish={onFinish}
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          name="firstName"
          label="First Name"
          rules={[{ required: true, message: 'Please input your first name!' }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="First Name"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
        </Form.Item>

        {/* Last Name */}
        <Form.Item
          name="lastName"
          label="Last Name"
          rules={[{ required: true, message: 'Please input your last name!' }]}
        >
          <Input
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
        </Form.Item>

        {/* Application Date */}
        <Form.Item
          name="applicationDate"
          label="Application Date"
          rules={[{ required: true, message: 'Please input your application date!' }]}
        >
          <Input
            type="date"
            placeholder="Application Date"
            value={formData.applicationDate}
            onChange={(e) => setFormData({ ...formData, applicationDate: e.target.value })}
          />
        </Form.Item>

        {/* Status */}
        
        {/* Application Area */}
        <Form.Item
          name="applicationArea"
          label="Application Area"
          rules={[{ required: true, message: 'Please input your application area!' }]}
        >
          <Input
            placeholder="Application Area"
            value={formData.applicationArea}
            onChange={(e) => setFormData({ ...formData, applicationArea: e.target.value })}
          />
        </Form.Item>

       
        {/* Address Fields */}
        <h3>Address Details</h3>

        {/* Location */}
        <Form.Item
          name="location"
          label="Location"
          rules={[{ required: true, message: 'Please input the location!' }]}
        >
          <Input
            prefix={<HomeOutlined />}
            placeholder="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </Form.Item>

        {/* Village */}
        <Form.Item
          name="village"
          label="Village"
        >
          <Input
            placeholder="Village"
            value={formData.village}
            onChange={(e) => setFormData({ ...formData, village: e.target.value })}
          />
        </Form.Item>

        {/* City */}
        <Form.Item
          name="city"
          label="City"
        >
          <Input
            placeholder="City"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
        </Form.Item>

        {/* Mandal */}
        <Form.Item
          name="mandal"
          label="Mandal"
        >
          <Input
            placeholder="Mandal"
            value={formData.mandal}
            onChange={(e) => setFormData({ ...formData, mandal: e.target.value })}
          />
        </Form.Item>

        {/* Pincode */}
        <Form.Item
          name="pincode"
          label="Pincode"
          rules={[{ required: true, message: 'Please input your pincode!' }]}
        >
          <Input
            placeholder="Pincode"
            value={formData.pincode}
            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
          />
        </Form.Item>

        {/* District */}
        <Form.Item
          name="district"
          label="District"
          rules={[{ required: true, message: 'Please input your district!' }]}
        >
          <Input
            placeholder="District"
            value={formData.district}
            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
          />
        </Form.Item>

        {/* Application Date */}
        <Form.Item
          name="applicationDate"
          label="Application Date"
          rules={[{ required: true, message: 'Please input your application date!' }]}
        >
          <Input
            type="date"
            value={formData.applicationDate}
            onChange={(e) => setFormData({ ...formData, applicationDate: e.target.value })}
          />
        </Form.Item>

        {/* Proof of Residence */}
        <Form.Item
          name="proofOfResidence"
          label="Proof of Residence"
          rules={[{ required: true, message: 'Please select proof of residence!' }]}
        >
          <Select
            value={formData.proofOfResidence}
            onChange={(value) => setFormData({ ...formData, proofOfResidence: value })}
          >
            <Option value="aadhar">Aadhar Card</Option>
            <Option value="electricity">Electricity Bill</Option>
            <Option value="gas">Gas Bill</Option>
          </Select>
        </Form.Item>

        {formData.proofOfResidence && (
          <div>
            {formData.proofOfResidence === 'aadhar' && (
              <>
                <Form.Item
                  name="aadharId"
                  label="Aadhar ID"
                  rules={[{ required: true, message: 'Please input your Aadhar ID!' }]}
                >
                  <Input
                    placeholder="Aadhar ID"
                    onChange={(e) => setFormData({ ...formData, aadharId: e.target.value })}
                  />
                </Form.Item>
                <Form.Item
                  name="aadharCardImage"
                  label="Aadhar Card Image"
                  valuePropName="fileList"
                  getValueFromEvent={({ fileList }) => fileList}
                  rules={[{ required: true, message: 'Please upload your Aadhar card image!' }]}
                >
                  <Upload
                    customRequest={(options) => handleUpload('residenceFile', options.file)}
                    listType="picture"
                    accept="image/*"
                    maxCount={1}
                  >
                    <Button icon={<UploadOutlined />}>Upload</Button>
                  </Upload>
                </Form.Item>
              </>
            )}
            {formData.proofOfResidence === 'electricity' && (
              <Form.Item
                name="electricityBillImage"
                label="Electricity Bill Image"
                valuePropName="fileList"
                getValueFromEvent={({ fileList }) => fileList}
                rules={[{ required: true, message: 'Please upload your electricity bill image!' }]}
              >
                <Upload
                  customRequest={(options) => handleUpload('residenceFile', options.file)}
                  listType="picture"
                  accept="image/*"
                  maxCount={1}
                >
                  <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
              </Form.Item>
            )}
            {formData.proofOfResidence === 'gas' && (
              <Form.Item
                name="gasBillImage"
                label="Gas Bill Image"
                valuePropName="fileList"
                getValueFromEvent={({ fileList }) => fileList}
                rules={[{ required: true, message: 'Please upload your gas bill image!' }]}
              >
                <Upload
                  customRequest={(options) => handleUpload('residenceFile', options.file)}
                  listType="picture"
                  accept="image/*"
                  maxCount={1}
                >
                  <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
              </Form.Item>
            )}
          </div>
        )}

        {/* Proof of Date of Birth */}
        <Form.Item
          name="proofOfDOB"
          label="Proof of Date of Birth"
          rules={[{ required: true, message: 'Please select proof of date of birth!' }]}
        >
          <Select
            value={formData.proofOfDOB}
            onChange={(value) => setFormData({ ...formData, proofOfDOB: value })}
          >
            <Option value="aadhar">Aadhar Card</Option>
            <Option value="pan">PAN Card</Option>
            <Option value="ssc">SSC Certificate</Option>
          </Select>
        </Form.Item>

        {formData.proofOfDOB && (
          <div>
            {formData.proofOfDOB === 'aadhar' && (
              <>
                <Form.Item
                  name="aadharCardImageDOB"
                  label="Aadhar Card Image"
                  valuePropName="fileList"
                  getValueFromEvent={({ fileList }) => fileList}
                  rules={[{ required: true, message: 'Please upload your Aadhar card image!' }]}
                >
                  <Upload
                    customRequest={(options) => handleUpload('dobFile', options.file)}
                    listType="picture"
                    accept="image/*"
                    maxCount={1}
                  >
                    <Button icon={<UploadOutlined />}>Upload</Button>
                  </Upload>
                </Form.Item>
              </>
            )}
            {formData.proofOfDOB === 'pan' && (
              <Form.Item
                name="panCardImage"
                label="PAN Card Image"
                valuePropName="fileList"
                getValueFromEvent={({ fileList }) => fileList}
                rules={[{ required: true, message: 'Please upload your PAN card image!' }]}
              >
                <Upload
                  customRequest={(options) => handleUpload('dobFile', options.file)}
                  listType="picture"
                  accept="image/*"
                  maxCount={1}
                >
                  <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
              </Form.Item>
            )}
            {formData.proofOfDOB === 'ssc' && (
              <Form.Item
                name="sscCertificateImage"
                label="SSC Certificate Image"
                valuePropName="fileList"
                getValueFromEvent={({ fileList }) => fileList}
                rules={[{ required: true, message: 'Please upload your SSC certificate image!' }]}
              >
                <Upload
                  customRequest={(options) => handleUpload('dobFile', options.file)}
                  listType="picture"
                  accept="image/*"
                  maxCount={1}
                >
                  <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
              </Form.Item>
            )}
          </div>
        )}

        {/* Proof of Caste */}
        <Form.Item
          name="proofOfCaste"
          label="Proof of Caste"
          rules={[{ required: true, message: 'Please select proof of caste!' }]}
        >
          <Select
            value={formData.proofOfCaste}
            onChange={(value) => setFormData({ ...formData, proofOfCaste: value })}
          >
            <Option value="father">Father Caste Certificate</Option>
            <Option value="mother">Mother Caste Certificate</Option>
          </Select>
        </Form.Item>

        {formData.proofOfCaste && (
          <div>
            {formData.proofOfCaste === 'father' && (
              <Form.Item
                name="fatherCasteCertificateImage"
                label="Father Caste Certificate"
                valuePropName="fileList"
                getValueFromEvent={({ fileList }) => fileList}
                rules={[{ required: true, message: 'Please upload your father caste certificate!' }]}
              >
                <Upload
                  customRequest={(options) => handleUpload('casteFile', options.file)}
                  listType="picture"
                  accept="image/*"
                  maxCount={1}
                >
                  <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
              </Form.Item>
            )}
            {formData.proofOfCaste === 'mother' && (
              <Form.Item
                name="motherCasteCertificateImage"
                label="Mother Caste Certificate"
                valuePropName="fileList"
                getValueFromEvent={({ fileList }) => fileList}
                rules={[{ required: true, message: 'Please upload your mother caste certificate!' }]}
              >
                <Upload
                  customRequest={(options) => handleUpload('casteFile', options.file)}
                  listType="picture"
                  accept="image/*"
                  maxCount={1}
                >
                  <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
              </Form.Item>
            )}
          </div>
        )}

        {/* Submit Button */}
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
            Submit Application
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ApplicationForm;
