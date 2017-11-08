import React, {PropTypes} from 'react';
import {isEmpty} from '../../utils/utils';
import {createUUID} from '../../utils/utils';
import {
    Button, Table, Icon, Row, Col,
    Input, Select, Checkbox, message, Tag, Tooltip
} from 'antd';
import ChangeShiftModel from './ChangeShiftModel'
import ChooseMemberModal from './ChooseMemberModal'
import ConfirmModal from '../ConfirmModal'

var posDetilArr = [];

const columns = [{
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    className: 'checking_in_date',
}, {
    title: '人数',
    dataIndex: 'num',
    key: 'num',
    className: 'ant-table-selection-user2 class_right date_tr',
}, {
    title: '考勤时间',
    dataIndex: 'time',
    key: 'time',
    className: 'checking_in_name',
}, {
    title: '操作',
    className: 'ant-table-selection-smallclass checking_in_operate class_right',
    key: 'action',
    render: (text, record) => (
        <span>
            <Button type="button" className="score3_i" icon="edit"></Button>
           <Button type="button" icon="delete"></Button>
    </span>
    ),
}];

const workDayCol = [{
    title: '工作日',
    dataIndex: 'workday',
    key: 'workday',
}, {
    title: '班次时间段',
    dataIndex: 'worktime',
    key: 'worktime',
}, {
    title: '操作',
    key: 'action',
    className: 'checking_in_change',
    render: (text, record) => (
        <span>
            <a href="javascript:;">更改班次</a>
        </span>
    ),
}];

const workPositionCol = [{
    title: '考勤地址',
    dataIndex: 'workpos',
    key: 'workpos',
}, {
    title: '操作',
    key: 'action',
    render: (text, record) => (
        <span>
      <a href="#">删除</a>
    </span>
    ),
}];

//假数据
const positionData = [{
    key: 1,
    workpos: '陕西省西安市未央区汉城街道惠西第二保育院',
}, {
    key: 2,
    workpos: '陕西省西安市未央区汉城街道惠西第一保育院',
}];

//假数据
const workdate = [{
    key: 1,
    workday: '周一',
    worktime: '休息',
}, {
    key: 2,
    workday: '周二',
    worktime: '休息',
}, {
    key: 3,
    workday: '周三',
    worktime: '休息',
}, {
    key: 4,
    workday: '周四',
    worktime: '休息',
}, {
    key: 5,
    workday: '周五',
    worktime: '休息',
}, {
    key: 6,
    workday: '周六',
    worktime: '休息',
}, {
    key: 7,
    workday: '周日',
    worktime: '休息',
}];

//假数据
const data = [{
    key: '1',
    name: 'A',
    num: '32人',
    time: '每周一、二、三、四、五、六、日',
}, {
    key: '2',
    name: 'B',
    num: '12人',
    time: '每周一、二、四、五、六、日',
}, {
    key: '3',
    name: 'C',
    num: '23人',
    time: '每周一、二、三、四、日',
}];

