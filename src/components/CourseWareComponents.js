import React, {PropTypes} from 'react';
import { Checkbox, Collapse,  Button, Pagination, message} from 'antd';
import UseKnowledgeComponents from './UseKnowledgeComponents';
import {doWebService} from '../WebServiceHelper';
import {getPageSize} from '../utils/Const';
import {isEmpty} from '../utils/Const';
import ConfirmModal from './ConfirmModal';
const Panel = Collapse.Panel;


var courseWare;
var courseWareList;
var activeKey = new Array();
var coursePanelChildren;
const CourseWareComponents = React.createClass({

    getInitialState() {
        courseWare = this;
        return {
            activeKey: [],
            currentPage: 1,
            totalCount: 0,
            ident: '',
            teachScheduleId: '',
            optType: '',
            knowledgeName: '',
            dataFilter: 'self',
            isDeleteAllSubject: false,   //是否同步删除资源库下的题目
        };
    },

    initCourseWareList(){
        courseWare.setState({courseListState: []});
        courseWare.setState({totalCount: 0});
    },



    getTeachPlans(ident, teachScheduleId, optType, pageNo, knowledgeName, dataFilter,comeFrom){
        courseWare.setState({
            ident: ident,
            teachScheduleId: teachScheduleId,
            optType: optType,
            knowledgeName: knowledgeName,
            dataFilter: dataFilter
        })
        var param;
        if (optType == "bySchedule") {
            param = {
                "method": 'getMaterialsBySheduleId',
                "scheduleId": teachScheduleId,
                "pageNo": pageNo
            };
            doWebService(JSON.stringify(param), {
                onResponse: function (ret) {
                    courseWareList = new Array();
                    courseWareList.splice(0);
                    var response = ret.response;
                    response.forEach(function (e) {
                        var id = e.id;
                        var fileName = e.name;
                        var userName = e.user.userName;
                        var path = e.path;
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
                        }
                        var createTime = courseWare.getLocalTime(e.createTime);
                        activeKey.push(fileName + "#" + createTime+"#"+id);
                        courseWareList.push([id, fileName, userName, path, pdfPath, fileType, pointId, createTime, fileTypeLogo, htmlPath, collectCount]);
                    });
                    courseWare.buildPanels(courseWareList);
                    courseWare.setState({courseListState: courseWareList});
                    var pager = ret.pager;
                    courseWare.setState({totalCount: parseInt(pager.rsCount)});
                    if(isEmpty(comeFrom)==false && "fromUpload"==comeFrom){
                        courseWare.setState({"currentPage":1});
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
                "pageNo": pageNo,
            };
            doWebService(JSON.stringify(param), {
                onResponse: function (ret) {
                    courseWareList = new Array();
                    courseWareList.splice(0);
                    var response = ret.response;
                    response.forEach(function (e) {
                        var id = e.id;
                        var fileName = e.name;
                        //用户编号，用来判断当前的课件是否是自己上传的，如果是，则支持删除功能
                        var userId = e.userId;
                        var userName = e.user.userName;
                        var path = e.path;
                        var pdfPath = e.pdfPath;
                        var fileType = fileName.substring(fileName.lastIndexOf(".") + 1);
                        var pointId = e.point.content;
                        var createTime = courseWare.getLocalTime(e.createTime);
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
                        }
                        activeKey.push(fileName + "#" + createTime+"#"+id);
                        courseWareList.push([id, fileName, userName, path, pdfPath, fileType, pointId, createTime, fileTypeLogo, htmlPath, type, collectCount, userId]);
                    });
                    courseWare.buildKonwledgePanels(courseWareList);
                    courseWare.setState({courseListState: courseWareList});
                    var pager = ret.pager;
                    courseWare.setState({totalCount: parseInt(pager.rsCount)});
                    if(isEmpty(comeFrom)==false && "fromUpload"==comeFrom){
                        courseWare.setState({"currentPage":1});
                    }
                },
                onError: function (error) {
                    message.error(error);
                }

            });
        }
    },
    getLocalTime: function (nS) {
        var newDate = new Date(parseInt(nS)).toLocaleString().replace(/:\d{1,2}$/, ' ');
        return newDate;
    },

    onChange(page) {
        courseWare.getTeachPlans(courseWare.state.ident, courseWare.state.teachScheduleId, courseWare.state.optType, page, courseWare.state.knowledgeName, courseWare.state.dataFilter);
        this.setState({
            currentPage: page,
        });

    },

    showModal: function (e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var currentSchedule = target.value;
        this.refs.useKnowledgeComponents.showModal(currentSchedule, "courseWare", courseWare.state.knowledgeName);
    },

    isDeleteAll(e){
        courseWare.setState({isDeleteAllSubject: e.target.checked});
    },

    showDelScheduleMateriaConfirmModal(e){
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var materialIds = target.value;
        courseWare.setState({"delMaterialIds":materialIds});
        courseWare.refs.delScheduleMateriaConfirmModal.changeConfirmModalVisible(true);
    },

    closeDelScheduleMateriaConfirmModal(){
        courseWare.refs.delScheduleMateriaConfirmModal.changeConfirmModalVisible(false);
    },

    deleteScheduleMaterials(){
        courseWare.deleteScheduleMaterialsById(courseWare.state.delMaterialIds);
        courseWare.closeDelScheduleMateriaConfirmModal();
    },

    //删除教学进度下的材料（课件）
    deleteScheduleMaterialsById(materialIds){
        if (courseWare.state.isDeleteAllSubject) {
            //同步删除资源库下的资源
            courseWare.setState({isDeleteAllSubject: false});
        } else {
            var param = {
                "method": 'deleteScheduleMaterials',
                "ident": sessionStorage.getItem("ident"),
                "scheduleId": courseWare.state.teachScheduleId,
                "materialIds": materialIds
            };
            doWebService(JSON.stringify(param), {
                onResponse: function (ret) {
                    if (ret.msg == "调用成功" && ret.response == true) {
                        message.success("课件删除成功");
                    } else {
                        message.error("课件删除失败");
                    }
                    courseWare.getTeachPlans(sessionStorage.getItem("ident"), courseWare.state.teachScheduleId, "bySchedule", courseWare.state.currentPage, courseWare.state.knowledgeName)
                },
                onError: function (error) {
                    message.error(error);
                }
            });
        }
    },

    showConfirmModal(e){
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var materialIds = target.value;
        courseWare.setState({"delMaterialIds":materialIds});
        courseWare.refs.confirmModal.changeConfirmModalVisible(true);
    },

    closeConfirmModal(){
        courseWare.refs.confirmModal.changeConfirmModalVisible(false);
    },

    batchDeleteMaterial(){
        courseWare.batchDeleteMaterialById(courseWare.state.delMaterialIds);
        courseWare.closeConfirmModal();
    },

    //删除资源库下的材料（课件）
    batchDeleteMaterialById(materialIds){
        var param;
        if (courseWare.state.isDeleteAllSubject) {
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
                courseWare.getTeachPlans(courseWare.state.ident, courseWare.state.teachScheduleId, courseWare.state.optType, courseWare.state.currentPage);
            },
            onError: function (error) {
                message.error(error);
            }
        });
        courseWare.setState({isDeleteAllSubject: false});

    },

    view: function (e, url, tit) {
        e = e || window.event;
        if (e.nativeEvent) {
            e.nativeEvent.stopImmediatePropagation();
        }
        e.stopPropagation();
        e.preventDefault();
        e.cancelBubble = true;
        let obj = {title: tit, url: url, width: '380px'}
        LP.Start(obj);
    },

    buildPanels: function (courseWareList) {
        if (courseWareList.length == 0) {
            coursePanelChildren = <img className="noDataTipImg" src={require('./images/noDataTipImg.png')}/>;
        } else {
            coursePanelChildren = courseWareList.map((e, i)=> {
                var eysOnButton;
                if(isEmpty(e[5])==false && ("pptx"==e[5] || "ppt"==e[5])){
                    if (isEmpty(e[9])==false) {
                        eysOnButton =
                            <Button icon="eye-o" style={{float: 'right'}} onClick={event => {this.view(event,e[9],e[1])} } />
                    }
                }else{
                    if(isEmpty(e[3])==false){
                        eysOnButton =
                            <Button icon="eye-o" style={{float: 'right'}} onClick={event => {this.view(event,e[3],e[1])} } />
                    }
                }
                return <Panel header={<span><span type="" className={e[8]}></span><span
                    className="name_file">{e[1]}</span> </span>} key={e[1] + "#" + e[7]+"#"+e[0]}>
                    <pre>
					 <div className="bnt2_tex">
                         <span className="bai"><span className="col1">所在知识点：</span><span className="col2">{e[6]}</span></span>
                         <span><span className="col1">创建人：</span><span className="col2">{e[2]}</span></span>
                         <span><span className="col1">上传时间：</span><span className="col2">{e[7]}</span></span>
                         <span><span className="col1">点赞次数：</span><span className="col2">{e[10]}</span></span>
					</div>
					<div className="bnt2_right">
                         <Button style={{float: 'right'}} icon="delete" title="删除" value={e[0]}
                                 onClick={this.showDelScheduleMateriaConfirmModal}></Button>
                        <a href={e[3]} target="_blank" title="下载" download={e[3]} className="te_download_a"><Button
                            icon="download"/></a>
                        {eysOnButton}
					</div>
                    </pre>
                </Panel>
            });
        }
    },

    downLoadFile: function (e) {
        window.open(e.target.value);
    },

    viewFile: function (e) {
        window.location.href = e.target.value;
    },

    buildKonwledgePanels: function (courseWareList) {
        if (courseWareList.length == 0) {
            coursePanelChildren = <img className="noDataTipImg"   onClick={$.openPhotoGallery} src={require('./images/noDataTipImg.png')}/>;
        } else {
            coursePanelChildren = courseWareList.map((e, i)=> {
                var eysOnButton;
                var delButton;
                if(isEmpty(e[5])==false && ("pptx"==e[5] || "ppt"==e[5])) {
                    if (e[9] != null && e[9] != "") {
                        eysOnButton =
                            <Button icon="eye-o" style={{float: 'right'}} onClick={event => {this.view(event,e[9],e[1])} } />
                    }
                }
                else {
                    if(isEmpty(e[3])==false){
                        eysOnButton =
                            <Button icon="eye-o" style={{float: 'right'}} onClick={event => {this.view(event,e[3],e[1])} } />
                    }
                }
                if (e[12] != null && e[12] == sessionStorage.getItem("ident")) {
                    delButton = <Button style={{float: 'right'}} icon="delete" title="删除" value={e[0]}
                                        onClick={courseWare.showConfirmModal}></Button>
                }
                return <Panel header={<span><span type="" className={e[8]}></span><span
                    className="name_file">{e[1]}</span> </span>} key={e[1] + "#" + e[7]+"#"+e[0]}>
                    <pre>
					<div className="bnt2_tex">
                         <span className="bai"><span className="col1">所在知识点：{e[6]}</span></span>
                         <span><span className="col1">创建人：{e[2]}</span></span>
                         <span><span className="col1">上传时间：{e[7]}</span></span>
                         <span><span className="col1">点赞次数：{e[11]}</span></span>
                      </div>

                            <div className="bnt2_right">
                                {delButton}
                                <a href={e[3]} target="_blank" title="下载" download={e[3]}
                                   className="te_download_a"><Button icon="download"/></a>
                                <Button style={{float: 'right'}} type="" icon="export" title="使用" value={e[0]}
                                        onClick={this.showModal}></Button>
                                {eysOnButton}
                            </div>

                    </pre>
                </Panel>
            });
        }
    },

    render: function () {
        $(".ant-menu-submenu-title").each(function () {
            if ($(this)[0].textContent == sessionStorage.getItem("lastClickMenuName")) {
                $(this).css("background-color", "#e5f2fe");
            } else {
                $(this).css("background-color", "");
            }
        });
        var title=<span>
            <span className="antnest_talk">确定要删除该课件?</span>
            <Checkbox onChange={courseWare.isDeleteAll}>同步删除备课计划下的课件</Checkbox>
        </span>;
        return (
            <div>
                <ConfirmModal ref="confirmModal"
                              title={title}
                              onConfirmModalCancel={courseWare.closeConfirmModal}
                              onConfirmModalOK={courseWare.batchDeleteMaterial}
                ></ConfirmModal>
                <ConfirmModal ref="delScheduleMateriaConfirmModal"
                              title="确定要删除该课件?"
                              onConfirmModalCancel={courseWare.closeDelScheduleMateriaConfirmModal}
                              onConfirmModalOK={courseWare.deleteScheduleMaterials}
                ></ConfirmModal>
                <div>
                    <UseKnowledgeComponents ref="useKnowledgeComponents"></UseKnowledgeComponents>
                    <Collapse defaultActiveKey={activeKey} activeKey={activeKey} ref="collapse"  >
                        {coursePanelChildren}
                    </Collapse>
                </div>
                <Pagination total={courseWare.state.totalCount} pageSize={getPageSize()} current={courseWare.state.currentPage}
                            onChange={this.onChange}/>
            </div>
        );
    },

});

export default CourseWareComponents;
