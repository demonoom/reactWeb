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

var personCenter;
const PersonCenterComponents = React.createClass({

    getInitialState() {
        personCenter = this;
        var userInfo = personCenter.props.userInfo;
        console.log("currentPerson"+userInfo);
        return {
            userInfo:personCenter.props.userInfo,
        };
    },

    /**
     * 发消息
     */
    sendMessage(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var userId = target.value;
        console.log(userId);
        personCenter.props.callBackTurnToMessagePage(userId);
    },

    render() {
        var userPhotoTag;
        if(isEmpty(personCenter.state.userInfo.user.avatar)==false){
            userPhotoTag = <p>
                <img src={personCenter.state.userInfo.user.avatar}/>
            </p>;
        }
        return (
            <div>
                <Card style={{ width: 700 }}>
                    {userPhotoTag}
                    <p>
                        <Button>{personCenter.state.userInfo.score}积分</Button><Button>{personCenter.state.userInfo.level.name}</Button>
                    </p>
                </Card>
                <Card style={{ width: 700 }}>
                    <Button icon="message" value={personCenter.state.userInfo.user.colUid} onClick={personCenter.sendMessage}>发消息</Button>
                    <Button icon="plus">关注</Button>
                </Card>
                <Card title={personCenter.state.userInfo.user.userName+'的个人名片'}  style={{ width: 700 }}>
                    <Row>
                        <Col span={4}>学校：</Col>
                        <Col span={8}>{personCenter.state.userInfo.school}</Col>
                        <Col span={4}>年级：</Col>
                        <Col span={8}>{personCenter.state.userInfo.grade}</Col>
                    </Row>
                    <Row>
                        <Col span={4}>个人简介：</Col>
                        <Col span={10}>这家伙很懒</Col>
                    </Row>
                </Card>
                <Card title={personCenter.state.userInfo.user.userName+'的个人名片'}  style={{ width: 700 }}>
                    <Row>
                        <Col span={10}><Button icon="question-circle-o">{personCenter.state.userInfo.user.userName}的提问</Button></Col>
                    </Row>
                    <Row>
                        <Col span={10}><Button icon="area-chart">{personCenter.state.userInfo.user.userName}的学习轨迹</Button></Col>
                    </Row>
                    <Row>
                        <Col span={10}><Button icon="star-o">{personCenter.state.userInfo.user.userName}的收藏</Button></Col>
                    </Row>
                    <Row>
                        <Col span={10}><Button icon="heart-o">{personCenter.state.userInfo.user.userName}的关注</Button></Col>
                    </Row>
                </Card>
            </div>
        );
    },
});

export default PersonCenterComponents;
