import React, { PropTypes } from 'react';
import { Tabs, Breadcrumb, Icon,Card,Button,Row,Col} from 'antd';
import {message,Pagination,Modal,Input} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {getPageSize} from '../../utils/Const';
import {getLocalTime} from '../../utils/Const';
import {isEmpty} from '../../utils/Const';
import {getAllTopic} from '../../utils/Const';
import {getOnlyTeacherTopic} from '../../utils/Const';
import {showLargeImg} from '../../utils/utils';
import UploadImgComponents from './UploadImgComponents';
import EmotionInputComponents from './EmotionInputComponents';
import ConfirmModal from '../ConfirmModal';

var topicCardArray=[];
var antNest;
var topicObjArray=[];
const AntNestTabComponents = React.createClass({

    getInitialState() {
        antNest = this;
        return {
            topicCardList:[],   //存放获取的话题Card对象
            totalCount:0,       //分页时，返回的总数据量
            currentPage:1,      //在查看全部页面时的当前页码
            currentTeacherPage:1,       //在只看老师页面时的当前页码
            //最终页面上显示的分页器上显示的页码值（该值由type来决定，type==0时取currentPage,否则取currentTeacherPage值）
            currentShowPage:1,
            optType:'getAllTopic',      //操作类型，用来区分用户的动作是查看话题列表页面，还是查看单个话题
            currentTopicId:'',          //当前操作的话题id，评论时时都会用到
            discussModalVisible:false,  //评论的Modal窗口状态控制
            topicImgUrl:[],     //说说/话题上传的图片路径,
            topicModalType:'talk',  //控制话题和说说Modal的显示，用来存储用户的动作
            topicTitle:'',      //话题的标题
            toUserId:-1, //评论指定人或直接评论,评论指定人时,值为真实id，否则为-1
            replayToUserTopicId:'',     //被回复的话题id
            partakeTopicId:'',       //话题参与时,当前要参与的话题id
            confirmModalVisible:true,   //删除操作的确认Modal状态控制
            topicCommentId:'',  //话题评论时的目标id
            type:0,     //操作类型（0：查看全部  1：只看老师）
        };
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
        if(isEmpty(pageNo)){
            if(type==0){
                pageNo = antNest.state.currentPage;
            }else{
                pageNo = antNest.state.currentTeacherPage;
            }
        }
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
                antNest.setState({"topicCardList":topicCardArray,"totalCount":pager.rsCount,"currentShowPage":pageNo,type:type});
            },
            onError: function (error) {
                message.error(error);
            }
        });
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
            userHeadPhoto =  <img src={require('../images/maaee_pic.png')}/>;
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
                var replayUserTitle;
                if(isEmpty(e.toUser)==false && (e.user.colUid!=e.toUser.colUid)){
                    replayUserTitle=<span>{e.user.userName} 回复 {e.toUser.userName}：</span>;
                }else{
                    replayUserTitle=<span>{e.user.userName}：</span>;
                }
                var delBtn;
                if(e.user.colUtype=="STUD" || (e.user.colUtype=="TEAC" && e.user.colUid == sessionStorage.getItem("ident"))){
                    delBtn = <Button value={e.id} className="topics_btn antnest_talk topics_a topics_a—bnt teopics_spa topics_le"  type="dashed" onClick={antNest.showDeleteTopicCommentModal}>删除</Button>;
                }
                var answerUserInfo = <li className="topics_comment">
                    {replayUserTitle}
                    <span>{e.content}</span>
                    <span className="topics_reply">
                        {delBtn}
						<span className="topics_r-line"></span>
                        <Button value={topicObj.id+"#"+e.user.colUid}  type="dashed"  className="topics_btn topics_a topics_a—bnt teopics_spa"  onClick={antNest.showDiscussModal}>回复</Button>
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
                praiseButton = <Button icon="like" value={topicObj.id} onClick={antNest.cancelPraiseForTopic} className="topics_btn teopics_spa antnest_talk topics_oranges">点赞</Button>;
                break;
            }else{
                praiseButton = <Button icon="like-o" value={topicObj.id} onClick={antNest.praiseForTopic} className="topics_btn antnest_talk teopics_spa">点赞</Button>;
            }
        }
        //遍历附件信息，并按类型封装数据
        topicObj.attachMents.forEach(function (e) {
            var attachMents;
            var attachMentType = e.type;
            if(attachMentType==1){
                //图片附件
                attachMents = <span className="topics_zan">
                    <img className="topics_zanImg" src={e.address}  onClick={showLargeImg}/>
                </span>;

            }else if(attachMentType==4){
                //mp4附件
                attachMents =<div className="toppics_ul_bg share_cont">
								<span  onClick={event => {antNest.view(event,e.address,e.content)} } className="share_img share_le">
									<img src={e.cover} />
								</span>
								<span onClick={event => {antNest.view(event,e.address,e.content)} } className="share_font">
									{e.content}
								</span>
					         </div>
            }
            attachMentsArray.push(attachMents);
        })
        //话题回复信息显示的card
        var replayCard="";
        //如果点赞和回复信息都存在，则在card的title部分显示点赞，content部分显示回复
        //否则只需要在内容区域显示即可
        if(likeUsersArray.length!=0 && answerUsersArray.length!=0){
            replayCard = <div>
                <ul className="toppics_ul_bg topics_bor_bot">
                    <span><Button icon="like" className="topics_btn"></Button> {likeUsersArray}</span>
                </ul>
                <ul className="toppics_ul_bg">
                    {answerUsersArray}
                </ul>
            </div>;
        }else if(likeUsersArray.length!=0 && answerUsersArray.length==0 ){
            replayCard = <div>
			<ul className="toppics_ul_bg topics_bor_bot">
                <span><Button icon="like" className="topics_btn"></Button> {likeUsersArray}</span>
			</ul>
            </div>;
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
            //STUD
            if(topicObj.fromUser.colUtype=="STUD" || (topicObj.fromUser.colUtype=="TEAC" && topicObj.fromUser.colUid == sessionStorage.getItem("ident"))){
               delButton = <Button value={topicObj.id} icon="delete" className="ant-btn topics_btn antnest_talk teopics_spa" onClick={antNest.showDeleteTopicModal}>删除</Button>;
            }
        }
        //参与人数显示card
        var parTakeCountCard;
        if(isEmpty(parTakeCountInfo)==false){
            parTakeCountCard = <div className="upexam_top topics_blue_bg">
                <ul className="topics_mar60">
                    <span className="topics_time">参与{parTakeCountInfo.participatecount}人，未参与{parTakeCountInfo.unParticipatecount}人</span>
                    <span><Button value={topicObj.id} onClick={antNest.showPartakeModal}>立即参与</Button></span>
                </ul>
            </div>;
        }
        //单个话题中的回复参与信息
        var topicReplayCardArray=[];
        if(isEmpty(topicReplayInfoArray)== false && topicReplayInfoArray.length!=0 && useType==1){
            topicReplayInfoArray.forEach(function (topicReplayInfo) {
                var replayUserHeadPhoto;
                if(isEmpty(topicReplayInfo.fromUser.colPhotoPath)){
                    replayUserHeadPhoto =  <img src={require('../images/maaee_pic.png')}/>;
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
                        var replayUserTitle;
                        if(isEmpty(e.toUser)==false && (e.user.colUid!=e.toUser.colUid)){
                            replayUserTitle=<span>{e.user.userName} 回复 {e.toUser.userName}：</span>;
                        }else{
                            replayUserTitle=<span>{e.user.userName}：</span>;
                        }
                        var delBtnInRelpay;
                        if(e.user.colUtype=="STUD" || (e.user.colUtype=="TEAC" && e.user.colUid == sessionStorage.getItem("ident"))){
                            delBtnInRelpay = <Button value={e.id}  type="dashed"  className="topics_btn antnest_talk topics_a topics_a—bnt teopics_spa topics_le" onClick={antNest.deleteTopicComment}>删除</Button>;
                        }
                        var answerUserInfo = <li className="topics_comment">
                            {replayUserTitle}
                            <span>{e.content}</span>
                            <span className="topics_reply">
                                {delBtnInRelpay}
								<span className="topics_r-line"></span>
                                <Button value={topicReplayInfo.id+"#"+e.user.colUid} type="dashed"  className="topics_btn topics_a topics_a—bnt teopics_spa"  onClick={antNest.showDiscussModal}>回复</Button>
                            </span>
                        </li>;
                        replayAnswerUsersArray.push(answerUserInfo);
                    }
                })
                //如果当前用户未点赞，则使用空心按钮表示，按钮点击功能表示“取消点赞”
                var replayPraiseButton=<Button icon="like-o" value={topicReplayInfo.id+"#"+topicObj.id} onClick={antNest.praiseForTopic} className="topics_btn antnest_talk teopics_spa ">点赞</Button>;
                //话题列表中的点赞按钮
                for(var i=0;i<replayLikeUsersInfoArray.length;i++){
                    var likeUser = replayLikeUsersInfoArray[i];
                    if(parseInt(sessionStorage.getItem("ident")) == likeUser.colUid){
                        //如果当前用户已点赞，则使用实心按钮表示.按钮点击功能表示“点赞”
                        replayPraiseButton = <Button icon="like" value={topicReplayInfo.id+"#"+topicObj.id} onClick={antNest.cancelPraiseForTopic}  className="topics_btn antnest_talk teopics_spa topics_oranges">点赞</Button>;
                        break;
                    }else{
                        replayPraiseButton = <Button icon="like-o" value={topicReplayInfo.id+"#"+topicObj.id} onClick={antNest.praiseForTopic} className="topics_btn antnest_talk teopics_spa ">点赞</Button>;
                    }
                }

                //如果点赞和回复信息都存在，则在card的title部分显示点赞，content部分显示回复
                //否则只需要在内容区域显示即可
                var replayCardForSingle;
                if(replayLikeUsersArray.length!=0 && replayAnswerUsersArray.length!=0){
                    replayCardForSingle = <div>
                        <ul  className="toppics_ul_bg topics_bor_bot topics_mar60">
                            <span><Button icon="like" className="topics_btn"></Button> {replayLikeUsersArray}</span>
                        </ul>
                        <ul className="toppics_ul_bg topics_mar60">
                            {replayAnswerUsersArray}
                        </ul>
                    </div>;
                }else if(replayLikeUsersArray.length!=0 && replayAnswerUsersArray.length==0 ){
                    replayCardForSingle = <div>
                        <span><Button icon="like" className="topics_btn"></Button> {replayLikeUsersArray}</span>
                    </div>;
                }else if(replayLikeUsersArray.length==0 && replayAnswerUsersArray.length!=0 ){
                    replayCardForSingle = <div>
                        <ul className="toppics_ul_bg topics_mar60">
                            {replayAnswerUsersArray}
                        </ul>
                    </div>;
                }

                var replayAttachMentsArray=[]
                //遍历附件信息，并按类型封装数据
                topicReplayInfo.attachMents.forEach(function (e) {
                    var attachMents;
                    var attachMentType = e.type;
                    if(attachMentType==1){
                        //图片附件
                        attachMents = <span className="topics_zan"><img src={e.address}/></span>;
                    }else if(attachMentType==4){
                        //mp4附件
                        attachMents = <span className="antnest_user">
                            <span onClick={event => {antNest.view(event,e.address,e.content)} } >
                                <img src={e.cover}/><span>{e.content}</span>
                            </span>
                        </span>;
                    }
                    replayAttachMentsArray.push(attachMents);
                })
                var delBtnInReplayCard;
                if(topicReplayInfo.fromUser.colUtype=="STUD" || (topicReplayInfo.fromUser.colUtype=="TEAC" && topicReplayInfo.fromUser.colUid == sessionStorage.getItem("ident"))){
                    delBtnInReplayCard = <Button value={topicReplayInfo.id} icon="delete" onClick={antNest.deleteTopic.bind(antNest,topicReplayInfo.id)} className="topics_btn antnest_talk teopics_spa">删除</Button>;
                }
                var praiseBtn;
                if(topicObj.fromUser.colUtype=="TEAC" && topicObj.fromUser.colUid == sessionStorage.getItem("ident")){
                    praiseBtn = <Button value={topicObj.id+"#"+topicReplayInfo.id} icon="to-top" onClick={antNest.showSetTopicTopModal} className="topics_btn antnest_talk teopics_spa">置顶</Button>;
                }
                var topicReplayCard = <div  style={{ marginBottom: '15px' }}>
                    <div style={{marginLeft:'0'}} className="antnest_user">{replayUserHeadPhoto}</div>
                    <ul>
					    <li className="antnest_name">{topicReplayInfo.fromUser.userName}</li>
                       <li>  {topicReplayInfo.content}</li>
                        <li >{replayAttachMentsArray}</li>
						<li className="topics_bot"><span className="topics_time">{getLocalTime(topicReplayInfo.createTime)}</span><span className="topics_dianzan">
                        {delBtnInReplayCard}
                        {praiseBtn}
                        {replayPraiseButton}
                        <Button icon="message" value={topicReplayInfo.id+"#toUser"} onClick={antNest.showDiscussModal} className="topics_btn teopics_spa">评论</Button></span></li>
                    </ul>
                    <ul>
                        {replayCardForSingle}
                    </ul>
                </div>;
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
                     {topicObj.content}
                 </li>
                 <li className="imgLi">
                     {attachMentsArray}
                 </li>
                 <li className="topics_bot">
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
        if(antNest.state.type==0){
            antNest.setState({
                currentPage: page,
            });
            antNest.getTopics(page,getAllTopic());
        }else{
            antNest.setState({
                currentTeacherPage: page,
            });
            antNest.getTopics(page,getOnlyTeacherTopic());
        }
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
                antNest.setState({"optType":'getTopicById',"topicCardList":topicCardArray,"totalCount":pager.rsCount,"currentTopicId":topicId});
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
        if(antNest.state.type==0){
            antNest.getTopics(antNest.state.currentPage, getAllTopic());
        }else{
            antNest.getTopics(antNest.state.currentTeacherPage, getOnlyTeacherTopic());
        }
        antNest.setState({"optType":"getAllTopic",type:getAllTopic()});
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
                    antNest.reGetTopicInfo(antNest.state.currentShowPage,getAllTopic());
                    antNest.getTopicPartakeById(parentTopicId,antNest.state.currentShowPage);
                }else {
                    if(antNest.state.type==0){
                        antNest.getTopics(antNest.state.currentPage, getAllTopic());
                    }else{
                        antNest.getTopics(antNest.state.currentTeacherPage, getOnlyTeacherTopic());
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
                    antNest.reGetTopicInfo(antNest.state.currentShowPage,getAllTopic());
                    antNest.getTopicPartakeById(parentTopicId,antNest.state.currentShowPage);
                }else{
                    if(antNest.state.type==0){
                        antNest.getTopics(antNest.state.currentPage,getAllTopic());
                    }else{
                        antNest.getTopics(antNest.state.currentTeacherPage,getOnlyTeacherTopic());
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
     * 显示删除话题的确认Modal
     * @param e
     */
    showDeleteTopicModal(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var topicId = target.value;
        antNest.refs.confirmModal.changeConfirmModalVisible(true);
        antNest.setState({"currentTopicId":topicId});
    },

    /**
     * 关闭删除操作的confirm窗口
     */
    closeDeleteTopicModal(){
        antNest.refs.confirmModal.changeConfirmModalVisible(false);
    },

    /**
     * 删除一个话题
     * @param e
     */
    deleteTopic(replayTopicId){
        var delId;
        if(isEmpty(replayTopicId)==false){
            delId = replayTopicId;
        }else{
            delId = antNest.state.currentTopicId;
        }
        antNest.deleteTopicById(delId);
    },

    /**
     * 根据给定的话题id，删除指定的话题
     * @param topicId
     */
    deleteTopicById(topicId){
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
                antNest.closeDeleteTopicModal();
                if(antNest.state.optType=="getTopicById"){
                    //如果是在单个话题的页面中完成点赞或取消点赞，则停留在当前页面
                    antNest.reGetTopicInfo(antNest.state.currentPage,getAllTopic());
                    antNest.getTopicPartakeById(antNest.state.currentTopicId,antNest.state.currentPage);
                }else {
                    if (antNest.state.type==0) {
                        antNest.getTopics(antNest.state.currentPage, getAllTopic());
                    } else {
                        antNest.getTopics(antNest.state.currentTeacherPage, getOnlyTeacherTopic());
                    }
                }
                antNest.setState({"currentTopicId":''});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 显示删除评论的confirm
     */
    showDeleteTopicCommentModal(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var topicCommentId = target.value;
        antNest.setState({"topicCommentId":topicCommentId});
        antNest.refs.deleteTopicCommentModal.changeConfirmModalVisible(true);
    },

    /**
     * 关闭删除操作的confirm窗口
     */
    closeDeleteTopicCommentModal(){
        antNest.refs.deleteTopicCommentModal.changeConfirmModalVisible(false);
    },

    /**
     * 删除一个话题中的评论
     * @param e
     */
    deleteTopicComment(){
        antNest.deleteTopicCommentById(antNest.state.topicCommentId);
    },
    /**
     * 根据评论id，删除话题/说说中的评论
     * @param topicCommentId 评论id
     */
    deleteTopicCommentById(topicCommentId){
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
                antNest.closeDeleteTopicCommentModal();
                if(antNest.state.optType=="getTopicById"){
                    //如果是在单个话题的页面中完成点赞或取消点赞，则停留在当前页面
                    antNest.reGetTopicInfo(antNest.state.currentShowPage,getAllTopic());
                    antNest.getTopicPartakeById(antNest.state.currentTopicId,antNest.state.currentShowPage);
                }else{
                    if(antNest.state.type==0){
                        antNest.getTopics(antNest.state.currentPage,getAllTopic());
                    }else{
                        antNest.getTopics(antNest.state.currentTeacherPage,getOnlyTeacherTopic());
                    }
                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },
    /**
     * 显示是否置顶话题的确认Modal
     * @param e
     */
    showSetTopicTopModal(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var topicIdStr = target.value;
        antNest.setState({"currentTopicId":topicIdStr});
        antNest.refs.setTopicTopModal.changeConfirmModalVisible(true);
    },

    /**
     * 关闭是否置顶话题的确认Modal
     */
    closeSetTopicTopModal(){
        antNest.refs.setTopicTopModal.changeConfirmModalVisible(false);
    },

    /**
     * 将指定的话题参与内容置顶
     */
    setTopicToTop(){
        antNest.setTopicToTopById(antNest.state.currentTopicId);
        antNest.closeSetTopicTopModal();
    },

    /**
     * 置顶选定的说说
     */
    setTopicToTopById(topicIdStr){
        var topicIdStrArray = topicIdStr.split("#");
        var setTopicId = topicIdStrArray[0];
        var topicSubId = topicIdStrArray[1];
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
                    antNest.reGetTopicInfo(antNest.state.currentShowPage,getAllTopic());
                    antNest.getTopicPartakeById(setTopicId,antNest.state.currentShowPage);
                }else {
                    if (antNest.state.type==0) {
                        antNest.getTopics(antNest.state.currentPage, getAllTopic());
                    } else {
                        antNest.getTopics(antNest.state.currentTeacherPage, getOnlyTeacherTopic());
                    }
                }
            },
            onError: function (error) {
                message.error(error);
            }
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
        var inputContent;
        inputContent = antNest.getEmotionInputById();
        if(isEmpty(inputContent)){
            message.error("评论内容不允许为空,请重新输入",5);
            return;
        }else{
            inputContent = inputContent.replace(/\'/g, "\\'");  //' 替换成  \'
            inputContent = inputContent.replace(/\"/g, "\\\""); //" 替换成\"
            inputContent = inputContent.replace(/</g, "\\\<"); //< 替换成\<
            inputContent = inputContent.replace(/>/g,"\\\>"); //> 替换成\>
        }
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
                //这段代码移到前方，可以避免页面重新刷新加载，能够保持页面停留在刚刚操作的位置上
                antNest.initMyEmotionInput();
                antNest.setState({discussModalVisible: false,"toUserId":-1,"replayTopicId":'',"replayToUserTopicId":''});
                if(antNest.state.optType=="getTopicById"){
                    //如果是在单个话题的页面中完成点赞或取消点赞，则停留在当前页面
                    antNest.reGetTopicInfo(antNest.state.currentShowPage,getAllTopic());
                    antNest.getTopicPartakeById(antNest.state.currentTopicId,antNest.state.currentShowPage);
                }else {
                    if (antNest.state.type==0) {
                        antNest.getTopics(antNest.state.currentPage, getAllTopic());
                    } else {
                        antNest.getTopics(antNest.state.currentTeacherPage, getOnlyTeacherTopic());
                    }
                }
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
     * 清空话题标题输入框
     */
    initMyEmotionInput(){
        $("#emotionInput").val("");
        var emotionArray = $(".emoji-wysiwyg-editor");
        if(isEmpty(emotionArray)==false){
            for(var i=0;i<emotionArray.length;i++){
                emotionArray[i].innerHTML="";
                emotionArray[i].innerText="";
            }
        }
        //清空话题标题输入框
        antNest.setState({"topicTitle":'',"topicImgUrl":[]});
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
     * 获取输入的emoji表情
     * @returns {string}
     */
    getEmotionInput(){
        var emotionInput="";
        var emotionArray = $(".emoji-wysiwyg-editor");
        if(isEmpty(emotionArray)==false){
            for(var i=0;i<emotionArray.length;i++){
                var emotionObj = emotionArray[i];
                if(isEmpty(emotionObj.innerText)==false){
                    emotionInput = emotionObj.innerText;
                    break;
                }
            }
        }
        return emotionInput;
    },

    /**
     * 通过id获取文本域对象，并进而获取vaue值
     * @returns {string}
     */
    getEmotionInputById(){
        var emotionInput="";
        var emotionInputArray = $("textarea[id='emotionInput']");
        if(isEmpty(emotionInputArray)==false){
            for(var i=0;i<emotionInputArray.length;i++){
                var emotionObj = emotionInputArray[i];
                if(isEmpty(emotionObj.value)==false){
                    emotionInput = emotionObj.value;
                    break;
                }
            }
        }
        return emotionInput;
    },

    /**
     * 发表说说或话题
     */
    addTopicModalHandleOk(){
        //获取富文本框中包含表情的评论内容
        var inputContent;
        var emotionInput = antNest.getEmotionInput();
        if(isEmpty($("#emotionInput").val())==false){
            inputContent = $("#emotionInput").val();
        }else{
            inputContent = emotionInput;
        }
        if(antNest.state.topicModalType=="topic"){
            if(isEmpty(antNest.state.topicTitle)){
                message.error("话题的标题不允许为空，请重新输入。",5);
                return;
            }
        }
        if(isEmpty(inputContent)){
            message.error("内容不允许为空,请重新输入",5);
            return;
        }else{
            inputContent = inputContent.replace(/\'/g, "\\'");  //' 替换成  \'
            inputContent = inputContent.replace(/\"/g, "\\\""); //" 替换成\"
            inputContent = inputContent.replace(/</g, "\\\<"); //< 替换成\<
            inputContent = inputContent.replace(/>/g,"\\\>"); //> 替换成\>
        }
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
            var title = antNest.state.topicTitle;
            title = title.replace(/\'/g, "\\'");  //' 替换成  \'
            title = title.replace(/\"/g, "\\\""); //" 替换成\"
            title = title.replace(/</g, "\\\<"); //< 替换成\<
            title = title.replace(/>/g,"\\\>"); //> 替换成\>
            topicJson.title=title;
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
                if (antNest.state.type==0) {
                    antNest.getTopics(antNest.state.currentPage, getAllTopic());
                } else {
                    antNest.getTopics(antNest.state.currentTeacherPage, getOnlyTeacherTopic());
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
        antNest.removeImgViewStyle();
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
     * 移除图片上传组件的pointerEvents样式属性
     * 原值为none时，会导致无法点击预览
     */
    removeImgViewStyle(){
        var imgViewObjArray = $("a[rel='noopener noreferrer']");
        for(var i=0;i<imgViewObjArray.length;i++){
            var imgViewObj = imgViewObjArray[i];
            imgViewObj.style.pointerEvents="";
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
        antNest.initMyEmotionInput();
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
    },

    /**
     * 显示立即参与话题的窗口
     * @param e
     */
    showPartakeModal(e){
        var target = e.target;
        if(navigator.userAgent.indexOf("Chrome") > -1){
            target=e.currentTarget;
        }else{
            target = e.target;
        }
        var topicId = target.value;
        antNest.setState({"partakeModalVisible":true,"partakeTopicId":topicId});
    },

    /**
     * 立即参与窗口的确定响应函数
     */
    partakeModalHandleOk(){
        //获取富文本框中包含表情的评论内容
        var inputContent;
        var emotionInput = antNest.getEmotionInput();
        if(isEmpty($("#emotionInput").val())==false){
            inputContent = $("#emotionInput").val();
        }else{
            inputContent = emotionInput;
        }
        if(isEmpty(inputContent)==false){
            inputContent = inputContent.replace(/\'/g, "\\'");  //' 替换成  \'
            inputContent = inputContent.replace(/\"/g, "\\\""); //" 替换成\"
            inputContent = inputContent.replace(/</g, "\\\<"); //< 替换成\<
            inputContent = inputContent.replace(/>/g,"\\\>"); //> 替换成\>
        }
        var createTime = (new Date()).valueOf();
        var uuid = antNest.createUUID();
        var topicImageArray = antNest.state.topicImgUrl;
        var attachMents=[];
        for(var i=0;i<topicImageArray.length;i++){
            var attach = {"type":1,"address":topicImageArray[i],"createTime":createTime,"user":JSON.parse(sessionStorage.getItem("loginUser"))};
            attachMents.push(attach);
        }
        var parentTopic = antNest.findTopicObjFromArrayById(antNest.state.partakeTopicId);
        var topicJson={
            "content":inputContent,
            "fromUserId":sessionStorage.getItem("ident"),
            "fromUser":JSON.parse(sessionStorage.getItem("loginUser")),
            "valid":0,
            "type":1,
            "uuid":uuid,
            "attachMents":attachMents,
            "comments":[],
            "open":0,
            "parent":parentTopic
        };
        var param = {
            "method": 'addTopic',
            "topicJson": topicJson,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if(ret.success==true && ret.response == true){
                    message.success("话题参与成功");
                }else{
                    message.error("话题参与失败");
                }
                if(antNest.state.optType=="getTopicById"){
                    //如果是在单个话题的页面中完成点赞或取消点赞，则停留在当前页面
                    antNest.reGetTopicInfo(antNest.state.currentShowPage,getAllTopic());
                    antNest.getTopicPartakeById(antNest.state.currentTopicId,antNest.state.currentShowPage);
                }else {
                    if (antNest.state.type == 0) {
                        antNest.getTopics(antNest.state.currentPage, getAllTopic());
                    } else {
                        antNest.getTopics(antNest.state.currentTeacherPage, getOnlyTeacherTopic());
                    }
                }
                antNest.initMyEmotionInput();
                antNest.setState({partakeModalVisible: false});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 立即参与窗口的取消响应函数
     */
    partakeModalHandleCancel(){
        antNest.setState({"partakeModalVisible":false});
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        var breadMenuTip="查看全部";
        if(antNest.state.type==0){
            breadMenuTip="查看全部";
        }else{
            breadMenuTip="只看老师";
        }
        var optionButton;
        var topicList;
        if(antNest.state.optType=="getTopicById"){
            optionButton = <div className="public—til—blue">
                <div className="ant-tabs-right talk_ant_btn1">
                    <Button onClick={antNest.returnTopicList}><Icon type="left" /></Button>
                </div>话题详情</div>;
        }else{
            optionButton = <div className="public—til—blue">
                    <div className="ant-tabs-right talk_ant_btn1">
                        <Button value="talk" onClick={antNest.showaddTopicModal} className="antnest_talk">发表说说</Button>
                        <Button value="topic" onClick={antNest.showaddTopicModal}>发表话题</Button>
                    </div>
                    {breadMenuTip}
                </div>;
        }
        topicList =
            <div className="topics_rela">
                <div className="antnest_cont topics_calc" style={{overflow:'scroll'}}>
                    {antNest.state.topicCardList}
                </div>
                <Pagination key="all" total={antNest.state.totalCount} pageSize={getPageSize()} current={antNest.state.currentShowPage}
                            onChange={antNest.pageOnChange}/>
            </div>
        var topicTitle;
        if(antNest.state.topicModalType=="topic"){
            topicTitle = <Row className="yinyong_topic">
                <Col span={3} className="right_look">标题：</Col>
                <Col span={20}><Input onChange={antNest.topicTitleChange} defaultValue={antNest.state.topicTitle} value={antNest.state.topicTitle} /></Col>
            </Row>;
        }
        return (
            <div>
                <Modal title="评论"
                       visible={antNest.state.discussModalVisible}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       onOk={antNest.discussModalHandleOk}
                       onCancel={antNest.discussModalHandleCancel}
                >
                    <div>
                        <Row>
                            <Col span={3} className="right_look">内容：</Col>
                            <Col span={20}><EmotionInputComponents className="topics_ral"></EmotionInputComponents></Col>
                        </Row>
                    </div>
                </Modal>
                <Modal title="发布说说"
                       visible={antNest.state.addTopicModalVisible}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       onOk={antNest.addTopicModalHandleOk}
                       onCancel={antNest.addTopicModalHandleCancel}
                >
                    <div>
                        {topicTitle}
                        <Row>
                            <Col span={3} className="right_look">内容：</Col>
                            <Col span={20}><EmotionInputComponents></EmotionInputComponents></Col>
                        </Row>
                        <Row className="yinyong3">
                            <Col span={3} className="right_look">附件：</Col>
                            <Col span={20}><UploadImgComponents fileList={antNest.state.topicImgUrl} callBackParent={antNest.getUploadedImgList}></UploadImgComponents></Col>
                        </Row>
                    </div>

                </Modal>
                <Modal title="立即参与"
                       visible={antNest.state.partakeModalVisible}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       onOk={antNest.partakeModalHandleOk}
                       onCancel={antNest.partakeModalHandleCancel}
                >
                    <div>
                        <Row>
                            <Col span={3}>内容：</Col>
                            <Col span={20}><EmotionInputComponents className="topics_ral"></EmotionInputComponents></Col>
                        </Row>
                        <Row className="yinyong3">
                            <Col span={3}>附件：</Col>
                            <Col span={20}><UploadImgComponents callBackParent={antNest.getUploadedImgList}></UploadImgComponents></Col>
                        </Row>
                    </div>

                </Modal>
                <ConfirmModal ref="confirmModal"
                              title="确定要删除该条记录?"
                              onConfirmModalCancel={antNest.closeDeleteTopicModal}
                              onConfirmModalOK={antNest.deleteTopic}
                ></ConfirmModal>

                <ConfirmModal ref="deleteTopicCommentModal"
                              title="确定要删除该条评论?"
                              onConfirmModalCancel={antNest.closeDeleteTopicCommentModal}
                              onConfirmModalOK={antNest.deleteTopicComment}
                ></ConfirmModal>

                <ConfirmModal ref="setTopicTopModal"
                              title="确定要将该条记录置顶?"
                              onConfirmModalCancel={antNest.closeSetTopicTopModal}
                              onConfirmModalOK={antNest.setTopicToTop}
                ></ConfirmModal>
                <div className="talk_ant_btn">
                    {/*<Breadcrumb separator=">">
                        <Breadcrumb.Item><Icon type="home" /></Breadcrumb.Item>
                        <Breadcrumb.Item href="#/MainLayout">首页</Breadcrumb.Item>
                        <Breadcrumb.Item href="#/MainLayout">蚁巢</Breadcrumb.Item>
                        <Breadcrumb.Item href="#/MainLayout">{breadMenuTip}</Breadcrumb.Item>
                    </Breadcrumb>*/}

                    {optionButton}
                </div>
                {topicList}
            </div>
        );
    },
});

export default AntNestTabComponents;
