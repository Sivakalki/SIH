import React from 'react';
import { Form, Input, DatePicker, Radio, Select, Button, Space } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;

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

const PersonalInfoForm = ({ control, errors, isAadharVerified, onAadharVerify, verifyingAadhar }) => {
  const aadharNumber = Form.useWatch('aadharNumber', control);
  const isAadharValid = aadharNumber?.length === 12;

  const handleVerifyClick = () => {
    if (isAadharValid) {
      onAadharVerify(aadharNumber);
    }
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Form.Item
        name="aadharNumber"
        label="Aadhar Number"
        rules={[
          { required: true, message: 'Please enter your Aadhar number' },
          { 
            pattern: /^\d{12}$/, 
            message: 'Aadhar number must be exactly 12 digits' 
          }
        ]}
        extra={isAadharVerified && (
          <span style={{ color: '#52c41a' }}>
            <CheckCircleOutlined /> Verified
          </span>
        )}
      >
        <Space>
          <Input
            placeholder="Enter 12-digit Aadhar number"
            maxLength={12}
            disabled={isAadharVerified}
            style={{ width: '200px' }}
          />
          <Button
            type="primary"
            onClick={handleVerifyClick}
            loading={verifyingAadhar}
            disabled={!isAadharValid || isAadharVerified}
          >
            {isAadharVerified ? 'Verified' : 'Verify Aadhar'}
          </Button>
        </Space>
      </Form.Item>

      {isAadharVerified && (
        <>
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[
              { required: true, message: 'Please enter your full name' }
            ]}
          >
            <Input placeholder="Enter your full name" />
          </Form.Item>

          <Form.Item
            name="dateOfBirth"
            label="Date of Birth"
            rules={[
              { required: true, message: 'Please select your date of birth' }
            ]}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              placeholder="Select your date of birth"
            />
          </Form.Item>

          <Form.Item
            name="gender"
            label="Gender"
            rules={[
              { required: true, message: 'Please select your gender' }
            ]}
          >
            <Radio.Group>
              <Radio value="MALE">Male</Radio>
              <Radio value="FEMALE">Female</Radio>
              <Radio value="OTHER">Other</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="religion_id"
            label="Religion"
            rules={[
              { required: true, message: 'Please select your religion' }
            ]}
          >
            <Select placeholder="Select your religion">
              {religions.map(religion => (
                <Option key={religion.religion_id} value={religion.religion_id}>
                  {religion.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="caste_id"
            label="Caste"
            rules={[
              { required: true, message: 'Please select your caste' }
            ]}
          >
            <Select placeholder="Select your caste">
              {castes.map(caste => (
                <Option key={caste.caste_id} value={caste.caste_id}>
                  {caste.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="subCaste"
            label="Sub Caste"
            rules={[
              { required: true, message: 'Please enter your sub caste' }
            ]}
          >
            <Input placeholder="Enter your sub caste" />
          </Form.Item>

          <Form.Item
            name="parentReligion_id"
            label="Parent Religion"
            rules={[
              { required: true, message: 'Please select parent religion' }
            ]}
          >
            <Select placeholder="Select parent religion">
              {religions.map(religion => (
                <Option key={religion.religion_id} value={religion.religion_id}>
                  {religion.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="parentGuardianType"
            label="Parent/Guardian Type"
            rules={[
              { required: true, message: 'Please select parent/guardian type' }
            ]}
          >
            <Select placeholder="Select parent/guardian type">
              {parentGuardianTypes.map(type => (
                <Option key={type.id} value={type.type}>
                  {type.type}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="parentGuardianName"
            label="Parent/Guardian Name"
            rules={[
              { required: true, message: 'Please enter parent/guardian name' }
            ]}
          >
            <Input placeholder="Enter parent/guardian name" />
          </Form.Item>

          <Form.Item
            name="maritalStatus"
            label="Marital Status"
            rules={[
              { required: true, message: 'Please select your marital status' }
            ]}
          >
            <Radio.Group>
              <Radio value="SINGLE">Single</Radio>
              <Radio value="MARRIED">Married</Radio>
              <Radio value="DIVORCED">Divorced</Radio>
              <Radio value="WIDOWED">Widowed</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              { required: true, message: 'Please enter your phone number' },
              { 
                pattern: /^\d{10}$/, 
                message: 'Phone number must be exactly 10 digits' 
              }
            ]}
          >
            <Input placeholder="Enter your 10-digit phone number" maxLength={10} />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' },
              {
                pattern: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
                message: 'Please enter a valid Gmail address'
              }
            ]}
          >
            <Input placeholder="Enter your Gmail address" />
          </Form.Item>
        </>
      )}
    </Space>
  );
};

export default PersonalInfoForm;
