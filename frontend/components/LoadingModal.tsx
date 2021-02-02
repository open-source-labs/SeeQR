import React from 'react';
import ReactLoading from 'react-loading';

// "Loading" pop up renders whenever async functions are called
const LoadingModal = ({ show }: { show: boolean }) => {
  if (show) {
    return (
      <div id="loading-modal" className="modal">
        <h3>LOADING...</h3>
        <ReactLoading type="cylon" color="#6cbba9" />
      </div>
    );
  }
  return null;
};

export default LoadingModal;
