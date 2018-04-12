$(function(){
    new TapLocker();//初始化单例的菜单锁
    $('#indexMenuBtn').addClass('active');
})

// 设置jQuery Ajax全局的参数
$.ajaxSetup({
    type: "POST",
    error: function (jqXHR, textStatus, errorThrown) {
        switch (jqXHR.status) {
            case(500):
                errorCheckOnOffLine(true,jqXHR,"500");
                break;
            case(400):
                errorCheckOnOffLine(true,jqXHR,"400");
                break;
            case(401):
                errorCheckOnOffLine(true,jqXHR,"401");
                break;
            case(403):
                errorCheckOnOffLine(true,jqXHR,"403");
            case(404):
                errorCheckOnOffLine(false,jqXHR,"404");
                break;
            case(408):
                errorCheckOnOffLine(false,jqXHR,"408");
                break;
            case(518):
                errorCheckOnOffLine(false,jqXHR,"518");
                break;
            case(501):
                errorCheckOnOffLine(false,jqXHR,"501");
                break;
            default:
                error();
        }
        $.AMUI.progress.done();
    }
});

/**
 * 执行错误提示
 * @param mode 为true时 在线提示错误
 * @param jqXHR
 * @param code
 */
function errorCheckOnOffLine(mode,jqXHR,code) {
    if(mode){
        window.location.href = "/error/"+code;
        return;
    }
    if((typeof(jqXHR.responseJSON)!= 'undefined')){
        window.location.href = "/error/"+code;
    }else{
        error();
    }
}

/**
 * 后退上一地址
 */
function goBack() {
    window.history.back(-1);
}

function clearUploadImg(target){
    var $group = $(target).parents('.am-form-group');
    var $img = $group.find('img');
    $img.attr('src','');
    var $input = $group.find('input');
    $input.val('');

}


/**
 * 新开标签页
 */
$('body').on('click', '.sidebar-menu-button', function() {
    var locker = new TapLocker();
    locker.setIsLock(true);//锁起来
    clearMenuActive();
    var $parentsMenu = $(this).parents('.parent-menu').children('.sidebar-nav-sub-title');//父级菜单
    if($parentsMenu.length > 0){
        $parentsMenu.addClass('active')
    }else{
        $(this).addClass('active');
    };
    if(locker.getIsLock()){
        var $tab = $('#onebean-frame-container');
        var $nav = $tab.find('.am-tabs-nav');
        var $bd = $tab.find('.am-tabs-bd');
        var $link = $(this).data('url');
        var $name = $(this).data('name');
        var $onebeanTabs = $nav.children('li');
        var isRepeat = isRepeatTab($onebeanTabs,$link);
        // isRepeat = -1;
        if(isRepeat == -1){//不存在重复tab 新开
            var tab={
                name:'',
                url:''
            };
            tab.name = $name;
            tab.url = $link;
            $nav.append(template('tpl-jtab', tab));
            var $iframe= $("<iframe width='100%' src='"+$link+"' class='am-tab-panel onebean-frame' onload='reHeightonebeanFrame(this)'></iframe>");
            $bd.append($iframe);
            $tab.tabs('refresh');
            var index =$onebeanTabs.length;
            $tab.tabs('open', index);
            $tab.tabs('refresh');
        }else{//直接去往对应的tab
            $tab.tabs('open', isRepeat);
            $tab.tabs('refresh');
        }
    }
    locker.setIsLock(false);//解锁
})

/**
 * 清除菜单中所有选中状态
 */
function clearMenuActive(){
    var menus = $('.sidebar-nav').find('a');
    $.each(menus,function (i,e) {
        if ($(e).hasClass('active'))
        $(e).removeClass('active');
    })
}

/**
 * 同时只能展开一个菜单
 */
