"use strict";
/**
 * @font-size
 * title,legend : 1.4rem
 * xAxis,yAxis : 0.9rem
 * loading : 1.6rem
 * color warning(#ff6347) : 2.4rem
 * **/
Highcharts.setOptions({
    global:{
        useUTC : false
    },
    title: {
        text: null,
        align: 'left',
        y: 15,
        style: {
            color: '#333',
            fontSize: '1.4rem',
            fontWeight: "normal"
        }
    },
    colors: ['#ff6347','#F62366', '#9DFF02', '#0CCDD6'],  //#FFE0DA
    legend:{
        enabled: false,
        backgroundColor:(Highcharts.theme&&Highcharts.theme.legendBackgroundColor)|| '#ffffff',
        align: 'right',
        verticalAlign: 'top',
        itemStyle: {
            fontSize: '1.4rem'
        }
    },
    xAxis:{
        gridLineColor: '#f2f2f2',
        gridLineWidth: 1,//网格线宽度
        minorTickInterval: 'auto',
        min:0,
        labels: {
            style: {
                fontSize: '1.0rem',
                fontFamily: 'Verdana, sans-serif'
            }
        }
    },
    yAxis:{
        gridLineColor: '#f2f2f2',
        // lineWidth: 1,    //刻度线
        // gridLineWidth: 1,//网格线宽度
        minorTickInterval: null, //次刻度线的间隔 "auto"
        title:{
            text: null
        },
        min:0,
        minRange: 1,
        pointStart: 0,
        labels: {
            tickInterval:1, //让刻度不出现间断效果
            style: {
                fontSize: '1.0rem',
                fontFamily: 'Verdana, sans-serif'
            }
        }
    },
    tooltip:{
        backgroundColor: '#ff6347',
        style:{
            color: '#fff'
        }
    },
    credits:{
        enabled:false
    },
    plotOptions:{
        areaspline:{
            fillOpacity:0.2  //透明度
        },
        area:{
            fillOpacity:0.2
        },
        column:{
            fillOpacity:0.2,
            borderWidth: 1
        },
        bar:{
            fillOpacity:0.2,
            borderWidth: 1
        },
        series:{
            lineWidth:1,
            marker:{
                radius:0,
                states:{
                    hover:{
                        radius:4,
                        radiusPlus:4
                    }
                }
            },
            states:{
                hover:{
                    lineWidth:1,
                    lineWidthPlus:0
                }
            }
        },
    },
    lang:{
        loading: '数据载入中...',
        noData:"暂无数据"
    },
    loading:{
        hideDuration: 1000,
        showDuration: 1200,
        labelStyle: {
            color: '#929292'
        },
        style: {
            fontWidth:'normal',
            fontSize:'1.6rem',
            backgroundColor: '#ececec',
            opacity: 0.8,
            textAlign: 'center'
        }
    },
    noData:{
        style:{
            fontWidth:'normal',
            fontSize:'1.6rem',
            color:'#929292'
        }
    }
});

/**
 * #defined TEST,TESTALL bool {true:"devDependencies",false:"dependencies"}
 * 1 - 测试部分模块 TEST:true,TESTALL:true OR false
 * 2 - 测试全部模块 TEST:false,TESTALL:true
 * 3 - dependencies TEST:false,TESTALL:false
 * **/
var TEST = false;
var TESTALL = false;

