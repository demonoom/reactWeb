import React, {PropTypes} from 'react';
import {Modal, Button, message,Table} from 'antd';
import {Form, Input, Select, Radio} from 'antd';
import {doWebService} from '../WebServiceHelper';
import {getPageSize} from '../utils/Const';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;

//一级菜单数组
let List = new Array();
//菜单元素，根据构建出来的该对象，对菜单进行生成
let options;
var knowledge;
var targetDirColumns = [{
    title: '文件夹名称',
    dataIndex: 'dirName',
}, {
    title: '操作',
    className: 'ant-table-selection-user schoolgroup_operate',
    dataIndex: 'moveDirOpt',
}
];

const UseKnowledgeComponents = React.createClass({
    getInitialState() {
        knowledge = this;
        return {
            visible: false,
            menuList: [],
            schedule: '',//当前下拉列表选择的备课计划id
            currentKnowlege: '',
            optType: '',
            knowledgeName: '',
            selectOptions: [],
            useTypeValue: 'currentKnowledge',
            searchScheduleDisableStatus: true,  //使用至现有计划下拉列表的可用状态，默认为不可用
            newScheduleDisableStatus: true,    //新建备课计划文本框的可用状态，默认为不可用
        };
    },
    showModal(currentKnowlege, optType, knowledgeName) {
        //当前点击的，计划应用的课件资源
        knowledgeName = knowledgeName;
        if (optType == "TeacherAllSubjects" || optType == "TeacherAllCourseWare") {
            knowledge.setState({useTypeValue: 'searchSchedule', searchScheduleDisableStatus: false});
        }
        knowledge.setState({knowledgeName: knowledgeName});
        knowledge.setState({optType: optType});
        knowledge.setState({currentKnowlege: currentKnowlege});
        knowledge.setState({
            visible: true,
        });
        this.getUserRootCloudDir();
        // this.getLessonMenu();
    },

    initPage() {
        knowledge.setState({
            schedule: '',
            selectOptions: [],
            useTypeValue: 'currentKnowledge'
        });
    },

    handleSubmit(e) {
        e.preventDefault();
        if (knowledge.state.optType == "TeacherAllSubjects") {
            //个人中心题目列表的使用功能
            if (this.state.useTypeValue == "searchSchedule") {
                knowledge.copySubjects(knowledge.state.currentKnowlege, knowledge.state.schedule);
            } else if (this.state.useTypeValue == "newSchedule") {
                //新建备课计划
                var inputObj = knowledge.refs.scheduleName;
                var scheduleName = inputObj.refs.input.value;
                knowledge.saveSchedule(sessionStorage.getItem("ident"), scheduleName);
            }
        } else if (knowledge.state.optType == "TeacherAllCourseWare") {
            //个人中心资源列表的使用功能
            if (this.state.useTypeValue == "searchSchedule") {
                knowledge.copyMaterialToSchedule(sessionStorage.getItem("ident"), knowledge.state.currentKnowlege, knowledge.state.schedule);
            } else if (this.state.useTypeValue == "newSchedule") {
                //新建备课计划
                var inputObj = knowledge.refs.scheduleName;
                var scheduleName = inputObj.refs.input.value;
                knowledge.saveSchedule(sessionStorage.getItem("ident"), scheduleName);
            }
        } else {
            //资源库的使用功能
            if (this.state.useTypeValue == "currentKnowledge") {
                //使用当前知识点作为备课计划
                var scheduleName = this.state.knowledgeName;
                knowledge.saveSchedule(sessionStorage.getItem("ident"), scheduleName);
            } else if (this.state.useTypeValue == "searchSchedule") {
                //使用至现有计划
                if (knowledge.state.optType == "courseWare") {
                    knowledge.copyMaterialToSchedule(sessionStorage.getItem("ident"), knowledge.state.currentKnowlege, knowledge.state.schedule);
                } else {
                    knowledge.copySubjects(knowledge.state.currentKnowlege, knowledge.state.schedule);
                }
            } else if (this.state.useTypeValue == "newSchedule") {
                //新建备课计划
                var inputObj = knowledge.refs.scheduleName;
                var scheduleName = inputObj.refs.input.value;
                knowledge.saveSchedule(sessionStorage.getItem("ident"), scheduleName);
            }
        }

        knowledge.initPage();
    },

    saveSchedule(ident, scheduleName) {
        var param = {
            "method": 'addTeachSchedule',
            "ident": ident,
            "title": scheduleName
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.response.colTsId != null) {
                    knowledge.setState({schedule: ret.response.colTsId});
                    if (knowledge.state.optType == "courseWare" || knowledge.state.optType == "TeacherAllCourseWare") {
                        knowledge.copyMaterialToSchedule(sessionStorage.getItem("ident"), knowledge.state.currentKnowlege, ret.response.colTsId);
                    } else {
                        knowledge.copySubjects(knowledge.state.currentKnowlege, knowledge.state.schedule);
                    }
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    copyMaterialToSchedule(userId, materiaIds, scheduleId) {
        var param = {
            "method": 'copyMaterialToSchedule',
            "userId": userId,
            "materiaIds": materiaIds,
            "scheduleId": scheduleId
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.response == true) {
                    message.success("课件使用成功");
                } else {
                    message.error("课件使用失败");
                }
                knowledge.setState({
                    visible: false,
                });
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    copySubjects(subjectsIds, scheduleId) {
        var param = {
            "method": 'copySubjects',
            "subjectsIds": subjectsIds,
            "teachScheduleId": scheduleId
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.response == true) {
                    message.success("题目使用成功");
                } else {
                    message.error("题目使用失败");
                }
                knowledge.setState({
                    visible: false,
                });
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    handleCancel() {
        knowledge.initPage();
        this.setState({visible: false});
    },
    /*modal 显示调用列表
     getUserRootCloudDir(String userId, String pageNo)
    * */
    getUserRootCloudDir() {
        var _this = this;
        var param = {
            "method": 'getUserRootCloudDir',
            "userId": sessionStorage.getItem("ident"),
            "pageNo": -1,
        };
        doWebService(JSON.stringify(param),{
            onResponse:function(ret){
                debugger;
                _this.buildTargetDirData(ret);
            }
        })
    },

    /**
     * 构建移动文件时的目标文件夹数据
     * @param ret
     */
    buildTargetDirData(ret) {
        debugger;
        var _this = this;
        var targetDirDataArray = [];
        var i = 0;
        if (ret.msg == "调用成功" && ret.success == true) {
            ret.response.forEach(function (e) {
                if (i == 0) {
                    if (e.parent) {
                        var parentDirectoryId = e.parent.parentId;
                        _this.setState({"parentDirectoryIdAtMoveModal": parentDirectoryId});
                    }
                }
                i++;
                var key = e.id;
                var name = e.name;
                var directory = e.directory;
                var fileLogo = _this.buildFileLogo(name, directory, e);
                var dirName = <span className="font_gray_666"  onClick={_this.intoDirectoryInner.bind(this, e)}>
                {fileLogo}
            </span>;
                var moveDirOpt;
                if (e.directory == true) {
                    moveDirOpt = <div>
                        <Button onClick={_this.saveFile.bind(this,key)}>确定</Button>
                    </div>;
                } else {
                    dirName = name;
                }
                var dataJson = {
                    key: key,
                    dirName: dirName,
                    moveDirOpt: moveDirOpt
                };
                targetDirDataArray.push(dataJson);
            })
            _this.setState({"targetDirDataArray": targetDirDataArray});
        }
    },

    buildFileLogo(name, directory, e) {
        var fileLogo;
        if (directory) {
            fileLogo = <span className="cloud_text">
                <i className="cloud_icon cloud_icon_file upexam_float"></i>
                <span className="antnest_name affix_bottom_tc">{name}</span>
            </span>;
        } else {
            var lastPointIndex = name.lastIndexOf(".");
            //通过截取文件后缀名的形式，完成对上传文件类型的判断
            var fileType = name.substring(lastPointIndex + 1);
            var fileTypeLog;
            switch (fileType) {
                case "png":
                    fileTypeLog = <i className="cloud_icon cloud_icon_png"></i>;
                    break;
                case "jpg":
                    fileTypeLog = <i className="cloud_icon cloud_icon_jpg"></i>;
                    break;
                case "mp3":
                    fileTypeLog = <i className="cloud_icon cloud_icon_mp3"></i>;
                    break;
                case "pdf":
                    fileTypeLog = <i className="cloud_icon cloud_icon_pdf"></i>;
                    break;
                case "ppt":
                case "pptx":
                    fileTypeLog = <i className="cloud_icon cloud_icon_ppt"></i>;
                    break;
                case "doc":
                case "docx":
                    fileTypeLog = <i className="cloud_icon cloud_icon_doc"></i>;
                    break;
                case "xls":
                case "xlsx":
                    fileTypeLog = <i className="cloud_icon cloud_icon_xls"></i>;
                    break;
                case "wps":
                    fileTypeLog = <i className="cloud_icon cloud_icon_wps"></i>;
                    break;
                default:
                    fileTypeLog = <i className="cloud_icon cloud_icon_other"></i>;
                    break;
            }
            fileLogo = <span className="cloud_text">
                {fileTypeLog}
                <span className="yipan_name">{name}</span>
            </span>;
        }
        return fileLogo;
    },

    /**
     * 如果是文件夹，则可以点击文件夹名称，进入文件夹内部
     */
    intoDirectoryInner(directoryObj, optSrc) {
        debugger;
        var initPageNo = 1;
        var queryConditionJson = "";
        //点击第一层文件夹时，记录当前文件夹的群主是否是当前用户
        if (this.state.currentDirectoryId == -1 ) {
            // if (directoryObj.createUid == this.state.ident) {
            //     this.setState({"isGroupCreator": true});
            // } else {
            //     this.setState({"isGroupCreator": false});
            // }
        }
        this. listCloudSubject(directoryObj);
    },
     /**
     * 点击文件夹名称，进入文件夹内部的文件列表   cloudFileId   --- 目录的id  pageNo        --- 页码，-1取全部
     */
     listCloudSubject(directoryObj,pageNO) {
         var _this = this;
        var data = [];
         _this.setState({totalCount: 0});
        // if (isEmpty(optSrc) == false && optSrc == "mainTable") {
        //     this.setState({"currentDirectoryId": cloudFileId});
        // } else {
        //     this.setState({"currentDirectoryIdAtMoveModal": cloudFileId});
        // }
        var cloudFileId = directoryObj.id;
        var parentFileId = directoryObj.parentId;
        var param = {
            "method": 'listCloudSubject',
            "cloudFileId": cloudFileId,
            "pageNo": -1
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                debugger;
                var response = ret.response;
                _this.buildTargetDirData(ret)
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },
    /**
     * 点击确定按钮，保存文件到指定目录   点击 父亲
     */
    saveFile(parentCloudFileId) {
        var _this = this;
        //1.请求用户的私人网盘用数据构建model的table
        var id = JSON.parse(sessionStorage.getItem("loginUser")).colUid;
        var param = {
            "method": 'copyCloudFiles',
            "operateUserId": id,
            "toCloudFileId": parentCloudFileId,
            "fromCloudFileIds": this.state.saveFileId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.success == true && ret.msg == "调用成功" && isEmpty(ret.response) == false) {
                    var initPageNo = 1;
                    var queryConditionJson = "";
                    if (this.state.currentDirectoryId != -1) {
                        this.listFiles(this.state.ident,
                            this.state.currentDirectoryId, queryConditionJson, initPageNo, "mainTable");
                    } else {
                        this.getUserRootCloudFiles(this.state.ident, this.state.currentPage);
                    }
                    message.success("文件保存成功");
                } else {
                    message.error("文件保存失败");
                }
                this.setState({saveFileModalVisible: false});
            },
            onError: function (error) {
                message.error(error);
            }
        });

    },

    /*原始的 使用备课列表的接口 暂不用18-3-5记*/
    getLessonMenu() {
        var param = {
            "method": 'getTeachScheduleByIdent',
            "ident": sessionStorage.getItem("ident")
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                debugger;
                List.splice(0, List.length);
                ret.response.forEach(function (e) {
                    var lessonArray = e.split("#");
                    var scheduleId = lessonArray[0];
                    var courseName = lessonArray[1];
                    var courseTimes = 0;//当值为0时，系统不显示具体的子菜单数量（即菜单上无徽标显示）
                    //courseTimes需要作为当前备课计划下的资源数量进行显示（课件和题目的总和）
                    var lessonInfo = {"scheduleId": scheduleId, "courseName": courseName, "courseTimes": courseTimes};
                    List.push([lessonInfo.scheduleId, lessonInfo.courseName, lessonInfo.courseTimes]);
                    knowledge.setState({menuList: List});
                });
                knowledge.buildMenuChildren();
            },
            onError: function (error) {
            }
        });
    },

    handleMenu: function (lessonInfo) {
        List.push([lessonInfo.scheduleId, lessonInfo.courseName, lessonInfo.courseTimes]);
    },

    buildMenuChildren: function () {
        options = List.map((e, i) => {
            if (i == 0) {
                knowledge.setState({schedule: e[0]});
            }
            return <Option key={e[0]} value={e[0]}>{e[1]}</Option>
        });
        knowledge.setState({selectOptions: options});
    },

    handleSchedule: function (e) {
        var value = e;
        this.setState({
            schedule: value
        });
    },

    useTypeOnChange(e) {
        this.setState({
            useTypeValue: e.target.value,
        });
        if (e.target.value == "searchSchedule") {
            knowledge.setState({searchScheduleDisableStatus: false});
        } else {
            knowledge.setState({searchScheduleDisableStatus: true});
        }
        if (e.target.value == "newSchedule") {
            knowledge.setState({newScheduleDisableStatus: false});
        } else {
            knowledge.setState({newScheduleDisableStatus: true});
        }
    },

    render() {

        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 14},
        };

        var attach;
        //从个人中心进入时，没有使用当前知识点作为备课计划名称的操作项
        if (knowledge.state.optType == "TeacherAllSubjects" || knowledge.state.optType == "TeacherAllCourseWare") {
            attach = <RadioGroup onChange={this.useTypeOnChange} value={this.state.useTypeValue}>
                <Radio value="searchSchedule">
                    使用至现有计划：
                    <Select disabled={knowledge.state.searchScheduleDisableStatus}
                            defaultValue={knowledge.state.schedule} value={knowledge.state.schedule} key="teachSchedule"
                            style={{width: '95%'}} ref="teachSchedule" onChange={this.handleSchedule}>
                        {knowledge.state.selectOptions}
                    </Select>
                </Radio><br/>
                <Radio value="newSchedule"><span className="left-letter">新建备课计划：</span><Input
                    disabled={knowledge.state.newScheduleDisableStatus} ref="scheduleName"/></Radio>
            </RadioGroup>;
        } else {
            attach = <RadioGroup onChange={this.useTypeOnChange} value={this.state.useTypeValue}>
                <Radio value="currentKnowledge">使用当前知识点名称作为备课计划名称</Radio><br/>
                <Radio value="searchSchedule">
                    使用至现有计划：
                    <Select disabled={knowledge.state.searchScheduleDisableStatus}
                            defaultValue={knowledge.state.schedule} value={knowledge.state.schedule} key="teachSchedule"
                            style={{width: '100%'}} ref="teachSchedule" onChange={this.handleSchedule}>
                        {knowledge.state.selectOptions}
                    </Select>
                </Radio><br/>
                <Radio value="newSchedule"><span className="left-letter">新建备课计划：</span><Input
                    disabled={knowledge.state.newScheduleDisableStatus} ref="scheduleName"/></Radio>
            </RadioGroup>;
        }

        return (

            <div>
                <Modal
                    visible={this.state.visible}
                    title="使用至我的资源"
                    onCancel={this.handleCancel}
                    transitionName=""  //禁用modal的动画效果
                    maskClosable={false} //设置不允许点击蒙层关闭
                    footer={null}
                >
                    <Table columns={targetDirColumns} showHeader={false}
                           dataSource={this.state.targetDirDataArray}
                           scroll={{y: 300}}/>
                </Modal>
            </div>
        );
    },
});
export default UseKnowledgeComponents;

