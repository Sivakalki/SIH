import React from 'react';
import { Form, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Controller } from 'react-hook-form';

const MAX_FILE_SIZE = 1024 * 1024; // 1MB

const DocumentUploadForm = ({ 
  control, 
  errors,
  setProofOfResidence,
  setProofOfDOB,
  setProofOfCaste
}) => {
  const beforeUpload = (file) => {
    const isLessThan1MB = file.size <= MAX_FILE_SIZE;
    if (!isLessThan1MB) {
      message.error('File must be smaller than 1MB!');
    }
    return isLessThan1MB;
  };

  return (
    <>
      <Form.Item
        label="Proof of Residence"
        validateStatus={errors.proofOfResidence ? "error" : ""}
        help={errors.proofOfResidence?.message}
      >
        <Controller
          name="proofOfResidence"
          control={control}
          render={({ field }) => (
            <Upload
              beforeUpload={beforeUpload}
              onChange={({ file }) => {
                if (file.status === 'done') {
                  setProofOfResidence(file.response?.filename || '');
                  field.onChange(file.response?.filename || '');
                }
              }}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Upload Proof of Residence</Button>
            </Upload>
          )}
        />
      </Form.Item>

      <Form.Item
        label="Proof of Date of Birth"
        validateStatus={errors.proofOfDOB ? "error" : ""}
        help={errors.proofOfDOB?.message}
      >
        <Controller
          name="proofOfDOB"
          control={control}
          render={({ field }) => (
            <Upload
              beforeUpload={beforeUpload}
              onChange={({ file }) => {
                if (file.status === 'done') {
                  setProofOfDOB(file.response?.filename || '');
                  field.onChange(file.response?.filename || '');
                }
              }}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Upload Proof of DOB</Button>
            </Upload>
          )}
        />
      </Form.Item>

      <Form.Item
        label="Proof of Caste"
        validateStatus={errors.proofOfCaste ? "error" : ""}
        help={errors.proofOfCaste?.message}
      >
        <Controller
          name="proofOfCaste"
          control={control}
          render={({ field }) => (
            <Upload
              beforeUpload={beforeUpload}
              onChange={({ file }) => {
                if (file.status === 'done') {
                  setProofOfCaste(file.response?.filename || '');
                  field.onChange(file.response?.filename || '');
                }
              }}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Upload Proof of Caste</Button>
            </Upload>
          )}
        />
      </Form.Item>
    </>
  );
};

export default DocumentUploadForm;
