/**
 * Created by noom on 17-9-7.
 */
import React, {PropTypes} from 'react';
import {Modal, Input, Row, Col, message, Table, Select, Tag, Tooltip,Button} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {isEmpty} from '../../utils/utils';
// import UploadImgComponents from './UploadImgComponents';
import {TYPE_TEACHER} from '../../utils/Const';

const columns = [{
    title: '全选',
    dataIndex: 'name',
    className: 'dold_text'
}];
var selectArr = [];
var tableData = [];
class SelectKnowledgeModal extends React.Component {

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
            selTags: [],  //标签显示
            inputVisible: false,
            inputValue: '',
            // searchObj: '',
            humArr: [],
            defStrNum: 200,
            pageNo:1,
            conditionKeyOfKnowledge:'',
            headerIsShow:true,
            loadMoreContent:''
        };
        this.SelectKnowledgeModalHandleCancel = this.SelectKnowledgeModalHandleCancel.bind(this);
        this.onSelectChange = this.onSelectChange.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.onRowSelected = this.onRowSelected.bind(this);
        this.onSelectAll = this.onSelectAll.bind(this);
        this.addNewTags = this.addNewTags.bind(this);
        this.getKnowledgeInfosByConditionKey = this.getKnowledgeInfosByConditionKey.bind(this);
        this.searchKnowledge = this.searchKnowledge.bind(this);
        this.saveButtonOnClick = this.saveButtonOnClick.bind(this);
        this.loadMore = this.loadMore.bind(this);
    }

    componentDidMount() {
        var _this = this;
        var isShow = _this.props.isShow;
        this.setState({isShow});
        this.getKnowledgeInfosByConditionKey(this.state.pageNo,this.state.conditionKeyOfKnowledge);
    }

    componentWillReceiveProps(nextProps) {
        console.log("=========componentWillReceiveProps=============");
        var isShow = nextProps.isShow;
        var initTags = nextProps.initTags;
        var knowledgeIds = [];
        if(isEmpty(initTags)){
            initTags = [];
            selectArr.splice(0);
        }else{
            selectArr.splice(0);
            initTags.forEach(function (tag) {
                knowledgeIds.push(tag.key);
                selectArr.push(tag);
            });
        }
        tableData.splice(0);
        this.setState({isShow,"selTags":initTags,"selectedRowKeys":knowledgeIds,conditionKeyOfKnowledge:'',loadMoreContent:'',pageNo:1});
        this.getKnowledgeInfosByConditionKey(this.state.pageNo,this.state.conditionKeyOfKnowledge);
    }

    /**
     * 模态框关闭回调
     * @constructor
     */
    SelectKnowledgeModalHandleCancel() {
        this.setState({"isShow": false});
        this.props.closeSelectKnowledgeModal(this.state.selTags,'closeBtn');
        this.state.sendMes = '';
        // this.state.searchObj = '';
        this.state.selectedRowKeys = [];
        this.state.topicImgUrl = [];
        this.state.selTags = [];
        selectArr = [];
    }

    /*选中项发生变化的时的回调*/
    onSelectChange(selectedRowKeys) {
        this.setState({selectedRowKeys: selectedRowKeys});
    }

    /*用户手动选择  取消选择某列的回调*/
    onRowSelected(record, selected, selectedRows) {
        // 第一参数是操作人的那个对象，第二个参数布尔值true表示钩中，false表示取消，第三个参数表示钩中的人的数组
        // this.setState({tags: selectedRows});
        //这里应该是push和shift,而不是全部设置
        if (selected) {
            selectArr.push(record);
        } else {
            var key = record.key;
            for (var i = 0; i < selectArr.length; i++) {
                if (selectArr[i].key == key) {
                    selectArr.splice(i, 1);
                }
            }
        }
        this.setState({selTags: selectArr});
    }

    /**
     * 用户手动选择/取消选择所有列的回调
     */
    onSelectAll(selected, selectedRows, changeRows) {
        this.setState({selTags: selectedRows});
    }

    /**
     * 根据指定的关键字，获取指定的知识点集合,用来完成modal搜索
     * @param userId
     * @param title
     * @param subjectsIds
     */
    getKnowledgeInfosByConditionKey(pageNo,conditionKey){
        var _this = this;
        var param = {
            "method": 'getKnowledgeInfoListByConditionKey',
            "pageNo": pageNo,
            "conditionKey": conditionKey,
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                console.log(ret,"ret")
                if (ret.msg == "调用成功" && ret.success == true) {
                    //children.splice(0);
                    var response = ret.response;
                console.log(ret.response,"response")

                    // _this.setState({knowledgeResponse:response});
                    response.forEach(function (knowledgeInfo) {
                        var knowledgeId = knowledgeInfo.knowledgeId;
                        var knowledgeName = knowledgeInfo.knowledgeName;
                        var person = {
                            key: knowledgeId,
                            name: knowledgeName,
                        }
                        tableData.push(person);
                    });
                    var headerIsShow = true;
                    var loadMoreContent="加载更多";
                    if(response.length==0){
                        //headerIsShow = false;
                        loadMoreContent = "无更多数据";
                    }
                    var pager = ret.pager;
                    _this.setState({tableData,totalKnowledge: pager.rsCount, loadMoreContent});
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    searchKnowledge(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var conditionKeyOfKnowledge = target.value;
        this.setState({conditionKeyOfKnowledge});
    }

    onKeyUp() {
        // 调用搜索
        console.log("1111");
        tableData.splice(0);
        var initPageNo = 1;
        this.getKnowledgeInfosByConditionKey(initPageNo,this.state.conditionKeyOfKnowledge);
        this.setState({pageNo:initPageNo});
    }

    /*标签关闭的回调*/
    handleClose = (removedTag) => {
        const selTags = this.state.selTags.filter(tag => tag !== removedTag);
        var arr = [];
        this.setState({selTags});
        //设置勾选状态   selectedRowKeys
        for (var i = 0; i < selTags.length; i++) {
            arr.push(selTags[i].key);
        }
        this.state.selectedRowKeys = arr;
        //在这里把点击的这一项从selectArr中删除  selectArr全局函数
        for (var i = 0; i < selectArr.length; i++) {
            if (selectArr[i].key == removedTag.key) {
                selectArr.splice(i, 1);
            }
        }
    }

    /**
     * 添加新的tag
     */
    addNewTags(){
        var conditionKeyOfKnowledge = this.state.conditionKeyOfKnowledge;
        var record = {key:conditionKeyOfKnowledge,name:conditionKeyOfKnowledge};
        selectArr.push(record);
        this.setState({selTags: selectArr});
    }

    /**
     * 保存知识点
     */
    saveButtonOnClick(){
        this.props.closeSelectKnowledgeModal(this.state.selTags);
    }

    /**
     * 部门成员加载更多
     */
    loadMore() {
        if(this.state.loadMoreContent=="加载更多"){
            var newPageNo = parseInt(this.state.pageNo) + 1;
            this.getKnowledgeInfosByConditionKey(newPageNo,this.state.conditionKeyOfKnowledge);
            this.setState({"pageNo":newPageNo});
        }
    }

    saveInputRef = input => this.input = input;

    render() {
        const {selTags} = this.state;

        const rowSelection = {
            selectedRowKeys: this.state.selectedRowKeys,
            // 选中项发生变化的时的回调
            onChange: this.onSelectChange,
            // 用户手动选择/取消选择某列的回调
            onSelect: this.onRowSelected,
            //用户手动选择/取消选择所有列的回调
            onSelectAll: this.onSelectAll
        };
        var buttons = <div>
            
            <Button type="ghost" htmlType="submit" className="login-form-button" onClick={this.SelectKnowledgeModalHandleCancel}>
                取消
            </Button>
            <Button type="primary" htmlType="submit" className="login-form-button" onClick={this.saveButtonOnClick}>
                确定
            </Button>
        </div>
        return (
            <Modal
                visible={this.state.isShow}
                title={"选择知识点"}
                onCancel={this.SelectKnowledgeModalHandleCancel}
                transitionName=""  //禁用modal的动画效果
                maskClosable={false} //设置不允许点击蒙层关闭
                footer={[buttons]}
                className={'modal-434'}
            >
                <Row className="ant-form-item">
                    <Col span={24}>
                        <div className="ant-transfer">
                            <div className="select_knoledge">
                                    <span className="upexam_float">已选知识点：</span>
                                    <div className="select_knoledge_tags_wrap">
                                        <div className="select_knoledge_tags upexam_float">
                                            {selTags.map((tag, index) => {
                                                const isLongTag = tag.length > 20;
                                                const tagElem = (
                                                    <Tag key={tag.key} closable={index !== -1}
                                                         afterClose={() => this.handleClose(tag)}>
                                                        {isLongTag ? `${tag.name.slice(0, 20)}...` : tag.name}
                                                    </Tag>
                                                );
                                                return isLongTag ? <Tooltip title={tag}>{tagElem}</Tooltip> : tagElem;
                                            })}
                                        </div>
                                    </div>
                            </div>
                                <div className="select_knoledge">
                                    <Col span={20}>
                                    <Input
                                        placeholder="请输入或选择需添加的知识点"
                                        value={this.state.conditionKeyOfKnowledge}
                                        onChange={this.searchKnowledge}
                                        onKeyUp={this.onKeyUp}
                                    />
                                    </Col>
                                    <Col span={4} className="right_look">
                                        <Button type="primary" className="calmAddButton calmBorderRadius roe-t-f-left add-2-btn" onClick={this.addNewTags}>新增</Button>
                                    </Col>
                                </div>
                                <div>
                                    <Col span={24}>
                                        <Table showHeader={this.state.headerIsShow} className="select_knoledge_Person" rowSelection={rowSelection} columns={columns} scroll={{ y: 240 }}
                                               dataSource={this.state.tableData} pagination={false}/>
                                        <div className="schoolgroup_operate schoolgroup_more">
                                            <a onClick={this.loadMore} className="schoolgroup_more_a">{this.state.loadMoreContent}</a>
                                        </div>
                                    </Col>
                                </div>
                        </div>
                    </Col>
                </Row>
            </Modal>
        );
    }

}

export default SelectKnowledgeModal;
