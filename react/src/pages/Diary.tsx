import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import css from '../css/Diary.module.css';
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
        const targetDate = new Date('2024-09-16T00:00:00');
        const currentDate = new Date();
        const timeDifference = targetDate.getTime() - currentDate.getTime();
        const daysRemaining = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
        setDaysRemaining(daysRemaining);
    }

    return (
        <div className={css.mainContainer}>
            <div className={css.countDown}>
                <h1>Github Commit List</h1>
                <h2>專題發表剩餘 {daysRemaining} 天</h2>
            </div>
            <div className={css.commitList}>
                {
                    isDataLoading ?
                    <div className={css.loading}>
                        <h1>資料載入中...</h1>
                    </div>
                    :
                    commits.map((commit, index) => (
                        <div key={index} className={css.commitItemContainer}>
                            <div className={css.commitInfo}>
                                <div className={css.commitDetails}>
                                    {commit.message.split('\n').map((line, i) => (
                                        <div key={i}>{line}</div>
                                    ))}
                                    <p>
                                        <a href={`https://www.github.com/${commit.author}`} target="_blank" rel="noopener noreferrer">
                                        <img
                                            src={commit.avatarURL}
                                            alt={`${commit.author} avatar`}
                                            width={20}
                                            height={20}
                                            className={css.avatar}
                                        />
                                        {commit.author}</a> - {new Date(commit.date).toLocaleDateString() + ' ' + new Date(commit.date).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                            <div className={css.commitID}>
                                <a href={commit.commitURL} target="_blank" rel="noopener noreferrer">{"#" + commit.id}</a>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}
