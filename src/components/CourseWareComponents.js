import React, {PropTypes} from 'react';
import {Checkbox, Collapse, Button, Pagination, message,Modal} from 'antd';
import UseKnowledgeComponents from './UseKnowledgeComponents';
import {doWebService} from '../WebServiceHelper';
import {getPageSize} from '../utils/Const';
import {isEmpty} from '../utils/Const';
import ConfirmModal from './ConfirmModal';

const Panel = Collapse.Panel;


class CourseWare extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            currentPage: 1,
            totalCount: 0,
            ident: sessionStorage.getItem("ident"),
            teachScheduleId: '',
            optType: '',
            knowledgeName: '',
            dataFilter: 'self',
            isDeleteAllSubject: false

        }

        this.activeKey = [];
        this.coursePanelChildren = null;
        this.showConfirmModal = this.showConfirmModal.bind(this);
        this.batchDeleteMaterialById = this.batchDeleteMaterialById.bind(this);
        this.getTeachPlans = this.getTeachPlans.bind(this);
        this.getLocalTime = this.getLocalTime.bind(this);
        this.onChange = this.onChange.bind(this);
        this.showModal = this.showModal.bind(this);
        this.isDeleteAll = this.isDeleteAll.bind(this);
        this.showDelScheduleMateriaConfirmModal = this.showDelScheduleMateriaConfirmModal.bind(this);
        this.closeDelScheduleMateriaConfirmModal = this.closeDelScheduleMateriaConfirmModal.bind(this);
        this.deleteScheduleMaterials = this.deleteScheduleMaterials.bind(this);
        this.deleteScheduleMaterialsById = this.deleteScheduleMaterialsById.bind(this);
        this.closeConfirmModal = this.closeConfirmModal.bind(this);
        this.batchDeleteMaterial = this.batchDeleteMaterial.bind(this);
        this.view = this.view.bind(this);
        this.buildPanels = this.buildPanels.bind(this);
        this.buildKonwledgePanels = this.buildKonwledgePanels.bind(this);
        this.render = this.render.bind(this);
    }


    componentWillMount() {

        this.setState({courseListState: [], totalCount: 0});
    }


    componentWillReceiveProps(nextProps) {
        // 4
        let obj = nextProps.params ? nextProps.params : this.props.params;
        if (!obj) return;
        this.getTeachPlans(obj.ident, obj.teachScheduleId, obj.optType, obj.pageNo, obj.knowledgeName, obj.dataFilter, obj.comeFrom);
    }

    getTeachPlans(ident, teachScheduleId, optType, pageNo, knowledgeName, dataFilter, comeFrom) {
        this.setState({
            ident: ident,
            teachScheduleId: teachScheduleId,
            optType: optType,
            knowledgeName: knowledgeName,
            dataFilter: dataFilter
        })
        let _this = this;
        var param;

        if (optType == "bySchedule") {
            param = {
                "method": 'getMaterialsBySheduleId',
                "scheduleId": teachScheduleId,
                "pageNo": pageNo
            };
            doWebService(JSON.stringify(param), {
                onResponse: function (ret) {

                    let courseWareList = [];
                    _this.activeKey = [];
                    courseWareList.splice(0);
                    var response = ret.response;
                    response.forEach(function (e) {
                        //区别是录得微课还是正常上传的文件
                        if (isEmpty(e.attachements) == false) {
                            if (e.attachements.length == 1) {
                                var path = e.attachements[0].path;
                            } else {
                                //如果视频断了重连，attachements里就会有好多对象
                                // alert('视频断了');
                                var path = e.attachements[0].path;
                            }
                        } else {
                            var path = e.path;
                        }
                        var id = e.id;
                        var fileName = e.name;
                        var userName = e.user.userName;
                        // var path = e.path;
                        var pdfPath = e.pdfPath;
                        var fileType = fileName.substring(fileName.lastIndexOf(".") + 1);
                        var pointId = e.point.content;
                        var collectCount = e.collectCount; //收藏次数即现今的点赞次数
                        var fileTypeLogo;
                        var htmlPath = "";
                        if (fileType == "ppt") {
                            fileTypeLogo = "icon_geshi icon_ppt";
                            htmlPath = e.htmlPath;
                        } else if (fileType == "mp4") {
                            fileTypeLogo = "icon_geshi icon_mp4";
                        } else if (fileType == "flv") {
                            fileTypeLogo = "icon_geshi icon_flv";
                        } else if (fileType == "pdf") {
                            fileTypeLogo = "icon_geshi icon_pdf";
                        } else if (fileType == "pptx") {
                            fileTypeLogo = "icon_geshi icon_pptx";
                            htmlPath = e.htmlPath;
                        } else if (fileType == "mp3") {
                            fileTypeLogo = "icon_geshi icon_mp3";
                        } else {
                            //备课计划里录制的微课，没有后缀名，但一般都是flv格式的，先这样处理
                            fileTypeLogo = "icon_geshi icon_flv";
                        }
                        var createTime = _this.getLocalTime(e.createTime);
                        _this.activeKey.push(fileName + "#" + createTime + "#" + id);
                        courseWareList.push([id, fileName, userName, path, pdfPath, fileType, pointId, createTime, fileTypeLogo, htmlPath, collectCount]);
                    });
                    _this.buildPanels(courseWareList);
                    _this.setState({courseListState: courseWareList});
                    var pager = ret.pager;
                    _this.setState({totalCount: parseInt(pager.rsCount)});
                    if (isEmpty(comeFrom) == false && "fromUpload" == comeFrom) {
                        _this.setState({"currentPage": 1});
                    }
                },
                onError: function (error) {
                    message.error(error);
                }

            });
        } else {
            var userId = ident;
            if (dataFilter == "self") {
                userId = ident;
            } else if (dataFilter == "other") {
                userId = "-" + ident;
            }
            param = {
                "method": 'getMaterialsByKnowledgePointId',
                "userId": userId,
                "pointId": teachScheduleId,
                "type": "-1",
                "pageNo": pageNo || 1,
            };

            doWebService(JSON.stringify(param), {


                onResponse: function (ret) {


                    let courseWareList = [];
                    _this.activeKey = [];
                    courseWareList.splice(0);
                    var response = ret.response;
                    response.forEach(function (e) {
                        //区别是录得微课还是正常上传的文件
                        if (isEmpty(e.attachements) == false) {
                            var isFlv = true;
                            if (e.attachements.length == 1) {
                                var path = e.attachements[0].path;
                            } else {
                                //如果视频断了重连，attachements里就会有好多对象
                                // alert('视频断了');
                                var path = e.attachements[0].path;
                            }
                        } else {
                            var isFlv = false;
                            var path = e.path;
                        }
                        var id = e.id;
                        var fileName = e.name;
                        //用户编号，用来判断当前的课件是否是自己上传的，如果是，则支持删除功能
                        var userId = e.userId;
                        var userName = e.user.userName;
                        var pdfPath = e.pdfPath;
                        var fileType = fileName.substring(fileName.lastIndexOf(".") + 1);
                        var pointId = e.point.content;
                        var createTime = _this.getLocalTime(e.createTime);
                        var fileTypeLogo;
                        var type = e.type;
                        var htmlPath = "";
                        var collectCount = e.collectCount; //收藏次数即现今的点赞次数
                        if (fileType == "ppt") {
                            fileTypeLogo = "icon_geshi icon_ppt";
                            htmlPath = e.htmlPath;
                        } else if (fileType == "mp4") {
                            fileTypeLogo = "icon_geshi icon_mp4";
                        } else if (fileType == "flv") {
                            fileTypeLogo = "icon_geshi icon_flv";
                        } else if (fileType == "pdf") {
                            fileTypeLogo = "icon_geshi icon_pdf";
                        } else if (fileType == "pptx") {
                            fileTypeLogo = "icon_geshi icon_pptx";
                            htmlPath = e.htmlPath;
                        } else if (fileType == "mp3") {
                            fileTypeLogo = "icon_geshi icon_mp3";
                        } else {
                            //资源库里录制的微课，没有后缀名，但一般都是flv格式的，先这样处理
                            fileTypeLogo = "icon_geshi icon_flv";
                        }
                        _this.activeKey.push(fileName + "#" + createTime + "#" + id);
                        courseWareList.push([id, fileName, userName, path, pdfPath, fileType, pointId, createTime, fileTypeLogo, htmlPath, type, collectCount, userId, isFlv]);
                    });
                    _this.buildKonwledgePanels(courseWareList);
                    _this.setState({courseListState: courseWareList});
                    var pager = ret.pager;
                    _this.setState({totalCount: parseInt(pager.rsCount)});
                    if (isEmpty(comeFrom) == false && "fromUpload" == comeFrom) {
                        _this.setState({"currentPage": 1});
                    }
                },
                onError: function (error) {
                    message.error(error);
                }

            });
        }
    }


    getLocalTime(nS) {
        var newDate = new Date(parseInt(nS)).toLocaleString().replace(/:\d{1,2}$/, ' ');
        return newDate;
    }

    onChange(page) {
        this.getTeachPlans(this.state.ident, this.state.teachScheduleId, this.state.optType, page, this.state.knowledgeName, this.state.dataFilter);
        this.setState({
            currentPage: page,
        });

    }

