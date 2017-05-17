import React, {PropTypes} from 'react';
import {Collapse, Button, Pagination, message, Breadcrumb, Icon} from 'antd';
import {isEmpty} from '../../utils/Const';
import ConfirmModal from '../ConfirmModal';
import {getPageSize} from '../../utils/Const';
import {doWebService} from '../../WebServiceHelper';
import UseKnowledgeComponents from '../UseKnowledgeComponents';

const Panel = Collapse.Panel;


var courseWare;
var courseWareList;
var activeKey = [];
var coursePanelChildren;
const TeacherAllCourseWare = React.createClass({

    getInitialState() {
        courseWare = this;
        return {
            courseListState: this.props.courseList,
            activeKey: [],
            currentPage: 1,
            totalCount: 0,
            ident: '',
            teachScheduleId: '',
            optType: '',
            knowledgeName: '',
            dataFilter: 'self'
        };
    },

    initCourseWareList(){
        this.setState({courseListState: []});
        this.setState({totalCount: 0});
    },

    componentDidMount(){
        var initPageNo = 1;
        this.getTeachPlans(sessionStorage.getItem("ident"), initPageNo);
    },


    getTeachPlans(ident, pageNo){
        let _this = this;
        this.setState({
            ident: ident,
        })
        var param = {
            "method": 'getMaterialsByUid',
            "userId": ident,
            "mtype": "-1",
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
                    var pointId = e.pointId;
                    var pointContent = '';

                    if (!pointId) {
                        pointContent = '其它';
                    } else {
                        if (isEmpty(e.point) == false) {
                            pointContent = e.point.content;
                        }
                    }
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
                    }
                    activeKey.push(fileName + "#" + createTime + "#" + id);
                    courseWareList.push([id, fileName, userName, path, pdfPath, fileType, pointContent, createTime, fileTypeLogo, htmlPath, type, collectCount, userId]);
                });
                _this.buildKonwledgePanels(courseWareList);
                _this.setState({courseListState: courseWareList});
                var pager = ret.pager;
                _this.setState({totalCount: parseInt(pager.rsCount)});
            },
            onError: function (error) {
                message.error(error);
            }

        });
    },
    getLocalTime: function (nS) {
        var newDate = new Date(parseInt(nS)).toLocaleString().replace(/:\d{1,2}$/, ' ');
        return newDate;
    },

    //分页响应事件
    onChange(page) {
        this.getTeachPlans(sessionStorage.getItem("ident"), page);
        this.setState({
            currentPage: page,
        });
    },

    //删除资源库下的材料（课件）
    batchDeleteMaterial(){
        let _this = this;
        var materialIds = this.state.delMaterialIds;
        var param = {
            "method": 'batchDeleteMaterial',
            "ident": sessionStorage.getItem("ident"),
            "mids": materialIds
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.response) {
                    message.success("删除成功");
                } else {
                    message.error("删除失败");
                }
                _this.closeConfirmModal();
                _this.getTeachPlans(sessionStorage.getItem("ident"), _this.state.currentPage);
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    //显示使用至备课计划的弹窗
    showModal: function (e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var currentSchedule = target.value;
        this.refs.useKnowledgeComponents.showModal(currentSchedule, "TeacherAllCourseWare", this.state.knowledgeName);
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
        this.showpanle(obj)
    },


    showpanle(obj){
        LP.Start(obj);
    },

    buildKonwledgePanels: function (courseWareList) {
        if (courseWareList.length == 0) {
            coursePanelChildren = <img className="noDataTipImg" src={require('../images/noDataTipImg.png')}/>;
        } else {
            coursePanelChildren = courseWareList.map((e, i) => {
                var eysOnButton;
                var delButton;
                if (e[9] != null && e[9] != "") {
                    eysOnButton =
                        <Button icon="eye-o" style={{float: 'right'}} onClick={event => {
                            this.view(event, e[9], e[1])
                        } }/>
                } else if (isEmpty(e[3]) == false) {
                    eysOnButton =
                        <Button icon="eye-o" style={{float: 'right'}} onClick={event => {
                            this.view(event, e[3], e[1])
                        } }/>
                }
                if (e[12] != null && e[12] == sessionStorage.getItem("ident")) {
                    delButton = <Button style={{float: 'right'}} icon="delete" title="删除" value={e[0]}
                                        onClick={this.showConfirmModal}></Button>
                }
                return <Panel header={<span><span type="" className={e[8]}></span><span
                    className="name_file">{e[1]}</span> </span>} key={e[1] + "#" + e[7] + "#" + e[0]}>
                    <pre>
					<div className="bnt2_tex">
                         <span className="col1">所在知识点：{e[6]}</span>
                         <span className="col1">创建人：{e[2]}</span>
                         <span className="col1">上传时间：{e[7]}</span>
                         <span className="col1">点赞次数：{e[11]}</span>
                      </div>

                            <div className="bnt2_right">
                                {delButton}
                                {/*<Button style={{ float:'right'}} icon="download"  title="下载" value={e[3]} onClick={this.downLoadFile}></Button>*/}
                                <a href={e[3]} target="_blank" title="下载" download={e[3]}
                                   style={{float: 'right'}}><Button icon="download"/></a>
                                <Button style={{float: 'right'}} type="" icon="export" title="使用" value={e[0]}
                                        onClick={this.showModal}></Button>
                                {eysOnButton}
                            </div>

                    </pre>
                </Panel>
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
        this.setState({"delMaterialIds": materialIds});
        this.refs.confirmModal.changeConfirmModalVisible(true);
    },

    closeConfirmModal(){
        this.refs.confirmModal.changeConfirmModalVisible(false);
    },

    render: function () {
        $(".ant-menu-submenu-title").each(function () {
            if ($(this)[0].textContent == sessionStorage.getItem("lastClickMenuName")) {
                $(this).css("background-color", "#e5f2fe");
            } else {
                $(this).css("background-color", "");
            }
        });
        return (<div>
                <div className="public—til—blue">我的资源</div>
				<div className="favorite_scroll">
					<div className='ant-tabs ant-tabs-top ant-tabs-line'>
						<ConfirmModal ref="confirmModal"
									  title="确定要删除该课件?"
									  onConfirmModalCancel={this.closeConfirmModal}
									  onConfirmModalOK={this.batchDeleteMaterial}
						/>
						<UseKnowledgeComponents ref="useKnowledgeComponents" />
						<div className='ant-tabs-tabpane ant-tabs-tabpane-active'>
							<Collapse defaultActiveKey={activeKey} activeKey={activeKey} ref="collapse">
								{coursePanelChildren}
							</Collapse>
						</div>
					</div>
                    <Pagination total={this.state.totalCount} pageSize={getPageSize()} current={this.state.currentPage}
                                onChange={this.onChange}/>
                </div>
            </div>
        );
    },

});

export default TeacherAllCourseWare;
