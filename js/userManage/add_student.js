//获取url中字段
function getUrlParams() {
	var params = {};
	var url = window.location.href;
	var idx = url.indexOf("?");
	if(idx > 0) {
		var queryStr = url.substring(idx + 1);
		var args = queryStr.split("&");
		for(var i = 0, a, nv; a = args[i]; i++) {
			nv = args[i] = a.split("=");
			params[nv[0]] = nv.length > 1 ? nv[1] : true;
		}
	}
	return params;
};

var stuid = getUrlParams().id,
	stusee = getUrlParams().see,
	stuedit = getUrlParams().edit,
	allclazzs;

//json数组去重
Array.prototype.removeRepeatAttr = function() {
	var tmp = {},
		a = this.slice();
	for(var i = j = 0; i < a.length; i++) {
		if(!tmp[a[i].id]) {
			tmp[a[i].id] = !0;
			j++;
		} else {
			this.splice(j, 1);
		}
	};
}

var students = new Vue({
	el: '#studentAdd',
	data: {
		schools: null,
		grades: null,
		classs: null,
		schoolsVal: null,
		gradeVal: null,
		classVal: null,
		relationone: null,
		relationtwo: null,
		student_name: null, //学生姓名
		student_ID: null, //身份证号
		studentSex: null, //性别
		student_birth: null, //出生日期
		into_school_date: null, //入校时间
		pnameone: null, //家长一姓名
		pphoneone: null, //家长一电话
		relationone: null, //家长一和学生关系
		relationtwo: null, //家长二和学生关系
		pnametwo: null, //家长二姓名
		pphonetwo: null //家长二电话
	},
	//	beforeCreate: function() {
	//		var _self = this;
	//		
	//	},
	methods: {
		changeschool: function(e) {
			//			console.log(n + '----' + o);
			//			if ($(e.target).val()=='') {
			students.gradeVal = '';
			students.classVal = '';
			//			}
			//			if (n!==undefined) {
			getGradeClass($(e.target).val());
			//			}
		}
	},
	watch: {
		gradeVal: function(n, o) {
			students.classs = allclazzs;
			console.log(n + '----' + o);
			var len = students.classs.length,
				tempclass = [];
			for(var i = 0; i < len; i++) {
				if(students.classs[i]['pid'] == n) {
					tempclass.push(students.classs[i]);
				}
			}
			students.classs = tempclass;
		}
	}
});

function getGradeClass(n) {

	$.ajax({
		type: "get",
		url: org_url + dataUrl.clazzs+"?time="+new Date().getTime(),
		data: {
			schoolid: n,
			token: localStorage.token
		},
		async: false,
		success: function(data) {
			var gdatas = [];
			var cdatas = [];
			for(var i = 0; i < data.length; i++) {
				var gradedata = {};
				var classdata = {};
				gradedata.id = data[i].gradeid;
				gradedata.name = data[i].gradename;
				gdatas.push(gradedata);
				classdata.pid = data[i].gradeid;
				classdata.id = data[i].id;
				classdata.name = data[i].name;
				cdatas.push(classdata);
			}
			gdatas.removeRepeatAttr();
			allclazzs = cdatas;
			students.grades = gdatas;
//			students.classs = cdatas;
			//			students.schoolsVal = n;
			//			students.gradeVal = '';
			//			students.classVal = '';
		}
	})
}

function getTime(d) {
	var now = new Date(d),
		yy = now.getFullYear(),
		mm = now.getMonth() + 1,
		dd = now.getDate(),
		h = now.getHours(),
		m = now.getMinutes(),
		s = now.getSeconds(),
		ms = now.getMilliseconds();
	return(yy + "-" + mm + "-" + dd);
}
if(stuid && stusee) { //查看学生
	console.log(stuid + '===' + stusee)
	$('.resetpassword').show().prev().hide();
	$('.save').hide();
	//	$('input').prop('readonly',true);
	$('select,input').prop('disabled', true);
}

//重置密码
function resetpassword() {
	$.ajax({
		url: org_url + dataUrl.resetpass + stuid + '/password' + '?token=' + localStorage.token,
		type: 'put',
		success: function(data) {
			if(data.result == 1) {
				layer.alert('重置成功！');
			} else {
				layer.alert('重置失败！');
			}
		},
		error: function(data) {
			layer.alert('网络错误！重置失败！')
		}
	})
}
//加载学校列表
$.ajax({
	type: "get",
	url: org_url + dataUrl.schools + '?token=' + localStorage.token+'&time='+new Date().getTime(),
	async: false,
	success: function(data) {
		if(data.code == '10010') {
			layer.alert('身份验证失败！请重新登录！', {
				yes: function() {
					parent.location.href = "../../enter.html";
				},
				cancel: function() {
					parent.location.href = "../../enter.html";
				}
			});
			return false;
		}
		
		students.schools = data.data;
	}
});


