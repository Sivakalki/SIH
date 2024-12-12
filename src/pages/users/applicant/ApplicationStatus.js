import React, { useState } from 'react';
import axios from 'axios';
import { Button, Input, message } from 'antd';

const ApplicationStatus = () => {
    const [applicationId, setApplicationId] = useState('');
    const [applicationStatus, setApplicationStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        setApplicationId(e.target.value);
    };

    const handleSubmit = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/get_application_status/${applicationId}`);
            setApplicationStatus(response.data);
            message.success('Application status fetched successfully');
        } catch (error) {
            message.error('Failed to fetch application status');
        }
    };

    return (
        <div>
            <Input 
                placeholder="Enter Application ID" 
                value={applicationId} 
                onChange={handleInputChange} 
            />
            <Button onClick={handleSubmit}>Submit</Button>
            {applicationStatus && <div>{JSON.stringify(applicationStatus)}</div>}
        </div>
    );
};

export default ApplicationStatus;