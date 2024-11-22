import React, { useContext, useState, useEffect } from 'react';
import { Button, Avatar, Drawer } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../components/userContext';
import axios from 'axios';

const HomePage = () => {
  const navigate = useNavigate();
  const { token, logout } = useContext(UserContext);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [userData, setUserData] = useState(null); // Initially null to differentiate between "loading" and "no user"
  const [role, setRole] = useState("");
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
      console.log(token);
      fetchData();
    }
  }, [token]);

  const handleStartApplication = () => {
    if (token) {
      navigate('/application-form');
    } else {
      navigate('/login');
    }
  };

  const showDrawer = () => {
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(to bottom right, #E6F0FF, #EDE7F6)' }}
    >
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">CertiTrack</div>
          <nav className="hidden md:block">
            <ul className="flex space-x-4">
              <li>
                <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Home
                </Link>
              </li>
            </ul>
          </nav>
          <div className="flex space-x-2">
            {token && userData ? (
              <Button
                icon={<UserOutlined />}
                onClick={showDrawer}
                shape="circle"
              />
            ) : (
              <>
                <Link to="/admin">
                  <Button
                    type="default"
                    icon={<UserOutlined />}
                    className="hover:text-blue-500 hover:shadow-md transition duration-300"
                  >
                    Admin
                  </Button>
                </Link>
                <Link to="/vro">
                  <Button
                    type="default"
                    icon={<UserOutlined />}
                    className="hover:text-green-500 hover:shadow-md transition duration-300"
                  >
                    Vro
                  </Button>
                </Link>
                <Link to="/mvro">
                  <Button
                    type="default"
                    icon={<UserOutlined />}
                    className="hover:text-green-500 hover:shadow-md transition duration-300"
                  >
                  mvro
                  </Button> 
                </Link>
                <Link to="/mro">
                  <Button
                    type="default"
                    icon={<UserOutlined />}
                    className="hover:text-green-500 hover:shadow-md transition duration-300"
                  >
                    Mro
                  </Button>
                </Link>
                <Link to="/do">
                  <Button
                    type="default"
                    icon={<UserOutlined />}
                    className="hover:text-green-500 hover:shadow-md transition duration-300"
                  >
                    Do
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    type="default"
                    icon={<UserOutlined />}
                    className="hover:text-red-500 hover:shadow-md transition duration-300"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    type="primary"
                    className="hover:bg-blue-700 hover:shadow-md transition duration-300"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4">
        <div className="text-center">
          <h1
            className="text-7xl font-extrabold"
            style={{
              background: 'linear-gradient(to right, #1890ff, #722ed1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          >
            CertiTrack
          </h1>
          <p className="mt-4 text-xl text-gray-600">Streamline Your Certification Process</p>
          <Button
            type="primary"
            size="large"
            className="mt-8"
            onClick={handleStartApplication}
          >
            Start Application
          </Button>
        </div>
      </main>

      <footer className="bg-gray-100 border-t border-gray-200">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600">
          CertiTrack ©{new Date().getFullYear()} Created by My Team
        </div>
      </footer>

      <Drawer
        title="User Profile"
        placement="right"
        onClose={closeDrawer}
        open={drawerVisible}
      >
        {userData && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar size={64} icon={<UserOutlined />} />
              <div>
                <h2 className="text-xl font-semibold">{userData.name}</h2>
                <p className="text-gray-500">{role}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p>{userData.email}</p>
            </div>
            <Button block onClick={() => navigate('/profile')}>
              View Full Profile
            </Button>
            <Button
              danger
              block
              onClick={() => {
                logout();
                setUserData(null);
                closeDrawer();
              }}
            >
              <LogoutOutlined /> Logout
            </Button>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default HomePage;
