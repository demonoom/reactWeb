import React, { PropTypes } from 'react';
import { Button } from 'antd';

const ButtonList = (props) => {
  return (
    <div>
      <Button type="primary">Primary</Button>
      <Button>Default</Button>
      <Button type="ghost">Ghost</Button>
      <Button type="dashed">Dashed</Button>
    </div>
  );
};

ButtonList.propTypes = {
};

export default ButtonList;
