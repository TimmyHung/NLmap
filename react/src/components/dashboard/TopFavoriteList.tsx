import Toast from '../ui/Toast';
import React, { useState } from 'react';
import { Text } from '@visx/text';
import { scaleLog } from '@visx/scale';
import Wordcloud from '@visx/wordcloud/lib/Wordcloud';
import { ParentSize } from '@visx/responsive';

const TopFavoritesList = ({ top_favoritesList }) => {
    return (
        <div className="md:w-[230px] h-full bg-white rounded-xl">
            <div className="flex justify-center bg-headerBlack text-white rounded-t-xl py-2 px-4 gap-4">
                熱門收藏排行榜
            </div>
            <div className="">
                {top_favoritesList.slice(0, 10).map((item, index) => (
                    <div
                        key={index}
                        data-tooltip-id={"index"}
                        className="w-full border-b py-2 overflow-hidden cursor-pointer px-4"
                        onClick={()=>{
                            Toast.fire({
                                icon: "info",
                                title: item.name,
                                timer: 1500,
                            })
                        }}
                    >
                        {item.name}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopFavoritesList;

export const TopFavoriteHeat = ({ top_favoritesList }) => {
    const colors = ['#143059', '#2F6B9A', '#82a6c2'];

    // 根據 favorite_count 設置字體大小比例
    const fontScale = scaleLog({
        domain: [
            Math.min(...top_favoritesList.map((w) => w.favorite_count)),
            Math.max(...top_favoritesList.map((w) => w.favorite_count)),
        ],
        range: [10, 40], // 調整字體範圍
    });
    
    const fontSizeSetter = (datum) => fontScale(datum.favorite_count);

    const fixedValueGenerator = () => 0.2;

    const [spiralType, setSpiralType] = useState<'archimedean' | 'rectangular'>('archimedean');
    const [withRotation, setWithRotation] = useState(false);

    const getRotationDegree = () => {
        const rand = Math.random();
        const degree = rand > 0.5 ? 60 : -60;
        return rand * degree;
    };

    const wordList = top_favoritesList.map((item) => ({
        text: item.name,
        favorite_count: item.favorite_count,
    }));

    return (
        <div className="bg-white rounded-xl flex flex-col w-full h-full">
            <div className="flex justify-center bg-headerBlack text-white rounded-t-xl py-2 px-4">
                熱門收藏頻率分析
            </div>
            <div style={{ width: '100%', height: '100%' }} className="flex justify-center items-center p-2">
                {/* 使用 ParentSize 來獲取動態的寬度和高度 */}
                <ParentSize>
                    {({ width, height }) => (
                        <div className="flex justify-center items-center" style={{ width, height }}>
                            <Wordcloud
                                words={wordList}
                                width={width * 0.9}
                                height={height * 0.9}
                                fontSize={fontSizeSetter}
                                font={'Impact'}
                                padding={2}
                                spiral={spiralType}
                                rotate={withRotation ? getRotationDegree : 0}
                                random={fixedValueGenerator}
                            >
                                {(cloudWords) =>
                                    cloudWords.map((w, i) => (
                                        <Text
                                            key={w.text}
                                            fill={colors[i % colors.length]}
                                            textAnchor={'middle'}
                                            transform={`translate(${w.x}, ${w.y}) rotate(${w.rotate})`}
                                            fontSize={w.size}
                                            fontFamily={w.font}
                                        >
                                            {w.text}
                                        </Text>
                                    ))
                                }
                            </Wordcloud>
                        </div>
                    )}
                </ParentSize>
            </div>
        </div>
    );
};
