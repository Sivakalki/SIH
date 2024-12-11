import React, { useState, useEffect } from 'react';
import { Modal, Typography, Descriptions, Spin, message, Button, Badge, Space, Form, Input, Drawer, Upload, Tag } from 'antd';
import { FileTextOutlined, UploadOutlined, CheckCircleOutlined, CloseCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { set } from 'react-hook-form';

const { Title } = Typography;

const RiApplicationModal = ({ visible, applicationId, onCancel, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [applicationData, setApplicationData] = useState(null);
    const [verificationFormVisible, setVerificationFormVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        console.log(applicationId, visible);
        if (visible && applicationId) {
            fetchApplicationDetails();
        }
    }, [visible, applicationId]);

    const fetchApplicationDetails = async () => {
        console.log(applicationId);
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
            console.log(response.data.data);
            setApplicationData(response.data.data);
        } catch (error) {
            console.error('Error fetching application details:', error);
            message.error('Failed to load application details');
        } finally {
            setLoading(false);
        }
    };

    const handleVerificationSubmit = async (values) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/ri/create_report/${applicationId}`,
                {
                    description: values.remarks
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            message.success('Report submitted successfully!');
            setVerificationFormVisible(false);
            form.resetFields();
            if (onUpdate) onUpdate();
            onCancel(); // Close the main modal
        } catch (error) {
            console.error('Error submitting report:', error);
            message.error('Failed to submit report: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <>
            <Modal
                title={<Title level={3}>Application Details</Title>}
                visible={visible}
                onCancel={onCancel}
                footer={[
                    applicationData?.current_stage?.role_type === 'SVRO' || applicationData?.current_stage?.role_type === 'MVRO' ? (
                        <Button 
                            key="mvro-pending" 
                            type="default"
                            disabled
                            icon={<QuestionCircleOutlined />}
                        >
                            Awaiting MVRO Report
                        </Button>
                    ) : (
                        applicationData?.current_stage?.role_type === 'MRO' ? (
                            <Button key="submitted" type="default" disabled>
                                Report Already Submitted
                            </Button>
                        ) : (
                            <Button 
                                key="verify" 
                                type="primary" 
                                onClick={() => setVerificationFormVisible(true)}
                                disabled={applicationData?.mvro_verification}
                            >
                                Submit Verification
                            </Button>
                        )
                    ),
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
                        <Descriptions title="Application Information" bordered column={2}>
                            <Descriptions.Item label="Application ID">{applicationData.application_id}</Descriptions.Item>
                            <Descriptions.Item label="Current Stage">
                                <Badge 
                                    status={
                                        applicationData.current_stage?.role_type === 'SVRO' ? 'warning' : 
                                        applicationData.current_stage?.role_type === 'COMPLETED' ? 'success' : 'processing'
                                    } 
                                    text={applicationData.current_stage?.role_type || 'N/A'}
                                />
                                {applicationData.current_stage?.role_type === 'MVRO' && (
                                    <Tag color="orange" style={{ marginLeft: '8px' }}>
                                        Waiting for MVRO Report
                                    </Tag>
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <Badge 
                                    status={applicationData.status === 'PENDING' ? 'processing' : 'success'} 
                                    text={applicationData.status}
                                />
                            </Descriptions.Item>
                            <Descriptions.Item label="Submission Date">
                                {new Date(applicationData.created_at).toLocaleDateString()}
                            </Descriptions.Item>
                            <Descriptions.Item label="Last Updated">
                                {new Date(applicationData.updated_at).toLocaleDateString()}
                            </Descriptions.Item>
                        </Descriptions>

                        <Descriptions title="Personal Information" bordered column={2} style={{ marginTop: '20px' }}>
                            <Descriptions.Item label="Full Name">{applicationData.full_name}</Descriptions.Item>
                            <Descriptions.Item label="Date of Birth">
                                {new Date(applicationData.dob).toLocaleDateString()}
                            </Descriptions.Item>
                            <Descriptions.Item label="Gender">{applicationData.gender}</Descriptions.Item>
                            <Descriptions.Item label="Marital Status">{applicationData.marital_status}</Descriptions.Item>
                            <Descriptions.Item label="Religion">{applicationData.religion}</Descriptions.Item>
                            <Descriptions.Item label="Caste">{applicationData.caste?.caste_type}</Descriptions.Item>
                            <Descriptions.Item label="Sub Caste">{applicationData.sub_caste}</Descriptions.Item>
                            <Descriptions.Item label="Aadhar Number">{applicationData.aadhar_num}</Descriptions.Item>
                            <Descriptions.Item label="Phone Number">{applicationData.phone_num}</Descriptions.Item>
                            <Descriptions.Item label="Email">{applicationData.email}</Descriptions.Item>
                        </Descriptions>

                        <Descriptions title="Address Details" bordered column={2} style={{ marginTop: '20px' }}>
                            <Descriptions.Item label="Address">{applicationData.address?.address}</Descriptions.Item>
                            <Descriptions.Item label="Pincode">{applicationData.address?.pincode}</Descriptions.Item>
                            <Descriptions.Item label="State">{applicationData.address?.state}</Descriptions.Item>
                            <Descriptions.Item label="District">{applicationData.address?.district}</Descriptions.Item>
                            <Descriptions.Item label="Mandal">{applicationData.address?.mandal}</Descriptions.Item>
                            <Descriptions.Item label="Sachivalayam">{applicationData.address?.sachivalayam}</Descriptions.Item>
                        </Descriptions>

                        {applicationData.mvro_verification && (
                            <Descriptions title="MVRO Verification" bordered column={2} style={{ marginTop: '20px' }}>
                                <Descriptions.Item label="Status">
                                    <Badge 
                                        status={applicationData.mvro_verification.status === 'APPROVED' ? 'success' : 'error'} 
                                        text={applicationData.mvro_verification.status}
                                    />
                                </Descriptions.Item>
                                <Descriptions.Item label="Verified On">
                                    {new Date(applicationData.mvro_verification.verified_at).toLocaleDateString()}
                                </Descriptions.Item>
                                <Descriptions.Item label="Remarks" span={2}>
                                    {applicationData.mvro_verification.remarks}
                                </Descriptions.Item>
                                {applicationData.mvro_verification.report_url && (
                                    <Descriptions.Item label="Verification Report" span={2}>
                                        <a href={applicationData.mvro_verification.report_url} target="_blank" rel="noopener noreferrer">
                                            View Report
                                        </a>
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        )}
                    </>
                ) : (
                    <div>No application data available</div>
                )}
            </Modal>

            {/* Verification Form Modal */}
            <Modal
                title="Submit Verification"
                visible={verificationFormVisible}
                onCancel={() => setVerificationFormVisible(false)}
                footer={null}
            >
                <Form form={form} onFinish={handleVerificationSubmit}>
                    <Form.Item
                        name="remarks"
                        label="Remarks"
                        rules={[{ required: true, message: 'Please enter remarks' }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Submit Report
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default RiApplicationModal;
