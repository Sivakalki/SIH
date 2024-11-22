import React from "react";
import {
  Table,
  Card,
  Progress,
  Badge,
  Typography,
  Row,
  Col,
  Divider,
} from "antd";
import { FileTextOutlined, BarChartOutlined, UserOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

const { Title } = Typography;

const ApplicationStatus = {
  approved: 0,
  pending: 0,
  rejected: 0,
};

const MandalData = {
  name: "",
  mro: "",
  applicationCount: 0,
  status: ApplicationStatus,
};

const DistrictData = {
  name: "",
  mandals: [MandalData],
};

const exampleDistrictData = {
  name: "Anantapur",
  mandals: [
    {
      name: "Anantapur Urban",
      mro: "K. Ramesh",
      applicationCount: 150,
      status: { approved: 80, pending: 50, rejected: 20 },
    },
    {
      name: "Dharmavaram",
      mro: "M. Lakshmi",
      applicationCount: 120,
      status: { approved: 60, pending: 40, rejected: 20 },
    },
    {
      name: "Kadiri",
      mro: "S. Venkatesh",
      applicationCount: 100,
      status: { approved: 50, pending: 30, rejected: 20 },
    },
    {
      name: "Kalyanadurgam",
      mro: "P. Suresh",
      applicationCount: 80,
      status: { approved: 40, pending: 30, rejected: 10 },
    },
    {
      name: "Hindupur",
      mro: "R. Srinivas",
      applicationCount: 110,
      status: { approved: 70, pending: 30, rejected: 10 },
    },
  ],
};

export default function DistrictOfficerDashboard() {
  const districtData = exampleDistrictData;

  const totalApplications = districtData.mandals.reduce(
    (sum, mandal) => sum + mandal.applicationCount,
    0
  );
  const totalApproved = districtData.mandals.reduce(
    (sum, mandal) => sum + mandal.status.approved,
    0
  );
  const totalPending = districtData.mandals.reduce(
    (sum, mandal) => sum + mandal.status.pending,
    0
  );
  const totalRejected = districtData.mandals.reduce(
    (sum, mandal) => sum + mandal.status.rejected,
    0
  );

  const summaryCards = [
    {
      title: "Total Applications",
      value: totalApplications,
      icon: <FileTextOutlined style={{ fontSize: "16px" }} />,
    },
    {
      title: "Approved",
      value: totalApproved,
      icon: <BarChartOutlined style={{ fontSize: "16px", color: "#52c41a" }} />,
      color: "#d1fae5",
    },
    {
      title: "Pending",
      value: totalPending,
      icon: <UserOutlined style={{ fontSize: "16px", color: "#faad14" }} />,
      color: "#fef3c7",
    },
    {
      title: "Rejected",
      value: totalRejected,
      icon: (
        <ExclamationCircleOutlined
          style={{ fontSize: "16px", color: "#f5222d" }}
        />
      ),
      color: "#fee2e2",
    },
  ];

  const columns = [
    {
      title: "Mandal",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "MRO",
      dataIndex: "mro",
      key: "mro",
    },
    {
      title: "Total Applications",
      dataIndex: "applicationCount",
      key: "applicationCount",
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <Progress
          percent={Math.round(
            (record.status.approved / record.applicationCount) * 100
          )}
        />
      ),
    },
    {
      title: "Approved",
      dataIndex: ["status", "approved"],
      key: "approved",
      render: (value) => <Badge color="green" text={value} />,
    },
    {
      title: "Pending",
      dataIndex: ["status", "pending"],
      key: "pending",
      render: (value) => <Badge color="yellow" text={value} />,
    },
    {
      title: "Rejected",
      dataIndex: ["status", "rejected"],
      key: "rejected",
      render: (value) => <Badge color="red" text={value} />,
    },
  ];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 16px" }}>
      <Title level={2} style={{ marginBottom: "32px" }}>
        District Officer Dashboard - {districtData.name}
      </Title>
      <Row gutter={[24, 24]}>
        {summaryCards.map((card) => (
          <Col xs={24} sm={12} lg={6} key={card.title}>
            <Card
              style={{
                backgroundColor: card.color || "#f3f4f6",
              }}
            >
              <Row justify="space-between" align="middle">
                <Typography.Text strong>{card.title}</Typography.Text>
                {card.icon}
              </Row>
              <Divider />
              <Typography.Title level={3}>{card.value}</Typography.Title>
            </Card>
          </Col>
        ))}
      </Row>
      <Divider />
      <Card>
        <Typography.Title level={4}>Mandal-wise Application Status</Typography.Title>
        <Table
          dataSource={districtData.mandals}
          columns={columns}
          rowKey="name"
          pagination={false}
        />
      </Card>
    </div>
  );
}
