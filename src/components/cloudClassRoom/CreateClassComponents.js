import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col,Steps,
    Input,Select,Radio,DatePicker,Checkbox} from 'antd';
import ImageAnswerUploadComponents from './ImageAnswerUploadComponents';
import {isEmpty} from '../../utils/utils';
const Step = Steps.Step;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const { RangePicker } = DatePicker;

var lessonArray=[];
var courseInfoJson={isPublish:2};
const CreateClassComponents = React.createClass({

    getInitialState() {
        return {
            stepNum:0,
        };
    },

    componentDidMount(){
        console.log("cloudRoomMenuItem"+this.props.currentItem);
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
        //TODO 当前课程的适用年级的具体取值待确定
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
        }else{
            courseInfoJson.publisherId="";
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
                {/*<Select className="lessonTeamTeacher"  defaultValue="1" style={{ width: 70 }} onChange={this.teamTeacherSelectOnChange}>
                    <Option value="1">a</Option>
                    <Option value="2">b</Option>
                    <Option value="3">c</Option>
                    <Option value="4">d</Option>
                </Select>*/}
                <select className="lessonTeamTeacher">
                    <option value="1">a</option>
                    <option value="2">b</option>
                    <option value="3">c</option>
                    <option value="4">d</option>
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

        }
        var videoJsonArray=[];
        for(var i=0;i<lessonTimeTagArray.length;i++){
            var videoJson={};
            var option = lessonTeamTeacherTagArray[i];
            var　timeTag = lessonTimeTagArray[i];
            var teacher = option.value;
            var time = timeTag.textContent;
            console.log("teacher"+teacher+"\t"+time);
            videoJson.userID =teacher;
            videoJson.liveTime = new Date(time).valueOf();
            videoJsonArray.push(videoJson);
        }

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
        courseInfoJson.courseName=courseName;
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
        var lessonNum = target.id;
        var lessonTitle = target.value;
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
                        <Input onChange={this.courseNameOnChange}/>
                    </Col>
                </Row>
                <Row>
                    <Col span={4}>课程科目：</Col>
                    <Col span={18}>
                        <Select defaultValue="chinese" style={{ width: 120 }} onChange={this.courseSelectOnChange}>
                            <Option value="chinese">语文</Option>
                            <Option value="math">数学</Option>
                            <Option value="english">英语</Option>
                            <Option value="history">历史</Option>
                        </Select>
                    </Col>
                </Row>
                <Row>
                    <Col span={4}>授课年级：</Col>
                    <Col span={18}>
                        <Select defaultValue="small" style={{ width: 120 }} onChange={this.classLevelSelectOnChange}>
                            <Option value="small">小学</Option>
                            <Option value="middle">初中</Option>
                            <Option value="senior">高中</Option>
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
                                        <Select defaultValue="single" style={{ width: 120 }} onChange={this.teamSelectOnChange}>
                                            <Option value="1">a团队</Option>
                                            <Option value="2">b团队</Option>
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
                        <Input type="textarea" rows={4} onChange={this.classSummaryOnChange}/>
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
                    <Col span={4}>总课时：</Col>
                    <Col span={18}>
                        <Input onChange={this.classTimesOnChange}/>
                    </Col>
                </Row>
                <Row>
                    <Col span={4}>设置课表：</Col>
                    <Col span={18}>
                        <Row className="no_ant-row">
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
