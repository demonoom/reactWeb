import React, {PropTypes} from 'react';
import { Modal, message,Transfer } from 'antd';
import {Dropdown, Menu, Icon} from 'antd';
import UserPasswordModifyComponents from './UserPasswordModifyComponents';
import {doWebService} from '../WebServiceHelper';
import {isEmpty} from './../utils/Const';
import ConfirmModal from './ConfirmModal';

//国际化
import {IntlProvider, addLocaleData} from 'react-intl';
import {FormattedMessage} from 'react-intl';
import zh from 'react-intl/locale-data/zh';
import en from 'react-intl/locale-data/en';
import { width } from 'window-size';

var floatButton;
const FloatButton = React.createClass({

    getInitialState() {
        floatButton = this;
        return {
            visible: false,
            submitFileCheckedList: [],
            submitFileOptions: [],
        };
    },

    logOut() {
        var openKeysStr = sessionStorage.getItem("openKeysStr");
        var ms = floatButton.props.messageUtilObj;
        if (isEmpty(openKeysStr) == false) {
            //已有访问记录，本地移除后，保存到数据库
            var userId = sessionStorage.getItem("ident");
            floatButton.saveHistoryAccessPointId(userId, openKeysStr);
        } else {
            sessionStorage.removeItem("ident");
            sessionStorage.removeItem("loginUser");
            //sessionStorage.removeItem("machineId");
            location.hash = "Login";
        }
        ms.closeConnection();
        LP.delAll();
    },

    saveHistoryAccessPointId(userId, pointId) {
        var param = {
            "method": 'saveHistoryAccessPointId',
            "userId": userId,
            "pointId": pointId
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.response == true) {
                    sessionStorage.removeItem("openKeysStr");
                    sessionStorage.removeItem("ident");
                    sessionStorage.removeItem("loginUser");
                    //sessionStorage.removeItem("machineId");
                }
                location.hash = "Login";
            },
            onError: function (error) {
            }
        });
    },

    showModifyModal() {
        floatButton.refs.userPasswordModify.showModal();
    },

    menuItemOnClick: function ({key}) {
        var clickKey = `${key}`;
        if (clickKey == "modifyPassword") {
            floatButton.showModifyModal();
        } else if (clickKey == "existSystem") {
            floatButton.showConfirmModal();
        }
    },

    showConfirmModal() {
        this.setState({changeConfirmModalVisible:true})
    },

    closeConfirmModal() {
        this.setState({changeConfirmModalVisible:false})
        
    },

    render() {
        const menu = (
            <Menu onClick={floatButton.menuItemOnClick} className="dropdown-menu-tc">
                {/*<Menu.Item key="modifyPassword" className="popup_i_icon"><Icon className="icon_right" type="edit" />修改密码</Menu.Item>*/}
                <Menu.Item key="existSystem" className="popup_i_icon"><Icon className="icon_right" type="logout"/>
                    <FormattedMessage
                        id='settings'
                        description='退出系统'
                        defaultMessage='退出系统'
                    />
                </Menu.Item>
            </Menu>
        );
        return (

            
            <div className="more_div">
                {/* <ConfirmModal ref="confirmModal"
                              title="您确定退出登录么?"
                              onConfirmModalCancel={floatButton.closeConfirmModal}
                              onConfirmModalOK={floatButton.logOut}
                              
                ></ConfirmModal> */}
                        <Modal
                            visible={floatButton.state.changeConfirmModalVisible}
                            title="提示"
                            onCancel={floatButton.closeConfirmModal}
                            maskClosable={false} //设置不允许点击蒙层关闭
                            transitionName=""  //禁用modal的动画效果
                            footer={[
                                <button type="primary" className="login-form-button examination_btn_blue calmSure" onClick={floatButton.logOut}  >确定</button>,
                                <button type="ghost" className="login-form-button examination_btn_white calmCancle" onClick={floatButton.closeConfirmModal} >取消</button>
                            ]}
                        >
                            <div className="isDel">
                                <img className="sadFeel" src={require("../../dist/jquery-photo-gallery/icon/sad.png")} />
                                您确定退出登录么?
                            </div>
                        </Modal>
                <UserPasswordModifyComponents ref="userPasswordModify"/>

                <Dropdown overlay={menu} trigger={['click']} className='affix_bottom'>
                    <i className="iconfont iconfont_more_bnt">&#xe60e;</i>
                </Dropdown>
            
            </div>

        );
    }

});
export default FloatButton;