$('body').on('click', '.sidebar-nav-sub-title',function(){
    $(this).attr('status','open');
    var subs = $('.sidebar-nav').find('.sidebar-nav-sub-ico');
    var menuA;
    $.each(subs,function (i,e) {
        menuA = $(e).parent('a');
        if ($(e).hasClass('sidebar-nav-sub-ico-rotate') && menuA.attr('status') != 'open'){
            menuA.click();
        }
    })
    $(this).attr('status','close');
    clearMenuActive();
    $(this).addClass('active');
})


/**
 *switch按钮切换值替换成0/1
 */
$('.tpl-switch-btn').on('mousedown click',function () {
    var $hider =  $(this).siblings('.tpl-switch-hider');
    if($(this).is(":checked")){
        $hider.val(1);
    }else{
        $hider.val(0)
    }
    $hider.attr('name',$(this).attr('name'))
    $(this).removeAttr('name');
})




/**
 * 比较是否存在重复的tab
 * @param jtabs
 * @param href
 * @returns {number}
 */
function isRepeatTab($onebeanTabs,href) {
    var result = -1;
    $.each($onebeanTabs,function (i,e) {
        result = ($(e).children('a').data('url') == href)?i:result;
    })
    return result;
}

/**
 * 点击X按钮移除标签页
 */
$('body').on('click', '.am-icon-close', function() {
    var locker = new TapLocker();
    locker.setIsLock(true);//锁起来
    if(locker.getIsLock()){
        var $tab = $('#onebean-frame-container');
        var $nav = $tab.find('.am-tabs-nav');
        var $Jtabs = $nav.children('li');
        var $bd = $tab.find('.am-tabs-bd');
        var $item = $(this).closest('li');
        var index =$Jtabs.index($item);
        var tabsWidthSum = calSumWidth($Jtabs);
        reduceOneWidth($Jtabs[index],$Jtabs,tabsWidthSum);
        $item.remove();
        $bd.find('.am-tab-panel').eq(index).remove();
        $tab.tabs('open', index > 0 ? index - 1 : index + 1);
        $tab.tabs('refresh');
    }
    locker.setIsLock(false);//解锁
});

/**
 * 清空所有标签页
 * @param target
 */
function emptyTabs(target) {
    var locker = new TapLocker();
    locker.setIsLock(true);//锁起来
    if(locker.getIsLock()){
        var $tab = $('#onebean-frame-container');
        var $nav = $tab.find('.am-tabs-nav').children('li');
        var $bd = $tab.find('.am-tabs-bd').children('iframe');
        for(var i = 0;i<$nav.length;i++){
            if(i > 0){
                $nav[i].remove();
                $bd[i].remove();
            }
        }
        $tab.tabs('refresh');
        $(target).parents('.am-dropdown').dropdown('close');//隐藏下拉菜单
        $('.am-nav-tabs').animate({
            marginLeft: -0 + 'px'
        }, "fast");
    }
    locker.setIsLock(false);//解锁
}


/**
 * 关闭当前标签页
 * @param target
 */
function closeCurrentTabs(target) {
    var locker = new TapLocker();
    locker.setIsLock(true);//锁起来
    if(locker.getIsLock()){
        var $tab = $('#onebean-frame-container');
        var $nav = $tab.find('.am-tabs-nav').children('li');
        var $bd = $tab.find('.am-tabs-bd').children('iframe');
        var tabsWidthSum = calSumWidth($nav);
        var index;
        for(var i = 0;i<$nav.length;i++){
            if(i > 0){
                if($($nav[i]).hasClass('am-active')){
                    index = $nav.index($nav[i]);
                    reduceOneWidth($nav[i],$nav,tabsWidthSum);
                    $nav[i].remove();
                    $bd[i].remove();
                }

            }
        }
        $tab.tabs('open', index > 0 ? index - 1 : index + 1);
        $tab.tabs('refresh');
        $(target).parents('.am-dropdown').dropdown('close');//隐藏下拉菜单
    }
    locker.setIsLock(false);//解锁
}

/**
 * 处理当前tab分页最后一个标签关闭的动画
 * @param li
 * @param nav
 * @param tabsWidthSum
 */
