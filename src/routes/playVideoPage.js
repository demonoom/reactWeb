import React from 'react';
import {Button} from 'antd';
import {doWebService} from '../WebServiceHelper';


/**
 * 播放视屏页面
 */
class PlayVideoPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            ident: sessionStorage.getItem("ident"),
            sourceObj: []
        };
        this.buildSourceObj = this.buildSourceObj.bind(this);
    }

    componentWillMount() {
        var locationHref = window.location.href;
        var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
        var searchArray = locationSearch.split("&");
        var videoUrl = searchArray[0].split('=')[1];
        document.title = "小蚂蚁直播";   //设置title
        this.setState({videoUrl});
        this.buildSourceObj(videoUrl);
        // console.log($(".vjs-volume-control"));
        $(".vjs-volume-control").css({

        })
    }

    componentDidMount(){
        // console.log($(".vjs-volume-control"));
        var options = {
            sourceOrder: true,
            controls: true,
            autoplay: true,
            preload: "auto",
            techOrder: ['html5', 'flash']
        };
        var myPlayer = videojs('playVideoBox', {options}, function () {
            myPlayer.play();
            myPlayer.on('ended', function () {
            });
        });
    }

    buildSourceObj(videoUrl){
        var _this = this;
        /**
         * 根据video类型来加载video标签
         */
        var lastPointIndex = videoUrl.lastIndexOf(".");
        var videoType = videoUrl.substring(lastPointIndex + 1);
        var sourceObj = <source src={videoUrl}  type="" />;
        if(videoType == "m3u8"){
            sourceObj = <source src={videoUrl}  type="application/x-mpegURL" />;
        }
        var videoObj = <video id="playVideoBox" controls className="video-js vjs-default-skin vjs-big-play-centered" preload="auto" width="640" height="600">
            {sourceObj}
        </video>;
        _this.setState({videoObj});
    }

    render() {
        return (
            <div className="calmVideoBoxWrap">
                <div className="calmVideoBox">
                    {this.state.videoObj}
                </div>
            </div>
        )
    }

}


export default PlayVideoPage;

