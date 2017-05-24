import React, {PropTypes} from 'react';
import {Table, Button, Popover, message,Icon,Input,Modal,Row,Col} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {getPageSize} from '../../utils/Const';
import {getLocalTime} from '../../utils/utils';

var columns = [{
    title: '标题',
    dataIndex: 'title',
}, {
    title: '操作',
    className: 'ant-table-selection-user',
    dataIndex: 'subjectOpt',
},
];

var data = [];
var subjectList;
var cloudTable;
const AntCloudTableComponents = React.createClass({
    getInitialState() {
        cloudTable = this;

        return {
            ident: sessionStorage.getItem('ident'),
            selectedRowKeys: [],
            loading: false,
            count: 0,
            totalCount: 0,
            currentPage: 1,
            currentView: 'homeWorkList',
            clazzId: '',
            dateTime: '',
            tableData:[],
            getFileType:'myFile',
            parentDirectoryId:0
        };
    },
    componentDidMount(){
        cloudTable.isSchoolCloudFileSuperManager(this.state.ident);
        cloudTable.getUserRootCloudFiles(this.state.ident, 1);
    },

    getFileByType(fileType){
        console.log("fileType"+fileType);
        var initPageNo=1;
        if(fileType=="myFile"){
            cloudTable.getUserRootCloudFiles(this.state.ident, initPageNo);
        }else{
            cloudTable.getUserChatGroupRootCloudFiles(this.state.ident, initPageNo);
        }
        cloudTable.setState({"getFileType":fileType,parentDirectoryId:0});
    },


    start() {
        this.setState({loading: true});
        setTimeout(() => {
            this.setState({
                selectedRowKeys: [],
                loading: false,
            });
        }, 1000);
    },

    onSelectChange(selectedRowKeys) {
        this.setState({selectedRowKeys});
    },

    buildPageView(optSource){
        if (optSource == "查看") {
            columns = [{
                title: '内容',
                dataIndex: 'subjectContent',
                className: 'ant-table-selection-cont3 left-12'
            }, {
                title: '类型',
                className: 'ant-table-selection-user2',
                dataIndex: 'subjectType',
            }
            ];
        } else {
            columns = [{
                title: '名称',
                dataIndex: 'title',
				className: 'left-12',
            }, {
                title: '更新时间',
                dataIndex: 'createTime',
                className: 'ant-table-selection-user2',
            }, {
                title: '创建者',
                dataIndex: 'creator',
                className: 'ant-table-selection-user2',
            }, {
                title: '操作',
                className: 'ant-table-selection-topic',
                dataIndex: 'subjectOpt',
            },
            ];
        }
    },

    //点击查看时,进入题目列表
    getSubjectData(e){
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        data = [];
        var value = target.value;
        var valueArray = value.split("#");
        var ident = valueArray[0];
        var clazzId = valueArray[1];
        var dateTime = valueArray[2];
        var optSource = valueArray[3];
        var pageNo = 1;
        cloudTable.buildPageView(optSource);
        cloudTable.getHomeworkSubjects(ident, clazzId, dateTime, pageNo);
        cloudTable.setState({currentView: 'subjectDetailList', clazzId: clazzId, dateTime: dateTime});
        cloudTable.props.onSearchClick();
    },

    //点击导航时，进入的我的文件列表
    getUserRootCloudFiles: function (userId, pageNo) {
        data = [];
        cloudTable.setState({currentView: 'subjectList', totalCount: 0});
        cloudTable.buildPageView();
        var param = {
            "method": 'getUserRootCloudFiles',
            "userId": userId,
            "pageNo": pageNo,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if(response){
                    cloudTable.buildTableDataByResponse(ret);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    //点击导航时，获取用户的根群文件夹
    getUserChatGroupRootCloudFiles: function (userId, pageNo) {
        data = [];
        cloudTable.setState({currentView: 'subjectList', totalCount: 0});
        cloudTable.buildPageView();
        var param = {
            "method": 'getUserChatGroupRootCloudFiles',
            "userId": userId,
            "pageNo": pageNo,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if(response){
                    cloudTable.buildTableDataByResponse(ret);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 点击文件夹名称，进入文件夹内部的文件列表
     * @param operateUserId
     * @param cloudFileId
     * @param queryConditionJson
     * @param pageNo
     */
    listFiles: function (operateUserId, cloudFileId,queryConditionJson,pageNo) {
        data = [];
        cloudTable.setState({currentView: 'subjectList', totalCount: 0});
        cloudTable.buildPageView();
        var param = {
            "method": 'listFiles',
            "operateUserId": operateUserId,
            "cloudFileId": cloudFileId,
            "queryConditionJson":queryConditionJson,
            "pageNo":pageNo
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if(response){
                    cloudTable.buildTableDataByResponse(ret);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },
    /**
     * 是否是学校云盘的超级管理者
     * @param userId
     */
    isSchoolCloudFileSuperManager(userId){
        var param = {
            "method": 'isSchoolCloudFileSuperManager',
            "userId": userId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if(ret.success==true && ret.msg=="调用成功"){
                    cloudTable.setState({"currentUserIsSuperManager":response});
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    renameCloudFile(operateUserId,cloudFileId,name){
        var param = {
            "method": 'renameCloudFile',
            "operateUserId": operateUserId,
            "cloudFileId":cloudFileId,
            "name":name
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if(ret.success==true && ret.msg=="调用成功" && ret.response == true){
                    var initPageNo = 1;
                    if(cloudTable.state.getFileType=="myFile"){
                        cloudTable.getUserRootCloudFiles(cloudTable.state.ident, initPageNo);
                    }else{
                        cloudTable.getUserChatGroupRootCloudFiles(this.state.ident, initPageNo);
                    }
                }
                message.success("重命名成功");
                cloudTable.setState({"reNameModalVisible":false});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    buildTableDataByResponse(ret){
        ret.response.forEach(function (e) {
            var key=e.id;
            var createTime =e.createTime;
            var createUid = e.createUid;
            var creator = e.creator;
            var directory = e.directory;
            var file = e.file;
            var fileType = e.fileType;
            var fromId = e.fromId;
            var fromType = e.fromType;
            var length = e.length;
            var name = e.name;
            var parentId = e.parentId;
            var permissionsArray = e.permissions;
            var schoolId = e.schoolId;
            var valid = e.valid;

            var fileLogo;
            if(directory){
                fileLogo=<div>
                    <Icon type="folder" />
                    <a className="font_gray_666" onClick={cloudTable.intoDirectoryInner.bind(cloudTable,e)}>{name}</a>
                </div>;
            }else{
                fileLogo=<div>
                    <Icon type="file" />
                    {name}
                </div>;
            }
            var subjectOpt = <div>
                <Button type="button" className="score3_i" value={key} text={key} onClick={cloudTable.editDirectoryName.bind(cloudTable,e)}
                        icon="edit"></Button>
                <Button type="button" value={key} text={key} onClick={cloudTable.deleteFileOrDirectory.bind(cloudTable,e)}
                        icon="delete"></Button>
            </div>;
            data.push({
                key: key,
                title: fileLogo,
                creator:creator.userName,
                createTime: getLocalTime(createTime),
                subjectOpt: subjectOpt,
            });
        });
        var pager = ret.pager;
        cloudTable.setState({totalCount: parseInt(pager.rsCount)});
        cloudTable.setState({"tableData":data});
    },
    /**
     * 如果是文件夹，则可以点击文件夹名称，进入文件夹内部
     */
    intoDirectoryInner(directoryObj){
        console.log(directoryObj.name);
        var initPageNo =1 ;
        var queryConditionJson="";
        cloudTable.setState({"parentDirectoryId":directoryObj.id});
        cloudTable.listFiles(cloudTable.state.ident,directoryObj.id,'',initPageNo);
    },
    /**
     * 修改文件夹的名称（重命名）
     * @param fileObject
     */
    editDirectoryName(fileObject){
        console.log(fileObject);
        var name = fileObject.name;
        cloudTable.setState({"reNameModalVisible":true,"editDirectoryName":name,"editFileObject":fileObject});
    },

    /**
     * 删除文件或文件夹
     * @param fileObject
     */
    deleteFileOrDirectory(fileObject){
        console.log("key:"+fileObject.id);
    },

    //点击作业列表中的查看时，进入题目列表
    getHomeworkSubjects: function (ident, clazzId, dateTime, pageNo) {
        var param = {
            "method": 'getHomeworkSubjects',
            "ident": ident,
            "clazzId": clazzId,
            "dateTime": dateTime,
            "pageNo": pageNo
        };

        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                subjectList = new Array();
                var response = ret.response;
                response.forEach(function (e) {
                    var id = e.id;
                    var popOverContent = '<div><span class="answer_til answer_til_1">题目：</span>' + e.content + '<hr/><span class="answer_til answer_til_2">答案：</span>' + e.answer + '</div>';
                    var content = <Popover placement="rightTop"
                                           content={<article id='contentHtml' className='content Popover_width'
                                                             dangerouslySetInnerHTML={{__html: popOverContent}}></article>}>
                        <article id='contentHtml' className='content Popover_width'
                                 dangerouslySetInnerHTML={{__html: e.content}}></article>
                    </Popover>;
                    var subjectType = e.subjectType;
                    var typeName = e.typeName;
                    var score = e.score;
                    data.push({
                        key: id,
                        subjectContent: content,
                        subjectType: typeName,
                        subjectScore: score,
                    });
                });
                var pager = ret.pager;
                cloudTable.setState({totalCount: parseInt(pager.rsCount)});
                cloudTable.setState({currentView: 'subjectList',"tableData":data});
            },
            onError: function (error) {
                message.error(error);
            }

        });
    },

    pageOnChange(pageNo) {
        var currentView = cloudTable.state.currentView;
        if (currentView == "homeWorkList") {
            cloudTable.getUserRootCloudFiles(sessionStorage.getItem("ident"), pageNo);
        } else {
            cloudTable.getHomeworkSubjects(sessionStorage.getItem("ident"), cloudTable.state.clazzId, cloudTable.state.dateTime, pageNo)
        }

        this.setState({
            currentPage: pageNo,
        });
    },

    /**
     * 关闭重命名窗口
     */
    reNameModalHandleCancel(){
        cloudTable.setState({"reNameModalVisible":false});
    },
    /**
     * 确定执行重命名操作
     */
    reNameModalHandleOk(){
        var editFileObject = cloudTable.state.editFileObject;
        cloudTable.renameCloudFile(this.state.ident,editFileObject.id,cloudTable.state.editDirectoryName);
    },
    /**
     * 修改文件夹名称的文本框内容改变响应函数
     */
    directoryNameInputChange(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var editDirectoryName = target.value;
        cloudTable.setState({"editDirectoryName":editDirectoryName});
    },

    /**
     * 返回上级目录
     */
    returnParent(){

    },

    showdelAllDirectoryConfirmModal(){

    },

    render() {
        const {loading, selectedRowKeys} = cloudTable.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };
        const hasSelected = selectedRowKeys.length > 0;
        var delBtn = <div><Button type="primary" onClick={cloudTable.showdelAllDirectoryConfirmModal}
                                  disabled={!hasSelected} loading={loading}
        >批量删除</Button><span className="password_ts"
                            style={{marginLeft: 8}}>{hasSelected ? `已选中 ${selectedRowKeys.length} 条记录` : ''}</span></div>;

        var tipTitle;
        if(cloudTable.state.getFileType=="myFile"){
            tipTitle="我的文件";
        }else{
            tipTitle="群文件";
        }
        var newButton;
        var uploadButton;
        //判断是否是超级管理员
        if(cloudTable.state.currentUserIsSuperManager){
            newButton=<Button value="newDirectory"  className="antnest_talk">新建文件夹</Button>;
            uploadButton=<Button value="uploadFile">上传文件</Button>;
        }

        var returnParentToolBar;
        if(cloudTable.state.parentDirectoryId!=0){
            returnParentToolBar = <div className="ant-tabs-right"><Button onClick={cloudTable.returnParent}><Icon type="left" /></Button></div>;
        }

        var toolbar = <div className="public—til—blue">
            {returnParentToolBar}
            <div className="talk_ant_btn1">
			<div className="pl_del">
                            {delBtn}
                        </div>
                {newButton}
                {uploadButton}
            </div>
            {tipTitle}
        </div>;
        return (
                <div>
                    <Modal title="重命名"
                           visible={cloudTable.state.reNameModalVisible}
                           transitionName=""  //禁用modal的动画效果
                           maskClosable={false} //设置不允许点击蒙层关闭
                           onOk={cloudTable.reNameModalHandleOk}
                           onCancel={cloudTable.reNameModalHandleCancel}
                    >
                    	<div>
                            <Row>
                                <Col span={3} className="right_look">名称：</Col>
                                <Col span={20}>
                                    <Input value={cloudTable.state.editDirectoryName} onChange={cloudTable.directoryNameInputChange}/>
                                </Col>
                            </Row>
                        </div>
                    </Modal>
                    {toolbar}
                    <div className="favorite_scroll">
                        
					<Table  rowSelection={rowSelection} columns={columns} dataSource={cloudTable.state.tableData} pagination={{
                        total: cloudTable.state.totalCount,
                        pageSize: getPageSize(),
                        onChange: cloudTable.pageOnChange
                    }} scroll={{y: 400}}/>
					</div>
                </div>

        );
    },
});

export default AntCloudTableComponents;
