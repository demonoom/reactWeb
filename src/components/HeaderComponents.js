import React from 'react';
import { Button} from 'antd';
import MaaeeLogo from './MaaeeLogo';
import SearchInput from './SearchInput';
import ProgressBar from '../components/ProgressBar';

const HeaderComponents = (props) => {
    return (
        <div>
            <MaaeeLogo/>

            <Button icon="cloud-upload-o" className="colud_bnt"/>
            <SearchInput placeholder="请输入关键字搜索"onSearch={value => console.log(value)} style={{ width:300 }} />
            <ProgressBar style={{valign:'bottom'}}></ProgressBar>
        </div>
    );
};

HeaderComponents.propTypes = {
};

export default HeaderComponents;
