$(document).ready(function(){
	$('.questionbutton>button').click(function(){
		$(this).addClass('btn-info').siblings().removeClass('btn-info');
	});
	var winheight = $(window).height();
	var offsettop = $('.treeleft').offset().top;
	var treeleftheight = winheight - offsettop;
	$('.treeleft').height(treeleftheight);
	var imgwh = $('.rightcontent').width()/3-30;
	var newheight = imgwh*188/268;
	console.log(imgwh+'===='+newheight);
	videos.imgwh = newheight;
//	treeNodes();
});

var page=1,pagesize=9,catalog = [],dataobj={};
var videos = new Vue({
	el: '#videoMain',
	data:{
		stageid: 3, //学段id
		courseid: 0, //科目id
		stages: {}, //学段列表
		courses: {}, //科目列表
		catalogs:[], //面包屑导航数据
		videoname: '',  //查询条件
		videodata: [], //微课数据
		videoNum: 0,  //微课数量
		editvideohref: 'edit_video.html?',
		uploadingvideo: '',  //上传url赋值
		imgwh: '',  //计算图片高度
		videoimg: 'http://linktrust-zsyimg.oss-cn-beijing.aliyuncs.com/37/8c014e707eaaf2ebf61cc32044b27d76.png',
		treejson: '',  //tree的数据
		star: ''
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
				videos.courses = data.courses;
				videos.stages = data.stages;
				delete videos.stages[0];
				if (getUrlParams().courseid||getUrlParams().stageid) {
					videos.courseid = getUrlParams().courseid;
					videos.stageid = getUrlParams().stageid;
				}else{
					videos.courseid = 1;
				}
			}
		});
	},
	methods:{
		//点击查询
		selectquestion: function(){
			var data = {
				courseid:videos.courseid,
				stageid:videos.stageid,
				page:page,
				size:pagesize
			}
			if (videos.videoname==''&&videos.stageid==''&&videos.courseid=='') {
				layer.alert('请输入要查询的关键字');
				return false;
			}else{
				data.title = videos.videoname.trim();
			}
			getDatas(data);
		},
		backstageTeacher: function(id){
			console.log(id)
			dataobj.type = id;
			dataobj.title = videos.videoname;
			videoLists('',dataobj);
		},
		//上传
		upload: function(e){
			if (videos.stageid=='') {
				layer.alert('请选择学段!');
				return false;
			}
			if (videos.courseid=='') {
				layer.alert('请选择科目!');
				return false;
			}
			$(e.target).attr('href',videos.uploadingvideo);
		},
		//编辑
		eidtVideo: function(id,event){
//			if (userAgent().ie>=11.0) {
//				videos.editvideohref += ();
				if(getUrlParams().courseid){
					videos.courseid = getUrlParams().courseid;
					videos.stageid = getUrlParams().stageid;
				}
				videos.editvideohref += "courseid="+videos.courseid+"&stageid="+videos.stageid+'&id='+id;
//				$(event.target).attr('href',videos.editvideohref);
				window.location.href = videos.editvideohref;
				console.log(videos.editvideohref)
//			}else{
//				layer.alert('当前浏览器不支持编辑功能，请使用 IE11.0以上浏览器打开！');
//			}
		},
		//删除
		delVideo: function(title,id,e){
			layer.confirm('是否确定删除'+title+'？',function(){
				$.ajax({
					type:"delete",
					url:org_url + dataUrl.video+id+'?token='+localStorage.token+'&time='+new Date().getTime(),
					success: function(data){
						if (data.code=='10010') {
							layer.alert('身份验证失败！请重新登录！',{yes:function(){
								parent.location.href = "../../enter.html";
							},cancel:function(){
								parent.location.href = "../../enter.html";
							}});
							return false;
						}
						if (data.result==1||data==1) {
							layer.alert('删除成功！',function(i){
								$(e.target).parents('.videolist').remove();
								--videos.videoNum;
								layer.close(i);
							});
						}else{
							layer.alert('删除失败'+data.msg);
						}
					}
				});
			},function(){
				layer.close();
			});
		}
	},
	watch:{
		stageid: function(n,o){
			treeNodes(n,'s',false)
		},
		courseid: function(n,o){
			n?treeNodes(n,false,'c'):treeNodes(o,false,'c');
		}
	}
});

function getDatas(data){
	delete dataobj.knowledgeids;
	$.ajax({
		type:"get",
		url: org_url+dataUrl.videos+'?token='+localStorage.token+'&time='+new Date().getTime(),
		data:data,
		success: function(data){
			if (data.code=='10010') {
				layer.alert('身份验证失败！请重新登录！',{yes:function(){
					parent.location.href = "../../enter.html";
				},cancel:function(){
					parent.location.href = "../../enter.html";
				}});
				return false;
			}
	//					console.log(data.data);
	//					var newdata = data.data;
			videos.videodata=data.data;
			videos.videoNum = data.total;
			pages(data.total);
		}
	})
}

