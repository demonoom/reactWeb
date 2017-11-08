import React, {PropTypes} from 'react';
import {isEmpty} from '../../utils/utils';
import {Modal, Icon, Input, Button, Row, Col, message, Radio, TimePicker, Checkbox, Select} from 'antd';
import moment from 'moment';

const Option = Select.Option;

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
            //上班时间，从09到22
            oneTime: '09:00',
            twoTime: '12:00',
            thrTime: '14:00',
            fouTime: '18:00',
            fivTime: '19:00',
            sixTime: '22:00',
            unknowTime: '18:00',
            checked: false,
            playDaychecked: false,
            timeSet: 'none',
        }
            ;
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
            thiTime: "none",
            checked: false,
            playDaychecked: false,
        });
        this.props.closeModel();
        document.getElementById('isPlayDayOnChange').style.display = 'block';
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

    /**
     * 上下班次数改变的回调
     * @param e
     */
    degreeChange(e) {
        this.setState({size: e.target.value});//改变选中班次的高亮
        if (e.target.value == "two") {
            this.setState({secTime: "block", thiTime: "none", unknowTime: "12:00"});
            this.state.unknowTime = '12:00';
        } else if (e.target.value == "thr") {
            this.setState({secTime: "block", thiTime: "block"});
        } else {
            this.setState({secTime: "none", thiTime: "none", unknowTime: "18:00"});
        }
    },

    /**
     * 打卡时段设置的回调
     * @param e
     */
    checkboxOnChange(e) {
        this.setState({playDaychecked: e.target.checked});
        console.log(`checked = ${e.target.checked}`);
        if (e.target.checked) {
            this.setState({timeSet: 'inline-block'});
        } else {
            this.setState({timeSet: 'none'});
        }
    },

    /**
     * 是否为休息日的回调
     * @constructor
     */
    IsPlayDayOnChange(e) {
        // console.log(`checked = ${e.target.checked}`);
        this.setState({checked: e.target.checked});
        if (e.target.checked) {
            document.getElementById('isPlayDayOnChange').style.display = 'none';
            this.setState({shiftName: '休息日'})
        } else {
            document.getElementById('isPlayDayOnChange').style.display = 'block';
            this.setState({shiftName: ''})
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
        var timeSet = this.state.timeSet;

        return (
            <Modal
                title="新增班次"
                visible={this.state.isShow}
                width={800}
                transitionName=""  //禁用modal的动画效果
                closable={true}     //设置显示右上角的关闭按钮（但是需要调整颜色，否则白色会无法显示）
                maskClosable={false} //设置不允许点击蒙层关闭
                onCancel={this.closeAddShiftModal}
                onOk={this.handleOk}
                className="schoolgroup_modal checking_in_modal"
            >
                <div className="modal_register_main">
                    <Row>
                        <Col span={3} className="add_padding">
                            班次名称：
                        </Col>
                        <Col span={6}>
                            <Input placeholder="必填" value={this.state.shiftName}
                                   onChange={this.shiftNameChange}/>
                        </Col>
                        {/*<Col span={9} className="add_study-d-le1 add_padding">*/}
                            {/*<Checkbox onChange={this.IsPlayDayOnChange} checked={this.state.checked}>是否为休息日</Checkbox>*/}
                        {/*</Col>*/}
                    </Row>
                    <div className="row-t-f">
                        <Col className="password_ts checking_in_le2">最多6个字符（中英文或数字）</Col>
                    </div>
                    <div id="isPlayDayOnChange">
                        <div>
                        <span>设置该班次一天内上下班的次数</span>
                        <span className="add_out off_duty">
                        <Radio.Group value={this.state.size} onChange={this.degreeChange}>
                        <Radio.Button value="one">一天1次上下班</Radio.Button>
                        <Radio.Button value="two">一天2次上下班</Radio.Button>
                        <Radio.Button value="thr">一天3次上下班</Radio.Button>
                        </Radio.Group>
                        </span>
                        <Checkbox onChange={this.checkboxOnChange}
                        checked={this.state.playDaychecked} className="add_study-d-le1 span_link_img">打卡时段设置</Checkbox>
                        </div>

                        <div className="upexam_to_ma" style={{display: firTime}}>
                        <span>
                            <span className="info_school_s">第1次</span>
                            <span>上班：</span>
                            <TimePicker defaultValue={moment(this.state.oneTime, format)} format={format}/>
                            <span style={{display: timeSet}} className="ding_left_1">
                                <span>
                                <Select defaultValue="--" style={{width: 65}}>
                                  <Option value="--">--</Option>
                                  <Option value="10">10</Option>
                                  <Option value="20">20</Option>
                                  <Option value="30">30</Option>
                                  <Option value="40">40</Option>
                                  <Option value="50">50</Option>
                                  <Option value="60">60</Option>
                                </Select>
                           </span>
                            <span className="ding_left_1">分钟前开始打卡</span>
                            </span>
                        </span>
                            <span className="favorite_pa_le">
                            <span>下班：</span>
                            <TimePicker value={moment(this.state.unknowTime, format)} format={format}/>
                            <span style={{display: timeSet}} className="ding_left_1">
                                <span>
                                    <Select defaultValue="--" style={{width: 65}}>
                                      <Option value="--">--</Option>
                                      <Option value="10">10</Option>
                                      <Option value="20">20</Option>
                                      <Option value="30">30</Option>
                                      <Option value="40">40</Option>
                                      <Option value="50">50</Option>
                                      <Option value="60">60</Option>
                                    </Select>
                                </span>
                            <span className="ding_left_1">分钟后结束打卡</span>
                            </span>
                        </span>
                        </div>
                        <div className="upexam_to_ma" style={{display: secTime}}>
                        <span>
                            <span className="info_school_s">第2次</span>
                            <span>上班：</span>
                            <TimePicker defaultValue={moment(this.state.thrTime, format)} format={format}/>
                            <span style={{display: timeSet}} className="ding_left_1">
                                <span>
                                <Select defaultValue="--" style={{width: 65}}>
                                  <Option value="--">--</Option>
                                  <Option value="10">10</Option>
                                  <Option value="20">20</Option>
                                  <Option value="30">30</Option>
                                  <Option value="40">40</Option>
                                  <Option value="50">50</Option>
                                  <Option value="60">60</Option>
                                </Select>
                           </span>
                            <span className="ding_left_1">分钟前开始打卡</span>
                            </span>
                        </span>
                            <span className="favorite_pa_le">
                            <span>下班：</span>
                            <TimePicker defaultValue={moment(this.state.fouTime, format)} format={format}/>
                            <span style={{display: timeSet}} className="ding_left_1">
                                <span>
                                <Select defaultValue="--" style={{width: 65}}>
                                  <Option value="--">--</Option>
                                  <Option value="10">10</Option>
                                  <Option value="20">20</Option>
                                  <Option value="30">30</Option>
                                  <Option value="40">40</Option>
                                  <Option value="50">50</Option>
                                  <Option value="60">60</Option>
                                </Select>
                           </span>
                            <span className="ding_left_1">分钟后结束打卡</span>
                            </span>
                        </span>
                        </div>
                        <div className="upexam_to_ma" style={{display: thiTime}}>
                        <span>
                            <span className="info_school_s">第3次</span>
                            <span>上班：</span>
                            <TimePicker defaultValue={moment(this.state.fivTime, format)} format={format}/>
                            <span style={{display: timeSet}} className="ding_left_1">
                                <span>
                                <Select defaultValue="--" style={{width: 65}}>
                                  <Option value="--">--</Option>
                                  <Option value="10">10</Option>
                                  <Option value="20">20</Option>
                                  <Option value="30">30</Option>
                                  <Option value="40">40</Option>
                                  <Option value="50">50</Option>
                                  <Option value="60">60</Option>
                                </Select>
                           </span>
                            <span className="ding_left_1">分钟前开始打卡</span>
                            </span>
                        </span>
                            <span className="favorite_pa_le">
                            <span>下班：</span>
                            <TimePicker defaultValue={moment(this.state.sixTime, format)} format={format}/>
                            <span style={{display: timeSet}} className="ding_left_1">
                                <span>
                                <Select defaultValue="--" style={{width: 65}}>
                                  <Option value="--">--</Option>
                                  <Option value="10">10</Option>
                                  <Option value="20">20</Option>
                                  <Option value="30">30</Option>
                                  <Option value="40">40</Option>
                                  <Option value="50">50</Option>
                                  <Option value="60">60</Option>
                                </Select>
                           </span>
                            <span className="ding_left_1">分钟后结束打卡</span>
                            </span>
                        </span>
                        </div>
                    </div>
                </div>
            </Modal>
        );
    }
});

export default AddShiftModel;
