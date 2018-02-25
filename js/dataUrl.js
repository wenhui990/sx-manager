var org_url = ''//'http://localhost:8081';
//var org_url = 'http://101.201.227.154:8080';
var token = 'w5QzdahJSMn5gjMti4WNsxcjM';//sessionStorage.token;
var dataUrl = {
	/*客户管理*/
	'users': '/zh-sx-cms/users',
	/*商学管理（课程）*/
	'course': '/zh-sx-cms/course',
	/*上传图片*/
	'uploadImg': '/zh-sx-cms/course/uploadImg',
	/*礼品*/
	'commodity': '/zh-sx-cms/commodity',
	'commodityUpImg': '/zh-sx-cms/commodity/uploadImg',
	'commodityOrder': '/zh-sx-cms/commodityOrder',
	/*积分管理*/
	'pointsOrder': '/zh-sx-cms/users/pointsOrder',
}

function urlParse() {
  let params = {}
  let url = window.location.href
  let idx = url.indexOf("?")
  if (idx > 0) {
    let queryStr = url.substring(idx + 1)
    let args = queryStr.split("&")
    for (var i = 0, a, nv; a = args[i]; i++) {
      nv = args[i] = a.split("=")
      params[nv[0]] = nv.length > 1 ? nv[1] : true
    }
  }
  return params
};
Date.prototype.Format = function (fmt) {
  let o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "h+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    "S": this.getMilliseconds() //毫秒
  }
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length))
  for (let k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)))
  }
  return fmt
}
