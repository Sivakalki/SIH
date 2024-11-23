import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import axios from 'axios';
import moment from 'moment';
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Radio,
  Upload,
  Card,
  message,
  ConfigProvider
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css'; // Import Ant Design styles

const { Option } = Select;

const MAX_FILE_SIZE = 1024 * 1024 * 5; // 5MB

const schema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  dob: z.date({ required_error: "Date of birth is required" }),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], { required_error: "Gender is required" }),
  religion: z.string().min(1, "Religion is required"),
  caste_id: z.number().int().positive("Caste is required"),
  sub_caste: z.string().min(1, "Sub caste is required"),
  parent_religion: z.string().min(1, "Parent religion is required"),
  parent_guardian_id: z.number().int().positive("Parent/Guardian type is required"),
  parent_guardian_name: z.string().min(1, "Parent/Guardian name is required"),
  marital_status: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"], { required_error: "Marital status is required" }),
  aadhar_num: z.string().length(12, "Aadhar number must be 12 digits"),
  phone_num: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Invalid email address"),
  pincode: z.string().min(1, "Pincode is required"),
  state: z.string().min(1, "State is required"),
  district: z.string().min(1, "District is required"),
  mandal: z.string().min(1, "Mandal is required"),
  sachivalayam: z.string().min(1, "Sachivalayam is required"),
  address: z.string().min(1, "Address is required"),
  addressProofType: z.enum(["AADHAR", "ELECTRICITY_BILL", "GAS_BILL"], { required_error: "Address proof type is required" }),
  addressProof: z.any().refine((file) => file && file[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`).optional(),
  dobProofType: z.enum(["AADHAR", "PAN", "SSC"], { required_error: "DOB proof type is required" }),
  dobProof: z.any().refine((file) => file && file[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`).optional(),
  casteProofType: z.enum(["FATHER", "MOTHER"], { required_error: "Caste proof type is required" }),
  casteProof: z.any().refine((file) => file && file[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`).optional(),
});

function ApplicationForm() {
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const [addressData, setAddressData] = useState([]);
  const [pincodes, setPincodes] = useState([]);
  const [selectedPincode, setSelectedPincode] = useState(null);
  const [sachivalayamOptions, setSachivalayamOptions] = useState([])

  useEffect(() => {
    const fetchAddressData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/getAllLocationDetails`);
        if (response.data == 400) {
          message.error("There are no VRO present here")
        }
        console.log(response.data)
        setAddressData(response.data);
        const uniquePincodes = [...new Set(response.data.map(item => item.pincode))];
        setPincodes(uniquePincodes);
      } catch (error) {
        console.error('Error fetching address data:', error);
        message.error('Uable to fetch the data');
      }
    };

    fetchAddressData();
  }, []);

  const handlePincodeChange = (value) => {
    setSelectedPincode(value);
    const selectedAddresses = addressData.filter(item => item.pincode === value);
  
    if (selectedAddresses.length > 0) {
      const sachivalayams = selectedAddresses.map(item => item.sachivalayam);
      setValue('sachivalayam', ''); // Reset the sachivalayam value
      setValue('state', selectedAddresses[0].state); // Assuming all have the same state
      setValue('district', selectedAddresses[0].district);
      setValue('mandal', selectedAddresses[0].mandal);
      setSachivalayamOptions(sachivalayams); // Populate the dropdown with sachivalayams
    } else {
      setSachivalayamOptions([]); // Clear dropdown if no sachivalayams are found
    }
  };

  const [castes] = useState([
    { caste_id: 1, name: 'OC' },
    { caste_id: 2, name: 'OBC' },
    { caste_id: 3, name: 'ST' },
    { caste_id: 4, name: 'SC' },
  ]);

  const [religions] = useState([
    { religion_id: 1, name: 'HINDU' },
    { religion_id: 2, name: 'CHRISTIAN' },
    { religion_id: 3, name: 'MUSLIM' },
    { religion_id: 4, name: 'NOA' },
  ]);

  const [parentGuardianTypes] = useState([
    { id: 1, type: 'FATHER' },
    { id: 2, type: 'MOTHER' },
    { id: 3, type: 'SIBILING' },
  ]);

  const addressProofType = watch('addressProofType');
  const dobProofType = watch('dobProofType');
  const casteProofType = watch('casteProofType');

  const onSubmit = async (data) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (value instanceof Date) {
        formData.append(key, value.toISOString());
      } else if (Array.isArray(value) && value[0] instanceof File) {
        formData.append(key, value[0]);
      } else {
        formData.append(key, String(value));
      }
    });

    console.log(formData, " is the form data")
    try {
      const response = await axios.post('/api/application', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Application submitted successfully:', response.data);
      message.success('Application submitted successfully');
    } catch (error) {
      console.error('Error submitting application:', error);
      message.error('Error submitting application');
    }
  };

  return (
    <ConfigProvider>
      <Card title="Application Form" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item label="Full Name" validateStatus={errors.full_name ? 'error' : ''} help={errors.full_name?.message}>
            <Controller
              name="full_name"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>

          <Form.Item label="Date of Birth" validateStatus={errors.dob ? 'error' : ''} help={errors.dob?.message}>
                <Controller
                  name="dob"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      format="YYYY-MM-DD"
                      disabledDate={(current) => current && current > new Date()}
                      onChange={(date) => field.onChange(date ? date.toDate() : null)} // Convert moment to Date
                      value={field.value ? moment(field.value) : null} // Ensure value is a moment object
                    />
                  )}
                />
            </Form.Item>

          <Form.Item label="Gender" validateStatus={errors.gender ? 'error' : ''} help={errors.gender?.message}>
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

          <Form.Item label="Religion" validateStatus={errors.religion ? 'error' : ''} help={errors.religion?.message}>
            <Controller
              name="religion"
              control={control}
              render={({ field }) =>
                <Select {...field}>
                  {religions.map((religion) => (
                    <Option key={religion.religion_id} value={religion.name}>
                      {religion.name}
                    </Option>
                  ))}
                </Select>
              }
            />
          </Form.Item>

          <Form.Item label="Caste" validateStatus={errors.caste_id ? 'error' : ''} help={errors.caste_id?.message}>
            <Controller
              name="caste_id"
              control={control}
              render={({ field }) => (
                <Select {...field}>
                  {castes.map((caste) => (
                    <Option key={caste.caste_id} value={caste.caste_id}>
                      {caste.name}
                    </Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item label="Sub Caste" validateStatus={errors.sub_caste ? 'error' : ''} help={errors.sub_caste?.message}>
            <Controller
              name="sub_caste"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>

          <Form.Item label="Parent Religion" validateStatus={errors.parent_religion ? 'error' : ''} help={errors.parent_religion?.message}>
            <Controller
              name="parent_religion"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>

          <Form.Item label="Parent/Guardian Type" validateStatus={errors.parent_guardian_id ? 'error' : ''} help={errors.parent_guardian_id?.message}>
            <Controller
              name="parent_guardian_id"
              control={control}
              render={({ field }) => (
                <Select {...field}>
                  {parentGuardianTypes.map((type) => (
                    <Option key={type.id} value={type.type}>
                      {type.type}
                    </Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item label="Parent/Guardian Name" validateStatus={errors.parent_guardian_name ? 'error' : ''} help={errors.parent_guardian_name?.message}>
            <Controller
              name="parent_guardian_name"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>

          <Form.Item label="Marital Status" validateStatus={errors.marital_status ? 'error' : ''} help={errors.marital_status?.message}>
            <Controller
              name="marital_status"
              control={control}
              render={({ field }) => (
                <Select {...field}>
                  <Option value="SINGLE">Single</Option>
                  <Option value="MARRIED">Married</Option>
                  <Option value="DIVORCED">Divorced</Option>
                  <Option value="WIDOWED">Widowed</Option>
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item label="Aadhar Number" validateStatus={errors.aadhar_num ? 'error' : ''} help={errors.aadhar_num?.message}>
            <Controller
              name="aadhar_num"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>

          <Form.Item label="Phone Number" validateStatus={errors.phone_num ? 'error' : ''} help={errors.phone_num?.message}>
            <Controller
              name="phone_num"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>

          <Form.Item label="Email" validateStatus={errors.email ? 'error' : ''} help={errors.email?.message}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>

          <Form.Item label="Pincode" validateStatus={errors.pincode ? 'error' : ''} help={errors.pincode?.message}>
            <Controller
              name="pincode"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  onChange={(value) => {
                    field.onChange(value);
                    handlePincodeChange(value);
                  }}
                >
                  {pincodes.map((pincode) => (
                    <Option key={pincode} value={pincode}>
                      {pincode}
                    </Option>
                  ))}
                </Select>
              )}
            />
          </Form.Item>

          <Form.Item label="State" validateStatus={errors.state ? 'error' : ''} help={errors.state?.message}>
            <Controller
              name="state"
              control={control}
              render={({ field }) => <Input {...field} readOnly />}
            />
          </Form.Item>

          <Form.Item label="District" validateStatus={errors.district ? 'error' : ''} help={errors.district?.message}>
            <Controller
              name="district"
              control={control}
              render={({ field }) => <Input {...field} readOnly />}
            />
          </Form.Item>

          <Form.Item label="Mandal" validateStatus={errors.mandal ? 'error' : ''} help={errors.mandal?.message}>
            <Controller
              name="mandal"
              control={control}
              render={({ field }) => <Input {...field} readOnly />}
            />
          </Form.Item>

          <Form.Item label="Sachivalayam" validateStatus={errors.sachivalayam ? 'error' : ''} help={errors.sachivalayam?.message}>
            <Controller
              name="sachivalayam"
              control={control}
              render={({ field }) =>
                <Select {...field}>
                  {sachivalayamOptions.map((sachivalayam, index) => (
                    <Option key={index} value={sachivalayam}>
                      {sachivalayam}
                    </Option>
                  ))}
                </Select>
              }
            />
          </Form.Item>

          <Form.Item label="Address" validateStatus={errors.address ? 'error' : ''} help={errors.address?.message}>
            <Controller
              name="address"
              control={control}
              render={({ field }) => <Input.TextArea {...field} />}
            />
          </Form.Item>

          <Form.Item label="Address Proof Type" validateStatus={errors.addressProofType ? 'error' : ''} help={errors.addressProofType?.message}>
            <Controller
              name="addressProofType"
              control={control}
              render={({ field }) => (
                <Select {...field}>
                  <Option value="AADHAR">Aadhar Card</Option>
                  <Option value="ELECTRICITY_BILL">Electricity Bill</Option>
                  <Option value="GAS_BILL">Gas Bill</Option>
                </Select>
              )}
            />
          </Form.Item>

          {addressProofType && (
            <Form.Item label="Address Proof" validateStatus={errors.addressProof ? 'error' : ''} help={errors.addressProof?.message}>
              <Controller
                name="addressProof"
                control={control}
                render={({ field }) => (
                  <Upload {...field} beforeUpload={() => false}>
                    <Button icon={<UploadOutlined />}>Click to Upload</Button>
                  </Upload>
                )}
              />
            </Form.Item>
          )}

          <Form.Item label="Date of Birth Proof Type" validateStatus={errors.dobProofType ? 'error' : ''} help={errors.dobProofType?.message}>
            <Controller
              name="dobProofType"
              control={control}
              render={({ field }) => (
                <Select {...field}>
                  <Option value="AADHAR">Aadhar Card</Option>
                  <Option value="PAN">PAN Card</Option>
                  <Option value="SSC">SSC Certificate</Option>
                </Select>
              )}
            />
          </Form.Item>

          {dobProofType && (
            <Form.Item label="Date of Birth Proof" validateStatus={errors.dobProof ? 'error' : ''} help={errors.dobProof?.message}>
              <Controller
                name="dobProof"
                control={control}
                render={({ field }) => (
                  <Upload {...field} beforeUpload={() => false}>
                    <Button icon={<UploadOutlined />}>Click to Upload</Button>
                  </Upload>
                )}
              />
            </Form.Item>
          )}

          <Form.Item label="Caste Proof Type" validateStatus={errors.casteProofType ? 'error' : ''} help={errors.casteProofType?.message}>
            <Controller
              name="casteProofType"
              control={control}
              render={({ field }) => (
                <Upload
                      {...field}
                      beforeUpload={(file) => {
                        const isLt1MB = file.size / 1024 / 1024 < 1; // Check if file size is less than 1MB
                        if (!isLt1MB) {
                          message.error('File must be smaller than 1MB!');
                        }
                        return isLt1MB || Upload.LIST_IGNORE; // Return false to prevent upload
                      }}
                    >
                      <Button icon={<UploadOutlined />}>Click to Upload</Button>
                    </Upload>
              )}
            />
          </Form.Item>

          {casteProofType && (
            <Form.Item label="Caste Proof" validateStatus={errors.casteProof ? 'error' : ''} help={errors.casteProof?.message}>
              <Controller
                  name="casteProof"
                  control={control}
                  render={({ field }) => (
                    <Upload
                      {...field}
                      beforeUpload={(file) => {
                        const isLt1MB = file.size / 1024 / 1024 < 1; // Check if file size is less than 1MB
                        if (!isLt1MB) {
                          message.error('File must be smaller than 1MB!');
                        }
                        return isLt1MB || Upload.LIST_IGNORE; // Return false to prevent upload
                      }}
                    >
                      <Button icon={<UploadOutlined />}>Click to Upload</Button>
                    </Upload>
                  )}
                />
            </Form.Item>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit Application
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </ConfigProvider>
  );
}

export default ApplicationForm;

