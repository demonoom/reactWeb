import React, {PropTypes} from 'react';
import OpenNewPage from '../OpenNewPage'
import {isEmpty} from '../../utils/utils';
import {Modal, Icon, Input, Button, Row, Col, message, Radio, TimePicker} from 'antd';
import moment from 'moment';

const AddShiftModel = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,
            isShow: false,
            shiftName: '',
            size: "one",
            firTime: "block",
            secTime: "none",
            thiTime: "none",
        };
    },

    componentDidMount() {

    },

    componentWillReceiveProps(nextProps) {
        this.setState({isShow: nextProps.isShow});
    },

    /**
     * 确定的回调
     */
    handleOk() {
        alert('确定');
    },

    /**
     * 关闭model的回调
     */
    closeAddShiftModal() {
        this.setState({
            isShow: false,
            shiftName: '',
            size: "one",
            secTime: "none",
            thiTime: "none"
        });
        this.props.closeModel();
    },

    shiftNameChange(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var shiftName = target.value;
        if (shiftName.length > 6) {
            message.error("考勤组名称不能超过6个字符");
            return;
        }
        //设置考勤组名称
        this.setState({shiftName});
    },

    degreeChange(e) {
        this.setState({size: e.target.value});
        if (e.target.value == "two") {
            this.setState({secTime: "block", thiTime: "none"});
        } else if (e.target.value == "thr") {
            this.setState({secTime: "block", thiTime: "block"});
        } else {
            this.setState({secTime: "none", thiTime: "none"});
        }
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        const format = 'HH:mm';
        var firTime = this.state.firTime;
        var secTime = this.state.secTime;
        var thiTime = this.state.thiTime;

        return (
            <Modal
                title="新增班次"
                visible={this.state.isShow}
                width={685}
                transitionName=""  //禁用modal的动画效果
                closable={true}     //设置显示右上角的关闭按钮（但是需要调整颜色，否则白色会无法显示）
                maskClosable={false} //设置不允许点击蒙层关闭
                onCancel={this.closeAddShiftModal}
                onOk={this.handleOk}
                className="schoolgroup_modal checking_in_modal"
            >
                <div className="modal_register_main">
                    <Row>
                        <Col span={4}>
                            班次名称：
                        </Col>
                        <Col span={10}>
                            <Input placeholder="必填 (最多6个字符)" value={this.state.shiftName}
                                   onChange={this.shiftNameChange}/>
                        </Col>
                    </Row>
                    <div>
                            <span>设置该班次一天内上下班的次数</span>
                            <span className="add_out off_duty">
                                <Radio.Group value={this.state.size} onChange={this.degreeChange}>
                                    <Radio.Button value="one">一天1次上下班</Radio.Button>
                                    <Radio.Button value="two">一天2次上下班</Radio.Button>
                                    <Radio.Button value="thr">一天3次上下班</Radio.Button>
                                </Radio.Group>
                                </span>
                        </div>

                    <div className="upexam_to_ma" style={{display: firTime}}>
                        <span>
                            <span>第1次</span>
                            <span>上班：</span>
                            <TimePicker defaultValue={moment('12:08', format)} format={format}/>
                        </span>
                        <span className="botton_left1">
                            <span>下班：</span>
                            <TimePicker defaultValue={moment('12:08', format)} format={format}/>
                        </span>
                    </div>
                    <div className="upexam_to_ma" style={{display: secTime}}>
                        <span>
                            <span>第2次</span>
                            <span>上班：</span>
                            <TimePicker defaultValue={moment('12:08', format)} format={format}/>
                        </span>
                        <span className="botton_left1">
                            <span>下班：</span>
                            <TimePicker defaultValue={moment('12:08', format)} format={format}/>
                        </span>
                    </div>
                    <div className="upexam_to_ma" style={{display: thiTime}}>
                        <span>
                            <span>第3次</span>
                            <span>上班：</span>
                            <TimePicker defaultValue={moment('12:08', format)} format={format}/>
                        </span>
                        <span className="botton_left1">
                            <span>下班：</span>
                            <TimePicker defaultValue={moment('12:08', format)} format={format}/>
                        </span>
                    </div>
                </div>
            </Modal>
        );
    }
});

export default AddShiftModel;
