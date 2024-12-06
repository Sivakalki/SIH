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
        <Form.Item
          label="Upload Aadhaar Card"
          validateStatus={errors.aadharCardImage ? "error" : ""}
          help={errors.aadharCardImage?.message}
        >
          <Controller
            name="aadharCardImage"
            control={control}
            render={({ field: { onChange } }) => (
              <Upload
                beforeUpload={(file) => {
                  const isValid = beforeUpload(file);
                  return false; // Prevent automatic upload
                }}
                onChange={({ file, fileList }) => {
                  onChange(fileList.map(f => ({
                    ...f,
                    originFileObj: f.originFileObj || file
                  })));
                }}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Upload Aadhaar Card</Button>
              </Upload>
            )}
          />
        </Form.Item>
      )}

      {proofOfResidence === 'electricity' && (
        <Form.Item
          label="Upload Electricity Bill"
          validateStatus={errors.electricityBillImage ? "error" : ""}
          help={errors.electricityBillImage?.message}
        >
          <Controller
            name="electricityBillImage"
            control={control}
            render={({ field: { onChange } }) => (
              <Upload
                beforeUpload={(file) => {
                  const isValid = beforeUpload(file);
                  return false; // Prevent automatic upload
                }}
                onChange={({ file, fileList }) => {
                  onChange(fileList.map(f => ({
                    ...f,
                    originFileObj: f.originFileObj || file
                  })));
                }}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Upload Electricity Bill</Button>
              </Upload>
            )}
          />
        </Form.Item>
      )}

      {proofOfResidence === 'gas' && (
        <Form.Item
          label="Upload Gas Bill"
          validateStatus={errors.gasBillImage ? "error" : ""}
          help={errors.gasBillImage?.message}
        >
          <Controller
            name="gasBillImage"
            control={control}
            render={({ field: { onChange } }) => (
              <Upload
                beforeUpload={(file) => {
                  const isValid = beforeUpload(file);
                  return false; // Prevent automatic upload
                }}
                onChange={({ file, fileList }) => {
                  onChange(fileList.map(f => ({
                    ...f,
                    originFileObj: f.originFileObj || file
                  })));
                }}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Upload Gas Bill</Button>
              </Upload>
            )}
          />
        </Form.Item>
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
        <Form.Item
          label="Upload Aadhaar Card for DOB"
          validateStatus={errors.aadharCardImageForDOB ? "error" : ""}
          help={errors.aadharCardImageForDOB?.message}
        >
          <Controller
            name="aadharCardImageForDOB"
            control={control}
            render={({ field: { onChange } }) => (
              <Upload
                beforeUpload={(file) => {
                  const isValid = beforeUpload(file);
                  return false; // Prevent automatic upload
                }}
                onChange={({ file, fileList }) => {
                  onChange(fileList.map(f => ({
                    ...f,
                    originFileObj: f.originFileObj || file
                  })));
                }}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Upload Aadhaar Card</Button>
              </Upload>
            )}
          />
        </Form.Item>
      )}

      {proofOfDOB === 'pan' && (
        <Form.Item
          label="Upload PAN Card"
          validateStatus={errors.panCardImage ? "error" : ""}
          help={errors.panCardImage?.message}
        >
          <Controller
            name="panCardImage"
            control={control}
            render={({ field: { onChange } }) => (
              <Upload
                beforeUpload={(file) => {
                  const isValid = beforeUpload(file);
                  return false; // Prevent automatic upload
                }}
                onChange={({ file, fileList }) => {
                  onChange(fileList.map(f => ({
                    ...f,
                    originFileObj: f.originFileObj || file
                  })));
                }}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Upload PAN Card</Button>
              </Upload>
            )}
          />
        </Form.Item>
      )}

      {proofOfDOB === 'ssc' && (
        <Form.Item
          label="Upload SSC Certificate"
          validateStatus={errors.sscCertificateImage ? "error" : ""}
          help={errors.sscCertificateImage?.message}
        >
          <Controller
            name="sscCertificateImage"
            control={control}
            render={({ field: { onChange } }) => (
              <Upload
                beforeUpload={(file) => {
                  const isValid = beforeUpload(file);
                  return false; // Prevent automatic upload
                }}
                onChange={({ file, fileList }) => {
                  onChange(fileList.map(f => ({
                    ...f,
                    originFileObj: f.originFileObj || file
                  })));
                }}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Upload SSC Certificate</Button>
              </Upload>
            )}
          />
        </Form.Item>
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
      {proofOfCaste === 'father' && (
        <Form.Item
          label="Upload Father's Caste Certificate"
          validateStatus={errors.fatherCasteCertificateImage ? "error" : ""}
          help={errors.fatherCasteCertificateImage?.message}
        >
          <Controller
            name="fatherCasteCertificateImage"
            control={control}
            render={({ field: { onChange } }) => (
              <Upload
                beforeUpload={(file) => {
                  const isValid = beforeUpload(file);
                  return false; // Prevent automatic upload
                }}
                onChange={({ file, fileList }) => {
                  onChange(fileList.map(f => ({
                    ...f,
                    originFileObj: f.originFileObj || file
                  })));
                }}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Upload Father's Caste Certificate</Button>
              </Upload>
            )}
          />
        </Form.Item>
      )}

      {proofOfCaste === 'mother' && (
        <Form.Item
          label="Upload Mother's Caste Certificate"
          validateStatus={errors.motherCasteCertificateImage ? "error" : ""}
          help={errors.motherCasteCertificateImage?.message}
        >
          <Controller
            name="motherCasteCertificateImage"
            control={control}
            render={({ field: { onChange } }) => (
              <Upload
                beforeUpload={(file) => {
                  const isValid = beforeUpload(file);
                  return false; // Prevent automatic upload
                }}
                onChange={({ file, fileList }) => {
                  onChange(fileList.map(f => ({
                    ...f,
                    originFileObj: f.originFileObj || file
                  })));
                }}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Upload Mother's Caste Certificate</Button>
              </Upload>
            )}
          />
        </Form.Item>
      )}
    </>
  );
};

export default DocumentUploadForm;
