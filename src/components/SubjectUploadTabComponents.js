import React, { PropTypes } from 'react';
import { Tabs, Button,Radio } from 'antd';
import { Modal} from 'antd';
import { Slider } from 'antd';
import { Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox } from 'antd';
import { Upload,  message } from 'antd';
const Dragger = Upload.Dragger;
const FormItem = Form.Item;
import RichEditorComponents from './RichEditorComponents';
const RadioGroup = Radio.Group;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;
const plainOptions = ['A', 'B', 'C','D','E'];


const TabPane = Tabs.TabPane;

/*滑动输入框数据范围定义*/
const marks = {
    1: '1',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: {
        style: {
            color: 'red',
        },
        label: <strong></strong>,
    },
};

const props = {
    name: 'file',
    showUploadList: true,
    // action: 'http://101.201.45.125:8890/Excoord_Upload_Server/file/upload',
    action: 'http://www.maaee.com/Excoord_Upload_Server/file/upload',
    beforeUpload(file) {
        //alert(file);
        data:{file}
    },
    onChange(info) {
        if (info.file.status !== 'uploading') {
            console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully.`);
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    },
};
var mulitiAnswer = new Array();
const SubjectUploadTabComponents = Form.create()(React.createClass({
    getInitialState() {
        return {
            loading: false,
            visible: false,
            activeKey: '单选题',
            markSelected:6,
            score:1,
        };
    },
    showModal() {
        this.setState({
            visible: true,
        });
    },
    handleOk() {
        this.setState({ visible: false });
    },
    handleCancel() {
        this.setState({ visible: false });
    },

    handleEmail: function(val){
        this.props.callbackParent(val);
        //this.setState({lessonCount: val});
    },

    sliderOnChange(value) {
        console.log("sliderValue:"+value)
        this.setState({
            markSelected: value,
        });
    },

    selectHandleChange:function (value) {
        console.log(`selected ${value}`);
        this.setState({score:value});
    },

    doWebService : function(data,listener) {
        var service = this;
        //this.WEBSERVICE_URL = "http://192.168.2.103:8080/Excoord_For_Education/webservice";
        this.WEBSERVICE_URL = "http://www.maaee.com/Excoord_For_Education/webservice";
        if (service.requesting) {
            return;
        }
        service.requesting = true;
        $.post(service.WEBSERVICE_URL, {
            params : data
        }, function(result, status) {
            service.requesting = false;
            if (status == "success") {
                listener.onResponse(result);
            } else {
                listener.onError(result);
            }
        }, "json");
    },


    saveSubject(batchAddSubjectBeanJson){
        var param = {
            "method":'batchAddSubjects',
            "batchAddSubjectBeanJson":[batchAddSubjectBeanJson],
        };
        this.doWebService(JSON.stringify(param), {
            onResponse : function(ret) {
                console.log(ret.msg);
                if(ret.msg=="调用成功" && ret.response==true){
                    alert("题目添加成功");
                }else{
                    alert("题目添加失败");
                }
            },
            onError : function(error) {
                alert(error);
            }
        });
    },
    //单选题新增
    singleHandleSubmit(e) {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            var ident = sessionStorage.getItem("ident");
            var easy = this.state.markSelected;
            var score = this.state.score;
            var subjectName = values.subjectName;
            var answer = values.answer;
            // alert("params:"+this.props.params);
            var subjectParamArray = this.props.params.split("#");
            var ident = subjectParamArray[0];
            var ScheduleOrSubjectId = subjectParamArray[1];
            var optType = subjectParamArray[3];
            var batchAddSubjectBeanJson={"textTigan":subjectName,"textAnswer":answer,"score":score,"userId":ident,"type":"C"};
            if(optType=="bySubjectId"){
                batchAddSubjectBeanJson.knowledgePointId=ScheduleOrSubjectId;
            }
            // else{
            //     batchAddSubjectBeanJson.teachscheduleId = ScheduleOrSubjectId;
            // }
            // console.log("easy:"+easy);
            console.log("score:"+batchAddSubjectBeanJson.score);
            console.log("subjectName:"+batchAddSubjectBeanJson.textTigan);
            console.log("answer:"+batchAddSubjectBeanJson.textAnswer);
            console.log("batchAddSubjectBeanJson userId:"+batchAddSubjectBeanJson.userId);
            this.saveSubject(batchAddSubjectBeanJson);
        });
    },
    //多选题新增
    MulitiHandleSubmit(e) {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            var ident = sessionStorage.getItem("ident");
            var score = this.state.score;
            var subjectName = values.subjectName;
            var answer = mulitiAnswer;
            var subjectParamArray = this.props.params.split("#");
            var ident = subjectParamArray[0];
            var ScheduleOrSubjectId = subjectParamArray[1];
            var optType = subjectParamArray[3];
            var batchAddSubjectBeanJson={"textTigan":subjectName,"textAnswer":mulitiAnswer,"score":score,"userId":ident,"type":"MC"};
            if(optType=="bySubjectId"){
                batchAddSubjectBeanJson.knowledgePointId=ScheduleOrSubjectId;
            }
            console.log("score:"+batchAddSubjectBeanJson.score);
            console.log("subjectName:"+batchAddSubjectBeanJson.textTigan);
            console.log("answer:"+batchAddSubjectBeanJson.textAnswer);
            console.log("batchAddSubjectBeanJson userId:"+batchAddSubjectBeanJson.userId);
            this.saveSubject(batchAddSubjectBeanJson);
        });
    },
    //判断题新增
    correctHandleSubmit(e) {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            var ident = sessionStorage.getItem("ident");
            var easy = this.state.markSelected;
            var score = this.state.score;
            var subjectName = values.subjectName;
            var answer = values.correctAnswer;
            var subjectParamArray = this.props.params.split("#");
            var ident = subjectParamArray[0];
            var ScheduleOrSubjectId = subjectParamArray[1];
            var optType = subjectParamArray[3];
            var batchAddSubjectBeanJson={"textTigan":subjectName,"textAnswer":answer,"score":score,"userId":ident,"type":"J"};
            if(optType=="bySubjectId"){
                batchAddSubjectBeanJson.knowledgePointId=ScheduleOrSubjectId;
            }
            console.log("score:"+batchAddSubjectBeanJson.score);
            console.log("subjectName:"+batchAddSubjectBeanJson.textTigan);
            console.log("answer:"+batchAddSubjectBeanJson.textAnswer);
            console.log("batchAddSubjectBeanJson userId:"+batchAddSubjectBeanJson.userId);
            this.saveSubject(batchAddSubjectBeanJson);
        });
    },

    //简答题新增
    simpleAnswerHandleSubmit(e) {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            var ident = sessionStorage.getItem("ident");
            var easy = this.state.markSelected;
            var score = this.state.score;
            var subjectName = values.subjectName;
            var answer = values.answer;
            var subjectParamArray = this.props.params.split("#");
            var ident = subjectParamArray[0];
            var ScheduleOrSubjectId = subjectParamArray[1];
            var optType = subjectParamArray[3];
            var batchAddSubjectBeanJson={"textTigan":subjectName,"textAnswer":answer,"score":score,"userId":ident,"type":"S"};
            if(optType=="bySubjectId"){
                batchAddSubjectBeanJson.knowledgePointId=ScheduleOrSubjectId;
            }
            console.log("score:"+batchAddSubjectBeanJson.score);
            console.log("subjectName:"+batchAddSubjectBeanJson.textTigan);
            console.log("answer:"+batchAddSubjectBeanJson.textAnswer);
            console.log("batchAddSubjectBeanJson userId:"+batchAddSubjectBeanJson.userId);
            this.saveSubject(batchAddSubjectBeanJson);
        });
    },

    coverOnChange(info) {
        if (info.file.status !== 'uploading') {
            console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully.`);
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    },

    addScore:function () {
        var score = this.state.score;
        var newScore = parseInt(score)+parseFloat(0.5);
        console.log("newScore:"+newScore)
        this.setState({score:newScore});
    },

    mulitiAnswerOnChange:function (e) {
        if(e.target.checked==true){
            mulitiAnswer.push(e.target.value);
        }else{
            for(var i=0;i<mulitiAnswer.length;i++){
                if(mulitiAnswer[i]==e.target.value){
                    mulitiAnswer.splice(i,1);
                }
            }
        }

    },

    render() {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 3},
            wrapperCol: { span: 17 },
        };
        return (
            <div className="toobar">

                <Button type="" onClick={this.showModal}>题目</Button>
                <Modal
                    visible={this.state.visible}
                    title="添加题目"
                    className="ant-modal-width"
                    onCancel={this.handleCancel}
                    footer={[]}
                >
                    <Tabs
                        hideAdd
                        onChange={this.onChange}
                        defaultActiveKey={this.state.activeKey}
                        onEdit={this.onEdit}
                    >
                        <TabPane tab="单选题" key="单选题">
                            <Form horizontal onSubmit={this.singleHandleSubmit}>
                                <FormItem
                                    {...formItemLayout}
                                    label={(<span>题目</span>)}
                                    hasFeedback>
                                    {getFieldDecorator('subjectName', {
                                        rules: [{ required: true, message: '请输入题目!' }],
                                    })(
                                        <Input type="textarea" rows={4}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label={(<span>答案</span>)}
                                    hasFeedback>
                                    {getFieldDecorator('answer')(
                                        <RadioGroup onChange={this.onChange}>
                                            <Radio key="A" value="A">A</Radio>
                                            <Radio key="B" value="B">B</Radio>
                                            <Radio key="C" value="C">C</Radio>
                                            <Radio key="D" value="D">D</Radio>
                                        </RadioGroup>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label={(<span>分值</span>)}
                                    hasFeedback>
                                    {getFieldDecorator('score')(
                                        <div>
                                            <Select size="large" defaultValue={this.state.score} style={{ width: 100 }} onChange={this.selectHandleChange}>
                                                <Option value="1">1</Option>
                                                <Option value="2">2</Option>
                                                <Option value="5">5</Option>
                                                <Option value="10">10</Option>
                                            </Select>
                                            <Button type="primary" className="login-form-button" onClick={this.addScore}>
                                                +0.5
                                            </Button>
                                        </div>
                                    )}
                                </FormItem>
                                <FormItem>
                                    <Button type="primary" htmlType="submit" className="login-form-button">
                                        保存并继续添加
                                    </Button>
                                    <Button type="primary" htmlType="submit" className="login-form-button">
                                        保存并返回列表
                                    </Button>
                                </FormItem>
                            </Form>
                        </TabPane>


                        <TabPane tab="多选题" key="多选题"><div>
                            <Form horizontal onSubmit={this.MulitiHandleSubmit}>
                                <FormItem
                                    {...formItemLayout}
                                    label={(<span>题目</span>)}
                                    hasFeedback>
                                    {getFieldDecorator('subjectName', {
                                        rules: [{ required: true, message: '请输入题目!' }],
                                    })(
                                        <Input type="textarea" rows={4}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label={(<span>答案</span>)}
                                    hasFeedback>
                                    {getFieldDecorator('mulitiAnswer')(
                                        <div>
                                            <Checkbox value="A" onChange={this.mulitiAnswerOnChange}>A</Checkbox>
                                            <Checkbox value="B" onChange={this.mulitiAnswerOnChange}>B</Checkbox>
                                            <Checkbox value="C" onChange={this.mulitiAnswerOnChange}>C</Checkbox>
                                            <Checkbox value="D" onChange={this.mulitiAnswerOnChange}>D</Checkbox>
                                            <Checkbox value="E" onChange={this.mulitiAnswerOnChange}>E</Checkbox>
                                        </div>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label={(<span>分值</span>)}
                                    hasFeedback>
                                    {getFieldDecorator('score')(
                                        <div>
                                            <Select size="large" defaultValue={this.state.score} style={{ width: 100 }} onChange={this.selectHandleChange}>
                                                <Option value="1">1</Option>
                                                <Option value="2">2</Option>
                                                <Option value="5">5</Option>
                                                <Option value="10">10</Option>
                                            </Select>
                                            <Button type="primary" className="login-form-button" onClick={this.addScore}>
                                                +0.5
                                            </Button>
                                        </div>
                                    )}
                                </FormItem>
                                <FormItem>
                                    <Button type="primary" htmlType="submit" className="login-form-button">
                                        保存并继续添加
                                    </Button>
                                    <Button type="primary" htmlType="submit" className="login-form-button">
                                        保存并返回列表
                                    </Button>
                                </FormItem>
                            </Form>
                        </div></TabPane>

                        <TabPane tab="判断题" key="判断题"><div>
                            <Form horizontal onSubmit={this.correctHandleSubmit}>
                                <FormItem
                                    {...formItemLayout}
                                    label={(<span>题目</span>)}
                                    hasFeedback>
                                    {getFieldDecorator('subjectName', {
                                        rules: [{ required: true, message: '请输入题目!' }],
                                    })(
                                        <Input type="textarea" rows={4}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label={(<span>答案</span>)}
                                    hasFeedback>
                                    {getFieldDecorator('correctAnswer')(
                                        <RadioGroup onChange={this.onChange}>
                                            <Radio key="正确" value="正确">正确</Radio>
                                            <Radio key="错误" value="错误">错误</Radio>
                                        </RadioGroup>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label={(<span>分值</span>)}
                                    hasFeedback>
                                    {getFieldDecorator('score')(
                                        <div>
                                            <Select size="large" defaultValue={this.state.score} style={{ width: 100 }} onChange={this.selectHandleChange}>
                                                <Option value="1">1</Option>
                                                <Option value="2">2</Option>
                                                <Option value="5">5</Option>
                                                <Option value="10">10</Option>
                                            </Select>
                                            <Button type="primary" className="login-form-button" onClick={this.addScore}>
                                                +0.5
                                            </Button>
                                        </div>
                                    )}
                                </FormItem>
                                <FormItem>
                                    <Button type="primary" htmlType="submit" className="login-form-button">
                                        保存并继续添加
                                    </Button>
                                    <Button type="primary" htmlType="submit" className="login-form-button">
                                        保存并返回列表
                                    </Button>
                                </FormItem>
                            </Form>
                        </div></TabPane>

                        <TabPane tab="简答题" key="简答题"><div>
                            <Form horizontal onSubmit={this.simpleAnswerHandleSubmit}>
                                <FormItem
                                    {...formItemLayout}
                                    label={(<span>题目</span>)}
                                    hasFeedback>
                                    {getFieldDecorator('subjectName', {
                                        rules: [{ required: true, message: '请输入题目!' }],
                                    })(
                                        <Input type="textarea" rows={4}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label={(<span>答案</span>)}
                                    hasFeedback>
                                    {getFieldDecorator('answer', {
                                        rules: [{ required: true, message: '请输入题目!' }],
                                    })(
                                        <Input type="textarea" rows={4}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label={(<span>分值</span>)}
                                    hasFeedback>
                                    {getFieldDecorator('score')(
                                        <div>
                                            <Select size="large" defaultValue={this.state.score} style={{ width: 100 }} onChange={this.selectHandleChange}>
                                                <Option value="1">1</Option>
                                                <Option value="2">2</Option>
                                                <Option value="5">5</Option>
                                                <Option value="10">10</Option>
                                            </Select>
                                            <Button type="primary" className="login-form-button" onClick={this.addScore}>
                                                +0.5
                                            </Button>
                                        </div>
                                    )}
                                </FormItem>
                                <FormItem>
                                    <Button type="primary" htmlType="submit" className="login-form-button">
                                        保存并继续添加
                                    </Button>
                                    <Button type="primary" htmlType="submit" className="login-form-button">
                                        保存并返回列表
                                    </Button>
                                </FormItem>
                            </Form>
                        </div></TabPane>

                        <TabPane tab="材料题" key="材料题"><div>
                            <Form horizontal onSubmit={this.singleHandleSubmit}>
                                <FormItem
                                    {...formItemLayout}
                                    label={(<span>材料封面</span>)}
                                    hasFeedback>
                                    {getFieldDecorator('materialCover', {
                                        rules: [{ required: true, message: '请输入题目!' }],
                                    })(
                                        <div style={{ width: 346, height: 80 }}>
                                            <Dragger {...props}>
                                                <Icon type="plus" />
                                            </Dragger>
                                        </div>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label={(<span>材料文件</span>)}
                                    hasFeedback>
                                    {getFieldDecorator('materialFile', {
                                        rules: [{ required: true, message: '请输入题目!' }],
                                    })(
                                        <div style={{ width: 346, height: 80 }}>
                                            <Dragger {...props}>
                                                <Icon type="plus" />
                                            </Dragger>
                                        </div>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label={(<span>答案</span>)}
                                    hasFeedback>
                                    {getFieldDecorator('answer')(
                                        <RadioGroup onChange={this.onChange}>
                                            <Radio key="A" value="A">A</Radio>
                                            <Radio key="B" value="B">B</Radio>
                                            <Radio key="C" value="C">C</Radio>
                                            <Radio key="D" value="D">D</Radio>
                                        </RadioGroup>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label={(<span>分值</span>)}
                                    hasFeedback>
                                    {getFieldDecorator('score')(
                                        <div>
                                            <Select size="large" defaultValue={this.state.score} style={{ width: 100 }} onChange={this.selectHandleChange}>
                                                <Option value="1">1</Option>
                                                <Option value="2">2</Option>
                                                <Option value="5">5</Option>
                                                <Option value="10">10</Option>
                                            </Select>
                                            <Button type="primary" className="login-form-button" onClick={this.addScore}>
                                                +0.5
                                            </Button>
                                        </div>
                                    )}
                                </FormItem>
                                <FormItem>
                                    <Button type="primary" htmlType="submit" className="login-form-button">
                                        保存并继续添加
                                    </Button>
                                    <Button type="primary" htmlType="submit" className="login-form-button">
                                        保存并返回列表
                                    </Button>
                                </FormItem>
                            </Form>
                        </div></TabPane>
                    </Tabs>
                </Modal>
            </div>
        );
    },
}));

export default SubjectUploadTabComponents;
