var pagecount = 10,
	allgrage, allclazz;
//元素的补零计算
function addZero(val) {
	if(val < 10) {
		return "0" + val;
	} else {
		return val;
	}
};
	
Vue.filter("formatTime", function(value, type) {
	var dataTime = "";
	var data = new Date();
	data.setTime(value);
	var year = data.getFullYear();
	var month = addZero(data.getMonth() + 1);
	var day = addZero(data.getDate());
	var hour = addZero(data.getHours());
	var minute = addZero(data.getMinutes());
	var second = addZero(data.getSeconds());
	if(type == "YMD") {
		dataTime = year + "-" + month + "-" + day;
	} else if(type == "YMDHMS") {
		dataTime = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
	} else if(type == "HMS") {
		dataTime = hour + ":" + minute + ":" + second;
	} else if(type == "YM") {
		dataTime = year + "-" + month;

	}
	return dataTime; //将格式化后的字符串输出到前端显示
});

var recharges = new Vue({
	el: '#studentMain',
	data: {
		page:1,
		pagesize:10,
		rechargesLists: '', 
		schools: '', 
		iswarning: false,
		checkItem: true,
		studentdata: {},
		rechargename: '',
		rechargcard: '',
		typename: '',
		schoolsVal: '',
		schoolname: ''
	},
	beforeCreate: function() {
		$.ajax({
			type: "get",
			url: org_url + dataUrl.schools+'?token='+localStorage.token,
			success: function(data) {
				if (data.code=='10010') {
					layer.alert('身份验证失败！请重新登录！',{yes:function(){
						parent.location.href = "../../enter.html";
					},cancel:function(){
						parent.location.href = "../../enter.html";
					}});
					return false;
				}
				recharges.schools = data.data;
			}
		});
	},
	methods: {
		checkAll: function(e) { //全选
			recharges.checkeds = $(e.target).prop('checked');
		},
		checkOne: function(e) { //单选
			var check = $(e.target).prop('checked');
			console.log(check)
			check ? $(e.target).parents('tr').addClass('warning') : $(e.target).parents('tr').removeClass('warning')
		},
		searchstudent: function(e) { //搜索学生
			var time = new Date(new Date($('#date2').val()).getTime()+(60*60*24*1000));
			var y = time.getFullYear();//年
			var m = time.getMonth() + 1;//月
			var d = time.getDate();//日
			var h = time.getHours();//时
			var mm = time.getMinutes();//分
			var s = time.getSeconds();//秒
			console.log()
			recharges.studentdata = {
				type: 2,
				loginname: recharges.rechargcard.trim(),
				usertype: recharges.typename,//。用户身份。2教师，3学生
				username: recharges.rechargename.trim(),//。姓名查询
				schoolname: recharges.schoolname.trim(),//。学校名查询
				timefrom: $('#date1').val(),//。起始时间 yyyy-MM-dd
				timeto: $('#date2').val()!==''?y+'-'+m+'-'+d:'',//结束时间 yyyy-MM-dd
				page: recharges.page,
				size: recharges.pagesize,
				token: localStorage.token
			}
			pages(recharges.studentdata);
		},
		exportStudent: function(e) { //导出学生
			$(e.target).prop('href','#');
			$(e.target).prop('href', org_url + dataUrl.downloadReport + '?type=2&loginname='+recharges.rechargcard.trim()+'&schoolname=' + recharges.schoolsVal + '&usertype=' + recharges.typename + '&username=' + recharges.rechargename.trim() + '&timefrom=' + $('#date1').val() + '&timeto=' + $('#date2').val() + '&token=' + localStorage.token);
		},
	}
});

pages();
//分页
function pages(datas) {
	$('#pageToolbar').html('');
	var data = {};
	if(datas) {
		datajson = datas;
	} else {
		datajson = {
			type: 2,
			page: recharges.page,
			size: recharges.pagesize,
			token: localStorage.token
		}
	}
	$.ajax({
		type: "get",
		url: org_url + dataUrl.report+"?time="+new Date().getTime(),
		data: datajson,
		success: function(data) {
			if (data.code=='10010') {
				layer.alert('身份验证失败！请重新登录！',{yes:function(){
					parent.location.href = "../../enter.html";
				},cancel:function(){
					parent.location.href = "../../enter.html";
				}});
				return false;
			}
			recharges.rechargesLists = data.data;
			pagecount = data.total;
			$('#pageToolbar').Paging({
				page:recharges.page,
				pagesize: recharges.pagesize,
				count: pagecount,
				toolbar: true,
				hash: true,
				callback: function(page, size, count) {
//					recharges.pagesize=size;
//					recharges.page=page;
					datajson.page = page;
					datajson.size = size;
					pagesize = size;
					$.ajax({
						type: "get",
						url: org_url + dataUrl.report,
						data: datajson,
						success: function(data) {
							recharges.rechargesLists = data.data;
						}
					});
				},
				changePagesize: function(ps) {
					console.log(datajson)
					datajson.page = 1;
					datajson.size = ps;
					pagesize = ps;
					$.ajax({
						type: "get",
						url: org_url + dataUrl.report,
						data: datajson,
						success: function(data) {
							recharges.rechargesLists = data.data;
						}
					});
				}
			});
		}
	});
}