function reduceOneWidth(li,nav,tabsWidthSum){
    var tempWidth = $(li).outerWidth(true);
    var liIndex = nav.index(li);
    var navLength = nav.length
    if(liIndex == navLength-1){

        var tabWidth = $('#onebean-frame-container').outerWidth(true);//整个tab宽度
        var tabButtonWidth = $('.onebean-nav-buttons').outerWidth(true);//tab按钮区宽度
        var tabShowWidth = tabWidth - tabButtonWidth;//视距宽度
        var allPageSum = parseInt(tabsWidthSum/tabShowWidth);//tabs够分几页
        var allPageSumExcl = parseInt((tabsWidthSum - tempWidth)/tabShowWidth);//去除当前tab后的tabs够分几页
        if((allPageSum-allPageSumExcl)>=1){
            checkBarLeft();
        }
    }
}

/**
 * 关闭其他标签页
 * @param target
 */
function closeOtherTabs(target) {
    var locker = new TapLocker();
    locker.setIsLock(true);//锁起来
    if(locker.getIsLock()){
        var $tab = $('#onebean-frame-container');
        var $nav = $tab.find('.am-tabs-nav').children('li');
        var $bd = $tab.find('.am-tabs-bd').children('iframe');

        var index;
        for(var i = 0;i<$nav.length;i++){
            if(i > 0){
                if(!($($nav[i]).hasClass('am-active'))){
                    $nav[i].remove();
                    $bd[i].remove();
                }else{
                    index = $nav.index($nav[i]);
                }

            }
        }
        $tab.tabs('open', index);
        $tab.tabs('refresh');
        $(target).parents('.am-dropdown').dropdown('close');//隐藏下拉菜单
        $('.am-nav-tabs').animate({
            marginLeft: -0 + 'px'
        }, "fast");
    }
    locker.setIsLock(false);//解锁
}

/**
 * list页面搜索条件里的dic选择框变动后 重新加载页面
 */
$('body').on('change', '.onebean-select-box',function(){
    initDataTable();
})

/**
 * 按钮 通用绑定 点击事件
 * button[type=button]
 */
$('body').on('click', '.action-button', function() {
    location.href = $(this).data('url');
})

/**
 * 查询按钮 点击事件
 * button[type=query]
 */
$('body').on('click', '.query-button', function() {
    initDataTable();
})

/**
 * 分页 数字页码 点击事件
 */
$('body').on('click', '.pagination-number', function() {
    var choosePage = $(this).children('a').html();
    $("#tpl-pagination").attr("currentPage",choosePage)
    initDataTable();
})

/**
 * 分页 返回首页 点击事件
 */
$('body').on('click', '.pagination-frist', function() {
    $("#tpl-pagination").attr("currentPage",1)
    initDataTable();
})

/**
 * 分页 返回最后一页 点击事件
 */
$('body').on('click', '.pagination-end', function() {
    var choosePage = $("#tpl-pagination").attr("totalPages");
    $("#tpl-pagination").attr("currentPage",choosePage)
    initDataTable();
})

/**
 * 分页 下一页 点击事件
 */
$('body').on('click', '.pagination-next', function() {
    var choosePage = parseInt($("#tpl-pagination").attr("currentPage"))+1;
    $("#tpl-pagination").attr("currentPage",choosePage)
    initDataTable();
})

/**
 * 分页 上一页 点击事件
 */
$('body').on('click', '.pagination-previous', function() {
    var choosePage = parseInt($("#tpl-pagination").attr("currentPage"))-1;
    $("#tpl-pagination").attr("currentPage",choosePage) 
    initDataTable();
})

/**
 * 重置筛选条件表单
 */
