import React, { useState, useEffect, useContext } from 'react';
import {
  Card,
  Table,
  Row,
  Col,
  DatePicker,
  Button,
  Select,
  Typography,
  Space,
  Tag,
  message,
  Tooltip,
  Modal,
  Form,
  Input,
  Radio,
  Upload
} from 'antd';
import {
  DownloadOutlined,
  PrinterOutlined,
  FilterOutlined,
  ReloadOutlined,
  ExportOutlined,
  UploadOutlined,
  InboxOutlined
} from '@ant-design/icons';
import { UserContext } from '../../../components/userContext';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import axios from 'axios';
import moment from 'moment';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const Report = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [status, setStatus] = useState('ALL');
  const { token } = useContext(UserContext);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [currentApplication, setCurrentApplication] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState({
    address: [],
    caste: [],
    dob: []
  });

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const columns = [
    {
      title: 'Application ID',
      dataIndex: 'application_id',
      key: 'application_id',
      sorter: true,
    },
    {
      title: 'Full Name',
      dataIndex: 'fullname',
      key: 'fullname',
      sorter: true,
    },
    {
      title: 'Report Description',
      dataIndex: 'reportDescription',
      key: 'reportDescription',
    },
    {
      title: 'Report Created',
      dataIndex: 'reportCreated_at',
      key: 'reportCreated_at',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'PENDING' ? 'gold' :
          status === 'APPROVED' ? 'green' :
          status === 'REJECTED' ? 'red' :
          status === 'COMPLETED' ? 'blue' : 'default'
        }>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const isCompleted = record.status === 'COMPLETED';
        return (
          <Button 
            type="primary" 
            disabled={isCompleted} 
            onClick={() => handleEdit(record.application_id)}
            loading={editLoading}
          >
            Edit Application
          </Button>
        );
      }
    }
  ];

  const handleEdit = async (applicationId) => {
    try {
      setEditLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/edit_application/${applicationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const formData = {
        ...response.data,
        ...response.data.address,
        dob: response.data.dob ? moment(response.data.dob) : null,
        proofs: response.data.proofs || { address: null, caste: null, dob: null }
      };
      
      setCurrentApplication(response.data);
      form.setFieldsValue(formData);
      setEditModalVisible(true);
    } catch (error) {
      message.error('Failed to fetch application details');
      console.error('Error fetching application details:', error);
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditSubmit = async (values) => {
    try {
      setEditLoading(true);
      const { 
        address, pincode, state, district, mandal, sachivalayam, 
        dob, proofs, ...restValues 
      } = values;
      
      const formData = {
        ...restValues,
        dob: dob ? dob.format('YYYY-MM-DD') : null,
        address: {
          address,
          pincode,
          state,
          district,
          mandal,
          sachivalayam
        },
        proofs: proofs || { address: null, caste: null, dob: null }
      };

      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/edit_application/${currentApplication.application_id}`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.status === 200) {
        message.success('Application updated successfully');
        setEditModalVisible(false);
        // Reset form and current application
        form.resetFields();
        setCurrentApplication(null);
        // Refresh the table data
        fetchReports();
      } else {
        throw new Error('Failed to update application');
      }
    } catch (error) {
      console.error('Error updating application:', error);
      if (error.response) {
        // Handle specific error responses from backend
        switch (error.response.status) {
          case 400:
            message.error('Invalid application data. Please check your inputs.');
            break;
          case 401:
            message.error('Unauthorized. Please log in again.');
            break;
          case 403:
            message.error('You do not have permission to edit this application.');
            break;
          case 404:
            message.error('Application not found.');
            break;
          default:
            message.error('Failed to update application. Please try again later.');
        }
      } else if (error.request) {
        // Network error
        message.error('Network error. Please check your connection.');
      } else {
        message.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setEditLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [dateRange, status, pagination.current, pagination.pageSize]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/recheck_applications`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
          endDate: dateRange?.[1]?.format('YYYY-MM-DD'),
          status: status !== 'ALL' ? status : undefined,
          page: pagination.current,
          pageSize: pagination.pageSize
        }
      });
      
      // The response data is directly an array of applications
      setReports(response.data || []);
      setPagination({
        ...pagination,
        total: response.data.length || 0
      });
    } catch (error) {
      message.error('Failed to fetch recheck applications');
      console.error('Error fetching recheck applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination, filters, sorter) => {
    setPagination(newPagination);
    // You can handle sorting and filtering here if needed
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/reports/export`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
            endDate: dateRange?.[1]?.format('YYYY-MM-DD'),
            status: status !== 'ALL' ? status : undefined
          },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'applications_report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('Report exported successfully');
    } catch (error) {
      message.error('Failed to export report');
      console.error('Error exporting report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setDateRange(null);
    setStatus('ALL');
    setPagination({
      ...pagination,
      current: 1
    });
  };

  const content = (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={2}>Application Reports</Title>
        </Col>
        <Col>
          <Space>
            <Tooltip title="Reset Filters">
              <Button icon={<ReloadOutlined />} onClick={handleReset} />
            </Tooltip>
            <Tooltip title="Export Report">
              <Button icon={<ExportOutlined />} onClick={handleExport} />
            </Tooltip>
            <Tooltip title="Print Report">
              <Button icon={<PrinterOutlined />} onClick={handlePrint} />
            </Tooltip>
          </Space>
        </Col>
      </Row>

      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={24} md={12} lg={12}>
              <Space>
                <RangePicker
                  onChange={setDateRange}
                  value={dateRange}
                  style={{ width: '100%' }}
                  placeholder={['Start Date', 'End Date']}
                />
                <Select
                  value={status}
                  onChange={setStatus}
                  style={{ width: 120 }}
                  placeholder="Status"
                >
                  <Select.Option value="ALL">All Status</Select.Option>
                  <Select.Option value="PENDING">Pending</Select.Option>
                  <Select.Option value="APPROVED">Approved</Select.Option>
                  <Select.Option value="REJECTED">Rejected</Select.Option>
                  <Select.Option value="COMPLETED">Completed</Select.Option>
                </Select>
              </Space>
            </Col>
          </Row>

          <Table
            columns={columns}
            dataSource={reports}
            loading={loading}
            rowKey="application_id"
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Total ${total} items`
            }}
            onChange={handleTableChange}
            scroll={{ x: true }}
          />
        </Space>
      </Card>
    </Space>
  );

  return (
    <DashboardLayout loading={loading}>
      {content}
      <Modal
        title="Edit Application"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditSubmit}
          initialValues={currentApplication}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="full_name" label="Full Name">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dob" label="Date of Birth">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="gender" label="Gender">
                <Select>
                  <Select.Option value="MALE">Male</Select.Option>
                  <Select.Option value="FEMALE">Female</Select.Option>
                  <Select.Option value="OTHER">Other</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="religion" label="Religion">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="parent_religion" label="Parent Religion">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="caste" label="Caste">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="sub_caste" label="Sub Caste">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="marital_status" label="Marital Status">
                <Select>
                  <Select.Option value="SINGLE">Single</Select.Option>
                  <Select.Option value="MARRIED">Married</Select.Option>
                  <Select.Option value="DIVORCED">Divorced</Select.Option>
                  <Select.Option value="WIDOWED">Widowed</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="parent_guardian_type" label="Guardian Type">
                <Select>
                  <Select.Option value="FATHER">Father</Select.Option>
                  <Select.Option value="MOTHER">Mother</Select.Option>
                  <Select.Option value="GUARDIAN">Guardian</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="parent_guardian_name" label="Guardian Name">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Typography.Title level={5}>Address Details</Typography.Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="address" label="Address">
                <Input.TextArea />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="pincode" label="Pincode">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="state" label="State">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="district" label="District">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="mandal" label="Mandal">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="sachivalayam" label="Sachivalayam">
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="phone_num" label="Phone Number">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="email" label="Email">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="aadhar_num" label="Aadhar Number">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Typography.Title level={5}>Proofs</Typography.Title>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name={["proofs", "address"]} label="Address Proof">
                <Input placeholder="Address Proof URL" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name={["proofs", "caste"]} label="Caste Proof">
                <Input placeholder="Caste Proof URL" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name={["proofs", "dob"]} label="DOB Proof">
                <Input placeholder="DOB Proof URL" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="Status">
                <Select disabled>
                  <Select.Option value="PENDING">Pending</Select.Option>
                  <Select.Option value="APPROVED">Approved</Select.Option>
                  <Select.Option value="REJECTED">Rejected</Select.Option>
                  <Select.Option value="COMPLETED">Completed</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="current_stage" label="Current Stage">
                <Select disabled>
                  <Select.Option value="SVRO">SVRO</Select.Option>
                  <Select.Option value="MVRO">MVRO</Select.Option>
                  <Select.Option value="RI">RI</Select.Option>
                  <Select.Option value="MRO">MRO</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {currentApplication?.rejection_reason && (
            <Form.Item name="rejection_reason" label="Rejection Reason">
              <Input.TextArea disabled />
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={editLoading}>
                Update Application
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </DashboardLayout>
  );
};

export default Report;
