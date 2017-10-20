import React, {PropTypes} from 'react';
import {Button, Icon} from 'antd';
import MaaeeLogo from './MaaeeLogo';
import ProgressBar from '../components/ProgressBar';

var floatButton;
const HeaderComponents = React.createClass({

    redirectHelpPage() {
        window.open("http://maaee.com/luble/handbook/index.html", "_blank");
    },
    //搜索向上传值
    search() {
        this.props.search();
    },

    render() {
        return (
            <div>
                <MaaeeLogo/>
                <Icon type="search" className="search_header" onClick={this.search}/>
                <ProgressBar style={{valign: 'bottom'}}></ProgressBar>
                <Button icon="book" onClick={this.redirectHelpPage} className="colud_bnt help_note">操作手册</Button>
            </div>
        );
    }

});
export default HeaderComponents;