function IdentityCodeValid(code) {
	var city = {
		11: "北京",
		12: "天津",
		13: "河北",
		14: "山西",
		15: "内蒙古",
		21: "辽宁",
		22: "吉林",
		23: "黑龙江 ",
		31: "上海",
		32: "江苏",
		33: "浙江",
		34: "安徽",
		35: "福建",
		36: "江西",
		37: "山东",
		41: "河南",
		42: "湖北 ",
		43: "湖南",
		44: "广东",
		45: "广西",
		46: "海南",
		50: "重庆",
		51: "四川",
		52: "贵州",
		53: "云南",
		54: "西藏 ",
		61: "陕西",
		62: "甘肃",
		63: "青海",
		64: "宁夏",
		65: "新疆",
		71: "台湾",
		81: "香港",
		82: "澳门",
		91: "国外 "
	};
	var tip = "";
	var pass = true;
	if(!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)) {
		tip = "身份证号格式错误";
		pass = false;
	} else if(!city[code.substr(0, 2)]) {
		tip = "地址编码错误";
		pass = false;
	} else {
		//18位身份证需要验证最后一位校验位
		if(code.length == 18) {
			code = code.split('');
			//∑(ai×Wi)(mod 11)
			//加权因子
			var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
			//校验位
			var parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
			var sum = 0;
			var ai = 0;
			var wi = 0;
			for(var i = 0; i < 17; i++) {
				ai = code[i];
				wi = factor[i];
				sum += ai * wi;
			}
			var last = parity[sum % 11];
			if(parity[sum % 11] != code[17]) {
				tip = "校验位错误";
				pass = false;
			}
		}
	}
	if(!pass) layer.alert(tip);
	return pass;
}
function updStudentPassword(){
   window.location.href = "student_password_edit.html?id="+stuid;
}
$(function() {
	if(stuid) {
		$.ajax({
			type: "get",
			url: org_url + dataUrl.student + stuid + "?token=" + localStorage.token+"&time="+new Date().getTime(),
			async: false,
			success: function(data) {
				if(data[0].isSuperManager==1){
					if(!getUrlParams().see){
						$("#changePas").show();
					}
				}
				getGradeClass(data[0].school);
				//			getGradeClass(data[0].school,false);
				students.student_name = data[0].name; //学生姓名
				students.student_ID = data[0].idcard; //身份证号
				students.studentSex = data[0].sex; //性别
				students.student_birth = data[0].birth ? getTime(data[0].birth) : ''; //出生日期
				students.into_school_date = data[0].regTime ? getTime(data[0].regTime) : ''; //入校时间
				students.schoolsVal = data[0]['school'];
				students.gradeVal = data[0].grade;
				students.classVal = data[0].clazz;
				if(data[0].parentstr[0]) {
					students.pnameone = data[0].parentstr[0].name; //家长一姓名
					students.pphoneone = data[0].parentstr[0].phone; //家长一电话
					students.relationone = data[0].parentstr[0].relation ? data[0].parentstr[0].relation : '';
				}
				if(data[0].parentstr[1]) {
					students.relationtwo = data[0].parentstr[1].relation;
					students.pnametwo = data[0].parentstr[1].name; //家长二姓名
					students.pphonetwo = data[0].parentstr[1].phone; //家长二电话
				}
			}
		})
	}
	//时间
	$(".form_datetime").datetimepicker({
		format: "yyyy-MM-dd",
		minView: "month",
		language: 'zh-CN',
		todayBtn: true
	});
	$(".form_datetime1").datetimepicker({
		format: "yyyy-MM-dd",
		minView: "month",
		language: 'zh-CN',
		todayBtn: true
	});

	var isphone = true;
	//验证手机号
	$('#patriarch1_phone,#patriarch2_phone').blur(function() {
		var phone = $(this);
		if(phone.val().length > 0) {
			if(!(/^1[34578]\d{9}$/.test(phone.val()))) {
				layer.alert("手机号码有误，请重填",{
					yes:function(i){
						layer.close(i);
						phone.focus();
					},
					cancel:function(i){
						layer.close(i);
						phone.focus();
					}
				});
				isphone = false;
			} else {
				isphone = true;
				if($('#patriarch1_name').val() == '' && $(this).attr('id') == 'patriarch1_phone') {
					layer.msg('请输入家长一姓名',function(i){
						layer.close(i);
						$('#patriarch1_name').focus();
					});
					
				}
				if($('#patriarch2_name').val() == '' && $(this).attr('id') == 'patriarch2_phone') {
					layer.msg('请输入家长二姓名',function(i){
						layer.close(i);
						$('#patriarch2_name').focus();
					});
				}
			}
		}
	});

	//验证身份证号码
	$('#student_ID').blur(function() {
		if($(this).val().length>0){
			IdentityCodeValid($(this).val().replace(/x/,'X'));
		}
	});

	//点击新建保存     // 编辑保存学生
	$('.save').click(function() {
		//获取当前页面的元素值
		var student_name = $('#student_name').val(), //学生姓名
			gradeLists = $('.gradeLists').val(), //所在年级
			schoolLists = $('.schoolLists').val(); //所在学校
		classGradeLists = $('.classGradeLists').val(), //所在班级
			student_ID = $('#student_ID').val(), //身份证号
			studentSex = $('.studentSex').val() || "", //性别
			student_birth = $('#student_birth').val() || "", //出生日期
			into_school_date = $('#into_school_date').val() || "", //入校时间
			pnameone = $('#patriarch1_name').val() || "", //家长一姓名
			pphoneone = $('#patriarch1_phone').val() || "", //家长一电话
			relationone = $('input[name="student_relation1"]:checked').val(), //家长一和学生关系
			relationtwo = $('input[name="student_relation2"]:checked').val(), //家长二和学生关系
			pnametwo = $('#patriarch2_name').val() || "", //家长二姓名
			pphonetwo = $('#patriarch2_phone').val() || ""; //家长二电话

		var studentJson = {
			name: student_name,
			school: students.schoolsVal,
			clazz: students.classVal,
			grade: students.gradeVal,
			birth: student_birth,
			inschooltime: into_school_date,
			idcard: student_ID,
			sex: studentSex
		};
		if(student_name == "") {
			layer.alert('请输入学生姓名', function(index) {
				layer.close(index);
				$('#student_name').focus();
			});
			return false;
		} else if(schoolLists == "") {
			layer.alert('请选择学校');
			return false;
		} else if(gradeLists == "") {
			layer.alert('请选择年级');
			return false;
		} else if(classGradeLists == "") {
			layer.alert('请选择班级');
			return false;
		} else if(student_ID == "") {
			layer.alert('请输入身份证号', function(index) {
				layer.close(index);
				$('#student_ID').focus();
			});
			return false;
		}
		
		var flaId = IdentityCodeValid(student_ID.replace(/x/,'X'));
		
		if(!flaId){
			return false;
		}
		if(isphone) {
			if($('#patriarch1_name').val() == '' && $(this).attr('id') == 'patriarch1_phone') {
				layer.msg('请输入家长一姓名');
				$('#patriarch1_name').focus();
				return false;
			}
			if($('#patriarch2_name').val() == '' && $(this).attr('id') == 'patriarch2_phone') {
				layer.msg('请输入家长二姓名');
				$('#patriarch2_name').focus();
				return false;
			}
			studentJson.pnameone = pnameone;
			studentJson.pphoneone = pphoneone;
			studentJson.relationone = relationone;
			studentJson.pnametwo = pnametwo;
			studentJson.pphonetwo = pphonetwo;
			studentJson.relationtwo = relationtwo;
			//			studentJson.token = localStorage.token;
		}
		if ($('#patriarch1_name').val()!=''&&$('#patriarch1_phone').val()=='') {
			layer.alert('家长1的手机号不能为空！',function(i){
				layer.close(i);
				$('#patriarch1_phone').focus();
			});
			return false;
		}
		if ($('#patriarch2_name').val()!=''&&$('#patriarch2_phone').val()=='') {
			layer.alert('家长2的手机号不能为空！',function(i){
				layer.close(i);
				$('#patriarch2_phone').focus();
			});
			return false;
		}
		if($('#patriarch1_phone').val()!=''){
			
		}
		if(stuid) studentJson.id = stuid;
		$.ajax({
			type: stuid ? "put" : "post",
			url: stuid ? org_url + dataUrl.student + '?token=' + localStorage.token : org_url + dataUrl.student + '?token=' + localStorage.token,
			contentType: "application/json",
			data: JSON.stringify(studentJson),
			success: function(data) {
				if(data == 1) {
					if(stuid) {
						layer.alert('修改成功！', function() {
							window.location.href = 'student_list.html';
						})
					} else {
						layer.alert('新建成功！', function() {
							window.location.href = 'student_list.html';
						})
					}
				} else {
					layer.alert(data.msg);
				}

			}
		});

	});

	//点击返回
	$('.back').click(function() {
		$('.see_student_bar', window.parent.document).remove();
		window.location.href = 'student_list.html';
	});

});