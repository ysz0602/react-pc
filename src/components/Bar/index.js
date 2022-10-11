import * as echarts from "echarts";
import { useRef, useEffect } from "react";

function Bar({ title, xData, yData, style }) {
  const domRef = useRef();
  let myChart;
  const chartInit = () => {
    if (myChart != null && myChart !== "" && myChart !== undefined) {
      myChart.dispose();
    }
    // 基于准备好的dom，初始化echarts实例
    myChart = echarts.init(domRef.current);
    // 绘制图表
    myChart.setOption({
      title: {
        text: title,
      },
      tooltip: {},
      xAxis: {
        data: xData,
      },
      yAxis: {},
      series: [
        {
          name: "销量",
          type: "bar",
          data: yData,
        },
      ],
    });
  };
  useEffect(() => {
    chartInit();
  });
  return (
    <div>
      <div ref={domRef} style={style}></div>
    </div>
  );
}

export default Bar;
