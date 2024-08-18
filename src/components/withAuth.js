import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
// import Loader from '@/components/loader'

const withAuth = (WrappedComponent) => {
  return (props) => {
    const Router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const checkAuth = () => {
        const userData = sessionStorage.getItem('userData');
        if (!userData) {
          Router.replace('/login');
        } else {
          setIsLoading(false);
        }
      };

      checkAuth();
    }, []);

    if (isLoading) {
      return <div>
        {/* <Loader/> */} Loading...
      </div>; // Or your custom loading component
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;