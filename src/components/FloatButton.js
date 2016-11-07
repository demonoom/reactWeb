import React, { PropTypes } from 'react';
import { Popover, Affix, Button } from 'antd';

const content = (
  <div>
    <a href="#">功能1</a><br/>
    <a href="#">功能2</a>
  </div>
);

const FloatButton = (props) => {
  return (
    <Affix  offsetTop={375}>
      <Popover content={content}>
        <Button type="primary">浮动<br/>按钮</Button>
      </Popover>
    </Affix>
  );
};

FloatButton.propTypes = {
};

export default FloatButton;



