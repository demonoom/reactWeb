import { Button } from 'antd';
import React from 'react';

const Btns = (props) => {
  return (
    <div>
      <Button type="primary">Primary</Button>
      <Button>Default</Button>
      <Button type="ghost">Ghost</Button>
      <Button type="dashed">Dashed</Button>
    </div>
  );
};

export default Btns;