$(".reset-button").on("click",function(){
    $('.paramFrom').data('flush','0')
    $(".paramFrom")[0].reset()
    $("#limitSelector").children('option').eq(1).attr('selected', true);
    $("#orderBySelector").children('option').eq(0).attr('selected', true);
    $("#limitSelector").trigger('changed.selected.amui');
    $("#orderBySelector").trigger('changed.selected.amui');
    $('.onebean-select-box').selected('destroy');
    $('.onebean-select-box').selected();
    $('.paramFrom').data('flush','1')
})


/**
 * 回车键搜索表单
 */
$(".paramFrom").keydown(function(e){
    var e = e || event,
    keycode = e.which || e.keyCode;
    if (keycode==13) {
        initDataTable()
    }
});




/**
 * 初始化异步加载树
 * @param title
 * @param self_id
 * @param url
 */
function
initTreeAsyncSingleSelect(title,self_id,url) {
    $('.am-popup-title').html(title);
        $('#tree-template').tree({
        dataSource: function(options, callback) {
            if(options.type == "folder" || typeof(options.type) == "undefined"){
                if(typeof(options.childList) == "object"){
                    callback({data: options.childList});
                }else{
                    doPost(url,{parent_id:options.id,self_id:self_id},function(res){
                        callback({data:res.data});
                    })
                }

            }
        },
        multiSelect: false,
        cacheItems: true,
        folderSelect: true
    })
    setTimeout(function(){
        $('#tree-template').tree('selectItem', $('.am-tree-selected'))
    },50)
}

/**
 * 初始化同步加载树
 * @param title
 * @param self_id
 * @param url
 */
function initTreeSyncMultiSelect(title,roleId,url,$treeTemplate) {
    $('.am-popup-title').html(title);
    $treeTemplate.tree({
        dataSource: function(options, callback) {
            if(options.type == "folder" || typeof(options.type) == "undefined"){
                if(typeof(options.childList) == "object"){
                    callback({data: options.childList});
                }else{
                    doPost(url,{roleId:roleId},function(res){
                        callback({data:res.data});
                    })
                }

            }
        },
        multiSelect: true,
        cacheItems: true,
        folderSelect: true
    })
    setTimeout(function(){
        $treeTemplate.tree('selectItem', $('.selected-item'))
        $.each($treeTemplate.find('.selected-item'),function (i,e) {
            $(e).children('.am-tree-item-name')
                .children('.am-icon-angle-right')
                .removeClass('am-icon-angle-right')
                .addClass('am-icon-check');
        })
    },50)
}

/**
 *  异步单选树选择事件 获取选中值
 */
function asyncSingleSelectAction(){
    $('.treeValue').val($('#tree-template').tree("selectedItems")[0].id);
    $('.treeSelector').val($('#tree-template').tree("selectedItems")[0].title);
    $('#treeTips').modal('close');
}

/**
 * 机构树模态方法
 */
function treeTipsModal($tips) {
    $tips.modal('open');
}

/**
 * 页面 通用 数据数量 改变事件
 * #limitSelector
 */
$("#limitSelector").on("change",function(){
    if ($('.paramFrom').data('flush') == '1'){
        initDataTable()
    }
})


/**
 * 页面 通用 排序方式 改变事件
 * #orderBySelector
 */
$("#orderBySelector").on("change",function(){
    if ($('.paramFrom').data('flush') == '1'){
        initDataTable()
    }
})


/**
 * 数据列表 删除按钮
 */
$('body').on('click', '.list-del-button', function() {
    $(".confirm-modal-title").html("警告");
    $(".confirm-modal-message").html("你，确定要删除这条记录吗？");
    $(".confirm-modal-btn-cancel").html("取消");
    $(".confirm-modal-btn-confirm").html("确定");
    $('#confirm-modal').modal({
        relatedTarget: this,
        onConfirm: function(){
            var $link = $(this.relatedTarget).data('url');
            doGet($link,null,function(){initDataTable()})
        },
        onCancel: function(){}
    });
});

/**
 * Http post 请求
 * @param url 请求地址
 * @param param 请求参数
 * @param completeHandler 回调函数
 */
