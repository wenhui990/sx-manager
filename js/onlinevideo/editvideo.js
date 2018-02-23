var courseid,stageid,question,knownum;
courseid = getUrlParams().courseid;
stageid = getUrlParams().stageid;
id = getUrlParams().id;
console.log(id)
var oldvideosrc,oldknowledges,oldvideoname,oldvideocrowd,oldobjectives,oldcoursedesc,oldteachername,oldteacherdesc,oldvideoprice,oldvideoimgsrc;
//下拉框知识点树菜单
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


videos = new Vue({
	el: '#videoMain',
	data:{
		videodata:'',
		stageid: '', //学段id
		courseid: '', //科目id
		stages: {}, //学段列表
		courses: {}, //科目列表
		knowledges: '', //知识点列表,
		knowledgtreeid: '', //知识点树id
		picked: 'S', //题库对象，是老师还是学生
		videoname: '', //微课名称
		videocrowd: '', //适用人群
		objectives: '', //学习目标
		coursedesc: '', //课程介绍
		teachername: '', //讲师姓名
		teacherdesc: '', //讲师介绍
		videoprice: 0, //微课价格
		videoimgsrc: 'http://linkpad.oss-cn-beijing.aliyuncs.com/27-f2ba784883b8c271a792091c2383f73c-lingxinvideoimg.png',//微课图片
		videosrc: '', //微课视频
		videosrcname: '',
		duration:'',
		changetxt: false
	},
	beforeCreate:function(){
		//获取所有学段，学科目录
		$.ajax({
			type:"get",
			url: org_url+dataUrl.commons+'?token='+localStorage.token+'&time='+new Date().getTime(),
			success: function(data){
				videos.courses = data.courses;
				videos.stages = data.stages;
			}
		});
		//根据题目id查询详细信息
		$.ajax({
			type:"get",
			url: org_url+dataUrl.video+id+'?token='+localStorage.token+'&time='+new Date().getTime(),
			data:{
				courseid:courseid,
				stageid:stageid,
			},
			success: function(data){
				if (data.code=='10010') {
					layer.alert('身份验证失败！请重新登录！',{yes:function(){
						parent.location.href = "../../enter.html";
					},cancel:function(){
						parent.location.href = "../../enter.html";
					}});
					return false;
				}
				
				oldknowledges = data.knowledgeinfo;
				oldvideoname = data.title;
				oldvideocrowd = data.target;
				oldobjectives = data.aims;
				oldcoursedesc = data.desc;
				oldteachername = data.author;
				oldteacherdesc = data.authordesc;
				oldvideoprice = data.coins;
				oldvideoimgsrc = data.cover;
				oldvideosrc = data.path;
				
				videos.videosrc = data.path;
				videos.knowledges = data.knowledgeinfo;
				videos.stageid = stageid||data.stageid;
				videos.courseid = courseid||data.courseid;
				videos.videoname = data.title; //微课名称
				videos.videocrowd = data.target; //适用人群
				videos.objectives = data.aims; //学习目标
				videos.coursedesc = data.desc; //课程介绍
				videos.teachername = data.author; //讲师姓名
				videos.teacherdesc = data.authordesc; //讲师介绍
				videos.videoprice = data.coins;  //微课价格
				videos.videoimgsrc = data.cover;
				videos.videosrcname = data.path;
//				videos.duration = data.videos;
			}
		})
	},
	methods:{
		//点击每个知识点框对应显示树
		showMenu: function(id){
			videos.knowledgtreeid = "#prevknowledgeName"+id;
			console.log(videos.knowledgtreeid)
			var cityObj = $("#prevknowledgeName"+id);
			var cityOffset = $("#prevknowledgeName"+id).offset();
			$("#menuContent").css({left:cityOffset.left + "px", top:cityOffset.top + cityObj.outerHeight() + "px"}).slideDown("fast");
			$("body").bind("mousedown", onBodyDown1);
		},
		//添加知识点
		addKnowledge: function(){
			videos.knowledges.push({id:'',title:''});
		},
		delknowledge: function(index){
			videos.knowledges.splice(index,1);
		},
		//上传图片change
		videoImgFile: function(e){
			var region = 'oss-cn-beijing';
			var bucket = 'linkpad';
			$('.progress-img').show();
			ossfile(e.target,region,bucket,'videoimgsrc');
		},
		//上传微课change
		videoFile: function(e){
			var region = 'oss-cn-beijing';
			var bucket = 'linkpad';
			$('.progress-video').show();
			ossfile(e.target,region,bucket);
		},
		//保存所有内容
		save: function(e){
			var knowledgeids=[],flaknow=true;
			$.each(videos.knowledges, function(i,e) {
				if (e.id=='') {
					layer.alert('知识点不能为空！');
					flaknow=false;
					return false;
				}
				knowledgeids.push(e.id);
			});
			if (!flaknow) {
				return false;
			}
			if(videos.videoname == '') {
				layer.alert('微课名称不能为空！');
				return false;
			}
			if(videos.teachername == '') {
				layer.alert('讲师不能为空！');
				return false;
			}
			if(videos.picked == '') {
				layer.alert('请选择公开范围！');
				return false;
			}
			if(knowledgeids.length < 1) {
				layer.alert('请选择至少一个知识点！');
				return false;
			}
			if(videos.videoimgsrc == '') {
				layer.alert('请上传图片！');
				return false;
			}
			if(videos.videosrc == '') {
				layer.alert('请上传微课！');
				return false;
			}
			var data = {
				knowledgeids:knowledgeids, //知识点
//				stageid:videos.stageids,//学段
				stageid: videos.stageid,
				courseid: videos.courseid,
				title: videos.videoname, //微课名称
				target: videos.videocrowd, //适用人群
				aims: videos.objectives, //学习目标
				desc: videos.coursedesc, //课程介绍
				author: videos.teachername, //讲师姓名
				authordesc: videos.teacherdesc, //讲师介绍
				coins: videos.videoprice,  //微课价格
				teacherid: '',
				cover: videos.videoimgsrc,   //：封面地址,
				path: videos.videosrc,   //：存储路径
				duration: parseInt(myFunction())
			}
			
			console.log(data);
//			return
			$.ajax({
				type:"put",
				url:org_url+dataUrl.video+id+'?token='+localStorage.token,
				contentType: "application/json; charset=utf-8",
		        data: JSON.stringify(data),
		        dataType: "json",
				success: function(data){
					if (data.result==1||data==1) {
						layer.alert('修改成功！',function(){
							window.location.href = 'videolist.html?courseid='+courseid+'&stageid='+stageid;
						})
					}else{
						layer.alert('修改失败！'+data.msg)
					}
				}
			});
		},
		back: function(e){
			if(videos.changetxt){
				layer.confirm('是否确定退出不保存？',function(){
					window.location.href = 'videolist.html?courseid='+courseid+'&stageid='+stageid;
					layer.close();
				});
			}else{
				window.location.href = 'videolist.html?courseid='+courseid+'&stageid='+stageid;
			}
			
		}
	},
	watch:{
		stages:function(n,o){
			stages = n;
			$.fn.zTree.init($("#treeDemo1"), setting2);
		},
		videoname: function(n,o){
			if (n!==oldvideoname) {
				videos.changetxt = true;
			}else{
				videos.changetxt = false;
			}
			console.log('videoname: '+n+'===='+o+'.old:'+olidvideoname)
		},
		videocrowd: function(n,o){
			if (n!==oldvideocrowd) {
				videos.changetxt = true;
			}else{
				videos.changetxt = false;
			}
			console.log('videocrowd: '+n+'===='+o+'.old:'+oldvideocrowd)
		},
		objectives: function(n,o){
			if (n!==oldobjectives) {
				videos.changetxt = true;
			}else{
				videos.changetxt = false;
			}
			console.log('objectives: '+n+'===='+o+'.old:'+oldobjectives)
		},
		coursedesc: function(n,o){
			if (n!==oldcoursedesc) {
				videos.changetxt = true;
			}else{
				videos.changetxt = false;
			}
			console.log('coursedesc: '+n+'===='+o+'.old:'+oldcoursedesc)
		},
		teachername: function(n,o){
			if (n!==oldteachername) {
				videos.changetxt = true;
			}else{
				videos.changetxt = false;
			}
			console.log('teachername: '+n+'===='+o+'.old:'+oldteachername)
		},
		teacherdesc: function(n,o){
			if (n!==oldteacherdesc) {
				videos.changetxt = true;
			}else{
				videos.changetxt = false;
			}
			console.log('teacherdesc: '+n+'===='+o+'.old:'+oldteacherdesc)
		},
		videoprice: function(n,o){
			if (n!==oldvideoprice) {
				videos.changetxt = true;
			}else{
				videos.changetxt = false;
			}
			console.log('videoprice: '+n+'===='+o+'=-=-=qian:'+videos.videoprice+'.old:'+oldvideoprice)
		},
		videoimgsrc: function(n,o){
			if (n!==oldvideoimgsrc) {
				videos.changetxt = true;
			}else{
				videos.changetxt = false;
			}
			console.log('videoimgsrc: '+n+'===='+o+'.old:'+oldvideoimgsrc)
		},
		videosrc: function(n,o){
			if (n!==oldvideosrc) {
				videos.changetxt = true;
			}else{
				videos.changetxt = false;
			}
			console.log('videosrc: '+n+'===='+o)+'.old:'+oldvideosrc
		}
	}
});
$('.videofile').click(function(){
	$('#videofile').click();
})

