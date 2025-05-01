import "./DoughnutChart.css";

import React, { useEffect, useState } from "react";
import AuthService from "../../services/api";
import DashboardTable from "./DashboardTable";
import { DatePicker } from "antd";
import moment from "moment";

const DashboardSection = () => {
  const [campusData, setIsCampusData] = useState([]);
  const [courseData, setCourseData] = useState([]);
  const [selectedYear, setIsSelectedYear] = useState(
    moment().format("MMMM YYYY DD")
  );

  const [endDate,setEndDate] = useState(
    moment().format("MMMM YYYY DD")
  )


  useEffect(() => {
    setIsCampusData([]);
    setCourseData([]);

    let params = {};
    if (selectedYear || endDate) {
        params ={...params,
          from:selectedYear,
          to:endDate
        }
       
    }
 

    const fetchdata = async () => {
      const { data } = await AuthService.requestWithPost(
        "/yearDetails",
        params
      );

      if (data && data.campus_details && data.campus_details.length > 0)
        setIsCampusData(data.campus_details);

      if (data && data.course_details && data.course_details.length > 0)
        setCourseData(data.course_details);
    };

    fetchdata();
  }, [selectedYear,endDate]);

  const onChange = (date, dateString) => {
    setIsSelectedYear(dateString);
    
  };

  const onChangeEndDate = (date, dateString) => {
    setEndDate(dateString);
  };

  return (
    <div className="dashboard-section-conatiner">
      <div className="dashboard-section-time">
        <div style={{display: "flex", justifyContent: "flex-start", alignItems: "center",gap:5 }}>
          <h4>From :</h4>
          <DatePicker
            onChange={onChange}
            format="MMMM YYYY DD"
            defaultValue={moment(selectedYear)}
            disabledDate={current => {
              return current && current > moment();
            }}
          />
        </div>
        <div style={{display: "flex", justifyContent: "flex-start", alignItems: "center",gap:5 }}>
          <h4>To :</h4>
          <DatePicker
            onChange={onChangeEndDate}
            format="MMMM YYYY DD"
            defaultValue={moment(endDate)}
            disabledDate={current => {
              return current && current > moment();
            }}
          />
        </div>
      </div>
      <div style={{ display: "flex", padding: 10 }}>
        <DashboardTable data={campusData} id="campus" />
        <DashboardTable data={courseData} />
      </div>
    </div>
  );
};

export default DashboardSection;
