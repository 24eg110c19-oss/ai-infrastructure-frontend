import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
} from "chart.js"
import { Line, Bar } from "react-chartjs-2"
import "./Dashboard.css"
import "./AlertHistory.css"

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
)

function Dashboard() {

    const [monitoring, setMonitoring] = useState(null)
    const [aiAnalysis, setAiAnalysis] = useState(null)
    const [history, setHistory] = useState([])
    const [alerts, setAlerts] = useState([])

    const [alertStats, setAlertStats] = useState({
        totalAlerts: 0,
        cpuAlerts: 0,
        ramAlerts: 0,
        diskAlerts: 0,
        gpuAlerts: 0,
        highSeverityAlerts: 0
    })

    const [notification, setNotification] = useState(null)
    const lastNotifiedAlertId = useRef(null)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [lastUpdated, setLastUpdated] = useState("")

    const calculateHealthScore = (data) => {

        if (!data) {
            return 0
        }

        const cpuHealth = 100 - data.cpu
        const ramHealth = 100 - data.ram
        const diskHealth = 100 - data.disk
        const gpuHealth = 100 - data.gpu

        const score = Math.round(
            (
                cpuHealth +
                ramHealth +
                diskHealth +
                gpuHealth
            ) / 4
        )

        return Math.max(0, Math.min(100, score))
    }

    const getHealthStatus = (score) => {

        if (score >= 90) {
            return {
                text: "EXCELLENT",
                className: "health-excellent",
                icon: "🟢"
            }
        }

        if (score >= 75) {
            return {
                text: "HEALTHY",
                className: "health-healthy",
                icon: "🟢"
            }
        }

        if (score >= 50) {
            return {
                text: "WARNING",
                className: "health-warning",
                icon: "🟡"
            }
        }

        return {
            text: "CRITICAL",
            className: "health-critical",
            icon: "🔴"
        }
    }

    const getHealthExplanation = (data, score) => {

        if (!data) {
            return "Waiting for infrastructure data."
        }

        if (data.cpu > 75) {
            return "CPU usage is high and is reducing the infrastructure health score."
        }

        if (data.ram > 70) {
            return "RAM usage is high and is reducing the infrastructure health score."
        }

        if (data.disk > 80) {
            return "Disk usage is high and is reducing the infrastructure health score."
        }

        if (data.gpu > 75) {
            return "GPU usage is high and is reducing the infrastructure health score."
        }

        if (score >= 90) {
            return "All monitored resources are operating at a healthy level."
        }

        if (score >= 75) {
            return "Infrastructure is healthy with moderate resource usage."
        }

        if (score >= 50) {
            return "Resource usage requires attention and continued monitoring."
        }

        return "Infrastructure requires immediate attention."
    }

    const calculateResourceStatistics = (resource) => {

        if (history.length === 0) {
            return {
                current: 0,
                average: 0,
                highest: 0,
                lowest: 0
            }
        }

        const values = history.map(item => item[resource])

        const current = values[values.length - 1]

        const average = Math.round(
            values.reduce((sum, value) => sum + value, 0) / values.length
        )

        const highest = Math.max(...values)
        const lowest = Math.min(...values)

        return {
            current,
            average,
            highest,
            lowest
        }
    }

    const detectResourceTrend = (resource) => {

        if (history.length < 3) {
            return {
                trend: "STABLE",
                icon: "➡️",
                className: "trend-stable",
                explanation: "Collecting more data to detect the trend."
            }
        }

        const values = history.map(item => item[resource])

        const recentValues = values.slice(-3)

        const firstValue = recentValues[0]
        const lastValue = recentValues[recentValues.length - 1]

        const difference = lastValue - firstValue

        if (lastValue >= 80) {
            return {
                trend: "HIGH USAGE",
                icon: "⚠️",
                className: "trend-high",
                explanation: `${resource.toUpperCase()} usage is currently high. Monitor the workload carefully.`
            }
        }

        if (difference >= 10) {
            return {
                trend: "INCREASING",
                icon: "📈",
                className: "trend-increasing",
                explanation: `${resource.toUpperCase()} usage is increasing. Monitor the resource and consider optimization.`
            }
        }

        if (difference <= -10) {
            return {
                trend: "DECREASING",
                icon: "📉",
                className: "trend-decreasing",
                explanation: `${resource.toUpperCase()} usage is decreasing. Current resource pressure is reducing.`
            }
        }

        return {
            trend: "STABLE",
            icon: "➡️",
            className: "trend-stable",
            explanation: `${resource.toUpperCase()} usage is relatively stable.`
        }
    }

    const fetchDashboardData = async () => {

        try {

            setError("")

            const monitoringResponse = await fetch(
                "http://localhost:8081/monitoring"
            )

            if (!monitoringResponse.ok) {
                throw new Error("Monitoring API failed")
            }

            const monitoringData = await monitoringResponse.json()

            setMonitoring(monitoringData)

            setHistory(prevHistory => {

                const newData = {
                    time: new Date().toLocaleTimeString(),
                    cpu: monitoringData.cpu,
                    ram: monitoringData.ram,
                    disk: monitoringData.disk,
                    gpu: monitoringData.gpu
                }

                const updatedHistory = [
                    ...prevHistory,
                    newData
                ]

                return updatedHistory.slice(-10)
            })

            const aiResponse = await fetch(
                `http://localhost:8081/ai/analyze?cpu=${monitoringData.cpu}&ram=${monitoringData.ram}&disk=${monitoringData.disk}&gpu=${monitoringData.gpu}`
            )

            if (aiResponse.ok) {

                const aiData = await aiResponse.json()

                setAiAnalysis(aiData)

            } else {

                setAiAnalysis({
                    analysis: "AI analysis is currently unavailable.",
                    recommendation: "Continue monitoring infrastructure resources.",
                    severity: "UNKNOWN"
                })
            }

            const alertsResponse = await fetch(
                "http://localhost:8081/alerts"
            )

            if (alertsResponse.ok) {

                const alertsData = await alertsResponse.json()

                setAlerts(alertsData)

                if (alertsData.length > 0) {

                    const newestAlert = alertsData[0]

                    if (
                        lastNotifiedAlertId.current === null
                    ) {

                        lastNotifiedAlertId.current = newestAlert.id

                    } else if (
                        newestAlert.id > lastNotifiedAlertId.current
                    ) {

                        setNotification({
                            resource: newestAlert.resource,
                            usage: newestAlert.usage,
                            severity: newestAlert.severity,
                            message: newestAlert.message,
                            time: newestAlert.time
                        })

                        lastNotifiedAlertId.current = newestAlert.id
                    }
                }
            }

            const statisticsResponse = await fetch(
                "http://localhost:8081/alert-statistics"
            )

            if (statisticsResponse.ok) {

                const statisticsData = await statisticsResponse.json()

                setAlertStats(statisticsData)
            }

            setLastUpdated(
                new Date().toLocaleTimeString()
            )

        } catch (err) {

            console.error(err)

            setError(
                "Unable to connect to the Spring Boot backend. Make sure the backend is running on port 8081."
            )

        } finally {

            setLoading(false)
        }
    }

    useEffect(() => {

        fetchDashboardData()

        const interval = setInterval(() => {
            fetchDashboardData()
        }, 5000)

        return () => clearInterval(interval)

    }, [])

    const deleteAlert = async (id) => {

        try {

            const response = await fetch(
                `http://localhost:8081/alerts/${id}`,
                {
                    method: "DELETE"
                }
            )

            if (response.ok) {

                setAlerts(prevAlerts =>
                    prevAlerts.filter(alert => alert.id !== id)
                )

                fetchDashboardData()
            }

        } catch (err) {

            console.error(err)
        }
    }

    const clearAllAlerts = async () => {

        try {

            const response = await fetch(
                "http://localhost:8081/alerts/clear",
                {
                    method: "DELETE"
                }
            )

            if (response.ok) {

                setAlerts([])

                setAlertStats({
                    totalAlerts: 0,
                    cpuAlerts: 0,
                    ramAlerts: 0,
                    diskAlerts: 0,
                    gpuAlerts: 0,
                    highSeverityAlerts: 0
                })

                setNotification(null)

                lastNotifiedAlertId.current = null
            }

        } catch (err) {

            console.error(err)
        }
    }

    const closeNotification = () => {
        setNotification(null)
    }

    const healthScore = calculateHealthScore(monitoring)

    const healthStatus = getHealthStatus(healthScore)

    const healthExplanation = getHealthExplanation(
        monitoring,
        healthScore
    )

    const cpuStats = calculateResourceStatistics("cpu")
    const ramStats = calculateResourceStatistics("ram")
    const diskStats = calculateResourceStatistics("disk")
    const gpuStats = calculateResourceStatistics("gpu")

    const cpuTrend = detectResourceTrend("cpu")
    const ramTrend = detectResourceTrend("ram")
    const diskTrend = detectResourceTrend("disk")
    const gpuTrend = detectResourceTrend("gpu")

    const getInfrastructureInsight = () => {

        if (!monitoring) {
            return {
                title: "Waiting for infrastructure data",
                situation: "Monitoring data is not available yet.",
                trend: "Waiting for trend information.",
                action: "Continue monitoring the infrastructure.",
                type: "normal"
            }
        }

        if (monitoring.cpu > 75) {
            return {
                title: "CPU requires attention",
                situation: `CPU usage is currently ${monitoring.cpu}%.`,
                trend: cpuTrend.explanation,
                action: aiAnalysis
                    ? aiAnalysis.recommendation
                    : "Reduce workload or scale CPU resources.",
                type: "critical"
            }
        }

        if (monitoring.ram > 70) {
            return {
                title: "RAM requires attention",
                situation: `RAM usage is currently ${monitoring.ram}%.`,
                trend: ramTrend.explanation,
                action: aiAnalysis
                    ? aiAnalysis.recommendation
                    : "Increase memory or reduce running processes.",
                type: "warning"
            }
        }

        if (monitoring.disk > 80) {
            return {
                title: "Disk requires attention",
                situation: `Disk usage is currently ${monitoring.disk}%.`,
                trend: diskTrend.explanation,
                action: aiAnalysis
                    ? aiAnalysis.recommendation
                    : "Clean unnecessary data or increase storage.",
                type: "warning"
            }
        }

        if (monitoring.gpu > 75) {
            return {
                title: "GPU requires attention",
                situation: `GPU usage is currently ${monitoring.gpu}%.`,
                trend: gpuTrend.explanation,
                action: aiAnalysis
                    ? aiAnalysis.recommendation
                    : "Optimize AI workloads or add GPU resources.",
                type: "critical"
            }
        }

        return {
            title: "Infrastructure is operating normally",
            situation: "All monitored resources are currently within acceptable limits.",
            trend: "Resource usage is stable.",
            action: aiAnalysis
                ? aiAnalysis.recommendation
                : "Continue monitoring the infrastructure.",
            type: "normal"
        }
    }

    const infrastructureInsight = getInfrastructureInsight()

    const chartData = {

        labels: history.map(item => item.time),

        datasets: [

            {
                label: "CPU",
                data: history.map(item => item.cpu),
                tension: 0.3
            },

            {
                label: "RAM",
                data: history.map(item => item.ram),
                tension: 0.3
            },

            {
                label: "Disk",
                data: history.map(item => item.disk),
                tension: 0.3
            },

            {
                label: "GPU",
                data: history.map(item => item.gpu),
                tension: 0.3
            }

        ]
    }

    const chartOptions = {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

            legend: {
                position: "top"
            },

            title: {
                display: true,
                text: "Infrastructure Resource Usage"
            }
        },

        scales: {

            y: {
                min: 0,
                max: 100,

                title: {
                    display: true,
                    text: "Usage (%)"
                }
            },

            x: {

                title: {
                    display: true,
                    text: "Time"
                }
            }
        }
    }

    const alertChartData = {

        labels: [
            "CPU",
            "RAM",
            "Disk",
            "GPU"
        ],

        datasets: [
            {
                label: "Number of Alerts",

                data: [
                    alertStats.cpuAlerts,
                    alertStats.ramAlerts,
                    alertStats.diskAlerts,
                    alertStats.gpuAlerts
                ],

                borderWidth: 1
            }
        ]
    }

    const alertChartOptions = {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

            legend: {
                display: false
            },

            title: {
                display: true,
                text: "Alerts by Resource"
            }
        },

        scales: {

            y: {

                beginAtZero: true,

                ticks: {
                    precision: 0
                },

                title: {
                    display: true,
                    text: "Number of Alerts"
                }
            },

            x: {

                title: {
                    display: true,
                    text: "Resource"
                }
            }
        }
    }

    if (loading) {

        return (
            <div className="dashboard">

                <div className="dashboard-loading">

                    <h2>
                        Loading Infrastructure Dashboard...
                    </h2>

                    <p>
                        Connecting to Spring Boot server...
                    </p>

                </div>

            </div>
        )
    }

    return (

        <div className="dashboard">

            {notification && (

                <div className="alert-notification">

                    <div className="notification-icon">
                        🔔
                    </div>

                    <div className="notification-content">

                        <h3>
                            New Infrastructure Alert
                        </h3>

                        <p>
                            {notification.message}
                        </p>

                        <div className="notification-details">

                            <span>
                                Resource: <strong>{notification.resource}</strong>
                            </span>

                            <span>
                                Usage: <strong>{notification.usage}%</strong>
                            </span>

                            <span>
                                Severity: <strong>{notification.severity}</strong>
                            </span>

                            <span>
                                Time: <strong>{notification.time}</strong>
                            </span>

                        </div>

                    </div>

                    <button
                        className="notification-close"
                        onClick={closeNotification}
                    >
                        ×
                    </button>

                </div>
            )}

            <div className="dashboard-header">

                <h1>
                    AI Infrastructure Learning Platform
                </h1>

                <p>
                    Monitor infrastructure, understand AI analysis,
                    and explore modern infrastructure technologies.
                </p>

            </div>

            {error && (

                <div className="dashboard-error">
                    {error}
                </div>
            )}

            {monitoring && (

                <>

                    <div className="dashboard-status">

                        <div>

                            <h2>
                                Server Status
                            </h2>

                            <span className="status-running">
                                ● {monitoring.status}
                            </span>

                        </div>

                        <button
                            className="refresh-button"
                            onClick={fetchDashboardData}
                        >
                            Refresh Monitoring
                        </button>

                    </div>

                    <div className="dashboard-metrics">

                        <div className="metric-card">

                            <div className="metric-icon">
                                🖥️
                            </div>

                            <h3>
                                CPU Usage
                            </h3>

                            <div className="metric-value">
                                {monitoring.cpu}%
                            </div>

                            <div className="metric-bar">

                                <div
                                    className="metric-fill"
                                    style={{
                                        width: `${monitoring.cpu}%`
                                    }}
                                ></div>

                            </div>

                        </div>

                        <div className="metric-card">

                            <div className="metric-icon">
                                🧠
                            </div>

                            <h3>
                                RAM Usage
                            </h3>

                            <div className="metric-value">
                                {monitoring.ram}%
                            </div>

                            <div className="metric-bar">

                                <div
                                    className="metric-fill"
                                    style={{
                                        width: `${monitoring.ram}%`
                                    }}
                                ></div>

                            </div>

                        </div>

                        <div className="metric-card">

                            <div className="metric-icon">
                                💾
                            </div>

                            <h3>
                                Disk Usage
                            </h3>

                            <div className="metric-value">
                                {monitoring.disk}%
                            </div>

                            <div className="metric-bar">

                                <div
                                    className="metric-fill"
                                    style={{
                                        width: `${monitoring.disk}%`
                                    }}
                                ></div>

                            </div>

                        </div>

                        <div className="metric-card">

                            <div className="metric-icon">
                                🎮
                            </div>

                            <h3>
                                GPU Usage
                            </h3>

                            <div className="metric-value">
                                {monitoring.gpu}%
                            </div>

                            <div className="metric-bar">

                                <div
                                    className="metric-fill"
                                    style={{
                                        width: `${monitoring.gpu}%`
                                    }}
                                ></div>

                            </div>

                        </div>

                    </div>

                    <div className="health-score-card">

                        <div className="health-score-header">

                            <div>

                                <h2>
                                    🏥 Infrastructure Health
                                </h2>

                                <p>
                                    Overall health based on CPU, RAM, Disk and GPU usage.
                                </p>

                            </div>

                            <div className={`health-status ${healthStatus.className}`}>
                                {healthStatus.icon} {healthStatus.text}
                            </div>

                        </div>

                        <div className="health-score-content">

                            <div className="health-score-circle">

                                <div className="health-score-number">
                                    {healthScore}
                                </div>

                                <div className="health-score-total">
                                    / 100
                                </div>

                            </div>

                            <div className="health-score-details">

                                <h3>
                                    Infrastructure Health Score
                                </h3>

                                <div className="health-progress">

                                    <div
                                        className={`health-progress-fill ${healthStatus.className}`}
                                        style={{
                                            width: `${healthScore}%`
                                        }}
                                    ></div>

                                </div>

                                <p>
                                    {healthExplanation}
                                </p>

                            </div>

                        </div>

                    </div>

                    <div className="dashboard-alert">

                        <h2>
                            ⚠️ Infrastructure Alert
                        </h2>

                        <p>
                            {monitoring.alert}
                        </p>

                    </div>

                    <div className="monitoring-history">

                        <h2>
                            📊 Infrastructure Monitoring
                        </h2>

                        <p>
                            Live CPU, RAM, Disk and GPU usage.
                        </p>

                        <div className="chart-container">

                            {history.length > 0 ? (

                                <Line
                                    data={chartData}
                                    options={chartOptions}
                                />

                            ) : (

                                <p>
                                    Collecting monitoring data...
                                </p>

                            )}

                        </div>

                        <div className="history-table">

                            <div className="history-row history-header">

                                <span>Time</span>
                                <span>CPU</span>
                                <span>RAM</span>
                                <span>Disk</span>
                                <span>GPU</span>

                            </div>

                            {history.map((item, index) => (

                                <div
                                    className="history-row"
                                    key={index}
                                >

                                    <span>
                                        {item.time}
                                    </span>

                                    <span>
                                        {item.cpu}%
                                    </span>

                                    <span>
                                        {item.ram}%
                                    </span>

                                    <span>
                                        {item.disk}%
                                    </span>

                                    <span>
                                        {item.gpu}%
                                    </span>

                                </div>

                            ))}

                        </div>

                    </div>

                    <div className="resource-trend-analysis">

                        <h2>
                            📈 Resource Trend Analysis
                        </h2>

                        <p>
                            Analysis of the last 10 infrastructure monitoring samples.
                        </p>

                        <div className="resource-analysis-grid">

                            <div className="resource-analysis-card">

                                <div className="resource-analysis-icon">
                                    🖥️
                                </div>

                                <h3>
                                    CPU
                                </h3>

                                <div className="resource-stat-row">
                                    <span>Current</span>
                                    <strong>{cpuStats.current}%</strong>
                                </div>

                                <div className="resource-stat-row">
                                    <span>Average</span>
                                    <strong>{cpuStats.average}%</strong>
                                </div>

                                <div className="resource-stat-row">
                                    <span>Highest</span>
                                    <strong>{cpuStats.highest}%</strong>
                                </div>

                                <div className="resource-stat-row">
                                    <span>Lowest</span>
                                    <strong>{cpuStats.lowest}%</strong>
                                </div>

                                <div className={`resource-trend ${cpuTrend.className}`}>

                                    <span>
                                        {cpuTrend.icon} {cpuTrend.trend}
                                    </span>

                                    <p>
                                        {cpuTrend.explanation}
                                    </p>

                                </div>

                            </div>

                            <div className="resource-analysis-card">

                                <div className="resource-analysis-icon">
                                    🧠
                                </div>

                                <h3>
                                    RAM
                                </h3>

                                <div className="resource-stat-row">
                                    <span>Current</span>
                                    <strong>{ramStats.current}%</strong>
                                </div>

                                <div className="resource-stat-row">
                                    <span>Average</span>
                                    <strong>{ramStats.average}%</strong>
                                </div>

                                <div className="resource-stat-row">
                                    <span>Highest</span>
                                    <strong>{ramStats.highest}%</strong>
                                </div>

                                <div className="resource-stat-row">
                                    <span>Lowest</span>
                                    <strong>{ramStats.lowest}%</strong>
                                </div>

                                <div className={`resource-trend ${ramTrend.className}`}>

                                    <span>
                                        {ramTrend.icon} {ramTrend.trend}
                                    </span>

                                    <p>
                                        {ramTrend.explanation}
                                    </p>

                                </div>

                            </div>

                            <div className="resource-analysis-card">

                                <div className="resource-analysis-icon">
                                    💾
                                </div>

                                <h3>
                                    Disk
                                </h3>

                                <div className="resource-stat-row">
                                    <span>Current</span>
                                    <strong>{diskStats.current}%</strong>
                                </div>

                                <div className="resource-stat-row">
                                    <span>Average</span>
                                    <strong>{diskStats.average}%</strong>
                                </div>

                                <div className="resource-stat-row">
                                    <span>Highest</span>
                                    <strong>{diskStats.highest}%</strong>
                                </div>

                                <div className="resource-stat-row">
                                    <span>Lowest</span>
                                    <strong>{diskStats.lowest}%</strong>
                                </div>

                                <div className={`resource-trend ${diskTrend.className}`}>

                                    <span>
                                        {diskTrend.icon} {diskTrend.trend}
                                    </span>

                                    <p>
                                        {diskTrend.explanation}
                                    </p>

                                </div>

                            </div>

                            <div className="resource-analysis-card">

                                <div className="resource-analysis-icon">
                                    🎮
                                </div>

                                <h3>
                                    GPU
                                </h3>

                                <div className="resource-stat-row">
                                    <span>Current</span>
                                    <strong>{gpuStats.current}%</strong>
                                </div>

                                <div className="resource-stat-row">
                                    <span>Average</span>
                                    <strong>{gpuStats.average}%</strong>
                                </div>

                                <div className="resource-stat-row">
                                    <span>Highest</span>
                                    <strong>{gpuStats.highest}%</strong>
                                </div>

                                <div className="resource-stat-row">
                                    <span>Lowest</span>
                                    <strong>{gpuStats.lowest}%</strong>
                                </div>

                                <div className={`resource-trend ${gpuTrend.className}`}>

                                    <span>
                                        {gpuTrend.icon} {gpuTrend.trend}
                                    </span>

                                    <p>
                                        {gpuTrend.explanation}
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                    <div className={`infrastructure-intelligence ${infrastructureInsight.type}`}>

                        <div className="intelligence-header">

                            <div>

                                <h2>
                                    🧠 Infrastructure Intelligence
                                </h2>

                                <p>
                                    Combined analysis of infrastructure health,
                                    resource trends and AI recommendations.
                                </p>

                            </div>

                            <div className="intelligence-status">
                                {healthStatus.icon} {healthStatus.text}
                            </div>

                        </div>

                        <div className="intelligence-title">

                            <h3>
                                {infrastructureInsight.title}
                            </h3>

                        </div>

                        <div className="intelligence-grid">

                            <div className="intelligence-card">

                                <div className="intelligence-icon">
                                    🔍
                                </div>

                                <h3>
                                    Current Situation
                                </h3>

                                <p>
                                    {infrastructureInsight.situation}
                                </p>

                            </div>

                            <div className="intelligence-card">

                                <div className="intelligence-icon">
                                    📈
                                </div>

                                <h3>
                                    Trend Insight
                                </h3>

                                <p>
                                    {infrastructureInsight.trend}
                                </p>

                            </div>

                            <div className="intelligence-card">

                                <div className="intelligence-icon">
                                    🤖
                                </div>

                                <h3>
                                    AI Recommendation
                                </h3>

                                <p>
                                    {infrastructureInsight.action}
                                </p>

                            </div>

                        </div>

                        <div className="human-decision">

                            <strong>
                                👤 Human Decision
                            </strong>

                            <p>
                                AI provides recommendations. The final infrastructure
                                decision should be made by the user after reviewing
                                the monitoring data.
                            </p>

                        </div>

                    </div>

                    <div className="alert-history">

                        <div className="alert-history-header">

                            <div>

                                <h2>
                                    🚨 Alert History
                                </h2>

                                <p>
                                    Alerts saved permanently in PostgreSQL.
                                </p>

                            </div>

                            {alerts.length > 0 && (

                                <button
                                    className="clear-alerts-button"
                                    onClick={clearAllAlerts}
                                >
                                    Clear All Alerts
                                </button>

                            )}

                        </div>

                        <div className="alert-statistics-grid">

                            <div className="alert-stat-card">

                                <div className="alert-stat-icon">
                                    📊
                                </div>

                                <div>

                                    <p>
                                        Total Alerts
                                    </p>

                                    <h3>
                                        {alertStats.totalAlerts}
                                    </h3>

                                </div>

                            </div>

                            <div className="alert-stat-card">

                                <div className="alert-stat-icon">
                                    🖥️
                                </div>

                                <div>

                                    <p>
                                        CPU Alerts
                                    </p>

                                    <h3>
                                        {alertStats.cpuAlerts}
                                    </h3>

                                </div>

                            </div>

                            <div className="alert-stat-card">

                                <div className="alert-stat-icon">
                                    🧠
                                </div>

                                <div>

                                    <p>
                                        RAM Alerts
                                    </p>

                                    <h3>
                                        {alertStats.ramAlerts}
                                    </h3>

                                </div>

                            </div>

                            <div className="alert-stat-card">

                                <div className="alert-stat-icon">
                                    💾
                                </div>

                                <div>

                                    <p>
                                        Disk Alerts
                                    </p>

                                    <h3>
                                        {alertStats.diskAlerts}
                                    </h3>

                                </div>

                            </div>

                            <div className="alert-stat-card">

                                <div className="alert-stat-icon">
                                    🎮
                                </div>

                                <div>

                                    <p>
                                        GPU Alerts
                                    </p>

                                    <h3>
                                        {alertStats.gpuAlerts}
                                    </h3>

                                </div>

                            </div>

                            <div className="alert-stat-card">

                                <div className="alert-stat-icon">
                                    🚨
                                </div>

                                <div>

                                    <p>
                                        High Severity
                                    </p>

                                    <h3>
                                        {alertStats.highSeverityAlerts}
                                    </h3>

                                </div>

                            </div>

                        </div>

                        <div className="alert-statistics-chart">

                            <h2>
                                📈 Alert Statistics
                            </h2>

                            <p>
                                Visual comparison of infrastructure alerts.
                            </p>

                            <div className="alert-chart-container">

                                <Bar
                                    data={alertChartData}
                                    options={alertChartOptions}
                                />

                            </div>

                        </div>

                        {alerts.length === 0 ? (

                            <div className="no-alerts">

                                <div className="no-alerts-icon">
                                    ✅
                                </div>

                                <h3>
                                    No Alerts
                                </h3>

                                <p>
                                    Infrastructure is operating normally.
                                </p>

                            </div>

                        ) : (

                            <div className="alert-table">

                                <div className="alert-row alert-table-header">

                                    <span>
                                        Time
                                    </span>

                                    <span>
                                        Resource
                                    </span>

                                    <span>
                                        Usage
                                    </span>

                                    <span>
                                        Severity
                                    </span>

                                    <span>
                                        Message
                                    </span>

                                    <span>
                                        Action
                                    </span>

                                </div>

                                {alerts.slice(0, 20).map(alert => (

                                    <div
                                        className="alert-row"
                                        key={alert.id}
                                    >

                                        <span>
                                            {alert.time}
                                        </span>

                                        <span className="resource-name">
                                            {alert.resource}
                                        </span>

                                        <span className="alert-usage">
                                            {alert.usage}%
                                        </span>

                                        <span>
                                            <span className="severity-high">
                                                {alert.severity}
                                            </span>
                                        </span>

                                        <span>
                                            {alert.message}
                                        </span>

                                        <span>

                                            <button
                                                className="delete-alert-button"
                                                onClick={() =>
                                                    deleteAlert(alert.id)
                                                }
                                            >
                                                Delete
                                            </button>

                                        </span>

                                    </div>

                                ))}

                            </div>

                        )}

                    </div>

                    {aiAnalysis && (

                        <div className="ai-dashboard-card">

                            <h2>
                                🤖 AI Infrastructure Analysis
                            </h2>

                            <div className="ai-analysis">

                                <h3>
                                    Analysis
                                </h3>

                                <p>
                                    {aiAnalysis.analysis}
                                </p>

                            </div>

                            <div className="ai-recommendation">

                                <h3>
                                    Recommendation
                                </h3>

                                <p>
                                    {aiAnalysis.recommendation}
                                </p>

                            </div>

                            <div className="ai-severity">

                                <h3>
                                    Severity
                                </h3>

                                <span
                                    className={
                                        aiAnalysis.severity === "HIGH"
                                            ? "severity-high"
                                            : "severity-normal"
                                    }
                                >
                                    {aiAnalysis.severity}
                                </span>

                            </div>

                        </div>

                    )}

                    <div className="learning-progress">

                        <h2>
                            📚 Learning Progress
                        </h2>

                        <p>
                            Explore the complete infrastructure evolution.
                        </p>

                        <div className="progress-grid">

                            <div className="progress-card">
                                <span>🖥️</span>
                                <h3>Physical Servers</h3>
                                <p>Completed</p>
                            </div>

                            <div className="progress-card">
                                <span>💻</span>
                                <h3>Virtual Machines</h3>
                                <p>Completed</p>
                            </div>

                            <div className="progress-card">
                                <span>☁️</span>
                                <h3>Cloud Computing</h3>
                                <p>Completed</p>
                            </div>

                            <div className="progress-card">
                                <span>📦</span>
                                <h3>Containers</h3>
                                <p>Completed</p>
                            </div>

                            <div className="progress-card">
                                <span>⚙️</span>
                                <h3>Kubernetes</h3>
                                <p>Completed</p>
                            </div>

                            <div className="progress-card">
                                <span>🤖</span>
                                <h3>AI & GPU Infrastructure</h3>
                                <p>Completed</p>
                            </div>

                        </div>

                    </div>

                    <div className="dashboard-navigation">

                        <h2>
                            🚀 Explore Platform
                        </h2>

                        <div className="navigation-grid">

                            <Link
                                to="/infrastructure"
                                className="navigation-card"
                            >

                                <span>🖥️</span>

                                <h3>
                                    Infrastructure Monitoring
                                </h3>

                                <p>
                                    Monitor resources and run infrastructure simulations.
                                </p>

                            </Link>

                            <Link
                                to="/timeline"
                                className="navigation-card"
                            >

                                <span>🕒</span>

                                <h3>
                                    Technology Timeline
                                </h3>

                                <p>
                                    Understand the evolution of infrastructure technologies.
                                </p>

                            </Link>

                            <Link
                                to="/learning"
                                className="navigation-card"
                            >

                                <span>📚</span>

                                <h3>
                                    Learning Modules
                                </h3>

                                <p>
                                    Learn and experiment with infrastructure concepts.
                                </p>

                            </Link>

                        </div>

                    </div>

                    <div className="dashboard-objective">

                        <h2>
                            🎯 Platform Objective
                        </h2>

                        <p>
                            Learn → Understand → Experiment → Use AI Assistance
                            → Make Human Decisions → Understand the Next Technology
                        </p>

                    </div>

                    <div className="dashboard-updated">
                        Last updated: {lastUpdated}
                    </div>

                </>
            )}

        </div>
    )
}

export default Dashboard