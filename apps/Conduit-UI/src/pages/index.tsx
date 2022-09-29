import React from 'react';
import dynamic from 'next/dynamic';
import LoaderComponent from '../components/common/LoaderComponent';

const Home = dynamic(() => import('../components/home/Home'), {
  loading: () => <LoaderComponent />,
});

const HomePage = () => {
  return <Home />;
};

export default HomePage;
