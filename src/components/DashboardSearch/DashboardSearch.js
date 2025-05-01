import "./DashboardSearch.css";
import React, { useState, useRef, useEffect } from "react";
import { Input, Button, Select, DatePicker, message } from "antd";
import { inject, observer } from "mobx-react";
import AsyncCsv from "../ExportCsv/ExportCsv";
import Confirmation from "./Confirmation";
import moment from 'moment';

import {
  certificateTypeDropDown,
  certificateStatus,
} from "../../utils/constants";
import { dataFormatToDisplay } from "../../utils/general";
import { useHistory } from "react-router-dom";
import RequestCertificate from "../../pages/Certificates/RequestCertificate";

const { Option } = Select;
const { RangePicker } = DatePicker;
const signee = 4;

const DashboardSearch = (props) => {
  const [courseId, setCourseId] = useState([]);
  const [requisitionerId, setrequisitionerId] = useState([]);
  const [dateStringArray, setDateString] = useState();
  const [credentailDateArray, setCredentialDate] = useState();
  const [studentName, setStudentName] = useState("");
  const [campusName, setCampusName] = useState("");
  const [certificateType, setCertificateType] = useState([]);
  const [certificate, setCertificate] = useState();
  const [credentialNumber, setCredentialNumber] = useState("");
  const [dateRange, changeDateRange] = useState(null);
  const [dateRangeRequested, changeDateRangeRequested] = useState(null);

  const childRef = useRef();
  let history = useHistory();
  const onBulkSignApiCall = (from) => {
    const { selectedCheckboxCourses, selectedCheckboxStatus } =
      props.dataStore.certificates;

    message.destroy();

    if (from === "print") {
      if (
        selectedCheckboxCourses &&
        selectedCheckboxCourses.length > 1 &&
        selectedCheckboxStatus &&
        selectedCheckboxStatus.length > 1
      ) {
        message.error(
          "All student certificates must be under same certificate status and same certificate template"
        );
      } else if (
        selectedCheckboxCourses &&
        selectedCheckboxCourses.length > 1
      ) {
        message.error(
          "All student certificates must be under same certificate template"
        );
      } else if (selectedCheckboxStatus && selectedCheckboxStatus.length > 1) {
        message.error(
          "All student certificates must be under same certificate status"
        );
      } else {
        childRef.current.setModalVisibility(true, false, "print");
      }
    } else {
      if (selectedCheckboxCourses && selectedCheckboxCourses.length > 1) {
        message.error(
          "All student certificates must be under same certificate template"
        );
      } else {
        childRef.current.setModalVisibility(true, false);
      }
    }
  };

  useEffect(() => {
    let storage = JSON.parse(localStorage.getItem("report-search"));
    if (storage && props.from === "reports") {
      if (storage.studentName) {
        setStudentName(storage.studentName);
      }
      if (storage.courseId) {
        setCourseId(storage.courseId);
      }
      if (storage.campusName) {
        setCampusName(storage.campusName);
      }
      if (storage.requisitionerId) {
        setrequisitionerId(storage.requisitionerId);
      }
      if (storage.certificateTypeId) {
        setCertificateType(storage.certificateTypeId);
      }
      if (storage.credentialDateArray) {

        // setCredentialDate(storage.credentailDateArray[0]);
        onDateRangeChange(storage.credentialDateArray)
      }
      if (storage.certificate) {
        setCertificate(storage.certificate);
      }
      if (storage.credentialNumber) {
        setCredentialNumber(storage.credentialNumber);
      }
      if (storage.dateArray) {
        onDateRangeChangeRequestedDate(storage.dateArray);
      }
    }
    props.dataStore.certificates.certificateSearchObject = storage;
    props.dataStore.certificates.certificateFetchData = true;


  }, []);

  const clearSearchLocal =() =>{
    props.dataStore.certificates.certificateFetchData = false;
    localStorage.removeItem('report-search');
    props.dataStore.certificates.certificateSearchObject = {};
    setCourseId([]);
    setrequisitionerId([]);
    setDateString();
    setCredentialDate();
    setStudentName("");
    setCampusName("");
    setCertificateType([]);
    setCertificate();
    setCredentialNumber("");
    changeDateRange(null);
    changeDateRangeRequested(null);
    props.dataStore.certificates.certificateFetchData = true;
  }
  const onSearchApiCall = () => {
    if (props.dataStore.certificates.disableSearchButton) return;
    props.dataStore.certificates.disableSearchButton = true;

    //on search click add all the searched values to mobx variables
    if (courseId && courseId.length > 0)
      props.dataStore.certificates.certificateSearchObject.courseId = courseId;

    if (requisitionerId && requisitionerId.length > 0)
      props.dataStore.certificates.certificateSearchObject.requisitionerId =
        requisitionerId;

    if (dateStringArray && dateStringArray.length > 0)
      props.dataStore.certificates.certificateSearchObject.dateArray =
        dateStringArray;

    if (credentailDateArray && credentailDateArray.length > 0)
      props.dataStore.certificates.certificateSearchObject.credentialDateArray =
        credentailDateArray;

    if (certificateType && certificateType.length > 0)
      props.dataStore.certificates.certificateSearchObject.certificateTypeId =
        certificateType;

    if (certificate && certificate.length > 0)
      props.dataStore.certificates.certificateSearchObject.certificate =
        certificate;

    props.dataStore.certificates.certificateSearchObject.studentName =
      studentName;
    props.dataStore.certificates.certificateSearchObject.credentialNumber =
      credentialNumber;

    props.dataStore.certificates.certificateSearchObject.campusName =
      campusName;

    //make the autorun variable true to call the api
    props.dataStore.certificates.certificateFetchData = true;

    if (props.from === "reports") {
      if (courseId && courseId.length > 0) updateLocalstorage('courseId', courseId);
      if (requisitionerId && requisitionerId.length > 0) updateLocalstorage('requisitionerId', requisitionerId);
      if (certificateType && certificateType.length > 0) updateLocalstorage('certificateTypeId', certificateType);
      if (dateStringArray && dateStringArray.length > 0) updateLocalstorage('dateArray', dateStringArray);
      if (credentailDateArray && credentailDateArray.length > 0) updateLocalstorage('credentialDateArray', credentailDateArray);
      if (certificate && certificate.length > 0) updateLocalstorage('certificate', certificate);
      updateLocalstorage('studentName', studentName);
      updateLocalstorage('credentialNumber', credentialNumber);
      updateLocalstorage('campusName', campusName);
    }
  };
  const updateLocalstorage = (key, value) => {
    if (props.from === "reports") {
      let oldItems = JSON.parse(localStorage.getItem('report-search')) || {};
      oldItems[key] = value;
      localStorage.setItem('report-search', JSON.stringify(oldItems));
    }
  }
  const onChange = (value, id) => {
    //if from course drop down -> set the corresponding value in state
    if (value === "course") {
      props.dataStore.certificates.certificateSearchObject.courseId = [];
      setCourseId(id);
      updateLocalstorage('courseId', id);
    }
    if (value === "requisitioner") {
      props.dataStore.certificates.certificateSearchObject.requisitionerId = [];
      setrequisitionerId(id);
      updateLocalstorage('requisitionerId', id);
    }

    if (value === "certificate") {
      props.dataStore.certificates.certificateSearchObject.certificate = [];
      setCertificate(id);
      updateLocalstorage('certificate', id);
    }

    // if certificate type is selected, first option is selected dont pass the value in api,
    //else case pass the value in api
    if (value === "certificateStatus") {
      props.dataStore.certificates.certificateSearchObject.certificateTypeId =
        [];
      setCertificateType(id);
      updateLocalstorage('certificateType', id);
    }
  };

  const formatDate = (date) =>{
    let a = moment(date[0],"DD/MM/YYYY").format('DD/MM/YYYY') == 'Invalid date' ? date[0]: moment(date[0],"DD/MM/YYYY").format('DD/MM/YYYY');
    let b = moment(date[1],"DD/MM/YYYY").format('DD/MM/YYYY') == 'Invalid date' ? date[1]: moment(date[1],"DD/MM/YYYY").format('DD/MM/YYYY');
    return [a,b]
   }
  const onDateRangeChange = dateRange => {
    if (dateRange&&dateRange[0] && dateRange[1]) {
      let c = formatDate(dateRange);
      changeDateRange(returnMomentDateRange(dateRange[0], dateRange[1])); 
      setCredentialDate(c);
      updateLocalstorage('credentialDateArray', c);
   } else {
      changeDateRange([]);
      setCredentialDate(null);
      props.dataStore.certificates.certificateSearchObject.credentialDateArray = [];
      updateLocalstorage('credentialDateArray', []);
   }
  
  };
  
  const onDateRangeChangeRequestedDate = dateRangeRequested => {
    if (dateRangeRequested&&dateRangeRequested[0] && dateRangeRequested[1]) {
      changeDateRangeRequested(returnMomentDateRange(dateRangeRequested[0], dateRangeRequested[1]));
      let cc = formatDate(dateRangeRequested)
      setDateString(cc);
      updateLocalstorage('dateArray', cc);
   } else {
      changeDateRangeRequested([]);
      setDateString(null);
      props.dataStore.certificates.certificateSearchObject.dateArray = [];
      updateLocalstorage('dateArray', []);
   }
  
  };
  const returnMomentDateRange = (start, finish) => {
    return [moment(start, "DD/MM/YYYY"), moment(finish, "DD/MM/YYYY")];
  };
  const inputOnChange = (id, event) => {
    if (id === "student") {
      setStudentName(event.target.value);
      updateLocalstorage('studentName', event.target.value);
    }
    if (id === "credential") {
      setCredentialNumber(event.target.value);
      updateLocalstorage('credentialNumber', event.target.value);
    }
    if (id === "campus") {
      setCampusName(event.target.value);
      updateLocalstorage('campusName', event.target.value);
    }
  };

  const RequestCertificate = () =>{
    history.push("/certificates/request-certificate");
  }

  const {
    courseDetailsDropDown,
    requisitionerDetailsDropDown,
    selectedCheckBoxRows,
  } = props.dataStore.certificates;

  const { storage } = props.dataStore.header;

  const { dateFormat } = props.dataStore.settings;

  const { from } = props;
  let permission;
  if(localStorage.getItem("certificate-automation-authority")){
   permission = JSON.parse(localStorage.getItem("certificate-automation-authority"))['permissions']['requested_certificate'];
  }
  return (
    <div className={`${from}-search-container`}>
      <div className={`${from}-search name`}>
        <span className={`${from}-text name`}>Name</span>
        <Input
          className={`${from}-input name`}
          placeholder="Student Name"
          value={studentName}
          onChange={inputOnChange.bind(this, "student")}
        />
      </div>

      <div className={`${from}-search course`}>
        <span className={`${from}-text course`}>Course</span>
        <Select
          showSearch
          // style={{ width: 250 }}
          mode="multiple"
          placeholder="Select a course"
          optionFilterProp="children"
          onChange={onChange.bind(this, "course")}
          value={courseId}
          filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
            0
          }
        >
          {courseDetailsDropDown
            ? courseDetailsDropDown.map((course) => (
                <Option
                  value={course.value}
                  key={course.value}
                  style={{
                    color: course.value === 0 ? "grey" : "black",
                  }}
                >
                  {course.label}
                </Option>
              ))
            : null}
        </Select>
      </div>

      <div className={`${from}-search name`}>
        <span className={`${from}-text name`}>Campus</span>
        <Input
          className={`${from}-input name`}
          placeholder="Campus Name"
          value={campusName}
          onChange={inputOnChange.bind(this, "campus")}
        />
      </div>

      <div className={`${from}-search requisitioner`}>
        <span className={`${from}-text requisitioner`}>Requisitioner</span>
        <Select
          showSearch
          mode="multiple"
          // style={{ width: 250 }}
          placeholder="Select requisitioner name"
          optionFilterProp="children"
          onChange={onChange.bind(this, "requisitioner")}
          value={requisitionerId}
          filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
            0
          }
        >
          {requisitionerDetailsDropDown
            ? requisitionerDetailsDropDown.map((requisitioner) => (
                <Option
                  value={requisitioner.value}
                  style={{
                    color: requisitioner.value === 0 ? "grey" : "black",
                  }}
                >
                  {requisitioner.label}
                </Option>
              ))
            : null}
        </Select>
      </div>

      <div className={`${from}-search requisitioner`}>
        <span className={`${from}-text requisitioner`}>Certificate Type</span>
        <Select
          showSearch
          // style={{ width: 250 }}
          placeholder="Select Certificate Type"
          optionFilterProp="children"
          onChange={onChange.bind(this, "certificate")}
          value={certificate}
          filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
            0
          }
        >
          {certificateTypeDropDown
            ? certificateTypeDropDown.map((certificateType) => (
                <Option value={certificateType.value}>
                  {certificateType.label}
                </Option>
              ))
            : null}
        </Select>
      </div>

      <div className={`${from}-search date`}>
        <span className={`${from}-text date`}>Requested Date</span>
        <RangePicker
          format={dateFormat ? dateFormat.toUpperCase() : null}
          className={`${from}-rangepicker`}
          // onChange={datePickerChange.bind(this, false)}
          value={dateRangeRequested !== "" ? dateRangeRequested : ""}
          onChange={onDateRangeChangeRequestedDate.bind(this)}
        />
      </div>

      {props.from === "reports" ? (
        <>
          <div className={`${from}-search date`}>
            <span className={`${from}-text date`}>Credential Date</span>
            <RangePicker
              format={dateFormat ? dateFormat.toUpperCase() : null}
              className={`${from}-rangepicker`}
              // onChange={datePickerChange.bind(this, false)}
              // value={
              //   [JSON.parse(localStorage.getItem("report-search"))?JSON.parse(localStorage.getItem("report-search")).credentailDateArray ? moment(JSON.parse(localStorage.getItem("report-search")).credentailDateArray[0]):[] :[],
              //   JSON.parse(localStorage.getItem("report-search"))?JSON.parse(localStorage.getItem("report-search")).credentailDateArray ? moment(JSON.parse(localStorage.getItem("report-search")).credentailDateArray[1]):[] : []
              //   ]}
              value={dateRange !== "" ? dateRange : ""}
      onChange={onDateRangeChange.bind(this)}
            />
          </div>
          <div className={`${from}-search requisitioner`}>
            <span className={`${from}-text requisitioner`}>
              Certificate Status
            </span>
            <Select
              showSearch
              mode="multiple"
              // style={{ width: 250 }}
              placeholder="Select certificate status"
              optionFilterProp="children"
              onChange={onChange.bind(this, "certificateStatus")}
              value={certificateType}
              filterOption={(input, option) =>
                option.props.children
                  .toLowerCase()
                  .indexOf(input.toLowerCase()) >= 0
              }
            >
              {certificateStatus
                ? certificateStatus.map((certificate) => (
                    <Option
                      value={certificate.value}
                      style={{
                        color: certificate.value === -1 ? "grey" : "black",
                      }}
                    >
                      {certificate.label}
                    </Option>
                  ))
                : null}
            </Select>
          </div>

          <div className={`${from}-search name`}>
            <span className={`${from}-text name`}>Credential Number</span>
            <Input
              className={`${from}-input name`}
              placeholder="Credential Number"
              value={credentialNumber}
              onChange={inputOnChange.bind(this, "credential")}
            />
          </div>
        </>
      ) : null}

      {props.from === "reports" ? (
        <>
          <div className={`${from}-search button repotssearch`}>
          <Button className="search" onClick={clearSearchLocal} style={{ width: 'fit-content', backgroundColor: '#cc3333' }}>
              CLEAR SEARCH
            </Button>
            <Button className="search" onClick={onSearchApiCall}>
              SEARCH
            </Button>
            <AsyncCsv from={props.from} />
          </div>
        </>
      ) : (
        <div
          className={`${from}-search button`}
          style={{
            justifyContent: "flex-end",
            // marginRight: 15,
            alignSelf: "center",
          }}
        >
          {props.list === "send-to-print" && selectedCheckBoxRows.length > 0 ? (
            <Button
              className="search"
              onClick={onBulkSignApiCall.bind(this, "print")}
              style={{ alignItems: "center" }}
            >
              BULK PRINT
            </Button>
          ) : null}

          {props.list === "to-be=signed-list" &&
          storage &&
          storage.role.length > 0 &&
          storage.role.includes(signee) &&
          selectedCheckBoxRows.length > 0 ? (
            <Button
              className="search"
              onClick={onBulkSignApiCall}
              style={{ alignItems: "center" }}
            >
              BULK SIGN
            </Button>
          ) : null}

          <Button
            className="search"
            onClick={onSearchApiCall}
            style={{ alignItems: "center" }}
          >
            SEARCH
          </Button>
          <AsyncCsv />
          {window.location.href.split("/").pop() === 'requested-list' && permission['add'] ==1 ? (<Button className="search" 
          onClick={RequestCertificate}
            style={{ alignItems: "center", backgroundColor : 'rgb(249, 196, 30)',
            marginLeft: '1.2rem' }}>Request certificate</Button>): null }
          <Confirmation ref={childRef} />
        </div>
      )}
    </div>
  );
};
export default inject("dataStore")(observer(DashboardSearch));
