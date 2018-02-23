var courseid,stageid,question,knownum,difficultylevel='';
courseid = getUrlParams().courseid;
stageid = getUrlParams().stageid;
id = getUrlParams().id;
console.log(id)

//下拉框知识点树菜单
var setting2 = {
	async: {
		enable: true,
		url: org_url + dataUrl.knowledgetree + "?courseid="+courseid+"&stageid="+stageid+"&token="+localStorage.token+"&time="+new Date().getTime(),
		dataFilter: filter,
		type: 'get'
	},
	view: {
		dblClickExpand: false,
		fontCss: setFontCss
	},
	data: {
		simpleData: {
			enable: true
		}
	},
	callback: {
		onClick: onClick1,
	}
};
function setFontCss(treeId, treeNode) {
	return treeNode.type == 2 ? {color:"#068fe2"} : {};
};
function filter(treeId, parentNode, childNodes) {
	if (!childNodes) return null;
	for (var i=0, l=childNodes.length; i<l; i++) {
		if (childNodes[i].name) {
			childNodes[i].name = childNodes[i].name.replace(/\.n/g, '.');
		} else{
			childNodes[i].name='';
		}
	}
	return childNodes;
}

function hideMenu() {
	$("#menuContent").fadeOut("fast");
	$("body").unbind("mousedown", onBodyDown1);
}
function onBodyDown1(event) {
	if (!(event.target.id == "menuBtn" || event.target.id == "knowledgeName" || event.target.id == "menuContent" || $(event.target).parents("#menuContent").length>0)) {
		hideMenu();
	}
}

////节点树点击
function OnClick(event, treeId, treeNode) {
	console.log(treeNode);
};


