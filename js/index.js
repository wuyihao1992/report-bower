{
    /**
     * @font-size
     * title,legend : 1.4rem
     * xAxis,yAxis : 1.2rem
     * loading : 1.6rem
     * color #ff6347 : 2.4rem (color warning)
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
     * #defined TEST bool {true:"devDependencies",false:"dependencies"}
     * **/
    const TEST = true;
    const TESTALL = false;

    let O = {
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
            }).on('click','table.clickTrue tr',function (e) {
                let $this = $(e.target);
                if ($this.is('td')){
                    let $tr = $this.parent('tr');
                    if ($tr.hasClass('head')){
                        return;
                    }
                    $tr.addClass('active');
                    $tr.siblings().removeClass('active');

                    let rowType = $tr.attr("row");
                    console.log(rowType);
                    O.flowManager(rowType,{}); //重新画图
                }
            });
        },

        tableManager: function () {
            let $subContent = $(".subContent",O.$currentPage),
                dateType = $('.subTab > a.active',O.$currentPage).data('type') || 1,
                timer = (new Date()).pattern("yyyy-MM-dd");
            let $table = $("table",$subContent);
            console.log(dateType);

            let jsonData = JSON.stringify({
                tranCode : O.tranCode[O.currentIndex],
                isEncryption : 0,
                bizContent : {
                    date: timer,
                    orgId: O.orgId,
                    grade: O.grade,
                    type : dateType
                }
            });

            $.ajax({
                url : O.postUrl,
                type:'POST',
                dataType : 'json',
                data:jsonData,
                async:true,
                complete:function (result) {
                    console.info(result.responseJSON);
                    if (result.responseJSON.msgCode == 0){
                        let  data = result.responseJSON.bizContent;
                        for (let key in data){
                            data[key] = parseFloat(data[key]);
                        }

                        if ($table.length > 0){
                            let $tbody = $("tbody",$table[0]);
                            let $activeTr = $("tr.active",$tbody);
                            let rowType = $activeTr.attr("row");
                            console.log(rowType);

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
                    O.flowManager("null",{});
                }
            });



        },

        /**
         * 图表封装
         * **/
        flowManager: function (rowType,data) {
            let $flow = $(".flow",O.$currentPage);
            if ($flow.length > 0){
                let dateType = $('.subTab > a.active',O.$currentPage).data('type') || 1; //日期类型：1:day,2:week,3:mouth

                let chartType = $flow.data("type"),
                    id = $flow.attr("id"),
                    options = {},
                    category = [],
                    series = [];
                let $chart = $('#' + id);

                if(rowType == undefined || rowType == "" || rowType== "null"){
                    if (chartType == 'area'){
                        category = [1350982413186,1350982413187,1350982413188];
                        series = [10, 12, 21];
                    }else if (chartType=='column'){
                        category = ['现金','POS','银行托收','转账','支票','微信','支付宝','其他'];
                        series = [data.cash,data.pos,data.delegate,data.exchange,data.check,(data.wechatOnline+data.wechatOffline),(data.alipayOnline+data.alipayOffline),data.other];
                    }else if (chartType=='solidgauge'){
                        series = 50;
                    }
                    options = O.flowOption(category,series,chartType);

                    $chart.highcharts(Highcharts.merge(options,{}));
                }else{
                    let timer = (new Date()).pattern("yyyy-MM-dd");
                    let subData = JSON.stringify({
                        tranCode : O.tranCode[O.currentIndex],
                        isEncryption : 0,
                        bizContent : {
                            date: timer,
                            orgId: O.orgId,
                            grade: O.grade,
                            type : dateType
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
                        url : O.postUrl,
                        type:'POST',
                        dataType : 'json',
                        data: subData,
                        async:true,
                        success: function (result) {
                            //假数据测试
                            if (chartType == 'area'){
                                category = [1350982413186,1350982413187,1350982413188,1350982413189,1350982413180,1350982413196,1350982413197];
                                series = [10, 12, 21, 54, 260, 830, 710];
                            }else if (chartType=='column'){
                                category = ['现金','POS','银行托收','转账','支票','微信','支付宝','其他'];
                                series = [20,23,15,35,38,89,23,56];
                            }else if (chartType=='solidgauge'){
                                series = 25;
                            }
                            options = O.flowOption(category,series,chartType);

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
         * **/
        flowOption: function (category,series,chartType) {
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
                                return Highcharts.dateFormat('%H:%M',this.value);
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
                            return  '<b>'+this.series.name+'</b><br/>'+
                                '时间点:'+Highcharts.dateFormat('%H:%M',this.x)+'<br/>'+
                                '报事量:'+this.y;
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
                        pointFormat: '<b>{point.y:.1f}</b>'
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
         * @param index 滑动的当前tab的索引
         * tableManager 函数管理table内容
         * drawFlow 函数管理图表内容
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
            let tableName = $table.data("name") || "null";
            console.log("tableName:"+tableName);
            switch (tableName){
                case "postit":

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

                    break;
                case "wxonline":

                    break;
                case "wxusers_analysis":

                    break;
                case "wx_operation":

                    break;
                default:
                    break;
            }

            // let $tr = $('[row="'+i+'"]',$table);
            let $tr = $('tbody tr',$table) || $('.lowRed',$table);
            for (let k in data){
                let  $td = $('[name="'+k+'"]',$tr);
                let type = $td.attr("type");
                if (type == "per"){
                    if (data[k] < 0){
                        $td.addClass("lowRed");
                    }else {
                        $td.removeClass("lowRed");
                    }
                    $td.html((data[k]*100) + '%');
                }else if (type == "timeCount"){
                    //时间转换
                    $td.html(data[k] + '时间转换');
                }else{
                    $td.html(data[k]);
                }
            }
        },

        /**
         * 增长率计算
         * 公式：(本期-上期)/上期
         * return float
         * **/
        upRate: function (a,b) {
            return (b<=0 || b==null || b==undefined || b ==NaN)?(a>0?100:0):((a-b)/b);
        },

        /**
         * 当期计算
         * 公式：完成数/总数
         * return float
         * **/
        rangeRate : function (a,b) {
            return (b<=0 || b==null || b==undefined || b ==NaN)?(a>0?100:0):(a/b);
        },
        
        writeHtmlTest: function ($table) {
            let testData = {
                "testRow1":{
                    "test1": 123,
                    "test2": 80,
                    "test3": -10
                },
                "testRow2":{
                    "test1": 123,
                    "test2": -7.0,
                    "test3": 10.00
                }
            };
            $table.each(function () {
                let _this = $(this);
                for (let i in testData){
                    let $tr = $('[row="'+i+'"]',_this);
                    for (let j in testData[i]){
                        testData[i][j] = parseFloat(testData[i][j]);
                        let  $td = $('[name="'+j+'"]',$tr);
                        // let type = $td.data("type");
                        let type = $td.attr("type");
                        if (type == "per"){
                            if (testData[i][j] < 0){
                                $td.addClass("lowRed");
                            }else {
                                $td.removeClass("lowRed");
                            }
                            $td.html(testData[i][j] + '%');
                        }else{
                            $td.html(testData[i][j]);
                        }
                    }
                }
            });
        }
    };

    (function initialize() {
        if (TEST){
            $("#loading .text").html("Testing,Please wait...");
            let testJson = {
                grade : 4,
                orgId : 91492,
                authCodeList:[
                    // {code: "hygj_report"}, //****报表****
                    {code: "hygj_report_postit"}, //报事统计
                    {code: "hygj_report_charge"}, //缴费统计
                    {code: "hygj_report_patrol_task"}, //巡检任务统计
                    // {code: "hygj_report_patrol_item"}, //巡检项统计
                    {code: "hygj_report_online"}, //上线统计
                    // {code: "hygj_report_wxonline"}, //微信上线统计
                    {code: "hygj_report_wxusers_analysis"}, //微信用户统计
                    // {code: "hygj_report_wx_operation"} //微信运营统计
                ]
            };
            testJson = JSON.stringify(testJson);

            let xxxx = '{"grade":4,"orgId":100960,"authCodeList":[{"code":"hygj_report_auth_code"},{"code":"hygj_report_postit"},{"code":"hygj_report_charge"},{"code":"hygj_report_patrol_task"},{"code":"hygj_report_patrol_item"},{"code":"hygj_report_online"},{"code":"hygj_report_wxonline"},{"code":"hygj_report_wxusers_analysis"},{"code":"hygj_report_wx_operation"}]}'
            init(xxxx);
        }else if (TESTALL){
            O.tranCode = [3020,2413,3020,3020,0,0,0,0];
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
                    {code: "hygj_report_auth_code"}, //****报表****
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
        let tempTranCode = [3020,2413,3020,3020,4,5,6,7];

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

        console.info(jsonCode);
        console.info(isd);
        console.log(O.tranCode);

        $("#pageNav > li",$mainTabWrap).eq(0).addClass("active");

        $("#loading").hide();
        $slider.show();
        $mainTabWrap.show();

        // return;

        O.slider();
        O.manager();

        // setTimeout(function () {
        //     O.slider();
        //     O.manager();
        // },800);

    }

}