var O = {
    root: "http://poly.hengtech.com.cn/pmsSrv/api/api!gateway.action",
    postUrl: '/pmsSrv/api/api!gateway.action',

    currentIndex: 0,
    $currentPage: null,
    currentDateType: 1,

    orgId: 40150,
    grade: 2,

    /**
     * [报事,缴费,巡检任务,巡检项,上线统计,微信上线概括,微信用户分析,微信运营情况]
     * **/
    tranCode:[],

    slider: function () {
        var control = navigator.control || {};
        if (control.gesture) {
            control.gesture(false);
        }

        var page='pageNav',
            slide='slider';

        var touch=new TouchSlider({
            id: slide,
            auto: '-1',
            fx: 'ease-out',
            direction: 'left',
            speed: 600,
            timeout: 5000,
            before: function(index){
                var list=document.getElementById(this.page).getElementsByTagName('li');
                list[this.p].className = '';
                list[index].className = 'active';

                this.p = index;
            },
            after: function (i) {
                if(O.currentIndex == i){
                    return;
                }else{
                    O.currentIndex = i;
                    O.manager();
                }
            }
        });

        touch.page = page;
        touch.p = 0;

        $('.subSlider').on('click','.subTab>a',function (e) {
            var $this = $(e.target);
            $this.addClass('active');
            $this.siblings().removeClass('active');

            O.manager(); //切换二级tab重新加载table、flow
        }).on('click','table.clickTrue tbody tr',function (e) {
            var $this = $(e.target);
            if ($this.is('td')){
                var $tr = $this.parent('tr');
                if ($tr.hasClass('head')){
                    return;
                }
                $tr.addClass('active');
                $tr.siblings().removeClass('active');

                var rowType = $tr.attr("row");
                O.flowManager(rowType,{}); //重新画图
            }
        }).on('click','table thead .rate',function (e) {
            var $this = $(e.target),
                _this;
            if ($this.is(".rate")){
                _this = $this;
            }
            if ($this.is(".q")){
                _this = $this.parent(".rate");
            }
            var $q = $(".q",_this);

            if ($q.length > 0){
                var $i = $("var",_this); //$i = $("i",_this);
                if ($i.is(":visible")){
                    return;
                }

                $i.fadeIn();
                clearTimeout(timer);
                var timer = setTimeout(function () {
                    $i.fadeOut();
                },3000);
            }
        });
    },

    tableManager: function () {
        var date = new Date(),t = (new Date().getTime()) - 24*3600*1000;
        var $subContent = $(".subContent",O.$currentPage),
            dateType = $('.subTab > a.active',O.$currentPage).data('type') || 1,
            timer = (new Date(t)).pattern("yyyy-MM-dd");
        var $table = $("table",$subContent),
            $nowDate = $(".header .nowDate",O.$currentPage);
        var $i = $("thead .rate var",$table); //$i = $("thead .rate i",$table);

        if ($i.length > 0){
            $i.text((dateType==1&&"(昨日值-前日值 )/前日值") || (dateType==2&&"(本周累计昨日值-上周同期累计值 )/上周同期累计值") || (dateType==3&&"(本月累计昨日值-上月同期累计值 )/上月同期累计值"));
        }

        if (dateType != undefined){
            var week = date.getDay();
            var temT = week==0 ? ((new Date().getTime()) - 24*3600*1000*7) : ((new Date().getTime()) - 24*3600*1000*week);
            // week = week==1?'周一':('周一 至 周'+ O.weekMap(week));
            week = (new Date(temT)).pattern("yyyy/MM/dd") + ' 至 ' + (new Date(t)).pattern("yyyy/MM/dd"); //上周日-昨天

            var month = date.getMonth(),
                fullYear = date.getFullYear();
            // month = month==0?'一月':('一月 至 '+ O.monthMap(month));
            // month = month==0 ? (fullYear+'/01') : (fullYear+'/01' + ' 至 '+ fullYear + '/' + O.monthMap2(month));
            month = fullYear+'/'+O.monthMap2(month)+'/01'+ ' 至 ' + (new Date(t)).pattern("yyyy/MM/dd");

            var str = (dateType==1 && ((new Date(t)).pattern("yyyy/MM/dd"))) || (dateType==2 && week) || (dateType==3 && month);
            $nowDate.text('('+ str +')');
        }else{
            var str = '截止'+ (new Date(t)).pattern("yyyy/MM/dd"); //date.pattern("yyyy/MM/dd")
            $nowDate.text('('+ str +')');
        }

        var jsonData = JSON.stringify({
            tranCode : O.tranCode[O.currentIndex],
            isEncryption : 0,
            bizContent : {
                date: timer, //'2016-12-12' timer
                orgId: O.orgId,
                grade: O.grade,
                type : dateType,
                datetype: 1, //数据展示形态 1:汇总,2:明细
                numType: ''
            }
        });

        var layerIndex = layer.load(2,{shade: [0.1,'#fff']});
        if(O.currentIndex == 0){
            $(".layui-layer-loading").css({
                "top": "50%",
                "left": "45%",
                "transform": "translate(-50%,-50%)",
                "position": "absolute"
            });
        }

        $.ajax({
            url: O.postUrl,
            type: 'POST',
            dataType: 'json',
            data: jsonData,
            contentType: 'application/json',
            complete: function (result,status) {
                layer.close(layerIndex);

                if(status=='timeout'){
                    layer.msg('请求超时,请稍后重试!',{icon: 2,shift:3});
                    return;
                }

                if (result.responseJSON && result.responseJSON.msgCode != undefined && result.responseJSON.msgCode == 0){
                    var  data = result.responseJSON.bizContent;
                    for (var key in data){
                        if (!Array.isArray(data[key]) && typeof data[key] !== 'object'){
                            data[key] = parseFloat(data[key]);
                        }
                    }

                    //表格分类处理
                    if ($table.length > 0){
                        var $tbody = $("tbody",$table[0]);
                        var $activeTr = $("tr.active",$tbody);
                        var rowType = $activeTr.attr("row");

                        O.writeHtml($table,data);

                        if (rowType != undefined){
                            O.flowManager(rowType,{}); //ajax
                        }else{
                            O.flowManager("null",data);
                        }
                    }else{
                        var $square = $(".square",O.$currentPage);
                        O.writeHtml($square,data);
                    }
                }else{
                    if (TEST || TESTALL){
                         var data = {
                            "inspectAbnormal": 5,
                            "inspectCompleteCount": 17,
                            "inspectCount": 57912,
                            "time": 125,
                            "taskCount": 10498,
                            "taskCompleteCount": 3,
                        };
                        O.flowManager("null",data);
                    }
                }
            },
            error: function (xhr) {
                layer.close(layerIndex);
                O.flowManager("null",{});
            }
        });
    },

    /**
     * 图表封装
     * @param rowType 表格中有详细内容的项目,对应numType(即为numType),无则为undefined或null或""
     * **/
    flowManager: function (rowType,data) {
        var $flow = $(".flow",O.$currentPage);
        if ($flow.length > 0){
            var dateType = $('.subTab > a.active',O.$currentPage).data('type') || 1;

            var chartType = $flow.data("type"),
                id = $flow.attr("id"),
                options = {},
                category = [],
                series = [];
            var $chart = $('#' + id);

            if(rowType == undefined || rowType == "" || rowType== "null"){
                if (chartType == 'area'){
                    category = [];
                    series = [];
                }else if (chartType=='column'){
                    category = ['现金','POS','银行托收','转账','支票','微信','支付宝','其他'];
                    series = [data.cash,data.pos,data.delegate,data.exchange,data.check,(data.wechatOnline+data.wechatOffline),(data.alipayOnline+data.alipayOffline),data.other];
                }else if (chartType=='solidgauge'){
                    var tmpData = (O.getRate(data.inspectAbnormal,data.inspectCompleteCount,2)*100).toFixed(2);
                    series = parseFloat(tmpData);
                }

                options = O.flowOption(category,series,chartType,dateType);
                $chart.highcharts(Highcharts.merge(options,{}));
            }else{
                var t = (new Date().getTime()) - 24*3600*1000;
                var timer = (new Date(t)).pattern("yyyy-MM-dd");
                var subData = JSON.stringify({
                    tranCode : O.tranCode[O.currentIndex],
                    isEncryption : 0,
                    bizContent : {
                        date: timer, //'2016-12-12' timer
                        orgId: O.orgId,
                        grade: O.grade,
                        type: dateType,
                        datetype: 2,
                        numType: rowType //1:客户报事,2:客户工单,3:内部报事,4:内部工单
                    }
                });

                var loadOption = {
                    chart: {
                        type: chartType,
                        renderTo: id,
                    }
                };
                var charts = new Highcharts.Chart(loadOption);
                charts.hideNoData();
                charts.showLoading();

                $.ajax({
                    url: O.postUrl,
                    type: 'POST',
                    dataType: 'json',
                    data: subData,
                    contentType: 'application/json',
                    complete: function (re) {
                        var respone;
                        if (re.responseJSON && re.responseJSON.msgCode!=undefined && re.responseJSON.msgCode==0){
                            respone = re.responseJSON.bizContent;

                            if (chartType == 'area'){
                                respone = respone.data;
                                for (var j in respone){
                                    respone[j].num = parseFloat(respone[j].num);
                                    if (dateType == 1){
                                        var arr = (respone[j].time.split(' '))[1]; //日:{time:"2016-12-12 08",num:"3"}
                                        category.push(arr);
                                    }else if(dateType == 2){
                                        category.push(respone[j].time);
                                    }else{
                                        category.push(respone[j].time);
                                    }

                                    series.push(respone[j].num);
                                }
                            }else if(chartType=='column'){
                                for (var j in respone){
                                    respone[j] = parseFloat(respone[j]);
                                    category = ['现金','POS','银行托收','转账','支票','微信','支付宝','其他'];
                                    series.push(respone[j]);
                                }
                            }else if (chartType=='solidgauge'){
                                var tmpData = (O.getRate(respone.inspectAbnormal,respone.inspectCompleteCount,2)*100).toFixed(2);
                                series = parseFloat(tmpData);
                            }
                        }else{
                            if (chartType == 'area'){
                                category = [];
                                series = [];
                            }else if (chartType=='column'){
                                category = ['现金','POS','银行托收','转账','支票','微信','支付宝','其他'];
                                series = [];
                            }else if (chartType=='solidgauge'){
                                series = 0;
                            }
                        }

                        options = O.flowOption(category,series,chartType,dateType);
                        $chart.highcharts(Highcharts.merge(options,{}));
                    },
                    error: function (xhr) {
                        charts.hideLoading();
                        charts.showNoData();
                    }
                });
            }
        }
    },

    /**
     * 图表动态选项
     * @param Array category x轴
     * @param Array series 数据列
     * @param String chartType 图表类型
     * @param String dateType 日期类型{1:日,2:周,3:月}
     * **/
    flowOption: function (category,series,chartType,dateType) {
        var options = {};
        if (chartType == 'area'){
            options = {
                chart: {
                    type:'area',
                    events: {
                        load: function() {
                            var series = this.series;
                        }
                    }
                },
                series: [{
                    name: '累计报事',
                    color:'#ff6347',
                    data: series
                }],
                xAxis:{
                    categories: category,
                    labels: {
                        formatter:function(){
                            var val;
                            /*
                             switch (parseInt(dateType)){
                             case 1:
                             val = this.value;
                             break;
                             case 2:
                             val = this.value; // '周' + O.weekMap(this.value);
                             break;
                             case 3:
                             val = this.value; // Highcharts.dateFormat('%Y/%m/%d',this.value);
                             break;
                             default:
                             val = this.value;
                             break;
                             }
                             */
                            val = this.value;
                            return val; // return Highcharts.dateFormat('%H:%M',this.value);
                        }
                    }
                },
                yAxis:{
                    labels: {
                        formatter:function(){
                            return this.value;
                        }
                    }
                },
                tooltip:{
                    backgroundColor: '#ff6347',
                    formatter:function(){
                        var xVal;
                        /*
                         switch (parseInt(dateType)){
                         case 1:
                         xVal = this.x+':00-'+this.x+':59';
                         break;
                         case 2:
                         xVal = this.x; // '周' + O.weekMap(this.x);
                         break;
                         case 3:
                         xVal = this.x; // Highcharts.dateFormat('%Y/%m/%d',this.x);
                         break;
                         default:
                         xVal = this.x;
                         break;
                         }
                         */
                        if (parseInt(dateType) == 1){
                            xVal = this.x+':00-'+this.x+':59';
                        }else{
                            xVal = this.x;
                        }
                        return '时间点:'+ xVal +'<br/>'+'报事量:'+this.y; //return '<b>'+this.series.name+'</b><br/>'+'时间点:'+Highcharts.dateFormat('%H:%M',this.x)+'<br/>'+'报事量:'+this.y;
                    }
                }
            };
        }else if (chartType=='column'){
            options = {
                chart: {
                    type: 'column'
                },
                colors: ['#ff6347'],
                xAxis: {
                    type: 'category',
                    categories: category
                },
                tooltip: {
                    borderColor: Highcharts.getOptions().colors[0],
                    pointFormat: '<b>{point.y:.2f}</b>'
                },
                series: [{
                    name: 'Population',
                    borderColor: Highcharts.getOptions().colors[0], // enableMouseTracking: false,  //取消鼠标上移效果
                    color: '#FFE0DA',
                    data: series,
                    states:{
                        hover:{
                            enabled:true,
                            color: '#FFE0DA'
                        }
                    },
                    dataLabels: {
                        enabled: false,
                        rotation: -90,
                        color: '#FFFFFF',
                        align: 'right',
                        format: '{point.y:.1f}',
                        y: 10,
                        style: {
                            fontSize: '1.2rem'
                        }
                    }
                }]
            };
        }else if (chartType=='solidgauge'){
            options = {
                chart: {
                    type: 'solidgauge'
                },
                title: {
                    useHTML : true,
                    // floating: true,
                    align: 'center',
                    verticalAlign:'middle',
                    text: '<b style="color:#ff6347;font-size: 2.4rem;">'+series+'%</b><br>异常率',
                    style: {
                        fontSize: '1.2rem',
                        textAlign : 'center',
                        verticalAlign:'middle'
                    }
                },
                tooltip: {
                    enabled: false,
                    borderWidth: 0,
                    backgroundColor: 'none',
                    shadow: false,
                    style: {
                        fontSize: '16px'
                    },
                    pointFormat: '{series.name}<br><span style="font-size:2em; color: {point.color}; font-weight: bold">{point.y}%</span>',
                    positioner: function (labelWidth, labelHeight) {
                        return {
                            x: 200 - labelWidth / 2,
                            y: 180
                        };
                    }
                },
                pane: {
                    startAngle: 0,
                    endAngle: 360,
                    background: [{
                        outerRadius: '110%', //112
                        innerRadius: '90%',  //88
                        backgroundColor:'#eee',
                        borderWidth: 0
                    }]
                },
                yAxis: {
                    min: 0,
                    max: 100,
                    lineWidth: 0,
                    tickPositions: [],
                    labels: {
                        formatter:function(){
                            return Highcharts.numberFormat(this.value, 2);
                        }
                    }
                },
                plotOptions: {
                    solidgauge: {
                        borderWidth: '7.5%',  //34
                        dataLabels: {
                            enabled: false
                        },
                        linecap: 'round',
                        stickyTracking: false
                    }
                },
                series: [{
                    name: '异常项',
                    borderColor: Highcharts.getOptions().colors[0],
                    data: [{
                        color: Highcharts.getOptions().colors[0],
                        radius: '100%',
                        innerRadius: '100%',
                        y: series
                    }]
                }]
            };
        }
        return options;
    },

    /**
     * slider index function manager
     * 操作入口
     * @param Int index 滑动的当前tab的索引
     * function tableManager() 管理table内容
     * function drawFlow() 管理图表内容
     * **/
    manager: function () {
        O.$currentPage = $(".sliderContentUl > li").eq(O.currentIndex);
        O.tableManager();
    },

    /**
     * 表格数据填充
     * **/
    writeHtml: function ($table,data) {
        if (data == undefined || data == null || data == {}){
            return;
        }
        var tableName = $table.data("name") || "null";
        switch (tableName){
            case "postit":
                var current = data.curreDate,
                    last = data.lastDate;
                if(current==undefined || current.length<=0){
                    current = [{"name":"客户报事","numType":"1","Comple":"0","All":"0"},{"name":"客户工单","numType":"2","Comple":"0","All":"0"},{"name":"内部报事","numType":"3","Comple":"0","All":"0"},{"name":"内部工单","numType":"4","Comple":"0","All":"0"}];
                }

                var len = current.length;
                for (var i = 0;i<len;i++){
                    var currCom = current[i].Comple || 0,
                        currAll = current[i].All || 0,
                        lastCom = 0,
                        lastAll = 0;

                    switch (parseInt(current[i].numType)){
                        case 1:
                            data.complete1 = currCom;
                            data.all1 = currAll;
                            data.complete1Count = O.getRate(data.complete1,currAll,2);
                            break;
                        case 2:
                            data.complete2 = currCom;
                            data.all2 = currAll;
                            data.complete2Count = O.getRate(data.complete2,currAll,2);
                            break;
                        case 3:
                            data.complete3 = currCom;
                            data.all3 = currAll;
                            data.complete3Count = O.getRate(data.complete3,currAll,2);
                            break;
                        case 4:
                            data.complete4 = currCom;
                            data.all4 = currAll;
                            data.complete4Count = O.getRate(data.complete4,currAll,2);
                            break;
                        default:
                            break;
                    }
                    if (last[i] == undefined){
                        last[i] = current[i];
                        last[i].Comple = 0;
                        last[i].All = 0;
                    }
                    lastCom = last[i].Comple;
                    lastAll = last[i].All;

                    switch (parseInt(last[i].numType)){
                        case 1:
                            data.lastComplete1 = lastCom;
                            break;
                        case 2:
                            data.lastComplete2 = lastCom;
                            break;
                        case 3:
                            data.lastComplete3 = lastCom;
                            break;
                        case 4:
                            data.lastComplete4 = lastCom;
                            break;
                        default:
                            break;
                    }
                }
                data.complete1Rate = O.getRate(data.complete1,data.lastComplete1,1);
                data.complete2Rate = O.getRate(data.complete2,data.lastComplete2,1);
                data.complete3Rate = O.getRate(data.complete3,data.lastComplete3,1);
                data.complete4Rate = O.getRate(data.complete4,data.lastComplete4,1);
                break;
            case "charge":
                data.thisOldRate = O.getRate(data.thisOld,data.passOld,1);
                data.thisNowRate = O.getRate(data.thisNow,data.passNow,1);
                data.thisPrepayRate = O.getRate(data.thisPrepay,data.passPrepay,1);
                break;
            case "patrol_task":
                data.taskCountRate = O.getRate(data.taskCount,data.pre_taskCount,1);
                data.taskCompleteCountRate = O.getRate(data.taskCompleteCount,data.pre_taskCompleteCount,1);

                var taskRangeTime = O.getRate(data.time,data.taskCompleteCount,2);
                data.taskRangeTime = taskRangeTime;

                var taskRangeTimeRate = O.getRate(taskRangeTime,O.getRate(data.pre_time,data.pre_taskCompleteCount,2),1);
                data.taskRangeTimeRate = taskRangeTimeRate;

                var completeRate = O.getRate(data.taskCompleteCount,data.taskCount,2);
                data.completeRate = completeRate;

                var passCompleteRate = O.getRate(completeRate,O.getRate(data.pre_taskCompleteCount,data.pre_taskCount,2),1);
                data.passCompleteRate = passCompleteRate;
                break;
            case "patrol_item":
                data.inspectCountRate = O.getRate(data.inspectCount,data.pre_inspectCount,1);
                data.inspectCompleteCountRate = O.getRate(data.inspectCompleteCount,data.pre_inspectCompleteCount,1);
                data.inspectAbnormalRate = O.getRate(data.inspectAbnormal,data.pre_inspectAbnormal,1);
                break;
            case "online":
                data = data.bizContent;
                break;
            case "wxonline":
                //不用处理数据
                data.total_pay = data.total_pay / 100;
                break;
            case "wxusers_analysis":
                data.customerNum = data.currentPeriod.customerNum;
                data.registerNum = data.currentPeriod.registerNum;
                data.attentionNum = data.currentPeriod.attentionNum;
                data.identifyNum = data.currentPeriod.identifyNum;
                data.propertyNum = data.currentPeriod.propertyNum;
                data.identifyPropertyNum = data.currentPeriod.identifyPropertyNum;

                data.customerNumRate = O.getRate(data.currentPeriod.customerNum,data.lastPeriod.customerNum,1);
                data.registerNumRate = O.getRate(data.currentPeriod.registerNum,data.lastPeriod.registerNum,1);
                data.attentionNumRate = O.getRate(data.currentPeriod.attentionNum,data.lastPeriod.attentionNum,1);
                data.identifyNumRate = O.getRate(data.currentPeriod.identifyNum,data.lastPeriod.identifyNum,1);
                data.propertyNumRate = O.getRate(data.currentPeriod.propertyNum,data.lastPeriod.propertyNum,1);
                data.identifyPropertyNumRate = O.getRate(data.currentPeriod.identifyPropertyNum,data.lastPeriod.identifyPropertyNum,1);
                break;
            case "wx_operation":
                data.cusReport = data.currentData.cusReport;
                data.bizHandle = data.currentData.bizHandle;
                data.visitorAccess = data.currentData.visitorAccess;
                data.openDoor = data.currentData.openDoor;
                data.bill = data.currentData.bill;

                data.cusReportRate = O.getRate(data.currentData.cusReport,data.lastData.cusReport,1);
                data.bizHandleRate = O.getRate(data.currentData.bizHandle,data.lastData.bizHandle,1);
                data.visitorAccessRate = O.getRate(data.currentData.visitorAccess,data.lastData.visitorAccess,1);
                data.openDoorRate = O.getRate(data.currentData.openDoor,data.lastData.openDoor,1);
                data.billRate = O.getRate(data.currentData.bill,data.lastData.bill,1);
                break;
            default:
                break;
        }

        var $tr = $('tbody tr',$table);  // $('[row="'+i+'"]',$table);
        if($tr.length <= 0){
            $tr = $table;  //.square
        }

        for (var k in data){
            var  $td = $("[name='"+k+"']",$tr);
            var type = $td.attr("type");
            if (type == "per"){
                if (typeof data[k] == "string"){
                    $td.removeClass("lowRed");
                    $td.html(data[k]);
                }else{
                    if (data[k] < 0){
                        $td.addClass("lowRed");
                    }else {
                        $td.removeClass("lowRed");
                    }
                    $td.html((data[k]*100).toFixed(2) + '%');
                }
            }else if (type == "timeCount"){
                $td.html(O.longTime(data[k]));
            }else if(type == "area"){
                $td.html(data[k]);
            }else{
                $td.html(data[k]);
            }
        }
    },

    /**
     * (1)增长率计算
     * @param Float a 本期
     * @param Float b 上期
     * @param Int type 1
     * 1.当上期数据为正数时，公式：利润增长率=（本期/上期-1）*100%，应用于企业非亏损状态。
     * 2.当上期数据为负数时，公式：亏损增长率=[1-(本期/上期)]*100%，应用于企业亏损状态或亏转盈状态。
     *
     * (2)当期平均值计算
     * @param Float a 完成数
     * @param Float b 总数
     * @param Int type 2
     * 公式：完成数/总数
     *
     * return float
     * **/
    getRate: function (a,b,type) {
        var rate = 0;
        a = parseFloat(a);
        b = parseFloat(b);
        var aIsNaN = a == 0 || a==null || a==undefined || isNaN(a),
            bIsNaN = b==0 || b==null || b==undefined || isNaN(b);
        if (bIsNaN){
            rate = type==1 ? '--' : 0;
        }else {
            if (aIsNaN){
                rate = 0;
            }else {
                if (type == 1){
                    if (b > 0){
                        rate = a/b-1;
                    }else {
                        rate = 1- (a/b);
                    }
                }else {
                    rate = a/b;
                }
            }
        }

        return rate;
    },

    test: function (a,b,type) {
        var rate;
        a = parseFloat(a);
        b = parseFloat(b);
        if (a <= 0 || a==null || a==undefined || isNaN(a)){
            rate = 0;
        }else{
            if (b<=0 || b==null || b==undefined || isNaN(b)){
                rate = 1;
            }else{
                rate = type==1 ? ((a-b)/b) : (a/b);
            }
        }
        return rate;
    },

    test2: function (a,b,type) {
        var rate = 0;
        a = parseFloat(a);
        b = parseFloat(b);
        var aIsNaN = a == 0 || a==null || a==undefined || isNaN(a),
            bIsNaN = b==0 || b==null || b==undefined || isNaN(b);
        if (bIsNaN){
            if (aIsNaN){
                rate = 0;
            }else{
                if (a < 0){
                    rate = -1;
                }else {
                    rate = 1;
                }
            }
        }else {
            if (aIsNaN){
                if (b < 0){
                    rate = 1;
                }else {
                    rate = -1;
                }
            }else {
                if (type == 1){
                    var c = a-b;
                    rate = c/(Math.abs(b));
                }else {
                    rate = a/b;
                }
            }
        }

        return rate;
    },

    /**
     * 时间长度转换
     * @param Int a 单位秒
     * return hh:mm:ss
     * **/
    longTime: function (a) {
        var hh = parseInt(a/3600);
        if(hh < 10) hh = "0" + hh;
        var mm = parseInt((a - hh*3600)/60);
        if(mm < 10) mm = "0" + mm;
        var ss = parseInt((a - hh*3600)%60);
        if(ss < 10) ss = "0" + ss;
        var length = hh + ":" + mm + ":" + ss;
        if(a > 0){
            return length;
        }
        return "00:00:00";
    },

    /**
     * js周描述 return string
     * **/
    weekMap: function (week) {
        var desc = {"1":"一","2":"二","3":"三","4":"四","5":"五","6":"六","0":"日",undefined:""};
        return desc[week];
    },

    /**
     * js月描述 return string
     * **/
    monthMap: function (month) {
        var desc = {"0":"一","1":"二","2":"三","3":"四","4":"五","5":"六","6":"七","7":"八","8":"九","9":"十","10":"十一","11":"十二",undefined:""};
        return desc[month];
    },

    monthMap2: function (month) {
        var desc = {"0":"01","1":"02","2":"03","3":"04","4":"05","5":"06","6":"07","7":"08","8":"09","9":"10","10":"11","11":"12",undefined:""};
        return desc[month];
    }
};

