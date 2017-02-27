import React, { PropTypes } from 'react';
import { Button} from 'antd';
import MaaeeLogo from './MaaeeLogo';
import SearchInput from './SearchInput';
import ProgressBar from '../components/ProgressBar';

var floatButton;
const HeaderComponents = React.createClass({

    redirectHelpPage(){
        window.open("http://www.baidu.com","_blank");
    },

    render() {
        return (
            <div>
                <MaaeeLogo/>

                {/*<Button icon="cloud-upload-o" className="colud_bnt"/>
                 <SearchInput placeholder="请输入关键字搜索"onSearch={value => console.log(value)} style={{ width:300 }} />*/}
                <ProgressBar style={{valign:'bottom'}}></ProgressBar>
                <Button icon="book" onClick={this.redirectHelpPage} className="colud_bnt"/>
            </div>
        );
    }

});
export default HeaderComponents;



