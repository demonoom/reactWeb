import React, { PropTypes } from 'react';
import { BackTop } from 'antd';

const style = {
  height: 40,
  width: 40,
  lineHeight: '40px',
  borderRadius: 4,
  backgroundColor: '#57c5f7',
  color: '#fff',
  textAlign: 'center',
  fontSize: 20,
};

const BackTopButton = (props) => {
  return (
    <div>
      <BackTop style={{ bottom: 100 }}>
        <div style={style}>UP</div>
      </BackTop>
    </div>
  );
};

export default BackTopButton;
