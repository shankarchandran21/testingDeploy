import "./DoughnutChart.css";
import React from "react";
import { Doughnut } from "react-chartjs-2";

const DoughnutChart = (props) => {
  const { data } = props;
  var options = {
    legend: {
      // display: false,
      position: "top",
    },
    elements: {
      arc: {
        borderWidth: 0,
      },
    },
    toolTip: {
      titleFontSize: 50,
      bodyFontSize: 50,
    },
    bodySpacing: 5,
  };

  return (
    <>
      <Doughnut data={data} options={options}></Doughnut>
    </>
  );
};
export default DoughnutChart;
