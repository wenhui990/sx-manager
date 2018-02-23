 $(document).ready(function(){
 	 
      var  $list = $('#fileList'),
        // 优化retina, 在retina下这个值是2
        ratio = window.devicePixelRatio || 1,

        // 缩略图大小
        thumbnailWidth = 100 * ratio,
        thumbnailHeight = 100 * ratio,

        // Web Uploader实例
        uploader;

    // 初始化Web Uploader
    
    uploader = WebUploader.create({

        // 自动上传。
        auto: true,

        // swf文件路径
        swf:'js/Uploader.swf',

        // 文件接收服务端。
      //  server: 'http://webuploader.duapp.com/server/fileupload.php',

        // 选择文件的按钮。可选。
        // 内部根据当前运行是创建，可能是input元素，也可能是flash.
        
        pick: {
        	id:'.filePicker',
        	multiple:false,
        	innerHTML:"上传图片"
        },
		
        // 只允许选择文件，可选。
        accept: {
            title: 'Images',
            extensions: 'gif,jpg,jpeg,bmp,png',
            mimeTypes: 'image/jpg,image/jpeg,image/png'
        },
       
       	duplicate:true
    });
	
    // 当有文件添加进来的时候
    uploader.on( 'fileQueued', function( file ) {
        var $li = $(
                '<div id="' + file.id + '" class="file-item thumbnail">' +
                    '<img>' +
                    '<div class="info">' + file.name + '</div>' +
                    '<span class="_delete1">删除</span>' +
                '</div>'
                ),
            $img = $li.find('img');
		$list.append($li)
      
		
        // 创建缩略图
        uploader.makeThumb( file, function( error, src ) {
            if ( error ) {
                $img.replaceWith('<span>不能预览</span>');
                return;
            }

            $img.attr( 'src', src );
        }, thumbnailWidth, thumbnailHeight );
    });
	
    // 文件上传过程中创建进度条实时显示。
    uploader.on( 'uploadProgress', function( file, percentage ) {
        var $li = $( '#'+file.id ),
            $percent = $li.find('.progress span');

        // 避免重复创建
        if ( !$percent.length ) {
            $percent = $('<p class="progress"><span></span></p>')
                    .appendTo( $li )
                    .find('span');
        }

        $percent.css( 'width', percentage * 100 + '%' );
    });

    // 文件上传成功，给item添加成功class, 用样式标记上传成功。
    uploader.on( 'uploadSuccess', function( file ) {
        $( '#'+file.id ).addClass('upload-state-done');
    });

    // 文件上传失败，现实上传出错。
    uploader.on( 'uploadError', function( file ) {
        var $li = $( '#'+file.id ),
            $error = $li.find('div.error');

        // 避免重复创建
        if ( !$error.length ) {
            $error = $('<div class="error"></div>').appendTo( $li );
        }

        $error.text('上传失败');
        
    });
	
    // 完成上传完了，成功或者失败，先删除进度条。//事件操作
    uploader.on( 'uploadComplete', function( file ) {
    	$( '#'+file.id ).find('.progress').remove();
        $( '#'+file.id ).find('._delete1').on("click",function(){
        	$(this).parent('#'+file.id).remove();
        	$(".webuploader-element-invisible").removeAttr("disabled","disabled")
        })
        
        if($("#fileList").find(".thumbnail").length==8 ){
        	$(".webuploader-element-invisible").attr("disabled","disabled")
        	alert("最多上传8张图片")
        }
    });
    
 })
    