$('.videoimg').click(function(){
	$('#videoimg').click();
})

var progress = function (p) {
  return function (done) {
    var bar = document.getElementById('progress-bar');
    bar.style.width = Math.floor(p * 100) + '%';
    bar.innerHTML = Math.floor(p * 100) + '%';
    done();
  }
};
var progressimg = function (p) {
  return function (done) {
    var bar = document.getElementById('progress-bar-img');
    bar.style.width = Math.floor(p * 100) + '%';
    bar.innerHTML = Math.floor(p * 100) + '%';
    done();
  }
};
//oss上传
function ossfile(e,region,bucket,src){
	var appServer = org_url+dataUrl.getosstoken+'?token='+localStorage.token;
	var file = $(e)[0].files[0];
	var storeAs = localStorage.userid+'/'+hex_md5(new Date().getTime()+localStorage.userid)+'/'+file.name;
	if (!src) {
		storeAs = localStorage.userid+'/'+hex_md5(new Date().getTime()+localStorage.userid)+'/'+file.name+'?x-oss-process=image/resize,m_mfit,h_188,w_268';
	}
	videos.videosrcname = file.name;
	console.log((src?progressimg:progress))
//	return;
	$.ajax({
		type:"get",
		url:appServer,
		success:function(response){
			var client = new OSS.Wrapper({
				accessKeyId: response.credentials.access_key_id,
				accessKeySecret: response.credentials.access_key_secret,
				stsToken: response.credentials.security_token,
				region: region,
				bucket: bucket	
			});
			client.multipartUpload(storeAs, file,{progress: (src?progressimg:progress)}).then(function(result) {
				console.log(result);
				if(src){
					if(result.src){
						videos.videoimgsrc=result.url.split('?')[0];
					}else{
						videos.videoimgsrc=result.res.requestUrls[0].split('?')[0];
					}
					console.log(videos.videoimgsrc);
				}else{
					if(result.src){
						videos.videosrc=result.url.split('?')[0]; 
					}else{
						videos.videosrc=result.res.requestUrls[0].split('?')[0]; 
					}
					console.log(videos.videosrc);
				}
			}).catch(function(err) {
				console.log(err);
			});
		}
	});
}

