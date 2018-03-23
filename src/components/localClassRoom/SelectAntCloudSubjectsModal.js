/**
 * Created by devnote on 17-4-17.
 */
import React, {PropTypes} from 'react';
import {Modal,  Row, Col, message,Table,Icon,Button} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {isEmpty} from '../../utils/utils';

var targetDirColumns = [{
    title: '文件夹名称',
    dataIndex: 'dirName',
    className:'table_left_0'
},
];

var targetDirDataArray = [];
var subjectParents = [];
/**
 * 从蚁盘选择题目的modal
 */
class SelectAntCloudSubjectsModal extends React.Component {

    constructor(props) {
        super(props);
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        this.state = {
            loginUser: loginUser,
            isShow: false,
            currentDirectoryIdAtMoveModal:-1
        };
        this.SelectSubjectModalHandleCancel = this.SelectSubjectModalHandleCancel.bind(this);
        this.buildTargetDirData = this.buildTargetDirData.bind(this);
        this.getUserRootCloudFiles = this.getUserRootCloudFiles.bind(this);
        this.loadMoreAntCloudFlile = this.loadMoreAntCloudFlile.bind(this);
        this.getAntCountFileList = this.getAntCountFileList.bind(this);
        this.buildFileLogo = this.buildFileLogo.bind(this);
        this.intoDirectoryInner = this.intoDirectoryInner.bind(this);
        this.listFiles = this.listFiles.bind(this);
        this.returnParentAtMoveModal = this.returnParentAtMoveModal.bind(this);
        this.pushFileFromAntCloud = this.pushFileFromAntCloud.bind(this);
        this.onSubjectTableSelectChange = this.onSubjectTableSelectChange.bind(this);
        this.subjectModalHandleOk = this.subjectModalHandleOk.bind(this);
        this.unique = this.unique.bind(this);
    }

    componentDidMount() {
        var _this = this;
        var isShow = _this.props.isShow;
        this.setState({isShow});
        targetDirDataArray.splice(0);
        this.getAntCountFileList();
    }

    componentWillReceiveProps(nextProps) {
        var isShow = nextProps.isShow;
        this.getAntCountFileList();
        targetDirDataArray.splice(0);
        this.setState({isShow,"targetDirDataArray":[]});
    }

    /**
     * 本地课堂中，关闭从蚁盘选择课件的窗口
     * @constructor
     */
    SelectSubjectModalHandleCancel() {
        targetDirDataArray.splice(0);
        this.setState({"isShow": false,selectedSubjectKeys:[],"targetDirDataArray":[]});
        this.props.onCancel();
    }

    /**
     * 获取用户的蚁盘根文件夹
     */
    getAntCountFileList(){
        var initPageNo = 1;
        this.getUserRootCloudFiles(this.state.loginUser.colUid, initPageNo);
        this.setState({parentDirectoryId: -1, antCloudFileCurrentPage: 1});
    }

    /**
     * 蚁盘文件加载更多的回调
     */
    loadMoreAntCloudFlile() {
        var queryConditionJson = "";
        var antCloudFileCurrentPage = parseInt(this.state.antCloudFileCurrentPage) + 1;
        if(this.state.currentDirectoryIdAtMoveModal==-1){
            this.getUserRootCloudFiles(this.state.loginUser.colUid, antCloudFileCurrentPage);
        }else{
            this.listFiles(this.state.loginUser.colUid, this.state.currentDirectoryIdAtMoveModal, queryConditionJson, antCloudFileCurrentPage);
        }
    }

