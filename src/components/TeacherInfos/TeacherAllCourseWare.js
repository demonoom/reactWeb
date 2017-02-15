import React, { PropTypes } from 'react';
import { Card, Checkbox,Collapse,Icon,Button,Pagination,message,Modal} from 'antd';
import { doWebService } from '../../WebServiceHelper';
import UseKnowledgeComponents from '../UseKnowledgeComponents';
const Panel = Collapse.Panel;
const confirm = Modal.confirm;

function callback(key) {
    // console.log(key);
    // alert(key);
}

var courseWare;
var courseWareList;
var activeKey = new Array();
var coursePanelChildren;
const TeacherAllCourseWare = React.createClass({

    getInitialState() {
        courseWare = this;
        return {
            courseListState:this.props.courseList,
            activeKey:[],
            currentPage:1,
            totalCount:0,
            ident:'',
            teachScheduleId:'',
            optType:'',
            knowledgeName:'',
            dataFilter:'self'
        };
    },

    initCourseWareList(){
        courseWare.setState({courseListState:[]});
        courseWare.setState({totalCount:0});
    },

    componentDidMount(){
        console.log("did");
        var initPageNo = 1;
        courseWare.getTeachPlans(sessionStorage.getItem("ident"),initPageNo);
    },


    getTeachPlans(ident,pageNo){
        courseWare.setState({
            ident:ident,
        })
        var param = {
            "method":'getMaterialsByUid',
            "userId":ident,
            "mtype":"-1",
            "pageNo":pageNo,
        };
        doWebService(JSON.stringify(param), {
            onResponse : function(ret) {
                console.log("teachMSG:"+ret.msg+"=="+ret.response.length);
                courseWareList=new Array();
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
                    var fileType=fileName.substring(fileName.lastIndexOf(".")+1);
                    var pointId = e.pointId;
                    var createTime = courseWare.getLocalTime(e.createTime);
                    var fileTypeLogo;
                    var type = e.type;
                    var htmlPath="";
                    var collectCount = e.collectCount; //收藏次数即现今的点赞次数
                    if(fileType=="ppt"){
                        fileTypeLogo = "icon_geshi icon_ppt";
                        htmlPath = e.htmlPath;
                    }else if(fileType=="mp4"){
                        fileTypeLogo = "icon_geshi icon_mp4";
                    }else if(fileType=="flv"){
                        fileTypeLogo = "icon_geshi icon_flv";
                    }else if(fileType=="pdf"){
                        fileTypeLogo = "icon_geshi icon_pdf";
                    }else if(fileType=="pptx"){
                        fileTypeLogo = "icon_geshi icon_pptx";
                        htmlPath = e.htmlPath;
                    }else if(fileType=="mp3"){
                        fileTypeLogo = "icon_geshi icon_mp3";
                    }
                    activeKey.push(fileName+"#"+createTime);
                    courseWareList.push([id,fileName,userName,path,pdfPath,fileType,pointId,createTime,fileTypeLogo,htmlPath,type,collectCount,userId]);
                });
                courseWare.buildKonwledgePanels(courseWareList);
                courseWare.setState({courseListState:courseWareList});
                var pager = ret.pager;
                courseWare.setState({totalCount:parseInt(pager.pageCount)*15});
            },
            onError : function(error) {
                message.error(error);
            }

        });
    },
    getLocalTime:function (nS) {
        var newDate = new Date(parseInt(nS)).toLocaleString().replace(/:\d{1,2}$/,' ');
        return newDate;
    },

    //分页响应事件
    onChange(page) {
        console.log(page);
        courseWare.getTeachPlans(sessionStorage.getItem("ident"),page);
        this.setState({
            currentPage: page,
        });
    },

    //删除资源库下的材料（课件）
    batchDeleteMaterial(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var materialIds = target.value;
        confirm({
            title: '确定要删除该课件?',
            content: '',
            onOk() {
                var param = {
                    "method":'batchDeleteMaterial',
                    "ident":sessionStorage.getItem("ident"),
                    "mids":materialIds
                };
                doWebService(JSON.stringify(param), {
                    onResponse : function(ret) {
                        console.log(ret.msg);
                        if(ret.msg=="调用成功" && ret.response==true){
                            message.success("课件删除成功");
                        }else{
                            message.error("课件删除失败");
                        }
                        courseWare.getTeachPlans(sessionStorage.getItem("ident"),courseWare.state.currentPage);
                    },
                    onError : function(error) {
                        message.error(error);
                    }
                });
            },
            onCancel() {},
        });
    },

    //显示使用至备课计划的弹窗
    showModal:function (e) {
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var currentSchedule = target.value;
        this.refs.useKnowledgeComponents.showModal(currentSchedule,"TeacherAllCourseWare",courseWare.state.knowledgeName);
    },

    buildKonwledgePanels:function (courseWareList) {
        if(courseWareList.length==0){
            coursePanelChildren = <img  className="noDataTipImg" src={require('../images/noDataTipImg.png')} />;
        }else{
            coursePanelChildren = courseWareList.map((e, i)=> {
                var eysOnButton ;
                var delButton;
                if(e[9]!=null && e[9]!=""){
                    eysOnButton = <a href={e[9]} target="_blank" title="查看"  style={{ float:'right'}} ><Button icon="eye-o"/></a>
                }
                if(e[12]!=null && e[12]==sessionStorage.getItem("ident")){
                    delButton = <Button style={{ float:'right'}} icon="delete" title="删除" value={e[0]} onClick={courseWare.batchDeleteMaterial}></Button>
                }
                return <Panel header={<span><span type="" className={e[8]}></span><span className="name_file">{e[1]}</span> </span>}  key={e[1]+"#"+e[7]}>
                    <pre>
					<div className="bnt2_tex">
                         <span className="col1">文件类型：{e[5]}</span>
                         <span className="col1">课件名称：{e[1]}</span>
                         <span className="col1">所在知识点：{e[6]}</span>
                         <span className="col1">创建人：{e[2]}</span>
                         <span className="col1">上传时间：{e[7]}</span>
                         <span className="col1">点赞次数：{e[11]}</span>
                      </div>

                            <div className="bnt2_right">
                                {/*<Button value={e.sid} onClick="" className="right_ri">引用微课</Button>*/}
                                {delButton}
                                <a href={e[3]} target="_blank" title="下载" download={e[3]} style={{ float:'right'}}><Button icon="download"/></a>
                                {/*<Button style={{ float:'right'}} icon="download"  title="下载" value={e[3]} onClick={courseWare.downLoadFile}></Button>*/}
                                <Button style={{ float:'right'}} type=""  icon="export" title="使用"  value={e[0]} onClick={this.showModal}></Button>
                                {eysOnButton}
                            </div>

                    </pre>
                </Panel>
            });
        }
    },

    render: function () {
        $(".ant-menu-submenu-title").each(function(){
            if($(this)[0].textContent==sessionStorage.getItem("lastClickMenuName")){
                $(this).css("background-color","#e5f2fe");
            }else{
                $(this).css("background-color","");
            }
        });
        return (
            <div className='ant-tabs ant-tabs-top ant-tabs-line'>
                <UseKnowledgeComponents ref="useKnowledgeComponents"></UseKnowledgeComponents>
			    <div className='ant-tabs-tabpane ant-tabs-tabpane-active'>
                <Collapse defaultActiveKey={activeKey} activeKey={activeKey} ref="collapse" onChange={callback}>
                    {coursePanelChildren}
                </Collapse>
				</div>
                <Pagination total={courseWare.state.totalCount} pageSize={15} current={courseWare.state.currentPage} onChange={this.onChange}/>
            </div>
        );
    },

});

export default TeacherAllCourseWare;
