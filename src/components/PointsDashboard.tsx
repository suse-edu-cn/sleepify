'use client'

import { useUserState } from '@/components/UserStateProvider'
import '@mdui/icons/info.js'

export default function PointsDashboard() {
    const { user, userLoading, challenges, challengesLoading } = useUserState()

    return (
        <section className="sleepify-page">
            <mdui-card className="sleepify-card">
                <h2 className="sleepify-card-title">积分</h2>
                {userLoading ? (
                    <mdui-circular-progress />
                ) : (
                    <div className="sleepify-card-body">
                        {typeof user?.points === 'number' ? user.points : '暂未获取到积分信息'}
                    </div>
                )}
            </mdui-card>

            <div className="sleepify-points-section">
                <h2 className="sleepify-points-section-title">进行中的挑战</h2>
                {challengesLoading ? (
                    <mdui-circular-progress />
                ) : challenges && challenges.length > 0 ? (
                    <div className="sleepify-points-challenge-list">
                        {challenges.map((item) => (
                            <mdui-card
                                key={item.id}
                                className="sleepify-card sleepify-points-challenge-card"
                                clickable
                            >
                                <div className="sleepify-points-challenge-header">
                                    <div className="sleepify-points-challenge-name">
                                        {item.name}
                                    </div>
                                    <div className="sleepify-points-challenge-points">
                                        +{item.points}
                                    </div>
                                </div>
                                <div className="sleepify-points-challenge-meta">
                                    {item.is_onetime ? (
                                        <span className="sleepify-points-challenge-tag">
                                            一次性
                                        </span>
                                    ) : (
                                        item.duration > 0 && (
                                            <span className="sleepify-points-challenge-tag">
                                                {item.duration} 天
                                            </span>
                                        )
                                    )}
                                    <span className="sleepify-points-challenge-date">
                                        开始于 {item.start_date}
                                    </span>
                                </div>
                            </mdui-card>
                        ))}
                    </div>
                ) : (
                    <mdui-card className="sleepify-card" clickable>
                        <div className="sleepify-points-empty">
                            <mdui-icon-info /> 暂无进行中的挑战
                        </div>
                    </mdui-card>
                )}
            </div>
        </section>
    )
}
