import React, { PropTypes } from 'react';
import { Popover, Affix, Button,Dropdown,Menu,Icon,Modal } from 'antd';
import UserPasswordModifyComponents from './UserPasswordModifyComponents';
import { doWebService } from '../WebServiceHelper';
const confirm = Modal.confirm;

var floatButton;
const FloatButton = React.createClass({

    getInitialState() {
      floatButton = this;
      return {
        visible: false,
        submitFileCheckedList:[],
        submitFileOptions:[],
      };
    },

    logOut(){
        // alert(sessionStorage.getItem("openKeysStr"));
        var openKeysStr = sessionStorage.getItem("openKeysStr");
        confirm({
          title: '您确定退出登录么?',
          onOk() {
            if(openKeysStr!=null && openKeysStr!=""){
              //已有访问记录，本地移除后，保存到数据库
              var userId = sessionStorage.getItem("ident");
              floatButton.saveHistoryAccessPointId(userId,openKeysStr);
            }else{
              location.hash="Login";
            }
          },
          onCancel() {},
        });
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
                    sessionStorage.removeItem("loginUser");
                    sessionStorage.removeItem("machineId");
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
      floatButton.refs.userPasswordModify.showModal();
    },

    menuItemOnClick : function ({ key }) {
        var clickKey = `${key}`;
        console.log("clickKey:"+clickKey)
        if(clickKey=="modifyPassword"){
          floatButton.showModifyModal();
        }else if(clickKey=="existSystem"){
          floatButton.logOut();
        }
    },

    render() {
        const menu = (
            <Menu onClick={floatButton.menuItemOnClick} className="dropdown-menu-tc">
                <Menu.Item key="modifyPassword" className="popup_i_icon"><Icon className="icon_right" type="edit" />修改密码</Menu.Item>
                <Menu.Item key="existSystem" className="popup_i_icon"><Icon className="icon_right" type="delete" />退出系统</Menu.Item>
            </Menu>
        );
        return (


           <div className="more_div">
               <UserPasswordModifyComponents ref="userPasswordModify"/>

               <Dropdown overlay={menu}  trigger={['click']} className='affix_bottom'>
                  <i className="iconfont iconfont_more_bnt">&#xe60e;</i>
               </Dropdown>
           </div>

        );
    }

});
export default FloatButton;



