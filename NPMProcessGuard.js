const fs = require('fs');
//获取子进程对象
const child_process = require('child_process');
//子进程重启
var cat = child_process.spawn('cat');
//调用运行的方法
run();
function run(){
    console.log("into run");
    //在主进程下，调用子进程，执行Linux命令，借助该命令启动antDesign项目
    child_process.exec('npm start', function(error, stdout, stderr) {
        //根据error的结果，来判断是否执行成功
        if(error == null) {
            console.log("服务器启动成功");
        }else{
            console.log("服务器启动失败");
        }
        //执行完成后，启动监听程序
        checkServerStatus();
    });

}
//监听方法
function checkServerStatus(){
    console.log("into checkServerStatus");
    //监控系统的nodejs进程
    child_process.exec('pgrep nodejs', function(e, stdout, stderr) {
        if(e!=null) {
            console.log("服务器异常停止,正在重启");
            console.log(e.message);
            //监听不到nodejs进程后，表示服务器已停止，所以此处调用run()方法完成进程重启
            run();
        }else{
            console.log("服务器正常运行中");
        }
    });
    //每隔5秒监听一次
    setTimeout("checkServerStatus()",5000);
}

//主程序未捕获异常的处理方式
process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
});

//child_process退出处理
cat.on('exit', function() {
    console.log('child_process退出了');
});
//child_process线程异常捕获处理
cat.on('uncaughtException', function(e) {
    console.log("child_process error==>:"+e);
});