const AttendanceManagement = React.createClass({

    getInitialState() {
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        return {
            loginUser: loginUser,
            optType: true,
            attName: "",//考勤组名称
            selectedRowKeys: [1, 2, 3, 4, 5], //默认选中的天数
            changeShiftIsShow: false,
            tags: ['水电费', '水电', '电费', '水费', '火电费', '火费', '大熟', '海燕风', '的撒大', '它犹如', '欧皮带', '的型从',],
            inputVisible: false,
            inputValue: '',
            chooseMemberModalIsShow: false,
            // posDetil: '',    //考勤详细地址
            posDetilArr: [],
        };
    },

    componentDidMount() {
        window.__setPos__ = this.setPos;
    },

    componentWillReceiveProps(nextProps) {

    },

    //接收坐标
    /*checkPos(e) {
        var arr = e.split('$');
        var posDetil = arr[1];   //详细地址
        var locationPoint = arr[0];   //坐标
        // console.log(posDetil);
        // console.log(locationPoint);
        //e中存着地理信息会不断传过来，把信息存在本地中，向table数组存完就清空本地。
        // this.setState({posDetil});   //考勤详细地址
    },*/

    setPos(e) {
        var arr = e.split('$');
        var posDetil = arr[1];   //详细地址
        var locationPoint = arr[0];   //坐标
        var num = createUUID();   //随机数

        // console.log(posDetil);
        // console.log(locationPoint);
        // console.log(num);

        var posDetil = {
            key: locationPoint,
            workpos: posDetil,
        };
        posDetilArr.push(posDetil);
        this.setState({posDetilArr});
    },

    //增加考勤组
    addAtt() {
        this.setState({optType: false});
    },

    //返回到主table
    returnTable() {
        this.setState({optType: true});
    },

    //考勤组输入框输入的回调
    attNameOnChange(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var attName = target.value;
        if (attName.length > 20) {
            message.error("考勤组名称不能超过20个字符");
            return;
        }
        //设置考勤组名称
        this.setState({attName});
    },

    /**
     * 更改班次的回调
     */
    changeShift() {
        this.setState({changeShiftIsShow: true});
    },

    /**
     * model关闭之后将addShiftModalIsShow重置
     */
    closeModel() {
        this.setState({changeShiftIsShow: false, chooseMemberModalIsShow: false});
    },

    /**
     * 添加考勤地点的回调
     */
    addShiftPos() {
        this.props.mapShow();
    },

    /**
     * 选择考勤参与人的回调
     */
    chooseMember() {
        this.setState({chooseMemberModalIsShow: true});
    },

    handleClose(removedTag) {
        const tags = this.state.tags.filter(tag => tag !== removedTag);
        console.log(tags);
        this.setState({tags});
    },

    handleInputChange(e) {
        this.setState({inputValue: e.target.value});
    },

    handleInputConfirm() {
        const state = this.state;
        const inputValue = state.inputValue;
        let tags = state.tags;
        if (inputValue && tags.indexOf(inputValue) === -1) {
            tags = [...tags, inputValue];
        }
        console.log(tags);
        this.setState({
            tags,
            inputVisible: false,
            inputValue: '',
        });
    },

    // saveInputRef = input => this.input = input

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        const {tags, inputVisible, inputValue} = this.state;
        //顶部banner
        var title;
        //页面主体部分
        var mainTable;
        //保存按钮
        var saveButton = <Button type="primary">保存设置</Button>;
        const rowSelection = {
            selectedRowKeys: this.state.selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
            },
            getCheckboxProps: record => ({
                disabled: record.name === 'Disabled User', // Column configuration not to be checked
            }),
        };

        //表单元素
        var stepPanel = <div>
            <div className="checking_add_box checking_in_31">
                <Row>
                    <Col span={4} className="knowledge_ri knowledge_ri_8">考勤组名称：</Col>
                    <Col span={10}>
                        <Input placeholder="请输入考勤组名称" value={this.state.attName} onChange={this.attNameOnChange}/>
                    </Col>
                </Row>
                <Row className="upexam_to_ma">
                    <Col span={4} className="knowledge_ri knowledge_ri_8">参与考勤人员：</Col>
                    <Col span={18}>
                            <span>
                                {tags.map((tag, index) => {
                                    const isLongTag = tag.length > 20;
                                    const tagElem = (
                                        <Tag key={tag} closable={index !== -1} afterClose={() => this.handleClose(tag)}>
                                            {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                                        </Tag>
                                    );
                                    return isLongTag ? <Tooltip title={tag}>{tagElem}</Tooltip> : tagElem;
                                })}
                                {inputVisible && (
                                    <Input
                                        ref={this.saveInputRef}
                                        type="text"
                                        size="small"
                                        style={{width: 78}}
                                        value={inputValue}
                                        onChange={this.handleInputChange}
                                        onBlur={this.handleInputConfirm}
                                        onPressEnter={this.handleInputConfirm}
                                    />
                                )}
                            </span>
                        <Button className="btn_tag" onClick={this.chooseMember}>请选择</Button>
                    </Col>
                </Row>
                <Row className="upexam_to_ma">
                    <Col span={4} className="knowledge_ri knowledge_ri_8">无需考勤人员：</Col>
                    <Col span={18}>
                            <span>
                                {tags.map((tag, index) => {
                                    const isLongTag = tag.length > 20;
                                    const tagElem = (
                                        <Tag key={tag} closable={index !== -1} afterClose={() => this.handleClose(tag)}>
                                            {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                                        </Tag>
                                    );
                                    return isLongTag ? <Tooltip title={tag}>{tagElem}</Tooltip> : tagElem;
                                })}
                                {inputVisible && (
                                    <Input
                                        ref={this.saveInputRef}
                                        type="text"
                                        size="small"
                                        style={{width: 78}}
                                        value={inputValue}
                                        onChange={this.handleInputChange}
                                        onBlur={this.handleInputConfirm}
                                        onPressEnter={this.handleInputConfirm}
                                    />
                                )}
                            </span>
                        <Button className="btn_tag" onClick={this.chooseMember}>请选择</Button>
                    </Col>
                </Row>
                <Row className="upexam_to_ma">
                    <Col span={4} className="knowledge_ri knowledge_ri_8">考勤组负责人：</Col>
                    <Col span={18}>
                            <span>
                                {tags.map((tag, index) => {
                                    const isLongTag = tag.length > 20;
                                    const tagElem = (
                                        <Tag key={tag} closable={index !== -1} afterClose={() => this.handleClose(tag)}>
                                            {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                                        </Tag>
                                    );
                                    return isLongTag ? <Tooltip title={tag}>{tagElem}</Tooltip> : tagElem;
                                })}
                                {inputVisible && (
                                    <Input
                                        ref={this.saveInputRef}
                                        type="text"
                                        size="small"
                                        style={{width: 78}}
                                        value={inputValue}
                                        onChange={this.handleInputChange}
                                        onBlur={this.handleInputConfirm}
                                        onPressEnter={this.handleInputConfirm}
                                    />
                                )}
                            </span>
                        <Button className="btn_tag" onClick={this.chooseMember}>请选择</Button>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <span className="password_ts checking_in_le">协助管理员分管本考勤组的排班及统计</span>
                    </Col>
                </Row>
                <Row>
                    <Col span={4} className="knowledge_ri knowledge_ri_8">工作日设置：</Col>
                    <Col span={10}>
                        <span>默认班次：9:00--18:00</span>
                        <a href="javascript:;" onClick={this.changeShift} className="add_out">更改班次</a>
                    </Col>
                </Row>

                <Table columns={workDayCol} dataSource={workdate} pagination={false} rowSelection={rowSelection}
                       className="upexam_to_ma ant-col-20 checking_in_le"/>

                <Row className="upexam_to_ma">
                    <Col span={4} className="knowledge_ri knowledge_ri_8">考勤地址：</Col>
                    <Col span={11}>根据办公地点考勤（可添加多个考勤地点）有效范围</Col>
                    <Col span={6}>
                        <Select style={{width: 75}} defaultValue="300米">
                            <Option value="100">100米</Option>
                            <Option value="200">200米</Option>
                            <Option value="300">300米</Option>
                            <Option value="400">400米</Option>
                            <Option value="500">500米</Option>
                            <Option value="600">600米</Option>
                            <Option value="700">700米</Option>
                            <Option value="800">800米</Option>
                        </Select>
                    </Col>
                </Row>

                {/*考勤地址table*/}
                <Table className="upexam_to_ma ant-col-20 checking_in_le" columns={workPositionCol}
                       dataSource={this.state.posDetilArr} pagination={false}/>
                <div className="checking_in_le">
                    <a className="upexam_to_ma checking_in_l31" href="javascript:;"
                       onClick={this.addShiftPos}>添加考勤地点</a>
                    <br/>
                    <Checkbox className="checking_in_l31">允许外勤打卡</Checkbox>
                    <div className="checking_in_l31 password_ts">关闭后，范围外不允许打卡</div>
                </div>

            </div>
        </div>

        if (this.state.optType) {
            title = <div className="public—til—blue">考勤详情</div>;
            mainTable =
                <div className="favorite_scroll" style={{overflow: "auto"}}>
                    <div className="checking_add_box">
                        <div>
                            <Button type="primary" icon="plus" onClick={this.addAtt}>新增考勤组</Button>
                        </div>
                        <Table className="checking_in_box cloud_box upexam_to_ma " columns={columns} dataSource={data}
                               pagination={false}/>
                    </div>
                </div>;
        } else {
            title = <div className="public—til—blue">
                <div className="ant-tabs-right">
                    <Button onClick={this.returnTable}><Icon type="left"/></Button>
                </div>
                考勤详情
            </div>;

            mainTable =
                <div className="favorite_scroll" style={{overflow: "auto"}}>
                    {/*表单提交*/}
                    {stepPanel}
                    <div>
                        <Row>
                            <Col span={24} className="class_right yinyong_topic">
                                {saveButton}
                            </Col>
                        </Row>
                    </div>
                </div>;
        }

        return (
            <div className="group_cont">
                {title}
                {mainTable}
                <ChangeShiftModel
                    isShow={this.state.changeShiftIsShow}
                    closeModel={this.closeModel}
                />
                <ChooseMemberModal
                    isShow={this.state.chooseMemberModalIsShow}
                    onCancel={this.closeModel}
                />
                <ConfirmModal
                    ref="confirmModal"
                    title="确定要删除考勤组?"
                    onConfirmModalCancel={this.closeConfirmModal}
                    onConfirmModalOK={this.batchDeleteMemeber}
                />
            </div>
        );
    }
});

export default AttendanceManagement;
