import React from 'react';

export default function NotFound(): React.ReactElement {
  return (
    <div
      className="not-found-container"
      style={{
        width: '100%',
        display: 'flex',
        overflow: 'auto',
        minHeight: '100vh',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center'
      }}
    >
      <title>404 - Not Found</title>
      <h3>OOPS! 找不到頁面</h3>
      <div
        className="not-found-container1"
        style={{
          display: 'flex',
          position: 'relative',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <h1
          className="not-found-text1"
          style={{
            color: 'rgb(38, 38, 38)',
            fontSize: '252px',
            marginTop: '-20px',
            fontWeight: '900',
            marginBottom: '-20px',
            letterSpacing: '-20px'
          }}
        >
          404
        </h1>
      </div>
      <div
        className="not-found-container2"
        style={{
          width: '500px',
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <h2
          className="not-found-text2"
          style={{ textAlign: 'center', fontWeight: '400' }}
        >
          你要的頁面似乎掉入黑洞了
        </h2>
      </div>
    </div>
  );
}
