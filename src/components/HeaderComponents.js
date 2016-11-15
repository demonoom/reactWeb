import React, { PropTypes } from 'react';
import { Button,Icon } from 'antd';
import MaaeeLogo from './MaaeeLogo';
import SearchInput from './SearchInput';
import SideMenu from '../components/SideMenu';


const HeaderComponents = (props) => {
  return (
    <div>
<<<<<<< HEAD
          <MaaeeLogo />
        <Button icon="cloud-upload-o" style={{ float:'right', margin:'15px 20px 0 0'}}/>
        &nbsp;&nbsp;<SearchInput placeholder="请输入关键字搜索"
                   onSearch={value => console.log(value)} style={{ width: 200,float:'right' ,margin:'15px 20px 0 0'}}
=======
      <MaaeeLogo/>
      <SearchInput placeholder="请输入关键字搜索"
                   onSearch={value => console.log(value)} style={{ width:300 }}
>>>>>>> ab54f559d01a480ea63ebd32e5864d9855983db5
      />

      <SideMenu/>
    </div>

  );
};

HeaderComponents.propTypes = {
};

export default HeaderComponents;
