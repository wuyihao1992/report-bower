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
            fontSize: '1.8rem',
            fontWeight: "bold"
        }
    },
    legend:{
        enabled: false,
        backgroundColor:(Highcharts.theme&&Highcharts.theme.legendBackgroundColor)|| '#ffffff',
        align: 'right',
        verticalAlign: 'top',
        itemStyle: {
            fontSize: '1.6rem'
        }
    },
    xAxis:{
        gridLineColor: '#f2f2f2',
        gridLineWidth: 1,//网格线宽度
        minorTickInterval: 'auto',
        min:0
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
            fillOpacity:0.3
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
            fontSize:'1.8rem',
            backgroundColor: '#ececec',
            opacity: 0.8,
            textAlign: 'center'
        }
    },
    noData:{
        style:{
            fontWidth:'normal',
            fontSize:'1.8rem',
            color:'#929292'
        }
    }
});

function slider(){
    var control = navigator.control || {};
    if (control.gesture) {
        control.gesture(false);
    }

	let page='pageNav',
	    slide='slider';
	let lastIndex = 0;

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
            if(lastIndex == i){
                //console.log('*****false****'+i);
                return;
            }else{
                lastIndex = i;

                //do something
                manager(i);
            }
        }
	});

    touch.page = page;
    touch.p = 0;
	
	$('.subSlider').each(function (i) {
        let _this = $(this);

        // let flowId = _this.siblings(".flow").attr("id");
        // console.info(flowId);

        let subTab = $(".subTab",_this);
        subTab.on("click","> a",function (e) {
            // console.log(e.target);
            $(this).addClass('active').siblings().removeClass('active');
        });
    });
}

/***
 * slider index function manager
 * @param index 滑动的当前tab的索引
 * table 函数管理table内容
 * flow 函数管理图表内容
 * ***/
function  manager(index) {
    var $currentPage = $(".sliderContentUl > li").eq(index);
    console.info($currentPage);

    let $flow = $(".flow",$currentPage);
    if ($flow.length > 0){
        console.log($flow);
        let chartType = $flow.data("type");
        let id = $flow.attr("id");
        drawFlow(id,chartType);
    }
}

function drawFlow(id,chartType) {
    let options = {};
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
                data: [10, 12, 21, 54, 260, 830, 710]
            }],
            xAxis:{
                categories: [1350982413186,1350982413187,1350982413188,1350982413189,1350982413180,1350982413196,1350982413197],
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
                        '时间点：'+Highcharts.dateFormat('%H:%M',this.x)+'<br/>'+
                        '报事量：'+this.y;
                }
            }
        };
    }else if (chartType=='column'){
        options = {
            chart: {
                type:'area'
            },
            series: [{
                name: '累计报事',
                color:'#ff6347',
                data: [10, 12, 21, 54, 260, 830, 710]
            }],
            xAxis:{
                categories: [1350982413186,1350982413187,1350982413188,1350982413189,1350982413180,1350982413196,1350982413197],
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
                        '时间点：'+Highcharts.dateFormat('%H:%M',this.x)+'<br/>'+
                        '报事量：'+this.y;
                }
            }
        };
    }else if (chartType=='pie'){
        options = {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: 0,
                plotShadow: false
            },
            title: {
                useHTML:true,
                text: '<b style="color:#ff6347;font-size: 2.0rem;">10%</b><br>异常项',
                style:{
                    textAlign: 'center',
                    fontFamily: 'Arial , Microsoft YaHei',
                    color: '#333',
                    fontSize: '1.2rem',
                    fontWeight: 'normal'
                },
                align: 'center',
                verticalAlign: 'middle'
            },
            tooltip: {
                enabled: false,
                formatter:function(){
                    if(this.series.name != null){
                        return '<b>'+this.series.name+'</b><br/>'+
                            ''+this.y;
                    }else{
                        return false;
                    }
                }
            },
            plotOptions: {
                pie: {
                    dataLabels: {
                        enabled: true,
                        distance: -50,
                        style: {
                            fontWeight: 'bold',
                            color: 'white',
                            textShadow: '0px 1px 2px black'
                        }
                    },
                    startAngle: 0,
                    endAngle: 360,
                    center: ['50%', '50%']
                }
            },
            series: [{
                type: 'pie',
                name: ' ',
                innerSize: '90%',
                data: [
                    {
                        name: '异常项',
                        y: 30,
                        dataLabels: {
                            enabled: false
                        },
                        color:'#ff6347',
                        borderRadius: 5
                    },
                    {
                        name: null,
                        y: 70,
                        dataLabels: {
                            enabled: false
                        },
                        color:'#eee'
                    }
                ]
            }]
        };
    }

    let $chart = $('#' + id);

    let charts = $chart.highcharts(Highcharts.merge(options,{}));

    // charts.showLoading();
    // charts.hideNoData();
}

function initialize() {
	slider();
    drawFlow('flow-1','area');
}

$(function () {
    initialize();
})

