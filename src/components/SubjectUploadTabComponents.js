import React, { PropTypes } from 'react';
import { Tabs, Button,Radio } from 'antd';
import { Modal} from 'antd';
import { Slider } from 'antd';
import { Form, Input, Tooltip, Icon, Cascader, Select, Row, Col, Checkbox } from 'antd';
const FormItem = Form.Item;
import RichEditorComponents from './RichEditorComponents';
const RadioGroup = Radio.Group;
const Option = Select.Option;


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

    singleHandleSubmit(e) {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            var ident = "23836";
            var easy = this.state.markSelected;
            var score = this.state.score;
            var subjectName = values.subjectName;
            var answer = values.answer;
            console.log("easy:"+easy);
            console.log("score:"+score);
            console.log("subjectName:"+subjectName);
            console.log("answer:"+answer);
        });
    },

    addScore:function () {
        var score = this.state.score;
        var newScore = parseInt(score)+parseFloat(0.5);
        console.log("newScore:"+newScore)
        this.setState({score:newScore});
    },

    render() {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 3},
            wrapperCol: { span: 17 },
        };
        return (
            <div className="toobar">

                <Button type="primary" onClick={this.showModal}>题目</Button>
                <Modal
                    visible={this.state.visible}
                    title="添加题目"
                    width="616"
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
                                    label={(
                                        <span>难度</span>
                                    )}
                                    hasFeedback>
                                    {getFieldDecorator('easy')(
                                        <div style={{width:400}}>易&nbsp;<Slider marks={marks} defaultValue={this.state.markSelected} onChange={this.sliderOnChange} step={1} max={7} min={1} />&nbsp;难</div>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label={(<span>题目</span>)}
                                    hasFeedback>
                                    {getFieldDecorator('subjectName', {
                                        rules: [{ required: true, message: '请输入题目!' }],
                                    })(
                                        <Input/>
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
                        <TabPane tab="多选题" key="多选题"><div>多选题</div></TabPane>
                        <TabPane tab="判断题" key="判断题"><div>判断题</div></TabPane>
                        <TabPane tab="简答题" key="简答题"><div>简答题</div></TabPane>
                        <TabPane tab="材料题" key="材料题"><div>材料题</div></TabPane>
                    </Tabs>
                </Modal>
            </div>
        );
    },
}));

export default SubjectUploadTabComponents;
