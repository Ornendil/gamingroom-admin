import { useEffect, useState } from 'react';
import { refreshAccessToken } from '../functions';

function useAuth() {
    const [accessToken, setAccessToken] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Check if user has a valid session on component mount
    useEffect(() => {
        const verifySession = async () => {
            try {
                // Call the function and pass the setState functions
                await refreshAccessToken(setAccessToken, setIsLoggedIn);
            } catch (error) {
                console.error('Failed to verify session:', error);
                setIsLoggedIn(false);
            }
            setIsLoading(false);
        };

        // Run this check on initial load to see if the user is logged in
        verifySession();
    }, []);

    // Refresh token every time the Access Token is about to expire
    useEffect(() => {
        if (accessToken) {
            // Decode the JWT to get the expiration time
            const payload = JSON.parse(atob(accessToken.split('.')[1]));
            const expiresIn = payload.exp * 1000 - Date.now();

            // Refresh the token a few minutes before it actually expires
            const refreshTimeout = expiresIn - 5 * 60 * 1000; // 5 minutes in milliseconds

            // Set a timer to refresh the token
            const timer = setTimeout(() => {
                refreshAccessToken(setAccessToken, setIsLoggedIn);
            }, refreshTimeout);

            // Cleanup timer on component unmount
            return () => clearTimeout(timer);
        }
    }, [accessToken]);

    return { accessToken, isLoggedIn, setAccessToken, setIsLoggedIn, isLoading };
}

export default useAuth;
