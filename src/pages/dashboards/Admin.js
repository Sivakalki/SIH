import React, { useState } from "react";
import { Table, Modal, Form, Input, Select, message, Card, Row, Col } from "antd";
import { ExclamationCircleOutlined, UserOutlined, TeamOutlined, LockOutlined, SafetyOutlined } from "@ant-design/icons";

const { Option } = Select;
const { confirm } = Modal;

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [formVisible, setFormVisible] = useState(false);
  const [userType, setUserType] = useState("");

  // Mock data for initial users
  const initialUsers = [
    { id: 1, name: "John Doe", email: "john@example.com", type: "vro" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", type: "mro" },
    { id: 3, name: "Mike Davis", email: "mike@example.com", type: "user" },
  ];

  React.useEffect(() => {
    setUsers(initialUsers);
  }, []);

  const showCreateConfirmation = (type) => {
    confirm({
      title: `Are you sure you want to add a new ${type.toUpperCase()}?`,
      icon: <ExclamationCircleOutlined />,
      onOk() {
        setUserType(type);
        setFormVisible(true);
      },
    });
  };

  const handleAddUser = (values) => {
    const newUser = { id: Date.now(), ...values, type: userType };
    setUsers((prev) => [...prev, newUser]);
    message.success(`${userType.toUpperCase()} added successfully!`);
    setFormVisible(false);
  };

  const deleteUser = (id) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
    message.success("User deleted successfully!");
  };

  const filteredUsers = users.filter(
    (user) => filter === "all" || user.type === filter
  );

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "User Type", dataIndex: "type", key: "type" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <a className="text-red-600 hover:underline" onClick={() => deleteUser(record.id)}>
          Delete
        </a>
      ),
    },
  ];

  const cardData = [
    {
      type: "vro",
      title: "Village Revenue Officer",
      icon: <UserOutlined className="text-3xl text-blue-500" />,
    },
    {
      type: "mro",
      title: "Mandal Revenue Officer",
      icon: <TeamOutlined className="text-3xl text-green-500" />,
    },
    {
      type: "district officer",
      title: "District Officer",
      icon: <SafetyOutlined className="text-3xl text-red-500" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Admin Dashboard</h1>

      {/* Cards for Account Creation */}
      <Row gutter={16} className="mb-6">
        {cardData.map((card) => (
          <Col span={8} key={card.type}>
            <Card
              className="hover:shadow-lg cursor-pointer"
              onClick={() => showCreateConfirmation(card.type)}
              bordered
            >
              <div className="flex flex-col items-center">
                {card.icon}
                <h2 className="mt-3 font-semibold text-lg"> Add {card.title}</h2>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* User Table */}
      <Card>
        <div className="mb-4 flex justify-between items-center">
          <Select
            value={filter}
            onChange={(value) => setFilter(value)}
            style={{ width: 200 }}
          >
            <Option value="all">All</Option>
            <Option value="vro">VRO</Option>
            <Option value="mro">MRO</Option>
            <Option value="district officer">District Officer</Option>
            <Option value="user">User</Option>
          </Select>
        </div>
        <Table
          dataSource={filteredUsers}
          columns={columns}
          rowKey="id"
          bordered
        />
      </Card>

      {/* Modal for Adding User */}
      <Modal
        title={`Create Account for ${userType.toUpperCase()}`}
        visible={formVisible}
        onCancel={() => setFormVisible(false)}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleAddUser}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Name is required!" }]}
          >
            <Input placeholder="Enter name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Email is required!" },
              { type: "email", message: "Enter a valid email!" },
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
          <Form.Item
              name="password"
              label={<span className="flex items-center">Password </span>}
              rules={[
                { required: true, message: 'Please input your password!' },
                { min: 8, message: 'Password must be at least 8 characters long' },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
                  message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
                },
              ]}
            >
              <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Password" />
            </Form.Item>
            <Form.Item
              name="confirm_password"
              label={<span className="flex items-center">Confirm Password </span>}
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('The two passwords do not match!'))
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Confirm Password" />
            </Form.Item>
          <Form.Item>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
              htmltype="submit"
            >
              Create {userType.toUpperCase()}
            </button>
          </Form.Item>
          
        </Form>
      </Modal>
    </div>
  );
};

export default Admin;
