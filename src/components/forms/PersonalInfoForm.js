import React from 'react';
import { Form, Input, DatePicker, Radio, Select, Button } from 'antd';
import { Controller } from 'react-hook-form';
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

const PersonalInfoForm = ({ control, errors, isAadharVerified, onAadharVerify }) => {
  return (
    <>
      <Form.Item
        label="Aadhar Number"
        validateStatus={errors.aadhar_num ? "error" : ""}
        help={errors.aadhar_num?.message}
      >
        <div style={{ display: 'flex', gap: '10px' }}>
          <Controller
            name="aadhar_num"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Enter Aadhar Number"
                maxLength={12}
                disabled={isAadharVerified}
                style={{ width: '100%' }}
              />
            )}
          />
          {!isAadharVerified && (
            <Button 
              type="primary" 
              onClick={() => onAadharVerify(control._formValues.aadhar_num)}
              disabled={!control._formValues.aadhar_num || control._formValues.aadhar_num.length !== 12}
            >
              Verify Aadhaar
            </Button>
          )}
        </div>
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
              render={({ field }) => (
                <Input {...field} placeholder="Enter Full Name" />
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
              render={({ field }) => (
                <DatePicker
                  {...field}
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                  placeholder="Select Date of Birth"
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
            validateStatus={errors.religion ? "error" : ""}
            help={errors.religion?.message}
          >
            <Controller
              name="religion"
              control={control}
              render={({ field }) => (
                <Select {...field} placeholder="Select Religion">
                  {religions.map(religion => (
                    <Option key={religion.religion_id} value={religion.name}>
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
                <Select {...field} placeholder="Select Caste">
                  {castes.map(caste => (
                    <Option key={caste.caste_id} value={caste.name}>
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
                <Input {...field} placeholder="Enter Sub Caste" />
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
                <Select {...field} placeholder="Select Parent Religion">
                  {religions.map(religion => (
                    <Option key={religion.religion_id} value={religion.name}>
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
              render={({ field }) => (
                <Select {...field} placeholder="Select Parent/Guardian Type">
                  {parentGuardianTypes.map(guardianType => (
                    <Option key={guardianType.id} value={guardianType.type}>
                      {guardianType.type}
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
              render={({ field }) => (
                <Input {...field} placeholder="Enter Parent/Guardian Name" />
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
              render={({ field }) => (
                <Select {...field} placeholder="Select Marital Status">
                  <Option value="SINGLE">Single</Option>
                  <Option value="MARRIED">Married</Option>
                  <Option value="DIVORCED">Divorced</Option>
                  <Option value="WIDOWED">Widowed</Option>
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
              render={({ field }) => (
                <Input {...field} placeholder="Enter Phone Number" maxLength={10} />
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
                <Input {...field} placeholder="Enter Email Address" />
              )}
            />
          </Form.Item>
        </>
      )}
    </>
  );
};

export default PersonalInfoForm;
