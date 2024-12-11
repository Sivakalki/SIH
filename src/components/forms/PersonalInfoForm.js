import React from 'react';
import { Form, Input, DatePicker, Radio, Select, Button, Space } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import { Controller } from 'react-hook-form';

const { Option } = Select;

const castes = [
  { id: 'GENERAL', name: 'General' },
  { id: 'OBC', name: 'OBC' },
  { id: 'SC', name: 'SC' },
  { id: 'ST', name: 'ST' },
];

const religions = [
  { id: 'HINDU', name: 'Hindu' },
  { id: 'MUSLIM', name: 'Muslim' },
  { id: 'CHRISTIAN', name: 'Christian' },
  { id: 'SIKH', name: 'Sikh' },
  { id: 'BUDDHIST', name: 'Buddhist' },
  { id: 'JAIN', name: 'Jain' },
  { id: 'OTHER', name: 'Other' },
];

const parentGuardianTypes = [
  { id: 'FATHER', type: 'Father' },
  { id: 'MOTHER', type: 'Mother' },
  { id: 'GUARDIAN', type: 'Guardian' },
];

const maritalStatuses = [
  { id: 'SINGLE', name: 'Single' },
  { id: 'MARRIED', name: 'Married' },
  { id: 'DIVORCED', name: 'Divorced' },
  { id: 'WIDOWED', name: 'Widowed' },
];

const PersonalInfoForm = ({ control, errors, isAadharVerified, onAadharVerify, verifyingAadhar }) => {
  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Form.Item
        label="Aadhar Number"
        validateStatus={errors.aadhar_num ? "error" : ""}
        help={errors.aadhar_num?.message}
      >
        <Controller
          name="aadhar_num"
          control={control}
          render={({ field }) => (
            <Space>
              <Input
                {...field}
                placeholder="Enter 12-digit Aadhar number"
                maxLength={12}
                disabled={isAadharVerified}
                style={{ width: '200px' }}
                type="number"
                onKeyDown={(e) => {
                  if (!/[0-9]/.test(e.key) &&
                      e.key !== 'Backspace' &&
                      e.key !== 'Delete' &&
                      e.key !== 'ArrowLeft' &&
                      e.key !== 'ArrowRight' &&
                      e.key !== 'Tab') {
                    e.preventDefault();
                  }
                }}
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
            validateStatus={errors.full_name ? "error" : ""}
            help={errors.full_name?.message}
          >
            <Controller
              name="full_name"
              control={control}
              rules={{ required: 'Full name is required' }}
              render={({ field }) => (
                <Input {...field} placeholder="Enter your full name" />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Date of Birth"
            validateStatus={errors.dob ? "error" : ""}
            help={errors.dob?.message}
          >
            <Controller
              name="dob"
              control={control}
              rules={{ required: 'Date of Birth is required' }}
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
              rules={{ required: 'Gender is required' }}
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
            validateStatus={errors.religion ? "error" : ""}
            help={errors.religion?.message}
          >
            <Controller
              name="religion"
              control={control}
              rules={{ required: 'Religion is required' }}
              render={({ field }) => (
                <Select
                  {...field}
                  showSearch
                  placeholder="Select your religion"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {religions.map(religion => (
                    <Option key={religion.id} value={religion.id}>
                      {religion.name}
                    </Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item
            label="Caste"
            validateStatus={errors.caste ? "error" : ""}
            help={errors.caste?.message}
          >
            <Controller
              name="caste"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  showSearch
                  placeholder="Select your caste"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {castes.map(caste => (
                    <Option key={caste.id} value={caste.id}>
                      {caste.name}
                    </Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item
            label="Sub Caste"
            validateStatus={errors.sub_caste ? "error" : ""}
            help={errors.sub_caste?.message}
          >
            <Controller
              name="sub_caste"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter your sub caste" />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Parent Religion"
            validateStatus={errors.parent_religion ? "error" : ""}
            help={errors.parent_religion?.message}
          >
            <Controller
              name="parent_religion"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  showSearch
                  placeholder="Select parent religion"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {religions.map(religion => (
                    <Option key={religion.id} value={religion.id}>
                      {religion.name}
                    </Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item
            label="Parent/Guardian Type"
            validateStatus={errors.parent_guardian_type ? "error" : ""}
            help={errors.parent_guardian_type?.message}
          >
            <Controller
              name="parent_guardian_type"
              control={control}
              rules={{ required: 'Guardian type is required' }}
              render={({ field }) => (
                <Select
                  {...field}
                  showSearch
                  placeholder="Select guardian type"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {parentGuardianTypes.map(type => (
                    <Option key={type.id} value={type.id}>
                      {type.type}
                    </Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item
            label="Parent/Guardian Name"
            validateStatus={errors.parent_guardian_name ? "error" : ""}
            help={errors.parent_guardian_name?.message}
          >
            <Controller
              name="parent_guardian_name"
              control={control}
              rules={{ required: 'Guardian name is required' }}
              render={({ field }) => (
                <Input {...field} placeholder="Enter guardian name" />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Marital Status"
            validateStatus={errors.marital_status ? "error" : ""}
            help={errors.marital_status?.message}
          >
            <Controller
              name="marital_status"
              control={control}
              rules={{ required: 'Marital status is required' }}
              render={({ field }) => (
                <Select
                  {...field}
                  showSearch
                  placeholder="Select marital status"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {maritalStatuses.map(status => (
                    <Option key={status.id} value={status.id}>
                      {status.name}
                    </Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item
            label="Phone Number"
            validateStatus={errors.phone_num ? "error" : ""}
            help={errors.phone_num?.message}
          >
            <Controller
              name="phone_num"
              control={control}
              rules={{ required: 'Phone number is required' }}
              render={({ field: { onChange, value, ...field } }) => (
                <Input 
                  {...field}
                  value={value || ''}
                  placeholder="Enter 10-digit phone number"
                  maxLength={10}
                  onChange={(e) => {
                    // Remove any non-digit characters
                    const numericValue = e.target.value.replace(/\D/g, '');
                    
                    // Limit to 10 digits
                    const limitedValue = numericValue.slice(0, 10);
                    
                    // Update the field value
                    onChange(limitedValue);
                  }}
                  onKeyDown={(e) => {
                    // Allow only numbers, backspace, delete, arrow keys, and tab
                    if (
                      !/[0-9]/.test(e.key) &&
                      e.key !== 'Backspace' &&
                      e.key !== 'Delete' &&
                      e.key !== 'ArrowLeft' &&
                      e.key !== 'ArrowRight' &&
                      e.key !== 'Tab'
                    ) {
                      e.preventDefault();
                    }
                  }}
                />
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
              rules={{ required: 'Email is required' }}
              render={({ field }) => (
                <Input {...field} placeholder="Enter your email address" />
              )}
            />
          </Form.Item>
        </>
      )}
    </Space>
  );
};

export default PersonalInfoForm;
