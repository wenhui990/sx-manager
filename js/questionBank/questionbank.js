if (!Array.indexOf) {
    Array.prototype.indexOf = function (obj) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == obj) {
                return i;
            }
        }
        return -1;
    }
}
$(document).ready(function(){
	$('.questionbutton>button').click(function(){
		$(this).addClass('btn-info').siblings().removeClass('btn-info');
	});
	var winheight = $(window).height();
	var offsettop = $('.treeleft').offset().top;
	var treeleftheight = winheight - offsettop;
	$('.treeleft').height(treeleftheight);
});
var page=1,pagesize=10,catalog = [],dataobj={};
var question = new Vue({
	el: '#questionMain',
	data:{
		stageid: '', //学段id
		courseid: '', //科目id
		stages: {}, //学段列表
		courses: {}, //科目列表
		catalogs:[], //面包屑导航数据
		question_code: '',  //题目编号
		questiondata: [], //题目数据
		teacherstudent: '',
		backstageteacher: '',
		questiontype: '',
		editquestionhref: 'edit_question.html?',
		uploadingquestion: '',
		questionNum: 0
	},
	beforeCreate:function(){
		//获取所有学段，学科目录
		$.ajax({
			type:"get",
			url: org_url+dataUrl.commons+'?token='+localStorage.token+'&time='+new Date().getTime(),
			success: function(data){
				if (data.code=='10010') {
					layer.alert('身份验证失败！请重新登录！',{yes:function(){
						parent.location.href = "../../enter.html";
					},cancel:function(){
						parent.location.href = "../../enter.html";
					}});
					return false;
				}
				question.courses = data.courses;
				question.stages = data.stages;
			}
		});
		if (getUrlParams().courseid||getUrlParams().stageid) {
			this.questiondata=[];
			var qdata = {
				courseid:getUrlParams().courseid,
				stageid:getUrlParams().stageid,
				page:sessionStorage.page||page,
				size:sessionStorage.size||pagesize,
			}
			if(sessionStorage.questionkonwledge){
				qdata.knowledgeids=sessionStorage.questionkonwledge;
			}
			//获取全部题目
			$.ajax({
				type:"get",
				url: org_url+dataUrl.questions+"?token="+localStorage.token+'&time='+new Date().getTime(),
				data: qdata,
				success: function(data){
					if (data.code=='10010') {
						layer.alert('身份验证失败！请重新登录！',{yes:function(){
							parent.location.href = "../../enter.html";
						},cancel:function(){
							parent.location.href = "../../enter.html";
						}});
					}
					var newdata = data.data;
//					console.log('newdata',newdata)
					if(newdata){
						$.each(newdata, function(i,e) {
//							console.log(e)
							if (e.options&&e.options.indexOf(',')>-1) {
								var newoption = JSON.parse(e.options);
								e.options = newoption;
							}
						});
					}
					question.courseid = getUrlParams().courseid;
					question.stageid = getUrlParams().stageid;
					question.questiondata=data.data;
					question.questionNum = data.total;
					pages(data.total);
					treeNodes();
				}
			})
		}
	},
	methods:{
		//点击查询
		selectquestion: function(){
//			$('.questionbutton').hide();
			question.questiondata=[];
			sessionStorage.removeItem('questionkonwledge');
			var qurl = '',data={};
			if (question.question_code=='') {
				$('.questionbutton').show();
				qurl = org_url+dataUrl.questions+'?token='+localStorage.token+'&time='+new Date().getTime();
				dataobj = {
					courseid:question.courseid,
					stageid:question.stageid,
					page:page,
					size:pagesize
				}
			}else{
				qurl = org_url+dataUrl.question+question.question_code+'?token='+localStorage.token+'&time='+new Date().getTime();
				dataobj = {
					courseid:question.courseid,
					stageid:question.stageid,
				}
//				if (sessionStorage.questionkonwledge) {
//					dataobj.knowledgeids = sessionStorage.questionkonwledge
//				}
			}
//			dataobj.stageid = getUrlParams().stageid||question.stageid;
//			dataobj.courseid = getUrlParams().courseid||question.courseid;
			$.ajax({
				type:"get",
				url: qurl,
				data:dataobj,
				success: function(data){
					if (data.code=='10010') {
						layer.alert('身份验证失败！请重新登录！',{yes:function(){
							parent.location.href = "../../enter.html";
						},cancel:function(){
							parent.location.href = "../../enter.html";
						}});
						return false;
					}
					console.log(data[0]);
					var newdata = data.data;
					if(newdata){
						$.each(newdata, function(i,e) {
							if (e.options) {
								if (e.options.indexOf(',')>-1) {
									var newoption = JSON.parse(e.options);
									e.options = newoption;
								}
							}
						});
					}
					
					if (question.question_code!='') {
						$.each(data, function(i,e) {
							if (e.options) {
								if (e.options.indexOf(',')>-1) {
									var newoption = JSON.parse(e.options);
									e.options = newoption;
								}
							}
						});
						question.questiondata=data;
						question.questionNum = 1;
					}else{
						question.questiondata=data.data;
						question.questionNum = data.total;
						pages(data.total);
					}
				}
			})
		},
		//筛选题
		teacherStudent: function(id){
			console.log(id)
			dataobj.tag = id;
			questionList('',dataobj);
		},
		backstageTeacher: function(id){
			console.log(id)
			if (id) {
				dataobj.ownerid = id;
			}else{
				delete dataobj.ownerid
			}
			questionList('',dataobj);
		},
		questionType: function(id){
			console.log(id)
			dataobj.type = id;
			questionList('',dataobj);
		},
		//查看解析
		seeAnalysis: function(imgsrc){
			layer.open({
			  type: 1,
			  title:'解析',
			  area: ['75%', '50%'], //宽高
			  content: '<div style="padding:10px 20px">'+imgsrc+'</div>'
			})
		},
		//上传
		upload: function(e){
			if (userAgent().ie>=11.0) {
				if (question.stageid=='') {
					layer.alert('请选择学段!');
					return false;
				}
				if (question.courseid=='') {
					layer.alert('请选择科目!');
					return false;
				}
				console.log(!localStorage.zdid||localStorage.zdid!=localStorage.userid);
				if (!localStorage.zdid||localStorage.zdid!=localStorage.userid) {
					layer.alert('<span class="glyphicon glyphicon-exclamation-sign" style="color:red"></span> 题目的编辑在上传时只支持office2010之前的版本！<br /><br /><label for="zd"><input type="checkbox" id="zd" /> 我已知道</label>',function(i){
						window.location.href = question.uploadingquestion;
					});
				}else{
					window.location.href = question.uploadingquestion;
				}
			}else{
				layer.alert('当前浏览器不支持导入功能，请使用 IE11.0以上浏览器打开！');
			}
		},
		//编辑
		editquestion: function(id,event){
			if (userAgent().ie>=11.0) {
//				question.editquestionhref += ();
				if(getUrlParams().courseid){
					question.courseid = getUrlParams().courseid;
					question.stageid = getUrlParams().stageid;
				}
				question.editquestionhref += "courseid="+question.courseid+"&stageid="+question.stageid+'&id='+id;
				$(event.target).attr('href',question.editquestionhref);
				console.log(question.editquestionhref)
			}else{
				layer.alert('当前浏览器不支持编辑功能，请使用 IE11.0以上浏览器打开！');
			}
		},
		//删除
		delquestion: function(id,event){
			$.ajax({
				type:"delete",
				url:org_url + dataUrl.question+id+'?token='+localStorage.token,
				success: function(data){
					if (data.code=='10010') {
						layer.alert('身份验证失败！请重新登录！',{yes:function(){
							parent.location.href = "../../enter.html";
						},cancel:function(){
							parent.location.href = "../../enter.html";
						}});
						return false;
					}
					if (data.result==1) {
						layer.alert('删除成功！',function(i){
							$(event.target).parents('.questionlist').remove();
							layer.close(i);
							--question.questionNum;
						});
					}else{
						layer.alert('删除失败'+data.msg);
					}
				}
			});
		}
	},
	watch:{
		stageid: function(n,o){
//			if (!getUrlParams().courseid||!getUrlParams().stageid) {
//				question.courseid = '';
//			}
//			sessionStorage.removeItem('questionkonwledge');
			treeNodes(n,'s',false);
		},
		courseid: function(n,o){
//			sessionStorage.removeItem('questionkonwledge');
			treeNodes(n,false,'c');
		}
	},
	mounted: function(){
		if (sessionStorage.catalogs) {
			this.catalogs = JSON.parse(sessionStorage.catalogs);
		}
		
	}
});

