import React, { useState, useEffect, useContext } from 'react';
import { Form, Input, Select, DatePicker, Button, message, Upload, Row, Col, Card, Typography, Divider, Spin } from 'antd';
import { UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';
import { UserContext } from '../../../components/userContext';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { Title, Text } = Typography;

// This would typically come from an API call to the backend
const states = ['Andhra Pradesh', 'Telangana', 'Karnataka'];

export default function ApplicationForm() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [pincodes, setPincodes] = useState([]);
    const [fetchingPincode, setFetchingPincode] = useState(false);
    const [addressData, setAddressData] = useState([]);
    const [proofOfResidence, setProofOfResidence] = useState('');
    const [proofOfDOB, setProofOfDOB] = useState('');
    const [proofOfCaste, setProofOfCaste] = useState('');
    const [districts, setDistricts] = useState([]);
    const [selectedPincode, setSelectedPincode] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedMandal, setSelectedMandal] = useState('');
    const [sachivalayamOptions, setSachivalayamOptions] = useState([]);
    const [aadhaarId, setAadhaarId] = useState('');
    const [mandals, setMandals] = useState([]);
    const [cities, setCities] = useState([]);
    const { token, logout } = useContext(UserContext);
    const [aadhaarVerified, setIsAadharVerified] = useState(false);
    const [aadharVerificationForm] = Form.useForm();
    const [verificationLoading, setVerificationLoading] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        if (!token) {
            navigate('/login')
        }
    }, []);

    const validateAadhaar = (value) => {
        if (!value) {
          return Promise.reject('Please enter your Aadhaar number');
        }
        // if (!/^\d+$/.test(value)) {
        //   return Promise.reject('Aadhaar number must contain only digits');
        // }
        // if (value.length !== 12) {
        //   return Promise.reject('Aadhaar number must be exactly 12 digits');
        // }
        return Promise.resolve();
      };

    const handleAadharVerification = async () => {
        try {
            await aadharVerificationForm.validateFields();
            setVerificationLoading(true);

            const aadharNumber = aadharVerificationForm.getFieldValue('aadharNumber');

            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND_URL}/api/check_aadhaar/${aadharNumber}`,

                );

                if (response.status === 200) {
                    if(response.data.numOfApplications !== 0) {
                        message.error('Application with this Aadhar number already exists.');
                        return;
                    }
                    message.success('Aadhar verified successfully');
                    setIsAadharVerified(true);
                    setAadhaarId(aadharNumber); 
                    // Optionally, pre-fill some fields from the verification response
                    const userData = response.data;
                    aadharVerificationForm.setFieldsValue({
                        aadharId: aadharNumber,
                        firstName: userData.firstName || '',
                        lastName: userData.lastName || '',
                        dateOfBirth: userData.dateOfBirth || null,
                        // Add more pre-filling as needed
                    });
                }
            } catch (error) {
                message.error(error.response?.data?.message || 'Aadhar verification failed');
                setIsAadharVerified(false);
            } finally {
                setVerificationLoading(false);
            }
        } catch (error) {
            message.error('Please enter a valid Aadhar number');
        }
    }

    const handlePincodeChange = (pincode) => {
        // Find all location data for the selected pincode
        const locationDataForPincode = addressData.filter((item) => item.pincode === pincode);

        if (locationDataForPincode.length > 0) {
            // Get the first item to set initial values
            const firstLocation = locationDataForPincode[0];

            // Update the form fields based on the location data
            form.setFieldsValue({
                state: firstLocation.state || '',
                district: firstLocation.district || '',
                mandal: firstLocation.mandal || '',
                sachivalayam: '', // Reset sachivalayam when pincode changes
            });

            // Update state variables
            setSelectedState(firstLocation.state || '');
            setSelectedDistrict(firstLocation.district || '');
            setSelectedMandal(firstLocation.mandal || '');

            // Set sachivalayam options based on the filtered location data
            const sachivalayamOptions = [...new Set(locationDataForPincode.map(item => item.sachivalayam))];
            setSachivalayamOptions(sachivalayamOptions);
        } else {
            // Reset form fields and state if no matching pincode is found
            form.setFieldsValue({
                state: '',
                district: '',
                mandal: '',
                sachivalayam: '',
            });
            setSelectedState('');
            setSelectedDistrict('');
            setSelectedMandal('');
            setSachivalayamOptions([]);
        }

        // Update the selected pincode
        setSelectedPincode(pincode);
    };


    useEffect(() => {
        fetchLocationData();
    }, []);

    const fetchLocationData = async (pincode) => {

        setFetchingPincode(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/getAllLocationDetails`);
            if (response.status === 400) {
                message.error("There are no VRO present here");
                return;
            }
            const addressData = response.data; // Store the fetched address data
            setAddressData(addressData); // Set address data for later use
            console.log('Address Data:', addressData);
            const uniquePincodes = [...new Set(addressData.map(item => item.pincode))];
            setPincodes(uniquePincodes);
        } catch (error) {
            console.error('Error fetching address data:', error);
            message.error('Unable to fetch the data');
        } finally {
            setFetchingPincode(false);
        }
    };

    const onFinish = async (values) => {
        setLoading(true);
        console.log(values);

        // Prepare the data for the backend
        const formData = new FormData();
        formData.append("full_name", `${values.firstName} ${values.lastName}`);
        formData.append("email", values.email);
        formData.append("dob", values.dateOfBirth.format('YYYY-MM-DD'));
        formData.append("phone_num", values.phoneNumber);
        formData.append("aadhar_num", values.aadharId);
        formData.append("caste", values.caste);
        formData.append("sub_caste", values.sub_caste);
        formData.append("gender", values.gender);
        formData.append("parent_guardian_type", values.parent_guardian_type);
        formData.append("parent_guardian_name", values.parent_guardian_name);
        formData.append("marital_status", values.marital_status);
        formData.append("religion", values.religion);
        formData.append("parent_religion", values.parent_religion);
        formData.append("addressDetails[sachivalayam]", values.sachivalayam);
        formData.append("addressDetails[village]", values.address);
        formData.append("addressDetails[mandal]", values.mandal);
        formData.append("addressDetails[pincode]", values.pincode);
        formData.append("addressDetails[address]", values.address);
        formData.append("addressDetails[state]", values.state);
        formData.append("addressDetails[district]", values.district);

        // Adding proof types
        formData.append("addressProofType", values.proofOfResidence);
        formData.append("dobProofType", values.proofOfDOB);
        formData.append("casteProofType", values.proofOfCaste);

        console.log(values.aadharCardImage, " is the electricity bill image");
        // Handle file uploads for each proof
        if (values.aadharCardImage && values.aadharCardImage.length > 0) {
            formData.append("addressProof", values.aadharCardImage[0].originFileObj);
        }
        if (values.electricityBillImage && values.electricityBillImage.length > 0) {
            formData.append("addressProof", values.electricityBillImage[0].originFileObj);
        }
        if (values.gasBillImage && values.gasBillImage.length > 0) {
            formData.append("addressProof", values.gasBillImage[0].originFileObj);
        }
        if (values.fatherCasteCertificateImage && values.fatherCasteCertificateImage.length > 0) {
            formData.append("casteProof", values.fatherCasteCertificateImage[0].originFileObj);
        }
        if (values.motherCasteCertificateImage && values.motherCasteCertificateImage.length > 0) {
            formData.append("casteProof", values.motherCasteCertificateImage[0].originFileObj);
        }

        if (values.sscCertificateImage && values.sscCertificateImage.length > 0) {
            formData.append("dobProof", values.sscCertificateImage[0].originFileObj);
        }
        if (values.pancardImage && values.pancardImage.length > 0) {
            formData.append("dobProof", values.pancardImage[0].originFileObj);
        }
        if (values.aadharCardImage && values.aadharCardImage.length > 0) {
            formData.append("dobProof", values.aadharCardImage[0].originFileObj);
        }

        console.log(Array.from(formData.entries()), " is the form data");

        // // Now, send the data to the backend
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/application`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`
                },
            });

            if (response.status === 201) {
                message.success('Application submitted successfully');
                form.resetFields();
            }
        } catch (error) {
            console.log(error)
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

    return aadhaarVerified ? (
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
                        <Form.Item
                            name="dateOfBirth"
                            label="Date of Birth"
                            rules={[{ required: true, message: 'Please select your date of birth!' }]}
                        >
                            <DatePicker style={{ width: '100%' }} placeholder="Select your date of birth" />
                        </Form.Item>

                        <Form.Item name="phoneNumber" label="Phone Number" rules={[{ required: true, message: 'Please input your phone number!' }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="aadharId"
                            label="Aadhar ID"
                            initialValue={aadhaarId}
                            rules={[
                                { required: true, message: 'Please input your Aadhar ID!' },
                                { pattern: /^\d{12}$/, message: 'Aadhar ID must be exactly 12 digits!' }
                            ]}
                        >
                            <Input disabled />
                        </Form.Item>
                        <Form.Item name="caste" label="Caste" rules={[{ required: true, message: 'Please select your caste!' }]}>
                            <Select>
                                {['EWS', 'OBC', 'SC', 'ST'].map(caste => (
                                    <Option key={caste} value={caste}>{caste}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="sub_caste"
                            label="Sub Caste"
                            rules={[{ required: true, message: 'Sub caste is required!' }]}
                        >
                            <Input placeholder="Enter your sub caste" />
                        </Form.Item>

                        <Form.Item
                            name="gender"
                            label="Gender"
                            rules={[{ required: true, message: 'Gender is required!' }]}
                        >
                            <Select placeholder="Select your gender">
                                <Option value="MALE">Male</Option>
                                <Option value="FEMALE">Female</Option>
                                <Option value="OTHER">Other</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="parent_guardian_type"
                            label="Parent/Guardian Type"
                            rules={[{ required: true, message: 'Guardian type is required!' }]}
                        >
                            <Select placeholder="Select guardian type">
                                <Option value="FATHER">Father</Option>
                                <Option value="MOTHER">Mother</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="parent_guardian_name"
                            label="Parent/Guardian Name"
                            rules={[{ required: true, message: 'Guardian name is required!' }]}
                        >
                            <Input placeholder="Enter guardian name" />
                        </Form.Item>

                        <Form.Item
                            name="marital_status"
                            label="Marital Status"
                        >
                            <Select placeholder="Select marital status">
                                <Option value="SINGLE">Single</Option>
                                <Option value="MARRIED">Married</Option>
                                <Option value="DIVORCED">Divorced</Option>
                                <Option value="WIDOWED">Widowed</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="religion"
                            label="Religion"
                            rules={[{ required: true, message: 'Religion is required!' }]}
                        >
                            <Select placeholder="Select your religion">
                                <Option value="HINDU">Hindu</Option>
                                <Option value="MUSLIM">Muslim</Option>
                                <Option value="CHRISTIAN">Christian</Option>
                                <Option value="SIKH">Sikh</Option>
                                <Option value="BUDDHIST">Buddhist</Option>
                                <Option value="JAIN">Jain</Option>
                                <Option value="OTHER">Other</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="parent_religion"
                            label="Parent Religion"
                            rules={[{ required: true, message: 'Parent religion is required!' }]}
                        >
                            <Select placeholder="Select parent's religion">
                                <Option value="HINDU">Hindu</Option>
                                <Option value="MUSLIM">Muslim</Option>
                                <Option value="CHRISTIAN">Christian</Option>
                                <Option value="SIKH">Sikh</Option>
                                <Option value="BUDDHIST">Buddhist</Option>
                                <Option value="JAIN">Jain</Option>
                                <Option value="OTHER">Other</Option>
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
                            rules={[{ required: true, message: 'Please select your pincode!' }]}
                        >
                            <Select
                                placeholder="Select your pincode"
                                onChange={handlePincodeChange} // Link the function here
                            >
                                {pincodes.map((pincode) => (
                                    <Option key={pincode} value={pincode}>{pincode}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="sachivalayam"
                            label="Sachivalayam"
                            rules={[{ required: true, message: 'Please select your sachivalayam!' }]}
                        >
                            <Select
                                placeholder="Select sachivalayam"
                                showSearch
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {sachivalayamOptions.map(sachivalayam => (
                                    <Option key={sachivalayam} value={sachivalayam}>{sachivalayam}</Option>
                                ))}
                            </Select>
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
                                <Option value="AADHAAR">Aadhar Card</Option>
                                <Option value="ELECTRICITY">Electricity Bill</Option>
                                <Option value="GAS">Gas Bill</Option>
                            </Select>
                        </Form.Item>
                        {proofOfResidence === 'AADHAAR' && (
                            <>
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
                        {proofOfResidence === 'ELECTRICITY' && (
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
                        {proofOfResidence === 'GAS' && (
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
                                <Option value="AADHAAR">Aadhar Card</Option>
                                <Option value="PAN">PAN Card</Option>
                                <Option value="SSC">SSC Certificate</Option>
                            </Select>
                        </Form.Item>
                        {proofOfDOB === 'AADHAAR' && (
                            <>

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
                        {proofOfDOB === 'PAN' && (
                            <>
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
                        {proofOfDOB === 'SSC' && (
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
                                <Option value="FATHER">Father's Caste Certificate</Option>
                                <Option value="MOTHER">Mother's Caste Certificate</Option>
                            </Select>
                        </Form.Item>
                        {proofOfCaste === 'FATHER' && (
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
                        {proofOfCaste === 'MOTHER' && (
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
                        {loading ? 'Submitting...' : 'Submit Application'}
                    </Button>

                </Form.Item>
            </Form>
        </Card >
    ) : (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Aadhaar Verification</h2>
                <Form
                    form={aadharVerificationForm}
                    layout="vertical"
                    onFinish={handleAadharVerification}
                >
                    <Form.Item
                        label="Aadhaar Number"
                        name="aadharNumber"
                        rules={[
                            { validator: validateAadhaar }
                        ]}
                    >
                        <Input
                            placeholder="Enter your 12-digit Aadhaar number"
                            maxLength={12}
                            onKeyPress={(event) => {
                                if (!/[0-9]/.test(event.key)) {
                                    event.preventDefault();
                                }
                            }}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={verificationLoading}
                            className="w-full"
                        >
                            {verificationLoading ? 'Verifying...' : 'Verify Aadhaar'}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    )
};

