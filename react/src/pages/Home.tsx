import { useEffect, useState, useRef, useCallback, ReactElement } from 'react';
import { getOverPassQL, getGeoJsonData } from '@/components/lib/API';
import MapLibreMap from "@/components/layout/MapLibreMap";
import css from "@/css/Home.module.css";
import Toast from '@/components/ui/Toast';
import Swal from 'sweetalert2';

const querystates = {
  idle: "idle",
  generating_query: "generating_query",
  extracting_from_osm: "extracting_from_osm",
  extraction_done: "extraction_done"
};

const tabs = {
  manual: "manual",
  askgpt: "askgpt"
};

export default function Home(): ReactElement {
  const notifyElement = useRef<HTMLDivElement>(null);
  const textareaElement = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const queryField = useRef<HTMLTextAreaElement>(null);

  const [queryState, setQueryState] = useState(querystates.idle);
  const [overpassQL, setOverPassQL] = useState('');
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [bounds, setBounds] = useState("21.20,117.67,26.25,124.18");
  const [activeTab, setActiveTab] = useState(tabs.askgpt);

  const [inputValue, setInputValue] = useState('');
  const [customQuery, setCustomQuery] = useState('');
  const [queryName, setQueryName] = useState('');

  const printData = useCallback(() => {
    console.log("inputValue: " + inputValue);
    console.log("customQuery: " + customQuery);
    console.log("queryName: " + queryName);
    console.log("queryState: " + queryState);
  }, [inputValue, customQuery, queryName, queryState]);

  const handleGeoJsonResponse = useCallback(async (query: string, bounds: string) => {
    const geoJsonResponse = await getGeoJsonData(query, bounds);
    if (geoJsonResponse.status) {
      if (geoJsonResponse.geoJson.features.length === 0) {
        Swal.fire("查無結果");
        setQueryState(querystates.idle);
      } else {
        Swal.fire("查詢成功");
        setGeoJsonData(geoJsonResponse.geoJson);
        setQueryState(querystates.extraction_done);
      }
    } else {
      setQueryState(querystates.idle);
      Toast.fire({
        icon: "error",
        title: geoJsonResponse.message
      });
    }
  }, []);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setQueryState(querystates.generating_query);

    if (activeTab === tabs.askgpt) {
      const overpassQLResponse = await getOverPassQL(inputValue);
      if (overpassQLResponse.status) {
        setOverPassQL(overpassQLResponse.osmquery);
        setQueryName(overpassQLResponse.query_name);
        setQueryState(querystates.extracting_from_osm);
        handleGeoJsonResponse(overpassQLResponse.osmquery, bounds);
      } else {
        setQueryState(querystates.idle);
        Toast.fire({
          icon: "error",
          title: overpassQLResponse.message
        });
      }
    } else {
      setQueryState(querystates.extracting_from_osm);
      handleGeoJsonResponse(customQuery, bounds);
    }
  }, [activeTab, inputValue, customQuery, bounds, handleGeoJsonResponse]);

  const clearGeoJson = useCallback(() => {
    setGeoJsonData(null);
    setOverPassQL("");
    setQueryState(querystates.idle);
  }, []);

  const focus = useCallback((isFocus: boolean) => {
    if (notifyElement.current) {
      notifyElement.current.className = isFocus ? css.showLabel : css.hideLabel;
    }
  }, []);

  const handleBoundsChange = useCallback((rawBounds: any) => {
    const bounds = `${parseFloat(rawBounds._sw.lat).toFixed(2)},${parseFloat(rawBounds._sw.lng).toFixed(2)},${parseFloat(rawBounds._ne.lat).toFixed(2)},${parseFloat(rawBounds._ne.lng).toFixed(2)}`;
    setBounds(bounds);
  }, []);

  return (
    <div className={css.content}>
      <div className={css.map}>
        {/* TODO: 加上node, way, relations 數量 */}
        <MapLibreMap
          geoJsonData={geoJsonData}
          onBoundsChange={handleBoundsChange}
        />
      </div>

      <div className={css.custom_area}>
        <button onClick={printData}>
          Debug
        </button>
        <div className={css.searchSection}>

          {/* {(queryState === querystates.generating_query || queryState === querystates.extracting_from_osm) && (
            <div className={css.loading_container}>
              <p className={css.loading_text}>
                {queryState === querystates.generating_query ? "生成查詢語言" : "取得OverPass API"}<span className={css.loading_dots}></span>
              </p>
            </div>
          )} */}

          <div className={css.console}>
            <textarea
              ref={queryField}
              placeholder={activeTab === tabs.askgpt ? "生成後的查詢語言會顯示在這..." : "輸入OverPass Query Language"}
              value={activeTab === tabs.askgpt ? overpassQL : customQuery}
              onInput={(e) => activeTab === tabs.manual && setCustomQuery(e.target.value)}
              rows={7}
              style={{
                cursor: activeTab === tabs.askgpt ? 'not-allowed' : queryState !== querystates.idle ? 'not-allowed' : 'text',
              }}
              disabled={activeTab === tabs.askgpt || queryState !== querystates.idle}
            />
          </div>

          {activeTab === tabs.askgpt ? (
            <textarea
              ref={textareaElement}
              placeholder="輸入你的想法..."
              onInput={(e) => setInputValue(e.target.value)}
              onFocus={() => focus(true)}
              onBlur={() => focus(false)}
              disabled={queryState !== querystates.idle && queryState !== querystates.extraction_done}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.shiftKey) {
                  handleSearch(e);
                  if (textareaElement.current) {
                    textareaElement.current.blur();
                  }
                }
              }}
            ></textarea>
          ) : (
            <input
              ref={textareaElement}
              placeholder="這筆查詢的名稱"
              onInput={(e) => setQueryName(e.target.value)}
              onFocus={() => focus(true)}
              onBlur={() => focus(false)}
              disabled={queryState !== querystates.idle && queryState !== querystates.extraction_done}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.shiftKey) {
                  if (activeTab === tabs.manual && queryField.current?.value.length === 0) {
                    queryField.current.focus();
                    return;
                  }
                  if (textareaElement.current?.value.length === 0) {
                    textareaElement.current.focus();
                    return;
                  }
                  handleSearch(e);
                  textareaElement.current.blur();
                }
              }}
            ></input>
          )}

          <div className={css.hideLabel} ref={notifyElement}>
            <label>或按下Shift+Enter送出查詢</label>
          </div>
          <button
            className={css.submitButton}
            type="button"
            disabled={queryState !== querystates.idle && queryState !== querystates.extraction_done}
            style={{
              cursor: queryState !== querystates.idle && queryState !== querystates.extraction_done ? 'not-allowed' : "pointer",
            }}
            onClick={(e) => {
              if (geoJsonData) {
                clearGeoJson();
              } else {
                if (activeTab === tabs.manual && queryField.current?.value.length === 0) {
                  queryField.current.focus();
                  return;
                }
                if (textareaElement.current?.value.length === 0) {
                  textareaElement.current.focus();
                  return;
                }
                handleSearch(e);
              }
            }}>
            {queryState === querystates.generating_query ? "生成查詢語言" : queryState === querystates.extracting_from_osm ? "取得OverPass API" : geoJsonData ? "清除地圖" : "發動魔法"}
            {(queryState === querystates.generating_query || queryState === querystates.extracting_from_osm) && (<span className={css.loading_dots}></span>)}
          </button>

          <hr />

          <div className={css.switchTab}>
            <button
              className={activeTab === tabs.askgpt ? css.switchTabMain : undefined}
              onClick={() => {
                setActiveTab(tabs.askgpt);
                setQueryState(querystates.idle);
              }}
            >
              GPT生成
            </button>
            <button
              className={activeTab === tabs.manual ? css.switchTabMain : undefined}
              onClick={() => {
                setActiveTab(tabs.manual);
                setQueryState(querystates.idle);
              }}
            >
              手動查詢
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
