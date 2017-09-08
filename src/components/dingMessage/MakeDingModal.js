/**
 * Created by noom on 17-9-7.
 */
import React, {PropTypes} from 'react';
import {Modal, Icon, Input, Button, Row, Col, message, Checkbox, Transfer, Table, Select, Tag, Tooltip} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {isEmpty} from '../../utils/utils';
import UploadImgComponents from './UploadImgComponents';

const columns = [{
    title: '全选',
    dataIndex: 'name',
    className: 'dold_text'
}];

class MakeDingModal extends React.Component {

    constructor(props) {
        super(props);
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        this.state = {
            loginUser: loginUser,
            isShow: false,
            selectedRowKeys: [], // 勾选选中数组
            sendMes: '',
            messageType: 0,   //消息发送方式默认以应用内方式,
            topicImgUrl: [],     //说说/话题上传的图片路径,
            tags: [],  //标签显示
            inputVisible: false,
            inputValue: '',
        };
        this.MakeDingModalHandleCancel = this.MakeDingModalHandleCancel.bind(this);
        this.onSelectChange = this.onSelectChange.bind(this);
        this.getPerson = this.getPerson.bind(this);
        this.snedMesOnChange = this.snedMesOnChange.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.drawTable = this.drawTable.bind(this);
        this.sendDing = this.sendDing.bind(this);
        this.getUploadedImgList = this.getUploadedImgList.bind(this);
        this.removeImgViewStyle = this.removeImgViewStyle.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleInputConfirm = this.handleInputConfirm.bind(this);
        this.onRowSelected = this.onRowSelected.bind(this);
        this.onSelectAll = this.onSelectAll.bind(this);
    }

    componentDidMount() {
        var _this = this;
        var isShow = _this.props.isShow;
        this.setState({isShow});
        this.getPerson();
    }

    componentWillReceiveProps(nextProps) {
        var isShow = nextProps.isShow;
        this.setState({isShow});
    }

    /**
     * 模态框关闭回调
     * @constructor
     */
    MakeDingModalHandleCancel() {
        this.setState({"isShow": false});
        this.props.closeDingModel();
        this.state.sendMes = '';
        this.state.selectedRowKeys = [];
        this.state.topicImgUrl = [];
        this.state.tags = [];
    }

    /*选中项发生变化的时的回调*/
    onSelectChange(selectedRowKeys) {
        this.setState({selectedRowKeys: selectedRowKeys});
    }

    /*用户手动选择  取消选择某列的回调*/
    onRowSelected(record, selected, selectedRows) {
        // 第一参数是操作人的那个对象，第二个参数布尔值true表示钩中，false表示取消，第三个参数表示钩中的人的数组
        this.setState({tags: selectedRows});
    }

    /**
     * 用户手动选择/取消选择所有列的回调
     */
    onSelectAll(selected, selectedRows, changeRows) {
        this.setState({tags: selectedRows});
    }

