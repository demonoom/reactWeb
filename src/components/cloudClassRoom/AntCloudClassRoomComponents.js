import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col,Input} from 'antd';
import AntMulitiClassComponents from './AntMulitiClassComponents';
import AntTeamComponents from './AntTeamComponents';

const AntCloudClassRoomComponents = React.createClass({

    getInitialState() {
        return {

        };
    },

    componentDidMount(){
        console.log("cloudRoomMenuItem"+this.props.currentItem);
    },

    getClassList(){

    },

    createClass(){
        this.refs.antMulitiClassComponents.showCreateClassModal();
    },

    createTeam(){
        this.refs.antTeamComponents.showCreateTeamModal();
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
        let createTeamBtn = <span className="btn2 talk_ant_btn1">
            <Button className="ant-btn ant-btn-primary add_study" onClick={this.createTeam}>创建团队</Button>
            <Button className="ant-btn ant-btn-primary add_study" onClick={this.createClass}>申请加入</Button>
            <Input placeholder="请输入关键字搜索" />
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
                topButton = createTeamBtn;
                leftBtn = "";
                tabPanel = <AntTeamComponents ref="antTeamComponents" type="myTeam"></AntTeamComponents>;
                break;
            case "allTeam":
                topButton = createTeamBtn;
                leftBtn = "";
                tabPanel = <AntTeamComponents ref="antTeamComponents" type="allTeam"></AntTeamComponents>;
                break;
        }

        toolbar = <h3 className={" public—til—blue"}>{this.state.activeKey}
            <div className="btn1">
                {leftBtn}
                {topButton}
            </div>
        </h3>;

        return (
            <div style={{overflow:'scroll'}}>
                {toolbar}
                {tabPanel}
            </div>
        );
    },
});

export default AntCloudClassRoomComponents;
