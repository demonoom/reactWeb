import React, {PropTypes} from 'react';
import {Card, Button, Row, Col, message,Icon,Tabs,Pagination,Modal,Input,Collapse,Popover,Table,Transfer} from 'antd';
import Favorites from '../Favorites';
import UseKnowledgeComponents from '../UseKnowledgeComponents';
import {doWebService} from '../../WebServiceHelper';
import {isEmpty} from '../../utils/Const';
import {getLocalTime} from '../../utils/utils';
import {getPageSize} from '../../utils/Const';
import ConfirmModal from '../ConfirmModal';

const TabPane = Tabs.TabPane;
const Panel = Collapse.Panel;

var courseWareList;
var coursePanelChildren;
var activeKey = new Array();
var subjectList=[];
var data = [];
var subjectTableColumns  = [{
    title: '出题人',
    className:'ant-table-selection-user',
    dataIndex: 'name',
}, {
    title: '内容',
    className:'ant-table-selection-cont',
    dataIndex: 'content',
},{
    title: '题型',
    className:'ant-table-selection-topic',
    dataIndex: 'subjectType',
    filters: [{
        text: '单选题',
        value: '单选题',
    }, {
        text: '多选题',
        value: '多选题',
    }, {
        text: '判断题',
        value: '判断题',
    }, {
        text: '简答题',
        value: '简答题',
    }, {
        text: '材料题',
        value: '材料题',
    },],
    onFilter: (value, record) => record.subjectType.indexOf(value) === 0,
},{
    title: '分值',
    className:'ant-table-selection-score',
    dataIndex: 'subjectScore',
}, {
    title: '操作',
    className:'ant-table-selection-score3',
    dataIndex: 'subjectOpt',
},
];

var userGroupsColumns = [ {
    title: '群聊头像',
    dataIndex: 'groupPhoto',
},{
    title: '群聊名称',
    dataIndex: 'groupName',
},{
    title: '群聊人数',
    dataIndex: 'userCount',
},{
    title: '群设置',
    dataIndex: 'groupSet',
},];


