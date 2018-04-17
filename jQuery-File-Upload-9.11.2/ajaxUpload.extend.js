

//图片上传
function uploadImg() {
    var uploadActionUrl = 'http://60.205.86.217:8890/Excoord_Upload_Server/file/upload';


  let ajaxUpload =  new AjaxUpload(button, {
        action: uploadActionUrl,
        data: {},
        name: 'myfile',
        onSubmit: function (file, ext) {
            if (!(ext && /^(jpg|JPG|png|PNG|gif|GIF)$/.test(ext))) {
                alert("您上传的图片格式不对，请重新选择！");
                return false;
            }
        },
        onComplete: function (info) {
            switch (info.file.status) {
                case "uploading":
                    var percent = info.file.percent;

                    break;
                case "removed":

                    break;
                case "done":
                    // info.file
                    break;
                case "error":

                    break;
            }
        }
    });

}

