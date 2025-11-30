import React, { createContext, useState, useEffect } from 'react';
import { getAPIUrl } from './utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [userAddress, setUserAddress] = useState(null);
  const [authStatus, setAuthStatus] = useState(() => {
    return localStorage.getItem('authStatus') || 'guest';
  });
  const [hasChosenGuest, setHasChosenGuest] = useState(false);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Sync authStatus with localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const newAuthStatus = localStorage.getItem('authStatus') || 'guest';
      setAuthStatus(newAuthStatus);
    };

    window.addEventListener('storage', handleStorageChange);
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Persist cart in localStorage for guests
  useEffect(() => {
    if (authStatus === 'guest') {
      localStorage.setItem('guestCart', JSON.stringify(cart));
    }
  }, [cart, authStatus]);

  // Load cart from localStorage on mount for guests
  useEffect(() => {
    if (authStatus === 'guest') {
      const savedCart = localStorage.getItem('guestCart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    }
  }, [authStatus]);

  // Persist userAddress in localStorage for signed-in users
  useEffect(() => {
    if (authStatus === 'signedIn' && userAddress) {
      localStorage.setItem('userAddress', JSON.stringify(userAddress));
    }
  }, [userAddress, authStatus]);

  // Load userAddress from localStorage on mount for signed-in users
  useEffect(() => {
    if (authStatus === 'signedIn') {
      const savedAddress = localStorage.getItem('userAddress');
      if (savedAddress) {
        setUserAddress(JSON.parse(savedAddress));
      }
    }
  }, [authStatus]);

  // Persist user data
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  const handleCreateAccount = async (address, userData) => {
    try {
      // Log password state before API call
      console.log('Password state before API call:', {
        passwordExists: !!userData.password,
        passwordLength: userData.password ? userData.password.length : 0,
        message: userData.password ? 'Password entered' : 'Password non-entered'
      });

      // Make API call to backend server
      // Transform data to match API documentation format
      const requestBody = {
        customer_name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
        phone: userData.contactMobile || '',
        email: userData.email || '',
        password: userData.password || '',
        ward: address?.ward || '',
        district: address?.district || '',
        street: address?.street || '',
        house_number: address?.houseNumber || '',
        building_name: address?.buildingName || null,
        block: address?.block || null,
        floor: address?.floor || null,
        room_number: address?.roomNumber || null
      };

      const response = await fetch(getAPIUrl('/api/customers/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create account');
      }

      const newUser = await response.json();

      // Update user state
      setUser(newUser);
      
      // Update auth status
      setAuthStatus('signedIn');
      localStorage.setItem('authStatus', 'signedIn');
      
      // Update address
      setUserAddress(address);
      
      return newUser;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        cart,
        setCart,
        userAddress,
        setUserAddress,
        authStatus,
        setAuthStatus,
        hasChosenGuest,
        setHasChosenGuest,
        user,
        setUser,
        handleCreateAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};