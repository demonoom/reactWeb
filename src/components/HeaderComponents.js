import React, {PropTypes} from 'react';
import {Button, Icon,Switch} from 'antd';
import MaaeeLogo from './MaaeeLogo';
import ProgressBar from '../components/ProgressBar';
import {isEmpty,setLocalLanaguage} from '../utils/utils';

var floatButton;
const HeaderComponents = React.createClass({

    redirectHelpPage() {
        window.open("http://maaee.com/luble/handbook/index.html", "_blank");
    },
    //搜索向上传值
    search() {
        this.props.search();
    },

    /**
     *语言切换的回调
     */
    checkoutLanguage(checked) {
        //在此处切换isDefineLanguage值
        setLocalLanaguage(checked);
        location.href="/#/MainLayout";
    },

    render() {
        var defaultChecked;
        if (isEmpty(localStorage.getItem("language"))) {
            //true是英文，false是中文
            //localStorage中没有语言，才用浏览器默认语言
            if (navigator.language == 'zh-CN') {
                defaultChecked = false;
            } else {
                defaultChecked = true;
            }
        } else {
            //根据localStorage中的来设置
            var lan = localStorage.getItem("language");
            if (lan == "zh-CN") {
                defaultChecked = false;
            } else {
                defaultChecked = true;
            }
        }
        return (
            <div>
                <MaaeeLogo/>
                {/*<Switch checkedChildren="En" unCheckedChildren="中"
                        onChange={this.checkoutLanguage}
                        defaultChecked={defaultChecked}/>*/}
                <Icon type="search" className="search_header" onClick={this.search}/>
                <ProgressBar style={{valign: 'bottom'}}></ProgressBar>
                <Button icon="book" onClick={this.redirectHelpPage} className="colud_bnt help_note">操作手册</Button>
            </div>
        );
    }

});
export default HeaderComponents;



