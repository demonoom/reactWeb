import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col,Input} from 'antd';
import AntMulitiClassComponents from './AntMulitiClassComponents';
import AntTeamComponents from './AntTeamComponents';
import OpenClassComponents from './OpenClassComponents';
import MyMessageComponents from './MyMessageComponents';
import {doWebService_CloudClassRoom} from '../../utils/CloudClassRoomURLUtils';
import RecommendComponents from './RecommendComponents';

const AntCloudClassRoomComponents = React.createClass({

    getInitialState() {
        return {
            isHide:false,
        };
    },

    componentDidMount(){
        console.log("cloudRoomMenuItem"+this.props.currentItem);
    },

    componentWillReceiveProps(nextProps){
        this.setState({isHide:false});
    },

    getClassList(){

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
     * 团队设置按钮和搜索文本框的显示和隐藏 true：隐藏  false：显示
     * @param isHide
     */
    hideTeamBtn(isHide){
        this.setState({isHide});
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
                if(this.state.isHide==true){
                    topButton = null;
                }else{
                    topButton = teamBtn;
                }
                leftBtn = "";
                tabPanel = <AntTeamComponents ref="antTeamComponents" onSetBtnClick={this.hideTeamBtn} type="myTeam" teamSearchKey={this.state.teamSearchKey}></AntTeamComponents>;
                break;
            case "liveVideo":
                topButton = "";
                leftBtn = "";
                tabPanel = <OpenClassComponents ref="openClassComponents"></OpenClassComponents>;
                break;
            default:
                topButton = createClassBtn;
                leftBtn = "";
                tabPanel = <AntMulitiClassComponents ref="antMulitiClassComponents" isSeries="1"></AntMulitiClassComponents>;
                break;
        }

        if(this.state.isHide==true){
            toolbar = null;
        }else{
            toolbar = <h3 className={" public—til—blue"}>{this.state.activeKey}
                <div className="btn1">
                    {leftBtn}
                    {topButton}
                </div>
            </h3>;
        }

        return (
            <div className="team">
                {toolbar}
                {tabPanel}
            </div>
        );
    },
});

export default AntCloudClassRoomComponents;
