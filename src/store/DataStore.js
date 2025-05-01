import { observable, makeObservable, action } from "mobx";

class DataStore {
  constructor() {
    makeObservable(this, {
      certificates: observable,
      settings: observable,
      reports: observable,
      header: observable,
      reset: action,
    });
  }

  //object for dashboard
  certificates = {
    selectedCheckboxCourses: [],
    selectedCheckboxStatus: [],
    selectedCheckBoxRows: [],
    signature: "",
    fetchNotifications: false,
    certificateRequestDetails: {},
    certificateApprovedDetails: {},
    courseDetailsDropDown: [],
    requisitionerDetailsDropDown: [],
    certificateFetchData: false,
    disableSearchButton: false,
    certificateSearchObject: {
      courseId: [],
      requisitionerId: [],
      dateArray: [],
      studentName: "",
      certificateTypeId: [],
      credentialNumber: "",
      campusName: "",
      certificate: "",
      credentialDateArray: [],
    },
  };

  //object for assigning roles section [Settings page]
  settings = {
    userDetails: {},
    statusValue: null,
    signeeDetailsDropDown: [],
    fetchUserManagementData: false,
    details: {},
    dateFormat: null,
  };

  reports = {
    csvData: [],
    certificateCsvData: [],
  };

  // header
  header = {
    storage: null,
    certificateStorageDetails: null,
  };

  //reset function - reseting to default
  reset() {
    this.certificates = {
      selectedCheckboxCourses: [],
      selectedCheckboxStatus: [],
      selectedCheckBoxRows: [],
      signature: "",
      certificateRequestDetails: {},
      courseDetailsDropDown: [],
      requisitionerDetailsDropDown: [],
      certificateFetchData: false,
      certificateSearchObject: {
        courseId: [],
        requisitionerId: [],
        dateArray: [],
        studentName: "",
        certificateTypeId: [],
        credentialNumber: "",
        campusName: "",
        certificate: "",
        credentialDateArray: [],
      },
    };
    this.settings = {
      checkedValue: [],
      userDetails: {},
      statusValue: null,
      signeeDetailsDropDown: [],
    };
    this.reports = {
      csvData: [],
    };
    this.header = {
      storage: null,
      isFromLocalStorage: null,
    };
  }
}

export default DataStore;
