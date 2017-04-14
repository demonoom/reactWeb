/**
 * Created by devnote on 17-4-7.
 */
class WebCall {

    showLoading() {

    }

    showLoading(cancelAble) {

    }

    dismissLoading() {

    }

    showMessage(message) {

    }

    playAudio(url) {

    }

    playVideoM(jsonObject) {

    }

    playVideoJSON(jsonObject) {
        var obj = eval('(' + str + ')')
        debugger
        var flvsrc = obj.liveVideos[0].path;

    }

    showImage(url) {

    }

    showImage(url, currentUrl) {

    }

    showPdf(pdfUrl) {

    }

    playVideo(videoPath) {

    }

    finish() {

    }

    /**
     * 结束本activity并且刷新前一个fragment
     */
    finishForRefresh() {

    }

    /**
     * 结束本fragment并且在前一个fragment执行一段脚本
     *
     * @param cmd
     */
    finishForExecute(cmd) {

    }

    /**
     * 结束并开启一个新页面
     *
     * @param url
     */
    finishForNewPage(url) {

    }

    /**
     * 是否显示分享按钮
     *
     * @param shareAble
     */
    setShareAble(shareAble) {

    }

    teacherJoinClass(vid) {

    }

    /**
     * 是否可以下拉刷新
     *
     * @param refreshAble
     */
    setRefreshAble(refreshAble) {

    }

    showSubjectWeikeMaterials(subjectId) {

    }

    addSubjectWeikeMaterialInput(subjectId) {

    }


}

export default WebCall;