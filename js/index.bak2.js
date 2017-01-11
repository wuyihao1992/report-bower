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
                color: '#000'
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

    let O = {
        root: "http://poly.hengtech.com.cn/pmsSrv/api/api!gateway.action",
        postUrl: '/api/api!gateway.action',

        currentIndex: 0,
        $currentPage: null,

        /**
         * [报事,缴费,巡检任务,巡检项,上线统计,微信上线概括,微信用户分析,微信运营情况]
         * **/
        tranCode:[3007,2413,0,0,0,0,0,0],

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
            }).on('click','table tr',function (e) {
                let $this = $(e.target);
                if ($this.is('td')){
                    let $tr = $this.parent('tr');
                    if ($tr.hasClass('head')){
                        return;
                    }
                    $tr.addClass('active');
                    $tr.siblings().removeClass('active');

                    let rowType = $tr.attr("row");
                    if(rowType == undefined || rowType == ""){
                        return;
                    }

                    O.flowManager(); //重新画图
                }
            });
        },

        tableManager: function () {
            let $subContent = $(".subContent",O.$currentPage);
            let $table = $("table",$subContent);
            if ($table.length > 0){
                let dateType = $('.subTab > a.active',O.$currentPage).data('type') || 'none'; //日期类型：day week mouth
                console.clear();
                console.log(dateType);

                let $tbody = $("tbody",$table[0]);
                let $activeTr = $("tr.active",$tbody);
                let rowType = $activeTr.attr("row");
                console.log(rowType);

                O.writeHtmlTest($table);

                let dd = JSON.stringify({
                    tranCode : O.tranCode[O.currentIndex],
                    isEncryption : 0,
                    bizContent : {
                        beginDate:'2016-11-05',
                        endDate:'2016-12-05',
                        orgId:1050,
                        grade:1
                    }
                });

                $.ajax({
                    url : O.postUrl,
                    type:'POST',
                    dataType : 'json',
                    data:dd,
                    success: function (result) {
                        if (rowType){
                            O.flowManager(rowType,{});
                        }else{
                            let  data = {
                                thisOld : "1111.12",//本期实收往年
                                thisPrepay : "123.12",//本期预收
                                thisNow : "456.12",//本期实收本年
                                thisOld : "236.22",//上期实收往年
                                thisPrepay : "444.11",//上期预收
                                thisNow : "1111.11",//上期实收本年
                                "cash" : "236.22",//现金
                                "pos" : "236.22",//pos
                                "delegate" : "236.22",//银行托收
                                "exchange" : "236.22",//转账
                                "check" : "236.22",//	支票
                                "wechatOffline" : "236.22",//微信线下
                                "alipayOffline" : "236.22",//支付宝线下
                                "wechatOnline" : "236.22",//微信线上
                                "alipayOnline" : "236.22",//支付宝线上
                                "to_account" : "236.22",//退到余额
                                "other" : "236.22",//其他
                            };
                            O.flowManager("",data);  //这里点击tr不用重复画图,因此传数据
                        }

                    },
                    error: function (xhr) {

                    }
                });
            }
        },

        flowManager: function (rowType,data) {
            let $flow = $(".flow",O.$currentPage);
            if ($flow.length > 0){
                let chartType = $flow.data("type"),
                    id = $flow.attr("id"),
                    options = {},
                    category = null,
                    series = null;

                if(rowType == undefined || rowType == ""){
                    //这里点击tr不用重复画图
                }else{
                    let dd = JSON.stringify({
                        tranCode : O.tranCode[O.currentIndex],
                        isEncryption : 0,
                        bizContent : {
                            beginDate:'2016-11-05',
                            endDate:'2016-12-05',
                            orgId:1050,
                            grade:1
                        }
                    });

                    $.ajax({
                        url : O.postUrl,
                        type:'POST',
                        dataType : 'json',
                        data:dd,
                        success: function (result) {
                            var  data = {
                                tranCode: 2413,
                                msgCode: 0,
                                msg: 'ok',
                                data : {
                                    thisOld : "1111.12",//本期实收往年
                                    thisPrepay : "123.12",//本期预收
                                    thisNow : "456.12",//本期实收本年
                                    thisOld : "236.22",//上期实收往年
                                    thisPrepay : "444.11",//上期预收
                                    thisNow : "1111.11",//上期实收本年
                                    "cash" : "236.22",//现金
                                    "pos" : "236.22",//pos
                                    "delegate" : "236.22",//银行托收
                                    "exchange" : "236.22",//转账
                                    "check" : "236.22",//	支票
                                    "wechatOffline" : "236.22",//微信线下
                                    "alipayOffline" : "236.22",//支付宝线下
                                    "wechatOnline" : "236.22",//微信线上
                                    "alipayOnline" : "236.22",//支付宝线上
                                    "to_account" : "236.22",//退到余额
                                    "other" : "236.22",//其他
                                }
                            };

                        },
                        error: function (xhr) {

                        }
                    });
                }

                if (chartType == 'area'){
                    category = [1350982413186,1350982413187,1350982413188,1350982413189,1350982413180,1350982413196,1350982413197];
                    series = [10, 12, 21, 54, 260, 830, 710];

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
                    category = ['现金','POS','银行托收','转账','支票','微信','支付宝','其他'];
                    series = [20,23,15,35,38,89,23,56];

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
                                    enabled:true,//鼠标放上去柱子的状态控制
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
                    series = 25;

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

                let $chart = $('#' + id);

                let charts = $chart.highcharts(Highcharts.merge(options,{}));
            }
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

        writeHtml: function (index,data) {
            let str = '';
            switch (index){
                case 0:
                    str = '<tr><td>客户报事</td><td>123</td><td>80%</td><td>10.00%</td></tr>'+
                        '<tr><td>客户工单</td><td>123</td><td>90%</td><td>9.00%</td></tr>'+
                        '<tr><td>内部报事</td><td>12311</td><td>80%</td><td class="lowRed">-0.10%</td></tr>'+
                        '<tr><td>内部工单</td><td>1233423</td><td>87%</td><td>0.50%</td></tr>';
                    break;
                case 1:
                    str = '<tr><td>实收往年</td><td>123</td><td>80%</td></tr>'+
                        '<tr><td>实收本年</td><td>123</td><td>90%</td></tr>'+
                        '<tr><td>预收</td><td>1233423</td><td>87%</td></tr>';
                    break;
                case 2:
                    break;
                case 3:
                    str = '<tr><td>应巡检项</td><td>123</td><td>80%</td></tr>'+
                        '<tr<td>实际完成</td><td>123</td><td>90%</td></tr>'+
                        '<tr><td>异常项</td><td>12311</td><td class="lowRed">-0.10%</td></tr>';
                    break;
                case 4:
                    break;
                case 5:
                    break;
                case 6:
                    break;
                case 7:
                    break;
                case 8:
                    break;
                default:
                    break;
            }
            return str;
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
            $("#loading").hide();
            $("#slider,.mainTabWrap").show();

            O.slider();
            O.manager();
        }else{
            $("#slider,.mainTabWrap").remove();
        }
    }());

    function test(re) {
        console.log(re);
        let json = $.parseJSON( re );
        for (let i in json){
            $("#tessssssssssssssssss").html(i);
            break;
        }
    }

}

