import { useState, useRef, useCallback, ReactElement, useEffect } from 'react';
import { getOverPassQL, getGeoJsonData, saveQueryHistoryRecords } from '@/components/lib/API';
import css from "@/css/Home.module.css";
import Toast from '@/components/ui/Toast';
import Swal from 'sweetalert2';
import { useAuth } from '@/components/lib/AuthProvider';
import WhisperButton from '../ui/WhisperButton';

export type QueryStates = 'idle' | 'generating_query' | 'extracting_from_osm' | 'extraction_done';
export type Tabs = 'manual' | 'askgpt';
export type GPTModel = 'gpt35' | 'gpt4' | 'gpt4o';
export type QueryResponse = {
  osmquery: string;
  response_metadata?: string;
};

interface HomeSideBarProps {
  setGeoJsonData;
  bounds: string;
}

export default function HomeSideBar({ setGeoJsonData, bounds }: HomeSideBarProps): ReactElement {
  const { JWTtoken, role } = useAuth();
  const isAdmin = role === "Admin";
  const queryFieldRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLInputElement>(null);

  const [queryState, setQueryState] = useState<QueryStates>('idle');
  const [activeTab, setActiveTab] = useState<Tabs>('askgpt');
  const [gptModel, setGPTModel] = useState<GPTModel>('gpt35');
  const [extractedQuery, setExtractedQuery] = useState<null | QueryResponse>(null);
  const [isRecording, setRecording] = useState<boolean>(false);

  const handleGeoJsonResponse = useCallback(async (query_text: string, query: string, manualQuery: boolean, response_metadata?: string) => {
    let valid = false;
    let geoJsonResponse = null;

    try {
        geoJsonResponse = await getGeoJsonData(query, bounds);
        if (geoJsonResponse.status) {
          if (geoJsonResponse.geoJson.features.length === 0) {
              Swal.fire('查無結果');
          } else {
              setGeoJsonData([geoJsonResponse.geoJson,geoJsonResponse.rawJson]);
              valid = true;
          }
          await saveQueryHistoryRecords(JWTtoken,query_text, query, valid, geoJsonResponse?.rawJson || null, manualQuery, response_metadata);
        } else {
            Toast.fire({
                icon: 'error',
                title: geoJsonResponse.message as String,
            });
        }
    } catch (error) {
        Toast.fire({
            icon: 'error',
            title: '查詢失敗',
        });
    } finally {
        setQueryState('idle');
    }
}, [bounds, setGeoJsonData]);



  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'askgpt') {
        const inputText = textAreaRef.current?.value.trim() || '';
        if (!inputText) {
            textAreaRef.current?.focus();
            return;
        }
    } else {
        const queryText = queryFieldRef.current?.value.trim() || '';
        const queryName = inputRef.current?.value.trim() || '';
        if (!queryText) {
            queryFieldRef.current?.focus();
            return;
        }
        if (!queryName) {
            inputRef.current?.focus();
            return;
        }
    }

    setQueryState('generating_query');

    try {
        let response: QueryResponse;
        var manualQuery = false;
        var overpassQLResponse;
        var query_text;
        const inputText = textAreaRef.current?.value.trim() || ' ';
        const manualInputText = inputRef.current?.value || '';
        if (activeTab === 'askgpt') {
          overpassQLResponse = await getOverPassQL(inputText, gptModel, JWTtoken, bounds);
          if (overpassQLResponse.statuscode != 200){
            throw new Error(overpassQLResponse.message?.toString() || '');
          }
          response = { osmquery: overpassQLResponse.osmquery, response_metadata: overpassQLResponse.response_metadata};
        } else {
          manualQuery = true;
          response = { osmquery: queryFieldRef.current?.value || ''};
        }
        query_text = manualQuery ? manualInputText : inputText; 
        setExtractedQuery(response);
        setQueryState('extracting_from_osm');
        handleGeoJsonResponse(query_text, response.osmquery, manualQuery, response.response_metadata);
    } catch (error: any) {
      Toast.fire({
          icon: 'error',
          title: error.message,
      });
      if(!manualQuery){
        await saveQueryHistoryRecords(JWTtoken, null, null, false, {}, manualQuery, overpassQLResponse.response_metadata);
      }
      setQueryState('idle');
    }
  }, [activeTab, handleGeoJsonResponse, gptModel, bounds]);


  return (
    <div className="w-1/4 bg-[#e5e9ec] h-full px-6 py-4 hidden md:flex flex-col justify-between border-l border-black">
      
      {activeTab === "askgpt" ?
        <div className="w-full flex justify-center border-[1px] border-black rounded-md">
          <div className={`cursor-pointer py-2 w-full text-center border-r-[1px] border-black ${gptModel === "gpt35" && "bg-gray-300 shadow-custom-inner"}`} 
              onClick={() => {
                setGPTModel("gpt35");
              }}>
            GPT-3.5
          </div>
          <div className={`cursor-pointer py-2 w-full text-center border-r-[1px] border-black ${gptModel === "gpt4" && "bg-gray-300 shadow-custom-inner"}`} 
              onClick={() => {
                setGPTModel("gpt4");
              }}>
            GPT-4
          </div>
        
          { isAdmin &&  /*自費購買的API金鑰所以不直接公開 */
            <div className={`cursor-pointer py-2 w-full text-center border-black ${gptModel === "gpt4o" && "bg-gray-300 shadow-custom-inner"}`} onClick={()=>setGPTModel("gpt4o")}>
              GPT-4o
            </div>
          }
        </div>
        : <div></div>
      }

      <div className="">
 
        {activeTab === "askgpt" &&
          <div className="flex flex-row gap-2 whitespace-nowrap overflow-x-auto pb-1 mb-2">
            <div className="px-4 py-2 cursor-pointer rounded-lg border border-black hover:bg-gray-100 text-black md:text-sm">附近餐廳</div>
            <div className="px-4 py-2 cursor-pointer rounded-lg border border-black hover:bg-gray-100 text-black md:text-sm">一公里內公車站</div>
            <div className="px-4 py-2 cursor-pointer rounded-lg border border-black hover:bg-gray-100 text-black md:text-sm">台灣熱門景點</div>
          </div>
        }

        {(extractedQuery?.osmquery || activeTab === "manual") && 
          <div className="">
            <textarea
              className="h-48 bg-bluegrey text-white placeholder:text-lightgrey"
              ref={queryFieldRef}
              placeholder={activeTab === 'askgpt' ? '生成後的查詢語言會顯示在這...' : '輸入OverPass Query Language'}
              value={extractedQuery?.osmquery || ''}
              onChange={(e) => setExtractedQuery({ osmquery: e.target.value})}
              rows={7}
              disabled={activeTab === 'askgpt'}
            />
          </div>
        }

        {activeTab === 'askgpt' ? (
            <input
                ref={textAreaRef}
                placeholder="例如：台北市的停車場"
                onChange={(e) => setExtractedQuery({ osmquery: extractedQuery?.osmquery || ''})}
                disabled={queryState !== 'idle'}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.shiftKey) {
                        handleSearch(e);
                        e.currentTarget.blur();
                    }
                }}
                className="pl-[1em] text-[1em] mb-[3px] h-[3rem] w-full rounded-[10px] border border-black"
            />
        ) : (
            <input
                ref={inputRef}
                placeholder="這筆查詢的名稱"
                onChange={(e) => setExtractedQuery({ osmquery: extractedQuery?.osmquery || ''})}
                disabled={queryState !== 'idle'}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.shiftKey) {
                        handleSearch(e);
                    }
                }}
                className="pl-[1em] text-[1em] mb-[3px] h-[3rem] w-full rounded-[10px] border border-black"
            />
        )}
        <div className="flex flex-row justify-center items-center gap-1">
          <button
            className="w-full rounded-lg bg-slateBlue hover:bg-darkSlateBlue my-1 disabled:hover:bg-slateBlue"
            type="button"
            disabled={(queryState !== "idle" && queryState !== "extraction_done") || isRecording}
            style={{
              cursor: ((queryState !== "idle" && queryState !== "extraction_done") || isRecording) ? 'not-allowed' : "pointer",
            }}
            onClick={(e) => {
                handleSearch(e);
            }}>
            {queryState === "generating_query" ? "生成查詢語言" : queryState === "extracting_from_osm" ? "取得OverPass API" : "送出查詢"}
            {(queryState === "generating_query" || queryState === "extracting_from_osm") && (<span className={css.loading_dots}></span>)}
          </button>

          {activeTab === 'askgpt' &&
            <WhisperButton
              platform={"PC"}
              disabled={queryState !== "idle" && queryState !== "extraction_done"}
              onTranscription={(transcription) => textAreaRef.current.value = transcription} 
              onRecording={(recording) => setRecording(recording)}
            />
          }
        </div>
        
        <hr className="border-t border-t-[1px] border-t-black my-1 mb-2" />

        <div className="flex">
          <button
            className={activeTab === 'askgpt' ? "bg-lightblack text-white hover:bg-lightblack cursor-not-allowed px-0 w-full" : `text-black px-0 w-full hover:bg-darkSlateBlue ${((queryState==="generating_query" || queryState==="extracting_from_osm") || isRecording) && "cursor-not-allowed hover:bg-transparent disabled:text-black"}`}
            onClick={() => {
              setActiveTab('askgpt');
              setQueryState('idle');
            }}
            disabled={queryState==="generating_query" || isRecording}
          >
            GPT生成
          </button>
          <div className="px-0.5"/>
          <button
            className={activeTab === 'manual' ? "bg-lightblack text-white hover:bg-lightblack cursor-not-allowed px-0 w-full" : `text-black px-0 w-full hover:bg-darkSlateBlue ${((queryState==="generating_query" || queryState==="extracting_from_osm") || isRecording) && "cursor-not-allowed hover:bg-transparent disabled:text-black"}`}
            onClick={() => {
              setActiveTab('manual');
              setQueryState('idle');
            }}
            disabled={queryState==="generating_query"  || isRecording}
          >
            手動查詢
          </button>
        </div>
      </div>
    </div>
  );
}
