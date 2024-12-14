import F2 from '@antv/wx-f2';
//console.log('f2',F2)
//console.log('f2',canvas)
// let chart = null;  
// var name_list = []; 
export const donut = (data,chart)=>{
    var name_list = [];  
console.log('F2',F2)
    let canvas,width=100,height=100;


    //console.log("1111111111111",F2)  
    console.log('sdfsd',data); 
    data.map(function(item) {
        //item.percent=item.total + '元'
        //name_list.push(item.total + '元')
        //console.log(item.name)
        name_list[item.name]=item.total + '元'
    })
    console.log("22222222",width)
    // var chart = new F2.Chart({
    //     el: canvas,
    //     width, 
    //     height,
    //     animate: true
    // })
    console.log('chart',chart);
    chart.source(data, {
            total: {
                formatter: function formatter(val) {
                return val + '元';
            }
        },
    }); 

    // chart.legend(true);

    chart.tooltip({
        showCrosshairs: false,
        showItemMarker: true,
        // showTooltipMarker:true,
        // tooltipMarkerStyle:{
        //     fill:'#fff'
        // }
    });

    chart.legend({
        position: 'right',
        itemFormatter: function itemFormatter(val) {
            return val + '    ' + name_list[val];
        }
    });
    chart.coord('polar', {
        transposed: true,
        innerRadius: 0.7,
        radius: 0.85
    });
    chart.axis(false);
    chart.interval()
        .position('total')
        .color('name')
        .adjust('stack');
    chart.interaction('pie-select');
    // chart.guide().html({
    //     position: [ '50%', '45%' ],
    //     html:'<div style="width: 250px;height: 40px;text-align: center;"><div style="font-size: 16px">总资产</div><div style="font-size: 24px">133.08 亿</div></div>'
    // }); 
    chart.guide().text({
        position: [ '50%', '50%' ],
        content: '总资产aaa\n133.08000 亿',
        style: {
        fill: '#1890FF'
        }
    });
    chart.render();
    return chart
}
// const linechart= (options)=>{

// }
// export {
//     donut
// }
//module.exports =donut  