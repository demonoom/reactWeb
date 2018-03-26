const fs = require('fs');
//获取子进程对象
const child_process = require('child_process');
//子进程重启
var cat = child_process.spawn('cat');
const execOptions = {
    maxBuffer: 5000 * 1024,
};
function getCurrentTime() {
    var da = new Date();
    var year = da.getFullYear();
    var month = da.getMonth()+1;
    var date = da.getDate();
    var hour = da.getHours()+":";
    var minutes = da.getMinutes()+":";
    var seconds = da.getSeconds();
    var dayStr = [year,month,date].join('-');
    var dateStr = dayStr +" "+ hour + minutes+seconds;
    return dateStr;
}
//调用运行的方法
run();
function run(){
    var currentTime = getCurrentTime();
    console.log("into run");
    //在主进程下，调用子进程，执行Linux命令，借助该命令启动antDesign项目
    child_process.exec('npm start', execOptions,function(error, stdout, stderr) {
        //根据error的结果，来判断是否执行成功
        // console.error(currentTime+":"+'at run function error: '+ error.name + error.message+ ",发生在" + error.lineNumber+"行");
        console.error("主进程启动错误："+error);
        // console.error(currentTime+":"+"at run function stdout："+stdout);
        // console.error(currentTime+":"+"at run function stderr："+stderr);
        if(error == null) {
            console.log("服务器启动成功");
        }else{
            console.error("服务器启动失败");
        }
        //执行完成后，启动监听程序
        checkServerStatus();
    });

}
//监听方法
function checkServerStatus(){
    // var currentTime = getCurrentTime();
    console.log("into checkServerStatus");
    //监控系统的nodejs进程
    child_process.exec('pgrep nodejs',execOptions, function(e, stdout, stderr) {
        if(e!=null) {
            // console.error(currentTime+":"+'at checkServerStatus function error: '+ e.name + e.message+ ",发生在" + e.lineNumber+"行");
            // console.error(currentTime+":"+"服务器异常停止,正在重启");
            // console.log("nodejs进程信息："+e.message);
            console.error("at checkServerStatus function stdout："+stdout);
            console.error("at checkServerStatus function stderr："+stderr);
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
    // var currentTime = getCurrentTime();
    // console.error('Caught exception: '+ err.name + err.message+ ",发生在" + err.lineNumber+"行");
    console.error('Caught exception: ' + err);
});

//child_process退出处理
cat.on('exit', function() {
    // var currentTime = getCurrentTime();
    console.error('child_process退出了');
});
//child_process线程异常捕获处理
cat.on('uncaughtException', function(e) {
    // var currentTime = getCurrentTime();
    // console.error('child_process线程异常捕获处理: '+ e.name + e.message+ ",发生在" + e.lineNumber+"行");
    console.error("child_process error==>:"+e);
});
