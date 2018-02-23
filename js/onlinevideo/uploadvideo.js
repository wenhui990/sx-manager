var courseid, stageid, question, knownum;
courseid = getUrlParams().courseid;
stageid = getUrlParams().stageid;
id = getUrlParams().id;

var vuedatas = {
	knowledgeids: [{'id':'','name':''}],
	stageid: [],
}

//下拉框知识点树菜单
var setting2 = {
	async: {
		enable: true,
		url: org_url + dataUrl.knowledgetree + "?courseid=" + courseid + "&stageid=" + stageid + "&token=" + localStorage.token+'&time='+new Date().getTime(),
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
	if(!childNodes) return null;
	for(var i = 0, l = childNodes.length; i < l; i++) {
		if(childNodes[i].name) {
			childNodes[i].name = childNodes[i].name.replace(/\.n/g, '.');
		} else {
			childNodes[i].name = '';
		}
	}
	return childNodes;
}

function hideMenu() {
	$("#menuContent").fadeOut("fast");
	$("body").unbind("mousedown", onBodyDown1);
}

function onBodyDown1(event) {
	if(!(event.target.id == "menuBtn" || event.target.id == "knowledgeName" || event.target.id == "menuContent" || $(event.target).parents("#menuContent").length > 0)) {
		hideMenu();
	}
}

////节点树点击
function OnClick(event, treeId, treeNode) {
	console.log(treeNode);
};

videos = new Vue({
	el: '#videoMain',
	data: {
		videooptiondata: '',
		stageid: stageid, //学段id
		courseid: '', //科目id
		stages: {}, //学段列表
		courses: {}, //科目列表
		knowledges: [], //知识点列表,
		knowledgtreeid: '', //知识点树id
		picked: 'S', //题库对象，是老师还是学生
		videoname: '', //微课名称
		videocrowd: '', //适用人群
		objectives: '', //学习目标
		coursedesc: '', //课程介绍
		teachername: '', //讲师姓名
		teacherdesc: '', //讲师介绍
		videoprice: 0, //微课价格
		videoimgsrc: 'http://linktrust-zsyimg.oss-cn-beijing.aliyuncs.com/37/8c014e707eaaf2ebf61cc32044b27d76.png', //图片地址
		videosrc: '', //微课录像地址
		videosrcname: '', //微课视频名
		savevideobutton: true,
		saveclasss: {
			save: true,
			btn: true,
			'btn-default': true,
			'btn-info': false
		},
		videoduration: 0,
		tempvuedatas: vuedatas //临时数据
	},
	beforeCreate: function() {
		//获取所有学段，学科目录
		$.ajax({
			type: "get",
			url: org_url + dataUrl.commons + '?token=' + localStorage.token+'&time='+new Date().getTime(),
			success: function(data) {
				videos.courses = data.courses;
				videos.stages = data.stages;
			}
		});
	},
	methods: {
		//点击每个知识点框对应显示树
		showMenu: function(id) {
			videos.knowledgtreeid = "#prevknowledgeName" + id;
			var cityObj = $("#prevknowledgeName" + id);
			var cityOffset = $("#prevknowledgeName" + id).offset();
			$("#menuContent").css({
				left: cityOffset.left + "px",
				top: cityOffset.top + cityObj.outerHeight() + "px"
			}).slideDown("fast");
			$("body").bind("mousedown", onBodyDown1);
		},
		//添加知识点
		addKnowledge: function() {
			videos.tempvuedatas.knowledgeids.push({'id':''});
		},
		delknowledge: function(index) {
			videos.tempvuedatas.knowledgeids.splice(index,1);
		},
		//上传图片change
		videoImgFile: function(e) {
			var region = 'oss-cn-beijing';
			var bucket = 'linktrust-zsyimg';
			$('.progress-img').show();
			ossfile(e.target, region, bucket, 'videoimgsrc');
		},
		//上传微课change
		videoFile: function(e) {
			videos.savevideobutton = true;
			var region = 'oss-cn-beijing';
			var bucket = 'linktrust-zsyrawvideo';
			var allname = $(e.target)[0].files[0].name;
			var filename = allname.substring(allname.lastIndexOf('.'));
			console.log(filename);
			if (filename!=='.mp4') {
				layer.alert('只能上传mp4格式的视频');
				return false;
			}
			$('.progress-video').show();
			ossfile(e.target, region, bucket);
		},
		//保存所有内容
		save: function(e) {
			var stageids = [],
				knowledgeids = [],flaknow = true;
			$.each(videos.tempvuedatas.knowledgeids, function(i, e) {
				if (!e['data-knowid']) {
					layer.alert('知识点不能为空！');
					flaknow = false;
					return false;
				}
				knowledgeids.push($(e).attr('data-knowid') * 1);
			});
			var newarr = knowledgeids.sort();
			for (var i=0,len=knowledgeids.length;i<len;i++) {
				if (knowledgeids[i]==knowledgeids[i+1]) {
					layer.alert('知识点不能重复！');
					flaknow = false;
					return false;
				}
			}
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
//			if(myFunction()==0){
//				
//			}
			var data = {
				title: videos.videoname, //微课名称
				cover: videos.videoimgsrc, //：封面地址,
				path: videos.videosrc, //.replace('raw',''), //：存储路径
				courseid: courseid, // ：科目
				desc: videos.coursedesc, //： 描述
				author: videos.teachername, //：讲师
				authordesc: videos.teacherdesc, //：讲师描述
				target: videos.videocrowd, //： 使用人群
				aims: videos.objectives, //：学习目标
				coins: videos.videoprice, //：价格（学习币）
				teacherid: '', //：上传的教师，为空表示管理员上传（上传人的id）
				knowledgeids: knowledgeids, //知识点
				stageid: stageid, //学段
				duration: parseInt(myFunction())  //时长
				
			}
		
			console.log(data);
//			return
			$.ajax({
				type: "post",
				url: org_url + dataUrl.video + '?token=' + localStorage.token+'&time='+new Date().getTime(),
				contentType: "application/json; charset=utf-8",
				data: JSON.stringify(data),
				dataType: "json",
				success: function(data) {
					if(data == 1||data.result==1) {
						layer.alert('保存成功！',function(){
							window.location.href = 'videolist.html?courseid='+courseid+'&stageid='+stageid;
						})
					} else {
						layer.alert('保存失败！' + data.msg)
					}
				}
			});
		},
		back: function(e) {
			if (videos.videoname!=''||videos.videosrc!=''||videos.coursedesc!=''||videos.teachername!=''||videos.teacherdesc!=''||videos.videocrowd!=''||videos.objectives!=''||videos.videoprice!='') {
				layer.confirm('是否确定退出不保存？', function() {
					window.location.href = 'videolist.html?courseid=' + courseid + '&stageid=' + stageid;
					layer.close();
				});
			}else{
				window.location.href = 'videolist.html?courseid=' + courseid + '&stageid=' + stageid;
			}
		}
	},
	watch: {
		stages: function(n, o) {
			stages = n;
			$.fn.zTree.init($("#treeDemo1"), setting2);
		}
	}
});

$('.videofile').click(function() {
	$('#videofile').click();
})

$('.videoimg').click(function() {
	$('#videoimg').click();
})

var progress = function(p) {
	return function(done) {
		var bar = document.getElementById('progress-bar');
		bar.style.width = Math.floor(p * 100) + '%';
		bar.innerHTML = Math.floor(p * 100) + '%';
		done();
	}
};
var progressimg = function(p) {
	return function(done) {
		var bar = document.getElementById('progress-bar-img');
		bar.style.width = Math.floor(p * 100) + '%';
		bar.innerHTML = Math.floor(p * 100) + '%';
		done();
	}
};
//oss上传
function ossfile(e, region, bucket, src) {
	var appServer = org_url + dataUrl.getosstoken + '?token=' + localStorage.token;
	var file = $(e)[0].files[0];
	console.log(file)
	//	return
	var storeAs = ''
	if(src) {
		storeAs = localStorage.userid + '/' + hex_md5(new Date().getTime() + localStorage.userid)+file.name.substring(file.name.lastIndexOf('.'));
	} else {
		videos.videosrcname = file.name;
		storeAs = localStorage.userid + '/' + hex_md5(new Date().getTime() + localStorage.userid)+'.mp4';
	}

	//	console.log((src?progressimg:progress))
	//	return;
	$.ajax({
		type: "get",
		url: appServer,
		success: function(response) {
			var client = new OSS.Wrapper({
				accessKeyId: response.credentials.access_key_id,
				accessKeySecret: response.credentials.access_key_secret,
				stsToken: response.credentials.security_token,
				region: region,
				bucket: bucket
			});
			client.multipartUpload(storeAs, file, {
				headers: {'Content-Disposition': 'attachment; filename=' + storeAs},
				progress: (src ? progressimg : progress)
			}).then(function(result) {
				console.log(result);
				if(src) {
					if(result.src){
						videos.videoimgsrc=result.url.split('?')[0];
					}else{
						videos.videoimgsrc=result.res.requestUrls[0].split('?')[0];
					}
					console.log(videos.videoimgsrc);
				} else {
					if(result.src) {
						videos.videosrc = result.url.split('?')[0];
					} else {
						videos.videosrc = result.res.requestUrls[0].split('?')[0];
					}
				}
				videos.savevideobutton = false;
				videos.saveclasss['btn-info'] = true;
			}).catch(function(err) {
				console.log(err);
			});
		}
	});
}

//树节点点击事件
function onClick1(e, treeId, treeNode) {
	console.log(treeNode)
	var check = (treeNode.type !== 1);
	if(treeNode.type === 1) {
		layer.alert("只能选择知识点,不能选择章和节！");
		return;
	};
	console.log(videos.knowledgtreeid)
	$(videos.knowledgtreeid).val(treeNode.name);
	$(videos.knowledgtreeid).attr({
		"data-id": treeNode.id,
		"data-knowid": treeNode.knowid
	});
	var index = $(videos.knowledgtreeid).attr('data-index');
	videos.tempvuedatas.knowledgeids[index]["name"] = treeNode.name;
	videos.tempvuedatas.knowledgeids[index]["data-knowid"] = treeNode.knowid;
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

//获取视频时长
function myFunction() {
	var a = $("#video")[0].duration;
	return a;
}