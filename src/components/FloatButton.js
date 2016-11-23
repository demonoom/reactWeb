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
            <Affix className="affix_bottom" onClick={this.logOut}>
                {/*<Popover content={<div><span className="affix_bottom_tc" onClick={this.logOut}>退出登录</span></div>}>*/}

                <img src={('../../src/components/images/exit_ma.png')}/>
            </Affix>
        );
    }

});
export default FloatButton;