$(function () {
    (function initialize() {
        if (TEST){
            O.postUrl = '/api/api!gateway.action';

            $("#loading .text").html("Testing,Please wait...");

            var t = '{"grade":4,"orgId":100960,"authCodeList":[{"code":"hygj_report"},{"code":"hygj_report_postit"},{"code":"hygj_report_charge"},{"code":"hygj_report_patrol_task"},{"code":"hygj_report_patrol_item"},{"code":"hygj_report_online"},{"code":"hygj_report_wxonline"},{"code":"hygj_report_wxusers_analysis"},{"code":"hygj_report_wx_operation"}]}';
            t = '{"grade":4,"orgId":100960,"authCodeList":[{"code":"hygj_report_wxonline"},{"code":"hygj_report_wxusers_analysis"},{"code":"hygj_report_wx_operation"}]}';
            t = '{"grade":4,"orgId":91387,"authCodeList":[{"code":"hygj_report_postit"},{"code":"hygj_report_online"},{"code":"hygj_report_wxonline"},{"code":"hygj_report_wxusers_analysis"}]}';
            init(t);
        }else if (TESTALL){
            O.postUrl = '/api/api!gateway.action';

            O.tranCode = [3025,2413,3020,3020,3026,3023,3022,3024];
            O.grade = 2;
            O.orgId = 40150;
            var $loading = $("#loading");
            $(".text",$loading).html("Testing,Please wait...");
            $("#pageNav > li").eq(0).addClass("active");
            $loading.hide();
            $("#slider,.mainTabWrap").show();
            O.slider();
            O.manager();
        }
    }());
});

