import React, { useState, useEffect } from 'react';
import { Modal, Typography, Descriptions, Spin, message, Button, Badge, Space, Form, Input, Drawer } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

const ApplicationDetailsModal = ({ visible, applicationId, onCancel }) => {
    const [loading, setLoading] = useState(false);
    const [applicationData, setApplicationData] = useState(null);
    const [remarksFormVisible, setRemarksFormVisible] = useState(false);
    const [resendDrawerVisible, setResendDrawerVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible && applicationId) {
            fetchApplicationDetails();
        }
    }, [visible, applicationId]);

    const fetchApplicationDetails = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/api/application/${applicationId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setApplicationData(response.data.data);
        } catch (error) {
            console.error('Error fetching application details:', error);
            message.error('Failed to load application details');
        } finally {
            setLoading(false);
        }
    };

    const openRemarksForm = () => {
        setRemarksFormVisible(true);
    };

    const handleRemarksSubmit = async (values) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/report/${applicationId}`,
                values,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            message.success('Remarks added successfully');
            setRemarksFormVisible(false);
            form.resetFields();
            fetchApplicationDetails();
        } catch (error) {
            console.error('Error adding remarks:', error);
            message.error('Failed to add remarks');
        }
    };

    const handleResendApplication = async (values) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/recheck/${applicationId}`,
                values,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            message.success('Application resent successfully');
            setResendDrawerVisible(false);
            fetchApplicationDetails();
        } catch (error) {
            console.error('Error resending application:', error);
            message.error('Failed to resend application');
        }
    };

    return (
        <>
            <Modal
                title={<Title level={3}>Application Details</Title>}
                visible={visible}
                onCancel={onCancel}
                footer={[
                    <Button 
                        key="remarks" 
                        type="primary" 
                        onClick={openRemarksForm}
                        style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                        disabled={applicationData?.reCheck?.length > 0 && applicationData.reCheck[0].status !== 'COMPLETED'}
                    >
                        Add Remarks
                    </Button>,
                    <Button 
                        key="resend" 
                        type="primary" 
                        onClick={() => setResendDrawerVisible(true)}
                        style={{ backgroundColor: '#faad14', borderColor: '#faad14' }}
                        disabled={applicationData?.reCheck?.length > 0}
                    >
                        Resend Application
                    </Button>,
                    <Button key="close" onClick={onCancel}>
                        Close
                    </Button>
                ]}
                width={800}
            >
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin size="large" />
                    </div>
                ) : applicationData ? (
                    <>
                        <Descriptions title="Personal Information" bordered column={2}>
                            <Descriptions.Item label="Full Name">{applicationData.full_name || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Date of Birth">
                                {applicationData.dob ? new Date(applicationData.dob).toLocaleDateString() : 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Gender">{applicationData.gender || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Marital Status">{applicationData.marital_status || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Religion">{applicationData.religion || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Caste">
                                {applicationData.caste?.caste_type || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Sub Caste">{applicationData.sub_caste || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Parent Religion">{applicationData.parent_religion || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Parent/Guardian Type">
                                {applicationData.parent_guardian_type?.type || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Parent/Guardian Name">{applicationData.parent_guardian_name || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Aadhar Number">{applicationData.aadhar_num || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Phone Number">{applicationData.phone_num || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Email">{applicationData.email || 'N/A'}</Descriptions.Item>
                        </Descriptions>

                        <Descriptions title="Address Details" bordered column={2} style={{ marginTop: '20px' }}>
                            <Descriptions.Item label="Address">{applicationData.address?.address || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Pincode">{applicationData.address?.pincode || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="State">{applicationData.address?.state || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="District">{applicationData.address?.district || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Mandal">{applicationData.address?.mandal || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Sachivalayam">{applicationData.address?.sachivalayam || 'N/A'}</Descriptions.Item>
                        </Descriptions>

                        {applicationData.reCheck && applicationData.reCheck.length > 0 && (
                            <Descriptions title="Recheck Information" bordered column={1} style={{ marginTop: '20px' }}>
                                <Descriptions.Item label="Status">
                                    <Badge 
                                        status={applicationData.reCheck[0].status === 'PENDING' ? 'processing' : 'success'} 
                                        text={applicationData.reCheck[0].status}
                                    />
                                </Descriptions.Item>
                                <Descriptions.Item label="Reason">{applicationData.reCheck[0].description}</Descriptions.Item>
                            </Descriptions>
                        )}
                    </>
                ) : (
                    <div>No application data available</div>
                )}
            </Modal>

            {/* Remarks Form Modal */}
            <Modal
                title="Add Remarks"
                visible={remarksFormVisible}
                onCancel={() => setRemarksFormVisible(false)}
                footer={null}
            >
                <Form form={form} onFinish={handleRemarksSubmit}>
                    <Form.Item
                        name="remarks"
                        rules={[{ required: true, message: 'Please enter remarks' }]}
                    >
                        <Input.TextArea rows={4} placeholder="Enter your remarks" />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                Submit
                            </Button>
                            <Button onClick={() => setRemarksFormVisible(false)}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Resend Application Drawer */}
            <Drawer
                title="Resend Application"
                placement="right"
                onClose={() => setResendDrawerVisible(false)}
                visible={resendDrawerVisible}
                width={400}
            >
                <Form onFinish={handleResendApplication}>
                    <Form.Item
                        name="reason"
                        rules={[{ required: true, message: 'Please enter reason for resending' }]}
                    >
                        <Input.TextArea rows={4} placeholder="Enter reason for resending" />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                Submit
                            </Button>
                            <Button onClick={() => setResendDrawerVisible(false)}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Drawer>
        </>
    );
};

export default ApplicationDetailsModal;
