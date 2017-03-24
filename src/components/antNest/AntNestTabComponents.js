import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col} from 'antd';
import { Menu, Dropdown,message,Pagination,Tag , Modal,Popover,Input} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import TeacherAllCourseWare from '../TeacherInfos/TeacherAllCourseWare';
import {getPageSize} from '../../utils/Const';
import {getLocalTime} from '../../utils/Const';
import {isEmpty} from '../../utils/Const';
import {getAllTopic} from '../../utils/Const';
import {getOnlyTeacherTopic} from '../../utils/Const';
import UploadImgComponents from './UploadImgComponents';
import EmotionInputComponents from './EmotionInputComponents';


const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;

var topicCardArray=[];
var antNest;
var topicObjArray=[];
const AntNestTabComponents = React.createClass({

    getInitialState() {
        antNest = this;
        return {
            defaultActiveKey:'全部',
            activeKey:'全部',
            topicCardList:[],
            totalCount:0,
            parTakeTotalCount:0,
            currentPage:1,
            currentPartakePage:1,
            optType:'getAllTopic',
            currentTopicTitle:'',
            currentTopicId:'',
            discussModalVisible:false,
            topicImgUrl:[],     //说说/话题上传的图片路径,
            topicModalType:'talk',
            topicTitle:'',
            toUserId:-1, //评论指定人或直接评论,评论指定人时,值为真实id，否则为-1
            replayToUserTopicId:''
        };
    },
    /**
     * 话题tab切换响应函数
     * @param activeKey
     */
    onChange(activeKey) {
        this.setState({activeKey:activeKey});
        var initPageNo = 1;
        if(activeKey=="全部"){
            antNest.getTopics(initPageNo,getAllTopic());
        }else{
            antNest.getTopics(initPageNo,getOnlyTeacherTopic());
        }
    },

    componentDidMount(){
        var initPageNo = 1;
        var initType = 0;
        antNest.getTopics(initPageNo,initType);
    },

    /**
     * 获取话题列表
     * @param type 0:全部  1：只看老师
     * @param pageNo
     */
    getTopics(pageNo,type){
        topicCardArray.splice(0);
        topicObjArray.splice(0);
        var param = {
            "method": 'getTopicsByType',
            "ident": sessionStorage.getItem("ident"),
            "type":type,
            "pageNo": pageNo
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                response.forEach(function (e) {
                    topicObjArray.push(e);
                    antNest.buildTopicCard(e,0);
                });
                var pager = ret.pager;
                antNest.setState({"topicCardList":topicCardArray,"totalCount":pager.rsCount,"currentPage":pageNo});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 构建话题的card对象
     * @param topicObj 话题对象
     * @param useType 用途 0:列表  1：单个话题
     */
    buildTopicCard(topicObj,useType,topicReplayInfoArray,parTakeCountInfo){
        //如果用户头像为空，使用系统默认头像
        var userHeadPhoto;
        if(isEmpty(topicObj.fromUser.colPhotoPath)){
            //如果用户头像为空，则使用系统默认头像进行显示
            userHeadPhoto =  <img src={require('../images/user.jpg')}/>;
        }else{
            userHeadPhoto =  <img src={topicObj.fromUser.colPhotoPath}/>;
        }
        //转换系统时间戳为本地日期格式
        var createTime = getLocalTime(topicObj.createTime);
        //话题标题，如果为空，则不显示
        var topicTitle;
        //话题标题不为空，且是在全部话题列表中的时候、处于有效状态，类型为话题，而非说说时才需要显示话题标题
        if(isEmpty(topicObj.title)==false && useType==0 && topicObj.valid==0 && topicObj.type==1){
            topicTitle = <a value={topicObj.id} title={topicObj.id} onClick={antNest.getTopicPartakeInfo} className="topics">#{topicObj.title}#</a>
        }
        //点赞用户span标记数组
        var likeUsersArray = [];
        var likeUsersInfoArray=[];
        //评论用户数组
        var answerUsersArray=[];
        //附件数组（其中包括图片附件和mp4附件）
        var attachMentsArray=[];
        //遍历点赞和回复的信息
        //如果当前用户未点赞，则使用空心按钮表示，按钮点击功能表示“取消点赞”
        var praiseButton=<Button className="topics_btn antnest_talk teopics_spa" icon="like-o" value={topicObj.id} onClick={antNest.praiseForTopic}>点赞</Button>;
        topicObj.comments.forEach(function (e) {
            if(e.type==1){
                //点赞
                var likeUserInfo = <span style={{marginRight:'10px'}}>{e.user.userName}</span>;
                likeUsersArray.push(likeUserInfo);
                likeUsersInfoArray.push(e.user);
            }else{
                //评论
                var answerUserInfo = <li className="topics_comment">
                    <span>{e.user.userName}：</span>
                    <span>{e.content}</span>
                    {/*<span><article id='contentHtml' className='content Popover_width' dangerouslySetInnerHTML={{__html: e.content}}></article></span>*/}
                    <span style={{marginLeft:'15px'}}>
                        <Button value={e.id} icon="delete" shape="circle" type="dashed" onClick={antNest.deleteTopicComment}></Button>
                        <Button value={topicObj.id+"#"+e.user.colUid} icon="message" shape="circle" type="dashed" onClick={antNest.showDiscussModal}></Button>
                    </span>
                </li>;
                answerUsersArray.push(answerUserInfo);
            }
        })
        //话题列表中的点赞按钮
        for(var i=0;i<likeUsersInfoArray.length;i++){
            var likeUser = likeUsersInfoArray[i];
            if(parseInt(sessionStorage.getItem("ident")) == likeUser.colUid){
                //如果当前用户已点赞，则使用实心按钮表示.按钮点击功能表示“点赞”
                praiseButton = <Button icon="like" value={topicObj.id} onClick={antNest.cancelPraiseForTopic}>点赞</Button>;
                break;
            }else{
                praiseButton = <Button icon="like-o" value={topicObj.id} onClick={antNest.praiseForTopic}>点赞</Button>;
            }
        }
        //遍历附件信息，并按类型封装数据
        topicObj.attachMents.forEach(function (e) {
            var attachMents;
            var attachMentType = e.type;
            if(attachMentType==1){
                //图片附件
                attachMents = <span className="topics_zan"><img src={e.address}/></span>;
            }else if(attachMentType==4){
                //mp4附件
                attachMents = <span className="antnest_user">
                    <a href={e.address} target="_blank">
                        <img src={e.cover}/><span>{e.content}</span>
                    </a>
                </span>;
            }
            attachMentsArray.push(attachMents);
        })
        //话题回复信息显示的card
        var replayCard="";
        //如果点赞和回复信息都存在，则在card的title部分显示点赞，content部分显示回复
        //否则只需要在内容区域显示即可
        if(likeUsersArray.length!=0 && answerUsersArray.length!=0){
            replayCard = <Card>
                <ul>
                    <span><Button icon="like"></Button> {likeUsersArray}</span>
                </ul>
                <ul>
                    {answerUsersArray}
                </ul>
            </Card>;
        }else if(likeUsersArray.length!=0 && answerUsersArray.length==0 ){
            replayCard = <Card>
                <span><Button icon="like"></Button> {likeUsersArray}</span>
            </Card>;
        }else if(likeUsersArray.length==0 && answerUsersArray.length!=0 ){
            replayCard = <div >
                <ul className="toppics_ul_bg">
                   {answerUsersArray}
                </ul>
            </div>;
        }
        //删除按钮，在单个话题查看页面，不需要显示删除按钮
        var delButton;
        if(useType==0){
            delButton = <a value={topicObj.id} icon="delete" onClick={antNest.deleteTopic}>删除</a>;
        }
        //参与人数显示card
        var parTakeCountCard;
        if(isEmpty(parTakeCountInfo)==false){
            parTakeCountCard = <Card>
                <ul>
                    <span>参与{parTakeCountInfo.participatecount}人,未参与{parTakeCountInfo.unParticipatecount}人</span>
                    <span><Button value={topicObj.id} onClick={antNest.showPartakeModal}>立即参与</Button></span>
                </ul>
            </Card>;
        }
        //单个话题中的回复参与信息
        var topicReplayCardArray=[];
        if(isEmpty(topicReplayInfoArray)== false && topicReplayInfoArray.length!=0 && useType==1){
            topicReplayInfoArray.forEach(function (topicReplayInfo) {
                var replayUserHeadPhoto;
                if(isEmpty(topicReplayInfo.fromUser.colPhotoPath)){
                    replayUserHeadPhoto =  <img src={require('../images/maaee.png')}/>;
                }else{
                    replayUserHeadPhoto =  <img src={topicReplayInfo.fromUser.colPhotoPath}/>;
                }
                var replayLikeUsersArray=[];
                var replayLikeUsersInfoArray=[];
                var replayAnswerUsersArray=[];
                topicReplayInfo.comments.forEach(function (e) {
                    if(e.type==1){
                        //点赞
                        var likeUserInfo = <span style={{marginRight:'10px'}}>{e.user.userName}</span>;
                        replayLikeUsersArray.push(likeUserInfo);
                        replayLikeUsersInfoArray.push(e.user);
                    }else{
                        //评论
                        var answerUserInfo = <li>
                            <span>{e.user.userName}:</span>
                            <span><article id='contentHtml' className='content Popover_width' dangerouslySetInnerHTML={{__html: e.content}}></article></span>
                            <span style={{marginLeft:'15px'}}>
                                <Button value={e.id} icon="delete" shape="circle" type="dashed" onClick={antNest.deleteTopicComment}></Button>
                                <Button value={topicReplayInfo.id+"#"+e.user.colUid} icon="message" shape="circle" type="dashed" onClick={antNest.showDiscussModal}></Button>
                            </span>
                        </li>;
                        replayAnswerUsersArray.push(answerUserInfo);
                    }
                })
                //如果当前用户未点赞，则使用空心按钮表示，按钮点击功能表示“取消点赞”
                var replayPraiseButton=<Button icon="like-o" value={topicReplayInfo.id+"#"+topicObj.id} onClick={antNest.praiseForTopic}>点赞</Button>;
                //话题列表中的点赞按钮
                for(var i=0;i<replayLikeUsersInfoArray.length;i++){
                    var likeUser = replayLikeUsersInfoArray[i];
                    if(parseInt(sessionStorage.getItem("ident")) == likeUser.colUid){
                        //如果当前用户已点赞，则使用实心按钮表示.按钮点击功能表示“点赞”
                        replayPraiseButton = <Button icon="like" value={topicReplayInfo.id+"#"+topicObj.id} onClick={antNest.cancelPraiseForTopic}>点赞</Button>;
                        break;
                    }else{
                        replayPraiseButton = <Button icon="like-o" value={topicReplayInfo.id+"#"+topicObj.id} onClick={antNest.praiseForTopic}>点赞</Button>;
                    }
                }

                //如果点赞和回复信息都存在，则在card的title部分显示点赞，content部分显示回复
                //否则只需要在内容区域显示即可
                var replayCardForSingle;
                if(replayLikeUsersArray.length!=0 && replayAnswerUsersArray.length!=0){
                    replayCardForSingle = <Card>
                        <ul>
                            <span><Button icon="like"></Button> {replayLikeUsersArray}</span>
                        </ul>
                        <ul>
                            {replayAnswerUsersArray}
                        </ul>
                    </Card>;
                }else if(replayLikeUsersArray.length!=0 && replayAnswerUsersArray.length==0 ){
                    replayCardForSingle = <Card>
                        <span><Button icon="like"></Button> {replayLikeUsersArray}</span>
                    </Card>;
                }else if(replayLikeUsersArray.length==0 && replayAnswerUsersArray.length!=0 ){
                    replayCardForSingle = <Card>
                        <ul>
                            {replayAnswerUsersArray}
                        </ul>
                    </Card>;
                }

                var topicReplayCard = <Card  style={{ marginBottom: '15px' }}>
                    <ul>
                        <span className="antnest_user">{replayUserHeadPhoto}
                            <span>{topicReplayInfo.fromUser.userName}</span></span>
                    </ul>
                    <ul>
                        {topicReplayInfo.content}
                    </ul>
                    <ul>
                        {getLocalTime(topicReplayInfo.createTime)}
                        <Button value={topicReplayInfo.id} icon="delete" onClick={antNest.deleteTopic}>删除</Button>
                        <Button value={topicObj.id+"#"+topicReplayInfo.id} icon="to-top" onClick={antNest.setTopicToTop}>置顶</Button>
                        {replayPraiseButton}
                        <Button icon="message" value={topicReplayInfo.id+"#toUser"} onClick={antNest.showDiscussModal}>评论</Button>
                    </ul>
                    <ul>
                        {replayCardForSingle}
                    </ul>
                </Card>;
                topicReplayCardArray.push(topicReplayCard);
            });
        }

         var cardObj = <Card className="antnest-card" bordered={false}>
		 <div className="antnest_user">{userHeadPhoto}</div>
             <ul>
                 <li>
                         <span className="antnest_name">{topicObj.fromUser.userName}</span>
                         <span>{topicTitle}</span>
                 </li>
                 <li className="topics_cont">
                     {/*<p>{topicObj.content}</p>*/}
                     {topicObj.content}
                 </li>
                 <li>
                     {attachMentsArray}
                 </li>
                 <li>
                     <span className="topics_time">{createTime}</span>
                     <span>{delButton}</span>
                     <span className="topics_dianzan">
                         {praiseButton}
                         <Button icon="message" value={topicObj.id} onClick={antNest.showDiscussModal} className="topics_btn antnest_talk teopics_spa">评论</Button>
                     </span>
                 </li>
             </ul>
             {replayCard}
             {parTakeCountCard}
             {topicReplayCardArray}
         </Card>;
        topicCardArray.push(cardObj);
    },
    /**
     * 话题列表分页功能响应函数
     * @param page
     */
    pageOnChange(page) {
        if(antNest.state.activeKey=="全部"){
            antNest.getTopics(page,getAllTopic());
        }else{
            antNest.getTopics(page,getOnlyTeacherTopic());
        }
        // antNest.getTopics(page);
        antNest.setState({
            currentPage: page,
        });
    },
    /**
     * 根据话题的id，获取对应的话题详细信息
     * @param topicId 话题id
     * @param parTakeCountInfo 话题参与人数信息
     * @param pageNo 分页页码
     */
    getTopicInfoById(topicId,parTakeCountInfo,pageNo){
        var topicReplayInfoArray=[];
        var param = {
            "method": 'getTopicsByHuatiId',
            "huatiId": topicId+"",
            "pageNo": pageNo
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                response.forEach(function (e) {
                    //话题的回复
                    topicReplayInfoArray.push(e);
                });
                var pager = ret.pager;
                //话题主体对象
                var topicObj = antNest.findTopicObjFromArrayById(topicId);
                topicCardArray.splice(0);
                antNest.buildTopicCard(topicObj,1,topicReplayInfoArray,parTakeCountInfo);
                antNest.setState({"optType":'getTopicById',"topicCardList":topicCardArray,"currentTopicTitle":topicObj.title,"parTakeTotalCount":pager.rsCount,"currentTopicId":topicId});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },
    /**
     * 从暂存的topic对象数组中获取出对应的topic对象
     * @param topicId
     */
    findTopicObjFromArrayById(topicId){
        var topicObj;
        for(var i=0;i<topicObjArray.length;i++){
            var obj = topicObjArray[i];
            if(obj.id==parseInt(topicId)){
                topicObj = obj;
                break;
            }
        }
        return topicObj;
    },
    /**
     * 从单个话题的页面，返回到话题列表上
     */
    returnTopicList(){
        antNest.getTopics(1,0);
        antNest.setState({"optType":"getAllTopic",activeKey:'全部'});
    },
    /**
     * 获取话题的参与者信息
     */
    getTopicPartakeInfo(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var topicId = target.title;
        var initPageNo = 1;
        antNest.getTopicPartakeById(topicId,initPageNo);
    },
    /**
     * 获取话题参与人数的信息
     * @param topicId 话题id
     * @param pageNo 分页编码，用来完成对话题回复信息的获取，该参数会继续传递到下一个函数中进行使用
     */
    getTopicPartakeById(topicId,pageNo){
        var param = {
            "method": 'getHuatiInfo',
            "huatiId": topicId+"",
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var parTakeCountInfo = ret.response;
                antNest.getTopicInfoById(topicId,parTakeCountInfo,pageNo);
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 话题列表分页功能响应函数
     * @param page
     */
    parTakePageOnChange(page) {
        antNest.getTopics(page);
        antNest.getTopicPartakeById(antNest.state.currentTopicId,page);
        antNest.setState({
            currentPartakePage: page,
        });
    },

    /**
     * 话题点赞功能
     * @param e
     */
    praiseForTopic(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var topicIdStrArray = target.value.split("#");
        var topicId = topicIdStrArray[0];
        var parentTopicId = topicIdStrArray[0];
        if(topicIdStrArray.length>1){
            parentTopicId=topicIdStrArray[1];
        }else{
            topicId = topicIdStrArray[0];
        }
        var param = {
            "method": 'praiseForTopic',
            "ident":sessionStorage.getItem("ident"),
            "topicId": topicId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.success==true && ret.response == true){
                    message.success("点赞成功");
                }else{
                    message.error("点赞失败");
                }
                if(antNest.state.optType=="getTopicById"){
                    //如果是在单个话题的页面中完成点赞或取消点赞，则停留在当前页面
                    antNest.reGetTopicInfo(1,getAllTopic());
                    antNest.getTopicPartakeById(parentTopicId,1);
                }else {
                    if (antNest.state.activeKey == "全部") {
                        antNest.getTopics(1, getAllTopic());
                    } else {
                        antNest.getTopics(1, getOnlyTeacherTopic());
                    }
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 话题取消点赞功能
     * @param e
     */
    cancelPraiseForTopic(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var topicIdStrArray = target.value.split("#");
        var topicId = topicIdStrArray[0];
        var parentTopicId = topicIdStrArray[0];
        if(topicIdStrArray.length>1){
            parentTopicId=topicIdStrArray[1];
        }else{
            topicId = topicIdStrArray[0];
        }
        var param = {
            "method": 'cancelPraiseForTopic',
            "ident":sessionStorage.getItem("ident"),
            "topicId": topicId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.success==true && ret.response == true){
                    message.success("取消点赞成功");
                }else{
                    message.error("取消点赞失败");
                }
                if(antNest.state.optType=="getTopicById"){
                    //如果是在单个话题的页面中完成点赞或取消点赞，则停留在当前页面
                    antNest.reGetTopicInfo(1,getAllTopic());
                    antNest.getTopicPartakeById(parentTopicId,1);
                }else{
                    if(antNest.state.activeKey=="全部"){
                        antNest.getTopics(1,getAllTopic());
                    }else{
                        antNest.getTopics(1,getOnlyTeacherTopic());
                    }
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 重新获取话题列表，并更新本地缓存的话题数组
     * @param type 0:全部  1：只看老师
     * @param pageNo
     */
    reGetTopicInfo(pageNo,type){
        topicCardArray.splice(0);
        topicObjArray.splice(0);
        var param = {
            "method": 'getTopicsByType',
            "ident": sessionStorage.getItem("ident"),
            "type":type,
            "pageNo": pageNo
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                response.forEach(function (e) {
                    topicObjArray.push(e);
                });
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 删除一个话题
     * @param e
     */
    deleteTopic(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var topicId = target.value;
        confirm({
            title: '确定要删除该条记录?',
            onOk() {
                var param = {
                    "method": 'deleteTopic',
                    "ident": sessionStorage.getItem("ident"),
                    "topicId":topicId+""
                };
                doWebService(JSON.stringify(param), {
                    onResponse: function (ret) {
                        if(ret.success==true && ret.response == true){
                            message.success("删除成功");
                        }else{
                            message.error("删除失败");
                        }
                        if(antNest.state.optType=="getTopicById"){
                            //如果是在单个话题的页面中完成点赞或取消点赞，则停留在当前页面
                            antNest.reGetTopicInfo(1,getAllTopic());
                            antNest.getTopicPartakeById(antNest.state.currentTopicId,1);
                        }else {
                            if (antNest.state.activeKey == "全部") {
                                antNest.getTopics(1, getAllTopic());
                            } else {
                                antNest.getTopics(1, getOnlyTeacherTopic());
                            }
                        }
                    },
                    onError: function (error) {
                        message.error(error);
                    }
                });
            },
            onCancel() {
            },
        });
    },

    /**
     * 删除一个话题中的评论
     * @param e
     */
    deleteTopicComment(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var topicCommentId = target.value;
        confirm({
            title: '确定要删除该条评论?',
            onOk() {
                var param = {
                    "method": 'deleteTopicComment',
                    "ident": sessionStorage.getItem("ident"),
                    "topicCommentId":topicCommentId+""
                };
                doWebService(JSON.stringify(param), {
                    onResponse: function (ret) {
                        if(ret.success==true && ret.response == true){
                            message.success("评论删除成功");
                        }else{
                            message.error("评论删除失败");
                        }
                        if(antNest.state.optType=="getTopicById"){
                            //如果是在单个话题的页面中完成点赞或取消点赞，则停留在当前页面
                            antNest.reGetTopicInfo(1,getAllTopic());
                            antNest.getTopicPartakeById(antNest.state.currentTopicId,1);
                        }else{
                            if(antNest.state.activeKey=="全部"){
                                antNest.getTopics(1,getAllTopic());
                            }else{
                                antNest.getTopics(1,getOnlyTeacherTopic());
                            }
                        }
                    },
                    onError: function (error) {
                        message.error(error);
                    }
                });
            },
            onCancel() {
            },
        });
    },

    /**
     * 置顶选定的说说
     */
    setTopicToTop(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var topicIdStrArray = target.value.split("#");
        var setTopicId = topicIdStrArray[0];
        var topicSubId = topicIdStrArray[1];
        confirm({
            title: '确定要将该条记录置顶?',
            onOk() {
                var param = {
                    "method": 'setHuatiTop',
                    "userId": sessionStorage.getItem("ident"),
                    "topicId":topicSubId+"",
                    "huatiId":setTopicId
                };
                doWebService(JSON.stringify(param), {
                    onResponse: function (ret) {
                        if(ret.success==true && ret.response == true){
                            message.success("话题置顶成功");
                        }else{
                            message.error("话题置顶失败");
                        }
                        if(antNest.state.optType=="getTopicById"){
                            //如果是在单个话题的页面中完成点赞或取消点赞，则停留在当前页面
                            antNest.reGetTopicInfo(1,getAllTopic());
                            antNest.getTopicPartakeById(antNest.state.currentTopicId,1);
                        }else {
                            if (antNest.state.activeKey == "全部") {
                                antNest.getTopics(1, getAllTopic());
                            } else {
                                antNest.getTopics(1, getOnlyTeacherTopic());
                            }
                        }
                    },
                    onError: function (error) {
                        message.error(error);
                    }
                });
            },
            onCancel() {
            },
        });
    },

    /**
     * 弹出评论窗口
     * @param e
     */
    showDiscussModal(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var topicIdAndUserId = target.value;
        var discussArray = topicIdAndUserId.split("#");
        var topicId = discussArray[0];
        var toUserId;
        if(discussArray.length==1){
            antNest.setState({discussModalVisible: true,"currentTopicId":topicId});
        }else if(discussArray.length>1 && discussArray[1]=="toUser"){
            antNest.setState({discussModalVisible: true,"replayToUserTopicId":topicId});
        }else{
            //评论指向具体人的id
            toUserId = discussArray[1];
            antNest.setState({discussModalVisible: true,"replayTopicId":topicId,"toUserId":toUserId});
        }
    },

    /**
     * 评论窗口的确定操作
     */
    discussModalHandleOk(){
        //获取富文本框中包含表情的评论内容
        var inputContent = $("#emotionInput").val();
        console.log("inputContent:"+inputContent);
        var toUserId = -1;
        if(isEmpty(antNest.state.toUserId)==false){
            toUserId = antNest.state.toUserId;
        }
        var topicId;
        if(isEmpty(antNest.state.replayTopicId)==false){
            topicId = antNest.state.replayTopicId;
        }else if(isEmpty(antNest.state.replayToUserTopicId)==false){
            topicId = antNest.state.replayToUserTopicId;
        }else{
            topicId = antNest.state.currentTopicId;
        }
        var param = {
            "method": 'addTopicCommentAndResponse2',
            "ident": sessionStorage.getItem("ident"),
            "toUserId":toUserId,
            "topicId":topicId,
            "content":inputContent
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.success==true && isEmpty(ret.response.id) == false){
                    message.success("评论成功");
                }else{
                    message.error("评论失败");
                }
                if(antNest.state.optType=="getTopicById"){
                    //如果是在单个话题的页面中完成点赞或取消点赞，则停留在当前页面
                    antNest.reGetTopicInfo(1,getAllTopic());
                    antNest.getTopicPartakeById(antNest.state.currentTopicId,1);
                }else {
                    if (antNest.state.activeKey == "全部") {
                        antNest.getTopics(1, getAllTopic());
                    } else {
                        antNest.getTopics(1, getOnlyTeacherTopic());
                    }
                }
                antNest.initMyEmotionInput();
                antNest.setState({discussModalVisible: false,"toUserId":-1,"replayTopicId":'',"replayToUserTopicId":''});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 关闭评论弹窗
     */
    discussModalHandleCancel(){
        antNest.initMyEmotionInput();
        antNest.setState({discussModalVisible: false});
    },

    /**
     * 初始化表情输入框
     */
    initMyEmotionInput(){
        $("#emotionInput").val("");
        $(".emoji-wysiwyg-editor")[0].innerHTML="";
    },

    createUUID() {
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";

        var uuid = s.join("");
        return uuid;
    },

    /**
     * 发表说说或话题
     */
    addTopicModalHandleOk(){
        //获取富文本框中包含表情的评论内容
        var inputContent = $("#emotionInput").val();
        console.log("inputContent:"+inputContent);
        var createTime = (new Date()).valueOf();
        var uuid = antNest.createUUID();
        var topicImageArray = antNest.state.topicImgUrl;
        var attachMents=[];
        for(var i=0;i<topicImageArray.length;i++){
            var attach = {"type":1,"address":topicImageArray[i],"createTime":createTime,"user":JSON.parse(sessionStorage.getItem("loginUser"))};
            attachMents.push(attach);
        }
        var topicJson={
            "content":inputContent,
            "fromUserId":sessionStorage.getItem("ident"),
            "fromUser":JSON.parse(sessionStorage.getItem("loginUser")),
            "valid":0,
            "type":0,
            "uuid":uuid,
            "attachMents":attachMents,
            "comments":[],
            "open":0,
        };
        if(isEmpty(antNest.state.topicTitle)==false){
            topicJson.type = 1;
            topicJson.title=antNest.state.topicTitle;
        }else{
            topicJson.type = 0;
        }
        var param = {
            "method": 'addTopic',
            "topicJson": topicJson,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.success==true && ret.response == true){
                    message.success("说说发表成功");
                }else{
                    message.error("说说发表失败");
                }
                $("#emotionInput").val("");
                if (antNest.state.activeKey == "全部") {
                    antNest.getTopics(1, getAllTopic());
                } else {
                    antNest.getTopics(1, getOnlyTeacherTopic());
                }
                antNest.initMyEmotionInput();
                antNest.setState({addTopicModalVisible: false});
            },
            onError: function (error) {
                message.error(error);
            }
        });

    },

    /**
     * 发表说说或话题的窗口关闭响应函数
     */
    addTopicModalHandleCancel(){
        antNest.initMyEmotionInput();
        antNest.setState({addTopicModalVisible: false});
    },

    /**
     * 获取已上传的图片信息
     */
    getUploadedImgList(file,isRemoved){
        var imgUrl = file.response;
        if(isEmpty(isRemoved)==false && isRemoved=="removed"){
            for(var i=0;i<antNest.state.topicImgUrl.length;i++){
                if(antNest.state.topicImgUrl[i] == imgUrl){
                    antNest.state.topicImgUrl.splice(i,1);
                }
            }
        }else{
            antNest.state.topicImgUrl.push(imgUrl);
        }
    },
    /**
     * 显示发表说说/话题的窗口
     */
    showaddTopicModal(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var optType = target.value;
        antNest.setState({"addTopicModalVisible":true,"topicModalType":optType});
    },

    /**
     * 话题的标题内容改变时的响应函数
     * @param e
     */
    topicTitleChange(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var title = target.value;
        antNest.setState({"topicTitle":title});
    },
    
    showPartakeModal(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var topicId = target.value;
        console.log("topicId:"+topicId);
        antNest.setState({"partakeModalVisible":true});
    },
    /**
     * 评论某个人的回复
     */
    replayTopicComment(){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var topicId = target.value;
        console.log("topicId:"+topicId);
    },

    /**
     * 立即参与窗口的确定响应函数
     */
    partakeModalHandleOk(){
        antNest.setState({"partakeModalVisible":false});
    },

    /**
     * 立即参与窗口的取消响应函数
     */
    partakeModalHandleCancel(){
        antNest.setState({"partakeModalVisible":false});
    },

    render() {
        var mainComponent ;
        var breadMenuTip="蚁巢";
        mainComponent = <TeacherAllCourseWare ref="courseWare"/>;
        var toolbarExtra = <div className="ant-tabs-right"><Button value="talk" onClick={antNest.showaddTopicModal} className="antnest_talk">发表说说</Button><Button value="topic" onClick={antNest.showaddTopicModal}>发表话题</Button></div>;
        var returnToolBar = <div className="ant-tabs-right"><Button onClick={antNest.returnTopicList}>返回</Button></div>
        var tabComponent;
        if(antNest.state.optType=="getTopicById"){
            //获取单个话题的数据
            tabComponent = <Tabs
                hideAdd
                tabBarExtraContent={returnToolBar}
                activeKey={antNest.state.currentTopicTitle}
                defaultActiveKey={antNest.state.currentTopicTitle}
                transitionName=""  //禁用Tabs的动画效果
            >
                <TabPane tab={antNest.state.currentTopicTitle} key={antNest.state.currentTopicTitle}>
                    <div className="antnest_cont">
                        {antNest.state.topicCardList}
                    </div>
                    <Pagination key="teacher" total={antNest.state.parTakeTotalCount} pageSize={getPageSize()} current={antNest.state.currentPartakePage}
                                onChange={antNest.parTakePageOnChange}/>
                </TabPane>
            </Tabs>;
        }else{
            tabComponent = <Tabs
                hideAdd
                onChange={this.onChange}
                ref = "mainTab"
                activeKey={this.state.activeKey}
                defaultActiveKey={this.state.defaultActiveKey}
                tabBarExtraContent={toolbarExtra}
                transitionName=""  //禁用Tabs的动画效果
            >
                <TabPane tab="全部" key="全部">
                    <div className="antnest_cont">
                        {antNest.state.topicCardList}
                    </div>
                    <Pagination key="all" total={antNest.state.totalCount} pageSize={getPageSize()} current={antNest.state.currentPage}
                                onChange={antNest.pageOnChange}/>
                </TabPane>
                <TabPane tab="只看老师" key="只看老师">
                    <div className="antnest_cont">
                        {antNest.state.topicCardList}
                    </div>
                    <Pagination key="allTeacher" total={antNest.state.totalCount} pageSize={getPageSize()} current={antNest.state.currentPage}
                                onChange={antNest.pageOnChange}/>
                </TabPane>
            </Tabs>;
        }
        var topicTitle;
        if(antNest.state.topicModalType=="topic"){
            topicTitle = <Row>
                <Col span={3}>标题：</Col>
                <Col span={15}><Input onChange={antNest.topicTitleChange} /></Col>
            </Row>;
        }
        return (
            <div>
                <Modal title="评论" visible={antNest.state.discussModalVisible}
                       onOk={antNest.discussModalHandleOk} onCancel={antNest.discussModalHandleCancel}
                >
                    <div>
                        <Row>
                            <Col span={3}>内容：</Col>
                            <Col span={15}><EmotionInputComponents></EmotionInputComponents></Col>
                        </Row>
                    </div>
                </Modal>
                <Modal title="发布说说" visible={antNest.state.addTopicModalVisible}
                       onOk={antNest.addTopicModalHandleOk} onCancel={antNest.addTopicModalHandleCancel}
                >
                    <div>
                        {topicTitle}
                        <Row>
                            <Col span={3}>内容：</Col>
                            <Col span={15}><EmotionInputComponents></EmotionInputComponents></Col>
                        </Row>
                        <Row>
                            <Col span={3}>附件：</Col>
                            <Col span={15}><UploadImgComponents callBackParent={antNest.getUploadedImgList}></UploadImgComponents></Col>
                        </Row>
                    </div>

                </Modal>
                <Modal title="立即参与" visible={antNest.state.partakeModalVisible}
                       onOk={antNest.partakeModalHandleOk} onCancel={antNest.partakeModalHandleCancel}
                >
                    <div>
                        <Row>
                            <Col span={3}>内容：</Col>
                            <Col span={15}><EmotionInputComponents></EmotionInputComponents></Col>
                        </Row>
                        <Row>
                            <Col span={3}>附件：</Col>
                            <Col span={15}><UploadImgComponents callBackParent={antNest.getUploadedImgList}></UploadImgComponents></Col>
                        </Row>
                    </div>

                </Modal>
                <Breadcrumb separator=">">
                    <Breadcrumb.Item><Icon type="home" /></Breadcrumb.Item>
                    <Breadcrumb.Item href="#/MainLayout">个人中心</Breadcrumb.Item>
                    <Breadcrumb.Item href="#/MainLayout">{breadMenuTip}</Breadcrumb.Item>
                </Breadcrumb>
                {tabComponent}
            </div>
        );
    },
});

export default AntNestTabComponents;
