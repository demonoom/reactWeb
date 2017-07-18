import React, { PropTypes } from 'react';
import { Card,Radio,Row,Col,Button,Icon,message,Steps,Modal,Form,Pagination } from 'antd';
import {getCloudClassRoomRequestURL} from '../../utils/CloudClassRoomURLUtils';
import {cloudClassRoomRequestByAjax} from '../../utils/CloudClassRoomURLUtils';
import {doWebService_CloudClassRoom} from '../../utils/CloudClassRoomURLUtils';
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
        _this.getCourseList(_this.state.currentPage,isSeries);
    },

    getCourseList(pageNo,isSeries,is_publish){
        var _this = this;
        var cloudClassRoomUser = JSON.parse(sessionStorage.getItem("cloudClassRoomUser"));
        var param = {
            "method": 'findCourseByAccount',
            "pageNo": pageNo,
            "course_class":'',
            "isseries":'',
            "coursetypeid":'',
            "numPerPage":getPageSize(),
            "is_publish":'',
            "userId":cloudClassRoomUser.colUid
        };
        if(isEmpty(isSeries)==false){
            param.isseries=isSeries;
        }
        if(isEmpty(is_publish)==false){
            param.is_publish=is_publish;
        }
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                var pager = ret.pager;
                cardArray.splice(0);
                if(isEmpty(response)==false){
                    response.forEach(function (course) {
                        _this.buildEveryCard(course,cardArray);
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
        var isFree = row.isFree;
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
        var endTime = formatYMD(row.endTime);
        var videosArray = row.videos;
        var studentNum = row.studentNum;
        var videoLiTagArray=[];
        var firstLiveTime;
        if(isEmpty(videosArray)==false){
            firstLiveTime = formatNoSecond(videosArray[0].liveTime);
        }
        var isPublish = row.isPublish;
        var isPublishStr;
        var optButtons;
        var isSeries = row.isSeries;
        var endTime;
        if(isSeries=="2"){
            endTime = null;
        }else{
            endTime = <Col span={24}><span className="series_gray_le">结束时间：</span><span className="series_gray_ri">{endTime}</span></Col>;
        }
        switch(isPublish){
            case "1":
                isPublishStr="已发布";
                if(studentNum==0){
                    optButtons=<div>
                        {/*<Col span={24}><Button icon="edit" className="exam-particulars_title" title="编辑" onClick={_this.editClass.bind(_this,row)}></Button></Col>*/}
                        <Col span={24}><Button icon="info-circle-o" className="exam-particulars_title" title="详情" onClick={_this.getClassDetail.bind(_this,row)}></Button></Col>
                        <Col span={24}><Button icon="rollback" className="exam-particulars_title" title="撤回" onClick={_this.showConfirmDrwaModal.bind(_this,id)}></Button></Col>
                    </div>;
                }else{
                    optButtons=<div>
                        <Col span={24}><Button icon="info-circle-o" className="exam-particulars_title" title="详情" onClick={_this.getClassDetail.bind(_this,row)}></Button></Col>
                    </div>;
                }

                break;
            case "2":
                isPublishStr="未发布";
                optButtons=<div>
                    <Col span={24}><Button icon="info-circle-o" className="exam-particulars_title" title="详情" onClick={_this.getClassDetail.bind(_this,row)}></Button></Col>
                    <Col span={24}><Button icon="edit" className="exam-particulars_title" title="编辑" onClick={_this.editClass.bind(_this,row)}></Button></Col>
                    <Col span={24}><Button icon="check-circle-o" className="exam-particulars_title" title="发布" onClick={_this.showConfirmPushModal.bind(_this,id)}></Button></Col>
                </div>;
                break;
            case "3":
                isPublishStr="已撤回";
                optButtons=<div>
                    <Col span={24}><Button icon="info-circle-o" className="exam-particulars_title" title="详情" onClick={_this.getClassDetail.bind(_this,row)}></Button></Col>
                    <Col span={24}><Button icon="edit" className="exam-particulars_title" title="编辑" onClick={_this.editClass.bind(_this,row)}></Button></Col>
                    <Col span={24}><Button icon="check-circle-o" className="exam-particulars_title" title="发布" onClick={_this.showConfirmPushModal.bind(_this,id)}></Button></Col>
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
                            <Col span={3} className="series_recall right_ri">{isPublishStr}</Col>
                        </Row>
                        <Col span={24} className="price"><span className="c-jg price_between">￥{money}</span><span className="price_between gray_line"></span><span className=" price_between font-14">共{videoNum}课时</span></Col>
                        <Col span={24}><span className="series_gray_le">科&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;目：</span><span className="series_gray_ri">{courseTypeName}</span></Col>
                        <Col span={24}><span className="series_gray_le">主讲老师：</span><span className="series_gray_ri">{userSpanArray}</span></Col>
                        <Col span={24}><span className="series_gray_le">开始时间：</span><span className="series_gray_ri">{startTime}</span></Col>
                        {endTime}
                        <Col span={24}><span className="series_gray_le">排课时间：</span><span className="series_gray_ri">{firstLiveTime}
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
                var liveTimeStr = formatNoSecond(video.liveTime);
                var videoLi = <li className="course_section_info">
                        <span className="name">{video.name}</span>
                        <span className="cont">{video.user.userName}</span>
                        <span className="time1">{liveTimeStr}</span>
                </li>;
                videoLiTagArray.push(videoLi);
            });
        }
        console.log("getClassDetail classId:"+classObj.courseName);
        var isSeries = classObj.isSeries;
        var endTime;
        if(isSeries=="2"){
            endTime = null;
        }else{
            endTime = <Col span={24} className="ant-form-item">
                <span className="series_gray_le">结束时间：</span>
                <span className="series_gray_ri">{endTime}</span>
            </Col>;
        }
        var classDetailPanel=<Card>
		
            <Row>
				<Col span={24}>
                    <img alt="example" width="100%" src={classObj.image} />
                </Col>
                <Col span={24}>
                    <Row className="modal_cloud_info">
                        <Row className="upexam_botom_ma">
                            <Col span={21} className="font_gray_33">{classObj.courseName}</Col>
                            <Col span={3} className="series_recall right_ri" >{isPublishStr}</Col>
                        </Row>
                        <Col span={24} className="price ant-form-item">
							<span className="c-jg price_between">￥{classObj.money}</span>
							<span className="price_between gray_line"></span>
							<span className=" price_between font-14">共{classObj.videoNum}课时</span>
						</Col>
                        <Col span={24} className="ant-form-item">
							<span className="series_gray_le">科&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;目：</span>
							<span className="series_gray_ri">{classObj.courseType.name}</span>
						</Col>
                        <Col span={24} className="ant-form-item">
							<span className="series_gray_le">年&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;级：</span>
							<span className="series_gray_ri">{classObj.courseClass}</span>
						</Col>
                        <Col span={24} className="ant-form-item">
							<span className="series_gray_le">主讲老师：</span>
                            <span className="series_gray_ri">{userSpanArray}</span>
                        </Col>
                        <Col span={24} className="ant-form-item">
							<span className="series_gray_le">开始时间：</span>
							<span className="series_gray_ri">{startTime}</span>
						</Col>
                        {endTime}
                        <Col span={24} className="ant-form-item">
							<span className="series_gray_le">排课时间：</span>
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
                        <Col span={24} >
							<span className="series_gray_le">课程概述：</span>
							<span className="series_gray_ri">{classObj.content}</span>
						</Col>
                    </Row>
                </Col>
            </Row>
        </Card>;
        this.setState({classDetailModalVisible:true,classDetailPanel});
    },
    /**
     * 更新课程信息
     */
    updateCourse(){
        var _this = this;
        var param = {
            "method": 'updateCourse',
            "data": JSON.stringify(courseInfoJson),
        };
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if(response){
                    message.success("课程信息修改成功");
                }
                _this.getCourseList(_this.state.currentPage,_this.state.isSeries,_this.state.classFliterValue);
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },
    /**
     * 显示撤回操作确认窗口
     * @param classId
     */
    showConfirmDrwaModal(classId){
        this.setState({classId});
        this.refs.confirmDrawModal.changeConfirmModalVisible(true);
    },

    /**
     * 显示撤回操作确认窗口
     * @param classId
     */
    showConfirmPushModal(classId){
        this.setState({classId});
        this.refs.confirmPushModal.changeConfirmModalVisible(true);
    },

    /**
     * 撤回课程
     * @param classId
     */
    withDrawClass(){
        courseInfoJson.id=this.state.classId;
        courseInfoJson.isPublish=3;
        this.closeConfirmDrawModal();
        this.updateCourse();
    },

    /**
     * 发布课程
     * @param classId
     */
    publishClass(){
        courseInfoJson.id=this.state.classId;
        courseInfoJson.isPublish=1;
        this.closeConfirmPushModal();
        this.updateCourse();
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
        this.refs.createClassComponent.changeStep("pre");
        this.refs.createClassComponent.initCreatePage(this.state.isSeries);
        this.setState({"createClassModalVisible":false,"isChangeStep":false,stepDirect:''});
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
        this.getCourseList(this.state.currentPage,this.state.isSeries,e.target.value);
    },

    pageOnChange(page) {
        this.getCourseList(page,this.state.isSeries,this.state.classFliterValue);
        this.setState({
            currentPage: page,
        });
    },

    courseAddOk(){
        this.setState({"createClassModalVisible":false,"isChangeStep":false,stepDirect:''});
        this.getCourseList(this.state.currentPage,this.state.isSeries,this.state.classFliterValue);
    },

    classDetailModalHandleCancel(){
        this.setState({classDetailModalVisible:false});
    },
    /**
     * 编辑课程窗口关闭函数
     */
    updateClassModalHandleCancel(){
        this.setState({updateClassModalVisible:false,"isChangeStep":true,stepDirect:'pre'});
        this.refs.updateClassComponents.changeStep('pre');
    },
    /**
     * 编辑完成后的处理
     */
    courseUpdateOk(){
        this.setState({"updateClassModalVisible":false,"isChangeStep":true,stepDirect:''});
        this.getCourseList(this.state.currentPage,this.state.isSeries,this.state.classFliterValue);
    },

    changeStep(direct,optSource){
        this.setState({"stepDirect":direct,"isChangeStep":true});
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
     * 关闭发布操作确认Modal
     */
    closeConfirmPushModal(){
        this.setState({"classId":''});
        this.refs.confirmPushModal.changeConfirmModalVisible(false);
    },
    /**
     * 关闭撤回操作确认Modal
     */
    closeConfirmDrawModal(){
        this.setState({"classId":''});
        this.refs.confirmDrawModal.changeConfirmModalVisible(false);
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        var updateButtons;
        var saveButtons;
        if(isEmpty(this.state.stepDirect) || this.state.stepDirect=="pre"){
            saveButtons=[
                <Button onClick={this.changeStep.bind(this,"next","save")}>下一步</Button>,
                <Button onClick={this.createClassModalHandleCancel}>关闭</Button>
            ];
            var updateButtons=[
                <Button onClick={this.changeStep.bind(this,"next","update")}>下一步</Button>,
                <Button onClick={this.updateClassModalHandleCancel}>关闭</Button>
            ];
        }else if(this.state.stepDirect=="next"){
            saveButtons=[
                <Button onClick={this.changeStep.bind(this,"pre","save")}>上一步</Button>,
                <Button onClick={this.saveClassInfo.bind(this,"save")}>提交</Button>,
                <Button onClick={this.createClassModalHandleCancel}>关闭</Button>
            ];
            var updateButtons=[
                <Button onClick={this.changeStep.bind(this,"pre","update")}>上一步</Button>,
                <Button onClick={this.saveClassInfo.bind(this,"update")}>提交</Button>,
                <Button onClick={this.updateClassModalHandleCancel}>关闭</Button>
            ];
        }

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
                
				<Pagination total={this.state.total} pageSize={getPageSize()} current={this.state.currentPage}
                                onChange={this.pageOnChange}/>
				</div>
                <Modal className="modal_course" title="创建课程" visible={this.state.createClassModalVisible}
                       onCancel={this.createClassModalHandleCancel}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
					   footer={saveButtons}
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
                       footer={updateButtons}
                >
                    <div className="space">
                        <UpdateClassComponents ref="updateClassComponents" isChangeStep={this.state.isChangeStep} updateClassObj={this.state.updateClassObj} onSaveOk={this.courseUpdateOk}></UpdateClassComponents>
                    </div>
                </Modal>

                <ConfirmModal ref="confirmPushModal"
                              title="确定要发布该课程?"
                              onConfirmModalCancel={this.closeConfirmPushModal}
                              onConfirmModalOK={this.publishClass}
                ></ConfirmModal>

                <ConfirmModal ref="confirmDrawModal"
                              title="确定要撤回该课程?"
                              onConfirmModalCancel={this.closeConfirmDrawModal}
                              onConfirmModalOK={this.withDrawClass}
                ></ConfirmModal>

            </div>
        );
    },
});

export default AntMulitiClassComponents;
