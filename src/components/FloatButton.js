import React, { PropTypes } from 'react';
import { Popover, Affix, Button } from 'antd';


const FloatButton = React.createClass({

    logOut(){
        if(confirm("您确定退出登录么?")){
            sessionStorage.removeItem("ident");
            location.hash="Login";
        }
    },

    render() {
        return (
            <Affix  offsetTop={375}>
                <Popover content={<div><span onClick={this.logOut}>退出登录</span></div>}>
                    <Button type="primary" icon="ellipsis"></Button>
                </Popover>
            </Affix>
        );
    }

});
export default FloatButton;



