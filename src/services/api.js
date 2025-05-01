import axios from "axios";
import { API_URL } from "../config";

//file includes different api calls.
const AuthService = {
  //login -> Method: POST, body: passed as formdata(email and password)
  login: function (apiEndPoint, formData) {
    return axios.post(API_URL + apiEndPoint, formData);
  },

  //common api request Method - GET, query param
  requestMethod: function (apiEndPoint, param) {
    return axios.get(API_URL + apiEndPoint, {
      params: param,
      headers: headers(),
    });
  },

  //PUT
  //functions accepts the api end point, header - authorization token
  requestMethodForPut: function (apiEndPoint, formData) {
    return axios.put(API_URL + apiEndPoint, formData, {
      headers: headers(),
    });
  },

  //download api
  requestForDownload: function (apiEndPoint, body) {
    return axios({
      url: API_URL + apiEndPoint,
      method: "POST",
      responseType: "arraybuffer", // important
      data: body,
      headers: headers(),
    });
  },

  //Method:POST, body - formdata, header - authorization token
  requestWithPost: function (apiEndPoint, formData, cancel) {
    return axios({
      url: API_URL + apiEndPoint,
      method: "POST",
      data: formData,
      headers: headers(),
      cancelToken : cancel
    });
  },

  //Method:DELETE, header - authorization token
  requestWithDelete: function (apiEndPoint) {
    return axios.delete(API_URL + apiEndPoint, {
      headers: headers(),
    });
  },
};

//common method to access token from local storage
const headers = () => {
  let user;
  // return authorization header with jwt token
  if (
    localStorage.getItem("certificate-automation-authority-details") !== null
  ) {
    user = JSON.parse(
      localStorage.getItem("certificate-automation-authority-details")
    );
  } else if (
    sessionStorage.getItem("certificate-automation-authority-details") !== null
  ) {
    user = JSON.parse(
      sessionStorage.getItem("certificate-automation-authority-details")
    );
  }

  if (user && user.token) {
    return { Authorization: "Bearer " + user.token };
  } else {
    return {};
  }
};

export default AuthService;
