import React, {PropTypes} from 'react';
import {isEmpty} from '../../utils/utils';
import {
    Button, Table, Icon, Row, Col, Card, Steps,
    Input, Select, Radio, Checkbox, message
} from 'antd';
import ChangeShiftModel from './ChangeShiftModel'
import AddShiftPosModel from './AddShiftPosModel'

const Option = Select.Option;

const columns = [{
    title: '名称',
    dataIndex: 'name',
    key: 'name',
}, {
    title: '人数',
    dataIndex: 'num',
    key: 'num',
}, {
    title: '考勤时间',
    dataIndex: 'time',
    key: 'time',
}, {
    title: '操作',
    key: 'action',
    render: (text, record) => (
        <span>
      <a href="#">编辑</a>
      <span className="ant-divider"/>
      <a href="#">删除</a>
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
            addShiftPosModel: false,
        };
    },

    componentDidMount() {

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
        this.setState({changeShiftIsShow: false, addShiftPosModel: false});
    },

    /**
     * 添加考勤地点的回调
     */
    addShiftPos() {
        this.setState({addShiftPosModel: true});
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
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
            <Row>
                <Col span={4}>考勤组名称：</Col>
                <Col span={10}>
                    <Input placeholder="请输入考勤组名称" value={this.state.attName} onChange={this.attNameOnChange}/>
                </Col>
            </Row>

            <Row>
                <Col span={4}>参与考勤人员：</Col>
                <Col span={18}>
                    <Button>请选择</Button>
                </Col>
            </Row>
            <Row>
                <Col span={4}>无需考勤人员：</Col>
                <Col span={18}>
                    <Button>请选择</Button>
                </Col>
            </Row>
            <Row>
                <Col span={4}>考勤组负责人：</Col>
                <Col span={18}>
                    <Button>请选择</Button>
                </Col>
            </Row>
            <span>协助管理员分管本考勤组的排班及统计</span>
            <Row>
                <Col span={4}>工作日设置：</Col>
                <Col span={10}>
                    <span>默认班次：9:00--18:00</span><a href="javascript:;" onClick={this.changeShift}>更改班次</a>
                </Col>
            </Row>

            <Table columns={workDayCol} dataSource={workdate} pagination={false} rowSelection={rowSelection}/>

            <Row>
                <Col span={4}>考勤地址：</Col>
                <Col span={10}>根据办公地点考勤（可添加多个考勤地点）有效范围</Col>
                <Col span={6}>
                    <Select style={{width: 75}} defaultValue="300米">
                        <Option value="jack">300米</Option>
                        <Option value="lucy">500米</Option>
                        <Option value="Yiminghe">800米</Option>
                    </Select>
                </Col>
            </Row>

            <Table columns={workPositionCol} dataSource={positionData} pagination={false}/>

            <a href="javascript:;" onClick={this.addShiftPos}>添加考勤地点</a>

            <br/>

            <Checkbox>允许外勤打卡</Checkbox>
            <div>关闭后，范围外不允许打卡</div>
        </div>;


        if (this.state.optType) {
            title = <div className="public—til—blue">考勤详情</div>;

            mainTable =
                <div>
                    <Button type="primary" icon="plus" onClick={this.addAtt}>新增考勤组</Button>
                    <Table columns={columns} dataSource={data} pagination={false}/>
                </div>;
        } else {
            title = <div className="public—til—blue">
                <div className="ant-tabs-right">
                    <Button onClick={this.returnTable}><Icon type="left"/></Button>
                    考勤详情
                </div>
            </div>;

            mainTable =
                <div className="favorite_scroll" style={{overflow: "auto", height: 510}}>
                    {/*表单提交*/}
                    {stepPanel}
                    <div>
                        <Row>
                            <Col span={24}>
                                {saveButton}
                            </Col>
                        </Row>
                    </div>
                </div>;
        }

        return (
            <div>
                <div className="talk_ant_btn">
                    {title}
                </div>
                {mainTable}
                <ChangeShiftModel
                    isShow={this.state.changeShiftIsShow}
                    closeModel={this.closeModel}
                />
                <AddShiftPosModel
                    isShow={this.state.addShiftPosModel}
                    closeModel={this.closeModel}
                />
            </div>
        );
    }
});

export default AttendanceManagement;
