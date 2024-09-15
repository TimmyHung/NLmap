import axios from 'axios';
import { osmToGeoJson } from "@/components/lib/Utils";

const baseURL = "https://timmyhungback.pettw.online/";
const defaultHeaders = {
  'Content-Type': 'application/json'
};

export const postRequest = async (url: string, requestData: any, headers = {}, timeout = 10000) => {
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

export const getRequest = async (url: string, requestData: any, headers = {}, timeout = 10000) => {
  try {
    const response = await axios.get(url.startsWith("http") ? url : baseURL + url, {
      headers: { ...defaultHeaders, ...headers },
      params: requestData,
      timeout: timeout
    });
    return {statusCode: response.status, data: response.data};
  } catch (error: any) {
    console.error('API GET錯誤:', error.response ? error.response.data : error.message);
    return {statusCode: 500, message: error.response ? error.response.data : error.message}
  }
};

export const deleteRequest = async (url: string, requestData: any, headers = {}, timeout = 10000) => {
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

export const putRequest = async (url: string, requestData: any, headers = {}, timeout = 10000) => {
  try {
    const response = await axios.put(url.startsWith("http") ? url : baseURL + url, requestData, {
      headers: { 
        'Content-Type': 'application/json',
        ...defaultHeaders, 
        ...headers 
      },
      timeout: timeout
    });
    return response.data;
  } catch (error: any) {
    console.error('API PUT錯誤:', error.response ? error.response.data : error.message);
    return {status: false, message: error.response ? error.response.data.message : error.message};
  }
};

// ============================================================================================

// 取得OverpassQL
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
    return response.data;
  } catch (err) {
    return { statuscode: 500, message: err };
  }
};

// 取得GeoJson資料
export const getGeoJsonData = async (overpassQL: string, bounds: string) => {
  try {
    console.log("正在取得: " + "https://overpass-api.de/api/interpreter?data=" + overpassQL.replaceAll("{{bbox}}", bounds));
    const overpassJson = await getRequest("https://overpass-api.de/api/interpreter?data=" + overpassQL.replaceAll("{{bbox}}", bounds), {}, {}, 20000);
    
    // 觸發timeout
    if(overpassJson.statusCode != 200){
      return { status: false, message: overpassJson.message, geoJson: null };
    }

    const geoJson = osmToGeoJson(overpassJson.data);
    return { status: true, message: "successful get geoJson", geoJson: geoJson, rawJson: overpassJson };
  } catch (err) {
    return { status: false, message: err, geoJson: null };
  }
};

// 驗證JWTtoken
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

// 取得後臺資料
export const getDashboardStats = async (JWTtoken: string, systemStatsOnly = false, range?: string) => {
  const headers = {
    "Authorization": JWTtoken ? `Bearer ${JWTtoken}` : "",
  };

  const params = {
    range: range,
    systemStatsOnly
  };

  try {
    const response = await getRequest("api/dashboard/stats", params, headers, 20000);
    return response.data;
  } catch (err) {
    return { statucode: 500, message: err };
  }
}

// 刪除帳號
export const deleteAccount = async (JWTtoken: string, userID: number, account_type: string) => {
  
  const headers = {
    "Authorization": JWTtoken ? `Bearer ${JWTtoken}` : "",
  };

  const data = {
    userID: userID,
    account_type: account_type
  }
  try{
    const response = await deleteRequest('api/authorization/delete', data, headers);
    return response
  }catch (err){
    return { status: 500, message: err}
  }
}

export const updateUserRole = async (JWTtoken: string, userID: number, newRole: string) => {
  const headers = {
    "Authorization": JWTtoken ? `Bearer ${JWTtoken}` : "",
  };

  const data = {
    userID: userID,
    newRole: newRole
  }
  try{
    const response = await postRequest('api/authorization/updateRole', data, headers);
    return response
  }catch (err){
    return { status: 500, message: err}
  }
}

// 取得歷史紀錄
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
    return response.data;
  } catch (err) {
    return { statucode: 500, message: err };
  }
};

// 刪除歷史紀錄
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

// 紀錄每日訪客
export const setDailyVisitRecord = async(ip: string)=>{

  try{
    const response = await postRequest('/api/record-visit', {ip});
    return response
  }catch (err){
    return { status: 500, message: err}
  }
}

// 儲存歷史紀錄
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

