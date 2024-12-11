import React, { useState } from 'react';

const SvroProfile = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleModal = () => setIsOpen(!isOpen);

    const handleLogout = () => {
        // Add your logout logic here
        console.log('Logged out');
    };

    return (
        <div style={{ position: 'relative' }}>
            <button onClick={toggleModal} style={{ position: 'absolute', top: 10, right: 10 }}>
                Profile
            </button>
            {isOpen && (
                <div style={{ position: 'absolute', top: 40, right: 10, background: 'white', border: '1px solid #ccc', padding: '10px' }}>
                    <h3>SVRO Details</h3>
                    <p>Details about SVRO...</p>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            )}
        </div>
    );
};

export default SvroProfile;