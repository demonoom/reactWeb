import React, { PropTypes } from 'react';
import { Button,Icon } from 'antd';
import MaaeeLogo from './MaaeeLogo';
import SearchInput from './SearchInput';
import SideMenu from '../components/SideMenu';

const HeaderComponents = (props) => {
  return (
    <div>
      <MaaeeLogo/>
      
      <Button icon="cloud-upload-o" className="colud_bnt"/>
	  <SearchInput placeholder="请输入关键字搜索" onSearch={value => console.log(value)} style={{ width:300 }} />
    </div>

  );
};

HeaderComponents.propTypes = {
};

export default HeaderComponents;
