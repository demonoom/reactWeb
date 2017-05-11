/**
 * Created by madapeng on 17-5-11.
 */

import React  from 'react';
import MyMTV  from '../components/MyMTV';
import MyFollows  from '../components/MyFollows';
import MyFavorites  from '../components/Favorites';
import ResetStudentAccountKey  from '../components/ResetStudentAccountKey';
import TeacherAllSubjects from '../components/TeacherInfos/TeacherAllSubjects';
import TeacherAllCourseWare from '../components/TeacherInfos/TeacherAllCourseWare';

class PersonCenter extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {

        let face = '';

        switch (this.props.params) {
            default :
                face = <TeacherAllCourseWare />;
                break;
            case 'mySubject':
                face = <TeacherAllSubjects />;
                break;

            case 'myFavorites':
                face = <MyFavorites />;
                break;

            case 'myMTV':
                face = <MyMTV  />;
                break;

            case 'myFollows':
                face = <MyFollows />;
                break;

            case 'findStudentPwd':
                face = <ResetStudentAccountKey />;
                break;
        }


        return ( face )
    }

}

export default PersonCenter;