    /*获取组织架构的全部人员*/
    getPerson() {
        var _this = this;
        var param = {
            "method": 'getStructureUsers',
            "operateUserId": this.state.loginUser.colUid,
            "pageNo": -1,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var data = ret.response;
                _this.drawTable(data);
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    /**
     * 渲染表格
     * @param data
     */
    drawTable(data) {
        var humArr = [];
        for (var i = 0; i < data.length; i++) {
            var person = {
                key: data[i].colUid,
                name: data[i].userName,
            }
            humArr.push(person);
        }
        this.setState({humArr});
    }

    /*叮消息文本域输入回调*/
    snedMesOnChange(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var sendMes = target.value;
        this.setState({sendMes});
    }

    /*发送方式选择回调*/
    handleChange(value) {
        if (value == 'mes') {
            this.setState({messageType: 1});
        } else {
            this.setState({messageType: 0});
        }
    }

    /*发送*/
    sendDing() {
        //消息接收人
        var receivePer = '';
        var selectedIds = this.state.selectedRowKeys;
        for (var i = 0; i < selectedIds.length; i++) {
            receivePer += selectedIds[i] + ',';
        }
        receivePer = receivePer.substr(0, receivePer.length - 1);
        //消息内容
        var mesContent = this.state.sendMes;
        //消息类型
        var mesType = this.state.messageType;
        //图片路径
        var imgUrl = '';
        var topicImgUrl = this.state.topicImgUrl;
        if (topicImgUrl.length !== 0) {
            for (var i = 0; i < topicImgUrl.length; i++) {
                imgUrl += topicImgUrl[i] + ',';
            }
            imgUrl = imgUrl.substr(0, imgUrl.length - 1);
        } else {
            imgUrl = '';
        }
        var _this = this;
        var param = {
            "method": 'createBiu',
            "userId": this.state.loginUser.colUid,
            "biuType": mesType,
            "biuContent": mesContent,
            "biuReceiverUids": receivePer,
            "attachmentPaths": imgUrl
        };
        if (mesContent.length == 0) {
            message.error('消息不能为空');
            return;
        }
        if (receivePer.length == 0) {
            message.error('请选择接收人');
            return;
        }
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                console.log(ret);
                if (ret.msg == "调用成功" && ret.success == true) {
                    message.success("发送成功");
                    _this.MakeDingModalHandleCancel();
                } else {
                    message.error("字数过长，只限200字");
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });

    }

    /*获取上传图片信息*/
    getUploadedImgList(file, isRemoved) {
        this.removeImgViewStyle(); //移除图片上传组件的pointerEvents样式属性
        var imgUrl = file.response;
        if (isEmpty(isRemoved) == false && isRemoved == "removed") {
            for (var i = 0; i < this.state.topicImgUrl.length; i++) {
                if (this.state.topicImgUrl[i] == imgUrl) {
                    this.state.topicImgUrl.splice(i, 1);
                }
            }
        } else {
            this.state.topicImgUrl.push(imgUrl);
        }
    }

    /**
     * 移除图片上传组件的pointerEvents样式属性
     * 原值为none时，会导致无法点击预览
     */
    removeImgViewStyle() {
        var imgViewObjArray = $("a[rel='noopener noreferrer']");
        for (var i = 0; i < imgViewObjArray.length; i++) {
            var imgViewObj = imgViewObjArray[i];
            imgViewObj.style.pointerEvents = "";
        }
    }

    /*标签关闭的回调*/
    handleClose = (removedTag) => {
        const tags = this.state.tags.filter(tag => tag !== removedTag);
        var arr = [];
        this.setState({tags});
        //设置勾选状态   selectedRowKeys
        for (var i = 0; i < tags.length; i++) {
            arr.push(tags[i].key)
        }
        this.state.selectedRowKeys = arr;
    }

    handleInputChange = (e) => {
        this.setState({inputValue: e.target.value});
    }

    handleInputConfirm = () => {
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
    }

    saveInputRef = input => this.input = input

    render() {
        const {tags, inputVisible, inputValue} = this.state;

        const rowSelection = {
            selectedRowKeys: this.state.selectedRowKeys,
            // 选中项发生变化的时的回调
            onChange: this.onSelectChange,
            // 用户手动选择/取消选择某列的回调
            onSelect: this.onRowSelected,
            //用户手动选择/取消选择所有列的回调
            onSelectAll: this.onSelectAll
        };
        return (
            <Modal
                visible={this.state.isShow}
                width={850}
                title="创建叮"
                onCancel={this.MakeDingModalHandleCancel}
                transitionName=""  //禁用modal的动画效果
                maskClosable={false} //设置不允许点击蒙层关闭
                footer={[]}
                className="new_add_ding"
            >

                {/*<span>接收者：</span>*/}
                {/*<div className="ding_tags">*/}
                    {/*{tags.map((tag, index) => {*/}
                        {/*const isLongTag = tag.length > 20;*/}
                        {/*const tagElem = (*/}
                            {/*<Tag key={tag.key} closable={index !== -1} afterClose={() => this.handleClose(tag)}>*/}
                                {/*{isLongTag ? `${tag.name.slice(0, 20)}...` : tag.name}*/}
                            {/*</Tag>*/}
                        {/*);*/}
                        {/*return isLongTag ? <Tooltip title={tag}>{tagElem}</Tooltip> : tagElem;*/}
                    {/*})}*/}
                    {/*{inputVisible && (*/}
                        {/*<Input*/}
                            {/*ref={this.saveInputRef}*/}
                            {/*type="text" size="small"*/}
                            {/*style={{width: 78}}*/}
                            {/*value={inputValue}*/}
                            {/*onChange={this.handleInputChange}*/}
                            {/*onBlur={this.handleInputConfirm}*/}
                            {/*onPressEnter={this.handleInputConfirm}*/}
                        {/*/>*/}
                    {/*)}*/}
                {/*</div>*/}

                <Row className="ant-form-item">
                    <Col span={24}>
                        <div className="ant-transfer make_dingPanel">
                            {/*左*/}
                            <Col span={16}>
                                <div className="ding_tags_wrap">
                                <span className="upexam_float">接收者：</span>
                                <div className="ding_tags upexam_float">
                                    {tags.map((tag, index) => {
                                        const isLongTag = tag.length > 20;
                                        const tagElem = (
                                            <Tag key={tag.key} closable={index !== -1} afterClose={() => this.handleClose(tag)}>
                                                {isLongTag ? `${tag.name.slice(0, 20)}...` : tag.name}
                                            </Tag>
                                        );
                                        return isLongTag ? <Tooltip title={tag}>{tagElem}</Tooltip> : tagElem;
                                    })}
                                    {inputVisible && (
                                        <Input
                                            ref={this.saveInputRef}
                                            type="text" size="small"
                                            style={{width: 78}}
                                            value={inputValue}
                                            onChange={this.handleInputChange}
                                            onBlur={this.handleInputConfirm}
                                            onPressEnter={this.handleInputConfirm}
                                        />
                                    )}
                                </div>
                                </div>
                                <Input className="ding_ipt" placeholder="内容" type="textarea" rows={15}
                                       value={this.state.sendMes}
                                       onChange={this.snedMesOnChange}
                                />
                                <UploadImgComponents callBackParent={this.getUploadedImgList}
                                                     fileList={this.state.topicImgUrl}/>
                                <div className="ding_modal_top">
                                    <button type="primary" htmlType="submit" className="ant-btn-primary ant-btn"
                                            onClick={this.sendDing}>发送
                                    </button>
                                    <Select defaultValue="app" style={{width: 200}} onChange={this.handleChange}
                                            className="add_out">
                                        <Option value="app">应用内发送</Option>
                                        <Option value="mes">短信发送</Option>
                                    </Select>
                                </div>
                            </Col>

                            {/*右*/}
                            <Col span={8}>
                                <div>
                                    <Table className="ding_Person" rowSelection={rowSelection} columns={columns}
                                           dataSource={this.state.humArr} pagination={false}/>
                                </div>
                            </Col>
                        </div>
                    </Col>
                </Row>
            </Modal>
        );
    }

}

export default MakeDingModal;
