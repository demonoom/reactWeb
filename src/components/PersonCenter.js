/**
 * Created by madapeng on 17-5-11.
 */

import React  from 'react';
import MyMTV  from '../components/MyMTV';
import MyFollows  from '../components/MyFollows';
import TeacherResource from '../components/TeacherInfos/TeacherResource';
import ResetStudentAccountKey  from '../components/ResetStudentAccountKey';
import MyFavorites  from '../components/Favorites';

class PersonCenter extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};


    }

    render() {

        let face = '';

        switch (this.props.params) {
            default :
                face = <TeacherResource   />;
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

            case 'mySubject':
                face = <MyFollows />;
                break;

        }


        return ( face )
    }

}

export default PersonCenter;