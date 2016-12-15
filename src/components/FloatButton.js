import React, { PropTypes } from 'react';
import { Popover, Affix, Button,Dropdown,Menu,Icon } from 'antd';
import UserPasswordModifyComponents from './UserPasswordModifyComponents';
import { doWebService } from '../WebServiceHelper';


const FloatButton = React.createClass({

    logOut(){
        // alert(sessionStorage.getItem("openKeysStr"));
        var openKeysStr = sessionStorage.getItem("openKeysStr");
        if(confirm("您确定退出登录么?")){
            if(openKeysStr!=null && openKeysStr!=""){
                //已有访问记录，本地移除后，保存到数据库
                var userId = sessionStorage.getItem("ident");
                this.saveHistoryAccessPointId(userId,openKeysStr);
            }else{
                location.hash="Login";
            }
        }
    },

    saveHistoryAccessPointId(userId,pointId){
        var param = {
            "method":'saveHistoryAccessPointId',
            "userId":userId,
            "pointId":pointId
        };
        doWebService(JSON.stringify(param), {
            onResponse : function(ret) {
                console.log(ret.msg);
                if(ret.msg=="调用成功" && ret.response==true){
                    console.log("保存此用户上次访问的知识点id成功");
                    sessionStorage.removeItem("openKeysStr");
                    sessionStorage.removeItem("ident");
                }else{
                    console.log("保存此用户上次访问的知识点id失败");
                }
                location.hash="Login";
            },
            onError : function(error) {
                console.log(error);
            }
        });
    },

    showModifyModal(){
        this.refs.userPasswordModify.showModal();
    },

    menuItemOnClick : function ({ key }) {
        var clickKey = `${key}`;
        console.log("clickKey:"+clickKey)
        if(clickKey=="modifyPassword"){
            this.showModifyModal();
        }else if(clickKey=="existSystem"){
            this.logOut();
        }
    },

    render() {
        const menu = (
            <Menu onClick={this.menuItemOnClick}>
                <Menu.Item key="modifyPassword" className="popup_i_icon"><Icon className="icon_right" type="edit" />修改密码</Menu.Item>
                <Menu.Item key="existSystem" className="popup_i_icon"><Icon className="icon_right" type="delete" />退出系统</Menu.Item>
            </Menu>
        );
        return (
           <div>
               <UserPasswordModifyComponents ref="userPasswordModify"/>
               <Dropdown overlay={menu}  trigger={['click']}  className='affix_bottom'>
                   <Icon type="ellipsis" className="icon_more" />
               </Dropdown>
           </div>
        );
    }

});
export default FloatButton;



