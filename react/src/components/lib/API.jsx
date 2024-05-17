import axios from 'axios';
import osmtogeojson from "osmtogeojson";

const baseURL = "http://127.0.0.1:3000/";
const defaultHeaders = {
    'Content-Type': 'application/json'
};

export const postRequest = async (url, requestData, headers = {}, timeout = 5000) => {
    try {
        const response = await axios.post(url.startsWith("http") ? url : baseURL + url, requestData, {
            headers: { ...defaultHeaders, ...headers },
            timeout: timeout
        });
        return response.data;
    } catch (error) {
        console.error('API POST錯誤:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export default postRequest;

export const getRequest = async (url, requestData, headers = {}, timeout = 5000) => {
    try {
        const response = await axios.get(url.startsWith("http") ? url : baseURL + url, requestData, {
            headers: { ...defaultHeaders, ...headers },
            timeout: timeout
        });
        return response.data;
    } catch (error) {
        console.error('API GET錯誤:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export const getOverPassQL = async(inputValue)=>{
    const data={
        queryNL: inputValue,
    }
    
    try{
        const response = await postRequest("api/query", data, {}, 20000, "GET")
        if(response.status){
            return {status: true, message: "Successful get OverpassQL", osmquery: response.osmquery, query_name: response.query_name}
        }else{
            return {status: false , message: "Rate limit exceeded.", osmquery: null, query_name: null}
        }
    }catch(err){
        return {status: false , message: err, osmquery: null, query_name: null}
    }
}

export const getGeoJsonData = async(overpassQL, bounds)=>{
    try{
        console.log("正在取得: " + "http://overpass-api.de/api/interpreter?data=" + overpassQL.replaceAll("{{bbox}}",bounds))
        const overpassJson = await getRequest("http://overpass-api.de/api/interpreter?data=" + overpassQL.replaceAll("{{bbox}}",bounds), {} , {}, 20000)
        const geoJson = osmtogeojson(overpassJson)
        return {status: true , message: "successful get geoJson", geoJson: geoJson}
    }catch(err){
        return {status: false , message: err, geoJson: null}
    }
}

export const verifyJWT = async (JWTtoken) => {
    const headers = {
        'Authorization': 'Bearer ' + JWTtoken,
        'Content-Type': 'application/json'
    };
    try {
        const response = await axios.post(baseURL + "api/jwtverify", {}, {
            headers: { ...defaultHeaders, ...headers },
            timeout: 5000
        });
        return response.data;
    } catch (error) {
        // console.error('API 請求錯誤:', error.response ? error.response.data : error.message);
        // throw error;
        // console.log('API請求錯誤:',error);
        return {status: false,code: "Timeout",error: error};
    }
}