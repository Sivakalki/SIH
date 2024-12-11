import React from 'react';
import { Form, Upload, Button, message, Radio } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Controller, useWatch } from 'react-hook-form';

const MAX_FILE_SIZE = 1024 * 1024; // 1MB

const DocumentUploadForm = ({
  control,
  errors
}) => {
  const proofOfResidence = useWatch({
    control,
    name: 'proofOfResidence',
    defaultValue: ''
  });

  const proofOfDOB = useWatch({
    control,
    name: 'proofOfDOB',
    defaultValue: ''
  });

  const proofOfCaste = useWatch({
    control,
    name: 'proofOfCaste',
    defaultValue: ''
  });

  const DocumentUpload = ({ fieldName, label, control, errors, beforeUpload }) => (
    <Form.Item
      label={label}
      validateStatus={errors[fieldName] ? "error" : ""}
      help={errors[fieldName]?.message}
    >
      <Controller
        name={fieldName}
        control={control}
        render={({ field: { onChange } }) => (
          <Upload
            beforeUpload={(file) => {
              const isValid = beforeUpload(file);
              return false; // Prevent automatic upload
            }}
            onChange={({ fileList }) =>
              onChange(fileList.map(f => ({
                ...f,
                originFileObj: f.originFileObj || f,
              })))
            }
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Upload {label}</Button>
          </Upload>
        )}
      />
    </Form.Item>
  );

  const beforeUpload = (file) => {
    const isLessThan1MB = file.size <= MAX_FILE_SIZE;
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const isAllowedType = allowedTypes.includes(file.type);

    if (!isLessThan1MB) {
      message.error('File must be smaller than 1MB!');
    }
    if (!isAllowedType) {
      message.error('You can only upload JPG/PNG/PDF files!');
    }
    return isLessThan1MB && isAllowedType;
  };

  return (
    <>
      {/* Proof of Residence Section */}
      <Form.Item
        label="Type of Residence Proof"
        validateStatus={errors.proofOfResidence ? "error" : ""}
        help={errors.proofOfResidence?.message}
      >
        <Controller
          name="proofOfResidence"
          control={control}
          rules={{ required: 'Please select a type of residence proof.' }}
          render={({ field }) => (
            <Radio.Group {...field}>
              <Radio value="aadhaar">Aadhaar Card</Radio>
              <Radio value="electricity">Electricity Bill</Radio>
              <Radio value="gas">Gas Bill</Radio>
            </Radio.Group>
          )}
        />

      </Form.Item>

      {/* Conditional Upload Fields based on Residence Proof Type */}
      {proofOfResidence === 'aadhaar' && (
        <DocumentUpload
          fieldName="aadharCardImage"
          label="Aadhaar Card"
          control={control}
          errors={errors}
          beforeUpload={beforeUpload}
        />
      )}
      {proofOfResidence === 'electricity' && (
        <DocumentUpload
          fieldName="electricityBillImage"
          label="Electricity Bill"
          control={control}
          errors={errors}
          beforeUpload={beforeUpload}
        />
      )}
      {proofOfResidence === 'gas' && (
        <DocumentUpload
          fieldName="gasBillImage"
          label="Gas Bill"
          control={control}
          errors={errors}
          beforeUpload={beforeUpload}
        />
      )}

      {/* Proof of Date of Birth Section */}
      <Form.Item
        label="Type of Date of Birth Proof"
        validateStatus={errors.proofOfDOB ? "error" : ""}
        help={errors.proofOfDOB?.message}
      >
        <Controller
          name="proofOfDOB"
          control={control}
          render={({ field }) => (
            <Radio.Group {...field}>
              <Radio value="aadhar">Aadhaar Card</Radio>
              <Radio value="pan">PAN Card</Radio>
              <Radio value="ssc">SSC Certificate</Radio>
            </Radio.Group>
          )}
        />
      </Form.Item>

      {/* Conditional Upload Fields based on DOB Proof Type */}
      {proofOfDOB === 'aadhar' && (
        <DocumentUpload
          fieldName="aadharCardImageForDOB"
          label="Aadhaar Card for DOB"
          control={control}
          errors={errors}
          beforeUpload={beforeUpload}
        />
      )}
      {proofOfDOB === 'pan' && (
        <DocumentUpload
          fieldName="panCardImage"
          label="PAN Card"
          control={control}
          errors={errors}
          beforeUpload={beforeUpload}
        />
      )}
      {proofOfDOB === 'ssc' && (
        <DocumentUpload
          fieldName="sscCertificateImage"
          label="SSC Certificate"
          control={control}
          errors={errors}
          beforeUpload={beforeUpload}
        />
      )}

      {/* Proof of Caste Section */}
      <Form.Item
        label="Type of Caste Certificate"
        validateStatus={errors.proofOfCaste ? "error" : ""}
        help={errors.proofOfCaste?.message}
      >
        <Controller
          name="proofOfCaste"
          control={control}
          render={({ field }) => (
            <Radio.Group {...field}>
              <Radio value="father">Father's Caste Certificate</Radio>
              <Radio value="mother">Mother's Caste Certificate</Radio>
            </Radio.Group>
          )}
        />
      </Form.Item>
      {/* Conditional Rendering */}
      {proofOfCaste === 'father' && (
        <DocumentUpload
          fieldName="fatherCasteCertificateImage"
          label="Father's Caste Certificate"
          control={control}
          errors={errors}
          beforeUpload={beforeUpload}
        />
      )}
      {proofOfCaste === 'mother' && (
        <DocumentUpload
          fieldName="motherCasteCertificateImage"
          label="Mother's Caste Certificate"
          control={control}
          errors={errors}
          beforeUpload={beforeUpload}
        />
      )}
    </>
  );
};

export default DocumentUploadForm;