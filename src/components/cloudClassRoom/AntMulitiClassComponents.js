import React, { PropTypes } from 'react';
import { Card,Radio,Row,Col,Button,Icon,message,Steps,Modal,Form,Pagination } from 'antd';
import {getCloudClassRoomRequestURL} from '../../utils/CloudClassRoomURLUtils';
import {cloudClassRoomRequestByAjax} from '../../utils/CloudClassRoomURLUtils';
import {getPageSize} from '../../utils/Const';
import {formatYMD} from '../../utils/utils';
import {formatHM} from '../../utils/utils';
import CreateClassComponents from './CreateClassComponents';
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
        if(typeof(isSeries)!="undefined" ){
            whereJson.isSeries=isSeries;
        }
        console.log("cloudRoomMenuItem"+this.props.currentItem);
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

    buildEveryCard(row,cardArray){
        var _this = this;
        var id = row.id;
        var courseName = row.courseName;
        var isFree = row.isFree;
        var money = row.money;
        var content = row.content;
        var isSeries = row.isSeries;
        var courseTypeName = row.courseType.name;
        var image = row.image;
        var videoNum = row.videoNum;
        var startTime = formatYMD(row.startTime);
        var endTime = formatYMD(row.endTime);
        var courseTime = formatHM(row.courseTime);
        var isPublish = row.isPublish;
        var isPublishStr;
        switch(isPublish){
            case "0":
                isPublishStr="未发布";
                break;
            case "1":
                isPublishStr="已发布";
                break;
        }
        var publisher_id = row.publisher_id;
        var publisher = row.publisher;
        var videos = row.videos;
        var users = row.users;
        var userSpanArray=[];
        users.forEach(function (user) {
            var userName= user.userName;
            var userSpanObj = <span>{userName}</span>;
            userSpanArray.push(userSpanObj);
        });
        var cardObj = <Card>
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
                        <Col span={24}><span className="series_gray_le">科&nbsp;&nbsp;&nbsp;&nbsp;目：</span><span className="series_gray_ri">{courseTypeName}</span></Col>
                        <Col span={24}><span className="series_gray_le">主讲老师：</span><span className="series_gray_ri">{userSpanArray}</span></Col>
                        <Col span={24}><span className="series_gray_le">开始时间：</span><span className="series_gray_ri">{startTime}</span></Col>
                        <Col span={24}><span className="series_gray_le">结束时间：</span><span className="series_gray_ri">{endTime}</span></Col>
                        <Col span={24}><span className="series_gray_le">排课时间：</span><span className="series_gray_ri">{courseTime}</span></Col>
                        <Col span={24}><span className="series_gray_le">课程概述：</span><span className="series_gray_ri">{content}</span></Col>
                    </Row>
                </Col>
                <Col span={2}>
                    <Row className="knowledge_ri">
                        <Col span={24}><Button icon="info-circle-o" className="exam-particulars_title" title="详情" onClick={_this.getClassDetail.bind(_this,id)}></Button></Col>
                        <Col span={24}><Button icon="rollback" className="exam-particulars_title" title="撤回" onClick={_this.withDrawClass.bind(_this,id)}></Button></Col>
                        <Col span={24}><Button icon="edit" className="exam-particulars_title" title="编辑" onClick={_this.editClass.bind(_this,id)}></Button></Col>
                        <Col span={24}><Button icon="check-circle-o" className="exam-particulars_title" title="发布" onClick={_this.publishClass.bind(_this,id)}></Button></Col>
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
    getClassDetail(classId){
        console.log("getClassDetail classId:"+classId);
    },
    /**
     * 撤回课程
     * @param classId
     */
    withDrawClass(classId){
        console.log("reBackClass classId:"+classId);
    },
    /**
     * 发布课程
     * @param classId
     */
    publishClass(classId){
        console.log("publishClass classId:"+classId);
    },

    /**
     * 编辑课程
     * @param classId
     */
    editClass(classId){
        console.log("editClass classId:"+classId);
    },

    showCreateClassModal(){
        this.setState({"createClassModalVisible":true});
    },

    createClassModalHandleCancel(){
        this.setState({"createClassModalVisible":false});
    },

    classFliterOnChange(e){
        console.log('radio checked', e.target.value);
        this.setState({
            classFliterValue: e.target.value,
        });
        var whereJson={};
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
                <Modal className="modal_course" title="创建系列课程" visible={this.state.createClassModalVisible}
                       onCancel={this.createClassModalHandleCancel}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
					   footer={[<Button onClick={this.submitAnswer}>提交</Button>]}
                >
                    <div className="space">
                        <CreateClassComponents onSaveOk={this.courseAddOk}></CreateClassComponents>
                    </div>
                </Modal>
            </div>
        );
    },
});

export default AntMulitiClassComponents;
