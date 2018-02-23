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

$(function() {
  var institutions;
	//添加学校页加载机构列表
	function educationLists() {
//		new Vue({
//			el: '#educationLists',
//			data: {
//				datas: ""
//			},
//			beforeCreate: function() {
//				var _self = this;
				$.ajax({
					type: "get",
					url: org_url + dataUrl.institutions+"?token="+localStorage.token+"&time="+new Date().getTime(),
					async: true,
					success: function(data) {
						if (data.code=='10010') {
							layer.alert('身份验证失败！请重新登录！',{yes:function(){
								parent.location.href = "../../enter.html";
							},cancel:function(){
								parent.location.href = "../../enter.html";
							}});
							return false;
						}
						institutions = data;
//						_self.datas = data;
					},
					error: function(data) {
						console.log(data.responseText)
					}
				});
//			}

//		});
	};
	if (window.location.href.indexOf('add_school')>-1) {
		educationLists();
	}
	
//	//学校学段单选框点击事件
	$('.learning_period').dblclick(function(){
		var ischecked = $(this).prop('checked');
		if (ischecked) {
//			$(this).click(function(){
				$(this).prop('checked',!ischecked)
//			})
		}
		console.log(ischecked)
	})
	
	//查询学校
	//	var selectSchool = Vue({
	////		el
	//	})

	//点击编辑后
	var this_url = window.location.href;
	var urlId = getUrlParams().id;
	var gradeId = getUrlParams().gradeId;
	var schoolId = getUrlParams().schoolId;
	var schoolNmae = getUrlParams().schoolName;
	var teacherindex = 1;
	//编辑学校
	if(urlId) {
		$('title').text('编辑学校');
		$.ajax({
			type: "get",
			url: org_url + dataUrl.school + urlId+'?token='+localStorage.token+"&time="+new Date().getTime(),
			async: true,
			success: function(data) {
				//编辑学校
				$('#school_name').val(data.name);
				setTimeout(function(){
				  for (var i=0;i<institutions.length;i++) {
            if (data.institutionid == institutions[i].id) {
              $('#schoolNameId').val(institutions[i].name)
              $('#schoolNameId').attr('data-id',institutions[i].id)
            }
          }
				},200)
				
//				$('#education_lists option[value="' + data.institutionid + '"]').attr('selected', 'selected');
				$('#school_address').val(data.addr);
				$('#school_postcode').val(data.postcode);
				$('#school_phone').val(data.phone);
				$('#school_url').val(data.site);
				var stages = JSON.parse(data.stages);
				console.log(stages)
				if(stages.length) {
					$.each(stages, function(i, e) {
						if(e.year) {
							var tempstages = e.stageId + '-' + e.year;
							$('input[name="learning_period"]').each(function(i, event) {
								if($(this).val() == tempstages) {
									if($(this).attr('type') == 'checkbox') {
										$(this).attr('checked', 'checked');
									} else {
										$(this).attr('checked', 'checked');
									}
								}
							})
							$('input[name="learning_period1"]').each(function(i, event) {
								if($(this).val() == tempstages) {
									$(this).attr('checked', 'checked');
								}
							})
						} else {
							$('input[name="learning_period"]').each(function(i, event) {
								if($(this).val() == e.stageId) {
									if($(this).attr('type') == 'checkbox') {
										$(this).attr('checked', 'checked');
									} else {
										$(this).attr('checked', 'checked');
									}
								}
							})
							$('input[name="learning_period1"]').each(function(i, event) {
								if($(this).val() == e.stageId) {
									$(this).attr('checked', 'checked');
								}
							})
						}
					});
				}
			},
			error: function(data) {
				console.log(data.responseText)
			}
		})
	}
	//编辑班级
	if(getUrlParams().clazzid) {
		$.ajax({
			type: "get",
			url: org_url + dataUrl.clazzs + getUrlParams().clazzid+"?token="+localStorage.token+"&time="+new Date().getTime(),
			async: true,
			success: function(data) {
				if (data.code=='10010') {
					layer.alert('身份验证失败！请重新登录！',{yes:function(){
						parent.location.href = "../../enter.html";
					},cancel:function(){
						parent.location.href = "../../enter.html";
					}});
					return false;
				}
				gradeId = data.gradeid;
				$('#grade_name').val(data.name);
				$('.charge_teacher_name').text(data.advisername);
				if(data.textbookids&&data.textbookids.length>1){
					$.each(JSON.parse(data.textbookids), function(i, e) {
						teacherindex = i;
						$('.teacher_lists').append('<tr><td><select name="" class="form-control subject_list"><option value="' + e.courseId + '" selected>' + e.courseTitle + '</option></select></td><td class="teacher_subject_grade' + i + '" data-id="' + e.teacherId + '">' + e.teacherName + '</td><td><a href="javascript:;" class="edit_teacher">选择</a>&nbsp;<a href="javascript:;" class="delete_teacher">删除</a></td></tr>');
						//					subjectslist();
					});
				}
				
				subjectslist();
			}

		});
	}
	$(document).on('click', '.subject_list', function() {

	});

	//点击保存学校
	$('.save').click(function() {
		var schoolurl = '';
		var school_name = $('#school_name').val(),
			educationvalue = $('#schoolNameId').attr('data-id'),
			years = $('[name="learning_period"]:checked'),
			addr = $('#school_address').val();
		postcode = $('#school_postcode').val();
		phone = $('#school_phone').val();
		site = $('#school_url').val();
		//			token = '';
		var statges = []; //学制，学段
		$.each(years, function(i, e) {
			var statge = {};
			if($(e).val().indexOf('-') > 0) {
				var statgesplit = $(e).val().split('-');
				statge.stageId = statgesplit[0];
				statge.year = statgesplit[1];
			} else {
				statge.stageId = $(e).val();
			}
			statges.push(statge);
		});
		if($('[name="learning_period1"]:checked').val()) {
			var statge = {};
			var years2 = $('[name="learning_period1"]:checked').val().split('-');
			statge.stageId = years2[0];
			statge.year = years2[1];
			statges.push(statge);
		}
		var data = {
			name: school_name,
			institutionid: educationvalue,
			addr: addr,
			postcode: postcode,
			phone: phone,
			site: site,
			stages: JSON.stringify(statges),
//			token: localStorage.token
		}
		console.log(data)
		//		return
		if(school_name == "" || educationvalue == "" || statges < 1) {
			layer.open({
				title: "提示",
				content: '请把*项输入完整！',
				skin: 'layui-layer-lana',
				shadeClose: 'true'
			});

		} else {
			$.ajax({
				type: urlId ? 'put' : 'post',
				url: urlId ? org_url + dataUrl.school + urlId+"?token="+localStorage.token : org_url + dataUrl.school+"?token="+localStorage.token,
				data: data,
				success: function(res) {
					if (res.code=='10010') {
						layer.alert('身份验证失败！请重新登录！',{yes:function(){
							parent.location.href = "../../enter.html";
						},cancel:function(){
							parent.location.href = "../../enter.html";
						}});
						return false;
					}
					var tip='';
					if(res==1){
						urlId?tip = '修改学校成功!':tip = '新建学校成功!';
					}else{
						tip = res.msg;
						if (tip=='字段不能重复') {
							tip = '学校名称不能重复！'
						}
					}
					layer.open({
						title: "提示！",
						content: tip,
						skin: 'layui-layer-lana',
						shadeClose: 'true',
						btn: ['确定'],
						yes: function(index, layero) {
							layer.close(index);
							if (res==1) {
								window.location.href = 'schoolManage.html';
								$('.breadcrumb>li:gt(1)', window.parent.document).remove();
							}
						}
					});

				}
			})
		}
	});
	//点击返回
	$('.back').click(function() {
		$('.breadcrumb>li:gt(1)', window.parent.document).remove();
		window.location.href = 'schoolManage.html';
	});

	//返回班级管理
	$('.back_grademanage').click(function() {
		$('.breadcrumb>li:gt(2)', window.parent.document).remove();
		window.location.href = 'gradeManage.html?id=' + getUrlParams().schoolId + '&name=' + getUrlParams().schoolName+'&add=ok';
	});

	//选择班主任弹出层
	$('.select_charge_teacher').click(function() {
		teacherlist('selected_charge_teacher','',schoolId);
		$('#teacher_name_lists').modal('show');
	});
	//确定班主任
	$(document).on('click', '.selected_charge_teacher', function() {
		var teacherName = $(this).parent().prev().prev().text();
		var tid = $(this).attr('data-id');
		$('.charge_teacher_name').text(teacherName).attr('data-id', tid);
		$('#teacher_name_lists').modal('hide');
	});

	//增加老师
	$('.add_teacher').click(function() {
		teacherindex++;
		$('.teacher_lists').append('<tr><td><select name="" class="form-control subject_list"><option>请选择</option></select></td><td class="teacher_subject_grade' + teacherindex + '"></td><td><a href="javascript:;" class="edit_teacher">选择</a>&nbsp;<a href="javascript:;" class="delete_teacher">删除</a></td></tr>');
		subjectslist();
	});

	//选择任课教师
	$(document).on('click', '.edit_teacher', function() {
		teacherlist('selected_teacher', $(this));
		$('#teacher_name_lists').modal('show');
	});
	//确定任课老师
	$(document).on('click', '.selected_teacher', function() {
		var teacherName = $(this).parent().prev().prev().text();
		var classname = $(this).attr('data-class');
		var cid = $(this).attr('data-id');
		$('.' + classname).text(teacherName).attr('data-id', cid);
		$('#teacher_name_lists').modal('hide');
	});

	//查询老师
	$(document).on('click', '.select_teacher', function() {
		var tname = $(this).prev().val().trim();
		var $tda = $(this).nextAll('table').find('tr').eq(1).find('td').eq(2).find('a')
		var cls = $tda.attr('class');
		var edit_class = $tda.attr('data-class');
		$.ajax({
			type: "get",
			url: org_url + dataUrl.teachers+"?token="+localStorage.token+"&schoolid="+schoolId+"&time="+new Date().getTime(),
			async: true,
			data: {
				name: tname,
			},
			success: function(data) {
				if (data.code=='10010') {
					layer.alert('身份验证失败！请重新登录！',{yes:function(){
						parent.location.href = "../../enter.html";
					},cancel:function(){
						parent.location.href = "../../enter.html";
					}});
					return false;
				}
				console.log(data);
				$('.teacher_table_list').html("");
				$.each(data.data, function(i, e) {
					$('.teacher_table_list').append('<tr><td>' + e.name + '</td><td>' + e.phone + '</td><td><a href="javascript:;" class="' + cls + '" data-class="' + edit_class + '" data-id="' + e.id + '">确定</a></td></tr>');
				});
			}
		});
	})

	function teacherlist(cls, t,scholid) {
		$('#pageToolbar').html('');
		var tablehtml = '';
		var edit_class = (cls == "selected_teacher" ? $(t).parent().prev().attr('class') : "charge_teacher_name");
		var count = 0;
		teacherlistajax();

		function teacherlistajax() {
			$('.teacher_table_list').html("");
			$.ajax({
				type: "get",
//				data:{token: localStorage.token},
//				url: scholid ? org_url + dataUrl.teachers+'?schoolid='+scholid+"&token="+localStorage.token : org_url + dataUrl.teachers+"?token="+localStorage.token,
				url: org_url + dataUrl.teachers+'?schoolid='+schoolId+"&token="+localStorage.token+"&time="+new Date().getTime(),
				async: true,
				success: function(data) {
					if (data.code=='10010') {
						layer.alert('身份验证失败！请重新登录！',{yes:function(){
							parent.location.href = "../../enter.html";
						},cancel:function(){
							parent.location.href = "../../enter.html";
						}});
						return false;
					}
					count = data.length;
					$.each(data.data, function(i, e) {
						$('.teacher_table_list').append('<tr><td>' + e.name + '</td><td>' + e.phone + '</td><td><a href="javascript:;" class="' + cls + '" data-class="' + edit_class + '" data-id="' + e.id + '">确定</a></td></tr>');
					});
					//分页
					var nowpage = 0;
					$('#pageToolbar').html('')
					$('#pageToolbar').Paging({
						pagesize: 10,
						count: count,
						toolbar: true,
						hash: true,
						callback: function(page, size, count) {
							console.log(count);
							nowpage = page;
							$.ajax({
								type: "get",
								url: org_url + dataUrl.schools+"?time="+new Date().getTime(),
								data: {
									page: nowpage,
									size: 10,
									token: localStorage.token
								},
								success: function(data) {
									if (data.code=='10010') {
										layer.alert('身份验证失败！请重新登录！',{yes:function(){
											parent.location.href = "../../enter.html";
										},cancel:function(){
											parent.location.href = "../../enter.html";
										}});
										return false;
									}
									teacherlistajax()
								}
							});
						},
						changePagesize: function(ps) {
							console.log(ps)
							$.ajax({
								type: "get",
								url: org_url + dataUrl.schools+"?time="+new Date().getTime(),
								data: {
									page: nowpage,
									size: ps,
									token: localStorage.token
								},
								success: function(data) {
									if (data.code=='10010') {
										layer.alert('身份验证失败！请重新登录！',{yes:function(){
											parent.location.href = "../../enter.html";
										},cancel:function(){
											parent.location.href = "../../enter.html";
										}});
										return false;
									}
									teacherlistajax()
								}
							});
						}
					});
				}
			});
		}

	}

	//删除班级
	$(document).on('click', '.delete_teacher', function() {
		$(this).parents('tr').remove();
	});

	//保存班级
	$('.save_grade').click(function() {
		var url = '',
			type = '';
		var gradeName = $('#grade_name').val();
		var chargeTeacherId = $('.charge_teacher_name').attr('data-id');
		var teacher = [];
		var subjectlist = [];
		var coursecount = 0;
		$('.teacher_subject tr').each(function(i, e) {
			var subjecid = $(e).find('.subject_list').val();
			var teacherId = $(e).find('td').eq(1).attr('data-id');
			var teacherObj = {};
			teacherObj['courseid'] = subjecid;
			teacherObj['teacherid'] = teacherId;
			teacher.push(teacherObj);
			if(subjectlist.indexOf(subjecid)>-1){
				coursecount = 1;
			}else{
				subjectlist.push(subjecid);
			};
		});
		if(gradeName == '' || gradeName.length < 1) {
			layer.alert('班级名称不能为空')
			$('#grade_name').focus();
			return false;
		}
		if(coursecount==1){
			layer.alert('科目不能重复！');
			return false;
		}
		var isteacher = false,iscourseid = false;
		$.each(teacher, function(i,e) {
			console.log(e.teacherid)
			if (e.teacherid==''||e.teacherid=='undefined'||e.teacherid==undefined) {
				isteacher = true;
			}
			if (e.courseid==''||e.courseid=='undefined'||e.courseid==undefined||e.courseid=='请选择') {
				iscourseid = true;
			}
		});
		if (isteacher) {
			layer.alert('任课教师必选，不能为空！');
			return false;
		}
		if (iscourseid) {
			layer.alert('科目不能为空，请选择！');
			return false;
		}
//		console.log(teacher);
//		return;
		var grade = {
			name: gradeName,
			gradeid: gradeId,
			schoolid: schoolId,
			adviserid: chargeTeacherId,
			textbookids: JSON.stringify(teacher),
			token: localStorage.token,
			order: getUrlParams().order
		};
		if(getUrlParams().clazzid) {
			type = 'put';
			grade.id = getUrlParams().clazzid;
			url = org_url + dataUrl.clazzs + getUrlParams().clazzid;
		} else {
			type = 'post';
			url = org_url + dataUrl.clazzs;
		}

		$.ajax({
			type: type,
			url: url,
			async: true,
			data: grade,
			success: function(data) {
				if (data.code=='10010') {
					layer.alert('身份验证失败！请重新登录！',{yes:function(){
						parent.location.href = "../../enter.html";
					},cancel:function(){
						parent.location.href = "../../enter.html";
					}});
					return false;
				}
				console.log(data);
				if(data == 1) {
					layer.alert('保存成功！',function(){
						$('.breadcrumb>li:gt(2)', window.parent.document).remove();
						window.location.href = 'gradeManage.html?id=' + schoolId + '&name=' + schoolNmae+'&add=ok';
					});
				}else{
					layer.alert('保存失败！'+data.msg);
				}
			}
		});
	});

	//课程列表
	function subjectslist() {
		$.ajax({
			type: "get",
			url: org_url + dataUrl.course+"?time="+new Date().getTime(),
			async: true,
			data:{token: localStorage.token},
			success: function(data) {
				$.each(data, function(i, e) {
					$('.subject_list').append('<option value="' + e.id + '">' + e.title + '</option>');
				});
			}
		});
	}
  $.fn.zTree.init($("#treeDemo1"), setting2);
});
var setting2 = {
    async: {
      enable: true,
      //url: org_url + dataUrl.knowledge.sectiontreeAll + "?courseid="+courseid+"&stageid="+stageid+"&token="+localStorage.token,
      url: org_url + dataUrl.institutions+"?token="+localStorage.token+"&time="+new Date().getTime(),
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
  function setFontCss(treeId, treeNode) {
    return treeNode.type == 2 ? {color:"#068fe2"} : {};
  };
  
  function onClick1(e, treeId, treeNode) {
    console.log(treeNode)
    var check = (treeNode.type !== 1);
    if(treeNode.type === 1) {
      layer.alert("只能选择知识点,不能选择章和节！");
      return;
    };
    $("#schoolNameId").val(treeNode.name);
    $("#schoolNameId").attr({
      "data-id": treeNode.id,
      "data-knowid": treeNode.knowid
    });
    //  treeNodeObjs.knowid = treeNode.knowid || 0;
    hideMenu();
  }
  
  function showMenu() {
    var cityObj = $("#schoolNameId");
    var cityOffset = $("#schoolNameId").offset();
    $("#menuContent").css({
      left: cityOffset.left + "px",
      top: cityOffset.top + cityObj.outerHeight() + "px"
    }).slideDown("fast");
  
    $("body").bind("mousedown", onBodyDown1);
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