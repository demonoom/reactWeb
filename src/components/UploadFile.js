/**
 * Created by madapeng on 17-5-25.
 */

function uploadAndSubmit(file) {

    // 寻找表单域中的 <input type="file" ... /> 标签
    var file = form["file"].files[0];
    // try sending
    var reader = new FileReader();

    reader.onloadstart = function () {
        // 这个事件在读取开始时触发
        document.getElementById("bytesTotal").textContent = file.size;
    }
    reader.onprogress = function (p) {
        // 这个事件在读取进行中定时触发
        document.getElementById("bytesRead").textContent = p.loaded;
    }

    reader.onload = function () {

        document.getElementById("bytesRead").textContent = file.size;
        // 构造 XMLHttpRequest 对象，发送文件 Binary 数据
        var xhr = new XMLHttpRequest();
        xhr.withCredentials=true;
        xhr.open("POST", defaultConfig.images.upload.url );
        xhr.overrideMimeType("application/octet-stream");

        if(!XMLHttpRequest.prototype.sendAsBinary){
            XMLHttpRequest.prototype.sendAsBinary = function(datastr) {
                function byteValue(x) {
                    return x.charCodeAt(0) & 0xff;
                }
                var ords = Array.prototype.map.call(datastr, byteValue);
                var ui8a = new Uint8Array(ords);
                xhr.send(ui8a.buffer);
            };
        }else{
            xhr.sendAsBinary(reader.result);
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    debugger
                    console.log("response: " + xhr.responseText);
                }
            }
        }
    }

    reader.onloadend = function () {
        // 这个事件在读取结束后，无论成功或者失败都会触发
        if (reader.error) {
            console.log(reader.error);
            return;
        }


    }

    reader.readAsBinaryString(file);

}