import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col} from 'antd';
import AntMulitiClassComponents from './AntMulitiClassComponents';
import AntSingleClassComponents from './AntSingleClassComponents';

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
        switch(this.props.currentItem){
            case "mulitiClass":
                topButton = createClassBtn;
                leftBtn = "";
                tabPanel = <AntMulitiClassComponents ref="antMulitiClassComponents"></AntMulitiClassComponents>;
                break;
            case "singleClass":
                topButton = createClassBtn;
                leftBtn = "";
                tabPanel = <AntSingleClassComponents></AntSingleClassComponents>;
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