function doPost(url,param,completeHandler) {
    $.AMUI.progress.start();
    $.ajax({
        url:url,
        type:"POST",//请求方式
        dataType:"json",//返回参数的类型
        // contentType:"utf-8",//发送请求的编码方式
        data:param,
        success:function (data) {//请求成功后调用的函数
            completeHandler(data);
            $.AMUI.progress.done();
        }
    })
}

/**
 * Http post 同步请求
 * @param url 请求地址
 * @param param 请求参数
 * @param completeHandler 回调函数
 */
function doPostSync(url,param,completeHandler) {
    $.AMUI.progress.start();
    $.ajax({
        url:url,
        async: false,
        type:"POST",//请求方式
        dataType:"json",//返回参数的类型
        // contentType:"utf-8",//发送请求的编码方式
        data:param,
        success:function (data) {//请求成功后调用的函数
            completeHandler(data);
            $.AMUI.progress.done();
        }
    })
}

/**
 * Http get 请求
 * @param url 请求地址
 * @param param 请求参数
 * @param completeHandler 回调函数
 */
function doGet(url,param,completeHandler) {
    $.AMUI.progress.start();
    $.ajax({
        url:url,
        type:"GET",//请求方式
        dataType:"json",//返回参数的类型
        contentType:"utf-8",//发送请求的编码方式
        data:param,
        success:function (data) {//请求成功后调用的函数
            completeHandler(data);
            $.AMUI.progress.done();
        }
    })
}

/**
 * Http get html 请求
 * @param url 请求地址
 * @param param 请求参数
 * @param completeHandler 回调函数
 */
function doGetHtml(url,param,completeHandler) {
    $.ajax({
        url:url,
        type:"GET",//请求方式
        dataType:"html",//返回参数的类型
        contentType:"utf-8",//发送请求的编码方式
        data:param,
        success:function (data) {//请求成功后调用的函数
            completeHandler(data);
        }
    })
}

/**
 * 统一的弹框提示
 */
function alert(title,message,buttonTitle){
    $(".alert-modal-message").html(message);
    $(".alert-modal-title").html(title);
    $(".alert-modal-button").html(buttonTitle);
    $('#alert-modal').modal('open');
}

/**
 * 统一的错误提示
 */
function error() {
    $(".alert-modal-message").html("程序出了一丢丢小意外,赶紧联系程序猿解决吧!");
    $(".alert-modal-title").html("诶呀麻鸭,服务见鬼啦! |*´Å`)ﾉ ");
    $(".alert-modal-button").html("额...好吧");
    $('#alert-modal').modal('open');
}


/**
 * 显示上传文件的弹框
 */
function uploadFile(completeHandler,target) {
    var disabled = $(target).attr('disabled');
    if(disabled == 'disabled'){
        return;
    }
    initUploadModal(completeHandler);
    $('#upload-modal').modal('open');

}



/*初始化上传文件控件模态窗*/
function initUploadModal(completeHandler) {
    var $uploadTips = $('#upload-modal');
    $uploadTips.html(template('tpl-uploadTips',null));
    var upload=$('#uploadFileWidget').AmazeuiUpload({
        url : '/upload/uploadmultipartfile',
        downloadUrl :'/upload/downfile',
        maxFiles: 5, // 单次上传的数量
        maxFileSize: 10, // 单个文件允许的大小 (M)
        multiThreading: false, // true为同时上传false为队列上传
        useDefTemplate: true, //是否使用表格模式
        dropType: true, //是否允许拖拽
        pasteType: false //是否允许粘贴
    });
    upload.init(); //对象初始化
    /*监听弹框关闭事件*/
    $('body').on('close.modal.amui', '#upload-modal', function() {
        upload.destory();
    })
    $('body').on("click",'.upload-file-submit',function(){
        var arr=upload.selectResult();
        completeHandler(arr)
    });
}





/**
 * 通用 数据列表 拼接 查询参数 及 条件
 * @returns {string}
 */
