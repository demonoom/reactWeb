const fs = require('fs');
const child_process = require('child_process');
var cat = child_process.spawn('cat');

run();
function run(){
    console.log("into run");
    child_process.exec('npm start', function(error, stdout, stderr) {
        if(error == null) {
            console.log("服务器启动成功");
        }else{
            console.log("服务器启动失败");
        }
        checkServerStatus();
    });

}

function checkServerStatus(){
    console.log("into checkServerStatus");
    child_process.exec('pgrep nodejs', function(e, stdout, stderr) {
        console.log("ck:"+e)
        if(e!=null) {
            console.log("服务器异常停止,正在重启");
            console.log(e.message);
            run();
        }else{
            console.log("服务器正常运行中");
        }
    });
    setTimeout("checkServerStatus()",5000);
}


process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
});

//child_process线程异常捕获处理
cat.on('exit', function() {
    console.log('kthxbai');
});
cat.on('uncaughtException', function(e) {
    console.log("child_process error==>:"+e);
});
