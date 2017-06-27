import React, { PropTypes } from 'react';
import { Card,Radio,Row,Col,Button,Icon,message,Steps,Modal,Form,Pagination } from 'antd';
import {getCloudClassRoomRequestURL} from '../../utils/CloudClassRoomURLUtils';
import {cloudClassRoomRequestByAjax} from '../../utils/CloudClassRoomURLUtils';
import {doWebService_CloudClassRoom} from '../../utils/CloudClassRoomURLUtils';
import {getPageSize} from '../../utils/Const';
import {getLocalTime,formatYMD,formatHM} from '../../utils/utils';
import {isEmpty,cutString} from '../../utils/utils';
import {doWebService} from '../../WebServiceHelper';
import CreateClassComponents from './CreateClassComponents';
import UpdateClassComponents from './UpdateClassComponents';
const RadioGroup = Radio.Group;
const Step = Steps.Step;
var whereJson={};
const AntMulitiClassComponents = React.createClass({

    getInitialState() {
        return {
            currentPage:1,
        };
    },

    componentDidMount(){
        var _this = this;
        //控制显示的是单节课还是系列课
        var isSeries = _this.props.isSeries;
        this.setState({isSeries});
        this.getCourseListBySeries(isSeries);
    },

    componentWillReceiveProps(nextProps){
        var isSeries = nextProps.isSeries;
        this.setState({isSeries});
        this.getCourseListBySeries(isSeries);
    },

    getCourseListBySeries(isSeries){
        var _this = this;
        // var isSeries = _this.props.isSeries;
        if(isEmpty(isSeries)==false){
            whereJson.isSeries=isSeries;
        }
        _this.getCourseList(this.state.currentPage,whereJson);
    },

    getCourseList(pageNo,whereJson){
        var _this = this;
        var requestUrl = getCloudClassRoomRequestURL("courseList");
        var requestType ="POST";
        var propertyJson={
            "numPerPage": getPageSize(),
            "currentPage": pageNo
        };
        if(typeof(whereJson)!="undefined" ){
            propertyJson.where=JSON.stringify(whereJson);
        }
        cloudClassRoomRequestByAjax(requestUrl,propertyJson,requestType, {
            onResponse: function (ret) {
                if (ret.meta.success == true && ret.meta.message=="ok") {
                    message.success("成功");
                    var response=ret.data;
                    var total = response.total;
                    var responseRows=response.rows;
                    var cardArray = [];
                    responseRows.forEach(function (row) {
                        _this.buildEveryCard(row,cardArray);
                    });
                    _this.setState({cardArray,totalCount:total});
                } else {
                    message.error("失败");
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },
    /**
     * 修改课程信息
     * @param propertyJson
     */
    updateCourseInfo(propertyJson){
        var _this = this;
        var requestUrl = getCloudClassRoomRequestURL("courseUpdate");
        var requestType ="POST";
        cloudClassRoomRequestByAjax(requestUrl,propertyJson,requestType, {
            onResponse: function (ret) {
                if (ret.meta.success == true && ret.meta.message=="ok") {
                    message.success("修改成功");
                    _this.getCourseList(_this.state.currentPage);
                } else {
                    message.error("修改失败");
                }
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
        var isFree = row.isFree;
        var money = row.money;
        var content;
        if(isEmpty(row.content)==false){
            content = cutString(row.content,100);
        }else{
            content = row.content;
        }
        var isSeries = row.isSeries;
        var courseTypeName = row.courseType.name;
        var image = row.image;
        var videoNum = row.videoNum;
        var startTime = formatYMD(row.startTime);
        var endTime = formatYMD(row.endTime);
        var videosArray = row.videos;
        var videoLiTagArray=[];
        if(isEmpty(videosArray)==false){
            videosArray.forEach(function (video) {
                var liveTimeStr = getLocalTime(video.liveTime);
                var videoLi = <li className="course_section_info">
						<span className="name">{video.name}</span>
                    	<span className="cont">{video.user.userName}</span>
                    	<span className="time1">{liveTimeStr}</span>
                </li>;
                videoLiTagArray.push(videoLi);
            });
        }
        var isPublish = row.isPublish;
        var isPublishStr;
        var optButtons;
        {/*<Col span={24}><Button icon="info-circle-o" className="exam-particulars_title" title="详情" onClick={_this.getClassDetail.bind(_this,id)}></Button></Col>
        <Col span={24}><Button icon="rollback" className="exam-particulars_title" title="撤回" onClick={_this.withDrawClass.bind(_this,id)}></Button></Col>
        <Col span={24}><Button icon="edit" className="exam-particulars_title" title="编辑" onClick={_this.editClass.bind(_this,id)}></Button></Col>
        <Col span={24}><Button icon="check-circle-o" className="exam-particulars_title" title="发布" onClick={_this.publishClass.bind(_this,id)}></Button></Col>*/}
        switch(isPublish){
            case "1":
                isPublishStr="已发布";
                optButtons=<div>

                    <Col span={24}><Button icon="edit" className="exam-particulars_title" title="编辑" onClick={_this.editClass.bind(_this,row)}></Button></Col>
                    <Col span={24}><Button icon="info-circle-o" className="exam-particulars_title" title="详情" onClick={_this.getClassDetail.bind(_this,row)}></Button></Col>
                    <Col span={24}><Button icon="rollback" className="exam-particulars_title" title="撤回" onClick={_this.withDrawClass.bind(_this,id)}></Button></Col>
                </div>;
                break;
            case "2":
                isPublishStr="未发布";
                optButtons=<div>
                    <Col span={24}><Button icon="info-circle-o" className="exam-particulars_title" title="详情" onClick={_this.getClassDetail.bind(_this,row)}></Button></Col>
                    <Col span={24}><Button icon="edit" className="exam-particulars_title" title="编辑" onClick={_this.editClass.bind(_this,row)}></Button></Col>
                    <Col span={24}><Button icon="check-circle-o" className="exam-particulars_title" title="发布" onClick={_this.publishClass.bind(_this,id)}></Button></Col>*/}
                </div>;
                break;
            case "3":
                isPublishStr="已撤回";
                optButtons=<div>
                    <Col span={24}><Button icon="info-circle-o" className="exam-particulars_title" title="详情" onClick={_this.getClassDetail.bind(_this,row)}></Button></Col>
                    <Col span={24}><Button icon="edit" className="exam-particulars_title" title="编辑" onClick={_this.editClass.bind(_this,row)}></Button></Col>
                    <Col span={24}><Button icon="check-circle-o" className="exam-particulars_title" title="发布" onClick={_this.publishClass.bind(_this,id)}></Button></Col>
                </div>;
                break;
        }
        var publisher_id = row.publisher_id;
        var publisher = row.publisher;
        var videos = row.videos;
        var users = row.users;
        var userSpanArray=[];
        if(isEmpty(users)==false){
            users.forEach(function (user) {
                var userName= user.userName;
                var userSpanObj = <span>{userName}</span>;
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
                            <Col span={21} className="font_gray_33">{courseName}</Col>
                            <Col span={3} className="series_recall">{isPublishStr}</Col>
                        </Row>
                        <Col span={24} className="price"><span className="c-jg price_between">￥{money}</span><span className="price_between gray_line"></span><span className=" price_between font-14">共{videoNum}课时</span></Col>
                        <Col span={24}><span className="series_gray_le">科&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;目：</span><span className="series_gray_ri">{courseTypeName}</span></Col>
                        <Col span={24}><span className="series_gray_le">主讲老师：</span><span className="series_gray_ri">{userSpanArray}</span></Col>
                        <Col span={24}><span className="series_gray_le">开始时间：</span><span className="series_gray_ri">{startTime}</span></Col>
                        <Col span={24}><span className="series_gray_le">结束时间：</span><span className="series_gray_ri">{endTime}</span></Col>
                        <Col span={24}><span className="series_gray_le">排课时间：</span><span className="series_gray_ri"><ul>
                            <li className="course_section_title">
                                    <span className="name">章节名称</span>
                                    <span className="cont">授课老师</span>
                                    <span className="time1">授课时间</span>
                            </li>
                            {videoLiTagArray}
                            </ul></span></Col>
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
        var isPublish = classObj.isPublish;
        var isPublishStr;
        switch(isPublish){
            case "1":
                isPublishStr="已发布";
                break;
            case "2":
                isPublishStr="未发布";
                break;
            case "3":
                isPublishStr="已撤回";
                break;
        }
        var users = classObj.users;
        var userSpanArray=[];
        users.forEach(function (user) {
            var userName= user.userName;
            var userSpanObj = <li>{userName}</li>;
            userSpanArray.push(userSpanObj);
        });
        var startTime = formatYMD(classObj.startTime);
        var endTime = formatYMD(classObj.endTime);
        var courseTime = formatHM(classObj.courseTime);
        var videosArray = classObj.videos;
        var videoLiTagArray=[];
        if(isEmpty(videosArray)==false){
            videosArray.forEach(function (video) {
                var liveTimeStr = getLocalTime(video.liveTime);
                var videoLi = <li className="course_section">
                    <div>
                        <span>{video.name}</span>
                        <span>{video.user.userName}</span>
                        <span>{liveTimeStr}</span>
                    </div>
                </li>;
                videoLiTagArray.push(videoLi);
            });
        }
        console.log("getClassDetail classId:"+classObj.courseName);
        var classDetailPanel=<Card>
            <Row>
                <Col span={6}>
                    <img alt="example" width="100%" src={classObj.image} />
                </Col>
                <Col span={14}>
                    <Row>
                        <Row>
                            <Col span={18}>{classObj.courseName}</Col>
                            <Col span={6}>{isPublishStr}</Col>
                        </Row>
                        <Col span={24}>￥{classObj.money}  |  共{classObj.videoNum}课时</Col>
                        <Col span={24}>科目：{classObj.courseType.name}</Col>
                        <Col span={24}>年级：{classObj.courseType.name}</Col>
                        <Col span={24}>主讲老师：<ul>
                            {userSpanArray}
                        </ul></Col>
                        <Col span={24}>开始时间：{startTime} </Col>
                        <Col span={24}>结束时间：{endTime}</Col>
                        <Col span={24}>排课时间：
                            <ul>
                                <li  className="course_section">
                                    <div className="course_section_title">
                                        <span className="name">章节名称</span>
                                        <span className="cont">授课老师</span>
                                        <span className="cont">授课时间</span>
                                    </div>
                                </li>
                                {videoLiTagArray}
                            </ul>
                        </Col>
                        <Col span={24}>课程概述：{classObj.content}</Col>
                    </Row>
                </Col>
            </Row>
        </Card>;
        this.setState({classDetailModalVisible:true,classDetailPanel});
    },
    /**
     * 撤回课程
     * @param classId
     */
    withDrawClass(classId){
        console.log("reBackClass classId:"+classId);
        var propertyJson = {
            "id": classId,
            "isPublish": "3"
        };
        this.updateCourseInfo(propertyJson);
    },
    /**
     * 发布课程
     * @param classId
     */
    publishClass(classId){
        console.log("publishClass classId:"+classId);
        var propertyJson = {
            "id": classId,
            "isPublish": "1"
        };
        this.updateCourseInfo(propertyJson);
    },

    /**
     * 编辑课程
     * @param classId
     */
    editClass(updateClassObj){
        // console.log("editClass classId:"+classId);
        this.setState({updateClassObj});
        this.setState({"updateClassModalVisible":true});
    },

    showCreateClassModal(){
        this.setState({"createClassModalVisible":true});
    },

    createClassModalHandleCancel(){
        this.setState({"createClassModalVisible":false});
    },
    /**
     * 课程数据过滤
     * @param e
     */
    classFliterOnChange(e){
        console.log('radio checked', e.target.value);
        this.setState({
            classFliterValue: e.target.value,
        });
        if(e.target.value==0){
            whereJson.is_publish="";
        }else{
            whereJson.is_publish=e.target.value;
        }
        this.getCourseList(this.state.currentPage,whereJson);
    },

    pageOnChange(page) {
        this.getCourseList(page);
        this.setState({
            currentPage: page,
        });
    },

    courseAddOk(){
        this.setState({"createClassModalVisible":false});
        this.getCourseList(1);
    },

    classDetailModalHandleCancel(){
        this.setState({classDetailModalVisible:false});
    },
    /**
     * 编辑课程窗口关闭函数
     */
    updateClassModalHandleCancel(){
        this.setState({updateClassModalVisible:false});
    },
    /**
     * 编辑完成后的处理
     */
    courseUpdateOk(){
        this.setState({"updateClassModalVisible":false});
        this.getCourseList(1);
    },

    changeStep(direct,optSource){
        switch(optSource){
            case "save":
                this.refs.createClassComponent.changeStep(direct);
                break;
            case "update":
                this.refs.updateClassComponents.changeStep(direct);
                break;
        }

    },

    saveClassInfo(optSource){
        switch(optSource){
            case "save":
                this.refs.createClassComponent.saveClassInfo();
                break;
            case "update":
                this.refs.updateClassComponents.saveClassInfo();
                break;
        }

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
                    <RadioGroup onChange={this.classFliterOnChange} value={this.state.classFliterValue}  className="series_choose">
                        <Radio value="0">全部</Radio>
                        <Radio value="1">已发布</Radio>
                        <Radio value="2">未发布</Radio>
                        <Radio value="3">已撤回</Radio>
                    </RadioGroup>
					<div className="details">
                    	{this.state.cardArray} 
                	</div>
                </div>
                
				<Pagination total={this.state.totalCount} pageSize={getPageSize()} current={this.state.currentPage}
                                onChange={this.pageOnChange}/>
				</div>
                <Modal className="modal_course" title="创建课程" visible={this.state.createClassModalVisible}
                       onCancel={this.createClassModalHandleCancel}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
					   footer={[
                           <Button onClick={this.changeStep.bind(this,"pre","save")}>上一步</Button>,
                           <Button onClick={this.changeStep.bind(this,"next","save")}>下一步</Button>,
                           <Button onClick={this.saveClassInfo.bind(this,"save")}>提交</Button>,
                           <Button onClick={this.createClassModalHandleCancel}>关闭</Button>
                       ]}
                >
                    <div className="space">
                        <CreateClassComponents ref="createClassComponent" isSeries={this.state.isSeries} onSaveOk={this.courseAddOk}></CreateClassComponents>
                    </div>
                </Modal>

                <Modal className="modal_classDetail" title="课程详情" visible={this.state.classDetailModalVisible}
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

                <Modal className="modal_course" title="编辑课程" visible={this.state.updateClassModalVisible}
                       onCancel={this.updateClassModalHandleCancel}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       footer={[
                           <Button onClick={this.changeStep.bind(this,"pre","update")}>上一步</Button>,
                           <Button onClick={this.changeStep.bind(this,"next","update")}>下一步</Button>,
                           <Button onClick={this.saveClassInfo.bind(this,"update")}>提交</Button>,
                           <Button onClick={this.updateClassModalHandleCancel}>关闭</Button>
                       ]}
                >
                    <div className="space">
                        <UpdateClassComponents ref="updateClassComponents" updateClassObj={this.state.updateClassObj} onSaveOk={this.courseUpdateOk}></UpdateClassComponents>
                    </div>
                </Modal>
            </div>
        );
    },
});

export default AntMulitiClassComponents;
