import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col,Table} from 'antd';
import { Menu, Dropdown,message,Pagination,Tag , Modal,Popover,Input} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {getPageSize} from '../../utils/Const';
import {getLocalTime} from '../../utils/Const';
import {isEmpty} from '../../utils/Const';
import {getAllTopic} from '../../utils/Const';
import {getOnlyTeacherTopic} from '../../utils/Const';
const TabPane = Tabs.TabPane;

var columns = [ {
    title: '联系人',
    dataIndex: 'userContacts',
}];
var antGroup;
const AntGroupTabComponents = React.createClass({

    getInitialState() {
        antGroup = this;
        return {
            defaultActiveKey:'loginWelcome',
            activeKey:'loginWelcome',
            optType:'getUserList',
            userContactsData:[],
        };
    },
    /**
     * 话题tab切换响应函数
     * @param activeKey
     */
    onChange(activeKey) {
        this.setState({activeKey:activeKey});
    },

    componentDidMount(){
        antGroup.getAntGroup();
    },

    /**
     * 获取个人中心需要的数据,老师和学生可通用,后期需要什么再添加
     */
    getAntGroup(){
        var userContactsData=[];
        var param = {
            "method": 'getUserContacts',
            "ident": sessionStorage.getItem("ident"),
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                response.forEach(function (e) {
                    var userId = e.colUid;
                    var userName = e.userName;
                    var userJson = {key:userId,userContacts:userName};
                    userContactsData.push(userJson);
                });
                antGroup.setState({"userContactsData":userContactsData});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    getPersonCenterInfo(record, index){
        // alert("12312"+record);
    },

    render() {
        var breadMenuTip="蚁群";
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        var welcomeTitle = "欢迎"+loginUser.userName+"登录";
        var toolbarExtra = <div className="ant-tabs-right">

        </div>;
        var tabComponent = <Tabs
            hideAdd
            ref = "mainTab"
            activeKey={this.state.activeKey}
            defaultActiveKey={this.state.defaultActiveKey}
            tabBarExtraContent={toolbarExtra}
            transitionName=""  //禁用Tabs的动画效果
        >
            <TabPane tab={welcomeTitle} key="loginWelcome" className="topics_rela">
                <Table onRowClick={antGroup.getPersonCenterInfo} showHeader={false} scroll={{ x: true, y: 400 }} columns={columns} dataSource={antGroup.state.userContactsData} pagination={false}/>
            </TabPane>
        </Tabs>;
        return (
            <div>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item><Icon type="home" /></Breadcrumb.Item>
                    <Breadcrumb.Item href="#/MainLayout">个人中心</Breadcrumb.Item>
                    <Breadcrumb.Item href="#/MainLayout">{breadMenuTip}</Breadcrumb.Item>
                </Breadcrumb>
                {tabComponent}
            </div>
        );
    },
});

export default AntGroupTabComponents;
