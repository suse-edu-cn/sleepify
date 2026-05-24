import SleepStatusCard from '@/components/SleepStatusCard'
import SleepStatsCard from '@/components/SleepStatsCard'
import AutoSleepCard from '@/components/AutoSleepCard'
import './styles/home.css'

export default function Home() {
    return (
        <section className="sleepify-page">
            <SleepStatusCard />
            <SleepStatsCard />
            <AutoSleepCard />
        </section>
    )
}
