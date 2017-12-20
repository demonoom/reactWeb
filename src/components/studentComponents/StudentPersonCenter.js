/**
 * Created by madapeng on 17-5-11.
 */

import React  from 'react';
import UserInfo  from '../UserInfo';
import MyFollows  from '../MyFollows';

class StudentPersonCenter extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {

        let face = '';

        switch (this.props.params) {
            default :
                face = <UserInfo />;
                break;

            case 'myAskList':
                var currentPageLink = "http://www.maaee.com/Excoord_PhoneService/quiz/getUserAskedQuiz/" + sessionStorage.getItem("ident");
                face = <div className="group_cont">
                    <div className="public—til—blue">我发起过的提问</div>
                    <iframe ref="study" src={currentPageLink} className="analyze_iframe"></iframe>
                </div>;
                break;

            case 'myStudyTrack':
                var currentPageLink = "http://www.maaee.com/Excoord_PhoneService/user/studytrack/" + sessionStorage.getItem("ident");
                face = <div className="group_cont">
                    <div className="public—til—blue">我的学习轨迹</div>
                    <iframe ref="study" src={currentPageLink} className="analyze_iframe"></iframe>
                </div>;
                break;

            case 'myFollows':
                face = <MyFollows />;
                break;
        }


        return ( face )
    }

}

export default StudentPersonCenter;