function formatQueryFromParam() {
    var conditionStr = "";
    var paramList = $(".paramFrom").find(".paramInput");
    for(var i=0;i<paramList.length;i++){
        var $tepm = $(paramList[i])
        if ($tepm.val() != "") {

            if (conditionStr.length > 0) {
                conditionStr += "-"
            }
            conditionStr += $tepm.attr("param-pattern") + $tepm.val()
        }
    }
    return conditionStr;
}


/**
 * j-frame高度自适应
 */
function reHeightonebeanFrame(target){
    var mainheight = $(target).contents().find("body").height();
    $(target).height(mainheight);
}
/**
 * 查看tab左边的标签页
 */
function checkBarLeft(){
    var locker = new TapLocker();
    locker.setIsLock(true);//锁起来
    if(locker.getIsLock()){
        var marginLeftVal = (Math.abs(parseInt($('.am-nav-tabs').css('margin-left'))));//当前偏移量
        var tabWidth = $('#onebean-frame-container').outerWidth(true);//整个tab宽度
        var tabButtonWidth = $('.onebean-nav-buttons').outerWidth(true);//tab按钮区宽度
        var $tab = $('#onebean-frame-container');
        var $nav = $tab.find('.am-tabs-nav');
        var $Jtabs = $nav.find('li');//所有tab页
        var tabsWidthNum = 0;//遍历的tab累计宽度
        var offsetVal = 0;//偏移值
        var tabShowWidth = tabWidth - tabButtonWidth;//视距宽度
        var xPoint = marginLeftVal-tabShowWidth;//去往目标的偏移量
        var tempWidth = 0;
        if(xPoint > 0){
            var $item  = $Jtabs.first();
            while (tabsWidthNum < xPoint) {//遍历tabs离目标最近的tabs的宽度
                tempWidth = $($item).outerWidth(true);
                tabsWidthNum += tempWidth;
                $item = $Jtabs.next();
            }
            offsetVal = tabsWidthNum;//离目标最近的tabs累计宽度便是偏移量
        }else{
            offsetVal = 0;
        };
        $('.am-nav-tabs').animate({
            marginLeft: -offsetVal + 'px'
        }, "fast");
    }
    locker.setIsLock(false);//解锁
}
/**
 * 查看tab右边的标签页
 */
function checkBarRight(){
    var locker = new TapLocker();
    locker.setIsLock(true);//锁起来
    if(locker.getIsLock()){

        var marginLeftVal = Math.abs(parseInt($('.am-nav-tabs').css('margin-left')));//左边距
        var tabWidth = $('#onebean-frame-container').outerWidth(true);//tab栏宽度
        var tabButtonWidth = $('.onebean-nav-buttons').outerWidth(true);//tab按钮栏宽度
        var $tab = $('#onebean-frame-container');
        var $nav = $tab.find('.am-tabs-nav');
        var $Jtabs = $nav.children('li');//tabs
        var tabsWidthSum = calSumWidth($Jtabs);//所有tabs宽度
        var tabsWidthNum = 0;//tabs的累计宽度
        var offsetVal = 0;//偏移值
        var tabShowWidth = tabWidth - tabButtonWidth;//tabs的视距宽度
        var leftLength = marginLeftVal+tabShowWidth;//最右边的tab距离最左端的偏移量
        var $item  = $Jtabs.first();
        while (tabsWidthNum < leftLength) {//遍历tabs获取视距内最右边的tab计算出偏移量
            var tempWidth = $($item).outerWidth(true);
            tabsWidthNum += tempWidth;
            offsetVal = ((marginLeftVal + tabShowWidth - tabsWidthNum) < 0 )
                ?(tabsWidthNum - tempWidth):(tabsWidthNum + tempWidth);
            $item = $Jtabs.next();
        }
        // if(true){//右边有余量的时候滚动
        if((tabsWidthSum - marginLeftVal - tabShowWidth)>0){//右边有余量的时候滚动
            $('.am-nav-tabs').animate({
                marginLeft: -offsetVal + 'px'
            }, "fast");
        }
    }
    locker.setIsLock(false);//解锁
}
//计算元素集合的总宽度
function calSumWidth(target) {
    var width = 0;
    $.each(target, function(index,item) {
        width += $(item).outerWidth(true);
    })
    return width;
}

