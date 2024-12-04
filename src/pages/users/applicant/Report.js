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
  Tooltip
} from 'antd';
import {
  DownloadOutlined,
  PrinterOutlined,
  FilterOutlined,
  ReloadOutlined,
  ExportOutlined
} from '@ant-design/icons';
import { UserContext } from '../../../components/userContext';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import axios from 'axios';

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

  const columns = [
    {
      title: 'Application ID',
      dataIndex: 'application_id',
      key: 'application_id',
      sorter: true,
    },
    {
      title: 'Full Name',
      dataIndex: 'full_name',
      key: 'full_name',
      sorter: true,
    },
    {
      title: 'Submission Date',
      dataIndex: 'submission_date',
      key: 'submission_date',
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
          status === 'REJECTED' ? 'red' : 'default'
        }>
          {status}
        </Tag>
      ),
      filters: [
        { text: 'Pending', value: 'PENDING' },
        { text: 'Approved', value: 'APPROVED' },
        { text: 'Rejected', value: 'REJECTED' }
      ],
    },
    {
      title: 'Processing Time',
      dataIndex: 'processing_time',
      key: 'processing_time',
      render: (days) => `${days} days`,
      sorter: true,
    },
    {
      title: 'Current Stage',
      dataIndex: 'current_stage',
      key: 'current_stage',
      filters: [
        { text: 'SVRO', value: 'SVRO' },
        { text: 'MVRO', value: 'MVRO' },
        { text: 'RI', value: 'RI' },
        { text: 'MRO', value: 'MRO' }
      ],
    }
  ];

  useEffect(() => {
    fetchReports();
  }, [dateRange, status, pagination.current, pagination.pageSize]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/reports`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
          endDate: dateRange?.[1]?.format('YYYY-MM-DD'),
          status: status !== 'ALL' ? status : undefined,
          page: pagination.current,
          pageSize: pagination.pageSize
        }
      });
      setReports(response.data.reports || []);
      setPagination({
        ...pagination,
        total: response.data.total || 0
      });
    } catch (error) {
      message.error('Failed to fetch reports');
      console.error('Error fetching reports:', error);
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
    </DashboardLayout>
  );
};

export default Report;
