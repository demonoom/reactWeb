import React, {PropTypes} from 'react';
import {isEmpty} from '../../utils/utils';
import {
    Button, Table, Icon, Row, Col,
    Input, Select, Checkbox, message, Tag, Tooltip
} from 'antd';
import ChangeShiftModel from './ChangeShiftModel'
import ChooseMemberModal from './ChooseMemberModal'
import ConfirmModal from '../ConfirmModal'

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
            joinAttMer: [],
            outAttMer: [],
            attPerson: [],
            inputVisible: false,
            inputValue: '',
            chooseMemberModalIsShow: false,
            // posDetil: '',    //考勤详细地址
            posDetilArr: [],   //考勤详细地址包括坐标，对象
            posArr: [],
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

    /**
     * 删除考勤地点的回调
     * @param record
     */
    delPos(record) {
        //1.在页面删除
        var arr = this.state.posDetilArr;
        arr.forEach(function (v, i) {
            if (v.key == record.key) {
                arr.splice(i, 1);
                return
            }
        })
        this.setState({posDetilArr: arr});
        //2.在最后向后台传的数据中删除
    },

    setPos(e) {
        var arr = e.split('$');
        var posDetil = arr[1];   //详细地址
        var locationPoint = arr[0];   //坐标
        var posArr = this.state.posArr;


        var posDetil = {
            key: locationPoint,
            workpos: posDetil,
        };
        posArr.push(posDetil);
        this.setState({posDetilArr: posArr});
    },

    //增加考勤组
    addAtt() {
        this.setState({optType: false});
    },

    //返回到主table
    returnTable() {
        this.setState({optType: true});
        //初始化
        this.setState({posArr: []})
        this.setState({posDetilArr: []});
        this.setState({joinAttMer: []});
        this.setState({outAttMer: []});
        this.setState({attPerson: []});
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

    addGroupMember(ids, name, num) {
        console.log(ids);
        console.log(name);
        console.log(num);
        //这个局部变量arr导致每一次点击增加人员的时候会将以前的人员清空，后期做的时候把他做成全局变量，在最后保存信息的时候将数据清空
        var arr = [];
        name.forEach(function (v, i) {
            arr.push(v);
        });
        //num是1，参与。2，无需。3，负责人
        if (num == 1) {
            this.setState({joinAttMer: arr})
        } else if (num == 2) {
            this.setState({outAttMer: arr})
        } else if (num == 3) {
            if(arr.length>1) {
                message.error('考勤组负责人只能选择1人');
            } else {
                this.setState({attPerson: arr})
            }

        }
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
    chooseMember(e) {
        //e是1，参与。2，无需。3，负责人
        this.setState({chooseMemberModalIsShow: true});
        this.refs.chooseMemberModal.seeAddWhich(e);
    },

    /**
     * 人员tags点击x的回调
     * @param removedTag
     * @param kind
     */
    handleClose(removedTag, kind) {
        if (kind == 1) {
            //参与考勤人员
            const joinAttMer = this.state.joinAttMer.filter(joinAttMer => joinAttMer !== removedTag);
            console.log(joinAttMer);
            this.setState({joinAttMer});
        } else if (kind == 2) {
            //无需考勤人员
            const outAttMer = this.state.outAttMer.filter(outAttMer => outAttMer !== removedTag);
            console.log(outAttMer);
            this.setState({outAttMer});
        } else if (kind == 3) {
            //考勤组负责人
            const attPerson = this.state.attPerson.filter(attPerson => attPerson !== removedTag);
            console.log(attPerson);
            this.setState({attPerson});
        }
    },

    /**
     * 保存新增考勤组的回调
     */
    saveNewAtt() {
        //向后台发送数据
        //清空本地数据
        // //保存后返回考勤组列表
        this.returnTable();
    },
    // saveInputRef = input => this.input = input

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        var _this = this;
        //考勤地点表头
        const workPositionCol = [{
            title: '考勤地址',
            dataIndex: 'workpos',
            key: 'workpos',
        }, {
            title: '操作',
            key: 'action',
            render: (text, record) => (
                <span>
                    <a onClick={_this.delPos.bind(this, record)}>删除</a>
                </span>
            ),
        }];

        const {joinAttMer, outAttMer, attPerson, inputVisible, inputValue} = this.state;
        //顶部banner
        var title;
        //页面主体部分
        var mainTable;
        //保存按钮
        var saveButton = <Button type="primary" onClick={this.saveNewAtt}>保存设置</Button>;
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
                                {joinAttMer.map((tag, index) => {
                                    const isLongTag = tag.length > 20;
                                    const tagElem = (
                                        <Tag key={tag} closable={index !== -1}
                                             afterClose={() => this.handleClose(tag, 1)}>
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
                                    />
                                )}
                            </span>
                        <Button className="btn_tag" onClick={this.chooseMember.bind(this, 1)}>请选择</Button>
                    </Col>
                </Row>
                <Row className="upexam_to_ma">
                    <Col span={4} className="knowledge_ri knowledge_ri_8">无需考勤人员：</Col>
                    <Col span={18}>
                            <span>
                                {outAttMer.map((tag, index) => {
                                    const isLongTag = tag.length > 20;
                                    const tagElem = (
                                        <Tag key={tag} closable={index !== -1}
                                             afterClose={() => this.handleClose(tag, 2)}>
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
                                    />
                                )}
                            </span>
                        <Button className="btn_tag" onClick={this.chooseMember.bind(this, 2)}>请选择</Button>
                    </Col>
                </Row>
                <Row className="upexam_to_ma">
                    <Col span={4} className="knowledge_ri knowledge_ri_8">考勤组负责人：</Col>
                    <Col span={18}>
                            <span>
                                {attPerson.map((tag, index) => {
                                    const isLongTag = tag.length > 20;
                                    const tagElem = (
                                        <Tag key={tag} closable={index !== -1}
                                             afterClose={() => this.handleClose(tag, 3)}>
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
                                    />
                                )}
                            </span>
                        <Button className="btn_tag" onClick={this.chooseMember.bind(this, 3)}>请选择</Button>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <span className="password_ts checking_in_le">协助管理员分管本考勤组的排班及统计，只能选择1人</span>
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
                    <Col span={20}>
                        <span>根据办公地点考勤（可添加多个考勤地点）有效范围</span>
                        <span className="add_out">
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
                        </span>

                    </Col>
                </Row>

                {/*考勤地址table*/}
                <Table className="upexam_to_ma ant-col-20 checking_in_le min_53" columns={workPositionCol}
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
                    addGroupMember={this.addGroupMember}
                    ref="chooseMemberModal"
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
