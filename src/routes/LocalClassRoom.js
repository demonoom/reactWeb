import React from 'react';
import {Modal, message,Row,Col,Button,Tabs} from 'antd';
import LocalClassesMessage from '../components/localClassRoom/LocalClassesMessage'

const LocalClassRoom = React.createClass({
    getInitialState() {
        return {
            vid:'',
            account:'',
            classRoomUrl:''
        };
    },

    componentWillMount() {
        var locationHref = window.location.href;
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var searchArray = locationSearch.split("&");
        var vid = searchArray[0].split('=')[1];
        var account = searchArray[1].split('=')[1];
        document.title = "本地课堂";   //设置title
        var classRoomUrl = "https://www.maaee.com/Excoord_For_Education/whiteboard_frame.jsp?vid="+vid+"&account="+account;
        this.setState({vid,account,classRoomUrl});
    },

    /**
     * 获取课件，打开ppt，完成推ppt的操作
     */
    getPPT(){

    },

    /**
     * 获取题目，完成推题的操作
     */
    getSubject(){

    },

    render() {
        return (
                <div style={{height:'900px'}}>
                    <Col span={18} style={{height:'100%'}}>
                        <iframe src={this.state.classRoomUrl} style={{width:'100%',height:'100%'}}></iframe>
                        <div>
                            <Button onClick={this.getPPT}>课件</Button>
                            <Button onClick={this.getSubject}>题目</Button>
                        </div>
                    </Col>
                    <Col span={4} style={{height:'100%'}}>
                        <LocalClassesMessage></LocalClassesMessage>
                    </Col>
                </div>
        );
    },

});

export default LocalClassRoom;

