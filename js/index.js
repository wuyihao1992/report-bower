{
    /**
     * @font-size
     * title,legend : 1.4rem
     * xAxis,yAxis : 1.2rem
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
                    fontSize: '1.2rem',
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
            pointStart: 0,
            labels: {
                tickInterval:1 //让刻度不出现间断效果
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
    const TEST = false;
    const TESTALL = false;

    var O = {
        root: "http://poly.hengtech.com.cn/pmsSrv/api/api!gateway.action",
        postUrl: '/api/api!gateway.action',

        currentIndex: 0,
        $currentPage: null,
        currentDateType: 1,

        orgId: 91492,
        grade: 4,

        /**
         * [报事,缴费,巡检任务,巡检项,上线统计,微信上线概括,微信用户分析,微信运营情况]
         * **/
        tranCode:[],

        slider: function () {
            let control = navigator.control || {};
            if (control.gesture) {
                control.gesture(false);
            }

            let page='pageNav',
                slide='slider';

            let touch=new TouchSlider({
                id: slide,
                auto: '-1',
                fx: 'ease-out',
                direction: 'left',
                speed: 600,
                timeout: 5000,
                before: function(index){
                    let list=document.getElementById(this.page).getElementsByTagName('li');
                    list[this.p].className = '';
                    list[index].className = 'active';

                    this.p = index;
                },
                after: function (i) {
                    if(O.currentIndex == i){
                        return; //重复滑动
                    }else{
                        O.currentIndex = i;
                        O.manager();
                    }
                }
            });

            touch.page = page;
            touch.p = 0;

            $('.subSlider').on('click','.subTab>a',function (e) {
                let $this = $(e.target);
                $this.addClass('active');
                $this.siblings().removeClass('active');

                O.manager(); //切换二级tab重新加载table、flow
            }).on('click','table.clickTrue tbody tr',function (e) {
                let $this = $(e.target);
                if ($this.is('td')){
                    let $tr = $this.parent('tr');
                    if ($tr.hasClass('head')){
                        return;
                    }
                    $tr.addClass('active');
                    $tr.siblings().removeClass('active');

                    let rowType = $tr.attr("row");
                    O.flowManager(rowType,{}); //重新画图
                }
            }).on('click','table thead .rate',function (e) {
                let $this = $(e.target),
                    _this;
                if ($this.is(".rate")){
                    _this = $this;
                }
                if ($this.is(".q")){
                    _this = $this.parent(".rate");
                }
                let $q = $(".q",_this);

                if ($q.length > 0){
                    let $i = $("i",_this);
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
            let date = new Date(),t = (new Date().getTime()) - 24*3600*1000;
            let $subContent = $(".subContent",O.$currentPage),
                dateType = $('.subTab > a.active',O.$currentPage).data('type') || 1,
                timer = (new Date(t)).pattern("yyyy-MM-dd");
            let $table = $("table",$subContent),
                $nowDate = $(".header .nowDate",O.$currentPage);
            let $i = $("thead .rate i",$table);

            if ($i.length > 0){
                $i.text((dateType==1&&"(昨日值-前日值 )/前日值") || (dateType==2&&"(本周累计昨日值-上周同期累计值 )/上周同期累计值") || (dateType==3&&"(本月累计昨日值-上月同期累计值 )/上月同期累计值"));
            }

            if (dateType != undefined){
                let week = date.getDay();
                week = week==1?'周一':('周一 至 周'+ O.weekMap(week));

                let month = date.getMonth(),
                    fullYear = date.getFullYear();
                // month = month==0?'一月':('一月 至 '+ O.monthMap(month));
                month = month==0?(fullYear+'/01'):(fullYear+'/01' + ' 至 '+ fullYear + '/' + O.monthMap2(month));
                let str = (dateType==1 && (date.pattern("yyyy/MM/dd"))) || (dateType==2 && week) || (dateType==3 && month);
                $nowDate.text('('+ str +')');
            }else{
                let str = '截止'+date.pattern("yyyy/MM/dd");
                $nowDate.text('('+ str +')');
                /*
                let nowDateType = $nowDate.attr("type");
                if (nowDateType != undefined){
                    $nowDate.text((nowDateType=='till'&&('截止'+(new Date()).pattern("yyyy/MM/dd"))));
                }else{}
                */
            }


            let jsonData = JSON.stringify({
                tranCode : O.tranCode[O.currentIndex],
                isEncryption : 0,
                bizContent : {
                    date: timer, //'2016-12-05'
                    orgId: O.orgId,
                    grade: O.grade,
                    type : dateType,
                    datetype: 1, //数据展示形态 1 汇总，2 明细
                    numType: ''
                }
            });

            let layerIndex = layer.load(2,{shade: [0.1,'#fff']});
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
                // timeout : 15000,
                async: true,
                complete: function (result,status) {
                    layer.close(layerIndex);

                    if(status=='timeout'){
                        layer.msg('请求超时,请稍后重试!',{icon: 2,shift:3});
                        return;
                    }

                    if (result.responseJSON && result.responseJSON.msgCode != undefined && result.responseJSON.msgCode == 0){
                        let  data = result.responseJSON.bizContent;
                        for (let key in data){
                            if (!Array.isArray(data[key]) && typeof data[key] !== 'object'){
                                data[key] = parseFloat(data[key]);  //数据处理：string to float
                            }
                        }

                        //表格分类处理
                        if ($table.length > 0){
                            let $tbody = $("tbody",$table[0]);
                            let $activeTr = $("tr.active",$tbody);
                            let rowType = $activeTr.attr("row");

                            O.writeHtml($table,data);

                            if (rowType != undefined){
                                O.flowManager(rowType,{});  //ajax请求
                            }else{
                                O.flowManager("null",data);
                            }
                        }else{
                            let $square = $(".square",O.$currentPage);
                            O.writeHtml($square,data);
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
            let $flow = $(".flow",O.$currentPage);
            if ($flow.length > 0){
                let dateType = $('.subTab > a.active',O.$currentPage).data('type') || 1;

                let chartType = $flow.data("type"),
                    id = $flow.attr("id"),
                    options = {},
                    category = [],
                    series = [];
                let $chart = $('#' + id);

                if(rowType == undefined || rowType == "" || rowType== "null"){
                    if (chartType == 'area'){
                        category = [];
                        series = [];
                    }else if (chartType=='column'){
                        category = ['现金','POS','银行托收','转账','支票','微信','支付宝','其他'];
                        series = [data.cash,data.pos,data.delegate,data.exchange,data.check,(data.wechatOnline+data.wechatOffline),(data.alipayOnline+data.alipayOffline),data.other];
                    }else if (chartType=='solidgauge'){
                        series = data.inspectAbnormal;
                    }

                    options = O.flowOption(category,series,chartType,dateType);
                    $chart.highcharts(Highcharts.merge(options,{}));
                }else{
                    let t = (new Date().getTime()) - 24*3600*1000;
                    let timer = (new Date(t)).pattern("yyyy-MM-dd");
                    let subData = JSON.stringify({
                        tranCode : O.tranCode[O.currentIndex],
                        isEncryption : 0,
                        bizContent : {
                            date: timer, //'2016-12-05'
                            orgId: O.orgId,
                            grade: O.grade,
                            type: dateType,
                            datetype: 2,
                            numType: rowType  //1:客户报事,2:客户工单,3:内部报事,4:内部工单
                        }
                    });

                    let loadOption = {
                        chart: {
                            type: chartType,
                            renderTo: id,
                        }
                    };
                    let charts = new Highcharts.Chart(loadOption);
                    charts.hideNoData();
                    charts.showLoading();

                    $.ajax({
                        url: O.postUrl,
                        type: 'POST',
                        dataType: 'json',
                        data: subData,
                        complete: function (re,status) {
                            let respone;

                            if (re.responseJSON && re.responseJSON.msgCode!=undefined && re.responseJSON.msgCode==0){
                                respone = re.responseJSON.bizContent;

                                if (chartType == 'area'){
                                    respone = respone.data;
                                    for (let j in respone){
                                        respone[j].num = parseFloat(respone[j].num);
                                        category.push(j);
                                        series.push(respone[j].num);
                                    }
                                }else if(chartType=='column'){
                                    for (let j in respone){
                                        respone[j] = parseFloat(respone[j]);
                                        category = ['现金','POS','银行托收','转账','支票','微信','支付宝','其他'];
                                        series.push(respone[j]);
                                    }
                                }else if (chartType=='solidgauge'){
                                    series = respone.inspectAbnormal;
                                }
                            }else{
                                //无数据
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
            let options = {};
            if (chartType == 'area'){
                options = {
                    chart: {
                        type:'area',
                        events: {
                            load: function() {
                                let series = this.series;
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
                                let val;
                                switch (parseInt(dateType)){
                                    case 1:
                                        val = this.value;
                                        break;
                                    case 2:
                                        val = '周' + this.value;
                                        break;
                                    case 3:
                                        val = this.value + '月';
                                        break;
                                    default:
                                        val = this.value;
                                        break;
                                }
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
                            let xVal;
                            switch (parseInt(dateType)){
                                case 1:
                                    xVal = this.x+':00-'+this.x+':59';
                                    break;
                                case 2:
                                    xVal = '周' + this.x;
                                    break;
                                case 3:
                                    xVal = this.x + '月';
                                    break;
                                default:
                                    xVal = this.x;
                                    break;
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
                        text: '<b style="color:#ff6347;font-size: 2.4rem;">'+series+'%</b><br>异常项',
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
                        tickPositions: []
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
            let tableName = $table.data("name") || "null"; //charge
            switch (tableName){
                case "postit":
                    let current = data.curreDate,
                        last = data.lastDate;
                    let len = current.length;
                    for (let i = 0;i<len;i++){
                        let currCom = current[i].Comple,
                            currAll = current[i].All,
                            lastCom = last[i].Comple,
                            lastAll = last[i].All;

                        switch (parseInt(current[i].numType)){
                            case 1:
                                data.complete1 = currCom;
                                data.complete1Count = O.rangeRate(data.complete1,currAll);
                                break;
                            case 2:
                                data.complete2 = currCom;
                                data.complete2Count = O.rangeRate(data.complete2,currAll);
                                break;
                            case 3:
                                data.complete3 = currCom;
                                data.complete3Count = O.rangeRate(data.complete3,currAll);
                                break;
                            case 4:
                                data.complete4 = currCom;
                                data.complete4Count = O.rangeRate(data.complete4,currAll);
                                break;
                            default:
                                break;
                        }
                        switch (parseInt(last[i].numType)){
                            case 1:
                                data.lastComplete1 = lastCom;
                                // data.complete1Count = data.complete1 / currAll;
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
                    data.complete1Rate = O.upRate(data.complete1,data.lastComplete1);
                    data.complete2Rate = O.upRate(data.complete2,data.lastComplete2);
                    data.complete3Rate = O.upRate(data.complete3,data.lastComplete3);
                    data.complete4Rate = O.upRate(data.complete4,data.lastComplete4);
                    break;
                case "charge":
                    data.thisOldRate = O.upRate(data.thisOld,data.passOld);
                    data.thisNowRate = O.upRate(data.thisNow,data.passNow);
                    data.thisPrepayRate = O.upRate(data.thisPrepay,data.passPrepay);
                    break;
                case "patrol_task":
                    data.taskCountRate = O.upRate(data.taskCount,data.pre_taskCount);
                    data.taskCompleteCountRate = O.upRate(data.taskCompleteCount,data.pre_taskCompleteCount);

                    let taskRangeTime = O.rangeRate(data.time,data.taskCompleteCount);
                    data.taskRangeTime = taskRangeTime;

                    let taskRangeTimeRate = O.upRate(taskRangeTime,O.rangeRate(data.pre_time,data.pre_taskCompleteCount));
                    data.taskRangeTimeRate = taskRangeTimeRate;

                    let completeRate = O.rangeRate(data.taskCompleteCount,data.taskCount);
                    data.completeRate = completeRate;

                    let passCompleteRate = O.upRate(completeRate,O.rangeRate(data.pre_taskCompleteCount,data.pre_taskCount));
                    data.passCompleteRate = passCompleteRate;
                    break;
                case "patrol_item":
                    data.inspectCountRate = O.upRate(data.inspectCount,data.pre_inspectCount);
                    data.inspectCompleteCountRate = O.upRate(data.inspectCompleteCount,data.pre_inspectCompleteCount);
                    data.inspectAbnormalRate = O.upRate(data.inspectAbnormal,data.pre_inspectAbnormal);
                    break;
                case "online":
                    data = data.bizContent;
                    break;
                case "wxonline":
                    //不用处理数据
                    break;
                case "wxusers_analysis":
                    data.customerNum = data.currentPeriod.customerNum;
                    data.registerNum = data.currentPeriod.registerNum;
                    data.attentionNum = data.currentPeriod.attentionNum;
                    data.identifyNum = data.currentPeriod.identifyNum;
                    data.propertyNum = data.currentPeriod.propertyNum;
                    data.identifyPropertyNum = data.currentPeriod.identifyPropertyNum;

                    data.customerNumRate = O.upRate(data.currentPeriod.customerNum,data.lastPeriod.customerNum);
                    data.registerNumRate = O.upRate(data.currentPeriod.registerNum,data.lastPeriod.registerNum);
                    data.attentionNumRate = O.upRate(data.currentPeriod.attentionNum,data.lastPeriod.attentionNum);
                    data.identifyNumRate = O.upRate(data.currentPeriod.identifyNum,data.lastPeriod.identifyNum);
                    data.propertyNumRate = O.upRate(data.currentPeriod.propertyNum,data.lastPeriod.propertyNum);
                    data.identifyPropertyNumRate = O.upRate(data.currentPeriod.identifyPropertyNum,data.lastPeriod.identifyPropertyNum);
                    break;
                case "wx_operation":
                    data.cusReport = data.currentData.cusReport;
                    data.bizHandle = data.currentData.bizHandle;
                    data.visitorAccess = data.currentData.visitorAccess;
                    data.openDoor = data.currentData.openDoor;
                    data.bill = data.currentData.bill;

                    data.cusReportRate = O.upRate(data.currentData.cusReport,data.lastData.cusReport);
                    data.bizHandleRate = O.upRate(data.currentData.bizHandle,data.lastData.bizHandle);
                    data.visitorAccessRate = O.upRate(data.currentData.visitorAccess,data.lastData.visitorAccess);
                    data.openDoorRate = O.upRate(data.currentData.openDoor,data.lastData.openDoor);
                    data.billRate = O.upRate(data.currentData.bill,data.lastData.bill);
                    break;
                default:
                    break;
            }

            let $tr = $('tbody tr',$table);  // let $tr = $('[row="'+i+'"]',$table);
            if($tr.length <= 0){
                $tr = $table;  //.square
            }

            for (let k in data){
                let  $td = $("[name='"+k+"']",$tr);
                let type = $td.attr("type");
                if (type == "per"){
                    if (data[k] < 0){
                        $td.addClass("lowRed");
                    }else {
                        $td.removeClass("lowRed");
                    }
                    $td.html((data[k]*100).toFixed(2) + '%');
                }else if (type == "timeCount"){
                    $td.html(O.longTime(data[k])); //时间转换
                }else if(type == "area"){
                    $td.html(data[k]);
                }else{
                    $td.html(data[k]);
                }
            }
        },

        /**
         * 增长率计算
         * @param Float a 本期
         * @param Float b 上期
         * 公式：(本期-上期)/上期
         * return float
         * **/
        upRate: function (a,b) {
            let rate;
            a = parseFloat(a);
            b = parseFloat(b);
            if (a <= 0 || a==null || a==undefined || isNaN(a)){
                rate = 0;
            }else{
                if (b<=0 || b==null || b==undefined || isNaN(b)){
                    rate = 1; //100%
                }else{
                    rate = (a-b)/b;
                }
            }
            return rate;
        },

        /**
         * 当期平均值计算
         * @param Float a 完成数
         * @param Float b 总数
         * 公式：完成数/总数
         * return float
         * **/
        rangeRate : function (a,b) {
            let rate;
            a = parseFloat(a);
            b = parseFloat(b);
            if (a<=0 || a==null || a==undefined || isNaN(a)){
                rate = 0;
            }else{
                if (b<=0 || b==null || b==undefined || isNaN(b)){
                    rate = 1;
                }else{
                    rate = a/b;
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
            let hh = parseInt(a/3600);
            if(hh < 10) hh = "0" + hh;
            let mm = parseInt((a - hh*3600)/60);
            if(mm < 10) mm = "0" + mm;
            let ss = parseInt((a - hh*3600)%60);
            if(ss < 10) ss = "0" + ss;
            let length = hh + ":" + mm + ":" + ss;
            if(a > 0){
                return length;
            }
            return "00:00:00";
        },

        /**
         * js周描述 return string
         * **/
        weekMap: function (week) {
            let desc = {"1":"一","2":"二","3":"三","4":"四","5":"五","6":"六","0":"日"};
            return desc[week];
        },

        /**
         * js月描述 return string
         * **/
        monthMap: function (month) {
            let desc = {"0":"一","1":"二","2":"三","3":"四","4":"五","5":"六","6":"七","7":"八","8":"九","9":"十","10":"十一","11":"十二"};
            return desc[month];
        },

        monthMap2: function (month) {
            let desc = {"0":"01","1":"02","2":"03","3":"04","4":"05","5":"06","6":"07","7":"08","8":"09","9":"10","10":"11","11":"12"};
            return desc[month];
        }
    };

    (function initialize() {
        if (TEST){
            $("#loading .text").html("Testing,Please wait...");

            let t = '{"grade":4,"orgId":100960,"authCodeList":[{"code":"hygj_report"},{"code":"hygj_report_postit"},{"code":"hygj_report_charge"},{"code":"hygj_report_patrol_task"},{"code":"hygj_report_patrol_item"},{"code":"hygj_report_online"},{"code":"hygj_report_wxonline"},{"code":"hygj_report_wxusers_analysis"},{"code":"hygj_report_wx_operation"}]}';
            t = '{"grade":4,"orgId":100960,"authCodeList":[{"code":"hygj_report_wxonline"},{"code":"hygj_report_wxusers_analysis"},{"code":"hygj_report_wx_operation"}]}';
            t = '{"grade":4,"orgId":91387,"authCodeList":[{"code":"hygj_report_online"},{"code":"hygj_report_wxonline"},{"code":"hygj_report_wxusers_analysis"}]}';
            init(t);
        }else if (TESTALL){
            O.tranCode = [3025,2413,3020,3020,3026,3023,3022,3024];
            O.grade = 4;
            O.orgId = 91492;
            let $loading = $("#loading");
            $(".text",$loading).html("Testing,Please wait...");
            $("#pageNav > li").eq(0).addClass("active");
            $loading.hide();
            $("#slider,.mainTabWrap").show();
            O.slider();
            O.manager();
        }
    }());

    /**
     * json:{
                grade : 1,
                orgId : 1234,
                authCodeList:[
                    {code: "hygj_report"}, //****报表****
                    {code: "hygj_report_postit"}, //报事统计
                    {code: "hygj_report_charge"}, //缴费统计
                    {code: "hygj_report_patrol_task"}, //巡检任务统计
                    {code: "hygj_report_patrol_item"}, //巡检项统计
                    {code: "hygj_report_online"}, //上线统计
                    {code: "hygj_report_wxonline"}, //微信上线统计
                    {code: "hygj_report_wxusers_analysis"}, //微信用户统计
                    {code: "hygj_report_wx_operation"} //微信运营统计
                ]
            };
     * **/
    function init(respone) {
        let json = $.parseJSON(respone),
            $slider = $("#slider"),
            $mainTabWrap = $(".mainTabWrap");
        let $sliderContentUl = $(".sliderContentUl > li",$slider),
            $pageNav = $("#pageNav > li",$mainTabWrap);
        let tempTranCode = [3025,2413,3020,3020,3026,3023,3022,3024];

        O.grade = json.grade;
        O.orgId = json.orgId;

        let jsonCode = json.authCodeList;
        let isd = [];

        $sliderContentUl.each(function (i) {
            let _this = $(this);
            let code = "hygj_report_" + _this.data("name");
            let isDelete = true;

            for (let k in jsonCode){
                if (code == jsonCode[k].code){
                    isDelete = false;
                    break;
                }
            }

            isd.push(isDelete);

            if (isDelete){
                $sliderContentUl.eq(i).remove();
                $pageNav.eq(i).remove();
                // $sliderContentUl.eq(k).attr("delete",true);
                // $pageNav.eq(k).attr("delete",true);
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
                // $sliderContentUl.eq(k).attr("delete",true);
                // $pageNav.eq(k).attr("delete",true);
            }else{
                O.tranCode.push(tempTranCode[k]);
            }
        }
        */

        /*
        console.info(jsonCode);
        console.info(isd);
        console.log(O.tranCode);
        */

        $("#pageNav > li",$mainTabWrap).eq(0).addClass("active");

        $("#loading").hide();
        $slider.show();
        $mainTabWrap.show();

        O.slider();
        O.manager();
    }

}

