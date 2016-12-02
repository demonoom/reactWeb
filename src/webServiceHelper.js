/**
 * Created by devnote on 16-12-2.
 */
//完成向后台的webService请求
doWebService : function(data,listener) {
    var service = this;
    this.WEBSERVICE_URL = "http://www.maaee.com/Excoord_For_Education/webservice";
    if (service.requesting) {
        return;
    }
    service.requesting = true;
    $.post(service.WEBSERVICE_URL, {
        params : data
    }, function(result, status) {
        service.requesting = false;
        if (status == "success") {
            listener.onResponse(result);
        } else {
            listener.onError(result);
        }
    }, "json");
},