//知识点树加载
function treeNodes(n,s,c){
//	question.questiondata=[];
	var csrc='',qsdata={page:page,size:pagesize};
	var data = {
		page: page, 
		size: pagesize
	};
	if (c) {
		question.editvideohref = "edit_video.html?courseid="+n+"&stageid="+question.stageid;
		question.uploadingquestion = "uploading_question.html?courseid="+n+"&stageid="+question.stageid;
		csrc = org_url + dataUrl.knowledgetree+'?token='+localStorage.token+'&stageid='+question.stageid+'&courseid='+n+'&time='+new Date().getTime();
		data.stageid = question.stageid;
		data.courseid = question.courseid;
	}else if(s){
		question.editvideohref = "edit_video.html?courseid="+question.courseid+"&stageid="+n;
		question.uploadingquestion = "uploading_question.html?courseid="+question.courseid+"&stageid="+n;
		csrc = org_url + dataUrl.knowledgetree+'?token='+localStorage.token+'&courseid='+question.courseid+'&stageid='+n+'&time='+new Date().getTime();
		data.stageid = question.stageid;
		data.courseid = question.courseid;
	}else{
		csrc = org_url + dataUrl.knowledgetree+'?token='+localStorage.token+'&courseid='+getUrlParams().courseid+'&stageid='+getUrlParams().stageid+'&time='+new Date().getTime();
		data.stageid = getUrlParams().stageid;
		data.courseid = getUrlParams().courseid;
	}
	var treenodejson = treeDatas(csrc);
	$.fn.zTree.init($("#treeDemo"), setting, treenodejson);
	var newtree = jsonsData();
	for (var i=0;i<newtree.length;i++) {
		if (newtree[i].level==1||newtree[i].level==0) {
			newtree[i].open = true;
		}
	}
//	console.log('newtree',newtree)
	if (sessionStorage.questionkonwledge) {
		data.knowledgeids=sessionStorage.questionkonwledge;
	}
	
	
	$.fn.zTree.init($("#treeDemo"), setting, newtree);
	questionList('',data);
//	console.log('treenodejson',treenodejson)
	console.log('newtree',newtree)
	if (sessionStorage.tid) {
		$('#'+sessionStorage.tid+'_a').addClass('curSelectedNode');
	}
}


