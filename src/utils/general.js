//mapping the corresponding status accordingly
export const statusMapping = (value) => {
  switch (value) {
    case 0:
      return "Requested";
    case 1:
      return "QA Approved";
    case 2:
      return "QA Rejected";
    case 3:
      return "Signed";
    case 4:
      return "Approved for Printing";
    case 5:
      return "Printed";
    case 6:
      return "Completed";
    case 7:
      return "Cancelled";
    default:
      return " ";
  }
};

//mapping the corresponding reject status accordingly
export const statusRejectMapping = (value) => {
  switch (value) {
    case 1:
      return "Reprint Requested";
    case 2:
      return "Reprint Approved";
    case 3:
      return "Reprint Rejected";
    case 4:
      return "Reprinted";
    default:
      return " ";
  }
};

//from certificate type, map the certificate name
export const certificateNameMapping = (certificateName) => {
  switch (certificateName.trim()) {
    case "CN":
      return "Certificate New";
    case "S":
      return "Statement of Attainment";
    case "C":
      return "Certificate";
    case "F":
      return "Failed Certificate";
    case "FN":
      return "Failed Certificate New";
    case "P":
      return "Course Progress Advice";
    case "SN":
      return "Graduate Certificate New";
    case "AC":
      return "AHEGS Certificate";
    case "MC":
      return "Mon-GCN Certificate";
    case "MD":
      return "Mon-GDN Certificate";
    case "CC":
      return "Course Completion";
    default:
      return " ";
  }
};

export const capitalizingFirstLetter = (text) => {
  return text.replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());
};

//date the date format from yyyy-mm-dd to dd/mm/yyyy
export const changeDateFormat = (date) => {
  let result = "";

  if (date) {
    let parts = date.split("-");
    if(parts.length>2){
      result = `${parts[0]}/${parts[1]}/${parts[2]}`;
    }else if(parts.length>1){
      result = `${parts[0]}/${parts[1]}`;
    }else{
      result = `${parts[0]}`;
    }
  }
  return result;
};

const dateFormatToBeReturned = (date, format, splitKey) => {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

  var dateArray = [
    {
      dd: day,
      mm: month,
      yyyy: year,
    },
  ];

  var format = format.split(splitKey);
  var returnedDate = [];
  format.map((item) => {
    return dateArray.map((date) => {
      for (let key in date) {
        if (key === item) if (key === item) return returnedDate.push(date[key]);
      }
    });
  });

  var arrTime = "";
  var match = /([+-]?\d\d):(\d\d)$/.exec(date);
  if (match) {
    arrTime = new Date(date).toLocaleTimeString();
  }
  return `${returnedDate.join(splitKey)} ${arrTime}`;
};

export const dataFormatToDisplay = (date, format) => {
  switch (format) {
    case "dd/mm/yyyy":
      return dateFormatToBeReturned(date, format, "/");

    case "dd-mm-yyyy":
      return dateFormatToBeReturned(date, format, "-");

    case "mm-dd-yyyy":
      return dateFormatToBeReturned(date, format, "-");

    case "mm/dd/yyyy":
      return dateFormatToBeReturned(date, format, "/");

    case "yyyy/mm/dd":
      return dateFormatToBeReturned(date, format, "/");

    case "yyyy-mm-dd":
      return dateFormatToBeReturned(date, format, "-");
  }
};

export const changeStatusFormat = (status) => {
  switch (status) {
    case true:
      return "Active";
    case false:
      return "Inactive";
  }
};

export const changeStatusForApi = (status) => {
  switch (status) {
    case true:
      return 1;
    case false:
      return 0;
  }
};

export const passwordSecurity = (value) => {
  switch (value) {
    case "0":
      return false;
    case "1":
      return true;
  }
};

export const certificateStorageDetails = (value) => {
  switch (value) {
    case true:
      return JSON.parse(localStorage.getItem("certificate-details"));
    case false:
      return JSON.parse(sessionStorage.getItem("certificate-details"));
  }
};

export const setCertificateStorageDetails = (value, certificateArray) => {
  switch (value) {
    case true:
      return localStorage.setItem(
        "certificate-details",
        JSON.stringify(certificateArray)
      );
    case false:
      return sessionStorage.setItem(
        "certificate-details",
        JSON.stringify(certificateArray)
      );
  }
};

export const setCertificateSignDetails = (value, id) => {
  switch (value) {
    case true:
      return localStorage.setItem("certificate-signed-id", id);
    case false:
      return sessionStorage.setItem("certificate-signed-id", id);
  }
};

export const getCertificateSignDetails = (value) => {
  switch (value) {
    case true:
      return localStorage.getItem("certificate-signed-id");
    case false:
      return sessionStorage.getItem("certificate-signed-id");
  }
};