/**
 * 单列模式的菜单锁
 */
var TapLocker = (function() {
    var instance;
    var TapLocker = function() {
        if (instance) {
            return instance;
        }
        return instance = this;
    };
    TapLocker.prototype.isLock = false;
    TapLocker.prototype.setIsLock = function(bool) {
        this.isLock = bool;
    }
    TapLocker.prototype.getIsLock = function() {
        return this.isLock;
    }
    return TapLocker;
})();

/**
 * 去除字符串空格
 * @param str
 * @returns {XML|string|void}
 * @constructor
 */
function trim(str){
    return str.replace(/(^\s*)|(\s*$)/g, "");
}

/**
 * 序列化from成json
 * @returns {{}}
 */
$.fn.serializeJson = function() {
    var arr = this.serializeArray();
    var json = {};
    arr.forEach(function(item) {
        var name = item.name;
        var value = trim(item.value);

        if (!json[name]) {
            json[name] = value;
        } else if ($.isArray(json[name])) {
            json[name].push(value);
        } else {
            json[name] = [json[name], value];
        }
    });
    return json;
}

/**
 * 跳转地址
 * @param url
 */
function goUrl(url) {
    window.location.href = url;
}

/**
 * 跳转详情页
 * @param url
 */
function goDetail(target) {
    window.location.href = $(target).data('url');
}

/**
 * 折叠树 递归函数入口
 * @param target
 */
function foldingChildTree(target) {
    var pid = $(target).parents('tr').data('id');
    foldingChildTree2ed(target,pid)
}

/**
 * 折叠树 递归函数主体
 * @param target
 * @param ppid
 */
function foldingChildTree2ed(target,ppid) {
    var pid = $(target).parents('tr').data('id');
    var $childTrees = $('#example-r').find($('tr[data-pid='+pid+']'));
    var $parent = $('#example-r').find($('tr[data-id='+pid+']'));
    var $temp;
    for(var i = 0;i<$childTrees.length;i++){
        $temp = $($childTrees.get(i));
        var isHide = $temp.attr("isHide");
        var hideChild = $parent.attr("hideChild");
        if(pid == ppid){   //直接操作子元素
            foldingChildTree3th($temp,target,isHide,$parent,ppid,hideChild,false,i)
        }else{//跨级操作派生元素
            if((isHide == "false" && $parent.attr("hideChild") == "false")|| //子元素未被隐藏
                (isHide == "true" && $parent.attr("hideChild") == "false")){//子元素被根隐藏,未被父元素隐藏
                foldingChildTree3th($temp,target,isHide,$parent,ppid,hideChild,true,i)
            }
        }
    }
}

/**
 * 折叠树 折叠操作方法
 * @param $temp
 * @param target
 * @param isHide
 * @param $parent
 * @param ppid
 * @param cross
 */
function foldingChildTree3th($temp,target,isHide,$parent,ppid,hideChild,cross,index) {
    $temp.toggle();
    var $icon = $(target).find('i');
    isHide = (isHide == "true")?false:true;
    hideChild = (hideChild == "true")?true:false;
    hideChild = (!cross && index == 0)?!hideChild:hideChild;
    if(hideChild){
        $icon.addClass('am-icon-arrow-right');
        $icon.removeClass('am-icon-arrow-down');
    }else {
        $icon.addClass('am-icon-arrow-down');
        $icon.removeClass('am-icon-arrow-right');
    }
    $temp.attr("isHide",isHide);
    $parent.attr("hideChild",hideChild);
    foldingChildTree2ed($temp.find('a'),ppid)
}