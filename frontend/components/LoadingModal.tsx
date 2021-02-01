import React, { Component } from 'react';
import ReactLoading from 'react-loading';

// "Loading" pop up renders whenever async functions are called
const LoadingModal = (props) => {
  if (props.show) {
    return (
      <div id="loading-modal" className="modal">
        <h3>LOADING...</h3>
        <ReactLoading type="cylon" color="#6cbba9" />
      </div>
    );
  } else return null;
};

export default LoadingModal;
