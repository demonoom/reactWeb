import React from 'react';
import { connect } from 'dva';
import ButtonList from '../components/ButtonList';

const Buttons = (props) => {
  return (
    <div>
      <h2>List of Buttons</h2>
      <a href="#/products">aLink</a>
      <ButtonList/>
    </div>
  );
};

// export default Buttons;
export default connect(({ buttons }) => ({
  buttons
}))(Buttons);
