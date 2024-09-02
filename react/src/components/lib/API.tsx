import axios from 'axios';
import { osmToGeoJson } from "@/components/lib/Utils";

const baseURL = "https://timmyhungback.pettw.online/";
const defaultHeaders = {
  'Content-Type': 'application/json'
};

export const postRequest = async (url: string, requestData: any, headers = {}, timeout = 5000) => {
  try {
    const response = await axios.post(url.startsWith("http") ? url : baseURL + url, requestData, {
      headers: { ...defaultHeaders, ...headers },
      timeout: timeout
    });
    return response.data;
  } catch (error: any) {
    console.error('API POST錯誤:', error.response ? error.response.data : error.message);
    return {status: false, message: error.response ? error.response.data : error.message}
  }
};

export default postRequest;

export const getRequest = async (url: string, requestData: any, headers = {}, timeout = 5000) => {
  try {
    const response = await axios.get(url.startsWith("http") ? url : baseURL + url, {
      headers: { ...defaultHeaders, ...headers },
      params: requestData,
      timeout: timeout
    });
    return response.data;
  } catch (error: any) {
    console.error('API GET錯誤:', error.response ? error.response.data : error.message);
    return {status: false, message: error.response ? error.response.data : error.message}
  }
};

export const deleteRequest = async (url: string, requestData: any, headers = {}, timeout = 5000) => {
  try {
    const response = await axios.delete(url.startsWith("http") ? url : baseURL + url, {
      headers: { 
        'Content-Type': 'application/json',
        ...defaultHeaders, 
        ...headers 
      },
      data: requestData,
      timeout: timeout
    });
    return response.data;
  } catch (error: any) {
    console.error('API DELETE錯誤:', error.response ? error.response.data : error.message);
    return {status: false, message: error.response ? error.response.data : error.message};
  }
};

// ============================================================================================

export const getOverPassQL = async (inputValue: string, model: string, JWTtoken: string, bounds: string) => {
  const data = {
    queryNL: inputValue,
    model: model,
    bounds: bounds,
  };

  const headers = {
    "Authorization": JWTtoken ? `Bearer ${JWTtoken}` : ""
  };

  try {
    console.log("正在取得OverPassQL，資料: \n" + inputValue);
    
    const response = await getRequest("/api/query", data, headers, 20000);
    return response;
  } catch (err) {
    return { statuscode: 500, message: err };
  }
};



export const getGeoJsonData = async (overpassQL: string, bounds: string) => {
  try {
    console.log("正在取得: " + "https://overpass-api.de/api/interpreter?data=" + overpassQL.replaceAll("{{bbox}}", bounds));
    const overpassJson = await getRequest("https://overpass-api.de/api/interpreter?data=" + overpassQL.replaceAll("{{bbox}}", bounds), {}, {}, 20000);
    const geoJson = osmToGeoJson(overpassJson);
    return { status: true, message: "successful get geoJson", geoJson: geoJson, rawJson: overpassJson };
  } catch (err) {
    return { status: false, message: err, geoJson: null };
  }
};

export const verifyJWT = async (JWTtoken: string) => {
  const headers = {
    'Authorization': 'Bearer ' + JWTtoken,
    'Content-Type': 'application/json'
  };
  try {
    const response = await axios.post(baseURL + "api/authorization/jwtverify", {}, {
      headers: { ...defaultHeaders, ...headers },
      timeout: 5000
    });
    return response.data;
  } catch (error: any) {
    return { status: false, message: "Timeout", error: error };
  }
};

export const getHistoryRecords = async (JWTtoken: string, page: number = 1, per_page: number = 5) => {

  const headers = {
    "Authorization": JWTtoken ? `Bearer ${JWTtoken}` : "",
  };

  const params = {
    page: page,
    per_page: per_page
  };

  try {
    const response = await getRequest("api/user/historyRecords/get", params, headers, 20000);
    return response;
  } catch (err) {
    return { statucode: 500, message: err };
  }
};

export const deleteHistoryRecords = async (JWTtoken: string, record_id: number) => {

  const headers = {
    "Authorization": JWTtoken ? `Bearer ${JWTtoken}` : "",
  };

  const data = {
    record_id: record_id,
  };

  try {
    const response = await deleteRequest("api/user/historyRecords/delete", data, headers, 20000);
    return response;
  } catch (err) {
    return { statucode: 500, message: err };
  }
};

export const saveQueryHistoryRecords = async (JWTtoken: string, queryName: string, query: string, valid: boolean, geoRawJson: Record<string, any>, manualQuery: boolean, response_metadata?: string) => {
  const data = {
      query_text: queryName,
      query: query,
      valid: valid,
      geoRawJson: geoRawJson,
      manualQuery: manualQuery,
      response_metadata: response_metadata,
  };

  const headers = {
      "Authorization": JWTtoken ? `Bearer ${JWTtoken}` : "",
  };

  try {
    const response = await postRequest("api/user/historyRecords/save", data, headers, 20000);
    return response;
  } catch (err) {
    console.error('API Save Manual Query 錯誤:', err.response ? err.response.data : err.message);
    return { status: false, message: err.response ? err.response.data : err.message };
  }
};
