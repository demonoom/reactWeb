import React from 'react';

/**
 * 播放视屏页面
 */
function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var index = window.location.href.indexOf('?') + 1;
    var str = window.location.href.substr(index, window.location.href.length - 1);
    var r = str.match(reg);
    if (r != null) {
        return unescape(r[2]);
    }
    return null;
}

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
        var videoUrl = getQueryString("path");
        document.title = "小蚂蚁直播";   //设置title
        this.setState({videoUrl});
        this.buildSourceObj(videoUrl);
    }

    componentDidMount() {
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

    buildSourceObj(videoUrl) {
        var _this = this;
        /**
         * 根据video类型来加载video标签
         */
        var sourceObj = <source src={videoUrl} type=""/>;
        if (videoUrl.indexOf("m3u8") != -1) {
            sourceObj = <source src={videoUrl} type="application/x-mpegURL"/>;
        }
        var videoObj = <video id="playVideoBox" controls className="video-js vjs-default-skin vjs-big-play-centered"
                              preload="auto" width="640" height="600">
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