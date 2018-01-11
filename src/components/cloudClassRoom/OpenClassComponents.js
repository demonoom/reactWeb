import React, { PropTypes } from 'react';
import { Card,Radio,Row,Col,Button,Icon,message,Steps,Modal,Form,Pagination } from 'antd';
import {doWebService_CloudClassRoom,TEACH_LIVE_URL} from '../../utils/CloudClassRoomURLUtils';
import {getPageSize} from '../../utils/Const';
import {getLocalTime,formatYMD,formatHM,formatNoSecond} from '../../utils/utils';
import {isEmpty,cutString} from '../../utils/utils';
import ConfirmModal from '../ConfirmModal';
import CreateClassComponents from './CreateClassComponents';
import UpdateClassComponents from './UpdateClassComponents';
const RadioGroup = Radio.Group;
const Step = Steps.Step;
var whereJson={};
var courseInfoJson={};
var cardArray = [];
const OpenClassComponents = React.createClass({

    getInitialState() {

        return {
            currentPage:1,
        };
    },

    componentDidMount(){
        var _this = this;
        _this.getCourseList(_this.state.currentPage);
    },

    componentWillReceiveProps(nextProps){
        this.getCourseList(this.state.currentPage);
    },

    /**
     * 获取课程列表(直播开课的需要自己过滤数据)
     */
    getCourseList(pageNo){
        var _this = this;
        var cloudClassRoomUser = JSON.parse(sessionStorage.getItem("cloudClassRoomUser"));
        var param = {
            "method": 'findCourseByAccount',
            "pageNo": pageNo,
            "course_class":'',
            "isseries":'',
            "coursetypeid":'',
            "numPerPage":getPageSize(),
            "is_publish":'1',
            "userId":cloudClassRoomUser.colUid
        };
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                var pager = ret.pager;
                cardArray.splice(0);
                if(isEmpty(response)==false){
                    response.forEach(function (course) {
                        //可以开课
                        if(course.canOpenClass==true){
                            _this.buildEveryCard(course,cardArray);
                        }
                    });
                }else {
                    var cardObj = <Card className="noDataTipImg">
                        <div>
                            <Icon type="frown-o" /><span>&nbsp;&nbsp;暂无数据</span>
                        </div>
                    </Card>;
                    cardArray.push(cardObj);
                }
                _this.setState({cardArray,total:pager.rsCount});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    buildEveryCard(row,cardArray){
        var _this = this;
        var id = row.id;
        var courseName = row.courseName;
        var money = row.money;
        var content;
        if(isEmpty(row.content)==false){
            content = cutString(row.content,100);
        }else{
            content = row.content;
        }
        var courseTypeName = row.courseType.name;
        var image = row.image;
        var videoNum = row.videoNum;
        var startTime = formatYMD(row.startTime);
        var endTimeStr = formatYMD(row.endTime);
        var videosArray = row.videos;
        var firstLiveTime;
        if(isEmpty(videosArray)==false){
            firstLiveTime = formatNoSecond(videosArray[0].liveTime);
        }
        var isSeriesStr;
        var optButtons;
        var isSeries = row.isSeries;
        var endTime;
        isSeriesStr="普通课程";
        var canOpenClass = row.canOpenClass;
        var courseStatus = row.courseStatus;
        var courseStatusStr="直播中";
        if(courseStatus=="1"){
            courseStatusStr="未开始";
        }else if(courseStatus=="2"){
            courseStatusStr="直播中";
        }else if(courseStatus=="3"){
            courseStatusStr="结束";
        }
        if(isEmpty(isSeries)){
            endTime = null;
            isSeriesStr="实景课";
            if(canOpenClass==true && courseStatus!="3"){
                optButtons=<div>
                    <Col span={24}><Button icon="play-circle-o" className="exam-particulars_title" title="直播" onClick={_this.getClassDetail.bind(_this,row)}></Button></Col>
                </div>;
            }
        }else{
            if(isSeries=="2"){
                endTime = null;
                isSeriesStr="单节课";
                if(canOpenClass==true && courseStatus!="3"){
                    optButtons=<div>
                        <Col span={24}><Button icon="play-circle-o" className="exam-particulars_title" title="直播" onClick={_this.openLive.bind(_this,row,"singleClass")}></Button></Col>
                    </div>;
                }
            }else{
                endTime = <Col span={24}><span className="series_gray_le">结束时间：</span><span className="series_gray_ri">{endTimeStr}</span></Col>;
                if(canOpenClass==true){
                    optButtons=<div>
                        <Col span={24}><Button icon="play-circle-o" className="exam-particulars_title" title="直播" onClick={_this.getClassDetail.bind(_this,row)}></Button></Col>
                    </div>;
                }
            }
        }
        var users = row.users;
        var userSpanArray=[];
        if(isEmpty(users)==false){
            users.forEach(function (user) {
                var userName= user.userName;
                var userSpanObj = <span className="info_school_s">{userName}</span>;
                userSpanArray.push(userSpanObj);
            });
        }
        var cardObj = <Card key={id}>
            <Row>
                <Col span={4}>
                    <img alt="example" width="100%" src={image} />
                </Col>
                <Col span={18}>
                    <Row className="details_cont">
                        <Row>
                            <Col span={21} className="font_gray_33 submenu_left_hidden">{courseName}</Col>
                            <Col span={3} className="series_recall right_ri">{isSeriesStr}</Col>
                        </Row>
                        <Col span={24} className="price"><span className="c-jg price_between">￥{money}</span><span className="price_between gray_line"></span><span className=" price_between font-14">共{videoNum}课时</span></Col>
                        <Col span={24}><span className="series_gray_le">科&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;目：</span><span className="series_gray_ri">{courseTypeName}</span></Col>
                        <Col span={24}><span className="series_gray_le">主讲老师：</span><span className="series_gray_ri">{userSpanArray}</span></Col>
                        <Col span={24}><span className="series_gray_le">开始时间：</span><span className="series_gray_ri">{startTime}</span></Col>
                        {endTime}
                        <Col span={24}><span className="series_gray_le">排课时间：</span><span className="series_gray_ri">{firstLiveTime}
                        </span></Col>
                        <Col span={24}><span className="series_gray_le">直播状态：</span><span className="series_gray_ri">{courseStatusStr}
                        </span></Col>
                        <Col span={24}><span className="series_gray_le">课程概述：</span><span className="series_gray_ri">{content}</span></Col>
                </Row>
                </Col>
                <Col span={2}>
                    <Row className="knowledge_ri">
                        {optButtons}
                    </Row>
                </Col>
            </Row>
        </Card>;
        cardArray.push(cardObj);
    },

    /**
     * 查看课程详情
     * @param classId
     */
    getClassDetail(classObj){
        var _this = this;
        var videosArray = classObj.videos;
        var cloudClassRoomUser = JSON.parse(sessionStorage.getItem("cloudClassRoomUser"));
        var userId = cloudClassRoomUser.colUid;
        var videoLiTagArray=[];
        if(isEmpty(videosArray)==false){
            videosArray.forEach(function (video) {
                //播放按钮
                var playButton;
                if(video.userID==userId && video.videoStatus!="3"){
                    playButton = <Button icon="play-circle-o" className="exam-particulars_title" title="直播" onClick={_this.openLive.bind(_this,video,"mulitiClass")}></Button>;
                }
                var liveTimeStr = formatNoSecond(video.liveTime);
                var videoLi = <li className="course_section_info">
                        <span className="name">{video.name}</span>
                        <span className="cont">{video.user.userName}</span>
                        <span className="time1">{liveTimeStr}</span>
                        <span className="cont3">
                            {playButton}
                        </span>
                </li>;
                videoLiTagArray.push(videoLi);
            });
        }
        var classDetailPanel=<Card>
            <Row>
                <Col span={24}>
                    <Row className="modal_cloud_info">
                        <Row className="upexam_botom_ma">
                            <Col span={21} className="font_gray_33">{classObj.courseName}</Col>
                        </Row>
                        <Col span={24} className="ant-form-item">
							<span className="series_gray_le">排课时间：</span>
                            <ul>
                                <li  className="course_section">
                                    <div className="course_section_title">
                                        <span className="name">章节名称</span>
                                        <span className="cont">授课老师</span>
                                        <span className="cont">授课时间</span>
                                        <span className="cont3">操作</span>
                                    </div>
                                </li>
                                {videoLiTagArray}
                            </ul>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Card>;
        this.setState({classDetailModalVisible:true,classDetailPanel});
    },
    /**
     * 课程直播
     * @param liveObj（直播对象，普通课程为当前课程，单节课为选定的章节）
     */
    openLive(liveObj,liveType){
        console.log(TEACH_LIVE_URL);
        //0:课程   1 章节  targetType
        var _this =this;
        var param = {
            "method": 'findVideoById',
            "id": liveObj.id,
        };
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                var videoStatus = response.videoStatus;
                if(isEmpty(videoStatus)==false && videoStatus==3){
                    _this.setState({"tipModalVisible":true});
                    return;
                }
                var userId = sessionStorage.getItem("ident");
                var targetType="";
                var targetId = "";
                var title="";
                var requestUrl = TEACH_LIVE_URL;
                if(liveType=="singleClass"){
                    //单节课（可以直接用课程开课）
                    targetType = 0;
                    targetId = liveObj.id;
                    title = liveObj.courseName;
                }else{
                    //普通课程播放的是具体章节，courseObj代表章节
                    targetType = 1;
                    targetId = liveObj.id;
                    title = liveObj.name;
                }
                requestUrl+=userId+"/"+targetType+"/"+targetId+"/"+title;
                window.open(requestUrl);
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 根据章节id，查询章节的信息
     */
    findVideoById(videoId){
        var videoStatus="";
        var param = {
            "method": 'findVideoById',
            "id": videoId,
        };
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                videoStatus = response.videoStatus;
                return videoStatus;
            },
            onError: function (error) {
                message.error(error);
            }
        });

    },

    pageOnChange(page) {
        this.getCourseList(page);
        this.setState({
            currentPage: page,
        });
    },

    classDetailModalHandleCancel(){
        this.setState({classDetailModalVisible:false});
    },

    tipModalHandleCancel(){
        this.setState({"tipModalVisible":false,"classDetailModalVisible":false});
        this.getCourseList(this.state.currentPage);
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {

        return (
            <div className="favorite_scroll series_courses">
			<div className="clearfix">
                <div>
					<div className="details">
                    	{this.state.cardArray} 
                	</div>
                </div>
                
				<Pagination total={this.state.total} pageSize={getPageSize()} current={this.state.currentPage}
                                onChange={this.pageOnChange}/>
				</div>

                <Modal className="modal_classDetail" title="直播章节" visible={this.state.classDetailModalVisible}
                       onCancel={this.classDetailModalHandleCancel}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       footer={[
                           <Button onClick={this.classDetailModalHandleCancel}>关闭</Button>
                       ]}
                >
                    <div className="space">
                        {this.state.classDetailPanel}
                    </div>
                </Modal>

                <Modal
                    visible={this.state.tipModalVisible}
                    title="课程状态"
                    onCancel={this.tipModalHandleCancel}
                    transitionName=""  //禁用modal的动画效果
                    maskClosable={false} //设置不允许点击蒙层关闭
                    footer={[]}>
                    <div className="font_center">
                        当前课程已经直播过，稍后请选择其他章节再次开启直播，谢谢！
                    </div>
                </Modal>

            </div>
        );
    },
});

export default OpenClassComponents;