var personCenter;
const PersonCenterComponents = React.createClass({

    getInitialState() {
        personCenter = this;
        return {
            userInfo: personCenter.props.userInfo,
            isExist: false,
            optType: 'userDetail',
            currentChatGroupPage:1,
            userGroupsData:[],
        };
    },

    /**
     * 判断当前个人中心显示的人员是否是当前用户的联系人
     */
    checkPersonIsInContacts(userInfo){
        var isExist = false;
        var userContactsData = personCenter.props.userContactsData;
        for (var i = 0; i < userContactsData.length; i++) {
            var contactJson = userContactsData[i];
            if (contactJson.key == userInfo.user.colUid) {
                isExist = true;
                break;
            }
        }
        return isExist;
    },

    /**
     * 获取个人中心需要的数据,老师和学生可通用,后期需要什么再添加
     */
    getPersonalCenterData(userId){
        var param = {
            "method": 'getPersonalCenterData',
            "userId": userId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var userInfo = ret.response;
                var isExist = personCenter.checkPersonIsInContacts(userInfo);
                personCenter.isFollow(userInfo);
                personCenter.setState({"userInfo": userInfo, "isExist": isExist,"optType": 'userDetail'});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 获取联系人列表
     */
    isFollow(userInfo){
        var param = {
            "method": 'isFollow',
            "userId": sessionStorage.getItem("ident"),
            "toUserId": userInfo.user.colUid
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var isFollow = ret.response;
                personCenter.setState({"isFollow": isFollow});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 发消息
     */
    sendMessage(e){
        personCenter.props.callBackTurnToMessagePage(personCenter.state.userInfo.user);
    },
    /**
     * 学生的提问
     */
    studentAsk(){
        personCenter.setState({"optType":"turnToAsk","activeKey":"我发起过的提问"});
    },
    /**
     * 学生的学习轨迹
     */
    studentStudyTrack(){
        personCenter.setState({"optType":"turnStudyTrack","activeKey":"studyTrack"});
    },
    /**
     * 关注联系人
     */
    followUser(){
        var param = {
            "method": 'follow',
            "userId": sessionStorage.getItem("ident"),
            "toUserId": personCenter.state.userInfo.user.colUid
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    message.success("关注成功");
                    personCenter.setState({"isFollow": true});
                } else {
                    message.error(ret.msg);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 关注联系人
     */
    unfollowUser(){
        var param = {
            "method": 'unFollow',
            "userId": sessionStorage.getItem("ident"),
            "toUserId": personCenter.state.userInfo.user.colUid
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.msg == "调用成功" && ret.success == true) {
                    message.success("取消关注成功");
                    personCenter.setState({"isFollow": false});
                } else {
                    message.error(ret.msg);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 获取个人中心的关注列表
     * @param userId
     */
    getMyFollows(userId){

        var param = {
            "method": 'getMyFollows',
            "userId": userId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.msg=="调用成功" && ret.success==true){
                    var response = ret.response;
                    var followsUserArray=[];
                    response.forEach(function (e) {
                        var followUser = e.user;
                        var course = e.course;
                        var userName = followUser.userName;
                        var courseName = course.colCourse;
                        var userHeaderIcon = <img src={followUser.avatar}></img>;
                        var userJson = {key:followUser.colUid,"userName":userName,"courseName":courseName,userHeaderIcon:userHeaderIcon,"userObj":followUser};
                        // followsUserArray.push(userJson);
                        var followsCard = <Card key={followUser.colUid} id={followUser} className="focus" onClick={personCenter.getPersonalCenterData.bind(personCenter,followUser.colUid)}>
                            <span className="person_user_bg upexam_float">
                                <a target="_blank"><img
                                    alt={userName + '头像'} width="100%" src={e.user.avatar}
                                    className="person_user"/></a>
                            </span>
                            <div className="custom-card focus_2">
                                <div className="focus_1">
                                    <span className="antnest_name focus_3">{e.user.userName}</span>
                                </div>
                                <div className="focus_3">学校：{e.user.schoolName}</div>
                                <div className="focus_3">科目：{courseName}</div>
                            </div>
                        </Card>;
                        followsUserArray.push(followsCard);
                    });
                    personCenter.setState({"optType":"getMyFollows","activeKey":"userFollows","followsUserArray":followsUserArray});
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 获取我的收藏列表
     */
    getUserFavorite(){
        var user = personCenter.state.userInfo.user;
        personCenter.setState({"optType":"userFavorite","currentUser":user,"studentId":user.colUid,"activeKey":"1"});
    },

    /**
     * 获取我的题目
     */
    getMySubjects(){
        var userId = personCenter.state.userInfo.user.colUid;
        //personCenter.props.callBackGetMySubjects(personCenter.state.userInfo.user);
        personCenter.getUserSubjectsByUid(userId,1);
    },

    getUserSubjectsByUid:function (ident,pageNo) {
        var param = {
            "method":'getUserSubjectsByUid',
            "userId":ident,
            "pageNo":pageNo
        };

        doWebService(JSON.stringify(param), {
            onResponse : function(ret) {
                subjectList.splice(0);
                data.splice(0);
                var response = ret.response;
                if(response==null || response.length==0){
                    personCenter.setState({totalCount:0});
                }else {
                    response.forEach(function (e) {
                        var key = e.id;
                        var name=e.user.userName;
                        var popOverContent = '<div><span class="answer_til answer_til_1">题目：</span>'+e.content+'<hr/><span class="answer_til answer_til_2">答案：</span>'+e.answer+'</div>';
                        var content=<Popover placement="rightTop" content={<article id='contentHtml' className='content Popover_width' dangerouslySetInnerHTML={{__html: popOverContent}}></article>}><article id='contentHtml' className='content' dangerouslySetInnerHTML={{__html: e.content}}></article></Popover>;
                        var subjectType=e.typeName;
                        var subjectScore=e.score;
                        if(parseInt(e.score)<0)
                        {
                            subjectScore='--';
                        }
                        var answer = e.answer;
                        var subjectOpt=<div><Button style={{ }} type=""  value={e.id} onClick={personCenter.showModal}  icon="export" title="使用" className="score3_i"></Button></div>;
                        data.push({
                            key: key,
                            name: name,
                            content: content,
                            subjectType:subjectType,
                            subjectScore:subjectScore,
                            subjectOpt:subjectOpt,
                            answer:answer
                        });
                        var pager = ret.pager;
                        personCenter.setState({
                            totalSubjectCount: parseInt(pager.rsCount),
                            "currentUser": e.user,
                            "optType": "getUserSubjects",
                            "activeKey": 'userSubjects'
                        });
                    });
                }
            },
            onError : function(error) {
                message.error(error);
            }

        });
    },

    //弹出题目使用至备课计划的窗口
    showModal:function (e) {
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var currentKnowledge = target.value;
        personCenter.refs.useKnowledgeComponents.showModal(currentKnowledge,"TeacherAllSubjects",personCenter.state.knowledgeName);
    },

    /**
     * 获取我的资源
     */
    getMyCourseWares(){
        //personCenter.props.callBackGetMyCourseWares(personCenter.state.userInfo.user);
        personCenter.getTeachPlans(personCenter.state.userInfo.user.colUid,1);
    },

    getTeachPlans(ident,pageNo){
        personCenter.setState({
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
                courseWareList=new Array();
                courseWareList.splice(0);
                var response = ret.response;
                let user;
                response.forEach(function (e) {
                    var id = e.id;
                    var fileName = e.name;
                    //用户编号，用来判断当前的课件是否是自己上传的，如果是，则支持删除功能
                    var userId = e.userId;
                    user = e.user;
                    var userName = e.user.userName;
                    var path = e.path;
                    var pdfPath = e.pdfPath;
                    var fileType=fileName.substring(fileName.lastIndexOf(".")+1);
                    var pointId = e.pointId;
                    var pointContent = '';

                    if(!pointId){
                        pointContent = '其它';
                    }else{
                        pointContent = e.point.content;
                    }

                    var createTime = getLocalTime(e.createTime);
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
                    activeKey.push(fileName+"#"+createTime+"#"+id);
                    courseWareList.push([id,fileName,userName,path,pdfPath,fileType,pointContent,createTime,fileTypeLogo,htmlPath,type,collectCount,userId]);
                });
                personCenter.buildKonwledgePanels(courseWareList);
                personCenter.setState({
                    courseListState: courseWareList,
                    "currentUser": user,
                    "optType": "getUserCourseWares",
                    "activeKey": 'userCourseWares',
                    totalCourseWareCount: parseInt(ret.pager.rsCount)
                });
            },
            onError : function(error) {
                message.error(error);
            }

        });
    },

    //显示使用至备课计划的弹窗
    showUseKnowledgeModal:function (e) {
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var currentSchedule = target.value;
        personCenter.refs.useKnowledgeComponents.showModal(currentSchedule,"TeacherAllCourseWare",personCenter.state.knowledgeName);
    },

    buildKonwledgePanels:function (courseWareList) {
        if(courseWareList.length==0){
            coursePanelChildren = <img  className="noDataTipImg" src={require('../images/noDataTipImg.png')} />;
        }else{
            coursePanelChildren = courseWareList.map((e, i)=> {
                var eysOnButton ;
                var delButton;
                if(e[9]!=null && e[9]!=""){
                    eysOnButton = <Button icon="eye-o" style={{float: 'right'}} onClick={event => {this.viewMateria(event,e[9],e[1])} } />
                }
                return <Panel header={<span><span type="" className={e[8]}></span><span className="name_file">{e[1]}</span> </span>}  key={e[1]+"#"+e[7]+"#"+e[0]}>
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
                                <a href={e[3]} target="_blank" title="下载" download={e[3]} style={{ float:'right'}}><Button icon="download"/></a>
                                <Button style={{ float:'right'}} type=""  icon="export" title="使用"  value={e[0]} onClick={personCenter.showUseKnowledgeModal}></Button>
                                {eysOnButton}
                            </div>

                    </pre>
                </Panel>
            });
        }
    },

    /**
     * 获取我的直播课
     */
    getLiveInfo(userId){
        personCenter.getLiveInfoByUid(userId,1);
    },

    /**
     * 根据用户的id，获取当前用户的直播课
     * @param userId
     * @param pageNo
     */
    getLiveInfoByUid(userId,pageNo){
        let _this =this;
        var param = {
            "method": 'getLiveInfoByUid',
            "userId": userId,
            "pageNo": pageNo,
        };
        var userLiveData=[];
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.msg=="调用成功" && ret.success==true){
                    let user;
                    var response = ret.response;

                    response.forEach(function (e) {

                        var liveCover = e.liveCover;
                        var cover = liveCover.cover;
                        var liveVideos = e.liveVideos;
                        var schoolName = e.schoolName;
                        var startTime = getLocalTime(e.startTime);
                        var title = e.title;
                        user = e.user;
                        var userName = user.userName;
                        var courseName = e.courseName;
                        var id = e.id;
                        var keyIcon='';
                        if(e.password){
                            keyIcon = <span className="right_ri focus_btn key_span"><i className="iconfont key">&#xe621;</i></span>;
                        }
                        var delButton;
                        if(user.colUid == sessionStorage.getItem("ident")){
                            //如果是当前用户，可以删除自己的直播课
                            delButton = <Button icon="delete" className="right_ri star_del" onClick={personCenter.showDeleteLiveVideosConfirmModal.bind(personCenter,id)}></Button>
                        }
                        var liveCard = <Card className="live" >
                            <p className="h3">{title}</p>
                            <div className="live_img"  id={id} onClick={personCenter.confirmVideoPwd.bind(personCenter, e) }  >
                                <img className="attention_img"    width="100%" src={cover} />
                                <div className="live_green"><span>{schoolName}</span></div>
                            </div>
                            <div className="custom-card"  >
                                <ul className="live_cont">
                                    <li className="li_live_span_3">
                                        <span className="attention_img2"><img src={user.avatar}></img></span>
                                        <span className="live_span_1 live_span_3">{userName}</span>
                                        <span className="right_ri live_span_2">{startTime}</span>
                                    </li>
                                    <li>
                                        <span className="live_color live_orange">{courseName}</span>
                                        {keyIcon}
                                        {delButton}
                                    </li>
                                </ul>
                            </div>
                        </Card>;
                        userLiveData.push(liveCard);
                    });

                    personCenter.setState({
                        "totalLiveCount": parseInt(ret.pager.rsCount),
                        "userLiveData": userLiveData,
                        "optType": "getLiveInfoByUid",
                        "activeKey": "userLiveInfos"
                    });
                }


            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    showDeleteLiveVideosConfirmModal(id){
        personCenter.setState({"delLiveVideoIds":id});
        personCenter.refs.deleteLiveVideosConfirmModal.changeConfirmModalVisible(true);
    },

    closeDeleteLiveVideosConfirmModal(){
        personCenter.refs.deleteLiveVideosConfirmModal.changeConfirmModalVisible(false);
    },

    confirmVideoPwd: function (obj) {
        debugger;
        if (parseInt(sessionStorage.getItem("ident")) == personCenter.state.userInfo.user.colUid) {
            return personCenter.view(obj);
        }
        var password = obj.password;

        if (password) {
            let _this = this;
            Modal.confirm({
                title: '请输入密码',
                content: <Input id="tmppwd"  />,
                okText: '确定',
                cancelText: '取消',
                onOk: personCenter.videoPwdModalHandleOk.bind(_this, password, obj),
            });
        } else {
            personCenter.view(obj);
        }
    },
    /**
     * 验证直播课的密码是否正确
     * @param pwd
     * @param obj
     */
    videoPwdModalHandleOk: function (pwd, obj) {
        if (pwd == $('#tmppwd').val()) {
            this.view(obj);
        } else {
            message.warn('密码错误!')
        }
    },

    view: function (objref) {
        if (!objref.liveVideos[0]) {
            message.info("无效的视频！");
            return;
        }
        let obj = {
            title: objref.title,
            url: "",
            param: objref.liveVideos,
            htmlMode: true,
            width: '400px',
        }
        personCenter.props.onPreview(obj)
    },
    /**
     * 预览资源文件
     * @param e
     * @param url
     * @param tit
     */
    viewMateria: function (e, url, tit) {
        e = e || window.event;
        if (e.nativeEvent) {
            e.nativeEvent.stopImmediatePropagation();
        }
        e.stopPropagation();
        e.preventDefault();
        e.cancelBubble = true;
        let obj = {title: tit, url: url, width: '380px'}
        this.props.onPreview(obj)
    },

    /**
     * 进入系统平台规则显示页面
     */
    turnToPlatformRulePage(e){
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var urlType = target.value;

        if(isEmpty(urlType)==false && urlType=="level"){
            personCenter.setState({"optType":"getScoreOrLevelPage","activeKey":"userScores","urlType":urlType});
        }else{
            personCenter.setState({"optType": "scoreDetail","activeKey":"platformRulePage"});
        }
    },

    /**
     * 跳转到积分详情或等级说明的页面
     * @param e
     */
    turnToScoreDetailPage(){
        personCenter.setState({"optType":"getScoreOrLevelPage","activeKey":"userScores","urlType":"score"});
    },

    /**
     * 平台规则页面tab切换响应函数
     * @param key
     */
    platformRulePageChange(key){
        personCenter.setState({"optType":"scoreDetail","activeKey":key});
    },

    returnPersonCenter(){
        personCenter.setState({"optType": 'userDetail'});
    },

    returnToChatGroupMessagePage(){
        personCenter.setState({"optType": 'getUserChatGroup'});
    },

    onSubjectPageChange(page){
        var userId = personCenter.state.userInfo.user.colUid;
        personCenter.getUserSubjectsByUid(userId,page);
        personCenter.setState({
            currentSubjectPage: page,
        });
    },

    // ------------------------群组操作

    getUserChatGroup(){
        personCenter.getUserChatGroupById(personCenter.state.currentChatGroupPage);
    },

    /**
     * 获取当前用户的群组
     */
    getUserChatGroupById(pageNo){
        var param = {
            "method": 'getUserChatGroup',
            "userId": sessionStorage.getItem("ident"),
            "pageNo": pageNo
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.msg=="调用成功" && ret.success==true){
                    var response = ret.response;
                    var charGroupArray = [];
                    response.forEach(function (e) {
                        var chatGroupId = e.chatGroupId;
                        var chatGroupName = e.name;
                        var membersCount = e.members.length;
                        var groupMemebersPhoto=[];
                        for(var i=0;i<e.members.length;i++){
                            var member = e.members[i];
                            var memberAvatarTag = <img src={member.avatar} ></img>;
                            groupMemebersPhoto.push(memberAvatarTag);
                            if(i>=3){
                                break;
                            }
                        }
                        //var imgTag = <div ><img src={ownerPhoto}  className="antnest_38_img" ></img></div>;
                        var imgTag = <div className="maaee_group_face">{groupMemebersPhoto}</div>;
                        switch (groupMemebersPhoto.length){
                            case 1:
                                imgTag = <div className="maaee_group_face1">{groupMemebersPhoto}</div>;
                                break;
                            case 2:
                                imgTag = <div className="maaee_group_face2">{groupMemebersPhoto}</div>;
                                break;
                            case 3:
                                imgTag = <div className="maaee_group_face3">{groupMemebersPhoto}</div>;
                                break;
                            case 4:
                                imgTag = <div className="maaee_group_face">{groupMemebersPhoto}</div>;
                                break;
                        }
                        var groupName = chatGroupName;
                        var groupSet = <Button icon="setting" onClick={personCenter.setChatGroup.bind(personCenter,e)}></Button>
                        var chatGroupJson = {key:chatGroupId,groupPhoto:imgTag,'groupName':groupName,"groupObj":e,"userCount":membersCount+"人","groupSet":groupSet};
                        charGroupArray.push(chatGroupJson);
                    });
                    personCenter.setState({"userGroupsData":charGroupArray});
                }
                var pager = ret.pager;
                personCenter.setState({"optType":"getUserChatGroup","totalChatGroupCount":parseInt(pager.rsCount)});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 设置群组
     * @param e
     */
    setChatGroup(groupObj){
        var currentGroupObj = groupObj;
        if(isEmpty(currentGroupObj)==false){
            var members = currentGroupObj.members;
            var membersArray=[];
            members.forEach(function (e) {
                var memberId = e.colUid;
                var memberName = e.userName;
                var userJson = {key:memberId,groupUser:memberName,userInfo:e};
                membersArray.push(userJson);
            });
            personCenter.setState({"optType":'showGroupInfo',"currentMemberArray":membersArray,"currentGroupObj":groupObj});
        }
    },

    onChatGroupPageChange(page){
        personCenter.getUserChatGroupById(page);
        personCenter.setState({
            currentChatGroupPage: page,
        });
    },

    sendGroupMessage(){

    },

    /**
     * 显示创建群组的窗口
     */
    showCreateChatGroup(){
        personCenter.getUserContactsMockData();
        personCenter.setState({"createChatGroupModalVisible":true,"updateGroupId":''});
    },
    /**
     * 创建群组时，获取当前用户的联系人列表
     */
    getUserContactsMockData(){
        const mockData = [];
        var targetKeys = [];
        var param = {
            "method": 'getUserContacts',
            "ident": sessionStorage.getItem("ident"),
        };
        doWebService(JSON.stringify(param), {
            onResponse : function(ret) {
                var response = ret.response;
                response.forEach(function (e) {
                    var userId = e.colUid;
                    var userName = e.userName;
                    var userType = e.colUtype;
                    if(userType!="SGZH" && parseInt(userId) != sessionStorage.getItem("ident")){
                        const data = {
                            key: userId,
                            title: userName,
                        };
                        mockData.push(data);
                    }
                });
                personCenter.setState({ mockData, targetKeys });
            },
            onError : function(error) {
                message.error(error);
            }
        });
    },
    /**
     * 添加群成员时，获取未在群成员列表中的联系人
     */
    getNotMemberUser(){
        const memberData = [];
        memberData.splice(0);
        var memberTargetKeys = [];
        var param = {
            "method": 'getUserContacts',
            "ident": sessionStorage.getItem("ident"),
        };
        doWebService(JSON.stringify(param), {
            onResponse : function(ret) {
                var response = ret.response;
                response.forEach(function (e) {
                    var userId = e.colUid;
                    var userName = e.userName;
                    var isExist = personCenter.checkMemberIsExist(userId);
                    var userType = e.colUtype;
                    if(isExist==false && userType!="SGZH" && parseInt(userId) != sessionStorage.getItem("ident")){
                        const data = {
                            key: userId,
                            title: userName,
                        };
                        memberData.push(data);
                    }
                });
                personCenter.setState({ memberData, memberTargetKeys });
            },
            onError : function(error) {
                message.error(error);
            }
        });
    },

    createChatGroupModalHandleCancel(){
        personCenter.setState({"createChatGroupModalVisible":false,"updateGroupId":''});
    },
    /**
     * 获取页面数据，创建聊天群组
     */
    createChatGroup(){
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        var memberIds =personCenter.state.targetKeys.join(",");
        var updateGroupId = personCenter.state.updateGroupId;
        var currentGroupObj = personCenter.state.currentGroupObj;
        if(isEmpty(updateGroupId)==false){

        }else{
            var title = personCenter.state.chatGroupTitle;
            if(isEmpty(title)){
                message.error("请输入群组名称");
                return;
            }
            if(title.length>10){
                message.error("群组名称不能超过10个字符");
                return;
            }
            if(isEmpty(memberIds)){
                message.error("请选择群成员");
                return;
            }
            var param = {
                "method": 'createChatGroup',
                "groupAvatar": loginUser.avatar,
                "groupName": personCenter.state.chatGroupTitle,
                "ownerId": sessionStorage.getItem("ident"),
                "memberIds":memberIds
            };
            doWebService(JSON.stringify(param), {
                onResponse: function (ret) {
                    var response = ret.response;
                    if(ret.msg=="调用成功" && ret.success==true && isEmpty(response.chatGroupId)==false && response.chatGroupId>0){
                        message.success("聊天群组创建成功");
                    }else{
                        message.success("聊天群组创建失败");
                    }
                    personCenter.getUserChatGroup();
                },
                onError: function (error) {
                    message.error(error);
                }
            });
        }
        personCenter.setState({"createChatGroupModalVisible":false,"updateGroupId":'',"chatGroupTitle":''});
    },

    transferHandleChange(targetKeys){
        personCenter.setState({ targetKeys });
    },

    chatGroupTitleOnChange(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var chatGroupTitle = target.value;
        personCenter.setState({"chatGroupTitle":chatGroupTitle});
    },

    /**
     * 检查群组成员是否已经存在
     */
    checkMemberIsExist(memberId){
        var isExist = false;
        var currentGroupObj = personCenter.state.currentGroupObj;
        if(isEmpty(currentGroupObj)==false){
            var members = currentGroupObj.members;
            if(isEmpty(members)==false && members.length!=0){
                for(var i=0;i<members.length;i++){
                    var member = members[i];
                    var memberIdInCurrent = member.colUid;
                    if(memberId==memberIdInCurrent){
                        isExist = true;
                        break;
                    }
                }
            }
        }
        return isExist;
    },

    /**
     * 群组成员列表选中事件
     */
    onGroupUserTableSelectChange(selectedRowKeys){
        var selectedRowKeysStr =selectedRowKeys.join(",");
        this.setState({ selectedRowKeys,selectedRowKeysStr });
    },

    /**
     * 移除选中的群组成员
     */
    deleteAllSelectedMembers(){
        confirm({
            title: '确定要移除选中的群成员?',
            onOk() {
                var currentGroupObj = personCenter.state.currentGroupObj;
                var memberIds = personCenter.state.selectedRowKeysStr;
                var optType="removeMember";
                personCenter.deleteChatGroupMember(currentGroupObj.chatGroupId,memberIds,optType);
            },
            onCancel() {
            },
        });
    },

    /**
     * 移除选中的群组成员
     */
    deleteSelectedMember(){
        var currentGroupObj = personCenter.state.currentGroupObj;
        var memberIds = personCenter.state.delMemberIds;
        var optType="removeMember";
        personCenter.deleteChatGroupMember(currentGroupObj.chatGroupId,memberIds,optType);
        personCenter.closeConfirmModal();
    },

    deleteSelectedMemberById(memberIds){
        var currentGroupObj = personCenter.state.currentGroupObj;
        var optType="removeMember";
        personCenter.deleteChatGroupMember(currentGroupObj.chatGroupId,memberIds,optType);
    },

    /**
     * 刷新本地的群组成员列表
     */
    refreshLocalMembers(memberIds){
        var currentMemberArray = personCenter.state.currentMemberArray;
        var memberIdsArray=[];
        memberIdsArray.push(memberIds);
        currentMemberArray = personCenter.array_diff(currentMemberArray,memberIdsArray);
        personCenter.setState({"currentMemberArray":currentMemberArray});
    },

    array_diff(a, b) {
        for(var i=0;i<b.length;i++)
        {
            for(var j=0;j<a.length;j++)
            {
                if(a[j].key==b[i]){
                    a.splice(j,1);
                    j=j-1;
                }
            }
        }
        return a;
    },
    /**
     * 显示删除群成员的确认窗口
     * @param e
     */
    showConfirmModal(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var memberIds = target.value;
        personCenter.setState({"delMemberIds":memberIds});
        personCenter.refs.confirmModal.changeConfirmModalVisible(true);
    },

    /**
     * 关闭移出群聊按钮对应的confirm窗口
     */
    closeConfirmModal(){
        personCenter.refs.confirmModal.changeConfirmModalVisible(false);
    },

    /**
     * 显示群成员添加Modal窗口
     */
    showAddMembersModal(){
        personCenter.getNotMemberUser();
        personCenter.setState({"addGroupMemberModalVisible":true});
    },
    /**
     * 关闭添加群成员Modal窗口
     */
    addGroupMemberModalHandleCancel(){
        personCenter.setState({"addGroupMemberModalVisible":false});
    },
    /**
     * 添加群成员的Tranfer组件内容改变事件
     * @param targetKeys
     */
    addMemberTransferHandleChange(targetKeys){
        personCenter.setState({ "memberTargetKeys":targetKeys });
    },
    /**
     * 添加群成员
     */
    addGroupMember(){
        var loginUser = JSON.parse(sessionStorage.getItem("loginUser"));
        var memberTargetkeys = personCenter.state.memberTargetKeys;
        var memberIds =memberTargetkeys.join(",");
        var currentGroupObj = personCenter.state.currentGroupObj;
        var param = {
            "method": 'addChatGroupMember',
            "chatGroupId": currentGroupObj.chatGroupId,
            "memberIds":memberIds
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if(ret.msg=="调用成功" && ret.success==true && response==true){
                    message.success("群成员添加成功");
                }else{
                    message.success("群成员添加失败");
                }
                var currentMemberArray = personCenter.state.currentMemberArray;
                currentMemberArray = currentMemberArray.concat(memberTargetkeys);
                personCenter.setState({"addGroupMemberModalVisible":false,"currentMemberArray":currentMemberArray});
                personCenter.getUserChatGroup();
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    getCurrentMemberIds(){
        var memberIds="";
        var currentGroupObj = personCenter.state.currentGroupObj;
        if(isEmpty(currentGroupObj)==false){
            var groupTitle = currentGroupObj.name;
            var groupId = currentGroupObj.chatGroupId;
            var members = currentGroupObj.members;
            var membersArray=[];
            members.forEach(function (e) {
                var memberId = e.colUid;
                memberIds+=memberId+",";
            });
        }
        return memberIds;
    },

    /**
     * 解散聊天群
     */
    dissolutionChatGroup(){
        var currentGroupObj = personCenter.state.currentGroupObj;
        var memberIds = personCenter.getCurrentMemberIds();
        var optType="dissolution";
        personCenter.deleteChatGroupMember(currentGroupObj.chatGroupId,memberIds,optType);
        personCenter.closeDissolutionChatGroupConfirmModal();
    },
    /**
     * 删除并退出群组
     */
    exitChatGroup(){
        var currentGroupObj = personCenter.state.currentGroupObj;
        var memberIds = sessionStorage.getItem("ident");
        var optType="exitChatGroup";
        personCenter.deleteChatGroupMember(currentGroupObj.chatGroupId,memberIds,optType);
        personCenter.closeExitChatGroupConfirmModal();
    },

    deleteChatGroupMember(chatGroupId,memberIds,optType){
        var successTip = "";
        var errorTip="";
        if(optType=="dissolution"){
            successTip = "群组解散成功";
            errorTip="群组解散失败";
        }else if(optType=="removeMember"){
            successTip = "群成员移出成功";
            errorTip="群成员移出失败";
        }else if(optType=="exitChatGroup"){
            successTip = "您已成功退出该群组";
            errorTip="退出群组失败";
        }
        var param = {
            "method": 'deleteChatGroupMember',
            "chatGroupId": chatGroupId,
            "memberIds": memberIds
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                if(ret.msg=="调用成功" && ret.success==true && response==true){
                    message.success(successTip);
                }else{
                    message.success(errorTip);
                }
                if(optType=="dissolution" || optType=="exitChatGroup"){
                    personCenter.getUserChatGroup();
                }else if(optType=="removeMember"){
                    personCenter.refreshLocalMembers(memberIds);
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 显示修改群名称的窗口
     */
    showUpdateChatGroupNameModal(){
        var currentGroupObj = personCenter.state.currentGroupObj;
        var updateChatGroupTitle = currentGroupObj.name;
        personCenter.setState({"updateChatGroupNameModalVisible":true,"updateChatGroupTitle":updateChatGroupTitle});
    },

    /**
     * 关闭修改群名称的窗口
     */
    updateChatGroupNameModalHandleCancel(){
        personCenter.setState({"updateChatGroupNameModalVisible":false});
    },

    /**
     * 修改群名称
     */
    updateChatGroupName(){
        //更新(判断和当前的groupObj信息是否一致)
        var currentGroupObj = personCenter.state.currentGroupObj;
        if(isEmpty(personCenter.state.updateChatGroupTitle)==false){
            var param = {
                "method": 'updateChatGroupName',
                "chatGroupId": currentGroupObj.chatGroupId,
                "name": personCenter.state.updateChatGroupTitle,
                "userId": sessionStorage.getItem("ident"),
            };
            doWebService(JSON.stringify(param), {
                onResponse: function (ret) {
                    var response = ret.response;
                    if(ret.msg=="调用成功" && ret.success==true && response==true){
                        message.success("聊天群组修改成功");
                    }else{
                        message.success("聊天群组修改失败");
                    }
                    personCenter.getUserChatGroup();
                    personCenter.setState({"updateChatGroupNameModalVisible":false});
                },
                onError: function (error) {
                    message.error(error);
                }
            });
        }
    },
    /**
     * 修改群组名称时，名称内容改变的响应函数
     * @param e
     */
    updateChatGroupTitleOnChange(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var updateChatGroupTitle = target.value;
        personCenter.setState({"updateChatGroupTitle":updateChatGroupTitle});
    },

    /**
     * 关闭解散群聊按钮对应的confirm窗口
     */
    closeDissolutionChatGroupConfirmModal(){
        personCenter.refs.dissolutionChatGroupConfirmModal.changeConfirmModalVisible(false);
    },

    closeExitChatGroupConfirmModal(){
        personCenter.refs.exitChatGroupConfirmModal.changeConfirmModalVisible(false);
    },

    /**
     * 显示删除并退出的确认窗口
     * @param e
     */
    showExitChatGroupConfirmModal(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var memberIds = target.value;
        personCenter.setState({"delMemberIds":memberIds});
        personCenter.refs.exitChatGroupConfirmModal.changeConfirmModalVisible(true);
    },

    showDissolutionChatGroupConfirmModal(){
        personCenter.refs.dissolutionChatGroupConfirmModal.changeConfirmModalVisible(true);
    },

    /**
     * 显示创建群组的窗口
     */
    showCreateChatGroup(){
        personCenter.getUserContactsMockData();
        personCenter.setState({"createChatGroupModalVisible":true,"updateGroupId":''});
    },

    /**
     * 创建群组时，获取当前用户的联系人列表
     */
    getUserContactsMockData(){
        const mockData = [];
        var targetKeys = [];
        var param = {
            "method": 'getUserContacts',
            "ident": sessionStorage.getItem("ident"),
        };
        doWebService(JSON.stringify(param), {
            onResponse : function(ret) {
                var response = ret.response;
                response.forEach(function (e) {
                    var userId = e.colUid;
                    var userName = e.userName;
                    var userType = e.colUtype;
                    if(userType!="SGZH" && parseInt(userId) != sessionStorage.getItem("ident")){
                        const data = {
                            key: userId,
                            title: userName,
                        };
                        mockData.push(data);
                    }
                });
                personCenter.setState({ mockData, targetKeys });
            },
            onError : function(error) {
                message.error(error);
            }
        });
    },


    render() {
        var userPhotoTag;
        var returnPersonCenterToolBar = <div className="ant-tabs-right"><Button onClick={personCenter.returnPersonCenter}>返回</Button></div>;
        var createChatToolBar = <div className="ant-tabs-right"><Button onClick={personCenter.showCreateChatGroup}>创建群聊</Button></div>;
        var returnChatGroupMessagePageToolBar = <div className="ant-tabs-right"><Button onClick={personCenter.returnToChatGroupMessagePage}>返回</Button></div>;
        if (isEmpty(personCenter.state.userInfo) == false && personCenter.state.optType == "userDetail") {
            var user = personCenter.state.userInfo.user;
            var userName = user.userName;
            if (isEmpty(user.avatar) == false) {
                userPhotoTag = <span className="person_user_bg">
                <img src={user.avatar} className="person_user"/>
            </span>;
                <div></div>
            }
            var userLinkCard;
            var userInfoCard;
            //PAREN---家长1
            var intro = personCenter.state.userInfo.introduction;
            if (user.colUtype == "STUD") {
                if (isEmpty(intro)) {
                    intro = "这家伙很懒，还没编辑个人简介";
                }
                userLinkCard = <div title={userName + '的个人名片'} className="person_container">
                    <Button value={user.colUid} icon="question-circle-o" onClick={personCenter.studentAsk}
                            className="person_cor person_cor1">
                        <div>提问</div>
                    </Button>
                    <Button value={user.colUid} icon="area-chart" onClick={personCenter.studentStudyTrack}
                            className="person_cor person_cor2">
                        <div>学习轨迹</div>
                    </Button>
                    <Button value={user.colUid} icon="star-o" onClick={personCenter.getUserFavorite}
                            className="person_cor person_cor3">
                        <div>收藏</div>
                    </Button>
                    <Button value={user.colUid} icon="heart-o" onClick={personCenter.getMyFollows.bind(personCenter,user.colUid)}
                            className="person_cor person_cor4">
                        <div>关注</div>
                    </Button>
                </div>;
                userInfoCard = <Card title={personCenter.state.userInfo.user.userName + '的个人名片'} className="bai">
                    <Row className="person_13">
                        <Col span={3} className="gary_person">学&nbsp;&nbsp;&nbsp;&nbsp;校：</Col>
                        <Col span={21} className="black_person">{personCenter.state.userInfo.school}</Col>
                        <Col span={3} className="gary_person">年&nbsp;&nbsp;&nbsp;&nbsp;级：</Col>
                        <Col span={21} className="black_person ">{personCenter.state.userInfo.grade}</Col>
                    </Row>
                    <Row>
                        <Col span={3} className="gary_person">个人简介：</Col>
                        <Col span={21} className="black_person">{intro}</Col>
                    </Row>
                </Card>;
            } else {
                if (isEmpty(intro)) {
                    intro = "该老师很忙，还没编辑个人简介";
                }
                userLinkCard = <div title={userName + '的个人名片'} className="person_container ">
                    <Button value={user.colUid} icon="play-circle-o" className="person_cor person_cor1"
                            onClick={personCenter.getLiveInfo.bind(personCenter,user.colUid)}>
                        <div>直播</div>
                    </Button>
                    <Button value={user.colUid} icon="area-chart" className="person_cor person_cor2"
                            onClick={personCenter.getMyCourseWares}>
                        <div>资源</div>
                    </Button>
                    <Button value={user.colUid} icon="star-o" className="person_cor person_cor3"
                            onClick={personCenter.getMySubjects}>
                        <div>题库</div>
                    </Button>
                    <Button value={user.colUid} icon="heart-o" className="person_cor person_cor4"
                            onClick={personCenter.getMyFollows.bind(personCenter,user.colUid)}>
                        <div>关注</div>
                    </Button>
                </div>;

                userInfoCard = <Card title={personCenter.state.userInfo.user.userName + '的个人名片'} className="bai">
                    <Row className="person_13">
                        <Col span={3} className="gary_person">学&nbsp;&nbsp;&nbsp;&nbsp;校：</Col>
                        <Col span={21} className="black_person">{personCenter.state.userInfo.school}</Col>
                        <Col span={3} className="gary_person">科&nbsp;&nbsp;&nbsp;&nbsp;目：</Col>
                        <Col span={21} className="black_person">{personCenter.state.userInfo.course}</Col>
                        <Col span={3} className="gary_person">年&nbsp;&nbsp;&nbsp;&nbsp;级：</Col>
                        <Col span={21} className="black_person">{personCenter.state.userInfo.grade}</Col>
                    </Row>
                    <Row>
                        <Col span={3} className="gary_person">个人简介：</Col>
                        <Col span={21} className="black_person">{intro}</Col>
                    </Row>
                </Card>;
            }

            var followButton;
            var sendMessageButton;
            //个人中心页面中，如果是自己，则不能显示关注和取消关注
            if (personCenter.state.userInfo.user.colUid != sessionStorage.getItem("ident")) {
                if (personCenter.state.isFollow == false) {
                    followButton =
                        <Button icon="heart-o" onClick={personCenter.followUser}
                                className="persono_btn_gray">关注</Button>;
                } else {
                    followButton =
                        <Button icon="heart" onClick={personCenter.unfollowUser}
                                className="persono_btn_gray">取消关注</Button>;
                }
            }
            //如果个人中心显示的用户并不是当前用户的联系人，则不能显示发消息按钮
            if (personCenter.state.isExist) {
                sendMessageButton = <Button icon="message" value={personCenter.state.userInfo.user.colUid}
                                            onClick={personCenter.sendMessage}
                                            className="antnest_talk  persono_btn_blue">发消息</Button>;
            }
        }

        var personDate;
        var userPhoneCard;
        if (isEmpty(personCenter.state.userInfo) == false && personCenter.state.optType == "userDetail") {
            personDate = <div className="maaee_group_pa">
                <Card className="bai">
                    {userPhotoTag}

                    <span className="person_btn">
                        <Button className="antnest_talk antnest_icon_radius" value="score"
                                onClick={personCenter.turnToPlatformRulePage}><i
                            className="iconfont iconfont_jifen">&#xe608;</i><span
                            className="iocnfont_sp_jifen">{personCenter.state.userInfo.score}</span>积分</Button>
						<Button className="antnest_icon_blue_radius" value="level"
                                onClick={personCenter.turnToPlatformRulePage}>{personCenter.state.userInfo.level.name}</Button>
                    </span>
                    <span className="person_btn_ri">
                     {sendMessageButton}
                        {followButton}
					 </span>


                </Card>

                <div>{userLinkCard}
                    {userInfoCard}

                </div>
            </div>;
        } else if (isEmpty(personCenter.state.userInfo) == false && personCenter.state.optType == "scoreDetail") {

            userPhoneCard = <div className="integral_top">
                <span className="integral_face">
                    <img className="person_user" src={personCenter.state.userInfo.user.avatar}></img>
                </span>
                <div className="class_right integral_name">
                    {personCenter.state.userInfo.user.userName}
                </div>
                <div className="class_right">
                    <Button onClick={personCenter.turnToScoreDetailPage}
                            className="yellow_btn">{personCenter.state.userInfo.score}积分</Button>
                </div>
                <div className="integral_line"></div>
            </div>;
            //学生和老师的升级攻略不同
            var upgradeRaiders;
            if (personCenter.state.userInfo.user.colUtype == "STUD") {
                upgradeRaiders = <ul className="topics_le integral integral_scroll">
                    <li className="til">课中</li>
                    <li>
                        <span><Icon type="minus-circle"/>逃课一次</span>
                        <span className="right_ri">-10积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>课堂练习答错一题</span>
                        <span className="right_ri">＋1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>课堂练习答对一题</span>
                        <span className="right_ri">＋3积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>被送花一次</span>
                        <span className="right_ri">＋5积分</span>
                    </li>
                    <li>
                        <span><Icon type="minus-circle"/>被批评一次</span>
                        <span className="right_ri">-3积分</span>
                    </li>

                    <li className="til">课下</li>
                    <li>
                        <span><Icon type="plus-circle"/>评论教师话题说说（>10字/条）</span>
                        <span className="right_ri">+1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>发布蚁巢内容被老师点赞一次</span>
                        <span className="right_ri">＋1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>课后作业答错一次</span>
                        <span className="right_ri">+1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>课后作业答对一次</span>
                        <span className="right_ri">+3积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>看微课一个（≥70%）</span>
                        <span className="right_ri">+2积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>看PPT一个（≥70%）</span>
                        <span className="right_ri">+1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>提问获教师解答（16蚁币/个）</span>
                        <span className="right_ri">+50积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>表扬一次（≤2/科/天）</span>
                        <span className="right_ri">+10积分</span>
                    </li>
                    <li>
                        <span><Icon type="minus-circle"/>批评一次（≤2/科/天）</span>
                        <span className="right_ri">-3积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>自主做题错一题（3个/科/天）</span>
                        <span className="right_ri">+1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>自主做题对一题（3个/科/天）</span>
                        <span className="right_ri">+难度分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>用装备做错一题（3蚁币/个）</span>
                        <span className="right_ri">+2积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>用装备做对一题（同上）</span>
                        <span className="right_ri">难度分＊2积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>装备换题错一题（1蚁币/个）</span>
                        <span className="right_ri">+2积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>装备换题对一题（同上）</span>
                        <span className="right_ri">难度分＊2积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>翻倍道具做题（3蚁币/个）</span>
                        <span className="right_ri">总分翻倍</span>
                    </li>

                    <li className="til">技能</li>
                    <li>
                        <span><Icon type="plus-circle"/>每个技能使用一次</span>
                        <span className="right_ri">+2积分</span>
                    </li>

                    <li className="til">斗转星移（1次/人/天）</li>
                    <li>
                        <span><Icon type="plus-circle"/>使用装备不做题(1蚁币/个)</span>
                        <span className="right_ri">不扣分</span>
                    </li>
                    <li>
                        <span><Icon type="minus-circle"/>不用装备不做题</span>
                        <span className="right_ri">-2积分</span>
                    </li>
                    <li>
                        <span><Icon type="minus-circle"/>不用装备做错一题</span>
                        <span className="right_ri">-1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>不用装备做对一题</span>
                        <span className="right_ri">+难度分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>不用装备做对一题，发起人得</span>
                        <span className="right_ri">+难度分</span>
                    </li>

                    <li className="til">决斗（2蚁币/次）</li>
                    <li>
                        <span><Icon type="minus-circle"/>发起人不做题</span>
                        <span className="right_ri">-使用技能所得积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>对手使用防守装备不做题</span>
                        <span className="right_ri">不扣分</span>
                    </li>
                    <li>
                        <span><Icon type="minus-circle"/>对手不使用防守装备不做题</span>
                        <span className="right_ri">-2积分</span>
                    </li>
                    <li>
                        <span><Icon type="minus-circle"/>对手不使用防守装备且做错</span>
                        <span className="right_ri">-1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>发起人做对，对手错，发起人</span>
                        <span className="right_ri">＋2倍难度分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>发起人做错，对手对，发起人</span>
                        <span className="right_ri">＋0积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>发起人做错，对手对，对手</span>
                        <span className="right_ri">＋难度分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>两人都做对</span>
                        <span className="right_ri">＋难度分/人</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>两人都做错，发起人</span>
                        <span className="right_ri">＋0积分</span>
                    </li>
                    <li>
                        <span><Icon type="minus-circle"/>两人都做错，对手，发起人</span>
                        <span className="right_ri">-1积分</span>
                    </li>
                    <li className="til">万箭齐发</li>
                    <li>
                        <span><Icon type="minus-circle"/>发起人不做题</span>
                        <span className="right_ri">-使用技能所得积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>对手使用防守装备不做题</span>
                        <span className="right_ri">不扣分</span>
                    </li>
                    <li>
                        <span><Icon type="minus-circle"/>对手不使用防守装备不做题</span>
                        <span className="right_ri">-2积分</span>
                    </li>
                    <li>
                        <span><Icon type="minus-circle"/>对手不使用防守装备且做错</span>
                        <span className="right_ri">-1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>全班正确率&lt;30%,对手对</span>
                        <span className="right_ri">难度分+平摊扣分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>全班正确率&lt;30%，发起人</span>
                        <span className="right_ri">＋5倍难度分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>全班正确率&lt;30%，发起人</span>
                        <span className="right_ri">＋5倍难度分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>全班正确率>30%，对手对</span>
                        <span className="right_ri">＋难度分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>正确率>30%，发起人对</span>
                        <span className="right_ri">难度分＋扣分</span>
                    </li>

                </ul>;
            } else {
                upgradeRaiders = <ul className="topics_le integral ">
                    <li className="til">升级攻略</li>
                    <li>
                        <span><Icon type="plus-circle"/>上传教案,每一个</span>
                        <span className="right_ri">+1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>课外使用课件</span>
                        <span className="right_ri">+10积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>发布话题,分享教学资源,每一条</span>
                        <span className="right_ri">+1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>学生参与此话题,并评论</span>
                        <span className="right_ri">+1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>上传微课,每一个</span>
                        <span className="right_ri">+2积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>微课校内点击</span>
                        <span className="right_ri">+1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>微课校外点击</span>
                        <span className="right_ri">+10积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>上传题目,每一个</span>
                        <span className="right_ri">+1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>校内使用此题,每次</span>
                        <span className="right_ri">+5积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>校外使用此题,每次</span>
                        <span className="right_ri">+3积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>课后布置作业,每题</span>
                        <span className="right_ri">+1积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>开课一次</span>
                        <span className="right_ri">+50积分</span>
                    </li>
                    <li>
                        <span><Icon type="plus-circle"/>在线解决学生提问</span>
                        <span className="right_ri">+20积分</span>
                    </li>
                </ul>;
            }

            var tabComponent = <Tabs
                hideAdd
                ref="studentStudyTrackTab"
                activeKey={this.state.activeKey}
                defaultActiveKey={this.state.defaultActiveKey}
                tabBarExtraContent={returnPersonCenterToolBar}
                transitionName=""  //禁用Tabs的动画效果
                onChange={personCenter.platformRulePageChange}
            >
                <TabPane tab="平台规则" key="platformRulePage">
                    <ul className="topics_le integral integral_scroll">
                        <li className="til">禁言</li>
                        <li><Icon type="plus-circle"/>课前蚁巢刷屏、发布不良话题或评论</li>
                        <li><Icon type="plus-circle"/>视频开课弹幕刷屏或无关言论、老师可关闭弹幕</li>
                        <li className="til">视频开课被踢出课堂</li>
                        <li><Icon type="plus-circle"/>视频开课中公屏或弹幕刷屏或发布不良言论、多次警告无效、可踢出课堂</li>
                        <li className="til">封号</li>
                        <li><Icon type="plus-circle"/>被踢出课堂或禁言1次、封号3天</li>
                        <li><Icon type="plus-circle"/>连续被踢出课堂或禁言>=2次、封号1个周</li>
                        <li><Icon type="plus-circle"/>连续被踢出课堂或禁言>=5次、封号1个月</li>
                        <li><Icon type="plus-circle"/>在校期间出现严重警告、违纪、盗号、不服从老师管理、故意损坏小蚂蚁设备(平板、充电柜、无线AP)等封号1个月</li>
                    </ul>
                </TabPane>
                <TabPane tab="升级攻略" key="upgradeRaiders">
                    <div>
                        {upgradeRaiders}
                    </div>
                </TabPane>
            </Tabs>;

            personDate = <div className="group_cont">
                {userPhoneCard}
                {tabComponent}
            </div>;
        }else if(personCenter.state.optType=="getScoreOrLevelPage"){

            var currentPageLink;
            //var returnPersonCenterToolBar = <div className="ant-tabs-right"><Button onClick={personCenter.returnPersonCenter}>返回</Button></div>;
            if(personCenter.state.urlType=="score"){
                currentPageLink = "http://www.maaee.com:80/Excoord_PhoneService/user/getUserScores/" + personCenter.state.userInfo.user.colUid;
            }else{
                currentPageLink = "http://www.maaee.com:80/Excoord_PhoneService/user/personalGrade/" + personCenter.state.userInfo.user.colUid;
            }
            var tabComponent = <Tabs
                hideAdd
                ref = "studentStudyTrackTab"
                activeKey={this.state.activeKey}
                defaultActiveKey={this.state.defaultActiveKey}
                tabBarExtraContent={returnPersonCenterToolBar}
                transitionName=""  //禁用Tabs的动画效果
            >
                <TabPane tab="我的积分" key="userScores">
                    <div className="topics_le"><iframe ref="study" src={currentPageLink} className="analyze_iframe"></iframe></div>
                </TabPane>
            </Tabs>;

            personDate = tabComponent;
        }else if(personCenter.state.optType=="turnToAsk"){
            var currentPageLink = "http://www.maaee.com:80/Excoord_PhoneService/quiz/getUserAskedQuiz/" + personCenter.state.userInfo.user.colUid;
            tabComponent = <Tabs
                hideAdd
                ref = "studentAskTab"
                activeKey={this.state.activeKey}
                defaultActiveKey={this.state.defaultActiveKey}
                tabBarExtraContent={returnPersonCenterToolBar}
                transitionName=""  //禁用Tabs的动画效果
            >
                <TabPane tab="我发起过的提问" key="我发起过的提问">
                    <iframe ref="study" src={currentPageLink} className="analyze_iframe"></iframe>
                </TabPane>
            </Tabs>;
            personDate = tabComponent;
        }
        else if(personCenter.state.optType=="turnStudyTrack"){
            var currentPageLink = "http://www.maaee.com:80/Excoord_PhoneService/user/studytrack/" + personCenter.state.userInfo.user.colUid;
            tabComponent = <Tabs
                hideAdd
                ref = "studentStudyTrackTab"
                activeKey={this.state.activeKey}
                defaultActiveKey={this.state.defaultActiveKey}
                tabBarExtraContent={returnPersonCenterToolBar}
                transitionName=""  //禁用Tabs的动画效果
            >
                <TabPane tab="学习轨迹" key="studyTrack">
                    <iframe ref="study" src={currentPageLink} className="analyze_iframe"></iframe>
                </TabPane>
            </Tabs>;
            personDate = tabComponent;
        }else if(personCenter.state.optType=="userFavorite"){
            personDate = <div>
                    {returnPersonCenterToolBar}
                    <Favorites userid={personCenter.state.studentId} breadcrumbVisible={false}
                           onPreview={ this.props.onPreview }></Favorites>
                </div>
        }else if(personCenter.state.optType=="getMyFollows"){
            var welcomeTitle=personCenter.state.userInfo.user.userName+"的关注";
            personDate= <Tabs
                hideAdd
                ref = "mainTab"
                activeKey={this.state.activeKey}
                defaultActiveKey={this.state.defaultActiveKey}
                tabBarExtraContent={returnPersonCenterToolBar}
                transitionName=""  //禁用Tabs的动画效果
            >
                <TabPane tab={welcomeTitle} key="userFollows" className="topics_rela">
                    <div className="person_attention favorite_pa_le" >
                        {personCenter.state.followsUserArray}
                    </div>
                </TabPane>
            </Tabs>;
        }else if(personCenter.state.optType=="getLiveInfoByUid"){
            var  welcomeTitle=personCenter.state.userInfo.user.userName+"的直播课";
            var returnPersonCenterBar;
            /*if(isVisible){
                returnPersonCenterBar = <div className="ant-tabs-right"><Button onClick={personCenter.returnPersonCenter}>返回</Button></div>;
            }*/
            personDate= <Tabs
                hideAdd
                ref = "mainTab"
                activeKey={this.state.activeKey}
                defaultActiveKey={this.state.defaultActiveKey}
                tabBarExtraContent={returnPersonCenterBar}
                transitionName=""  //禁用Tabs的动画效果
            >
                <TabPane tab={welcomeTitle} key="userLiveInfos" className="topics_rela ">
                    <div className='ant-tabs ant-tabs-top ant-tabs-line topics_calc favorite_pa_le' style={{'overflow':'auto'}}>
                        {personCenter.state.userLiveData}
                    </div>
                    <Pagination total={personCenter.state.totalLiveCount} pageSize={getPageSize()} current={personCenter.state.currentLivePage} onChange={this.onLiveInfoPageChange}/>
                </TabPane>
            </Tabs>;
        }else if(personCenter.state.optType=="getUserCourseWares"){
            var welcomeTitle=personCenter.state.userInfo.user.userName+"的资源";
            personDate= <Tabs
                hideAdd
                ref = "mainTab"
                activeKey={this.state.activeKey}
                defaultActiveKey={this.state.defaultActiveKey}
                tabBarExtraContent={returnPersonCenterToolBar}
                transitionName=""  //禁用Tabs的动画效果
            >
                <TabPane tab={welcomeTitle} key="userCourseWares" className="topics_rela">
                    <div className='ant-tabs ant-tabs-top ant-tabs-line'>
                        <div className='ant-tabs-tabpane ant-tabs-tabpane-active'>
                            <Collapse defaultActiveKey={activeKey} activeKey={activeKey} ref="collapse">
                                {coursePanelChildren}
                            </Collapse>
                        </div>
                        <Pagination total={personCenter.state.totalCourseWareCount} pageSize={getPageSize()} current={personCenter.state.currentCourseWarePage} onChange={this.onCourseWareChange}/>
                    </div>
                </TabPane>
            </Tabs>;
        }else if(personCenter.state.optType=="getUserSubjects"){
            var welcomeTitle=personCenter.state.userInfo.user.userName+"的题目";
            //var returnPersonCenterToolBar = <div className="ant-tabs-right"><Button onClick={personCenter.returnPersonCenter}>返回</Button></div>;
            personDate= <Tabs
                hideAdd
                ref = "mainTab"
                activeKey={this.state.activeKey}
                defaultActiveKey={this.state.defaultActiveKey}
                tabBarExtraContent={returnPersonCenterToolBar}
                transitionName=""  //禁用Tabs的动画效果
            >
                <TabPane tab={welcomeTitle} key="userSubjects" className="topics_rela">
                    <Table columns={subjectTableColumns} dataSource={data} pagination={{ total:personCenter.state.totalSubjectCount,pageSize: getPageSize(),onChange:personCenter.onSubjectPageChange }} scroll={{ y: 400}}/>
                </TabPane>
            </Tabs>;
        }else if(personCenter.state.optType=="getUserChatGroup"){
            var welcomeTitle= "我的群聊";
            personDate= <Tabs
                hideAdd
                ref = "mainTab"
                tabBarExtraContent={createChatToolBar}
                transitionName=""  //禁用Tabs的动画效果
            >
                <TabPane tab={welcomeTitle} key="loginWelcome" className="topics_rela">
                    <div>
                        <ul className="group_table">
                            <Table className="group_table_u" onRowClick={personCenter.sendGroupMessage} showHeader={false} scroll={{ x: true, y: 500 }} columns={userGroupsColumns} dataSource={personCenter.state.userGroupsData} pagination={{ total:personCenter.state.totalChatGroupCount,pageSize: getPageSize(),onChange:personCenter.onChatGroupPageChange }}/>
                        </ul>
                    </div>
                </TabPane>
            </Tabs>;
        }else if(personCenter.state.optType=="showGroupInfo"){
            var welcomeTitle = "群设置";
            const { loading, selectedRowKeys } = this.state;
            var topButton;
            var dissolutionChatGroupButton;
            if(personCenter.state.currentGroupObj.owner.colUid==sessionStorage.getItem("ident")){
                topButton = <span className="right_ri">
                    <Button type="primary" onClick={this.showUpdateChatGroupNameModal}
                            loading={loading}
                    >修改群名称</Button>
                    <span className="toobar"><Button type="primary" onClick={this.showAddMembersModal}
                                                     loading={loading}
                    >添加群成员</Button></span>
                </span>;
                dissolutionChatGroupButton = <Button onClick={personCenter.showDissolutionChatGroupConfirmModal} className="group_red_font"><i className="iconfont">&#xe616;</i>解散该群</Button>;
            }else{
                topButton = <span className="right_ri">
                    <Button type="primary" onClick={this.showAddMembersModal}
                            loading={loading}
                    >添加群成员</Button>
                </span>;
            }
            var memberLiTag=[];
            personCenter.state.currentMemberArray.forEach(function (e) {
                var memberId = e.key;
                var groupUser = e.groupUser;
                var userInfo = e.userInfo;
                var userHeaderIcon;
                if(isEmpty(userInfo)==false){
                    userHeaderIcon = <img src={userInfo.avatar}></img>;
                }else{
                    userHeaderIcon=<span className="attention_img"><img src={require('../images/maaee_face.png')}></img></span>;
                }
                var liTag = <div className="group_fr">
                    <span className="attention_img">{userHeaderIcon}</span><span>{groupUser}</span>
                    <Button　value={memberId} onClick={personCenter.showConfirmModal} className="group_del"><Icon type="close-circle-o" /></Button>
                </div>;
                memberLiTag.push(liTag);
            });

            personDate = <Tabs
                hideAdd
                ref = "mainTab"
                tabBarExtraContent={returnChatGroupMessagePageToolBar}
                transitionName=""  //禁用Tabs的动画效果
            >
                <TabPane tab={welcomeTitle} key="loginWelcome" className="topics_rela">
                    <div className="del_out">
                        <ul className="integral_top">
                            <span className="integral_face"><img src={personCenter.state.currentGroupObj.owner.avatar} className="person_user"/></span>
                            <div className="class_right color_gary_f">{personCenter.state.currentGroupObj.name}</div>
                            <div className="integral_line"></div>
                        </ul>
                        <ul className="group_fr_ul">
                            <li className="color_gary_f"><span>群聊成员：{personCenter.state.currentMemberArray.length}人</span>{topButton}</li>
                            <li className="user_hei">
                                {memberLiTag}
                                {/*<Table  style={{width:'300px'}} rowSelection={rowSelection} columns={groupUserTableColumns} dataSource={personCenter.state.currentMemberArray} scroll={{ x: true, y: 400 }} ></Table>*/}
                            </li>
                            <li className="color_gary_f">群聊名称：{personCenter.state.currentGroupObj.name}</li>
                            <li className="btm"><Button onClick={personCenter.showExitChatGroupConfirmModal} className="group_red_btn">删除并退出</Button>{dissolutionChatGroupButton}</li>
                        </ul>
                    </div>
                </TabPane>
            </Tabs>;
        }else {
            personDate = <div>
                <Card className="bai">
                    暂无数据
                </Card>
            </div>;
        }

        return (
            <div>
                <Modal className="modol_width"
                       visible={personCenter.state.updateChatGroupNameModalVisible}
                       title="修改群名称"
                       onCancel={personCenter.updateChatGroupNameModalHandleCancel}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       footer={[
                           <button type="primary" htmlType="submit" className="ant-btn ant-btn-primary ant-btn-lg" onClick={personCenter.updateChatGroupName}  >确定</button>,
                           <button type="ghost" htmlType="reset" className="ant-btn ant-btn-ghost login-form-button" onClick={personCenter.updateChatGroupNameModalHandleCancel} >取消</button>
                       ]}
                >
                    <Row className="ant-form-item">
                        <Col span={6} className="right_look">群名称：</Col>
                        <Col span={14}>
                            <Input value={personCenter.state.updateChatGroupTitle} defaultValue={personCenter.state.updateChatGroupTitle} onChange={personCenter.updateChatGroupTitleOnChange}/>
                        </Col>
                    </Row>
                </Modal>

                <Modal
                    visible={personCenter.state.addGroupMemberModalVisible}
                    title="添加群成员"
                    onCancel={personCenter.addGroupMemberModalHandleCancel}
                    transitionName=""  //禁用modal的动画效果
                    maskClosable={false} //设置不允许点击蒙层关闭
                    footer={[
                        <button type="primary" htmlType="submit" className="ant-btn ant-btn-primary ant-btn-lg" onClick={personCenter.addGroupMember}  >确定</button>,
                        <button type="ghost" htmlType="reset" className="ant-btn ant-btn-ghost login-form-button" onClick={personCenter.addGroupMemberModalHandleCancel} >取消</button>
                    ]}
                >
                    <Row className="ant-form-item">
                        <Col span={24}>
                            <Transfer
                                dataSource={personCenter.state.memberData}
                                showSearch
                                listStyle={{
                                    width: 268,
                                    height: 320,
                                }}
                                titles={['待选联系人','已选联系人']}
                                operations={['', '']}
                                targetKeys={personCenter.state.memberTargetKeys}
                                onChange={personCenter.addMemberTransferHandleChange}
                                render={item => `${item.title}`}
                            />
                        </Col>
                    </Row>
                </Modal>

                <ConfirmModal ref="confirmModal"
                              title="确定要移除选中的群成员?"
                              onConfirmModalCancel={personCenter.closeConfirmModal}
                              onConfirmModalOK={personCenter.deleteSelectedMember}
                ></ConfirmModal>
                <ConfirmModal ref="dissolutionChatGroupConfirmModal"
                              title="确定要解散该群组?"
                              onConfirmModalCancel={personCenter.closeDissolutionChatGroupConfirmModal}
                              onConfirmModalOK={personCenter.dissolutionChatGroup}
                ></ConfirmModal>
                <ConfirmModal ref="exitChatGroupConfirmModal"
                              title="确定要退出该群组?"
                              onConfirmModalCancel={personCenter.closeExitChatGroupConfirmModal}
                              onConfirmModalOK={personCenter.exitChatGroup}
                ></ConfirmModal>

                <Modal
                    visible={personCenter.state.createChatGroupModalVisible}
                    title="创建群组"
                    onCancel={personCenter.createChatGroupModalHandleCancel}
                    transitionName=""  //禁用modal的动画效果
                    maskClosable={false} //设置不允许点击蒙层关闭
                    footer={[
                        <button type="primary" htmlType="submit" className="ant-btn-primary ant-btn" onClick={personCenter.createChatGroup}  >确定</button>,
                        <button type="ghost" htmlType="reset" className="ant-btn ant-btn-ghost login-form-button" onClick={personCenter.createChatGroupModalHandleCancel} >取消</button>
                    ]}
                >
                    <Row className="ant-form-item">
                        <span >
                            <Input placeholder="请输入群名称" value={personCenter.state.chatGroupTitle} defaultValue={personCenter.state.chatGroupTitle} onChange={personCenter.chatGroupTitleOnChange} />
                        </span>
                    </Row>
                    <Row className="ant-form-item">
                        <Col span={24}>
                            <Transfer
                                dataSource={personCenter.state.mockData}
                                showSearch
                                listStyle={{
                                    width: 268,
                                    height: 320,
                                }}
                                titles={['待选联系人','已选联系人']}
                                operations={['', '']}
                                targetKeys={personCenter.state.targetKeys}
                                onChange={personCenter.transferHandleChange}
                                render={item => `${item.title}`}
                            />
                        </Col>
                    </Row>

                </Modal>

                <UseKnowledgeComponents ref="useKnowledgeComponents"></UseKnowledgeComponents>
                {personDate}
            </div>
        );
    },
});

export default PersonCenterComponents;
