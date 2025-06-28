import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useUserContext from "../context/User/useUserContext";

const OAuthSuccess = () => {
  const { handleOAuthSuccess } = useUserContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const processOAuthRedirect = () => {
      console.log("OAuthSuccess component mounted");
      console.log("Location search:", location.search);
      
      // Parse URL parameters
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const userDataStr = params.get('userData');

      console.log("Token received:", !!token);
      console.log("User data received:", !!userDataStr);

      if (!token || !userDataStr) {
        console.error('Missing token or user data in URL');
        console.error('Token:', token);
        console.error('User data string:', userDataStr);
        navigate('/registration', { state: { error: 'Authentication failed - missing data' } });
        return;
      }

      try {
        // Parse the user data
        const userData = JSON.parse(decodeURIComponent(userDataStr));
        console.log("Parsed user data:", userData);

        // Call the context handler function
        const success = handleOAuthSuccess(token, userData);
        console.log("OAuth success result:", success);

        if (success) {
          // Redirect to the home page or dashboard on success
          console.log("OAuth successful, redirecting to home");
          navigate('/');
        } else {
          console.error("OAuth success handler returned false");
          navigate('/registration', { state: { error: 'Failed to process authentication' } });
        }
      } catch (error) {
        console.error('Error processing OAuth redirect:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
        navigate('/registration', { state: { error: 'Invalid authentication data' } });
      }
    };

    processOAuthRedirect();
  }, [location.search, navigate, handleOAuthSuccess]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-xl font-semibold mb-4">Processing your sign-in...</h1>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Please wait while we complete the authentication process.</p>
        <p className="mt-2 text-sm text-gray-500">URL: {location.search}</p>
      </div>
    </div>
  );
}

export default OAuthSuccess;