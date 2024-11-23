import React, { useState, useEffect, useContext } from "react";
import { Table, Modal, Form, Input, Select, message, Card, Row, Col } from "antd";
import { ExclamationCircleOutlined, UserOutlined, TeamOutlined, LockOutlined, SafetyOutlined } from "@ant-design/icons";
import axios from "axios";
import { UserContext } from "../../components/userContext";
const { Option } = Select;
const { confirm } = Modal;

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [formVisible, setFormVisible] = useState(false);
  const [userType, setUserType] = useState("");
  const [userData, setUserData] = useState(null);
  const [form] = Form.useForm()
  const [role,setRole] = useState("")
  // Mock data for initial users
  const [initialUsers, setInitialUsers] = useState([])
  const { token, logout } = useContext(UserContext);
  const fetchData = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/users/user`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in Authorization header
        },
      });
      setUserData(res.data.user);
      setRole(res.data.role);
      console.log(res, " is the response data")
    } catch (e) {
      console.error('There is an error in getting profile details', e);
      setUserData(null); // Reset userData if the request fails
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/users/all_users`); // Replace with your actual backend endpoint
      if (response.status === 200) {
        console.log(response.data)
        setInitialUsers(response.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchUsers(); // Ensure fetchUsers runs and updates `initialUsers`
    };
    fetchData();
  }, []);

  useEffect(() => {
    setUsers(initialUsers); // Update users when initialUsers is populated
  }, [initialUsers]); 

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

  const handleCloseForm = ()=>{
    form.resetFields()
    setUserType("")
    setFormVisible(false);
  }
  const handleAddUser = async (values) => {
    try {
      const endpointMap = {
        SVRO: "signup/svro",
        MVRO: "signup/mvro",
        RI: "signup/ri",
        MRO: "signup/mro",
      };

    const endpoint = endpointMap[userType];
    if (!endpoint) {
      message.error("Invalid user type selected.");
      return;
    }

      // Prepare the request payload based on user type
      let payload = {
        username: values.name,
        email: values.email,
        password: values.password,
        confirm_password: values.password, // Assuming password confirmation is the same as the password input
        role: userType.toUpperCase(),
        phone: values.phone,
      };
  
      if (userType === "SVRO") {
        payload = {
          ...payload,
          sachivalayam: values.sachivalayam,
          mandal: values.mandal,
          district: values.district,
          state: values.state,
          pincode: values.pincode,
        };
      } else if (userType === "MVRO") {
        payload = {
          ...payload,
          mandal: values.mandal,
          district: values.district,
          state: values.state,
          type: values.type,
        };
      } else if (userType === "RI") {
        payload = {
          ...payload,
          mandal: values.mandal,
          district: values.district,
          state: values.state,
        };
      } else if (userType === "MRO") {
        payload = {
          ...payload,
          mandal: values.mandal,
          district: values.district,
          state: values.state,
        };
      }
  
  
      // Send signup request to the backend
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/users/${endpoint}`, payload);
      console.log(payload, " is the payload")
      // Extract new user data from the response
      const { data: newUser } = response;
  
      // Add the new user to the state
      setUsers((prev) => [
        ...prev,
        {
          id: newUser.id,
          name: newUser.username,
          email: newUser.email,
        },
      ]);
  
      // Show success message
      message.success(`${userType.toUpperCase()} added successfully!`);
      form.resetFields();
      setUserType("");  // Reset userType

      setFormVisible(false);
    } catch (error) {
      // Handle errors from the backend
      message.error(
        `Failed to add ${userType.toUpperCase()}: ${error.response?.data?.message || error.message}`
      );
    }
  };
  
  const deleteUser = (id) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
    message.success("User deleted successfully!");
  };

  const filteredUsers = users.filter(
    (user) => filter === "all" || user.role_type === filter
  );
  

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "User Type", dataIndex: "role_type", key: "role_type" },
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
      type: "SVRO",
      title: "Sachivalayam Village Revenue Officer",
      icon: <UserOutlined className="text-3xl text-blue-500" />,
    },
    {
      type: "MVRO",
      title: "Mandal Village Revenue Officer",
      icon: <TeamOutlined className="text-3xl text-green-500" />,
    },
    {
      type: "RI",
      title: "RI",
      icon: <SafetyOutlined className="text-3xl text-red-500" />,
    },
    {
      type: "MRO",
      title: "MRO",
      icon: <SafetyOutlined className="text-3xl text-red-500" />,
    },
  ];

  if (role !== "ADMIN") {
    return (
      <div className="flex justify-center items-center flex-col h-screen">
        <h1 className="text-4xl font-serif text-red-500">400 page error</h1>
        <h1 className="text-2xl font-bold text-red-300">You are not allowed to see this page</h1>
      </div>
    );
  }

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
            <Option value="MVRO">MVRO</Option>
            <Option value="SVRO">SVRO</Option>
            <Option value="RI">RI</Option>
            <Option value="MRO">MRO</Option>
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
        onCancel={() => 
          handleCloseForm()
        }
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
            name="phone"
            label="Phone"
            rules={[
              { required: true, message: "phone is required!" },
              { type: "phone", message: "Enter a valid phone!" },
            ]}
          >
            <Input placeholder="Enter phone" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Password is required!" },
              { min: 8, message: "Password must be at least 8 characters" },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
                message:
                  "Password must include uppercase, lowercase, number, and special character.",
              },
            ]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>
          <Form.Item
            name="confirm_password"
            label="Confirm Password"
            rules={[
              { required: true, message: "Password is required!" },
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
            <Input.Password placeholder="Confirm password" />
          </Form.Item>
          {/* Conditional Fields */}
          {userType === "SVRO" && (
            <>
              <Form.Item
                name="sachivalayam"
                label="Sachivalayam"
                rules={[{ required: true, message: "Sachivalayams required!" }]}
              >
                <Input placeholder="Enter Sachivalayam" />
              </Form.Item>
              <Form.Item
                name="pincode"
                label="Pincode"
                rules={[
                  { required: true, message: 'Please input your pincode!' },
                  { pattern: /^\d{6}$/, message: 'Pincode must be exactly 6 digits!' }
                ]}
              >
                <Input placeholder="Enter Pincode" />
              </Form.Item>
              <Form.Item
                name="mandal"
                label="Mandal"
                rules={[{ required: true, message: "Mandal is required!" }]}
              >
                <Input placeholder="Enter mandal" />
              </Form.Item>
              <Form.Item
                name="district"
                label="District"
                rules={[{ required: true, message: "District is required!" }]}
              >
                <Input placeholder="Enter district" />
              </Form.Item>
              <Form.Item
                name="state"
                label="State"
                rules={[{ required: true, message: "State is required!" }]}
              >
                <Input placeholder="Enter state" />
              </Form.Item>
            </>
          )}
          {userType === "MVRO" && (
            <>
              <Form.Item
                name="mandal"
                label="Mandal"
                rules={[{ required: true, message: "Mandal is required!" }]}
              >
                <Input placeholder="Enter mandal" />
              </Form.Item>
              <Form.Item
                name="district"
                label="District"
                rules={[{ required: true, message: "District is required!" }]}
              >
                <Input placeholder="Enter district" />
              </Form.Item>
              <Form.Item
                name="state"
                label="State"
                rules={[{ required: true, message: "State is required!" }]}
              >
                <Input placeholder="Enter state" />
              </Form.Item>
              <Form.Item
                name="type"
                label="Type"
                rules={[{ required: true, message: "Type is required!" }]}
              >
                <Select
                  value={" "}
                  style={{ width: 200 }}
                >
                  <Option value="PERMANENT">Permanent</Option>
                  <Option value="TEMPORARY">Temporary</Option>
                </Select>
              </Form.Item>
            </>
          )}
          {userType === "RI" && (
            <>
              <Form.Item
                name="mandal"
                label="Mandal"
                rules={[{ required: true, message: "Mandal is required!" }]}
              >
                <Input placeholder="Enter mandal" />
              </Form.Item>
              <Form.Item
                name="district"
                label="District"
                rules={[{ required: true, message: "District is required!" }]}
              >
                <Input placeholder="Enter district" />
              </Form.Item>
              <Form.Item
                name="state"
                label="State"
                rules={[{ required: true, message: "State is required!" }]}
              >
                <Input placeholder="Enter state" />
              </Form.Item>
            </>
          )}
          {userType === "MRO" && (
            <>
              <Form.Item
                name="mandal"
                label="Mandal"
                rules={[{ required: true, message: "Mandal is required!" }]}
              >
                <Input placeholder="Enter mandal" />
              </Form.Item>
              <Form.Item
                name="district"
                label="District"
                rules={[{ required: true, message: "District is required!" }]}
              >
                <Input placeholder="Enter district" />
              </Form.Item>
              <Form.Item
                name="state"
                label="State"
                rules={[{ required: true, message: "State is required!" }]}
              >
                <Input placeholder="Enter state" />
              </Form.Item>
            </>
          )}
          {userType === "district officer" && (
            <>
              <Form.Item
                name="district"
                label="District"
                rules={[{ required: true, message: "District is required!" }]}
              >
                <Input placeholder="Enter district" />
              </Form.Item>
              <Form.Item
                name="state"
                label="State"
                rules={[{ required: true, message: "State is required!" }]}
              >
                <Input placeholder="Enter state" />
              </Form.Item>
            </>
          )}
          <Form.Item>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
              htmlType="submit"
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