import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col,Select} from 'antd';
import CourseImageUploadComponents from './CourseImageUploadComponents';
import {doWebService_CloudClassRoom} from '../../utils/CloudClassRoomURLUtils';
import {isEmpty} from '../../utils/utils';
const Option = Select.Option;

const RecommendComponents = React.createClass({

    getInitialState() {
        return {

        };
    },

    componentDidMount(){
        this.getCourseList();
        this.findAdvance();
    },

    componentWillMount(){
        this.getCourseList();
        this.findAdvance();
    },

    getRecommendImage(file,isRemoved){
        var lessonImage = file.response;
        if(isEmpty(isRemoved)==false && isRemoved=="removed"){
            lessonImage = "";
        }
        //题目图片答案的图片来源
        courseInfoJson.image = lessonImage;
    },

    getCourseList(){
        var _this = this;
        var param = {
            "method": 'findAllCourse',
        };
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                var pager = ret.pager;
                var optionArray = [];
                if(isEmpty(response)==false){
                    response.forEach(function (course) {
                        var id = course.id;
                        var courseName = course.courseName;
                        var optionObj = <Option key={id} value={id}>{courseName}</Option>;
                        optionArray.push(optionObj);
                    });
                }
                _this.setState({optionArray});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },
    /**
     * 课程改变
     */
    courseSelectChange(){

    },

    findAdvance(){
        var _this = this;
        var param = {
            "method": 'findAdvance'
        };
        doWebService_CloudClassRoom(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                var imgCount=0;
                var imgColArray=[];
                var fileListArray=[];
                var selectValueArray=[];
                if(isEmpty(response)==false){
                    for(var i=1;i<=response.length;i++){
                        var advance = response[i-1];
                        var courseId = advance.courseId;
                        var id = advance.id;
                        var image = advance.image
                        var fileList =[];
                        if(isEmpty(image)==false){
                            var fileJson = {
                                uid: Math.random(),
                                url: image,
                            }
                            fileList.push(fileJson);
                        }
                        fileListArray.push(fileList);
                        selectValueArray.push(courseId);
                    }
                    _this.buildFileList(fileListArray);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    buildFileList(fileListArray){
        var fileList1;
        var fileList2;
        var fileList3;
        if(isEmpty(fileListArray)==false){
            fileList1 = fileListArray[0];
            fileList2 = fileListArray[1];
            fileList3 = fileListArray[2];
        }
        this.setState({fileList1,fileList2,fileList3});
    },

    courseSelectChange1(){},
    courseSelectChange2(){},
    courseSelectChange3(){},

    getRecommendImage1(){},
    getRecommendImage2(){},
    getRecommendImage3(){},

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {

        /*var fileJson = [{
            uid: Math.random(),
            url: "http://192.168.1.12:8080/elearning/images//lADO25B-hc0DAM0FVg_1366_768.jpg",
        }];*/
        var fileJson1 = this.state.fileList1;
        var fileJson2 = this.state.fileList2;
        var fileJson3 = this.state.fileList3;


        return (
            <div>
                <Row>
                    <Col span={8}>
                        <Card>
                            <CourseImageUploadComponents key={"courseImg1"} fileList={fileJson1} callBackParent={this.getRecommendImage1}></CourseImageUploadComponents>
                            <Select key ={"select1"} defaultValue={this.state.selectValue1}  value={this.state.courseId1} style={{ width: 120 }} onChange={this.courseSelectChange1}>
                                {this.state.optionArray}
                            </Select>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <CourseImageUploadComponents key={"courseImg2"} fileList={fileJson2} callBackParent={this.getRecommendImage2}></CourseImageUploadComponents>
                            <Select key ={"select2"} defaultValue={this.state.selectValue2}  value={this.state.courseId2} style={{ width: 120 }} onChange={this.courseSelectChange2}>
                                {this.state.optionArray}
                            </Select>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card>
                            <CourseImageUploadComponents key={"courseImg3"} fileList={fileJson3} callBackParent={this.getRecommendImage3}></CourseImageUploadComponents>
                            <Select key ={"select3"} defaultValue={this.state.selectValue3}  value={this.state.courseId3} style={{ width: 120 }} onChange={this.courseSelectChange3}>
                                {this.state.optionArray}
                            </Select>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    },
});

export default RecommendComponents;
