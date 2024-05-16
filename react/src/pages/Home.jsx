import { getOverPassQL, getGeoJsonData } from '../components/utils/API.jsx';
import { useEffect, useState, useRef } from 'react';
import { ReflexContainer,ReflexSplitter,ReflexElement } from 'react-reflex';
import LeafletMap from "../components/layout/LeafletMap.jsx";
import MapLibreMap from "../components/layout/MapLibreMap.jsx"; 
import css from "../css/Home.module.css";

export default function Home() {
  const notifyElement = useRef(null);
  const textareaElement = useRef(null);
  const buttonElement = useRef(null);

  const [inputValue, setInputValue] = useState('');
  const [overpassQL, setOverPassQL] = useState('');
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [bounds, setBounds] = useState("21.20,117.67,26.25,124.18");

  async function handleSearch(e) {
    e.preventDefault();
    textareaElement.current.disabled = true;
    buttonElement.current.disabled = true;
    console.log("查詢中");
    const overpassQLResponse = await getOverPassQL(inputValue, bounds);
    console.log("取得OverpassAPI");
    if(overpassQLResponse.status){
      setOverPassQL(overpassQLResponse.overpassQL);
      const geoJsonResponse = await getGeoJsonData(overpassQLResponse.overpassQL);
      if (geoJsonResponse.status) {
        if (geoJsonResponse.geoJson.features.length == 0) {
          Swal.fire("查無結果");
          textareaElement.current.disabled = false;
        } else {
          Swal.fire("查詢成功");
          setGeoJsonData(geoJsonResponse.geoJson);
        }
        buttonElement.current.disabled = false;
      } else {
        Swal.fire("取得GeoJson失敗\n錯誤訊息：" + geoJsonResponse.message);
        textareaElement.current.disabled = false;
        buttonElement.current.disabled = false;
      }
    }else{
      Swal.fire("取得OverPass QL 失敗\n錯誤訊息：" + overpassQLResponse.message);
      textareaElement.current.disabled = false;
      buttonElement.current.disabled = false;
    }
  }

  function clearGeoJson() {
    setGeoJsonData(null);
    setOverPassQL("");
    textareaElement.current.disabled = false;
    buttonElement.current.disabled = false;
  }

  function focus(isfocus) {
    isfocus ? notifyElement.current.className = css.showLabel : notifyElement.current.className = css.hideLabel;
  }

  function handleBoundsChange(rawBounds) {
    const a = parseFloat(rawBounds._sw.lat).toFixed(2);
    const b = parseFloat(rawBounds._sw.lng).toFixed(2);
    const c = parseFloat(rawBounds._ne.lat).toFixed(2);
    const d = parseFloat(rawBounds._ne.lng).toFixed(2);
    const bounds = `${a},${b},${c},${d}`
    setBounds(bounds);

  }

  return (
      <div orientation="vertical" className={css.content}>
        <div className={css.map}>
          {/* <LeafletMap geoJsonData={geoJsonData} onBoundsChange={handleBoundsChange} /> */}
          <MapLibreMap
            geoJsonData={geoJsonData}
            onBoundsChange={handleBoundsChange}
          />
        </div>

        <div className={css.custom_area}>
            <div className={css.console}>
              <textarea value={overpassQL} disabled></textarea>
            </div>
            <div className={css.searchSection}>
              <textarea
                ref={textareaElement}
                placeholder='輸入你的想法...'
                onInput={(e) => setInputValue(e.target.value)}
                onFocus={() => focus(true)}
                onBlur={() => focus(false)}
                onKeyDown={(e) => (e.key === 'Enter' && e.shiftKey) && handleSearch(e)}
              ></textarea>
              <div className={css.hideLabel} ref={notifyElement}>
                <label>按下Shift+Enter送出查詢</label>
              </div>
              <button
                ref={buttonElement}
                type="button"
                onClick={(e) => geoJsonData ? clearGeoJson() : handleSearch(e)}>
                {geoJsonData ? "清除地圖" : "發動魔法"}
              </button>
            </div>
        </div>  
      </div>
  );
}