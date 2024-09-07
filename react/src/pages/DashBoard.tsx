import React, { useState } from 'react';
import { Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import styles from '/src/css/DashBoard.module.css';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels, CategoryScale, LinearScale, PointElement, LineElement, Title);

const DashBoard: React.FC = () => {
  const [selectedButton, setSelectedButton] = useState('home');
  const [isOverlayVisible, setOverlayVisible] = useState(false);
  const [isCustomDateVisible, setCustomDateVisible] = useState(false); 
  const [selectedTimeframe, setSelectedTimeframe] = useState('today'); 

  const handleButtonClick = (button: string) => {
    setSelectedButton(button);
  };

  const handleViewClick = () => {
    setOverlayVisible(true);
  };

  const handleCloseOverlay = () => {
    setOverlayVisible(false);
  };

  const handleTimeframeChange = (timeframe: string) => {
    if (timeframe === 'custom') {
      setCustomDateVisible(true); 
    }
    setSelectedTimeframe(timeframe);
  };

  const handleCloseCustomDate = () => {
    setCustomDateVisible(false); 
  };

  const handleSubmitCustomDate = () => {
    setCustomDateVisible(false); 
  };

  // 圓餅圖選項
  const pieOptions = {
    plugins: {
      legend: {
        display: false, 
      },
      datalabels: {
        color: '#000000',
        font: {
          size: 14,
        },
        anchor: 'center', 
        align: 'end', 
        offset: 0, 
        padding: 0,
        clip: false, 
        formatter: (value: number, context: any) => {
          const label = context.chart.data.labels[context.dataIndex];
          return `${label}\n    ${value}%`;
        },
      },
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      },
    },
    maintainAspectRatio: false,
    cutout: '0%', // Keep it as a pie chart
    responsive: true,
    rotation: -90,
  };

  // 圓餅圖數據
  const queryTypeData = {
    labels: ['其他查詢', '設施查詢', '路線查詢', '地點查詢'],
    datasets: [
      {
        label: '查詢類型分佈',
        data: [10, 20, 30, 40],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  };

  const userRoleData = {
    labels: ['管理員', '訪客', '普通用戶'],
    datasets: [
      {
        label: '用戶角色分佈',
        data: [5, 25, 70],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  };

  const deviceTypeData = {
    labels: ['平板設備', '手機設備', '桌面設備'],
    datasets: [
      {
        label: '設備類型分佈',
        data: [10, 30, 60],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  };

  const geoDistributionData = {
    labels: ['東部地區', '南部地區', '中部地區', '北部地區'],
    datasets: [
      {
        label: '地理熱點分佈',
        data: [10, 20, 30, 40],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  };

  const lineChartDataToday = {
    labels: Array.from({ length: 24 }, (_, i) => i), 
    datasets: [
      {
        label: 'CPU 使用率 (%)',
        data: [85, 70, 55, 60, 80, 45, 30, 25, 80, 90, 60, 50, 40, 70, 80, 95, 65, 45, 40, 60, 85, 90, 70, 75],
        borderColor: '#4472C4',
        backgroundColor: 'rgba(68, 114, 196, 0.5)',
        tension: 0, 
      },
      {
        label: '內存使用率 (%)',
        data: [70, 45, 50, 40, 60, 85, 40, 55, 65, 75, 80, 65, 50, 40, 30, 25, 50, 75, 65, 55, 70, 45, 30, 25],
        borderColor: '#70AD47',
        backgroundColor: 'rgba(112, 173, 71, 0.5)',
        tension: 0, 
      },
      {
        label: '網絡流量 (Mbps)',
        data: [55, 40, 45, 60, 65, 50, 35, 55, 60, 75, 80, 70, 65, 55, 45, 50, 40, 60, 55, 75, 70, 65, 50, 55],
        borderColor: '#ED7D31',
        backgroundColor: 'rgba(237, 125, 49, 0.5)',
        tension: 0, 
      },
    ],
  };
  
  const lineChartDataWeekly = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], // 本週數據
    datasets: [
      {
        label: 'CPU 使用率 (%)',
        data: [80, 85, 70, 75, 90, 95, 88],
        borderColor: '#4472C4',
        backgroundColor: 'rgba(68, 114, 196, 0.5)',
        tension: 0, 
      },
      {
        label: '內存使用率 (%)',
        data: [60, 65, 75, 55, 70, 85, 80],
        borderColor: '#70AD47',
        backgroundColor: 'rgba(112, 173, 71, 0.5)',
        tension: 0, 
      },
      {
        label: '網絡流量 (Mbps)',
        data: [45, 55, 60, 50, 65, 75, 85],
        borderColor: '#ED7D31',
        backgroundColor: 'rgba(237, 125, 49, 0.5)',
        tension: 0, 
      },
    ],
  };
  
  const lineChartDataMonthly = {
    labels: Array.from({ length: 31 }, (_, i) => i + 1), 
    datasets: [
      {
        label: 'CPU 使用率 (%)',
        data: [70, 45, 30, 25, 90, 60, 70, 80, 65, 45, 85, 90, 70, 65, 50, 40, 30, 25, 50, 75, 65, 55, 70, 45, 65, 50, 40, 30, 25, 50, 85],
        borderColor: '#4472C4',
        backgroundColor: 'rgba(68, 114, 196, 0.5)',
        tension: 0, 
      },
      {
        label: '內存使用率 (%)',
        data: [80, 65, 50, 40, 30, 25, 50, 75, 65, 55, 70, 45, 40, 45, 60, 65, 50, 35, 55, 60, 75, 80, 65, 40, 45, 60, 65, 50, 35, 55, 60],
        borderColor: '#70AD47',
        backgroundColor: 'rgba(112, 173, 71, 0.5)',
        tension: 0, 
      },
      {
        label: '網絡流量 (Mbps)',
        data: [30, 25, 50, 75, 65, 55, 70, 45, 65, 50, 40, 30, 25, 50, 85, 30, 25, 50, 75, 65, 55, 70, 45, 65, 50, 40, 30, 25, 50, 65, 50],
        borderColor: '#ED7D31',
        backgroundColor: 'rgba(237, 125, 49, 0.5)',
        tension: 0, 
      },
    ],
  };
  
  const lineChartDataYearly = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], // 今年數據
    datasets: [
      {
        label: 'CPU 使用率 (%)',
        data: [70, 45, 30, 25, 90, 60, 70, 80, 65, 45, 85, 90, 70],
        borderColor: '#4472C4',
        backgroundColor: 'rgba(68, 114, 196, 0.5)',
        tension: 0, 
      },
      {
        label: '內存使用率 (%)',
        data: [80, 65, 50, 40, 30, 25, 50, 75, 65, 55, 70, 45],
        borderColor: '#70AD47',
        backgroundColor: 'rgba(112, 173, 71, 0.5)',
        tension: 0, 
      },
      {
        label: '網絡流量 (Mbps)',
        data: [55, 40, 45, 60, 65, 50, 35, 55, 60, 75, 80, 65],
        borderColor: '#ED7D31',
        backgroundColor: 'rgba(237, 125, 49, 0.5)',
        tension: 0, 
      },
    ],
  };
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function (value: number) {
            return value + '%';
          },
        },
      },
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: selectedTimeframe === 'today' ? 'Time' : selectedTimeframe === 'week' ? 'Day' : selectedTimeframe === 'month' ? 'Date' : 'Month', 
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          boxWidth: 20,
        },
      },
      tooltip: {
        enabled: true,
        mode: 'nearest',
        intersect: false,
      },
    },
    layout: {
      padding: {
        top: 20,
        bottom: 10,
        left: 10,
        right: 10,
      },
    },
  };


  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.sidebar}>
        <button
          className={`${styles.sidebarButton} ${selectedButton === 'home' ? styles.selected : ''}`}
          onClick={() => handleButtonClick('home')}
        >
          首頁
        </button>
        <div className={styles.sidebarDivider}></div>
        <button
          className={`${styles.sidebarButton} ${selectedButton === 'chart' ? styles.selected : ''}`}
          onClick={() => handleButtonClick('chart')}
        >
          圖表分析
        </button>
        <div className={styles.sidebarDivider}></div>
        <button
          className={`${styles.sidebarButton} ${selectedButton === 'feedback' ? styles.selected : ''}`}
          onClick={() => handleButtonClick('feedback')}
        >
          用戶反饋
        </button>
        <div className={styles.sidebarDivider}></div>
        <button
          className={`${styles.sidebarButton} ${selectedButton === 'account' ? styles.selected : ''}`}
          onClick={() => handleButtonClick('account')}
        >
          帳號管理
        </button>
      </div>

      <div className={styles.content}>
        {selectedButton === 'home' && (
          <>
            <div className={styles.dashboardWrapper}>
              <div className={styles.dashboardGrid}>
                <div className={styles.dashboard}>
                  <div className={styles.dashboardHeader}>當前用戶數</div>
                  <div className={styles.dashboardContent}>
                    <div className={styles.leftContent}>
                      <span className={styles.dataValue}>6,215</span>
                      <span className={styles.unit}>次</span>
                    </div>
                    <div className={styles.rightContent}>
                      <span className={`${styles.dataChange} ${styles.increase}`}>
                        8.2%
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.dashboard}>
                  <div className={styles.dashboardHeader}>今日查詢次數</div>
                  <div className={styles.dashboardContent}>
                    <div className={styles.leftContent}>
                      <span className={styles.dataValue}>6,215</span>
                      <span className={styles.unit}>次</span>
                    </div>
                    <div className={styles.rightContent}>
                      <span className={`${styles.dataChange} ${styles.increase}`}>
                        8.2%
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.dashboard}>
                  <div className={styles.dashboardHeader}>平均響應時間</div>
                  <div className={styles.dashboardContent}>
                    <div className={styles.leftContent}>
                      <span className={styles.dataValue}>6,215</span>
                      <span className={styles.unit}>次</span>
                    </div>
                    <div className={styles.rightContent}>
                      <span className={`${styles.dataChange} ${styles.decrease}`}>
                        8.2%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.pieChartGrid}>
                <div className={styles.pieChartDashboard}>
                  <div className={styles.pieChartHeader}>查詢類型分佈</div>
                  <div className={styles.pieChartContent}>
                    <Pie data={queryTypeData} options={pieOptions} />
                  </div>
                </div>

                <div className={styles.pieChartDashboard}>
                  <div className={styles.pieChartHeader}>用戶角色分佈</div>
                  <div className={styles.pieChartContent}>
                    <Pie data={userRoleData} options={pieOptions} />
                  </div>
                </div>

                <div className={styles.pieChartDashboard}>
                  <div className={styles.pieChartHeader}>設備類型分佈</div>
                  <div className={styles.pieChartContent}>
                    <Pie data={deviceTypeData} options={pieOptions} />
                  </div>
                </div>

                <div className={styles.pieChartDashboard}>
                  <div className={styles.pieChartHeader}>地理熱點分佈</div>
                  <div className={styles.pieChartContent}>
                    <Pie data={geoDistributionData} options={pieOptions} />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.importantNotice}>
              <div className={styles.importantNoticeHeader}>重要訊息</div>
              <div className={styles.importantNoticeContentWrapper}>
                <div className={styles.importantNoticeContent}>
                  <p className={styles.noticeTitle}>
                    <span role="img" aria-label="warning">[⚠️]</span> 警告：系統負載過高
                    <button className={styles.viewButton} onClick={() => handleViewClick()}>查看</button>
                  </p>
                  <p className={styles.noticeDetail}><strong>摘要：</strong>今天14:30系統負載超過80%，請檢查相關服務。</p>
                  <p className={styles.noticeDetail}><strong>時間：</strong>2024/08/03 14:30</p>
                  <p className={styles.noticeDetail}><strong>狀態：</strong>未讀</p>
                </div>
                <div className={styles.separator}></div>
                <div className={styles.importantNoticeContent}>
                  <p className={styles.noticeTitle}>
                    <span role="img" aria-label="warning">[⚠️]</span> 警告：系統負載過高
                    <button className={styles.viewButton} onClick={() => handleViewClick()}>查看</button>
                  </p>
                  <p className={styles.noticeDetail}><strong>摘要：</strong>今天14:30系統負載超過80%，請檢查相關服務。</p>
                  <p className={styles.noticeDetail}><strong>時間：</strong>2024/08/03 14:30</p>
                  <p className={styles.noticeDetail}><strong>狀態：</strong>未讀</p>
                </div>
                <div className={styles.separator}></div>
                <div className={styles.importantNoticeContent}>
                  <p className={styles.noticeTitle}>
                    <span role="img" aria-label="warning">[⚠️]</span> 警告：系統負載過高
                    <button className={styles.viewButton} onClick={() => handleViewClick()}>查看</button>
                  </p>
                  <p className={styles.noticeDetail}><strong>摘要：</strong>今天14:30系統負載超過80%，請檢查相關服務。</p>
                  <p className={styles.noticeDetail}><strong>時間：</strong>2024/08/03 14:30</p>
                  <p className={styles.noticeDetail}><strong>狀態：</strong>未讀</p>
                </div>
                <div className={styles.separator}></div>
                <div className={styles.importantNoticeContent}>
                  <p className={styles.noticeTitle}>
                    <span role="img" aria-label="warning">[⚠️]</span> 警告：系統負載過高
                    <button className={styles.viewButton} onClick={() => handleViewClick()}>查看</button>
                  </p>
                  <p className={styles.noticeDetail}><strong>摘要：</strong>今天14:30系統負載超過80%，請檢查相關服務。</p>
                  <p className={styles.noticeDetail}><strong>時間：</strong>2024/08/03 14:30</p>
                  <p className={styles.noticeDetail}><strong>狀態：</strong>未讀</p>
                </div>
              </div>
            </div>

            <div className={styles.lineChartDashboard}>
                  <div className={styles.lineChartButtonWrapper}>
                    <button
                      className={`${styles.lineChartButton} ${selectedTimeframe === 'today' ? styles.selected : ''}`}
                      onClick={() => handleTimeframeChange('today')}
                    >
                      今日
                    </button>
                    <button
                      className={`${styles.lineChartButton} ${selectedTimeframe === 'week' ? styles.selected : ''}`}
                      onClick={() => handleTimeframeChange('week')}
                    >
                      本週
                    </button>
                    <button
                      className={`${styles.lineChartButton} ${selectedTimeframe === 'month' ? styles.selected : ''}`}
                      onClick={() => handleTimeframeChange('month')}
                    >
                      本月
                    </button>
                    <button
                      className={`${styles.lineChartButton} ${selectedTimeframe === 'year' ? styles.selected : ''}`}
                      onClick={() => handleTimeframeChange('year')}
                    >
                      今年
                    </button>
                    <button
                      className={`${styles.lineChartButton} ${selectedTimeframe === 'custom' ? styles.selected : ''}`}
                      onClick={() => handleTimeframeChange('custom')}
                    >
                      自訂時間
                    </button>
                    <div className={styles.lineChartDate}>2024/07/17</div>
                  </div>

                  <div className={styles.lineChartContent}>
                    <Line
                      data={
                        selectedTimeframe === 'today'
                          ? lineChartDataToday
                          : selectedTimeframe === 'week'
                          ? lineChartDataWeekly
                          : selectedTimeframe === 'month'
                          ? lineChartDataMonthly
                          : lineChartDataYearly
                      }
                      options={lineChartOptions}
                    />
                  </div>
                </div>

            {isCustomDateVisible && (
              <div className={styles.overlay} onClick={handleCloseCustomDate}>
                <div className={styles.selectDateContent} onClick={(e) => e.stopPropagation()}>
                  <div className={styles.inputRow}>
                    <label htmlFor="startDate">開始時間：</label>
                    <input type="date" id="startDate" defaultValue="2024-07-07" />
                  </div>
                  <div className={styles.inputRow}>
                    <label htmlFor="endDate">結束時間：</label>
                    <input type="date" id="endDate" defaultValue="2024-07-07" />
                  </div>
                  <button className={styles.confirmButton} onClick={handleSubmitCustomDate}>OK</button>
                </div>
              </div>
              )}

              {isOverlayVisible && (
                <div className={styles.overlay} onClick={handleCloseOverlay}>
                  <div className={styles.overlayContent} onClick={(e) => e.stopPropagation()}>
                    <p><strong>[⚠️] 警告: 系統附載過高</strong></p>
                    <p><strong>摘要:</strong> 今日 14:30 系統負載超過80%，可能會影響系統性能，請檢查並處理相關服務。</p>
                    <p>建議檢查伺服器資源分配和可能的性能瓶頸。</p>
                    <p><strong>時間:</strong> 2024/08/03 14:30</p>
                    <p><strong>狀態:</strong> 未讀</p>
                    <p><strong>操作:</strong></p>
                    <div>
                      <input type="checkbox" id="read" />
                      <label htmlFor="read"> 標視為已讀</label>
                    </div>
                    <div>
                      <input type="checkbox" id="delete" />
                      <label htmlFor="delete"> 刪除通知</label>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                      <button className={styles.confirmButton} onClick={handleCloseOverlay}>
                        OK
                      </button>
                    </div>
                  </div>
                </div>
              )}

            <div className={styles.hotRanking}>
              <div className={styles.hotRankingHeader}>今日熱門榜</div>
              <div className={styles.hotRankingContent}>
                <ul className={styles.hotRankingList}>
                  <li>
                    <span className={styles.number}>1</span>
                    <span className={styles.text}>
                      一公里內餐廳
                      <img
                        src="https://i.ibb.co/cgk00y9/2024-09-06-040804.png"
                        alt="一公里內餐廳"
                        className={styles.image}
                      />
                    </span>
                  </li>
                  <li><span className={styles.number}>2</span><span className={styles.text}>附近景點</span></li>
                  <li><span className={styles.number}>3</span><span className={styles.text}>臺灣的大學</span></li>
                  <li><span className={styles.number}>4</span><span className={styles.text}>最近的廁所</span></li>
                  <li><span className={styles.number}>5</span><span className={styles.text}>附近的加油站</span></li>
                  <li><span className={styles.number}>6</span><span className={styles.text}>便利商店</span></li>
                  <li><span className={styles.number}>7</span><span className={styles.text}>最近的ATM</span></li>
                  <li><span className={styles.number}>8</span><span className={styles.text}>最近的醫院</span></li>
                  <li><span className={styles.number}>9</span><span className={styles.text}>中正路</span></li>
                  <li><span className={styles.number}>10</span><span className={styles.text}>機場</span></li>
                </ul>
              </div>
            </div>

            <div className={styles.noticeDashboard}>
              <div className={styles.noticeHeader}>通知</div>
              <div className={styles.noticeContentWrapper}>
                <div className={styles.noticeContent}>
                  <p className={styles.noticeTitle}>
                    <span role="img" aria-label="notification">[?️]</span> 用戶反饋：地圖顯示問題
                    <button className={styles.viewButton} onClick={() => handleViewClick()}>查看</button>
                  </p>
                  <p className={styles.noticeDetail}><strong>摘要 :</strong>用戶反映地圖在某些區域無法正常顯示。</p>
                  <p className={styles.noticeDetail}><strong>時間：</strong>2024/08/02 18:45</p>
                  <p className={styles.noticeDetail}><strong>狀態：</strong>未讀</p>
                </div>
                <div className={styles.separator}></div>
                <div className={styles.noticeContent}>
                  <p className={styles.noticeTitle}>
                    <span role="img" aria-label="notification">[🔄]</span>系統更新：版本2.0.1
                    <button className={styles.viewButton} onClick={() => handleViewClick()}>查看</button>
                  </p>
                  <p className={styles.noticeDetail}><strong>摘要：</strong> 新版本修復了多個已知問題並提升了系統穩定性。</p>
                  <p className={styles.noticeDetail}><strong>時間：</strong>2024/08/03 10:15</p>
                  <p className={styles.noticeDetail}><strong>狀態：</strong>已讀</p>
                </div>
                <div className={styles.separator}></div>
                <div className={styles.noticeContent}>
                  <p className={styles.noticeTitle}>
                    <span role="img" aria-label="notification">[?️]</span> 用戶反饋：地圖顯示問題
                    <button className={styles.viewButton} onClick={() => handleViewClick()}>查看</button>
                  </p>
                  <p className={styles.noticeDetail}><strong>摘要 :</strong>用戶反映地圖在某些區域無法正常顯示。</p>
                  <p className={styles.noticeDetail}><strong>時間：</strong>2024/08/02 18:45</p>
                  <p className={styles.noticeDetail}><strong>狀態：</strong>未讀</p>
                </div>
                <div className={styles.separator}></div>
                <div className={styles.noticeContent}>
                  <p className={styles.noticeTitle}>
                    <span role="img" aria-label="notification">[🔄]</span>系統更新：版本2.0.1
                    <button className={styles.viewButton} onClick={() => handleViewClick()}>查看</button>
                  </p>
                  <p className={styles.noticeDetail}><strong>摘要：</strong> 新版本修復了多個已知問題並提升了系統穩定性。</p>
                  <p className={styles.noticeDetail}><strong>時間：</strong>2024/08/03 10:15</p>
                  <p className={styles.noticeDetail}><strong>狀態：</strong>已讀</p>
                </div>
              </div>
            </div>
          </>
        )}

        {selectedButton === 'chart' && <p>圖表分析內容</p>}
        {selectedButton === 'feedback' && <p>用戶反饋內容</p>}
        {selectedButton === 'account' && <p>帳號管理內容</p>}
      </div>
    </div>
  );
};

export default DashBoard;
