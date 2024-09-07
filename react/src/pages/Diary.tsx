import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchCommits } from '@/store/slices/githubSlice';

export default function Diary() {
    const dispatch = useDispatch<AppDispatch>();
    const commits = useSelector((state: RootState) => state.github.commits);
    const isDataLoading = useSelector((state: RootState) => state.github.isDataLoading);
    const isLoaded = useSelector((state: RootState) => state.github.isLoaded);
    const [daysRemaining, setDaysRemaining] = useState(0);

    useEffect(() => {
        if (!isLoaded) {
            dispatch(fetchCommits());
        }
        calculateDaysRemaining();
    }, [dispatch, isLoaded]);

    function calculateDaysRemaining() {
        const targetDate = new Date('2024-09-21T00:00:00');
        const currentDate = new Date();
        const timeDifference = targetDate.getTime() - currentDate.getTime();
        const daysRemaining = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
        setDaysRemaining(daysRemaining);
    }
    
    function getDayRemainingText(){
        if(daysRemaining >= 0){
            return `專題發表剩餘 ${daysRemaining} 天`
        }else{
            return `專題發表過了 ${Math.abs(daysRemaining)} 天`
        }
    }

    return (
        <div className="min-h-screen px-8 md:px-32 pb-6">
            <div className="flex flex-col md:flex-row justify-between py-4 items-center mb-5 border-b border-black text-center text-2xl md:text-2xl">
                <h1>Github Commit List</h1>
                <h1>{getDayRemainingText()}</h1>
            </div>
            <div className="w-full">
                {
                    isDataLoading ?
                    <div className="flex justify-center items-center">
                        <h1>資料載入中...</h1>
                    </div>
                    :
                    commits.map((commit, index) => (
                        <div key={index} className="bg-gray-100 w-full flex justify-between mb-2 md:mb-2.5 px-4 py-2 border border-gray-400 rounded-lg">
                            <div className="flex items-center">
                                <div className="">
                                    {commit.message.split('\n').map((line, i) => (
                                        <div key={i}>{line}</div>
                                    ))}
                                    <div className="flex flex-col md:flex-row items-start mt-2 md:mt-4 text-gray-500">
                                        <a href={`https://www.github.com/${commit.author}`} target="_blank" rel="noopener noreferrer" className="font-bold text-black no-underline flex items-center">
                                            <img
                                                src={commit.avatarURL}
                                                alt={`${commit.author} avatar`}
                                                width={20}
                                                height={20}
                                                className="rounded-full mr-1"
                                            />
                                            {commit.author}
                                        </a>
                                        <p className="hidden md:block px-1">
                                            -
                                        </p>
                                        <p>
                                            {new Date(commit.date).toLocaleDateString() + ' ' + new Date(commit.date).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <a href={commit.commitURL} target="_blank" rel="noopener noreferrer" className="font-bold text-black no-underline">
                                    {"#" + commit.id}
                                </a>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}