//加载知识点树
var setting2 = {
	async: {
		enable: true,
		url: org_url + dataUrl.knowledgetree + "?courseid="+(courseid||videos.courseid)+"&stageid="+(stageid||videos.stageid)+"&token="+localStorage.token+'&time='+new Date().getTime(),
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

//function showMenu(id){
//	videos.knowledgtreeid = "#prevknowledgeName"+id;
//	var cityObj = $("#prevknowledgeName"+id);
//	var cityOffset = $("#prevknowledgeName"+id).offset();
//	$("#menuContent").css({left:cityOffset.left + "px", top:cityOffset.top + cityObj.outerHeight() + "px"}).slideDown("fast");
//	$("body").bind("mousedown", onBodyDown1);
//};


//树节点点击事件
function onClick1(e, treeId, treeNode) {
	console.log(treeNode)
	var check = (treeNode.type !== 1);
	if (treeNode.type === 1) {
		layer.alert("只能选择知识点,不能选择章和节！");
		return;
	};
//	videos.knowledges[videos.knowledges.length-1].title=treeNode.name;
	console.log(videos.knowledges)
	$(videos.knowledgtreeid).val(treeNode.name);
	$(videos.knowledgtreeid).attr({"data-id":treeNode.id,"data-knowid":treeNode.knowid});
	var index = $(videos.knowledgtreeid).attr('data-index');
	videos.knowledges[index]["title"] = treeNode.name;
	videos.knowledges[index]["id"] = treeNode.knowid;
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

function myFunction() {
	var a = $("#video")[0].duration;
	return a;
}