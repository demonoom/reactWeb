import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col,Steps,
    Input,Select,Radio,DatePicker,Checkbox,message} from 'antd';
import ImageAnswerUploadComponents from './ImageAnswerUploadComponents';
import {isEmpty} from '../../utils/utils';
import {getCloudClassRoomRequestURL} from '../../utils/CloudClassRoomURLUtils';
import {cloudClassRoomRequestByAjax} from '../../utils/CloudClassRoomURLUtils';
const Step = Steps.Step;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const { RangePicker } = DatePicker;

var lessonArray=[];
var courseInfoJson={isPublish:2,isSeries:2,publisher_id:sessionStorage.getItem("ident"),isFree:1,money:0};
var videoJsonArray=[];
var teamJsonArray=[];
const CreateClassComponents = React.createClass({

    getInitialState() {
        return {
            stepNum:0,
            isFree:1,
            isTeam:1
        };
    },

    componentDidMount(){
        console.log("cloudRoomMenuItem"+this.props.currentItem);
        this.getAllClass();
        this.getAllSubject();
        this.getAllTeam();
    },
    /**
     * 获取所有的年级
     */
    getAllClass(){
        var _this = this;
        var requestUrl = getCloudClassRoomRequestURL("findClass");
        var requestType ="POST";
        var propertyJson={};
        cloudClassRoomRequestByAjax(requestUrl,propertyJson,requestType, {
            onResponse: function (ret) {
                if (ret.meta.success == true && ret.meta.message=="ok") {
                    message.success("成功");
                    var response=ret.data;
                    var classOptionArray=[];
                    var defaultSelected;
                    for(var i=0;i<response.length;i++){
                        var classInfo = response[i];
                        var id = classInfo.id;
                        var name = classInfo.name;
                        var parentid = classInfo.parentid;
                        var optionObj = <Option key={id} value={id}>{name}</Option>;
                        if(i==0){
                            defaultSelected = id;
                        }
                        classOptionArray.push(optionObj);
                    }
                    _this.setState({classOptionArray,defaultSelected});
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
     * 获取所有的授课科目
     */
    getAllSubject(){
        var _this = this;
        var requestUrl = getCloudClassRoomRequestURL("findSubject");
        var requestType ="POST";
        var propertyJson={};
        cloudClassRoomRequestByAjax(requestUrl,propertyJson,requestType, {
            onResponse: function (ret) {
                if (ret.meta.success == true && ret.meta.message=="ok") {
                    message.success("成功");
                    var response=ret.data;
                    var subjectOptionArray=[];
                    var defaultSubjectSelected;
                    for(var i=0;i<response.length;i++){
                        var subjectInfo = response[i];
                        var id = subjectInfo.id;
                        var name = subjectInfo.name;
                        var parentid = subjectInfo.parentid;
                        var optionObj = <Option key={id} value={id}>{name}</Option>;
                        if(i==0){
                            defaultSubjectSelected = id;
                        }
                        subjectOptionArray.push(optionObj);
                    }
                    _this.setState({subjectOptionArray,defaultSubjectSelected});
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
     * 获取当前老师所属的团队
     */
    getAllTeam(){
        var _this = this;
        var requestUrl = getCloudClassRoomRequestURL("findTeamByUserId");
        var requestType ="GET";
        requestUrl = requestUrl+"?id="+sessionStorage.getItem("ident");
        var propertyJson={};
        var teamJson={};
        cloudClassRoomRequestByAjax(requestUrl,propertyJson,requestType, {
            onResponse: function (ret) {
                if (ret.meta.success == true && ret.meta.message=="ok") {
                    message.success("成功");
                    var response=ret.data;
                    var teamOptionArray=[];
                    var defaultTeamSelected;
                    for(var i=0;i<response.length;i++){
                        var teamInfo = response[i];
                        var id = teamInfo.id;
                        var name = teamInfo.name;
                        var status = teamInfo.status;
                        var users = teamInfo.users;
                        var optionObj = <Option key={id} value={id}>{name}</Option>;
                        if(i==0){
                            defaultTeamSelected = id;
                        }
                        var teamUserOptionArray=[];
                        for(var j=0;j<users.length;j++){
                            var user = users[j];
                            var colUid = user.colUid;
                            var userName = user.userName;
                            var userOptionObj = <option value={colUid}>{userName}</option>;
                            teamUserOptionArray.push(userOptionObj);
                        }
                        teamJson.teamId=id;
                        teamJson.teamUserOptionArray = teamUserOptionArray;
                        teamOptionArray.push(optionObj);
                        teamJsonArray.push(teamJson);
                    }
                    _this.setState({teamOptionArray,defaultTeamSelected});
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
     * 根据teamId获取team下的老师
     * @param teamId
     * @returns {Array}
     */
    getTeamUserOptions(teamId){
        var teamUserOptionArray=[];
        for(var i=0;i<teamJsonArray.length;i++){
            var teamJson = teamJsonArray[i];
            if(teamJson.teamId == teamId){
                teamUserOptionArray = teamJson.teamUserOptionArray;
                break;
            }
        }
        this.setState({teamUserOptionArray});
    },

    /**
     * 获取所有的年级
     */
    addCourse(){
        var _this = this;
        var requestUrl = getCloudClassRoomRequestURL("courseAdd");
        var requestType ="POST";
        var propertyJson=courseInfoJson;
        console.log("propertyJson:"+propertyJson);
        cloudClassRoomRequestByAjax(requestUrl,propertyJson,requestType, {
            onResponse: function (ret) {
                if (ret.meta.success == true && ret.meta.message=="ok") {
                    message.success("成功");
                    var response=ret.data;

                } else {
                    message.error("失败");
                }
                _this.props.onSaveOk();
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 课程科目内容改变时的响应函数
     * @param value
     */
    courseSelectOnChange(value) {
        console.log(`selected ${value}`);
        courseInfoJson.courseTypeId=value;
    },
    /**
     * 授课年级内容改变时的响应函数
     * @param value
     */
    classLevelSelectOnChange(value) {
        console.log(`selected ${value}`);
        courseInfoJson.courseClass=value;
    },
    /**
     * 授课方式(单节/系列)
     * @param e
     */
    classTypeOnChange(e){
        console.log('radio checked', e.target.value);
        var isTeam = e.target.value;
        this.setState({
            isTeam: isTeam,
        });
        if(isTeam==1){
            //发布者ＩＤ 单人授课时为人员id　团队授课时为团队id
            var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
            courseInfoJson.publisherId=loginUser.colUid;
            courseInfoJson.publishType=2;
        }else{
            courseInfoJson.publisherId="";
            courseInfoJson.publishType=1;
        }
    },
    /**
     * 课程是否免费的判断
     * @param e
     */
    classIsFreeOnChange(e){
        console.log('radio checked', e.target.value);
        var isFree = e.target.value;
        this.setState({
            isFree: isFree,
        });
        if(isFree==1){
            //TODO 免费时,输入金额的文本框禁用,课程金额为0
            courseInfoJson.money=0;
        }else{

        }
    },
    /**
     * 授课形式,系列课和单节课
     * @param value
     */
    courseTypeSelectOnChange(value) {
        console.log(`courseTypeSelectOnChange ${value}`);
        courseInfoJson.isSeries=value;
    },
    /**
     * 授课团队改变时的响应函数
     * @param value
     */
    teamSelectOnChange(value) {
        console.log(`teamSelectOnChange selected ${value}`);
        //团队授课时,发布者为团队id
        courseInfoJson.publisherId=value;
        this.getTeamUserOptions(value);
        this.setState({"teamId":value});
    },

    /**
     * 授课时间响应函数
     * @param date
     * @param dateString
     */
    classTimeOnChange(date, dateString) {
        console.log(date, dateString);
        var startTime = dateString[0];
        var endTime = dateString[1];
        var startTimestamp = new Date(startTime).valueOf();
        var endTimestamp = new Date(endTime).valueOf();
        courseInfoJson.startTime = startTimestamp;
        courseInfoJson.endTime = endTimestamp;
    },
    
    changeStep(stepDirect){
        var _this = this;
        switch(stepDirect){
            case "pre":
                _this.setState({"stepNum":0});
                break;
            case "next":
                _this.setState({"stepNum":1});
                break;
        }
    },

    addLesson(){
        var lessonNum = lessonArray.length+1;
        // <Col span={4}>第{lessonNum}课时</Col>
        var lessonObj = <div>
            <Col span={4}>
                <select className="lessonTeamTeacher">
                    {/*<option value="1">a</option>
                    <option value="2">b</option>
                    <option value="3">c</option>
                    <option value="4">d</option>*/}
                    {this.state.teamUserOptionArray}
                </select>
            </Col>
            <Col span={8}>
                <DatePicker
                    className="lessonTime"
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    placeholder="Select Time"
                    onChange={this.lessonTimeOnChange}
                    onOk={this.lessonTimeOnOk}
                />
            </Col>
        </div>;
        var lessonJson = {lessonNum,lessonObj};
        lessonArray.push(lessonJson);
        this.setState({lessonArray});
    },

    lessonTimeOnChange(value, dateString,Event) {
        console.log('Selected Time: ', value);
        console.log('Formatted Selected Time: ', dateString);
    },

    lessonTimeOnOk(value) {
        console.log('onOk: ', value);
    },

    removeLesson(lessonNum){
        for(var i=0;i<lessonArray.length;i++){
            var lessonJson = lessonArray[i];
            if(lessonJson.lessonNum==lessonNum){
                lessonArray.splice(i,1);
                break;
            }
        }
        lessonArray.forEach(function (lessonObj) {
            if(lessonObj.lessonNum>lessonNum){
                lessonObj.lessonNum -= 1;
            }
        });
        this.setState({lessonArray});
    },
    /**
     * 保存课程信息
     */
    saveClassInfo(){
        var lessonTeamTeacherTagArray = $(".lessonTeamTeacher option:selected");
        var lessonTimeTagArray = $(".ant-calendar-range-picker");
        var userId;

        if(this.state.isTeam==1) {
            //发布者ＩＤ 单人授课时为人员id　团队授课时为团队id
            var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
            userId = loginUser.colUid;
        }else{
            userId = this.state.teamId;
        }
        for(var i=0;i<lessonTimeTagArray.length;i++){
            var videoJson={};
            var option = lessonTeamTeacherTagArray[i];
            var　timeTag = lessonTimeTagArray[i];
            var teacher = option.value;
            var time = timeTag.value;
            console.log("teacher"+teacher+"\t"+time);
            videoJson.squence = i+1;
            videoJson.courseId = courseInfoJson.courseTypeId;
            videoJson.userID =teacher;
            videoJson.liveTime = new Date(time).valueOf();
            this.buildVideosArray(videoJson);
        }
        this.addCourse();
    },
    /**
     * 立即发布复选框选中响应函数
     * @param e
     */
    publishClassAtNow(e) {
        console.log(`checked = ${e.target.checked}`);
        // 是否发布　１已发布　２未发布
        if(e.target.checked){
            courseInfoJson.isPublish=1;
        }else{
            courseInfoJson.isPublish=2;
        }
    },

    /**
     * 课程名称文本框内容改变响应函数
     * @param e
     */
    courseNameOnChange(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var courseName = target.value;
        this.setState({courseName});
        courseInfoJson.courseName=courseName;
    },
    /**
     * 课程收费金额文本框内容改变时的响应
     * @param e
     */
    moneyOnChange(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var money = target.value;
        this.setState({money});
        courseInfoJson.money=money;
    },
    /**
     * 课程概述内容响应函数
     * @param e
     */
    classSummaryOnChange(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var courseSummary = target.value;
        courseInfoJson.content = courseSummary;
        this.setState({courseSummary});
    },
    /**
     * 总课时内容改变时的响应函数
     * @param e
     */
    classTimesOnChange(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var videoNum = target.value;
        console.log("classTimes:"+videoNum);
        courseInfoJson.videoNum = videoNum;
        this.setState({videoNum});
    },

    /**
     * 获取课程封面
     */
    getLessonImageList(file,isRemoved){
        var lessonImage = file.response;
        if(isEmpty(isRemoved)==false && isRemoved=="removed"){
            lessonImage = "";
        }
        //题目图片答案的图片来源
        courseInfoJson.image = lessonImage;
    },

    lessonTitleOnChange(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var squence = target.id;
        var name = target.value;
        var videoJson = {squence,name};
        this.buildVideosArray(videoJson,"title");
    },

    buildVideosArray(videoJson,buildType){
        var isExistSameVideo=false;
        for(var i=0;i<videoJsonArray.length;i++){
            var everyVideoJson = videoJsonArray[i];
            if(everyVideoJson.squence == videoJson.squence){
                if(buildType=="title"){
                    everyVideoJson.name = videoJson.name;
                }else{
                    everyVideoJson.squence = videoJson.squence;
                    everyVideoJson.courseId = videoJson.courseId;
                    everyVideoJson.userID = videoJson.userID;
                    everyVideoJson.liveTime = videoJson.liveTime;
                }
                isExistSameVideo=true;
                break;
            }
        }
        if(isExistSameVideo==false){
            videoJsonArray.push(videoJson);
        }
        courseInfoJson.videos = videoJsonArray;
    },

    teamTeacherSelectOnChange(value){
        console.log(value);
    },


    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        const radioStyle = {
            display: 'block',
            height: '30px',
            lineHeight: '30px',
        };
        var classStepStatus;
        var lessonStepStatus;
        var saveButton;
        var preButton;
        var nextButton;
        var stepPanel;
        if(this.state.stepNum==0){
            saveButton="";
            classStepStatus="";
            preButton=<Button disabled onClick={this.changeStep.bind(this,"pre")}>上一步</Button>;
            nextButton = <Button onClick={this.changeStep.bind(this,"next")}>下一步</Button>;
            stepPanel = <div>
                <Row>
                    <Col span={4}>课程名称：</Col>
                    <Col span={18}>
                        <Input value={this.state.courseName} onChange={this.courseNameOnChange}/>
                    </Col>
                </Row>
                <Row>
                    <Col span={6}>是否免费</Col>
                    <Col span={18}>
                        <RadioGroup onChange={this.classIsFreeOnChange} value={this.state.isFree}>
                            <Radio style={radioStyle} value={1}>
                                免费
                            </Radio>
                            <Radio style={radioStyle} value={2}>
                                收费
                                <Row>
                                    <Col span={8}>请输入课程费用</Col>
                                    <Col span={16}>
                                        <Input value={this.state.money} onChange={this.moneyOnChange}/>
                                    </Col>
                                </Row>
                            </Radio>
                        </RadioGroup>
                    </Col>
                </Row>
                <Row>
                    <Col span={4}>课程科目：</Col>
                    <Col span={18}>
                        <Select defaultValue={this.state.defaultSubjectSelected} style={{ width: 120 }} onChange={this.courseSelectOnChange}>
                            {this.state.subjectOptionArray}
                        </Select>
                    </Col>
                </Row>
                <Row>
                    <Col span={4}>授课年级：</Col>
                    <Col span={18}>
                        <Select defaultValue={this.state.defaultSelected} style={{ width: 120 }} onChange={this.classLevelSelectOnChange}>
                            {this.state.classOptionArray}
                        </Select>
                    </Col>
                </Row>
                <Row>
                    <Col span={4}>授课形式：</Col>
                    <Col span={18} style={{ height:160 }}>
                        <RadioGroup onChange={this.classTypeOnChange} value={this.state.isTeam}>
                            <Radio style={radioStyle} value={1}>单人授课</Radio>
							<Row style={{ width: 420 }}>
                                <Col span={6} style={{ marginLeft: 22 }}>选择课程类型：</Col>
                                <Col span={16}>
									<Select defaultValue="single" style={{ width: 120 }} onChange={this.courseTypeSelectOnChange}>
										<Option value="1">系列课</Option>
										<Option value="2">单节课</Option>
									</Select>
								</Col>
                                </Row>
                            <Radio style={radioStyle} value={2}>
                                团队授课
                                <Row>
                                    <Col span={6} style={{ marginLeft: 22 }}>选择团队：</Col>
                                    <Col span={16}>
                                        <Select defaultValue={this.state.defaultTeamSelected} style={{ width: 120 }} onChange={this.teamSelectOnChange}>
                                            {this.state.teamOptionArray}
                                        </Select>
                                    </Col>
                                </Row>
                            </Radio>
                        </RadioGroup>
                    </Col>
                </Row>
                <Row>
                    <Col span={4}>授课时间：</Col>
                    <Col span={18}>
                        <RangePicker onChange={this.classTimeOnChange} />
                    </Col>
                </Row>
                <Row>
                    <Col span={4}>课程封面：</Col>
                    <Col span={18}>
                        <ImageAnswerUploadComponents
                                                     callBackParent={this.getLessonImageList}>
                        </ImageAnswerUploadComponents>
                    </Col>
                </Row>
                <Row>
                    <Col span={4}>课程概述：</Col>
                    <Col span={18}>
                        <Input value={this.state.courseSummary} type="textarea" rows={4} onChange={this.classSummaryOnChange}/>
                    </Col>
                </Row>
            </div>;
        }else{
            preButton=<Button onClick={this.changeStep.bind(this,"pre")}>上一步</Button>;
            saveButton=<Button onClick={this.saveClassInfo}>保存</Button>;
            nextButton="";
            var everyLessonArray=[];
            // <Col span={4}>第{lessonNum}课时</Col>
            if(typeof(this.state.lessonArray)!="undefined" ){
                for(var i=0;i<this.state.lessonArray.length;i++){
                    var lessonJson = this.state.lessonArray[i];
                    var lessonRowObj = <Row>
                        <Col span={4}>第{lessonJson.lessonNum}课时</Col>
                        <Col span={6}>
                            <Input id={lessonJson.lessonNum} onChange={this.lessonTitleOnChange}/>
                        </Col>
                        {lessonJson.lessonObj}
                        <Col span={2}>
                            <Button icon="delete" onClick={this.removeLesson.bind(this,lessonJson.lessonNum)}></Button>
                        </Col>
                    </Row>;
                    everyLessonArray.push(lessonRowObj);
                }
            }
            stepPanel=<div>
                <Row>
                    <Col span={4}>总课时</Col>
                    <Col span={20}>
                        <Input value={this.state.videoNum} onChange={this.classTimesOnChange}/>
                    </Col>
                </Row>
                <Row>
                    <Col span={4}>设置课表</Col>
                    <Col span={20}>
                        <Row>
                            <Col span={4}>目录</Col>
                            <Col span={6}>名称</Col>
                            <Col span={4}>授课老师</Col>
                            <Col span={8}>授课时间</Col>
                            <Col span={2}>操作</Col>
                        </Row>
                        {everyLessonArray}
                        <Row>
                            <Col span={24}>
                                <Button icon="add" onClick={this.addLesson}>添加目录</Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col span={6}>
                        <Checkbox onChange={this.publishClassAtNow}>立即发布</Checkbox>
                    </Col>
                </Row>
            </div>;
        }

        return (
            <div >
                <div className="modal_steps">
					<Steps current={this.state.stepNum} >
						<Step title="课程信息" icon={<Icon type="credit-card" />} />
						<Step title="设置课表" icon={<Icon type="smile-o" />} />
					</Steps>
				</div>
                {stepPanel}
                <div>
                    <Row>
                        <Col span={24}>
                            {preButton}
                            {nextButton}
                            {saveButton}
                        </Col>
                    </Row>
                </div>
            </div>
        );
    },
});

export default CreateClassComponents;
