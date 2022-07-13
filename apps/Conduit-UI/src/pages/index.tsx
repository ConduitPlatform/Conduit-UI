import React from 'react';
import dynamic from 'next/dynamic';
import ScaleLoader from 'react-spinners/ScaleLoader';

const Home = dynamic(() => import('../components/home/Home'), {
  loading: () => (
    <ScaleLoader speedMultiplier={3} color={'#07D9C4'} loading={true} height={21} width={4} />
  ),
});

const HomePage = () => {
  return <Home />;
};

export default HomePage;
