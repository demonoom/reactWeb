import React, {PropTypes} from 'react';
import {Modal, Button, message, Table, Row, Col,} from 'antd';
import {Form, Input, Select, Radio, Icon} from 'antd';
import {doWebService} from '../WebServiceHelper';
import {getPageSize, isEmpty} from '../utils/Const';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;

//一级菜单数组
let List = new Array();
//菜单元素，根据构建出来的该对象，对菜单进行生成
let options;
var knowledge;
var parentDirectoryIdArry = [];
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
    showModal(currentKnowlege, optType, knowledgeName, copyFile) {
        //当前点击的，计划应用的课件资源
        knowledgeName = knowledgeName;
        if (optType == "TeacherAllSubjects" || optType == "TeacherAllCourseWare") {
            knowledge.setState({useTypeValue: 'searchSchedule', searchScheduleDisableStatus: false});
        }
        knowledge.setState({
            visible: true,
            knowledgeName: knowledgeName,
            optType: optType,
            currentKnowlege: currentKnowlege,
            copyFile
        });
        console.log('----', this.state.path);
        this.getUserRootCloudDir();
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
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                _this.buildTargetDirData(ret);
            }
        })
    },

    /**
     * 构建移动文件时的目标文件夹数据
     * @param ret
     */
    buildTargetDirData(ret) {
        var _this = this;
        var targetDirDataArray = [];
        var i = 0;
        if (ret.msg == "调用成功" && ret.success == true && isEmpty(ret.response) == false) {
            ret.response.forEach(function (e) {
                var isDriectory = e.directory;
                var name = e.name;
                var lastPointIndex = name.lastIndexOf(".");
                var fileType = name.substring(lastPointIndex + 1);
                if (isDriectory == true && lastPointIndex == -1) {  //过滤不是文件夹的 文件
                    if (i == 0) {
                        var parentDirectoryId = e.parentId;
                        _this.setState({"parentDirectoryId": parentDirectoryId});
                    }
                    i++;
                    var key = e.id;
                    var fileLogo = _this.buildFileLogo(name, isDriectory, e);
                    var dirName = <span className="font_gray_666" onClick={_this.intoDirectoryInner.bind(_this, e)}>
                {fileLogo}
                </span>;
                    var moveDirOpt;
                    if (e.directory == true) {
                        moveDirOpt = <div>
                            <Button onClick={_this.copySubjectsToCloudFile.bind(_this, e)}>确定</Button>
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
                }
            })
            _this.setState({"targetDirDataArray": targetDirDataArray});
        } else {
            parentDirectoryIdArry.pop();
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

    /*点击确定 保存
    保存 <题目> 到蚁盘的接口
  operateUserId     ---- 登录用户的id
  parentCloudFileId ---- 蚁盘目录的id，保存到根目录时传-1，否则传对应目录的id
  name              ---- 题目的名称, 当选中多个题目时，用逗号分隔
  subjectId         ---- 题目的id, 当选中多个题目时，用逗号分隔

  /*
  保存 <课件> 到蚁盘的接口  createCloudFiles
  operateUserId     ---- 登录用户的id
  parentCloudFileId ---- 蚁盘目录的id，保存到根目录时传-1，否则传对应目录的id
  name              ---- 课件的名称, 当选中多个题目时，用逗号分隔
  path              ---- 课件的路径, 当选中多个题目时，用逗号分隔

*/
    copySubjectsToCloudFile(e) {
        var _this = this;
        var parentCloudFileId = e.parentId;
        var subjectId = this.state.currentKnowlege;
        var copyFile = _this.state.copyFile;
        var param
        if (this.state.optType == 'courseWare') {
            param = {
                "method": 'createCloudFiles',
                "operateUserId": sessionStorage.getItem("ident"),
                "parentCloudFileId": e.id,
                "mids": copyFile[0],
            };
        } else {
            param = {
                "method": 'copySubjectsToCloudFile',
                "operateUserId": sessionStorage.getItem("ident"),
                "parentCloudFileId": e.id,
                "subjectId": subjectId
            };
        }
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.response == true) {
                    message.success('保存成功');
                }
            },
            onError: function (error) {
                message.error('保存失败');
            }
        })
        this.setState({visible: false})
    },

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
    },
    /**
     * 如果是文件夹，则可以点击文件夹名称，进入文件夹内部
     */
    intoDirectoryInner(directoryObj) {
        this.setState({
            "parentDirectoryId": directoryObj.parentId,
            "currentDirectoryId": directoryObj.id,
        });
        parentDirectoryIdArry.push(this.state.parentDirectoryId);
        this.unique(parentDirectoryIdArry);
        console.log('parentDirectoryIdArry', parentDirectoryIdArry);
        this.listCloudSubject(directoryObj.id);
    },
    /**
     * 点击文件夹名称，进入文件夹内部的文件列表   cloudFileId   --- 目录的id  pageNo        --- 页码，-1取全部
     *
     listCloudDir(String cloudFileId, String pageNo)
     */
    listCloudSubject(cloudFileId, pageNO) {
        var _this = this;
        var data = [];
        var param = {
            "method": 'listCloudDir',
            "cloudFileId": cloudFileId,
            "pageNo": -1
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                _this.buildTargetDirData(ret)
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },
    //返回层级
    saveBarBack() {
        var initPageNo = 1;
        var lastSubjectParent = parentDirectoryIdArry.pop();
        console.log('lastSubjectParent', lastSubjectParent);
        // var lastSubjectParentId = parentDirectoryIdArry[parentDirectoryIdArry.length-1];
        if (lastSubjectParent == 0) {
            lastSubjectParent = [];
            this.setState({parentDirectoryId: '-1', currentDirectoryId: "-1"});
            this.getUserRootCloudDir();
        } else {
            this.listCloudSubject(lastSubjectParent, initPageNo);
        }
    },

    /*原始的 使用备课列表的接口 暂不用18-3-5记*/
    getLessonMenu() {
        var param = {
            "method": 'getTeachScheduleByIdent',
            "ident": sessionStorage.getItem("ident")
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
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
        //返回键
        var returnToolbar = <div className="public—til—blue">
            <div className="ant-tabs-right">
                <Button onClick={this.saveBarBack}><Icon type="left"/></Button>
            </div>
        </div>;
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

            <Modal
                visible={this.state.visible}
                title="使用至我的资源"
                onCancel={this.handleCancel}
                transitionName=""  //禁用modal的动画效果
                maskClosable={false} //设置不允许点击蒙层关闭
                footer={null}
            >
                <div className="move_file">
                    <Row>
                        <Col span={24}>
                            {returnToolbar}
                            <Table columns={targetDirColumns} showHeader={false}
                                   dataSource={this.state.targetDirDataArray}
                                   scroll={{y: 300}}/>
                        </Col>
                    </Row>
                </div>
            </Modal>
        );
    },
});
export default UseKnowledgeComponents;