//知识点树加载
function treeNodes(n,s,c){
	var csrc='';
	if (c) {
		videos.editvideohref = "edit_video.html?courseid="+n+"&stageid="+videos.stageid;
		videos.uploadingvideo = "upload_video.html?courseid="+n+"&stageid="+videos.stageid;
		csrc = org_url + dataUrl.knowledgetree+'?token='+localStorage.token+'&stageid='+videos.stageid+'&courseid='+n;
	}else if(s){
		videos.editvideohref = "edit_video.html?courseid="+videos.courseid+"&stageid="+n;
		videos.uploadingvideo = "upload_video.html?courseid="+videos.courseid+"&stageid="+n;
		csrc = org_url + dataUrl.knowledgetree+'?token='+localStorage.token+'&courseid='+videos.courseid+'&stageid='+n;
	}else{
		csrc = org_url + dataUrl.knowledgetree+'?token='+localStorage.token+'&courseid='+(getUrlParams().courseid||videos.courseid)+'&stageid='+(getUrlParams().stageid||3);
	}
	var treenodejson = treeDatas(csrc);
	var dataobj = [];
	$.fn.zTree.init($("#treeDemo"), setting, treenodejson);
	var newtree = jsonsData();
	console.log(newtree)
	for (var i=0;i<newtree.length;i++) {
		if (newtree[i].level==1||newtree[i].level==0) {
			newtree[i].open = true;
		}
	}
//	for(var i=0;i<10;i++){
//		if (newtree[i].id) {
//			dataobj.push(newtree[i].id.substring(1));
//		}
//	}
	console.log(dataobj)
	var data = {page:page,size:pagesize,courseid:videos.courseid,stageid:videos.stageid};
	$.fn.zTree.init($("#treeDemo"), setting, newtree);
	videoLists('',data);
	console.log(treenodejson)
}

//分页
function pages(tatal) {
	$('#pageToolbar').html('');
	dataobj.page = page;
	dataobj.size = pagesize;
	$('#pageToolbar').Paging({
		pagesize: pagesize,
		count: tatal,
		toolbar: false,
		callback: function(p, size, count) {
			dataobj.page = p;
			dataobj.size = size;
			pagesize = size;
			$.ajax({
				type: "get",
				url: org_url+dataUrl.videos+'?token='+localStorage.token+'&time='+new Date().getTime(),
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
					videos.videodata=data.data;
					videos.videoNum = data.total;
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
//		onAsyncSuccess: zTreeOnAsyncSuccess,
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
	console.log(treeNode)
	if (treeNode.level>0) {
		$('.questionbutton').show();
		$('#templi').hide();
	}else{
		var data0 = {
			courseid:videos.courseid,
			stageid:videos.stageid,
			page:page,
			size:pagesize
		}
		getDatas(data0);
	}
	var id=[],type;
	catalog =[];
	if (treeNode.level >= 1) {
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
//	if (treeNode.level == 1) {
//		if (treeNode.children) {
//			$.each(treeNode.children, function(i,e) {
//				if(e.children){
//					$.each(e.children, function(f,ev) {
//						if(ev.children){
//							$.each(ev.children, function(g,eve) {
//								id.push(eve.id.substring(1));
//							});
//						}else{
//							id.push(ev.id.substring(1));
//						}
//					});
//				}
//			});
//		}
//	}
//	if (treeNode.level == 2) {
//		if (treeNode.children) {
//			$.each(treeNode.children, function(i,e) {
//				id.push(e.id.substring(1));
//			});
//		}
//	}
//	if (treeNode.level == 3) {
//		id.push(treeNode.id.substring(1));
//	}
	
	if (id.length) {
		dataobj = {
			knowledgeids: JSON.stringify(id),
			page:page,
			size:pagesize
		}
	}
	if (treeNode.level==1) {
		catalog.push(treeNode.name);
		catalog.push(treeNode.getParentNode().name);
		videoLists(catalog,dataobj)
	}else if(treeNode.level==2){
		catalog.push(treeNode.name);
		catalog.push(treeNode.getParentNode().name);
		catalog.push(treeNode.getParentNode().getParentNode().name);
		videoLists(catalog,dataobj)
	}else if (treeNode.level==3) {
		catalog.push(treeNode.name);
		catalog.push(treeNode.getParentNode().name);
		catalog.push(treeNode.getParentNode().getParentNode().name);
		catalog.push(treeNode.getParentNode().getParentNode().getParentNode().name);
		videoLists(catalog,dataobj)
	}else if (treeNode.level==4) {
		catalog.push(treeNode.name);
		catalog.push(treeNode.getParentNode().name);
		catalog.push(treeNode.getParentNode().getParentNode().name);
		catalog.push(treeNode.getParentNode().getParentNode().getParentNode().name);
		catalog.push(treeNode.getParentNode().getParentNode().getParentNode().getParentNode().name);
		videoLists(catalog,dataobj)
	}
};
//视频列表数据
function videoLists(catalog,data){
	videos.videodata = [];
	if (catalog!='') {
		videos.catalogs = catalog.reverse();
	}
	
	$.ajax({
		type: "get",
		url: org_url+dataUrl.videos+'?token='+localStorage.token+'&time='+new Date().getTime(),
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
			videos.videodata=data.data;
			videos.videoNum = data.total;
			pages(data.total);
		}
	})
}
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
	$.each(treedata, function(i,e) {
		if (e.type==2) {
			e.icon = '../../images/3.png'
		}
	});
	return treedata;
}