//分页
function pages(tatal) {
	$('#pageToolbar').html('');
	dataobj.page = page;
	dataobj.size = pagesize;
	dataobj.stageid = question.stageid;
	dataobj.courseid = question.courseid;
	$('#pageToolbar').Paging({
		pagesize: pagesize,
		count: tatal,
		toolbar: false,
		callback: function(p, size, count) {
			question.questiondata=[];
			dataobj.page = p;
			dataobj.size = size;
			pagesize = size;
			sessionStorage.page = dataobj.page;
			sessionStorage.pageSize = dataobj.size;
			if (sessionStorage.questionkonwledge) {
				dataobj.knowledgeids = sessionStorage.questionkonwledge;
			}
			console.log(dataobj)
			$.ajax({
				type: "get",
				url: org_url+dataUrl.questions+'?token='+localStorage.token+'&time='+new Date().getTime(),
				data: dataobj,
				success: function(data){
					if (data.code=='10010') {
						layer.alert('身份验证失败！请重新登录！',{yes:function(){
							parent.location.href = "../../enter.html";
						},cancel:function(){
							parent.location.href = "../../enter.html";
						}});
						return false;
					}
					var newdata = data.data;
					if(newdata){
						$.each(newdata, function(i,e) {
							console.log(e.options)
							if(e.options){
								if (e.options.indexOf(',')>-1) {
									var newoption = JSON.parse(e.options);
									e.options = newoption;
								}
							}
						});
					}
					question.questiondata=data.data;
					question.questionNum = data.total;
//					pages(data.total);
				}
			})
		}
	});
}
//ztree树形菜单
var setting = {
//	async: {
//		enable: true,
//		url: org_url + dataUrl.knowledgetree+"?token="+localStorage.token,
//		autoParam:["id", "name=n", "level=lv"],
//		otherParam:{"otherParam":"zTreeAsyncTest"},
//		dataFilter: filter,
//		type: 'get'
//	},
	view: {
		expandSpeed:"",
		selectedMulti: false,
		fontCss: setFontCss
	},
	data: {
		simpleData: {
			enable: true
		}
	},
	callback: {
		onClick:OnClick
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

////节点树点击
function OnClick(event, treeId, treeNode) {
	if(sessionStorage.tid){
		$('#'+sessionStorage.tid+'_a').removeClass('curSelectedNode');
		sessionStorage.removeItem('tid');
	}
	
	console.log(treeNode)
	if (treeNode.level>0) $('.questionbutton').show();
	$('.questionbutton>button').removeClass('btn-info');
	question.teacherstudent='';
	question.backstageteacher='';
	question.questiontype='';
	var id=[],type;
	catalog =[];
	if (treeNode.level >= 0) {
		id.push(treeNode.id.substring(1)*1);
		if (treeNode.children) {
			$.each(treeNode.children, function(i,e) {
				id.push(e.id.substring(1)*1);
				if(e.children){
					$.each(e.children, function(f,ev) {
						if(ev.children){
							$.each(ev.children, function(g,eve) {
								id.push(eve.id.substring(1)*1);
							});
						}else{
							id.push(ev.id.substring(1)*1);
						}
					});
				}
			});
		}
	}
	dataobj = {
		knowledgeids: JSON.stringify(id),
		page:page,
		size:pagesize,
		courseid:question.courseid,
		stageid:question.stageid,
	}
	if (treeNode.level == 0) {
		delete dataobj.knowledgeids;
	}else{
		sessionStorage.questionkonwledge = dataobj.knowledgeids;
	}
	
	sessionStorage.tid = treeNode.tId;
	console.log(dataobj.knowledgeids)
	if(treeNode.level==0){
		delete dataobj.knowledgeids;
		sessionStorage.removeItem('questionkonwledge');
		catalog.push(treeNode.name);
		questionList(catalog,dataobj);
	}else if (treeNode.level==1) {
		catalog.push(treeNode.name);
		catalog.push(treeNode.getParentNode().name);
		questionList(catalog,dataobj)
	}else if(treeNode.level==2){
		catalog.push(treeNode.name);
		catalog.push(treeNode.getParentNode().name);
		catalog.push(treeNode.getParentNode().getParentNode().name);
		questionList(catalog,dataobj)
	}else if (treeNode.level==3) {
		catalog.push(treeNode.name);
		catalog.push(treeNode.getParentNode().name);
		catalog.push(treeNode.getParentNode().getParentNode().name);
		catalog.push(treeNode.getParentNode().getParentNode().getParentNode().name);
		questionList(catalog,dataobj)
	}else if(treeNode.level==4){
		catalog.push(treeNode.name);
		catalog.push(treeNode.getParentNode().name);
		catalog.push(treeNode.getParentNode().getParentNode().name);
		catalog.push(treeNode.getParentNode().getParentNode().getParentNode().name);
		catalog.push(treeNode.getParentNode().getParentNode().getParentNode().getParentNode().name);
		questionList(catalog,dataobj)
	}
};
//题目列表数据
function questionList(catalog,data){
	question.questiondata=[];
	if (catalog!='') {
		question.catalogs = catalog.reverse();
		sessionStorage.catalogs = JSON.stringify(question.catalogs);
	}
	data.knowledgeids = sessionStorage.questionkonwledge||data.knowledgeids;
	$.ajax({
		type: "get",
		url: org_url+dataUrl.questions+'?token='+localStorage.token+'&time='+new Date().getTime(),
		data: data,
		success: function(data){
			if (data.code=='10010') {
				layer.alert('身份验证失败！请重新登录！',{yes:function(){
					parent.location.href = "../../enter.html";
				},cancel:function(){
					parent.location.href = "../../enter.html";
				}});
				return false;
			}
			var newdata = data.data;
			if(newdata){
				$.each(newdata, function(i,e) {
					if (e.options) {
						if (e.options.indexOf(',')>-1) {
							var newoption = JSON.parse(e.options);
							e.options = newoption;
						}
					}
				});
			}
			question.questiondata=data.data;
			question.questionNum = data.total;
			pages(data.total);
		}
	})
}

//判断浏览器
function userAgent(){
	var Sys = {};
    var ua = navigator.userAgent.toLowerCase();
    var s;
    (s = ua.match(/rv:([\d.]+)\) like gecko/)) ? Sys.ie = s[1] :
    (s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] :
    (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] :
    (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] :
    (s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] :
    (s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;
	return Sys;
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
//取到树结构的数据
function jsonsData() {
	var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
	var nodes = treeObj.getNodes();
	var jsonObjs = []; //树状图的所有数据
	(function jsonsObj(nodes) {
		$.each(nodes, function(i, e) {
			var jsonNode = {};
			jsonNode.id = e.id;
			jsonNode.level = e.level;
			jsonNode.name = e.name;
			jsonNode.pId = e.pId;
			jsonNode.tId = e.tId;
			jsonNode.index = e.getIndex();
			jsonNode.open = e.open;
			jsonNode.previa = e.previa;
			jsonNode.code = e.code;
			jsonObjs.push(jsonNode);
			jsonObjs.dropInner = false;
			jsonNode.type = e.type;
			if(e.children) {
				jsonsObj(e.children);
			}
		});
	})(nodes);
	return jsonObjs;
}
//获取树结构数据
function treeDatas(src){
	var treedata;
	$.ajax({
		type:"get",
		url:src,
		async:false,
		success: function(data){
			treedata =  data;
		}
	});
	return treedata;
}
$(document).on('click','#zd',function(){
	localStorage.zdid = localStorage.userid;
	console.log(localStorage.zdid)
})
