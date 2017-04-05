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
        var user = personCenter.state.userInfo.user;
        var userName = user.userName;
        if(isEmpty(user.avatar)==false){
            userPhotoTag = <p className="person_user_bg">
                <img src={user.avatar} className="person_user"/>
				<img src={user.avatar} className="blur"/>		
            </p>;
			<div></div>
        }
        var userCard;
        //PAREN---家长
        if(user.colUtype=="STUD"){
            userCard = <Card title={userName+'的个人名片'} className="bai">
                <Row>
                    <Col span={10}><Button icon="question-circle-o">{userName}的提问</Button></Col>
                </Row>
                <Row>
                    <Col span={10}><Button icon="area-chart">{userName}的学习轨迹</Button></Col>
                </Row>
                <Row>
                    <Col span={10}><Button icon="star-o">{userName}的收藏</Button></Col>
                </Row>
                <Row>
                    <Col span={10}><Button icon="heart-o">{userName}的关注</Button></Col>
                </Row>
            </Card>;
        }else{
            userCard = <Card title={userName+'的个人名片'}  className="bai">
                <Row>
                    <Col span={10}><Button icon="question-circle-o">{userName}的直播</Button></Col>
                </Row>
                <Row>
                    <Col span={10}><Button icon="area-chart">{userName}的备课</Button></Col>
                </Row>
                <Row>
                    <Col span={10}><Button icon="star-o">{userName}的收藏</Button></Col>
                </Row>
                <Row>
                    <Col span={10}><Button icon="heart-o">{userName}的关注</Button></Col>
                </Row>
            </Card>;
        }

        return (
            <div>
                <Card className="bai">
                    {userPhotoTag}
                    <p className="person_btn">
                        <Button>{personCenter.state.userInfo.score}积分</Button><Button>{personCenter.state.userInfo.level.name}</Button>
                    </p>
                </Card>
                <Card className="bai">
                    <Button icon="message" value={personCenter.state.userInfo.user.colUid} onClick={personCenter.sendMessage}>发消息</Button>
                    <Button icon="plus">关注</Button>
                </Card>
                <Card title={personCenter.state.userInfo.user.userName+'的个人名片'}  className="bai">
                    <Row>
                        <Col className="person_le">学校：</Col>
                        <Col span={8}>{personCenter.state.userInfo.school}</Col>
                        <Col span={4}>年级：</Col>
                        <Col span={8}>{personCenter.state.userInfo.grade}</Col>
                    </Row>
                    <Row>
                        <Col span={4}>个人简介：</Col>
                        <Col span={10}>这家伙很懒</Col>
                    </Row>
                </Card>
                {userCard}
            </div>
        );
    },
});

export default PersonCenterComponents;
