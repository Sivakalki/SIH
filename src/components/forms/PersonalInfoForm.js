import React from 'react';
import { Form, Input, DatePicker, Radio, Select, Button, Space } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import { Controller } from 'react-hook-form';

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
  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Form.Item
        label="Aadhar Number"
        validateStatus={errors.aadharNumber ? "error" : ""}
        help={errors.aadharNumber?.message}
      >
        <Controller
          name="aadharNumber"
          control={control}
          render={({ field }) => (
            <Space>
              <Input
                {...field}
                placeholder="Enter 12-digit Aadhar number"
                maxLength={12}
                disabled={isAadharVerified}
                style={{ width: '200px' }}
              />
              <Button
                type="primary"
                onClick={() => onAadharVerify(field.value)}
                loading={verifyingAadhar}
                disabled={!field.value?.length === 12 || isAadharVerified}
              >
                {isAadharVerified ? 'Verified' : 'Verify Aadhar'}
              </Button>
            </Space>
          )}
        />
      </Form.Item>

      {isAadharVerified && (
        <>
          <Form.Item
            label="Full Name"
            validateStatus={errors.fullName ? "error" : ""}
            help={errors.fullName?.message}
          >
            <Controller
              name="fullName"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter your full name" />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Date of Birth"
            validateStatus={errors.dateOfBirth ? "error" : ""}
            help={errors.dateOfBirth?.message}
          >
            <Controller
              name="dateOfBirth"
              control={control}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                  placeholder="Select your date of birth"
                  onChange={(date) => {
                    const dateObj = date ? date.toDate() : null;
                    field.onChange(dateObj);
                  }}
                  value={field.value ? moment(field.value) : null}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Gender"
            validateStatus={errors.gender ? "error" : ""}
            help={errors.gender?.message}
          >
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

          <Form.Item
            label="Religion"
            validateStatus={errors.religion_id ? "error" : ""}
            help={errors.religion_id?.message}
          >
            <Controller
              name="religion_id"
              control={control}
              render={({ field }) => (
                <Select {...field} placeholder="Select your religion">
                  {religions.map(religion => (
                    <Option key={religion.religion_id} value={religion.religion_id.toString()}>
                      {religion.name}
                    </Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item
            label="Caste"
            validateStatus={errors.caste_id ? "error" : ""}
            help={errors.caste_id?.message}
          >
            <Controller
              name="caste_id"
              control={control}
              render={({ field }) => (
                <Select {...field} placeholder="Select your caste">
                  {castes.map(caste => (
                    <Option key={caste.caste_id} value={caste.caste_id.toString()}>
                      {caste.name}
                    </Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item
            label="Sub Caste"
            validateStatus={errors.subCaste ? "error" : ""}
            help={errors.subCaste?.message}
          >
            <Controller
              name="subCaste"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter your sub caste" />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Parent Religion"
            validateStatus={errors.parentReligion_id ? "error" : ""}
            help={errors.parentReligion_id?.message}
          >
            <Controller
              name="parentReligion_id"
              control={control}
              render={({ field }) => (
                <Select {...field} placeholder="Select parent religion">
                  {religions.map(religion => (
                    <Option key={religion.religion_id} value={religion.religion_id.toString()}>
                      {religion.name}
                    </Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item
            label="Parent/Guardian Type"
            validateStatus={errors.parentGuardianType ? "error" : ""}
            help={errors.parentGuardianType?.message}
          >
            <Controller
              name="parentGuardianType"
              control={control}
              render={({ field }) => (
                <Select {...field} placeholder="Select parent/guardian type">
                  {parentGuardianTypes.map(type => (
                    <Option key={type.id} value={type.type}>
                      {type.type}
                    </Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item
            label="Parent/Guardian Name"
            validateStatus={errors.parentGuardianName ? "error" : ""}
            help={errors.parentGuardianName?.message}
          >
            <Controller
              name="parentGuardianName"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter parent/guardian name" />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Marital Status"
            validateStatus={errors.maritalStatus ? "error" : ""}
            help={errors.maritalStatus?.message}
          >
            <Controller
              name="maritalStatus"
              control={control}
              render={({ field }) => (
                <Radio.Group {...field}>
                  <Radio value="SINGLE">Single</Radio>
                  <Radio value="MARRIED">Married</Radio>
                  <Radio value="DIVORCED">Divorced</Radio>
                  <Radio value="WIDOWED">Widowed</Radio>
                </Radio.Group>
              )}
            />
          </Form.Item>

          <Form.Item
            label="Phone Number"
            validateStatus={errors.phoneNumber ? "error" : ""}
            help={errors.phoneNumber?.message}
          >
            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter your 10-digit phone number" maxLength={10} />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Email"
            validateStatus={errors.email ? "error" : ""}
            help={errors.email?.message}
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter your Gmail address" />
              )}
            />
          </Form.Item>
        </>
      )}
    </Space>
  );
};

export default PersonalInfoForm;
