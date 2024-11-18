import React, { createContext, useContext, useState, useEffect } from 'react'
import { Button, Avatar, Drawer } from 'antd'
import { UserOutlined, LogoutOutlined, MenuOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { UserContext } from '../components/userContext';
import axios from 'axios';
// Create an authentication context

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null)

  useEffect(() => {
    // Check for token in localStorage on initial load
    const storedToken = localStorage.getItem('authToken')
    if (storedToken) {
      setToken(storedToken)
    }
  }, [])

  const login = (newToken) => {
    setToken(newToken)
    localStorage.setItem('authToken', newToken)
  }

  const logout = () => {
    setToken(null)
    localStorage.removeItem('authToken')
  }

  return (
    <UserContext.Provider value={{ token, login, logout }}>
      {children}
    </UserContext.Provider>
  )
}
// Mock user data (replace with actual user data fetching logic)



const HomePage = () => {
  const navigate = useNavigate()
  const { token, login, logout } = useContext(UserContext)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [userData, setUserData] = useState({ name: '', email: '', role: '' });
  const fetchData = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/users/user`, {
        headers: {
          'Authorization': `Bearer ${token}`, // Include token in Authorization header
        },
      });
      setUserData(res.data); // Set fetched user data
    } catch (e) {
       console.log("There is an error in getting profile details")
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const handleStartApplication = () => {
    if (token) {
      navigate('/application-form')
    } else {
      navigate('/login')
    }
  }

  const showDrawer = () => {
    setDrawerVisible(true)
  }

  const closeDrawer = () => {
    setDrawerVisible(false)
  }

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(to bottom right, #E6F0FF, #EDE7F6)' }}>
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
              {userData.name ? (
                <Button icon={<UserOutlined />} onClick={showDrawer} shape="circle" />
              ) : (
                <>
                  <Button type="default" icon={<UserOutlined />}>
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button type="primary">
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-grow flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-7xl font-extrabold" style={{
              background: 'linear-gradient(to right, #1890ff, #722ed1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}>
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
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar size={64} icon={<UserOutlined />} />
              <div>
                <h2 className="text-xl font-semibold">{userData.username}</h2>
                <p className="text-gray-500">{userData.role}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p>{userData.email}</p>
            </div>
            <Button block onClick={() => navigate('/profile')}>
              View Full Profile
            </Button>
            <Button danger block onClick={() => {
              logout()
              closeDrawer()
            }}>
              <LogoutOutlined /> Logout
            </Button>
          </div>
        </Drawer>
      </div>
    </AuthProvider>
  )
}

export default HomePage