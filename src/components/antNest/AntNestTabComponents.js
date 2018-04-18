import React, {PropTypes} from 'react';
import {Icon, Card, Button, Row, Col, message, Modal, Input, Spin, Select, Radio, Checkbox, DatePicker} from 'antd';
import {doWebService} from '../../WebServiceHelper';
import {getLocalTime} from '../../utils/Const';
import {isEmpty, SMALL_IMG, MIDDLE_IMG, LARGE_IMG} from '../../utils/Const';
import {getAllTopic} from '../../utils/Const';
import {getOnlyTeacherTopic} from '../../utils/Const';
import {showLargeImg} from '../../utils/utils';
import UploadImgComponents from './UploadImgComponents';
import EmotionInputComponents from './EmotionInputComponents';
import ConfirmModal from '../ConfirmModal';
import moment from 'moment';

var topicCardArray = [];
var antNest;
var topicObjArray = [];
var topicArr = [];
var classCanSeeObj = [];
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const {RangePicker} = DatePicker;
const dateFullFormat = 'YYYY-MM-DD HH:mm:ss';
//假数据
const children = [];
for (let i = 10; i < 36; i++) {
    children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
}


const AntNestTabComponents = React.createClass({

    getInitialState() {
        antNest = this;
        return {
            topicCardList: [],   //存放获取的话题Card对象
            totalCount: 0,       //分页时，返回的总数据量
            currentPage: 1,      //在查看全部页面时的当前页码
            currentTeacherPage: 1,       //在只看老师页面时的当前页码
            //最终页面上显示的分页器上显示的页码值（该值由type来决定，type==0时取currentPage,否则取currentTeacherPage值）
            currentShowPage: 1,
            optType: 'getAllTopic',      //操作类型，用来区分用户的动作是查看话题列表页面，还是查看单个话题
            currentTopicId: '',          //当前操作的话题id，评论时时都会用到
            discussModalVisible: false,  //评论的Modal窗口状态控制
            topicImgUrl: [],     //说说/话题上传的图片路径,
            topicModalType: 'talk',  //控制话题和说说Modal的显示，用来存储用户的动作
            topicTitle: '',      //话题的标题
            toUserId: -1, //评论指定人或直接评论,评论指定人时,值为真实id，否则为-1
            replayToUserTopicId: '',     //被回复的话题id
            partakeTopicId: '',       //话题参与时,当前要参与的话题id
            confirmModalVisible: true,   //删除操作的确认Modal状态控制
            topicCommentId: '',  //话题评论时的目标id
            type: 0,     //操作类型（0：查看全部  1：只看老师）
            page: 1,
            antNestScoll: 0,
            classChildren: [],
            radioValue: 1,    //公开还是可见  1公开2可见
            boxDisplay: 'none',
            radioDisplay: 'block',
            classSrcChecked: [],  //checkbox可见班级的名字,checkbox的value值,
            homeWorkTime: '',
            whoISSecretModalVisible: false,
            whiteUserList: [],
            whiteUserListObj: [],
            whiteUserListNum: 0
        };
    },

    componentDidMount() {
        var initPageNo = 1;
        var initType = 0;
        antNest.getTopics(initPageNo, initType, true);
        if (JSON.parse(sessionStorage.getItem("loginUser")).colAccount.substr(0, 2) == 'ST') {
            this.setState({homeWorkPublish: 'none'})
        } else {
            this.setState({homeWorkPublish: 'inline-block'})
        }
    },

    componentDidUpdate() {
        var a = $('.antNestScoll');
        var antNestScoll = this.state.antNestScoll;
        a.scrollTop(antNestScoll);
    },

    /**
     * 公开不公开的切换
     * @param e
     */
    radioOnChange(e) {
        if (e.target.value == 2) {
            this.setState({boxDisplay: 'block'})
        } else {
            this.setState({boxDisplay: 'none', classSrcChecked: []})
        }
        this.setState({
            radioValue: e.target.value,
        });
    },

    /**
     * 可见班级的选择
     * @param checkedValues
     */
    checkboxOnChange(checkedValues) {
        this.setState({"classSrcChecked": checkedValues});
    },

    /**
     * 获取话题列表
     * @param type 0:全部  1：只看老师
     * @param pageNo
     */
    getTopics(pageNo, type, flag, fromTap) {
        if (isEmpty(pageNo)) {
            if (type == 0) {
                pageNo = antNest.state.currentPage;
            } else {
                pageNo = antNest.state.currentTeacherPage;
            }
        }
        ;
        if (flag) {
            topicCardArray.splice(0);
            topicObjArray.splice(0);
            topicArr.splice(0);
            if (type == 0) {
                pageNo = 1;
            } else {
                pageNo = 1;
            }
        }
        ;
        if (fromTap) {
            antNest.setState({currentPage: 1, currentTeacherPage: 1})
        }
        ;
        var param = {
            "method": 'getTopicsByType',
            "ident": sessionStorage.getItem("ident"),
            "type": type,
            "pageNo": pageNo
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var response = ret.response;
                response.forEach(function (e) {
                    topicObjArray.push(e);
                    topicArr.push(e);
                    antNest.buildTopicCard(e, 0);
                });
                var pager = ret.pager;
                antNest.setState({
                    "topicCardList": topicCardArray,
                    "totalCount": pager.rsCount,
                    "currentShowPage": pageNo,
                    type: type
                });
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
    showpanle(obj) {
        LP.Start(obj);
    },

    /**
     * 语音作业播放暂停
     * @param e
     */
    topicVoicePlay(e) {
        var music = e.target.children[0];
        var music_btn = e.target;
        if (music.paused) {
            music.play();
            music_btn.className = 'audio_left_run';
        }
        else {
            music.pause();
            music_btn.className = 'audio_left';
        }
    },

    whoISSecret(data, UserData) {
        var arr = [];
        if (isEmpty(data) == false) {
            data.forEach(function (v) {
                var li = <li>{v.grade.name + ' ' + v.name}</li>
                arr.push(li);

            });
        }
        if (isEmpty(UserData) == false) {
            UserData.forEach(function (v) {
                var li = <li>{v.userName}</li>
                arr.push(li);
            });
        }
        this.setState({whoISSecretModalVisible: true, whoISSecretLis: arr});
    },

    whoISSecretModalHandleCancel() {
        this.setState({whoISSecretModalVisible: false});
    },

    /**
     * 跟读内容
     * @param e
     */
    readContentsModel(e) {
        //侧边栏进场,根据voiceTopicResultType区分文字,语音,图片进行展示
        var obj = {
            title: '比对内容'
        };
        if (e.topicVoice.voiceTopicResultType == 1) {
            //字符串  voiceTopicResult
            obj.div = <div className="side_topicText">{e.topicVoice.voiceTopicResult}</div>;
        } else if (e.topicVoice.voiceTopicResultType == 2) {
            //图片  voiceTopicResultUrl
            obj.div = <div className="side_topicVoice"><img className="noDataTipImg topics_zanImg noom_cursor"
                                                            onClick={showLargeImg}
                                                            alt={e.topicVoice.voiceTopicResultUrl}
                                                            src={e.topicVoice.voiceTopicResultUrl + '?' + MIDDLE_IMG}/>
            </div>
        } else if (e.topicVoice.voiceTopicResultType == 3) {
            //语音  voiceTopicResultUrl
        }
        this.props.interPublicSidebarSet(obj);
    },

    /**
     * 构建话题的card对象
     * @param topicObj 话题对象
     * @param useType 用途 0:列表  1：单个话题
     */
    buildTopicCard(topicObj, useType, topicReplayInfoArray, parTakeCountInfo, homeWorkFlag) {
        var screatPic = '';

        var whiteList,
            whiteUserList;
        if (isEmpty(topicObj.whiteList) == false) {
            whiteList = topicObj.whiteList;
        }
        if (isEmpty(topicObj.whiteUserList) == false) {
            whiteUserList = topicObj.whiteUserList;
        }

        if (topicObj.fromUserId == sessionStorage.getItem("ident") && topicObj.applyWhiteList == true) {
            screatPic =
                <span onClick={this.whoISSecret.bind(this, whiteList, whiteUserList)}
                      className="topics_time noom_cursor"><img
                    src={require('../images/screatPic.png')} alt="" className="screatPic"/></span>
        }
        //如果用户头像为空，使用系统默认头像
        var commentDisplayTime = '';
        if (topicObj.type == 11 || topicObj.type == 3) {
            commentDisplayTime =
                <span className="topics_time">(结束时间:{getLocalTime(topicObj.commentDisplayTime)})</span>;
        }
        var userHeadPhoto;
        if (isEmpty(topicObj.fromUser.avatar)) {
            //如果用户头像为空，则使用系统默认头像进行显示
            userHeadPhoto = <img src={require('../images/maaee_face.png')}/>;
        } else {
            userHeadPhoto = <img src={topicObj.fromUser.avatar + '?' + SMALL_IMG}/>;
        }
        //转换系统时间戳为本地日期格式
        var createTime = getLocalTime(topicObj.createTime);
        //话题标题，如果为空，则不显示
        var topicTitle;
        //话题标题不为空，且是在全部话题列表中的时候、处于有效状态，类型为话题，而非说说时才需要显示话题标题
        if (isEmpty(topicObj.title) == false && useType == 0 && topicObj.valid == 0 && topicObj.type == 1) {
            topicTitle = <a value={topicObj.id} title={topicObj.id} onClick={antNest.getTopicPartakeInfo}
                            className="topics">#{topicObj.title}#</a>
        }
        //增加type=3语音作业类型
        if (isEmpty(topicObj.title) == false && useType == 0 && topicObj.valid == 0 && (topicObj.type == 11 || topicObj.type == 3)) {
            topicTitle = <a value={topicObj.id} title={topicObj.id} id={topicObj.commentDisplayTime}
                            onClick={antNest.getHomeWorkPartakeInfo}
                            className="topics">#{topicObj.title}#</a>
        }
        //点赞用户span标记数组
        var likeUsersArray = [];
        var likeUsersInfoArray = [];
        //评论用户数组
        var answerUsersArray = [];
        //附件数组（其中包括图片附件和mp4附件）
        var attachMentsArray = [];
        //遍历点赞和回复的信息
        //如果当前用户未点赞，则使用空心按钮表示，按钮点击功能表示“取消点赞”
        var praiseButton = <Button className="topics_btn antnest_talk teopics_spa " icon="like-o" value={topicObj.id}
                                   onClick={antNest.praiseForTopic}>点赞</Button>;
        topicObj.comments.forEach(function (e) {
            if (e.type == 1) {
                //点赞
                var likeUserInfo = <span className="yichao_blue" style={{marginRight: '10px'}}>{e.user.userName}</span>;
                likeUsersArray.push(likeUserInfo);
                likeUsersInfoArray.push(e.user);
            } else {
                //评论
                var replayUserTitle;
                if (isEmpty(e.toUser) == false && (e.user.colUid != e.toUser.colUid)) {
                    replayUserTitle = <span>{e.user.userName} 回复 {e.toUser.userName}：</span>;
                } else {
                    replayUserTitle = <span>{e.user.userName}：</span>;
                }
                var delBtn;
                if (e.user.colUtype == "STUD" || (e.user.colUtype == "TEAC" && e.user.colUid == sessionStorage.getItem("ident"))) {
                    delBtn = <Button value={e.id + "#" + topicObj.id}
                                     className="topics_btn topics_a topics_a—bnt teopics_spa topics_le"
                                     type="dashed" onClick={antNest.showDeleteTopicCommentModal}>删除</Button>;
                }
                var answerUserInfo = <li className="topics_comment">
                    <span className="yichao_blue">{replayUserTitle}</span>
                    <span className="font-14">{e.content}</span>
                    <span className="topics_reply">
                        {delBtn}
                        <span className="topics_r-line"></span>
                        <Button value={topicObj.id + "#" + e.user.colUid} type="dashed"
                                className="topics_btn topics_a topics_a—bnt teopics_spa"
                                onClick={antNest.showDiscussModal}>回复</Button>
                    </span>
                </li>;
                answerUsersArray.push(answerUserInfo);
            }
        })
        //话题列表中的点赞按钮
        for (var i = 0; i < likeUsersInfoArray.length; i++) {
            var likeUser = likeUsersInfoArray[i];
            if (parseInt(sessionStorage.getItem("ident")) == likeUser.colUid) {
                //如果当前用户已点赞，则使用实心按钮表示.按钮点击功能表示“点赞”
                praiseButton = <Button icon="like" value={topicObj.id} onClick={antNest.cancelPraiseForTopic}
                                       className="topics_btn teopics_spa antnest_talk topics_oranges">点赞</Button>;
                break;
            } else {
                praiseButton = <Button icon="like-o" value={topicObj.id} onClick={antNest.praiseForTopic}
                                       className="topics_btn antnest_talk teopics_spa">点赞</Button>;
            }
        }
        //遍历附件信息，并按类型封装数据
        topicObj.attachMents.forEach(function (e) {
            var attachMents;
            var attachMentType = e.type;
            if (attachMentType == 1) {
                //图片附件
                attachMents = <span className="topics_zan">
                    <img className="topics_zanImg" src={e.address + '?' + MIDDLE_IMG} alt={e.address}
                         onClick={showLargeImg}/>
                    {/*<img className="topics_zanImg" src={e.address} alt={e.address}*/}
                    {/*onClick={showLargeImg}/>*/}
                </span>;

            } else if (attachMentType == 4) {
                //mp4附件
                attachMents = <div className="toppics_ul_bg share_cont">
								<span onClick={event => {
                                    antNest.view(event, e.address, e.content)
                                }} className="share_img share_le">
									<img src={e.cover}/>
								</span>
                    <span onClick={event => {
                        antNest.view(event, e.address, e.content)
                    }} className="share_font">
									{e.content}
								</span>
                </div>
            }
            attachMentsArray.push(attachMents);
        })
        //话题回复信息显示的card
        var replayCard = "";
        //如果点赞和回复信息都存在，则在card的title部分显示点赞，content部分显示回复
        //否则只需要在内容区域显示即可
        if (likeUsersArray.length != 0 && answerUsersArray.length != 0) {
            replayCard = <div>
                <ul className="toppics_ul_bg topics_bor_bot">
                    <span><Button icon="like" className="topics_btn yichao_blue"></Button> {likeUsersArray}</span>
                </ul>
                <ul className="toppics_ul_bg">
                    {answerUsersArray}
                </ul>
            </div>;
        } else if (likeUsersArray.length != 0 && answerUsersArray.length == 0) {
            replayCard = <div>
                <ul className="toppics_ul_bg topics_bor_bot">
                    <span><Button icon="like" className="topics_btn"></Button> {likeUsersArray}</span>
                </ul>
            </div>;
        } else if (likeUsersArray.length == 0 && answerUsersArray.length != 0) {
            replayCard = <div>
                <ul className="toppics_ul_bg">
                    {answerUsersArray}
                </ul>
            </div>;
        }
        //删除按钮，在单个话题查看页面，不需要显示删除按钮
        var delButton;
        if (useType == 0) {
            //STUD
            if (topicObj.fromUser.colUtype == "STUD" || (topicObj.fromUser.colUtype == "TEAC" && topicObj.fromUser.colUid == sessionStorage.getItem("ident"))) {
                delButton = <Button value={topicObj.id} icon="delete" className="ant-btn topics_btn teopics_spa"
                                    onClick={antNest.showDeleteTopicModal}>删除</Button>;
            }
        }
        //参与人数显示card

        var parTakeCountCard;
        if (isEmpty(parTakeCountInfo) == false) {
            if (homeWorkFlag) {
                if (topicObj.type == 3) {
                    //语音跟读作业
                    parTakeCountCard = <div className="upexam_top topics_blue_bg">
                        <ul className="topics_mar60">
                    <span
                        className="topics_time">作答{parTakeCountInfo.participatecount}人，未作答{parTakeCountInfo.unParticipatecount}人</span>
                            <span style={{display: antNest.state.zuodaTime}}><Button value={topicObj.id}
                                                                                     onClick={() => message.warning('此为语音朗读作业，请使用客户端作答哦！')}
                                                                                     className="antnest_talk">立即作答</Button>
                            </span>
                            <Button value={topicObj.id}
                                    onClick={antNest.readContentsModel.bind(this, topicObj)}>比对内容</Button>
                        </ul>
                    </div>;
                } else {
                    parTakeCountCard = <div className="upexam_top topics_blue_bg">
                        <ul className="topics_mar60">
                    <span
                        className="topics_time">作答{parTakeCountInfo.participatecount}人，未作答{parTakeCountInfo.unParticipatecount}人</span>
                            <span style={{display: antNest.state.zuodaTime}}><Button value={topicObj.id}
                                                                                     onClick={antNest.showPartakeModal}>立即作答</Button></span>
                        </ul>
                    </div>;
                }
            } else {
                parTakeCountCard = <div className="upexam_top topics_blue_bg">
                    <ul className="topics_mar60">
                    <span
                        className="topics_time">参与{parTakeCountInfo.participatecount}人，未参与{parTakeCountInfo.unParticipatecount}人</span>
                        <span><Button value={topicObj.id} onClick={antNest.showPartakeModal}>立即参与</Button></span>
                    </ul>
                </div>;
            }
        }
        //单个话题中的回复参与信息
        var topicReplayCardArray = [];
        if (isEmpty(topicReplayInfoArray) == false && topicReplayInfoArray.length != 0 && useType == 1) {
            topicReplayInfoArray.forEach(function (topicReplayInfo) {
                var replayUserHeadPhoto;
                if (isEmpty(topicReplayInfo.fromUser.colPhotoPath)) {
                    replayUserHeadPhoto = <img src={require('../images/maaee_pic.png')}/>;
                } else {
                    replayUserHeadPhoto = <img src={topicReplayInfo.fromUser.colPhotoPath}/>;
                }
                var replayLikeUsersArray = [];
                var replayLikeUsersInfoArray = [];
                var replayAnswerUsersArray = [];
                topicReplayInfo.comments.forEach(function (e) {
                    if (e.type == 1) {
                        //点赞
                        var likeUserInfo = <span className="yichao_blue"
                                                 style={{marginRight: '10px'}}>{e.user.userName}</span>;
                        replayLikeUsersArray.push(likeUserInfo);
                        replayLikeUsersInfoArray.push(e.user);
                    } else {
                        //评论
                        var replayUserTitle;
                        if (isEmpty(e.toUser) == false && (e.user.colUid != e.toUser.colUid)) {
                            replayUserTitle = <span>{e.user.userName} 回复 {e.toUser.userName}：</span>;
                        } else {
                            replayUserTitle = <span>{e.user.userName}：</span>;
                        }
                        var delBtnInRelpay;
                        if (e.user.colUtype == "STUD" || (e.user.colUtype == "TEAC" && e.user.colUid == sessionStorage.getItem("ident"))) {
                            delBtnInRelpay = <Button value={e.id} type="dashed"
                                                     className="topics_btn topics_a topics_a—bnt teopics_spa topics_le"
                                                     onClick={antNest.deleteTopicComment.bind(this, e.id)}>删除</Button>;
                        }
                        var answerUserInfo = <li className="topics_comment">
                            {replayUserTitle}
                            <span>{e.content}</span>
                            <span className="topics_reply">
                                {delBtnInRelpay}
                                <span className="topics_r-line"></span>
                                <Button value={topicReplayInfo.id + "#" + e.user.colUid} type="dashed"
                                        className="topics_btn topics_a topics_a—bnt teopics_spa"
                                        onClick={antNest.showDiscussModal}>回复</Button>
                            </span>
                        </li>;
                        replayAnswerUsersArray.push(answerUserInfo);
                    }
                });
                //如果当前用户未点赞，则使用空心按钮表示，按钮点击功能表示“取消点赞”
                var replayPraiseButton = <Button icon="like-o" value={topicReplayInfo.id + "#" + topicObj.id}
                                                 onClick={antNest.praiseForTopic}
                                                 className="topics_btn antnest_talk teopics_spa ">点赞</Button>;
                //话题列表中的点赞按钮
                for (var i = 0; i < replayLikeUsersInfoArray.length; i++) {
                    var likeUser = replayLikeUsersInfoArray[i];
                    if (parseInt(sessionStorage.getItem("ident")) == likeUser.colUid) {
                        //如果当前用户已点赞，则使用实心按钮表示.按钮点击功能表示“点赞”
                        replayPraiseButton = <Button icon="like" value={topicReplayInfo.id + "#" + topicObj.id}
                                                     onClick={antNest.cancelPraiseForTopic}
                                                     className="topics_btn antnest_talk teopics_spa topics_oranges">点赞</Button>;
                        break;
                    } else {
                        replayPraiseButton = <Button icon="like-o" value={topicReplayInfo.id + "#" + topicObj.id}
                                                     onClick={antNest.praiseForTopic}
                                                     className="topics_btn antnest_talk teopics_spa ">点赞</Button>;
                    }
                }

                //如果点赞和回复信息都存在，则在card的title部分显示点赞，content部分显示回复
                //否则只需要在内容区域显示即可
                var replayCardForSingle;
                if (replayLikeUsersArray.length != 0 && replayAnswerUsersArray.length != 0) {
                    replayCardForSingle = <div>
                        <ul className="toppics_ul_bg topics_bor_bot topics_mar60">
                            <span><Button icon="like" className="topics_btn"></Button> {replayLikeUsersArray}</span>
                        </ul>
                        <ul className="toppics_ul_bg topics_mar60">
                            {replayAnswerUsersArray}
                        </ul>
                    </div>;
                } else if (replayLikeUsersArray.length != 0 && replayAnswerUsersArray.length == 0) {
                    replayCardForSingle = <div>
                        <span><Button icon="like" className="topics_btn"></Button> {replayLikeUsersArray}</span>
                    </div>;
                } else if (replayLikeUsersArray.length == 0 && replayAnswerUsersArray.length != 0) {
                    replayCardForSingle = <div>
                        <ul className="toppics_ul_bg topics_mar60">
                            {replayAnswerUsersArray}
                        </ul>
                    </div>;
                }

                var replayAttachMentsArray = []
                //遍历附件信息，并按类型封装数据
                topicReplayInfo.attachMents.forEach(function (e) {
                    var attachMents;
                    var attachMentType = e.type;
                    if (attachMentType == 1) {
                        //图片附件
                        attachMents =
                            <span className="topics_zan"><img src={e.address + '?' + MIDDLE_IMG} alt={e.address}
                                                              onClick={showLargeImg}/></span>;
                    } else if (attachMentType == 4) {
                        //mp4附件
                        attachMents = <span className="antnest_user">
                            <span onClick={event => {
                                antNest.view(event, e.address, e.content)
                            }}>
                                <img src={e.cover}/><span>{e.content}</span>
                            </span>
                        </span>;
                    }
                    replayAttachMentsArray.push(attachMents);
                })
                var delBtnInReplayCard;
                if (topicReplayInfo.fromUser.colUtype == "STUD" || (topicReplayInfo.fromUser.colUtype == "TEAC" && topicReplayInfo.fromUser.colUid == sessionStorage.getItem("ident"))) {
                    delBtnInReplayCard = <Button value={topicReplayInfo.id} icon="delete"
                                                 onClick={antNest.deleteTopic.bind(antNest, topicReplayInfo.id)}
                                                 className="topics_btn  teopics_spa antnest_talk">删除</Button>;
                }
                var praiseBtn;
                if (topicObj.fromUser.colUtype == "TEAC" && topicObj.fromUser.colUid == sessionStorage.getItem("ident")) {
                    praiseBtn = <Button value={topicObj.id + "#" + topicReplayInfo.id} icon="to-top"
                                        onClick={antNest.showSetTopicTopModal}
                                        className="topics_btn antnest_talk teopics_spa">置顶</Button>;
                }
                if (topicReplayInfo.type == 3 && isEmpty(topicReplayInfo.topicVoice) == false) {
                    //topicReplayInfo.type == 3为新加的语音作业的回复,content为空将不再展示,只展示topicVoice中的语音和评分
                    var topicReplayCard = <div className="antnest_line">
                        <div style={{marginLeft: '0'}} className="antnest_user">{replayUserHeadPhoto}</div>
                        <ul>
                            <li className="antnest_name yichao_blue">{topicReplayInfo.fromUser.userName}</li>
                            <li className="date_tr">
                                <div className="audio_play_ant">
                                    <div className="audio_left" onClick={antNest.topicVoicePlay}>
                                        <audio src={topicReplayInfo.topicVoice.voiceTopicResultUrl}
                                               controls="controls"
                                               loop="false"
                                               hidden="true"></audio>
                                    </div>
                                </div>
                                <span className="audio_play_ant1"><span className="audio_play_antred1">评分：</span><span
                                    className="audio_play_antred">{topicReplayInfo.topicVoice.voiceAccuracy}</span></span>
                            </li>
                            <li>{replayAttachMentsArray}</li>
                            <li className="topics_bot"><span
                                className="topics_time">{getLocalTime(topicReplayInfo.createTime)}</span><span
                                className="topics_dianzan">
                        {delBtnInReplayCard}
                                {praiseBtn}
                                {replayPraiseButton}
                                <Button icon="message" value={topicReplayInfo.id + "#toUser"}
                                        onClick={antNest.showDiscussModal}
                                        className="topics_btn teopics_spa">评论</Button></span></li>
                        </ul>
                        <ul>
                            {replayCardForSingle}
                        </ul>
                    </div>;
                } else {
                    var topicReplayCard = <div className="antnest_line">
                        <div style={{marginLeft: '0'}} className="antnest_user">{replayUserHeadPhoto}</div>
                        <ul>
                            <li className="antnest_name yichao_blue">{topicReplayInfo.fromUser.userName}</li>
                            <li>  {topicReplayInfo.content}</li>
                            <li>{replayAttachMentsArray}</li>
                            <li className="topics_bot"><span
                                className="topics_time">{getLocalTime(topicReplayInfo.createTime)}</span><span
                                className="topics_dianzan">
                        {delBtnInReplayCard}
                                {praiseBtn}
                                {replayPraiseButton}
                                <Button icon="message" value={topicReplayInfo.id + "#toUser"}
                                        onClick={antNest.showDiscussModal}
                                        className="topics_btn teopics_spa">评论</Button></span></li>
                        </ul>
                        <ul>
                            {replayCardForSingle}
                        </ul>
                    </div>;
                }
                topicReplayCardArray.push(topicReplayCard);
            });
        }

        var cardObj = <Card className="antnest-card" bordered={false}>
            <div className="antnest_user">{userHeadPhoto}</div>
            <ul>
                <li>
                    <span className="antnest_name yichao_blue">{topicObj.fromUser.userName}</span>
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
                    {commentDisplayTime}
                    {screatPic}
                    <span>{delButton}</span>
                    <span className="topics_dianzan">
                         {praiseButton}
                        <Button icon="message" value={topicObj.id} onClick={antNest.showDiscussModal}
                                className="topics_btn antnest_talk teopics_spa">评论</Button>
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
        if (antNest.state.type == 0) {
            antNest.setState({
                currentPage: page,
            });
            antNest.getTopics(page, getAllTopic());
        } else {
            antNest.setState({
                currentTeacherPage: page,
            });
            antNest.getTopics(page, getOnlyTeacherTopic());
        }
    },
    /**
     * 话题列表加载更多的回调
     */
    pageAdd() {
        var page = this.state.currentPage;
        var pageOnlyTeacher = this.state.currentTeacherPage;
        page++;
        pageOnlyTeacher++;
        //调用获取话题的函数，把信息push到topicCardList中
        //如果page超过最大值点击提示
        this.setState({page});
        if (antNest.state.type == 0) {
            antNest.setState({
                currentPage: page,
            });
            antNest.getTopics(page, getAllTopic());
        } else {
            antNest.setState({
                currentTeacherPage: pageOnlyTeacher,
            });
            antNest.getTopics(pageOnlyTeacher, getOnlyTeacherTopic());
        }
    },

    /**
     * 根据作业的id，获取对应的话题详细信息(貌似是地下的评论)
     */
    getZuoYeInfoById(topicId, parTakeCountInfo, pageNo) {
        var topicReplayInfoArray = [];
        var param = {
            "method": 'getTopicsByZuoYeId',
            "accessUserId": sessionStorage.getItem("ident"),
            "zyId": topicId,
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
                antNest.buildTopicCard(topicObj, 1, topicReplayInfoArray, parTakeCountInfo, true);
                antNest.setState({
                    // "optType": 'getTopicById',
                    "topicCardList": topicCardArray,
                    "totalCount": pager.rsCount,
                    "currentTopicId": topicId
                });
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 根据话题的id，获取对应的话题详细信息
     * @param topicId 话题id
     * @param parTakeCountInfo 话题参与人数信息
     * @param pageNo 分页页码
     */
    getTopicInfoById(topicId, parTakeCountInfo, pageNo) {
        var topicReplayInfoArray = [];
        var param = {
            "method": 'getTopicsByHuatiId',
            "huatiId": topicId + "",
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
                antNest.buildTopicCard(topicObj, 1, topicReplayInfoArray, parTakeCountInfo, false);
                antNest.setState({
                    // "optType": 'getTopicById',
                    "topicCardList": topicCardArray,
                    "totalCount": pager.rsCount,
                    "currentTopicId": topicId
                });
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
    findTopicObjFromArrayById(topicId) {
        var topicObj;
        for (var i = 0; i < topicObjArray.length; i++) {
            var obj = topicObjArray[i];
            if (obj.id == parseInt(topicId)) {
                topicObj = obj;
                break;
            }
        }
        return topicObj;
    },
    /**
     * 从单个话题的页面，返回到话题列表上
     */
    returnTopicList() {
        // if (antNest.state.type == 0) {
        //     antNest.getTopics(antNest.state.currentPage, getAllTopic());
        // } else {
        //     antNest.getTopics(antNest.state.currentTeacherPage, getOnlyTeacherTopic());
        // }
        // antNest.setState({"optType": "getAllTopic", type: getAllTopic()});

        //不将topicCardArray清空，就会追加在详情的后面
        topicCardArray.splice(0);

        topicArr.forEach(function (v) {
            antNest.buildTopicCard(v, 0);
        });

        antNest.setState({
            "topicCardList": topicCardArray, "optType": "getAllTopic", type: getAllTopic()
        });
    },
    /**
     * 获取话题的参与者信息
     * 话题被点击的回调
     */
    getTopicPartakeInfo(e) {
        antNest.reGetTopicInfo(antNest.state.currentPage, getAllTopic());
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        //target就是那个a标签
        var topicId = target.title;
        var initPageNo = 1;
        //set过optType之后，表头就会变成“话题详情”
        this.setState({"optType": 'getTopicById'});
        //将以前的topicCardArray滞空之后进入话题详情的位置也变成了最上面，但是出来的位置还不对
        topicCardArray.splice(0);
        var a = <div className="example">
            <Spin size="large" delay={500}/>
        </div>;
        topicCardArray.push(a);
        antNest.getTopicPartakeById(topicId, initPageNo);
    },

    /**
     * 获取作业详情
     */
    getHomeWorkPartakeInfo(e) {
        //不写下面这句,评论之后进去第一次不显示评论
        antNest.reGetTopicInfo(antNest.state.currentPage, getAllTopic());
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var topicId = target.title;
        var initPageNo = 1;
        //set过optType之后，表头就会变成“话题详情”
        this.setState({"optType": 'getZuoYeById'});
        topicCardArray.splice(0);
        var a = <div className="example">
            <Spin size="large" delay={500}/>
        </div>;
        topicCardArray.push(a);
        antNest.getZuoYePartakeById(topicId, initPageNo, e.target.id);
    },
    /**
     * 获取话题参与人数的信息
     * @param topicId 话题id
     * @param pageNo 分页编码，用来完成对话题回复信息的获取，该参数会继续传递到下一个函数中进行使用
     */
    getTopicPartakeById(topicId, pageNo) {
        var param = {
            "method": 'getHuatiInfo',
            "huatiId": topicId + "",
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var parTakeCountInfo = ret.response;
                antNest.getTopicInfoById(topicId, parTakeCountInfo, pageNo);
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 获取作业参与人数的信息
     */
    getZuoYePartakeById(topicId, pageNo, time) {
        var param = {
            "method": 'getZuoYeInfo',
            "zuoYeId": topicId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var parTakeCountInfo = ret.response;
                var now = parTakeCountInfo.now;
                if (now > time) {
                    antNest.setState({zuodaTime: 'none'})
                } else {
                    antNest.setState({zuodaTime: 'inline-block'})
                }
                antNest.getZuoYeInfoById(topicId, parTakeCountInfo, pageNo);
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 根据说说id请求说说
     */
    getTopicById(id, flag) {
        var param = {
            "method": 'getTopicById',
            "topicId": id,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                var data = ret.response;
                //遍历数组topicArr,替换点赞的那条信息之后用新的数据去build
                if (flag) {
                    //删除话题，从数组中删除那一条记录
                    topicArr.forEach(function (v, i) {
                        if (v.id == data.id) {
                            topicArr.splice(i, 1);
                        }
                    });
                } else {
                    topicArr.forEach(function (v, i) {
                        if (v.id == data.id) {
                            topicArr[i] = data;
                        }
                    });
                }
                topicArr.forEach(function (v) {
                    antNest.buildTopicCard(v, 0);
                });

                antNest.setState({
                    "topicCardList": topicCardArray
                });
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
    praiseForTopic(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var topicIdStrArray = target.value.split("#");
        var topicId = topicIdStrArray[0];
        var parentTopicId = topicIdStrArray[0];
        if (topicIdStrArray.length > 1) {
            parentTopicId = topicIdStrArray[1];
        } else {
            topicId = topicIdStrArray[0];
        }

        var param = {
            "method": 'praiseForTopic',
            "ident": sessionStorage.getItem("ident"),
            "topicId": topicId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.success == true && ret.response == true) {
                    message.success("点赞成功");
                } else {
                    message.error("点赞失败");
                }
                if (antNest.state.optType == "getTopicById") {
                    //如果是在单个话题的页面中完成点赞或取消点赞，则停留在当前页面
                    antNest.reGetTopicInfo(antNest.state.currentShowPage, getAllTopic());
                    antNest.getTopicPartakeById(parentTopicId, antNest.state.currentShowPage);
                } else if (antNest.state.optType == "getZuoYeById") {
                    antNest.reGetTopicInfo(antNest.state.currentShowPage, getAllTopic());
                    antNest.getZuoYePartakeById(parentTopicId, antNest.state.currentShowPage);
                } else {
                    // if (antNest.state.type == 0) {
                    //     //在这里请求新的页面应该不是当前页，而是你点击的那一页的页数
                    //     antNest.getTopics(antNest.state.currentPage, getAllTopic());
                    // } else {
                    //     antNest.getTopics(antNest.state.currentTeacherPage, getOnlyTeacherTopic());
                    // }
                    //点赞结束之后，请求点赞的这条数据的最新状态，去数据中替换后重新渲染
                    topicCardArray.splice(0);
                    antNest.getTopicById(topicId, false);
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
    cancelPraiseForTopic(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var topicIdStrArray = target.value.split("#");
        var topicId = topicIdStrArray[0];
        var parentTopicId = topicIdStrArray[0];
        if (topicIdStrArray.length > 1) {
            parentTopicId = topicIdStrArray[1];
        } else {
            topicId = topicIdStrArray[0];
        }
        var param = {
            "method": 'cancelPraiseForTopic',
            "ident": sessionStorage.getItem("ident"),
            "topicId": topicId,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.success == true && ret.response == true) {
                    message.success("取消点赞成功");
                } else {
                    message.error("取消点赞失败");
                }
                if (antNest.state.optType == "getTopicById") {
                    //如果是在单个话题的页面中完成点赞或取消点赞，则停留在当前页面
                    antNest.reGetTopicInfo(antNest.state.currentShowPage, getAllTopic());
                    antNest.getTopicPartakeById(parentTopicId, antNest.state.currentShowPage);
                } else if (antNest.state.optType == "getZuoYeById") {
                    antNest.reGetTopicInfo(antNest.state.currentShowPage, getAllTopic());
                    antNest.getZuoYePartakeById(parentTopicId, antNest.state.currentShowPage);
                } else {
                    // if (antNest.state.type == 0) {
                    //     antNest.getTopics(antNest.state.currentPage, getAllTopic());
                    // } else {
                    //     antNest.getTopics(antNest.state.currentTeacherPage, getOnlyTeacherTopic());
                    // }
                    topicCardArray.splice(0);
                    antNest.getTopicById(topicId, false);
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
    reGetTopicInfo(pageNo, type) {
        topicCardArray.splice(0);
        topicObjArray.splice(0);
        var param = {
            "method": 'getTopicsByType',
            "ident": sessionStorage.getItem("ident"),
            "type": type,
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
    showDeleteTopicModal(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var topicId = target.value;
        antNest.refs.confirmModal.changeConfirmModalVisible(true);
        antNest.setState({"currentTopicId": topicId});
    },

    /**
     * 关闭删除操作的confirm窗口
     */
    closeDeleteTopicModal() {
        antNest.refs.confirmModal.changeConfirmModalVisible(false);
    },

    /**
     * 删除一个话题
     * @param e
     */
    deleteTopic(replayTopicId) {
        var delId;
        if (isEmpty(replayTopicId) == false) {
            delId = replayTopicId;
        } else {
            delId = antNest.state.currentTopicId;
        }
        antNest.deleteTopicById(delId);
    },

    /**
     * 根据给定的话题id，删除指定的话题
     * @param topicId
     */
    deleteTopicById(topicId) {
        var param = {
            "method": 'deleteTopic',
            "ident": sessionStorage.getItem("ident"),
            "topicId": topicId + ""
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.success == true && ret.response == true) {
                    message.success("删除成功");
                } else {
                    message.error("删除失败");
                }
                antNest.closeDeleteTopicModal();
                if (antNest.state.optType == "getTopicById") {
                    //如果是在单个话题的页面中完成点赞或取消点赞，则停留在当前页面
                    antNest.reGetTopicInfo(antNest.state.currentPage, getAllTopic());
                    antNest.getTopicPartakeById(antNest.state.currentTopicId, antNest.state.currentPage);
                } else if (antNest.state.optType == "getZuoYeById") {
                    antNest.reGetTopicInfo(antNest.state.currentShowPage, getAllTopic());
                    antNest.getZuoYePartakeById(antNest.state.currentTopicId, antNest.state.currentShowPage);
                } else {
                    // if (antNest.state.type == 0) {
                    //     antNest.getTopics(antNest.state.currentPage, getAllTopic());
                    // } else {
                    //     antNest.getTopics(antNest.state.currentTeacherPage, getOnlyTeacherTopic());
                    // }
                    topicCardArray.splice(0);
                    antNest.getTopicById(topicId, true);
                }
                antNest.setState({"currentTopicId": ''});
            },
            onError: function (error) {
                message.error(error);
            }
        });
    },

    /**
     * 显示删除评论的confirm
     */
    showDeleteTopicCommentModal(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var arr = target.value.split("#");
        var topicCommentId = arr[0];
        var noomCommentId = arr[1];
        antNest.setState({"topicCommentId": topicCommentId, noomCommentId});
        antNest.refs.deleteTopicCommentModal.changeConfirmModalVisible(true);
    },

    /**
     * 关闭删除操作的confirm窗口
     */
    closeDeleteTopicCommentModal() {
        antNest.refs.deleteTopicCommentModal.changeConfirmModalVisible(false);
    },

    /**
     * 删除一个话题中的评论
     * @param e
     */
    deleteTopicComment(e) {
        if (isEmpty(e) == false) {
            antNest.deleteTopicCommentById(e, antNest.state.noomCommentId);
        } else {
            antNest.deleteTopicCommentById(antNest.state.topicCommentId, antNest.state.noomCommentId);
        }
    },
    /**
     * 根据评论id，删除话题/说说中的评论
     * @param topicCommentId 评论id
     */
    deleteTopicCommentById(topicCommentId, topicId) {
        var param = {
            "method": 'deleteTopicComment',
            "ident": sessionStorage.getItem("ident"),
            "topicCommentId": topicCommentId + ""
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.success == true && ret.response == true) {
                    message.success("评论删除成功");
                } else {
                    message.error("评论删除失败");
                }
                antNest.closeDeleteTopicCommentModal();
                if (antNest.state.optType == "getTopicById") {
                    //如果是在单个话题的页面中完成点赞或取消点赞，则停留在当前页面
                    antNest.reGetTopicInfo(antNest.state.currentShowPage, getAllTopic());
                    antNest.getTopicPartakeById(antNest.state.currentTopicId, antNest.state.currentShowPage);
                } else if (antNest.state.optType == "getZuoYeById") {
                    antNest.reGetTopicInfo(antNest.state.currentShowPage, getAllTopic());
                    antNest.getZuoYePartakeById(antNest.state.currentTopicId, antNest.state.currentShowPage);
                } else {
                    // if (antNest.state.type == 0) {
                    //     antNest.getTopics(antNest.state.currentPage, getAllTopic());
                    // } else {
                    //     antNest.getTopics(antNest.state.currentTeacherPage, getOnlyTeacherTopic());
                    // }
                    topicCardArray.splice(0);
                    antNest.getTopicById(topicId, false);
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
    showSetTopicTopModal(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var topicIdStr = target.value;
        antNest.setState({"currentTopicId": topicIdStr});
        antNest.refs.setTopicTopModal.changeConfirmModalVisible(true);
    },

    /**
     * 关闭是否置顶话题的确认Modal
     */
    closeSetTopicTopModal() {
        antNest.refs.setTopicTopModal.changeConfirmModalVisible(false);
    },

    /**
     * 将指定的话题参与内容置顶
     */
    setTopicToTop() {
        antNest.setTopicToTopById(antNest.state.currentTopicId);
        antNest.closeSetTopicTopModal();
    },

    /**
     * 置顶选定的说说
     */
    setTopicToTopById(topicIdStr) {
        var topicIdStrArray = topicIdStr.split("#");
        var setTopicId = topicIdStrArray[0];
        var topicSubId = topicIdStrArray[1];
        var param = {
            "method": 'setHuatiTop',
            "userId": sessionStorage.getItem("ident"),
            "topicId": topicSubId + "",
            "huatiId": setTopicId
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.success == true && ret.response == true) {
                    message.success("话题置顶成功");
                } else {
                    message.error("话题置顶失败");
                }
                if (antNest.state.optType == "getTopicById") {
                    //如果是在单个话题的页面中完成点赞或取消点赞，则停留在当前页面
                    antNest.reGetTopicInfo(antNest.state.currentShowPage, getAllTopic());
                    antNest.getTopicPartakeById(setTopicId, antNest.state.currentShowPage);
                } else if (antNest.state.optType == "getZuoYeById") {
                    antNest.reGetTopicInfo(antNest.state.currentShowPage, getAllTopic());
                    antNest.getZuoYePartakeById(setTopicId, antNest.state.currentShowPage);
                } else {
                    if (antNest.state.type == 0) {
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
    showDiscussModal(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var topicIdAndUserId = target.value;
        var discussArray = topicIdAndUserId.split("#");
        var topicId = discussArray[0];
        var toUserId;
        if (discussArray.length == 1) {
            antNest.setState({discussModalVisible: true, "currentTopicId": topicId});
        } else if (discussArray.length > 1 && discussArray[1] == "toUser") {
            antNest.setState({discussModalVisible: true, "replayToUserTopicId": topicId});
        } else {
            //评论指向具体人的id
            toUserId = discussArray[1];
            antNest.setState({discussModalVisible: true, "replayTopicId": topicId, "toUserId": toUserId});
        }
    },

    /**
     * 评论窗口的确定操作
     */
    discussModalHandleOk() {
        //获取富文本框中包含表情的评论内容
        var inputContent;
        inputContent = antNest.getEmotionInputById();
        if (isEmpty(inputContent)) {
            message.error("评论内容不允许为空,请重新输入", 5);
            return;
        } else {
            inputContent = inputContent.replace(/\'/g, "\\'");  //' 替换成  \'
            inputContent = inputContent.replace(/\"/g, "\\\""); //" 替换成\"
            inputContent = inputContent.replace(/</g, "\\\<"); //< 替换成\<
            inputContent = inputContent.replace(/>/g, "\\\>"); //> 替换成\>
        }
        var toUserId = -1;
        if (isEmpty(antNest.state.toUserId) == false) {
            toUserId = antNest.state.toUserId;
        }
        var topicId;
        if (isEmpty(antNest.state.replayTopicId) == false) {
            topicId = antNest.state.replayTopicId;
        } else if (isEmpty(antNest.state.replayToUserTopicId) == false) {
            topicId = antNest.state.replayToUserTopicId;
        } else {
            topicId = antNest.state.currentTopicId;
        }
        var param = {
            "method": 'addTopicCommentAndResponse2',
            "ident": sessionStorage.getItem("ident"),
            "toUserId": toUserId,
            "topicId": topicId,
            "content": inputContent
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.success == true && isEmpty(ret.response.id) == false) {
                    message.success("评论成功");
                } else {
                    message.error("评论失败");
                }
                //这段代码移到前方，可以避免页面重新刷新加载，能够保持页面停留在刚刚操作的位置上
                antNest.initMyEmotionInput();
                antNest.setState({
                    discussModalVisible: false,
                    "toUserId": -1,
                    "replayTopicId": '',
                    "replayToUserTopicId": ''
                });
                if (antNest.state.optType == "getTopicById") {
                    //如果是在单个话题的页面中完成点赞或取消点赞，则停留在当前页面
                    antNest.reGetTopicInfo(antNest.state.currentShowPage, getAllTopic());
                    antNest.getTopicPartakeById(antNest.state.currentTopicId, antNest.state.currentShowPage);
                } else if (antNest.state.optType == "getZuoYeById") {
                    antNest.reGetTopicInfo(antNest.state.currentShowPage, getAllTopic());
                    antNest.getZuoYePartakeById(antNest.state.currentTopicId, antNest.state.currentShowPage);
                } else {
                    // if (antNest.state.type == 0) {
                    //     antNest.getTopics(antNest.state.currentPage, getAllTopic());
                    // } else {
                    //     antNest.getTopics(antNest.state.currentTeacherPage, getOnlyTeacherTopic());
                    // }
                    topicCardArray.splice(0);
                    antNest.getTopicById(topicId, false);
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
    discussModalHandleCancel() {
        antNest.initMyEmotionInput();
        antNest.setState({discussModalVisible: false});
    },

    /**
     * 初始化表情输入框
     * 清空话题标题输入框
     */
    initMyEmotionInput() {
        $("#emotionInput").val("");
        var emotionArray = $(".emoji-wysiwyg-editor");
        if (isEmpty(emotionArray) == false) {
            for (var i = 0; i < emotionArray.length; i++) {
                emotionArray[i].innerHTML = "";
                emotionArray[i].innerText = "";
            }
        }
        //清空话题标题输入框
        antNest.setState({
            "topicTitle": '',
            "topicImgUrl": [],
            radioValue: 1,
            classSrcChecked: [],
            boxDisplay: 'none',
            radioDisplay: 'block',
            homeWorkTime: '',
            homeWorkDate: '',
            whiteUserListObj: [],
            whiteUserListNum: 0
        });
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
    getEmotionInput() {
        var emotionInput = "";
        var emotionArray = $(".emoji-wysiwyg-editor");
        if (isEmpty(emotionArray) == false) {
            for (var i = 0; i < emotionArray.length; i++) {
                var emotionObj = emotionArray[i];
                if (isEmpty(emotionObj.innerText) == false) {
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
    getEmotionInputById() {
        var emotionInput = "";
        var emotionInputArray = $("textarea[id='emotionInput']");
        if (isEmpty(emotionInputArray) == false) {
            for (var i = 0; i < emotionInputArray.length; i++) {
                var emotionObj = emotionInputArray[i];
                if (isEmpty(emotionObj.value) == false) {
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
    addTopicModalHandleOk() {
        //获取富文本框中包含表情的评论内容
        var ckeckIdArr = [];
        if (this.state.radioValue == 2) {
            //做出whiteList
            if (this.state.classSrcChecked.length == 0 && this.state.whiteUserList.length == 0) {
                message.error('请选择可见班级或可见的个人', 5)
                return
            }
            if (isEmpty(this.state.classSrcChecked) == false) {
                this.state.classSrcChecked.forEach(function (v, i) {
                    //classCanSeeObj为空的时候不会到这里
                    classCanSeeObj.forEach(function (data, index) {
                        if (data.name == v) {
                            var obj = {
                                id: data.id + ''
                            }
                            ckeckIdArr.push(obj);
                        }
                    })
                })
            }
        }
        var homeWorkDate = this.state.homeWorkDate;
        if (antNest.state.topicModalType == "homework") {
            if (isEmpty(antNest.state.homeWorkDate)) {
                message.error("请选择时间。", 5);
                return;
            }
        }
        var inputContent;
        var emotionInput = antNest.getEmotionInput();
        if (isEmpty($("#emotionInput").val()) == false) {
            inputContent = $("#emotionInput").val();
        } else {
            inputContent = emotionInput;
        }
        if (antNest.state.topicModalType == "topic" || antNest.state.topicModalType == "homework") {
            if (isEmpty(antNest.state.topicTitle)) {
                message.error("标题不允许为空，请重新输入。", 5);
                return;
            }
        }
        if (isEmpty(inputContent)) {
            message.error("内容不允许为空,请重新输入", 5);
            return;
        } else {
            inputContent = inputContent.replace(/\'/g, "\\'");  //' 替换成  \'
            inputContent = inputContent.replace(/\"/g, "\\\""); //" 替换成\"
            inputContent = inputContent.replace(/</g, "\\\<"); //< 替换成\<
            inputContent = inputContent.replace(/>/g, "\\\>"); //> 替换成\>
        }
        var createTime = (new Date()).valueOf();
        var uuid = antNest.createUUID();
        var topicImageArray = antNest.state.topicImgUrl;
        var attachMents = [];
        for (var i = 0; i < topicImageArray.length; i++) {
            var attach = {
                "type": 1,
                "address": topicImageArray[i],
                "createTime": createTime,
                "user": JSON.parse(sessionStorage.getItem("loginUser"))
            };
            attachMents.push(attach);
        }
        var topicJson = {
            "content": inputContent,
            "fromUserId": sessionStorage.getItem("ident"),
            "fromUser": JSON.parse(sessionStorage.getItem("loginUser")),
            "valid": 0,
            "type": 0,
            "uuid": uuid,
            "attachMents": attachMents,
            "comments": [],
            "open": 0,
        };
        if (this.state.radioValue == 2) {
            if (this.state.classSrcChecked.length != 0) {
                //可见班级
                topicJson.whiteList = ckeckIdArr;
            }
            if (this.state.whiteUserList.length != 0) {
                //可见个人
                topicJson.whiteUserList = this.state.whiteUserList;
            }
        }

        if (antNest.state.topicModalType == "topic") {
            topicJson.type = 1;
            if (isEmpty(antNest.state.topicTitle) == false) {
                var title = antNest.state.topicTitle;
                title = title.replace(/\'/g, "\\'");  //' 替换成  \'
                title = title.replace(/\"/g, "\\\""); //" 替换成\"
                title = title.replace(/</g, "\\\<"); //< 替换成\<
                title = title.replace(/>/g, "\\\>"); //> 替换成\>
                topicJson.title = title;
            }
        } else if (antNest.state.topicModalType == "homework") {
            topicJson.type = 11;
            topicJson.commentDisplayTime = homeWorkDate;
            if (isEmpty(antNest.state.topicTitle) == false) {
                var title = antNest.state.topicTitle;
                title = title.replace(/\'/g, "\\'");  //' 替换成  \'
                title = title.replace(/\"/g, "\\\""); //" 替换成\"
                title = title.replace(/</g, "\\\<"); //< 替换成\<
                title = title.replace(/>/g, "\\\>"); //> 替换成\>
                topicJson.title = title;
            }
        } else {
            topicJson.type = 0;
        }
        var param = {
            "method": 'addTopic',
            "topicJson": topicJson,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.success == true && ret.msg == '调用成功') {
                    message.success("发表成功");
                } else {
                    message.error("发表失败");
                }
                $("#emotionInput").val("");
                if (antNest.state.type == 0) {
                    antNest.getTopics(antNest.state.currentPage, getAllTopic(), true, true);
                } else {
                    antNest.getTopics(antNest.state.currentTeacherPage, getOnlyTeacherTopic(), true, true);
                }
                antNest.initMyEmotionInput();
                antNest.setState({addTopicModalVisible: false, topicImgUrl: []});
            },
            onError: function (error) {
                message.error(error);
            }
        });

    },

    /**
     * 发表说说或话题的窗口关闭响应函数
     */
    addTopicModalHandleCancel() {
        antNest.initMyEmotionInput();
        antNest.setState({addTopicModalVisible: false, topicImgUrl: []});
    },

    /**
     * 获取已上传的图片信息
     */
    getUploadedImgList(file, isRemoved) {
        antNest.removeImgViewStyle();
        var imgUrl = file.response;
        if (isEmpty(isRemoved) == false && isRemoved == "removed") {
            for (var i = 0; i < antNest.state.topicImgUrl.length; i++) {
                if (antNest.state.topicImgUrl[i] == imgUrl) {
                    antNest.state.topicImgUrl.splice(i, 1);
                }
            }
        } else {
            antNest.state.topicImgUrl.push(imgUrl);
        }
    },
    /**
     * 移除图片上传组件的pointerEvents样式属性
     * 原值为none时，会导致无法点击预览
     */
    removeImgViewStyle() {
        var imgViewObjArray = $("a[rel='noopener noreferrer']");
        for (var i = 0; i < imgViewObjArray.length; i++) {
            var imgViewObj = imgViewObjArray[i];
            imgViewObj.style.pointerEvents = "";
        }
    },

    /**
     * 显示发表说说/话题的窗口
     */
    showaddTopicModal(e) {
        classCanSeeObj.splice(0);
        var _this = this;
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var optType = target.value;
        if (optType == 'talk') {
            this.setState({publishTitle: '发布说说'})
        } else if (optType == 'topic') {
            this.setState({publishTitle: '发布话题'})
        } else {
            this.setState({publishTitle: '发布作业'})
        }
        antNest.initMyEmotionInput();
        var param = {
            "method": 'getClazzesByUserId',
            "userId": sessionStorage.getItem("ident"),
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.success == true && ret.msg == '调用成功') {
                    var res = ret.response;
                    var arr = [];
                    if (res.length == 0) {
                        _this.setState({radioDisplay: 'none'});
                    }
                    if (isEmpty(res) == false) {
                        res.forEach(function (v) {
                            var clazz = v.grade.name + ' ' + v.name;
                            arr.push(clazz);
                            var obj = {
                                name: v.grade.name + ' ' + v.name,
                                id: v.id
                            }
                            classCanSeeObj.push(obj);
                        })
                    } else {
                        _this.setState({radioDisplay: 'none'});
                    }
                    _this.setState({classChildren: arr});
                } else {

                }
            },
            onError: function (error) {
                message.error(error);
            }
        });
        this.setState({
            homeWorkTime: <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择时间"
                onChange={antNest.timeOnChange}
            />
        });
        antNest.setState({"addTopicModalVisible": true, "topicModalType": optType});
    },

    /**
     * 话题的标题内容改变时的响应函数
     * @param e
     */
    topicTitleChange(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var title = target.value;
        antNest.setState({"topicTitle": title});
    },

    /**
     * 评论某个人的回复
     */
    replayTopicComment() {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var topicId = target.value;
    },

    /**
     * 显示立即参与话题的窗口
     * @param e
     */
    showPartakeModal(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var topicId = target.value;
        antNest.setState({"partakeModalVisible": true, "partakeTopicId": topicId});
    },

    /**
     * 立即参与窗口的确定响应函数
     */
    partakeModalHandleOk() {
        //获取富文本框中包含表情的评论内容
        var inputContent;
        var emotionInput = antNest.getEmotionInput();
        if (isEmpty($("#emotionInput").val()) == false) {
            inputContent = $("#emotionInput").val();
        } else {
            inputContent = emotionInput;
        }
        if (isEmpty(inputContent) == false) {
            inputContent = inputContent.replace(/\'/g, "\\'");  //' 替换成  \'
            inputContent = inputContent.replace(/\"/g, "\\\""); //" 替换成\"
            inputContent = inputContent.replace(/</g, "\\\<"); //< 替换成\<
            inputContent = inputContent.replace(/>/g, "\\\>"); //> 替换成\>
        }
        var createTime = (new Date()).valueOf();
        var uuid = antNest.createUUID();
        var topicImageArray = antNest.state.topicImgUrl;
        var attachMents = [];
        for (var i = 0; i < topicImageArray.length; i++) {
            var attach = {
                "type": 1,
                "address": topicImageArray[i],
                "createTime": createTime,
                "user": JSON.parse(sessionStorage.getItem("loginUser"))
            };
            attachMents.push(attach);
        }
        var parentTopic = antNest.findTopicObjFromArrayById(antNest.state.partakeTopicId);
        var topicJson = {
            "content": inputContent,
            "fromUserId": sessionStorage.getItem("ident"),
            "fromUser": JSON.parse(sessionStorage.getItem("loginUser")),
            "valid": 0,
            "type": 1,
            "uuid": uuid,
            "attachMents": attachMents,
            "comments": [],
            "open": 0,
            "parent": parentTopic
        };
        if (antNest.state.optType == "getZuoYeById") {
            topicJson.type = 11
        }
        var param = {
            "method": 'addTopic',
            "topicJson": topicJson,
        };
        doWebService(JSON.stringify(param), {
            onResponse: function (ret) {
                if (ret.success == true && ret.response == true) {
                    message.success("话题参与成功");
                } else {
                    message.error(ret.msg);
                }
                if (antNest.state.optType == "getTopicById") {
                    //如果是在单个话题的页面中完成点赞或取消点赞，则停留在当前页面
                    antNest.reGetTopicInfo(antNest.state.currentShowPage, getAllTopic());
                    antNest.getTopicPartakeById(antNest.state.currentTopicId, antNest.state.currentShowPage);
                } else if (antNest.state.optType == "getZuoYeById") {
                    antNest.reGetTopicInfo(antNest.state.currentShowPage, getAllTopic());
                    antNest.getZuoYePartakeById(antNest.state.currentTopicId, antNest.state.currentShowPage);
                } else {
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
    partakeModalHandleCancel() {
        antNest.setState({"partakeModalVisible": false});
    },

    handleScroll(e) {
        var target = e.target;
        if (navigator.userAgent.indexOf("Chrome") > -1) {
            target = e.currentTarget;
        } else {
            target = e.target;
        }
        var scrollTop = target.scrollTop;
        this.setState({antNestScoll: scrollTop});
    },

    timeOnChange(value, dateString) {
        var date = new Date(dateString).valueOf();
        this.setState({homeWorkDate: date});
    },

    /**
     * 从蚁群中选人,调起弹窗
     */
    choiceCanSeePer() {
        this.props.choiceCanSeePer(9999, antNest.state.whiteUserListObj);
    },

    /**
     * 接收到选择可见个人的数组
     * @param arr
     */
    callBackChoiceCanSeePerToNest(arr) {
        var array = [];
        if (isEmpty(arr) == false) {
            arr.forEach(function (v, i) {
                array.push({
                    colUid: v.userId
                })
            })
        }
        antNest.setState({
            whiteUserList: array,
            whiteUserListObj: arr,
            whiteUserListNum: arr.length
        });
    },

    /**
     * 渲染页面
     * @returns {XML}
     */
    render() {
        const radioStyle = {
            display: 'block',   
            height: '30px',
            lineHeight: '30px',
        };
        var breadMenuTip = "查看全部";
        if (antNest.state.type == 0) {
            breadMenuTip = "查看全部";
        } else {
            breadMenuTip = "只看老师";
        }
        var optionButton;
        var topicList;
        if (antNest.state.optType == "getTopicById") {
            optionButton = <div className="public—til—blue">
                <div className="ant-tabs-right">
                    <Button onClick={antNest.returnTopicList}><Icon type="left"/></Button>
                </div>
                话题详情</div>;

            topicList =
                <div className="favorite_scroll">
                    <div className="antnest_cont topics_calc2" style={{overflow: 'scroll'}}>
                        {antNest.state.topicCardList}
                        {/*<div className="topics_calc2_center"><span onClick={antNest.pageAdd}>加载更多>></span></div>*/}
                    </div>
                    {/*<Pagination key="all" total={antNest.state.totalCount} pageSize={getPageSize()}*/}
                    {/*current={antNest.state.currentShowPage}*/}
                    {/*onChange={antNest.pageOnChange}/>*/}
                </div>;
        } else if (antNest.state.optType == "getZuoYeById") {
            optionButton = <div className="public—til—blue">
                <div className="ant-tabs-right">
                    <Button onClick={antNest.returnTopicList}><Icon type="left"/></Button>
                </div>
                作业内容</div>;

            topicList =
                <div className="favorite_scroll">
                    <div className="antnest_cont topics_calc2" style={{overflow: 'scroll'}}>
                        {antNest.state.topicCardList}
                    </div>
                </div>;
        } else {
            optionButton = <div className="public—til—blue">
                <div className="talk_ant_btn1">
                    <Button value="talk" onClick={antNest.showaddTopicModal} className="antnest_talk">发表说说</Button>
                    <Button value="topic" onClick={antNest.showaddTopicModal} className="antnest_talk">发表话题</Button>
                    <Button style={{display: antNest.state.homeWorkPublish}} value="homework"
                            onClick={antNest.showaddTopicModal}>发布作业</Button>
                </div>
                {breadMenuTip}
            </div>;

            topicList =
                <div className="favorite_scroll">
                    <div className="antnest_cont topics_calc2 antNestScoll" style={{overflow: 'scroll'}}
                         onScroll={this.handleScroll}>
                        {antNest.state.topicCardList}
                        <div className="topics_calc2_center"><span onClick={antNest.pageAdd}>加载更多>></span></div>
                    </div>
                    {/*<Pagination key="all" total={antNest.state.totalCount} pageSize={getPageSize()}*/}
                    {/*current={antNest.state.currentShowPage}*/}
                    {/*onChange={antNest.pageOnChange}/>*/}
                </div>;
        }
        var topicTitle;
        if (antNest.state.topicModalType == "topic" || antNest.state.topicModalType == "homework") {
            topicTitle = <Row className="yinyong_topic">
                <Col span={4} className="right_look">标题：</Col>
                <Col span={18}><Input onChange={antNest.topicTitleChange} defaultValue={antNest.state.topicTitle}
                                      value={antNest.state.topicTitle}/></Col>
            </Row>;
        }
        var homeWorkTime;
        if (antNest.state.topicModalType == "homework") {
            homeWorkTime = <Row>
                <Col span={4} className="right_look">作业结束时间：</Col>
                <Col span={18}>
                    {antNest.state.homeWorkTime}
                </Col>
            </Row>
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
                    <div className="group_send_pinglun">
                        <Row>
                            <Col span={4} className="right_look">内容：</Col>
                            <Col span={18}><EmotionInputComponents
                                className="topics_ral"></EmotionInputComponents></Col>
                        </Row>
                    </div>
                </Modal>
                <Modal title={antNest.state.publishTitle}
                       visible={antNest.state.addTopicModalVisible}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       onOk={antNest.addTopicModalHandleOk}
                       onCancel={antNest.addTopicModalHandleCancel}
                >
                    <div className="group_send_shuoshuo">
                        {topicTitle}
                        <Row className="yinyong_topic">
                            <Col span={4} className="right_look">内容：</Col>
                            <Col span={18}><EmotionInputComponents></EmotionInputComponents></Col>
                        </Row>
                        {homeWorkTime}
                        <Row className="yinyong3">
                            <Col span={4} className="right_look">附件：</Col>
                            <Col span={18}><UploadImgComponents fileList={antNest.state.topicImgUrl}
                                                                callBackParent={antNest.getUploadedImgList}></UploadImgComponents></Col>
                        </Row>
                        <Row style={{display: this.state.radioDisplay}}>
                            <div className="radio_left">
                                <RadioGroup onChange={this.radioOnChange} value={this.state.radioValue}>
                                    <Radio style={radioStyle} value={1} className="gray_6_12">公开</Radio>
                                    <Radio style={radioStyle} value={2} className="gray_6_12">部分可见</Radio>
                                </RadioGroup>
                            </div>
                        </Row>
                        <Row style={{display: this.state.boxDisplay}}>
                            <div className="checkbox_left gray_6_12">
                                <CheckboxGroup options={this.state.classChildren}
                                               value={this.state.classSrcChecked}
                                               onChange={this.checkboxOnChange}/>
                            </div>
                            <div className="yinyong3">
                                <a className="checkbox_left2 checkbox_left2_a antnest_talk" href="javascript:;" onClick={this.choiceCanSeePer}>从蚁群选择</a>
                                <span>已选择：{this.state.whiteUserListNum}人</span>
                            </div>
                        </Row>
                    </div>

                </Modal>
                <Modal title="立即参与"
                       visible={antNest.state.partakeModalVisible}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       onOk={antNest.partakeModalHandleOk}
                       onCancel={antNest.partakeModalHandleCancel}
                       style={{height: 360}}
                >
                    <div className="group_send_shuoshuo">
                        <Row>
                            <Col span={4} className="right_look">内容：</Col>
                            <Col span={18}><EmotionInputComponents
                                className="topics_ral"></EmotionInputComponents></Col>
                        </Row>
                        <Row className="yinyong3">
                            <Col span={4} className="right_look">附件：</Col>
                            <Col span={18}><UploadImgComponents
                                callBackParent={antNest.getUploadedImgList}></UploadImgComponents></Col>
                        </Row>
                    </div>

                </Modal>

                <Modal title="可见的朋友"
                       visible={antNest.state.whoISSecretModalVisible}
                       transitionName=""  //禁用modal的动画效果
                       maskClosable={false} //设置不允许点击蒙层关闭
                       onCancel={antNest.whoISSecretModalHandleCancel}
                       footer={null}

                       className="visible_class"

                >
                    <ul>
                        {this.state.whoISSecretLis}
                    </ul>
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
                    {optionButton}
                </div>
                {topicList}
            </div>
        );
    },
});

export default AntNestTabComponents;