function init(respone) {
    var json = $.parseJSON(respone),
        $slider = $("#slider"),
        $mainTabWrap = $(".mainTabWrap");
    var $sliderContentUl = $(".sliderContentUl > li",$slider),
        $pageNav = $("#pageNav > li",$mainTabWrap);
    var tempTranCode = [3025,2413,3020,3020,3026,3023,3022,3024];

    O.grade = json.grade;
    O.orgId = json.orgId;

    var jsonCode = json.authCodeList;
    var isd = [];

    $sliderContentUl.each(function (i) {
        var _this = $(this);
        var code = "hygj_report_" + _this.data("name");
        var isDelete = true;

        for (var k in jsonCode){
            if (code == jsonCode[k].code){
                isDelete = false;
                break;
            }
        }

        isd.push(isDelete);

        if (isDelete){
            $sliderContentUl.eq(i).remove();
            $pageNav.eq(i).remove();
        }else{
            O.tranCode.push(tempTranCode[i]);
        }

    });

    /*
     let jsonCode = [];
     for (var j in json.authCodeList){
     if (json.authCodeList[j].code != "hygj_report_auth_code"){
     jsonCode.push(json.authCodeList[j].code);
     }
     }

     for (let k in jsonCode){
     let isDelete = true;

     $sliderContentUl.each(function () {
     let _this = $(this);
     let code = "hygj_report_" + _this.data("name");

     if (code == jsonCode[k].code){
     isDelete = false;
     return false;
     }
     });

     isd.push(isDelete);

     if (isDelete){
     $sliderContentUl.eq(k).remove();
     $pageNav.eq(k).remove();
     }else{
     O.tranCode.push(tempTranCode[k]);
     }
     }
     */

    $("#pageNav > li",$mainTabWrap).eq(0).addClass("active");

    $("#loading").hide();
    $slider.show();
    $mainTabWrap.show();

    O.slider();
    O.manager();
}