/*    showModal(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var currentSchedule = target.value;
        var courseListState = this.state.courseListState;
        var path;
        courseListState.forEach(function(e){
            path = e[3];
        });
        this.refs.useKnowledgeComponents.showModal(currentSchedule, "courseWare", this.state.knowledgeName,path);
    }*/

    showModal(copyFile) {
        var currentSchedule = copyFile[0];
        var courseListState = this.state.courseListState;
        this.refs.useKnowledgeComponents.showModal(currentSchedule, "courseWare", this.state.knowledgeName,copyFile);
    }

    isDeleteAll(e) {
        this.setState({isDeleteAllSubject: e.target.checked});
    }

    showDelScheduleMateriaConfirmModal(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var materialIds = target.value;
        this.setState({"delMaterialIds": materialIds,sureDelThisTitle:true});
        // this.refs.delScheduleMateriaConfirmModal.changeConfirmModalVisible(true);
    }

    closeDelScheduleMateriaConfirmModal() {
        this.setState({sureDelThisTitle:false})
        // this.refs.delScheduleMateriaConfirmModal.changeConfirmModalVisible(false);
    }


    deleteScheduleMaterials() {
        this.deleteScheduleMaterialsById(this.state.delMaterialIds);
        this.closeDelScheduleMateriaConfirmModal();
    }

    //删除教学进度下的材料（课件）
    deleteScheduleMaterialsById(materialIds) {
        let _this = this;
        if (this.state.isDeleteAllSubject) {
            //同步删除资源库下的资源
            this.setState({isDeleteAllSubject: false});
        } else {
            var param = {
                "method": 'deleteScheduleMaterials',
                "ident": sessionStorage.getItem("ident"),
                "scheduleId": this.state.teachScheduleId,
                "materialIds": materialIds
            };
            doWebService(JSON.stringify(param), {
                onResponse: function (ret) {
                    if (ret.msg == "调用成功" && ret.response == true) {
                        message.success("课件删除成功");
                    } else {
                        message.error("课件删除失败");
                    }
                    _this.getTeachPlans(sessionStorage.getItem("ident"), _this.state.teachScheduleId, "bySchedule", _this.state.currentPage, _this.state.knowledgeName)
                },
                onError: function (error) {
                    message.error(error);
                }
            });
        }
    }

    showConfirmModal(e) {
        var _this = this;
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var materialIds = target.value;
        _this.setState({"delMaterialIds": materialIds,changeConfirmModalVisible:true});
        // _this.refs.confirmModal.changeConfirmModalVisible(true);
    }

    closeConfirmModal() {
        this.setState({changeConfirmModalVisible:false})
        // this.refs.confirmModal.changeConfirmModalVisible(false);
    }

    batchDeleteMaterial() {
        this.batchDeleteMaterialById(this.state.delMaterialIds);
        this.closeConfirmModal();
    }

    //删除资源库下的材料（课件）
    batchDeleteMaterialById(materialIds) {
        let _this = this;
        var param;
        if (this.state.isDeleteAllSubject) {
            param = {
                "method": 'deleteScheduleAndKnowledgeMaterials',
                "userId": sessionStorage.getItem("ident"),
                "mids": materialIds
            };
        } else {
            param = {
                "method": 'batchDeleteMaterial',
                "ident": sessionStorage.getItem("ident"),
                "mids": materialIds
            };
        }
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.response == true) {
                    message.success("课件删除成功");
                } else {
                    message.error("课件删除失败");
                }
                _this.getTeachPlans(_this.state.ident, _this.state.teachScheduleId, _this.state.optType, _this.state.currentPage);
            },
            onError: function (error) {
                message.error(error);
            }
        });
        this.setState({isDeleteAllSubject: false});

    }

    view(e, url, tit) {

        e = e || window.event;
        if (e.nativeEvent) {
            e.nativeEvent.stopImmediatePropagation();
        }
        e.stopPropagation();
        e.preventDefault();
        e.cancelBubble = true;

        let mode = (tit) => {
            let refArr = tit.split('.');
            let type = refArr[refArr.length - 1];
            return type;
        }

        let obj = {mode: mode(tit), title: tit, url: url, width: '380px'};


        LP.Start(obj);
    }

    buildPanels(courseWareList) {
        if (courseWareList.length == 0) {
            this.coursePanelChildren = <img className="noDataTipImg" src={require('./images/noDataTipImg.png')}/>;
        } else {
            this.coursePanelChildren = courseWareList.map((e, i) => {

                var eysOnButton;


                switch (e[5]) {
                    case 'pptx':
                        if (isEmpty(e[9]) == false) {
                            eysOnButton =
                                <Button icon="eye-o" style={{float: 'right'}} onClick={event => {
                                    this.view(event, e[9], e[1])
                                }}/>
                        }
                        break;

                    case 'ppt':
                        if (isEmpty(e[9]) == false) {
                            eysOnButton =
                                <Button icon="eye-o" style={{float: 'right'}} onClick={event => {
                                    this.view(event, e[9], e[1])
                                }}/>
                        }
                        break;

                    case 'flv':
                        if (isEmpty(e[9]) == false) {
                            eysOnButton =
                                <Button icon="eye-o" style={{float: 'right'}} onClick={event => {
                                    this.view(event, e[9], e[1])
                                }}/>
                        }
                        break;
                    case 'mp4':
                        if (isEmpty(e[9]) == false) {
                            eysOnButton =
                                <Button icon="eye-o" style={{float: 'right'}} onClick={event => {
                                    this.view(event, e[9], e[1])
                                }}/>
                        }
                        break;
                    default:
                        if (isEmpty(e[9]) == false) {
                            eysOnButton =
                                <Button icon="eye-o" style={{float: 'right'}} onClick={event => {
                                    this.view(event, e[9], e[1])
                                }}/>
                        }
                        break;

                }


                return <Panel header={<span><span type="" className={e[8]}></span><span
                    className="name_file">{e[1]}</span> </span>} key={e[1] + "#" + e[7] + "#" + e[0]}>
                    <pre>
					 <div className="bnt2_tex bnt2_tex-15">
                         <span className="bai"><span className="col1">知识点：{e[6]}</span></span>
                         <span><span className="col1">创建人：{e[2]}</span></span>
                         <span><span className="col1">上传时间：{e[7]}</span></span>
                         <span><span className="col1">点赞次数：{e[10]}</span></span>
					</div>
					<div className="bnt2_right">
                         <Button style={{float: 'right'}} icon="delete" title="删除" value={e[0]}
                                 onClick={this.showDelScheduleMateriaConfirmModal}></Button>
                        <a href={e[3]} target="_blank" title="下载" download={e[3]} className="te_download_a"><Button
                            icon="download"/></a>
                        {/*<Button style={{float: 'right'}} icon="download" title="下载" value={e[0]}*/}
                        {/*onClick={this.showDelScheduleMateriaConfirmModal}></Button>*/}
                        {eysOnButton}
					</div>
                    </pre>
                </Panel>
            });
        }
    }

    buildKonwledgePanels(courseWareList) {
        var _this = this;
        if (courseWareList.length == 0) {
            this.coursePanelChildren =
                <img className="noDataTipImg" onClick={$.openPhotoGallery} src={require('./images/noDataTipImg.png')}/>;
        } else {
            this.coursePanelChildren = courseWareList.map((e, i) => {
                var eysOnButton;
                var delButton;
                if (isEmpty(e[5]) == false && ("pptx" == e[5] || "ppt" == e[5])) {
                    if (e[9] != null && e[9] != "") {
                        eysOnButton =
                            <Button icon="eye-o" style={{float: 'right'}} onClick={event => {
                                this.view(event, e[9], e[1])
                            }}/>
                    }
                }
                else {
                    if (isEmpty(e[3]) == false && e[13] == false) {
                        eysOnButton =
                            <Button icon="eye-o" style={{float: 'right'}} onClick={event => {
                                this.view(event, e[3], e[1])
                            }}/>
                    }
                }
                if (e[12] != null && e[12] == sessionStorage.getItem("ident")) {
                    delButton = <Button style={{float: 'right'}} icon="delete" title="删除" value={e[0]}
                                        onClick={this.showConfirmModal}></Button>
                }
                return <Panel header={<span><span type="" className={e[8]}></span><span
                    className="name_file">{e[1]}</span> </span>} key={e[1] + "#" + e[7] + "#" + e[0]}>
                    <pre>
					<div className="bnt2_tex bnt2_tex">
                         <span className="bai"><span className="col1">知识点：{e[6]}</span></span>
                         <span className="col1">创建人：{e[2]}</span>
                         <span className="col1">上传时间：{e[7]}</span>
                         <span className="col1">点赞次数：{e[11]}</span>
                      </div>

                            <div className="bnt2_right">
                                {delButton}
                                <a href={e[3]} target="_blank" title="下载" download={e[3]}
                                   className="te_download_a"><Button icon="download"/></a>
                                <Button style={{float: 'right'}} type="" icon="export" title="使用" value={e[0]}
                                        onClick={this.showModal.bind(_this,e)}></Button>
                                {eysOnButton}
                            </div>

                    </pre>
                </Panel>
            });
        }
    }

    render() {
        $(".ant-menu-submenu-title").each(function () {
            if ($(this)[0].textContent == sessionStorage.getItem("lastClickMenuName")) {
                $(this).css("background-color", "#e5f2fe");
            } else {
                $(this).css("background-color", "");
            }
        });
        // var title = <span>
        //     <span className="antnest_talk">确定要删除该课件?</span>
        //     <Checkbox onChange={this.isDeleteAll}>同步删除备课计划下的课件</Checkbox>
        // </span>;
        return (
            <div>
                {/* <ConfirmModal ref="confirmModal"
                              title={title}
                              onConfirmModalCancel={this.closeConfirmModal}
                              onConfirmModalOK={this.batchDeleteMaterial}
                ></ConfirmModal> */}
                <Modal
                            className="calmModal"
                            visible={this.state.changeConfirmModalVisible}
                            title="提示"
                            onCancel={this.closeConfirmModal}
                            maskClosable={false} //设置不允许点击蒙层关闭
                            transitionName=""  //禁用modal的动画效果
                            footer={[
                                <button type="primary" className="login-form-button examination_btn_blue calmSure" onClick={this.batchDeleteMaterial}  >确定</button>,
                                <button type="ghost" className="login-form-button examination_btn_white calmCancle" onClick={this.closeConfirmModal} >取消</button>
                            ]}
                        >
                            <div className="isDel">
                                <img className="sadFeel" src={require("../../jquery-photo-gallery/icon/sad.png")} />
                                确定要删除该课件?
                                <Checkbox onChange={this.isDeleteAll}>同步删除备课计划下的课件</Checkbox>
                            </div>
                        </Modal>

                {/* <ConfirmModal ref="delScheduleMateriaConfirmModal"
                              title="确定要删除该课件?222"
                              onConfirmModalCancel={this.closeDelScheduleMateriaConfirmModal}
                              onConfirmModalOK={this.deleteScheduleMaterials}
                ></ConfirmModal> */}
                 <Modal
                            className="calmModal"
                            visible={this.state.sureDelThisTitle}
                            title="提示"
                            onCancel={this.closeDelScheduleMateriaConfirmModal}
                            maskClosable={false} //设置不允许点击蒙层关闭
                            transitionName=""  //禁用modal的动画效果
                            footer={[
                                <button type="primary" className="login-form-button examination_btn_blue calmSure" onClick={this.deleteScheduleMaterials}  >确定</button>,
                                <button type="ghost" className="login-form-button examination_btn_white calmCancle" onClick={this.closeDelScheduleMateriaConfirmModal} >取消</button>
                            ]}
                        >
                            <div className="isDel">
                                <img className="sadFeel" src={require("../../jquery-photo-gallery/icon/sad.png")} />
                                确定要删除该课件?
                            </div>
                        </Modal>
                <div className="group_cont">
                    <UseKnowledgeComponents ref="useKnowledgeComponents"></UseKnowledgeComponents>
                    <Collapse activeKey={this.activeKey} ref="collapse">
                        {this.coursePanelChildren}
                    </Collapse>
                </div>
                <Pagination total={this.state.totalCount} pageSize={getPageSize()} current={this.state.currentPage}
                            onChange={this.onChange}/>
            </div>
        );
    }

}
;

export default CourseWare;
