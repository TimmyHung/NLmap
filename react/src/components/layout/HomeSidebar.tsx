import { useState, useRef, useCallback, ReactElement } from 'react';
import { getOverPassQL, getGeoJsonData } from '@/components/lib/API';
// import MapLibreMap from "@/components/layout/MapLibreMap";
import css from "@/css/Home.module.css";
import Toast from '@/components/ui/Toast';
import Swal from 'sweetalert2';

export type QueryStates = 'idle' | 'generating_query' | 'extracting_from_osm' | 'extraction_done';
export type Tabs = 'manual' | 'askgpt';
export type QueryResponse = {
  osmquery: string;
  query_name: string;
};

interface HomeSideBarProps {
  setGeoJsonData: (data: GeoJSON.FeatureCollection | null) => void;
  bounds: string;
  setBounds: (bounds: string) => void;
}

export default function HomeSideBar({ setGeoJsonData, bounds, setBounds }: HomeSideBarProps): ReactElement {
  const queryFieldRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const [queryState, setQueryState] = useState<QueryStates>('idle');
  const [activeTab, setActiveTab] = useState<Tabs>('askgpt');
  const [extractedQuery, setExtractedQuery] = useState<null | QueryResponse>(null);

  const handleGeoJsonResponse = useCallback(async (query: string) => {
    const geoJsonResponse = await getGeoJsonData(query, bounds);
    if (geoJsonResponse.status) {
      if (geoJsonResponse.geoJson.features.length === 0) {
        Swal.fire('查無結果');
        setQueryState('idle');
      } else {
        Swal.fire('查詢成功');
        setQueryState('idle');
        setGeoJsonData(geoJsonResponse.geoJson);
      }
    } else {
      setQueryState('idle');
      Toast.fire({
        icon: 'error',
        title: geoJsonResponse.message as String,
      });
    }
  }, [bounds, setGeoJsonData]);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setQueryState('generating_query');

    try {
      let response: QueryResponse;
      if (activeTab === 'askgpt') {
        const overpassQLResponse = await getOverPassQL(extractedQuery?.query_name || '');
        if (!overpassQLResponse.status) throw new Error(overpassQLResponse.message?.toString() || '');
        response = { osmquery: overpassQLResponse.osmquery, query_name: overpassQLResponse.query_name };
      } else {
        response = { osmquery: extractedQuery?.osmquery || '', query_name: extractedQuery?.query_name || '' };
      }

      setExtractedQuery(response);
      setQueryState('extracting_from_osm');
      handleGeoJsonResponse(response.osmquery);
    } catch (error: any) {
      setQueryState('idle');
      Toast.fire({
        icon: 'error',
        title: error.message,
      });
    }
  }, [activeTab, extractedQuery, handleGeoJsonResponse]);

  const printData = useCallback(() => {
    console.log("extractedQuery: " + extractedQuery?.osmquery);
    console.log("queryState: " + queryState);
  }, [extractedQuery, queryState]);

  return (
    <div className={css.custom_area}>
      <div className={css.searchSection}>
        <button onClick={printData}>
          Debug
        </button>
        <div className={css.console}>
          <textarea
            ref={queryFieldRef}
            placeholder={activeTab === 'askgpt' ? '生成後的查詢語言會顯示在這...' : '輸入OverPass Query Language'}
            value={extractedQuery?.osmquery || ''}
            onChange={(e) => setExtractedQuery({ osmquery: e.target.value, query_name: extractedQuery?.query_name || '' })}
            rows={7}
            disabled={activeTab === 'askgpt' || queryState !== 'idle'}
            className={queryState === 'idle' ? '' : css.disabled}
          />
        </div>

        {activeTab === 'askgpt' ? (
          <textarea
            ref={textAreaRef}
            placeholder="輸入你的想法..."
            onChange={(e) => setExtractedQuery({ osmquery: extractedQuery?.osmquery || '', query_name: e.target.value })}
            disabled={queryState !== 'idle'}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.shiftKey) {
                handleSearch(e);
                e.currentTarget.blur();
              }
            }}
            className={queryState === 'idle' ? '' : css.disabled}
          />
        ) : (
          <input
            ref={inputRef}
            placeholder="這筆查詢的名稱"
            onChange={(e) => setExtractedQuery({ osmquery: extractedQuery?.osmquery || '', query_name: e.target.value })}
            disabled={queryState !== 'idle'}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.shiftKey) {
                handleSearch(e);
              }
            }}
            className={queryState === 'idle' ? '' : css.disabled}
          />
        )}

        {/* <button
          type="button"
          disabled={queryState !== 'idle' && queryState !== 'extraction_done'}
          onClick={handleSearch}
          className={queryState === 'idle' || queryState === 'extraction_done' ? '' : css.disabled}
        >
          {queryState === 'generating_query' ? '生成查詢語言' : queryState === 'extracting_from_osm' ? '取得OverPass API' : '發動魔法'}
        </button> */}
        <button
            className={css.submitButton}
            type="button"
            disabled={queryState !== "idle" && queryState !== "extraction_done"}
            style={{
              cursor: queryState !== "idle" && queryState !== "extraction_done" ? 'not-allowed' : "pointer",
            }}
            onClick={(e) => {
              // if (geoJsonData) {
              //   clearGeoJson();
              // } else {
                // if (activeTab === tabs.manual && queryField.current?.value.length === 0) {
                //   queryField.current.focus();
                //   return;
                // }
                // if (textareaElement.current?.value.length === 0) {
                //   textareaElement.current.focus();
                //   return;
                // }
                // if (inputElement.current?.value.length === 0) {
                //   inputElement.current.focus();
                //   return;
                // }
                handleSearch(e);
              // }
            }}>
            {queryState === "generating_query" ? "生成查詢語言" : queryState === "extracting_from_osm" ? "取得OverPass API" : "送出查詢"}
            {(queryState === "generating_query" || queryState === "extracting_from_osm") && (<span className={css.loading_dots}></span>)}
          </button>

        <hr />

        <div className={css.switchTab}>
          <button
            className={activeTab === 'askgpt' ? css.switchTabMain : undefined}
            onClick={() => {
              setActiveTab('askgpt');
              setQueryState('idle');
              // textAreaRef.current!.value = "";
              // setExtractedQuery({ osmquery: "", query_name: "" });
            }}
          >
            GPT生成
          </button>
          <button
            className={activeTab === 'manual' ? css.switchTabMain : undefined}
            onClick={() => {
              setActiveTab('manual');
              setQueryState('idle');
              // textAreaRef.current!.value = extractedQuery?.query_name || "";
              // inputRef.current!.value = extractedQuery?.query_name || "";
            }}
          >
            手動查詢
          </button>
        </div>
      </div>
    </div>
  );
}