    //从蚁盘选题时，点击导航时，进入的我的文件列表
    getUserRootCloudFiles (userId, pageNo) {
        var _this = this;
        _this.setState({currentDirectoryIdAtMoveModal: -1, totalCount: 0});
        var param = {
            "method": 'getUserRootCloudSubjects',
            "userId": userId,
            "pageNo": pageNo,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if (isEmpty(response)==false && response.length >0) {
                    _this.buildTargetDirData(ret);
                    _this.setState({
                        antCloudFileCurrentPage: pageNo,
                    });
                }else{
                    message.error("无更多数据");
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    /**
     * 从蚁盘选题时，点击蚁盘文件夹时，进入下一级目录
     * @param ret
     */
    buildTargetDirData(ret) {
        var _this = this;
        var i = 0;
        if (ret.msg == "调用成功" && ret.success == true && isEmpty(ret.response) == false) {
            ret.response.forEach(function (e) {
                if (i == 0) {
                    if (e.parentId) {
                        var parentDirectoryId = e.parentId;
                        // _this.setState({"parentDirectoryIdAtMoveModal": parentDirectoryId});
                        _this.setState({"parentSubjectDirectoryId": parentDirectoryId});
                    }
                }
                i++;
                var directory = e.directory;
                var key="";
                var fileLogo = null;
                if(directory===false){
                    var subject = e.subject;
                    key = subject.id+"";
                    var name = subject.content;
                    fileLogo = _this.buildFileLogo(name, directory, e);
                }else{
                    key = e.id+"#"+directory;
                    var name = e.name;
                    fileLogo = _this.buildFileLogo(name, directory, e);
                }
                var dataJson = {
                    key: key,
                    dirName: fileLogo,
                    fileObj:e
                };
                targetDirDataArray.push(dataJson);
            })
            _this.setState({"targetDirDataArray": targetDirDataArray});
        }
    }

    /**
     * 生成蚁盘文件列表时，根据文件类型，构建不同的图标显示
     */
    buildFileLogo(name, directory, e) {
        var _this = this;
        var fileLogo;
        if (directory) {
            fileLogo = <span className="cloud_text">
                <i className="cloud_icon cloud_icon_file upexam_float"></i>
                <span className="antnest_name affix_bottom_tc">{name}</span>
            </span>;
        } else {
            var content = <article id='contentHtml' className='content'
                                   dangerouslySetInnerHTML={{__html: name}}></article>;
            fileLogo = <div className="classroom_push_td">
                <span className="classroom_file_50">{content}</span>
            </div>;
        }
        return fileLogo;
    }

    /**
     * 如果是文件夹，则可以点击文件夹名称，进入文件夹内部
     */
    intoDirectoryInner(directoryObj) {
        var _this = this;
        var initPageNo = 1;
        var queryConditionJson = "";
        //进入文件夹前，先清空文件夹内的数据
        targetDirDataArray.splice(0);
        _this.setState({
            "parentDirectoryIdAtMoveModal": directoryObj.parentId,
            "currentDirectoryIdAtMoveModal": directoryObj.id
        });
        if(isEmpty(this.state.parentSubjectDirectoryId)==false){
            subjectParents.push(this.state.parentSubjectDirectoryId);
        }else{
            subjectParents.push(directoryObj.parentId);
        }
        subjectParents = this.unique(subjectParents);
        _this.listFiles(_this.state.loginUser.colUid, directoryObj.id, queryConditionJson, initPageNo);
    }

    /*
    数组去重
    */
    unique(array) {
        var n = []; //一个新的临时数组
        for (var i = 0; i < array.length; i++) {
            if (n.indexOf(array[i]) == -1) {
                n.push(array[i]);
            }
        }
        return n;
    }

    /**
     * 点击文件夹名称，进入文件夹内部的文件列表
     * @param operateUserId
     * @param cloudFileId
     * @param queryConditionJson
     * @param pageNo
     */
    listFiles(operateUserId, cloudFileId, queryConditionJson, pageNo) {
        var _this = this;
        _this.setState({totalCount: 0});
        _this.setState({"currentDirectoryIdAtMoveModal": cloudFileId});
        var param = {
            "method": 'listCloudSubject',
            // "operateUserId": operateUserId,
            "cloudFileId": cloudFileId,
            // "queryConditionJson": queryConditionJson,
            "pageNo": pageNo
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if (isEmpty(response)==false && response.length>0) {
                    _this.buildTargetDirData(ret);
                    _this.setState({
                        antCloudFileCurrentPage: pageNo,
                    });
                } else {
                    message.error("无更多数据");
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    }

    /**
     * 蚁盘文件夹进入后，通过该函数完成返回
     */
    returnParentAtMoveModal() {
        var _this = this;
        var initPageNo = 1;

        var lastSubjectParent = subjectParents.pop();
        //进入文件夹前，先清空文件夹内的数据
        targetDirDataArray.splice(0);
        if (isEmpty(lastSubjectParent)===true || lastSubjectParent == 0) {
            _this.setState({"parentSubjectDirectoryId": '',antCloudFileCurrentPage:initPageNo});
            subjectParents.splice(0);
            _this.getUserRootCloudFiles(_this.state.loginUser.colUid, initPageNo, "moveDirModal");
        } else {
            _this.setState({antCloudFileCurrentPage:initPageNo});
            var queryConditionJson = "";
            _this.listFiles(_this.state.loginUser.colUid,
                lastSubjectParent, queryConditionJson, initPageNo);
        }
    }

    /**
     * 将选中的蚁盘文件，通过回调的形式，推送到课堂
     * @param file
     */
    pushFileFromAntCloud(fileOrDirectory){
        var _this = this;
        console.log(fileOrDirectory);
        var fileObj = fileOrDirectory.fileObj;
        var fileName = fileObj.name;
        var isDirectory = fileObj.directory;
        if(isDirectory==true){
            this.intoDirectoryInner(fileObj);
        }else{
            var lastPointIndex = fileName.lastIndexOf(".");
            //通过截取文件后缀名的形式，完成对上传文件类型的判断
            var fileType = fileName.substring(lastPointIndex + 1);
            if(fileType=="ppt" || fileType == "pptx"){
                //通过回调的形式，将选中的课件回调给父组件，并完成推送课件的操作
                this.props.pushMaterialsToClass(fileObj);
                this.SelectSubjectModalHandleCancel();
            }else{
                message.error("暂不支持打开该文件");
                return;
            }
        }
    }

    //题目表格行被选中时获取被选中项目
    onSubjectTableSelectChange(selectedSubjectKeys) {
        var len = selectedSubjectKeys.length;
        var lastSubjectKeyInfo = selectedSubjectKeys[len-1];
        var lastSubjectKeyInfoArray = [];
        if(isEmpty(lastSubjectKeyInfo)===false){
            lastSubjectKeyInfoArray = lastSubjectKeyInfo.split("#");
        }
        if(lastSubjectKeyInfoArray.length>1 && lastSubjectKeyInfoArray[1]==="true"){
            message.warn("只能选择具体题目，无法选择文件夹");
        }else{
            this.setState({selectedSubjectKeys});
        }
    }

    /**
     * 选择题目后的确定操作
     */
    subjectModalHandleOk(){
        //通过回调的形式，将选中的题目回调给父组件，并完成推题的操作
        if(isEmpty(this.state.selectedSubjectKeys)==false){
            this.props.pushSubjectToClass(this.state.selectedSubjectKeys);
        }
        this.SelectSubjectModalHandleCancel();
    }

    render() {
        const subjectRowSelection = {
            selectedRowKeys: this.state.selectedSubjectKeys,
            onChange: this.onSubjectTableSelectChange,
        };
        return (
            <Modal className="modal_classroom modal_classroom_push modal_classroom_box choose_topic" visible={this.state.isShow}
                   onCancel={this.SelectSubjectModalHandleCancel}
                   transitionName=""  //禁用modal的动画效果
                   title="选择题目"
                   maskClosable={false} //设置不允许点击蒙层关闭
                   footer={null}
                   closable={true}     //设置显示右上角的关闭按钮（但是需要调整颜色，否则白色会无法显示）
            >
                <Row >
                    <Col span={24} className="17_hei ant-form">
                        <Row>
                            <Col span={24} >
                                <Icon type="left" className="classroom_left_i" onClick={this.returnParentAtMoveModal} />
                                <Table columns={targetDirColumns} showHeader={false}
                                       dataSource={this.state.targetDirDataArray}
                                       rowSelection={subjectRowSelection}
                                       onRowClick={this.pushFileFromAntCloud}
                                       pagination={false}/>
                                <div className="schoolgroup_operate schoolgroup_more more_classroom2">
                                    <a onClick={this.loadMoreAntCloudFlile} className="schoolgroup_more_a">加载更多</a>
                                </div>
                                <div className="choose_topic2">
                                    <Button key="return" type="primary" size="large" className="btn_push_i"
                                            onClick={this.subjectModalHandleOk}>推送</Button>
                                </div>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Modal>
        );
    }

}

export default SelectAntCloudSubjectsModal;
