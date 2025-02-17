import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { useState, useEffect } from "react";

export default function ViewChart(props) {
  const [data, setData] = useState([]);
  const { dataChart } = props;
  console.log("dataChart", dataChart);

  useEffect(() => {
    /* Chart code */
    // Create root element
    // https://www.amcharts.com/docs/v5/getting-started/#Root_element
    let root = am5.Root.new("chartdiv");

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([am5themes_Animated.new(root)]);

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    let chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        layout: root.verticalLayout,
      })
    );

    chart.get("colors").set("step", 2);

    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    // when axes are in opposite side, they should be added in reverse order
    let volumeAxisRenderer = am5xy.AxisRendererY.new(root, {
      opposite: true,
    });
    volumeAxisRenderer.labels.template.setAll({
      centerY: am5.percent(100),
      maxPosition: 0.98,
    });
    let volumeAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: volumeAxisRenderer,
        height: am5.percent(30),
        layer: 5,
      })
    );
    volumeAxis.axisHeader.set("paddingTop", 10);
    volumeAxis.axisHeader.children.push(
      am5.Label.new(root, {
        text: "Volume",
        fontWeight: "bold",
        paddingTop: 5,
        paddingBottom: 5,
      })
    );

    let valueAxisRenderer = am5xy.AxisRendererY.new(root, {
      opposite: true,
      pan: "zoom",
    });
    valueAxisRenderer.labels.template.setAll({
      centerY: am5.percent(100),
      maxPosition: 0.98,
    });
    let valueAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: valueAxisRenderer,
        height: am5.percent(70),
        maxDeviation: 1,
      })
    );
    valueAxis.axisHeader.children.push(
      am5.Label.new(root, {
        text: "Exchange Rate",
        fontWeight: "bold",
        paddingBottom: 5,
        paddingTop: 5,
      })
    );

    let dateAxisRenderer = am5xy.AxisRendererX.new(root, {
      pan: "zoom",
    });
    dateAxisRenderer.labels.template.setAll({
      minPosition: 0.01,
      maxPosition: 0.99,
    });
    let dateAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        groupData: true,
        maxDeviation: 0.5,
        baseInterval: {
          timeUnit: "day",
          count: 1,
        },
        renderer: dateAxisRenderer,
      })
    );
    dateAxis.set("tooltip", am5.Tooltip.new(root, {}));

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    let valueSeries1 = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: "rate",
        valueYField: "rate",
        calculateAggregates: true,
        valueXField: "date",
        xAxis: dateAxis,
        yAxis: valueAxis,
        legendValueText: "{valueY}",
      })
    );

    let valueTooltip = valueSeries1.set(
      "tooltip",
      am5.Tooltip.new(root, {
        getFillFromSprite: false,
        getStrokeFromSprite: true,
        getLabelFillFromSprite: true,
        autoTextColor: false,
        pointerOrientation: "horizontal",
        labelText:
          "{name}: {valueY} {valueYChangePercent.formatNumber('[#00ff00]+#,###.##|[#ff0000]#,###.##|[#999999]0')}%",
      })
    );
    valueTooltip
      .get("background")
      .set("fill", root.interfaceColors.get("background"));

    let firstColor = chart.get("colors").getIndex(0);
    let volumeSeries = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: "",
        fill: firstColor,
        stroke: firstColor,
        valueYField: "volume",
        valueXField: "date",
        valueYGrouped: "sum",
        xAxis: dateAxis,
        yAxis: volumeAxis,
        legendValueText: "{valueY}",
        tooltip: am5.Tooltip.new(root, {
          labelText: "{valueY}",
        }),
      })
    );
    volumeSeries.columns.template.setAll({
      strokeWidth: 0.2,
      strokeOpacity: 1,
      stroke: am5.color(0xffffff),
    });

    // Add legend to axis header
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/axis-headers/
    // https://www.amcharts.com/docs/v5/charts/xy-chart/legend-xy-series/
    let valueLegend = valueAxis.axisHeader.children.push(
      am5.Legend.new(root, {
        useDefaultMarker: true,
      })
    );
    valueLegend.data.setAll([valueSeries1]);

    let volumeLegend = volumeAxis.axisHeader.children.push(
      am5.Legend.new(root, {
        useDefaultMarker: true,
      })
    );
    volumeLegend.data.setAll([volumeSeries]);

    // Stack axes vertically
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/#Stacked_axes
    chart.rightAxesContainer.set("layout", root.verticalLayout);

    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    chart.set("cursor", am5xy.XYCursor.new(root, {}));

    // Add scrollbar
    // https://www.amcharts.com/docs/v5/charts/xy-chart/scrollbars/
    let scrollbar = chart.set(
      "scrollbarX",
      am5xy.XYChartScrollbar.new(root, {
        orientation: "horizontal",
        height: 50,
      })
    );

    let sbDateAxis = scrollbar.chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        groupData: true,
        groupIntervals: [
          {
            timeUnit: "week",
            count: 1,
          },
        ],
        baseInterval: {
          timeUnit: "day",
          count: 1,
        },
        renderer: am5xy.AxisRendererX.new(root, {}),
      })
    );

    let sbValueAxis = scrollbar.chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );

    let sbSeries = scrollbar.chart.series.push(
      am5xy.LineSeries.new(root, {
        valueYField: "rate",
        valueXField: "date",
        xAxis: sbDateAxis,
        yAxis: sbValueAxis,
      })
    );

    sbSeries.fills.template.setAll({
      visible: true,
      fillOpacity: 0.3,
    });

    // Generate random data and set on series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/#Setting_data

    // let data = [];
    let price1 = 1000;
    let quantity = 10000;

    for (var i = 1; i < 5000; i++) {
      price1 += Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 20);

      if (price1 < 100) {
        price1 = 100;
      }

      quantity += Math.round(
        (Math.random() < 0.5 ? 1 : -1) * Math.random() * 500
      );

      if (quantity < 0) {
        quantity *= -1;
      }
      data.push({
        date: new Date(2010, 0, i).getTime(),
        rate: price1,
        volume: quantity,
      });
    }

    if (dataChart !== null) {
      setData(dataChart);
      console.log("data!null: ", data);
    }

    console.log("data: ", data);

    valueSeries1.data.setAll(data);
    volumeSeries.data.setAll(data);
    sbSeries.data.setAll(data);

    // valueSeries1.data.setAll(dataChart);
    // volumeSeries.data.setAll(dataChart);
    // sbSeries.data.setAll(dataChart);

    chart.appear(1000, 100);
  }, []);

  return (
    <div>
      <p className="title is-4 has-text-info-dark  mb-3">Historical Chart</p>

      <div className="box has-background-info-light p-2">
        <div id="chartdiv" style={{ width: "100%", height: 500 }} />
      </div>
    </div>
  );
}