question = new Vue({
	el: '#questionMain',
	data:{
		questionoptiondata:'',
		stageid: '', //学段id
		courseid: '', //科目id
		stages: {}, //学段列表
		courses: {}, //科目列表
		question_code: '',  //题目编号
		questiondata: [], //题目数据
		questiontype: '', //题目类型
		knowledges: [], //知识点列表,
		knowledgtreeid: '', //知识点树id
		difficulty: '',   //难度分值
		picked: '',       //题库对象，是老师还是学生
		blockquotetable:false, //题干是否可编辑
		questionoption: '', //题目选项,
		optionstype: '',  //选项类型1=A,2=B,3=C,4=D
		rightanswers:'',   //正确答案
		difficultylevel: '',//难度类型
		type: ''
	},
	beforeCreate:function(){
		//获取所有学段，学科目录
		$.ajax({
			type:"get",
			url: org_url+dataUrl.commons+'?token='+localStorage.token+'&time='+new Date().getTime(),
			success: function(data){
				question.courses = data.courses;
				question.stages = data.stages;
			}
		});
		//根据题目id查询详细信息
		$.ajax({
			type:"get",
			url: org_url+dataUrl.question+id+'?token='+localStorage.token+'&time='+new Date().getTime(),
//			data:{
//				courseid:courseid,
//				stageid:stageid,
//			},
			cache:false, 
			ifModified :true,
			success: function(data){
				if (data.code=='10010') {
					layer.alert('身份验证失败！请重新登录！',{yes:function(){
						parent.location.href = "../../enter.html";
					},cancel:function(){
						parent.location.href = "../../enter.html";
					}});
					return false;
				}
				
				var datas = data[0];
				courseid = datas.courseId;
				stageid = datas.stage;
//				difficultylevel= datas.difficultylevel
//				question.difficultylevel = datas.difficultylevel;
//				Vue.set(question,'difficultylevel',datas.difficultylevel);
//				Vue.nextTick(function(){
//					question.difficultylevel = datas.difficultylevel;
//				})
				$('#nzy').val(datas.difficultylevel);
				$('.stagelist').val(stageid);
				if(datas.options){
					if (datas.options.indexOf(',')>-1) {
						var newoption = JSON.parse(datas.options);
						question.questionoption = newoption;
					}
				}
				question.questionoptiondata = datas;
				question.knowledges = datas.knowledges;
				question.type = datas.type;
				question.rightanswers = datas.answer;
				question.picked = datas.tag;
				
				if(datas.answer=='A'){
					question.optionstype=0;
				}else if(datas.answer=='B'){
					question.optionstype=1;
				}else if(datas.answer=='C'){
					question.optionstype=2;
				}else if(datas.answer=='D'){
					question.optionstype=3;
				}
			}
		})
	},
	methods:{
		//点击每个知识点框对应显示树
		showMenu: function(id){
			question.knowledgtreeid = "#prevknowledgeName"+id;
			var cityObj = $("#prevknowledgeName"+id);
			var cityOffset = $("#prevknowledgeName"+id).offset();
			$("#menuContent").css({left:cityOffset.left + "px", top:cityOffset.top + cityObj.outerHeight() + "px"}).slideDown("fast");
			$("body").bind("mousedown", onBodyDown1);
		},
		//添加知识点
		addKnowledge: function(){
			console.log(stageid)
			$('.stagelist').val(stageid);
			question.knowledges.push({'id':'','title':'请选择知识点'});
		},
		delknowledge: function(index){
			question.knowledges.splice(index,1);
		},
		//添加选项
		addOption:function(){
			if (question.questionoption.length<4) {
				question.questionoption.push('');
			}else{
				layer.alert('最多只能添加4个选项');
			}
		},
		//编辑题干
		editQuestionStems: function(){
			question.blockquotetable = true;
			$('#questionstems').css('background','#eee');
			$('#questionstems').focus();
		},
		//题干失去焦点
		QuestionStemsBlur: function(){
			question.blockquotetable=false;
			$('#questionstems').css('background','#fff');
		},
		//编辑选项
		focusOption: function(event){
			$(event.target).css('background','#eee');
		},
		blurOption: function(e){
			$(event.target).css('background','#fff');
		},
		//删除选项
		delOption: function(e,index){
			var tempindex = 5;
			question.questionoption.splice(index,1);
			switch (question.rightanswers){
				case 'A':
					tempindex = 0;
					break;
				case 'B':
					tempindex = 1;
					break;
				case 'C':
					tempindex = 2;
					break;
				case 'D':
					tempindex = 3;
					break;
				default:
					break;
			}
			if(tempindex == index){
				question.rightanswers = '';
			}
		},
		//设置正确答案
		rightAnswers: function(a){
			question.optionstype = a;
			if (a==0) {
				question.rightanswers = 'A';
			}else if(a==1){
				question.rightanswers = 'B';
			}else if(a==2){
				question.rightanswers = 'C';
			}else if(a==3){
				question.rightanswers = 'D';
			}
		},
		//保存所有内容
		save: function(){
			var knowledgeids=[],options=[],falkonw=false,faloption=false;
			$.each($('.knowledgeids'), function(i,e) {
				knowledgeids.push($(e).attr('data-knowid')*1);
			});
			
			$.each($('.questionoptionlist'), function(i,e) {
				console.log($(e).html())
				if ($(e).html()=='<br>'||$(e).html()=='') {
					faloption = true;
					layer.alert('选项不能为空！');
					return false;
				}
				options.push($(e).html());
			});
			if (faloption) {
				return false;
			}
			if ($('#nzy').val()=='') {
				layer.alert('难度不能为空');
				return false;
			}
			if ($('#questionstems').text()=='') {
				layer.alert('题干不能为空');
				return false;
			}
			if (options.length<2 && options.type=='1') {
				layer.alert('选项不能少于2个');
				return false;
			}
			$.each(knowledgeids, function(i,e) {
				if (e==0) {
					layer.alert('知识点不能为空');
					return false;
				}
			});
			console.log(question.rightanswers)
			if(question.rightanswers==''){
				layer.alert('请选择正确答案！');
				return false;
			}
			
			var data = {
				knowledgeids:knowledgeids, //知识点
				difficultylevel:$('#nzy').val(),//难度类型
				difficulty:question.difficulty,//难度
				answer:question.rightanswers, //正确答案
				analysis:$('#questionanalysis').html(), //解析
				title:$('#questionstems').html(), //题干
				tag:question.picked, //题库对象
				options:options,//选项
				id: id,//id
				type: question.questionoptiondata.type,//题型，单选多项
				scope:1
			}
			console.log(data);
			data = JSON.stringify(data);
			
//			return
			$.ajax({
				"type":"put",
				"url":org_url+dataUrl.question+'?token='+localStorage.token+'&time='+new Date().getTime(),
				"contentType": "application/json",
		        "data": data,
				"success": function(data){
					if (data.result==1) {
						layer.alert('修改成功！', function(){
							window.location.href = 'questionbank.html?courseid='+courseid+'&stageid='+stageid;
						});
					} else {
						layer.alert('修改失败！'+data.msg);
					}
				}
			});
		},
		back: function(e){
			window.location.href = 'questionbank.html?courseid='+courseid+'&stageid='+stageid;
		},
	},
	watch:{
		stages:function(n,o){
			stages = n;
			$.fn.zTree.init($("#treeDemo1"), setting2);
		}
	},
	updated: function(){
		$('.stagelist').val(stageid);
	}
});

function showMenu(id){
	question.knowledgtreeid = "#prevknowledgeName"+id;
	var cityObj = $("#prevknowledgeName"+id);
	var cityOffset = $("#prevknowledgeName"+id).offset();
	$("#menuContent").css({left:cityOffset.left + "px", top:cityOffset.top + cityObj.outerHeight() + "px"}).slideDown("fast");
	$("body").bind("mousedown", onBodyDown1);
};


//树节点点击事件
function onClick1(e, treeId, treeNode) {
	console.log(treeNode)
	var check = (treeNode.type !== 1);
	if (treeNode.type === 1) {
		layer.alert("只能选择知识点,不能选择章和节！");
		return;
	};
	console.log(question.knowledgtreeid)
	$(question.knowledgtreeid).val(treeNode.name);
	$(question.knowledgtreeid).attr({"data-id":treeNode.id,"data-knowid":treeNode.knowid});
	var index = $(question.knowledgtreeid).attr('data-index');
	question.knowledges[index]["title"] = treeNode.name;
	question.knowledges[index]["id"] = treeNode.knowid;
	hideMenu();
}

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

$(function(){
})