// 修改歷史紀錄
export const editQueryHistoryRecords = async (JWTtoken: string, query_history_id: number, geoRawJson: Record<string, any>) => {
  const headers = {
    "Authorization": JWTtoken ? `Bearer ${JWTtoken}` : "",
  };
  const data = { geoRawJson, query_history_id };

  try {
    const response = await putRequest(`/api/user/historyRecords/edit`, data, headers);
    return response;
  } catch (error: any) {
    return { statusCode: 500, message: error.response ? error.response.data : error.message };
  }
}

// 轉錄Whipser語音檔案
export const transcribeAudio = async (audioFile: File, JWTtoken: string, platform: string, timeout = 20000): Promise<any> => {
  const url = baseURL + "api/whisper";
  
  const headers = {
    'Authorization': JWTtoken ? `Bearer ${JWTtoken}` : "",
    'Content-Type': 'multipart/form-data'
  };

  const formData = new FormData();
  formData.append('file', audioFile);
  formData.append('platform', platform);

  try {

    const response = await axios.post(url, formData, {
      headers: headers,
      timeout: timeout
    });

    return response.data;
  } catch (error: any) {
    return {status: false, message: error.response ? error.response.data : error.message};
  }
};

// 創建新的收藏清單
export const createFavoriteList = async (JWTtoken: string, title: string) => {
  const data = { title };

  const headers = {
    "Authorization": JWTtoken ? `Bearer ${JWTtoken}` : "",
  };

  try {
    const response = await postRequest("api/user/favorites/create", data, headers, 20000);
    return response;
  } catch (err) {
    return { status: false, message: err };
  }
};

// 添加項目到收藏清單
export const addFavoriteItem = async (JWTtoken: string, favorite_id: number, records: Record<string, any>) => {
  const data = { favorite_id, records };
  const headers = {
    "Authorization": JWTtoken ? `Bearer ${JWTtoken}` : "",
  };

  try {
    const response = await postRequest("api/user/favorites/item/add", data, headers, 20000);
    return response;
  } catch (err) {
    return { status: false, message: err };
  }
};

// 取得收藏清單及其項目
export const getFavoriteLists = async (JWTtoken: string) => {
  const headers = {
    "Authorization": JWTtoken ? `Bearer ${JWTtoken}` : "",
  };

  try {
    const response = await getRequest("api/user/favorites/lists", {}, headers, 20000);
    return response.data;
  } catch (err) {
    return { statuscode: 500, message: err };
  }
};

// 刪除收藏清單
export const deleteFavoriteList = async (JWTtoken: string, favorite_id: number) => {
  const data = { favorite_id };

  const headers = {
    "Authorization": JWTtoken ? `Bearer ${JWTtoken}` : "",
  };

  try {
    const response = await deleteRequest("api/user/favorites/delete", data, headers, 20000);
    return response;
  } catch (err) {
    return { status: false, message: err };
  }
};

// 修改收藏清單
export const updateFavorite = async ( JWTtoken: string, favorite_id: number, updates: { new_title?: string, new_recordset?: Record<string, any> }) => {
  try {
    const headers = {
      "Authorization": JWTtoken ? `Bearer ${JWTtoken}` : "",
    };
    const data = { favorite_id, ...updates };
    const response = await putRequest(`/api/user/favorites/edit`, data, headers);
    return response;
  } catch (error: any) {
    return { statusCode: 500, message: error.response ? error.response.data : error.message };
  }
};

//發送重置密碼OTP
export const sendOTP = async (email: string) => {
  const data = { email };
  try {
    const response = await postRequest("api/authorization/otp", data, {});
    return response;
  } catch (err) {
    return { statusCode: 500, message: err };
  }
};

//發送重製密碼請求
export const resetPassword = async (email, otp, newPassword) => {
  const data = { email, otp, new_password: newPassword };
  
  try {
    // 發送 POST 請求到後端 API 進行確認
    const response = await postRequest("api/authorization/reset", data, {});
    return response
  } catch (err) {
    // 捕捉錯誤並返回錯誤訊息
    return { statusCode: 500, message: err };
  }
};

export const getTopSearch = async () => {
  try {
    // 發送 POST 請求到後端 API 進行確認
    const response = await getRequest("api/dashboard/getTopFavorites", {});
    return response.data
  } catch (err) {
    // 捕捉錯誤並返回錯誤訊息
    return { statusCode: 500, message: err };
  }
}