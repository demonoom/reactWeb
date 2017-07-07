import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col,Input} from 'antd';
import AntMulitiClassComponents from './AntMulitiClassComponents';
import AntTeamComponents from './AntTeamComponents';
import MyMessageComponents from './MyMessageComponents';
import {doWebService_CloudClassRoom} from '../../utils/CloudClassRoomURLUtils';
import RecommendComponents from './RecommendComponents';

const AntCloudClassRoomComponents = React.createClass({

    getInitialState() {
        return {

        };
    },

    componentDidMount(){
        console.log("cloudRoomMenuItem"+this.props.currentItem);
        this.findUserByAccount();
    },

    getClassList(){

    },

    findUserByAccount(){
        var _this = this;
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        var param = {
            "method": 'AntTeacherLogin',
            "colAccount": loginUser.colAccount,
            "colPasswd": sessionStorage.getItem("loginPassword"),
        };
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                sessionStorage.setItem("cloudClassRoomUser",JSON.stringify(response));
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    createClass(){
        if(this.props.currentItem=="mulitiClass"){
            this.refs.antMulitiClassComponents.showCreateClassModal();
        }else{
            this.refs.antSingleClassComponents.showCreateClassModal();
        }
    },

    createTeam(){
        this.refs.antTeamComponents.showCreateTeamModal();
    },

    searchTeamList(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var teamSearchKey = target.value;
        this.setState({teamSearchKey});
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {

        var tabPanel;
        var toolbar;
        var leftBtn;
        let topButton;
        let createClassBtn = <span className="btn2 talk_ant_btn1">
            <Button className="ant-btn ant-btn-primary add_study" onClick={this.createClass}>创建新课程</Button>
        </span>;
        let teamBtn = <span className="btn2 talk_ant_btn1">
            <Button className="ant-btn ant-btn-primary add_study series_top_btn2" onClick={this.createTeam}>创建团队</Button>
            <Input placeholder="请输入关键字搜索" className="series_search series_top_span2" onChange={this.searchTeamList}/>
        </span>;
        switch(this.props.currentItem){
            case "mulitiClass":
                topButton = createClassBtn;
                leftBtn = "";
                tabPanel = <AntMulitiClassComponents ref="antMulitiClassComponents" isSeries="1"></AntMulitiClassComponents>;
                break;
            case "singleClass":
                topButton = createClassBtn;
                leftBtn = "";
                tabPanel = <AntMulitiClassComponents ref="antSingleClassComponents" isSeries="2"></AntMulitiClassComponents>;
                break;
            case "myTeam":
                topButton = teamBtn;
                leftBtn = "";
                tabPanel = <AntTeamComponents ref="antTeamComponents" type="myTeam" teamSearchKey={this.state.teamSearchKey}></AntTeamComponents>;
                break;
            case "allTeam":
                topButton = teamBtn;
                leftBtn = "";
                tabPanel = <AntTeamComponents ref="antTeamComponents" type="allTeam" teamSearchKey={this.state.teamSearchKey}></AntTeamComponents>;
                break;
            case "myMessage":
                topButton = "";
                leftBtn = "";
                tabPanel = <MyMessageComponents ref="myMessageComponents"></MyMessageComponents>;
                break;
            case "recommend":
                topButton = "";
                leftBtn = "";
                tabPanel = <RecommendComponents ref="recommendComponents"></RecommendComponents>;
                break;
        }

        toolbar = <h3 className={" public—til—blue"}>{this.state.activeKey}
            <div className="btn1">
                {leftBtn}
                {topButton}
            </div>
        </h3>;

        return (
            <div className="team">
                {toolbar}
                {tabPanel}
            </div>
        );
    },
});

export default AntCloudClassRoomComponents;
