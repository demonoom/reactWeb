function ClazzConnection(host){
    this.clazzWsListener = null;
	//  this.domain = host || 'www.maaee.com:8888'; // local  8888
   // this.domain = host || '192.168.1.34:7888';
  //  this.domain = host || '192.168.2.104:8888';
  //  this.WS_URL = "ws://"+this.domain+"/Excoord_PushServer/class";
  this.WS_URL = "wss://www.maaee.com:7888/Excoord_PushServer/class";
    this.ws = null;
    this.PING_COMMAND = "ping_0123456789_abcdefg";
    this.PONG_COMMAND = "pong_0123456789_abcdefg";
    this.classOver = false;
    this.loginProtocol = null;
    this.connected = false;
    this.connecting = false;
    this.connect = function(loginProtocol){

        var connection = this;
        connection.connecting = true;
        connection.loginProtocol = loginProtocol;
      window.liveTVWS =  connection.ws=new WebSocket(connection.WS_URL);

        //监听消息
        connection.ws.onmessage = function(event) {

            connection.connecting = false;
            //如果服务器在发送ping命令,则赶紧回复PONG命令
            if(event.data == connection.PING_COMMAND){
                connection.send(connection.PONG_COMMAND);
             //   console.log("收到服务器的 ping , 给服务器回复 pong...");
                return;
            }
            if(event.data == connection.PONG_COMMAND){
             //   console.log("收到服务器的 pong");
                return;
            }
            if(connection.clazzWsListener != null){
                var jsonMessage = eval('(' + ""+event.data+"" + ')');
                //EERO
                if(jsonMessage.statusCode == -1){
                    var errorResult = jsonMessage.errorResult;
                    connection.classOver = true;
                    connection.clazzWsListener.onError(errorResult.message);
                }//WARNING
                else if(jsonMessage.statusCode == 0){
                    var warnResult = jsonMessage.warnResult;
                    connection.clazzWsListener.onWarn(warnResult.message);
                }//INFO
                else if(jsonMessage.statusCode == 1){
                    var infoResult = jsonMessage.infoResult;
                    var command = infoResult.command;
                    if(command == "classOver"){
                        connection.classOver = true;
                    }else if(command == "studentLogin"){
                        connection.loginProtocol.reconnect = true;
                    }else if(command == "teacherLogin"){
                        connection.loginProtocol.reconnect = true;
                    }else if(command == "teacherLiveClass"){
                        connection.loginProtocol.reconnect = true;
                    }
                    connection.clazzWsListener.onMessage(infoResult);
                }
            }
        };
        // 打开WebSocket
        connection.ws.onclose = function(event) {
            connection.connecting = false;
            connection.connected = false;
            connection.reconnect();
         //   console.log("收到服务器的 onclose .");
        };
        // 打开WebSocket
        connection.ws.onopen = function(event) {
            connection.connecting = false;
            connection.connected = true;
            connection.send(loginProtocol);
         //   console.log("连接到服务器 ....");
        };
        connection.ws.onerror =function(event){
            connection.connecting = false;
            console.log("收到服务器的 onerror ....");
        };
    };



    this.send = function(jsonProtocal){

        if(!this.connecting && this.connected){
            this.ws.send(JSON.stringify(jsonProtocal));
        }
    };

    //每次重连间隔为20秒
    this.reconnect = function(){
        var _this = this;
        if(!this.classOver && this.loginProtocol != null && !this.connected && !this.connecting){
            setTimeout(function (){
                _this.connect(_this.loginProtocol);
                _this.reconnect();
                console.log("重连中 ...");
            }, 1000*10);
        }
    };

    //因为网页中和客户端的处理机制还不太一样，网页中的心跳检测时间缩短到10秒钟
    this.heartBeat = function(){
        var _this = this;
        setTimeout(function (){
            _this.send(_this.PING_COMMAND);
          //  console.log("客户端发送ping命令 , 希望服务器回答pong...");
            _this.heartBeat();
        }, 1000*10);
    };

    //此对象一创建就开始心跳检测
    this.heartBeat();
}