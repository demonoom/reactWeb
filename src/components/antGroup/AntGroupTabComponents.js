import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col} from 'antd';
import { Menu, Dropdown,message,Pagination,Tag , Modal,Popover,Input} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {getPageSize} from '../../utils/Const';
import {getLocalTime} from '../../utils/Const';
import {isEmpty} from '../../utils/Const';
import {getAllTopic} from '../../utils/Const';
import {getOnlyTeacherTopic} from '../../utils/Const';
const TabPane = Tabs.TabPane;

var antGroup;
const AntGroupTabComponents = React.createClass({

    getInitialState() {
        antGroup = this;
        return {
            defaultActiveKey:'userList',
            activeKey:'userList',
            optType:'getUserList',
        };
    },
    /**
     * 话题tab切换响应函数
     * @param activeKey
     */
    onChange(activeKey) {
        this.setState({activeKey:activeKey});
        var initPageNo = 1;
    },

    componentDidMount(){
        var initPageNo = 1;
        antGroup.getAntGroup(initPageNo);
    },

    /**
     * 获取话题列表
     * @param type 0:全部  1：只看老师
     * @param pageNo
     */
    getAntGroup(pageNo){
        topicCardArray.splice(0);
        topicObjArray.splice(0);
        var param = {
            "method": 'getTopicsByType',
            "ident": sessionStorage.getItem("ident"),
            "type":type,
            "pageNo": pageNo
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                response.forEach(function (e) {
                    topicObjArray.push(e);
                    // antGroup.buildTopicCard(e,0);
                });
                var pager = ret.pager;
                antGroup.setState({"topicCardList":topicCardArray,"totalCount":pager.rsCount,"currentPage":pageNo});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },


    render() {
        var breadMenuTip="蚁群";
        var toolbarExtra = <div className="ant-tabs-right">

        </div>;
        var tabComponent;
        if(antGroup.state.optType=="getTopicById"){

        }else{
            var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
            var welcomeTitle = "欢迎"+loginUser.userName+"登录";
            tabComponent = <Tabs
                hideAdd
                ref = "mainTab"
                activeKey={this.state.activeKey}
                defaultActiveKey={this.state.defaultActiveKey}
                tabBarExtraContent={toolbarExtra}
                transitionName=""  //禁用Tabs的动画效果
            >
                <TabPane tab={welcomeTitle} key="loginWelcome" className="topics_rela">
                    <div className="antnest_cont topics_calc">
                        123123
                    </div>
                </TabPane>
            </Tabs>;
        }
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
