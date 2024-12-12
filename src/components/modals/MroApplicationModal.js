import React, { useState, useEffect } from 'react';
import { Modal, Typography, Descriptions, Spin, message, Button, Badge, Tag, Input } from 'antd';
import { 
  QuestionCircleOutlined, 
  MailOutlined, 
  DownloadOutlined,
  FileTextOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import jsPDF from 'jspdf';

// Import images
import govLogo from '../../assets/images/gov_logo.png';
import sealImage from '../../assets/images/seal.png';

const { Title, Text } = Typography;
const { TextArea } = Input;

const generateCertificatePDF = (applicationData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Set page margins
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const marginLeft = 20;
  const marginRight = 20;
  const contentWidth = pageWidth - marginLeft - marginRight;

  // Background and Border
  doc.setDrawColor(0);
  doc.setLineWidth(1);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // Add Government Logo (Fallback method)
  const addLogo = (imageData, x, y, width, height) => {
    try {
      if (imageData) {
        doc.addImage({
          imageData: imageData, 
          x: x, 
          y: y, 
          width: width, 
          height: height,
          compression: 'FAST'
        });
      }
    } catch (error) {
      console.error('Error adding image:', error);
      // Optional: Draw a placeholder rectangle
      doc.setDrawColor(200);
      doc.rect(x, y, width, height);
    }
  };

  // Add logos if available
  const govLogoPath = require('../../assets/images/gov_logo.png');
  const sealImagePath = require('../../assets/images/seal.png');

  addLogo(govLogoPath, marginLeft, 15, 25, 25);
  addLogo(sealImagePath, pageWidth - marginRight - 35, 15, 25, 25);

  // Watermark
  doc.setTextColor(200);
  doc.setFontSize(60);
  doc.setFont('helvetica', 'bold');
  doc.text('GOVERNMENT CERTIFICATE', pageWidth / 2, pageHeight / 2, {
    align: 'center',
    angle: -45,
    opacity: 0.2
  });

  // Reset text color
  doc.setTextColor(0);

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('GOVERNMENT OF NCT OF DELHI', pageWidth / 2, 50, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text('REVENUE DEPARTMENT', pageWidth / 2, 58, { align: 'center' });
  doc.text('CERTIFICATE OF COMMUNITY', pageWidth / 2, 66, { align: 'center' });

  // Certificate Number
  const certificateNumber = `90500000${Math.floor(Math.random() * 1000000)}`;
  doc.setFontSize(10);
  doc.text(`Certificate No: ${certificateNumber}`, pageWidth - marginRight, 75, { align: 'right' });

  // Main Content
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  
  // Prepare content with proper line breaks
  const contentLines = [
    `This is to certify that ${applicationData.full_name}`,
    `S/D/W of ${applicationData.parent_name || 'N/A'},`,
    `Resident of ${applicationData.address.address},`,
    `${applicationData.address.district}, ${applicationData.address.state},`,
    `belongs to the ${applicationData.caste.caste_type} community,`,
    `which is recognized as Other Backward Class (OBC)`,
    `under the Government of NCT of Delhi.`
  ];

  // Render content with proper alignment
  const startY = 100;
  const lineHeight = 10;
  contentLines.forEach((line, index) => {
    doc.text(line, pageWidth / 2, startY + (index * lineHeight), { align: 'center' });
  });

  // Additional Details
  doc.setFontSize(10);
  doc.text(`Date of Issue: ${new Date().toLocaleDateString()}`, marginLeft, pageHeight - 40);
  
  // Signature Space
  doc.line(marginLeft, pageHeight - 50, marginLeft + 50, pageHeight - 50);
  doc.text('Authorized Signatory', marginLeft, pageHeight - 30);

  // Verification Note
  doc.setFontSize(8);
  doc.text(
    'Note: This is a computer-generated certificate. No signature is required.',
    pageWidth / 2, 
    pageHeight - 20, 
    { align: 'center' }
  );

  return { doc, certificateNumber };
};

const MroApplicationModal = ({ visible, applicationId, onCancel, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [applicationData, setApplicationData] = useState(null);
  const [certificateModalVisible, setCertificateModalVisible] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

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

  const handleGenerateCertificate = () => {
    if (!applicationData) {
      message.error('No application data available');
      return;
    }

    const { doc, certificateNumber } = generateCertificatePDF(applicationData);
    setCertificateData({
      pdf: doc,
      certificateNumber
    });
    setCertificateModalVisible(true);
  };

  const handleRejectApplication = async () => {
    if (!rejectReason.trim()) {
      message.error('Please provide a reason for rejection');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/mro/reject_application/${applicationId}`,
        { reason: rejectReason },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      message.success('Application rejected successfully');
      setRejectModalVisible(false);
      setRejectReason('');
      onUpdate();
      onCancel();
    } catch (error) {
      console.error('Error rejecting application:', error);
      message.error('Failed to reject application');
    }
  };

  const handleCertificateAction = async (action) => {
    if (!certificateData) {
      message.error('No certificate generated');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const pdfBlob = certificateData.pdf.output('blob');
      const formData = new FormData();
      formData.append('file', pdfBlob, `Certificate_${applicationData.full_name}.pdf`);
      formData.append('certificateNumber', certificateData.certificateNumber);
      formData.append('applicationId', applicationId);

      switch(action) {
        case 'email':
          formData.append('email', applicationData.email);
          await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}/mro/send_certificate_email`, 
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
              },
            }
          );
          message.success('Certificate sent to email successfully');
          break;

        case 'save':
          await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}/mro/save_certificate`, 
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
              },
            }
          );
          message.success('Certificate saved to applicant\'s page');
          break;

        case 'download':
          certificateData.pdf.save(`Certificate_${applicationData.full_name}.pdf`);
          break;

        default:
          message.error('Invalid certificate action');
          return;
      }

      setCertificateModalVisible(false);
      onUpdate();
      onCancel();
    } catch (error) {
      console.error('Error processing certificate:', error);
      message.error(`Failed to ${action === 'email' ? 'send email' : action === 'save' ? 'save certificate' : 'process certificate'}`);
    }
  };

  const renderModalFooter = () => {
    // If application is already rejected, only show close button
    if (applicationData?.status === 'REJECTED') {
      return [
        <Button key="close" onClick={onCancel}>
          Close
        </Button>
      ];
    }

    // If in SVRO stage, show waiting message
    if (applicationData?.current_stage?.role_type === 'SVRO') {
      return [
        <Button 
          key="svro-pending" 
          type="default"
          disabled
          icon={<QuestionCircleOutlined />}
        >
          Awaiting SVRO Report
        </Button>,
        <Button key="close" onClick={onCancel}>
          Close
        </Button>
      ];
    }

    // Default footer for pending or other statuses
    return [
      <Button 
        key="reject" 
        type="danger" 
        onClick={() => setRejectModalVisible(true)}
        disabled={applicationData?.status === 'COMPLETED'}
      >
        Reject
      </Button>,
      <Button 
        key="generate" 
        type="primary" 
        onClick={handleGenerateCertificate}
        disabled={applicationData?.status === 'COMPLETED'}
      >
        Generate Certificate
      </Button>,
      <Button key="close" onClick={onCancel}>
        Close
      </Button>
    ];
  };

  return (
    <>
      <Modal
        title={<Title level={3}>Application Details</Title>}
        visible={visible}
        onCancel={onCancel}
        footer={renderModalFooter()}
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
                    applicationData.status === 'REJECTED' ? 'error' :
                    applicationData.current_stage?.role_type === 'SVRO' ? 'warning' : 
                    applicationData.current_stage?.role_type === 'COMPLETED' ? 'success' : 'processing'
                  } 
                  text={applicationData.status === 'REJECTED' ? 'REJECTED' : (applicationData.current_stage?.role_type || 'N/A')}
                />
                {applicationData.status === 'REJECTED' && (
                  <Tag color="red" style={{ marginLeft: '8px' }}>
                    Application Rejected
                  </Tag>
                )}
                {applicationData.current_stage?.role_type === 'SVRO' && (
                  <Tag color="orange" style={{ marginLeft: '8px' }}>
                    Waiting for SVRO Report
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

            {applicationData.mro_verification && (
              <Descriptions title="MRO Verification" bordered column={2} style={{ marginTop: '20px' }}>
                <Descriptions.Item label="Status">
                  <Badge 
                    status={applicationData.mro_verification.status === 'APPROVED' ? 'success' : 'error'} 
                    text={applicationData.mro_verification.status}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="Verified On">
                  {new Date(applicationData.mro_verification.verified_at).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="Remarks" span={2}>
                  {applicationData.mro_verification.remarks}
                </Descriptions.Item>
                {applicationData.mro_verification.report_url && (
                  <Descriptions.Item label="Verification Report" span={2}>
                    <a href={applicationData.mro_verification.report_url} target="_blank" rel="noopener noreferrer">
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

      {/* Rejection Reason Modal */}
      <Modal
        title="Reject Application"
        visible={rejectModalVisible}
        onOk={handleRejectApplication}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectReason('');
        }}
        okText="Reject"
        okButtonProps={{ danger: true }}
      >
        <TextArea 
          rows={4} 
          placeholder="Provide reason for rejection"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>

      {/* Certificate Generation Modal */}
      <Modal
        title="Certificate Generated"
        visible={certificateModalVisible}
        onCancel={() => setCertificateModalVisible(false)}
        footer={[
          <Button 
            key="email" 
            type="primary" 
            icon={<MailOutlined />} 
            onClick={() => handleCertificateAction('email')}
          >
            Send Mail to Applicant
          </Button>,
          <Button 
            key="save" 
            type="default" 
            icon={<DownloadOutlined />} 
            onClick={() => handleCertificateAction('save')}
          >
            Send to Applicant's Page
          </Button>,
          <Button 
            key="download" 
            icon={<DownloadOutlined />} 
            onClick={() => handleCertificateAction('download')}
          >
            Download Certificate
          </Button>
        ]}
        width={600}
      >
        <div style={{ textAlign: 'center' }}>
          <Title level={4}>Certificate Generated Successfully</Title>
          <Text strong>Certificate Number: {certificateData?.certificateNumber}</Text>
          <p>Choose how you want to proceed with the certificate</p>
        </div>
      </Modal>
    </>
  );
};

export default MroApplicationModal;
