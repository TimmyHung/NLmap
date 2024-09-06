import { colors } from 'node_modules/react-select/dist/declarations/src/theme';
import css from '../css/DashBoard.module.css';
import React, { useState } from 'react';
import Chart from "react-apexcharts";

export default function DashBoard(): JSX.Element {
    const [selected, setSelected] = useState('home');
    const handleClick = (item) => {
        setSelected(item);
    };
    const [selectedValue, setSelectedValue] = useState('管理員'); 
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedValue(event.target.value);
    };

    //pie
    const chartConfig1 = {
        type: "pie",
        width: 230,
        height: 230,
        series: [40, 30, 20, 10],
        options: {
          chart: {
            toolbar: {
              show: false,
            },
          },
        title: {
            text: "查詢類型分佈",
            align: 'left',
            margin: 10, 
            offsetX: 10, 
            offsetY: 5,
            floating: false,
            style: {
              fontSize: '16px',
              color: '#263238'
            }
        },
        dataLabels: {
            enabled: true,
        },
          colors: ["#4A90E2", "#9EC97F", "#F5A623", "#FF6464"],
          legend: {
            show: true,
            position: 'bottom', 
            labels: {
              colors: '#333',
              useSeriesColors: true
            }
        },
          labels: ['地點', '路線', '設施', '其他'] 
        },
    };
    const chartConfig2 = {
        type: "pie",
        width: 230,
        height: 230,
        series: [65, 30, 5],
        options: {
          chart: {
            toolbar: {
              show: false,
            },
          },
        title: {
            text: "用戶角色分佈",
            align: 'left',
            margin: 10, 
            offsetX: 20, 
            offsetY: 5,
            floating: false,
            style: {
              fontSize: '16px',
              color: '#263238'
            }
        },
        dataLabels: {
            enabled: true,
        },
          colors: ["#4A90E2", "#9EC97F", "#F5A623"],
          legend: {
            show: true,
            position: 'bottom', 
            labels: {
              colors: '#333',
              useSeriesColors: true
            }
        },
          labels: ['用戶', '訪客', '管理員'] 
        },
    };
    const chartConfig3 = {
        type: "pie",
        width: 230,
        height: 230,
        series: [60, 30, 10],
        options: {
          chart: {
            toolbar: {
              show: false,
            },
          },
        title: {
            text: "設備類型分佈",
            align: 'left',
            margin: 10, 
            offsetX: 20, 
            offsetY: 5,
            floating: false,
            style: {
              fontSize: '16px',
              color: '#263238'
            }
        },
        dataLabels: {
            enabled: true,
        },
          colors: ["#4A90E2", "#9EC97F", "#F5A623"],
          legend: {
            show: true,
            position: 'bottom', 
            labels: {
              colors: '#333',
              useSeriesColors: true
            }
        },
          labels: ['電腦', '手機', '平板'] 
        },
    };
    const chartConfig4 = {
        type: "pie",
        width: 230,
        height: 230,
        series: [40, 30, 20, 10],
        options: {
          chart: {
            toolbar: {
              show: false,
            },
          },
        title: {
            text: "地理熱點分佈",
            align: 'left',
            margin: 10, 
            offsetX: 10, 
            offsetY: 5,
            floating: false,
            style: {
              fontSize: '16px',
              color: '#263238'
            }
        },
        dataLabels: {
            enabled: true,
        },
          colors: ["#4A90E2", "#9EC97F", "#F5A623", "#FF6464"],
          legend: {
            show: true,
            position: 'bottom', 
            labels: {
              colors: '#333',
              useSeriesColors: true
            }
        },
          labels: ['北部', '中部', '南部', '東部'] 
        },
    };
    const chartConfig5 = {
        type: "pie",
        width: 230,
        height: 230,
        series: [67, 33],
        options: {
          chart: {
            toolbar: {
              show: false,
            },
        },
        title: {
            text: "成功率",
            align: 'left',
            margin: 10, 
            offsetX: 30, 
            offsetY: 5,
            floating: false,
            style: {
              fontSize: '16px',
              color: '#263238'
            }
        },
        dataLabels: {
            enabled: true,
        },
          colors: ["#4A90E2", "#9EC97F", "#F5A623"],
          legend: {
            show: true,
            position: 'bottom', 
            labels: {
              colors: '#333',
              useSeriesColors: true
            }
        },
          labels: ['成功', '失敗'] 
        },
    }; 

    //line
    const linechart = {
        type: "line",
        width:550,
        height: 300,
        series: [
          {
            name: "活躍用戶數量",
            data: [50, 40, 300, 320, 500, 350, 200, 430, 750],
          },
          {
            name: "登入次數",
            data: [30, 20, 150, 180, 250, 200, 100, 250, 400],
          },
          {
            name: "查詢次數",
            data: [90, 120, 150, 180, 250, 450, 600, 850, 900],
          },
        ],
        
        options: {
            chart: {
                toolbar: {
                show: false,
                },
            },
            colors: ["#376DF7","#53B997","#F5A623"],
            stroke: {
                lineCap: "round",
                curve: "smooth",
            },
            markers: {
                size: 4,
            },
            xaxis: {
                axisTicks: {
                    show: false,
                },
                axisBorder: {
                    show: true,
                },
                labels: {
                    style: {
                        colors: "#8C8C8C",
                        fontSize: "12px",
                        fontFamily: "inherit",
                        fontWeight: 400,
                    },
                },
                categories: [
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ],
                title: {
                    text: "Time",
                    style: {
                        color: "#8C8C8C",
                        fontSize: "14px",
                        fontFamily: "inherit",
                        fontWeight: 500,
                    },
                },
            },
            yaxis: {
                labels: {
                style: {
                    colors: "#8C8C8C",
                    fontSize: "12px",
                    fontFamily: "inherit",
                    fontWeight: 400,
                },
                },
            },
            title: {
                text: "Amount",
                style: {
                    color: "#8C8C8C",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    fontWeight: 500,
                },
            },
            
            grid: {
                show: true,
                borderColor: "#dddddd",
                strokeDashArray: 5,
                xaxis: {
                    lines: {
                        show: true,
                    },
                },
                padding: {
                    top: 5,
                    right: 20,
                },
            },
            fill: {
                opacity: 0.8,
            },
            tooltip: {
                theme: "dark",
            },
        },
    };

    //bar
    const barchart = {
        type: "bar",
        width: 520,
        height: 190,
        series: [
            {
            name: "%",
            data: [80, 90, 75, 30, 20],
            },
        ],
        options: {
            chart: {
                toolbar: {
                    show: false,
                },
            },
            dataLabels: {
                enabled: false,
            },
            colors: ["#294680","#F8C541","#F5A623","#9EC97F","#4A90E2" ],
            
            plotOptions: {
                bar: {
                    horizontal: true,
                    barHeight: "40%",
                    borderRadius: 0,
                    colors:{
                        backgroundBarColors: ['#F5F5F5'],
                    }
                },
            },
            xaxis: {
                axisTicks: {
                    show: false,
                },
                axisBorder: {
                    show: false,
                },
                labels: {
                    style: {
                    colors: "#8C8C8C",
                    fontSize: "12px",
                    fontFamily: "inherit",
                    fontWeight: 400,
                    },
                },
                categories: [
                    "五顆星",
                    "四顆星",
                    "三顆星",
                    "兩顆星",
                    "一顆星",
                ],
                title: {
                    text: "Percent%",
                    style: {
                        color: "#8C8C8C",
                        fontSize: "12px",
                        fontFamily: "inherit",
                        fontWeight: 500,
                    },
                },
            },
            yaxis: {
                labels: {
                    style: {
                    colors: "#8C8C8C",
                    fontSize: "12px",
                    fontFamily: "inherit",
                    fontWeight: 400,
                    },
                },
            },
            grid: {
                show: true,
                borderColor: "#dddddd",
                strokeDashArray: 5,
                xaxis: {
                    lines: {
                    show: true,
                    },
                },
                padding: {
                    top: 5,
                    right: 20,
                },
            },
            fill: {
                opacity: 0.8,
            },
            tooltip: {
                theme: "dark",
            },
        },
    };

      
      
    

    const RightSideContent = () => {
        switch (selected) {
        case 'home':
            return <p>首頁內容</p>;
        case 'chart':
            return(
                <div className={css.chart}>
                    <div className={css.select_time1}>
                        <p>今日</p>
                        <p>本周</p>
                        <p>本月</p>
                        <p>今年</p>
                        <time>2024/07/17~2024/07/17</time>
                    </div>
                        <div className={css.pie_type}>
                            <Chart {...chartConfig1} />
                            <Chart {...chartConfig2} />
                            <Chart {...chartConfig3} />
                            <Chart {...chartConfig4} />
                            <Chart {...chartConfig5} />
                        </div>
                    <div className={css.bottom}>
                        <div className={css.select_time2}>
                            <p>今日</p>
                            <p>本周</p>
                            <p>本月</p>
                            <p>今年</p>
                            <time>2024/07/17~2024/07/17</time>
                        </div>
                        <div className={css.line_type}>
                            <Chart {...linechart} />
                        </div>
                        <div className={css.right}>
                            <div className={css.title1}>用戶反饋和問題解決進度</div>
                            <div className={css.bar_type}>
                            <Chart {...barchart} />
                            </div>
                            <div className={css.title2}>用戶查詢詞頻率分析</div>
                            <div className={css.hot_word}>
                                <p className={css.text1}>便利商店</p>
                                <p className={css.text2}>加油站</p>
                                <p className={css.text3}>餐廳</p>
                                <p className={css.text4}>阿里山</p>
                                <p className={css.text5}>圖書館</p>
                                <p className={css.text6}>桃園機場</p>
                                <p className={css.text7}>百貨公司</p>
                                <p className={css.text8}>廁所</p>
                                <p className={css.text9}>飲料店</p>
                                <p className={css.text10}>汽車停車場</p>
                                <p className={css.text11}>電影院</p>
                                <p className={css.text12}>ATM</p>
                                <p className={css.text13}>Ubike</p>
                                <p className={css.text14}>台北車站</p>
                                <p className={css.text15}>咖啡廳</p>
                                <p className={css.text16}>公車站</p>
                                <p className={css.text17}>高鐵站</p>
                                <p className={css.text18}>九份老街</p>
                                <p className={css.text19}>士林夜市</p>
                                <p className={css.text20}>台北101</p>
                            </div>
                        </div>
                        
                    </div>
                    
                </div>
                
            );
        case 'feedback':
            return(
                <div className={css.feedbackContainer}>
                    <div className={css.leftContainer}>
                        <div className={css.search1}><img src="src/assets/search.png" /></div>
                        <div className={css.container_text1}>
                            <div className={css.unread_messager}><img src="src/assets/unread_messager.png" /></div>
                            <p>一公里內的餐廳</p>
                        </div>
                        <div className={css.container_text2}>
                            <div className={css.read_messager}><img src="src/assets/read_messager.png" /></div>
                            <p>附近景點</p>
                        </div>
                    </div>
                    <div className={css.rightContainer}>
                        <div className={css.question}>
                            <p>一公里內的餐廳
                            <button 
                                className={css.add_data}
                                onClick={() => {
                                    // 添加功能
                                    console.log('Add button clicked');
                                }}
                            >
                                <div className={css.add_icon_}>
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="1" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    >
                                        <path d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    <span className={css.add_text_}>加入資料表</span>
                                </div>
                            </button></p>
                        </div>
                        <div className={css.result}>
                            <div className={css.name}>餐廳名稱</div>
                            <div className={css.address}>
                                <img src="src/assets/landmark.png" />
                                <a>台北市大安區羅斯福路四段1號</a>
                            </div>
                            <div className={css.name}>餐廳名稱</div>
                            <div className={css.address}>
                                <img src="src/assets/landmark.png" />
                                <a>地址</a>
                            </div>
                        </div>
                    </div>    
                </div>
            );
        case 'account':
            return (
                <div className={css.accountContainer}>
                    <div className={css.tool}>
                        <div className={css.search2}>
                            <img src="src/assets/search.png" alt="Search" />
                        </div>
                        {selectedValue === '管理員' && (
                            <button 
                                className={css.add}
                                onClick={() => {
                                    // 添加功能
                                    console.log('Add button clicked');
                                }}
                            >
                                <div className={css.add_icon}>
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    >
                                        <path d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    <span className={css.add_text}>新增</span>
                                </div>
                            </button>
                        )}
                        <select className={css.select}
                            value={selectedValue}
                            onChange={handleChange}
                            >
                            <option value="管理員">管理員</option>
                            <option value="使用者">使用者</option>
                        </select>
                    </div>
                    {selectedValue === '管理員' && (
                        <div className={css.wrap}>
                            <table>
                                <thead>
                                <tr>
                                    <th>編號</th>
                                    <th>使用者帳號</th>
                                    <th>位置</th>
                                    <th>最近登入時間</th>
                                    <th></th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td>1</td>
                                    <td>410631625@gms.tku.edu.tw</td>
                                    <td>192.168.123.132</td>
                                    <td>2024-07-14  20:55</td>
                                    <td className={css.use}><img src="src/assets/on.png" /></td>
                                </tr>
                                <tr>
                                    <td>2</td>
                                    <td>410631591@gms.tku.edu.tw</td>
                                    <td>192.168.123.132</td>
                                    <td>2024-07-14  20:55</td>
                                    <td className={css.use}><img src="src/assets/off.png" /></td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                    {selectedValue === '使用者' && (
                        <div className={css.wrap}>
                            <table>
                                <thead>
                                <tr>
                                    <th>編號</th>
                                    <th>使用者帳號</th>
                                    <th>位置</th>
                                    <th>最近登入時間</th>
                                    <th></th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td>1</td>
                                    <td>410631625@gms.tku.edu.tw</td>
                                    <td>192.168.123.132</td>
                                    <td>2024-07-14  20:55</td>
                                    <td><button className={css.delete}>刪除</button></td>
                                </tr>
                                <tr>
                                    <td>2</td>
                                    <td>410631591@gms.tku.edu.tw</td>
                                    <td>192.168.123.132</td>
                                    <td>2024-07-14  20:55</td>
                                    <td><button className={css.delete}>刪除</button></td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )
        default:
            return <p>選擇一個項目</p>;
        }
    };

return (
    <div className={css.container}>
        <div className={css.leftSide}>
        <p 
            className={`flex flex-col ${selected === 'home' ? css.selected : ''}`}
            onClick={() => handleClick('home')}>
            首頁
            </p>
            <hr />
            <p
            className={selected === 'chart' ? css.selected : ''}
            onClick={() => handleClick('chart')}>
            圖表分析
            </p>
            <hr />
            <p
            className={selected === 'feedback' ? css.selected : ''}
            onClick={() => handleClick('feedback')}>
            使用者回饋
            </p>
            <hr />
            <p
            className={selected === 'account' ? css.selected : ''}
            onClick={() => handleClick('account')}>
            帳號管理
            </p>
        </div>
        <div className={css.rightSide}>
            {RightSideContent()}
      </div>
    </div>
    );
}
