import { useEffect, useState } from "react"
import { Line } from "react-chartjs-2"
import API_URL from "../api"

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from "chart.js"

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
)

function Infrastructure() {

    const [cpu, setCpu] = useState(0)
    const [ram, setRam] = useState(0)
    const [disk, setDisk] = useState(0)
    const [gpu, setGpu] = useState(0)

    const [status, setStatus] = useState("CHECKING")
    const [alert, setAlert] = useState("")

    const [history, setHistory] = useState([])

    const [aiAnalysis, setAiAnalysis] = useState("")
    const [recommendation, setRecommendation] = useState("")
    const [severity, setSeverity] = useState("")

    const [learningTitle, setLearningTitle] = useState("")
    const [learningExplanation, setLearningExplanation] = useState("")
    const [learningSolution, setLearningSolution] = useState("")

    const [mode, setMode] = useState("LIVE")

    const [alerts, setAlerts] = useState([])

    const [alertStats, setAlertStats] = useState({
        totalAlerts: 0,
        cpuAlerts: 0,
        ramAlerts: 0,
        diskAlerts: 0,
        gpuAlerts: 0,
        highSeverityAlerts: 0
    })

    const getMonitoringData = async () => {

        try {

            const response = await fetch(
                `${API_URL}/monitoring`
            )

            const data = await response.json()

            setCpu(data.cpu)
            setRam(data.ram)
            setDisk(data.disk)
            setGpu(data.gpu)

            setStatus(data.status)
            setAlert(data.alert)

            setHistory((oldHistory) => {

                const newData = [
                    ...oldHistory,
                    {
                        cpu: data.cpu,
                        ram: data.ram,
                        disk: data.disk,
                        gpu: data.gpu
                    }
                ]

                return newData.slice(-10)
            })

            getAIAnalysis(
                data.cpu,
                data.ram,
                data.disk,
                data.gpu
            )

        } catch (error) {

            console.log("Monitoring Error:", error)

            setStatus("OFFLINE")
            setAlert("Unable to connect to backend")

        }
    }

    const getAlerts = async () => {

        try {

            const response = await fetch(
                `${API_URL}/alerts`
            )

            const data = await response.json()

            setAlerts(data)

        } catch (error) {

            console.log("Alert Error:", error)

        }
    }

    const getAlertStatistics = async () => {

        try {

            const response = await fetch(
                `${API_URL}/alert-statistics`
            )

            const data = await response.json()

            setAlertStats(data)

        } catch (error) {

            console.log("Alert Statistics Error:", error)

        }
    }

    const deleteAlert = async (id) => {

        try {

            const response = await fetch(
                `${API_URL}/alerts/${id}`,
                {
                    method: "DELETE"
                }
            )

            if (response.ok) {

                getAlerts()
                getAlertStatistics()

            }

        } catch (error) {

            console.log("Delete Alert Error:", error)

        }
    }

    const clearAllAlerts = async () => {

        try {

            const response = await fetch(
                `${API_URL}/alerts/clear`,
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

                getAlerts()
                getAlertStatistics()

            }

        } catch (error) {

            console.log("Clear Alerts Error:", error)

        }
    }

    const getAIAnalysis = async (
        cpuValue,
        ramValue,
        diskValue,
        gpuValue
    ) => {

        try {

            const response = await fetch(
                `${API_URL}/ai/analyze?cpu=${cpuValue}&ram=${ramValue}&disk=${diskValue}&gpu=${gpuValue}`
            )

            const data = await response.json()

            setAiAnalysis(data.analysis)
            setRecommendation(data.recommendation)
            setSeverity(data.severity)

            if (ramValue > 70) {

                setLearningTitle("RAM Management")

                setLearningExplanation(
                    "High RAM usage means many programs or processes are using system memory."
                )

                setLearningSolution(
                    "Close unnecessary applications or increase available memory."
                )

            } else if (cpuValue > 75) {

                setLearningTitle("CPU Management")

                setLearningExplanation(
                    "High CPU usage means the processor is handling a heavy workload."
                )

                setLearningSolution(
                    "Reduce the workload or increase CPU resources."
                )

            } else if (diskValue > 80) {

                setLearningTitle("Disk Management")

                setLearningExplanation(
                    "High disk usage means storage capacity is becoming limited."
                )

                setLearningSolution(
                    "Remove unnecessary files or increase storage capacity."
                )

            } else if (gpuValue > 75) {

                setLearningTitle("GPU Management")

                setLearningExplanation(
                    "High GPU usage means AI or graphics workloads are heavily using the GPU."
                )

                setLearningSolution(
                    "Optimize AI workloads or add GPU resources."
                )

            } else {

                setLearningTitle("Infrastructure Health")

                setLearningExplanation(
                    "The infrastructure is operating within normal limits."
                )

                setLearningSolution(
                    "Continue monitoring CPU, RAM, disk and GPU usage."
                )

            }

        } catch (error) {

            console.log("AI Error:", error)

        }
    }

    const runSimulation = async (type) => {

        try {

            const response = await fetch(
                `${API_URL}/simulation?type=${type}`
            )

            const data = await response.json()

            setCpu(data.cpu)
            setRam(data.ram)
            setDisk(data.disk)
            setGpu(data.gpu)

            setStatus("SIMULATION")

            setAlert(
                `${type.toUpperCase()} simulation running`
            )

            getAIAnalysis(
                data.cpu,
                data.ram,
                data.disk,
                data.gpu
            )

        } catch (error) {

            console.log("Simulation Error:", error)

        }
    }

    useEffect(() => {

        getMonitoringData()
        getAlerts()
        getAlertStatistics()

        const interval = setInterval(() => {

            if (mode === "LIVE") {

                getMonitoringData()
                getAlerts()
                getAlertStatistics()

            }

        }, 5000)

        return () => clearInterval(interval)

    }, [mode])

    const healthScore = Math.max(
        0,
        Math.round(
            100 -
            (
                cpu * 0.25 +
                ram * 0.25 +
                disk * 0.25 +
                gpu * 0.25
            )
        )
    )

    const chartData = {

        labels: history.map(
            (_, index) => `T${index + 1}`
        ),

        datasets: [

            {
                label: "CPU",
                data: history.map(
                    item => item.cpu
                ),
                tension: 0.3
            },

            {
                label: "RAM",
                data: history.map(
                    item => item.ram
                ),
                tension: 0.3
            },

            {
                label: "Disk",
                data: history.map(
                    item => item.disk
                ),
                tension: 0.3
            },

            {
                label: "GPU",
                data: history.map(
                    item => item.gpu
                ),
                tension: 0.3
            }

        ]

    }

    const chartOptions = {

        responsive: true,

        plugins: {

            legend: {
                position: "top"
            },

            title: {
                display: true,
                text: "Infrastructure Usage Analytics"
            }

        },

        scales: {

            y: {
                min: 0,
                max: 100
            }

        }

    }

    return (

        <div className="infrastructure-page">

            <h1>AI Infrastructure Monitoring</h1>

            <div className="mode-buttons">

                <button
                    onClick={() => setMode("LIVE")}
                >
                    Live Monitoring
                </button>

                <button
                    onClick={() => setMode("SIMULATION")}
                >
                    Simulation Mode
                </button>

            </div>

            <h2>Infrastructure Status</h2>

            <div className="monitoring-cards">

                <div className="monitor-card">
                    <h3>CPU</h3>
                    <p>{cpu}%</p>
                </div>

                <div className="monitor-card">
                    <h3>RAM</h3>
                    <p>{ram}%</p>
                </div>

                <div className="monitor-card">
                    <h3>Disk</h3>
                    <p>{disk}%</p>
                </div>

                <div className="monitor-card">
                    <h3>GPU</h3>
                    <p>{gpu}%</p>
                </div>

            </div>

            <div className="status-section">

                <h3>Status: {status}</h3>

                <p>{alert}</p>

                <h3>
                    Infrastructure Health: {healthScore}/100
                </h3>

            </div>

            <h2>Simulation Lab</h2>

            <div className="simulation-buttons">

                <button
                    onClick={() => runSimulation("normal")}
                >
                    Normal
                </button>

                <button
                    onClick={() => runSimulation("cpu")}
                >
                    CPU Stress
                </button>

                <button
                    onClick={() => runSimulation("ram")}
                >
                    RAM Stress
                </button>

                <button
                    onClick={() => runSimulation("disk")}
                >
                    Disk Stress
                </button>

                <button
                    onClick={() => runSimulation("gpu")}
                >
                    GPU Stress
                </button>

            </div>

            <h2>Analytics</h2>

            <div className="chart-container">

                <Line
                    data={chartData}
                    options={chartOptions}
                />

            </div>

            <h2>AI Analysis</h2>

            <div className="ai-section">

                <h3>Analysis</h3>

                <p>
                    {aiAnalysis}
                </p>

                <h3>Recommendation</h3>

                <p>
                    {recommendation}
                </p>

                <h3>Severity</h3>

                <p>
                    {severity}
                </p>

            </div>

            <h2>Learning Explanation</h2>

            <div className="learning-section">

                <h3>
                    {learningTitle}
                </h3>

                <p>
                    {learningExplanation}
                </p>

                <p>
                    {learningSolution}
                </p>

            </div>

            <h2>Alert Management</h2>

            <div className="alert-management">

                <div className="alert-statistics">

                    <div className="alert-stat-card">
                        <h3>Total Alerts</h3>
                        <p>{alertStats.totalAlerts}</p>
                    </div>

                    <div className="alert-stat-card">
                        <h3>CPU Alerts</h3>
                        <p>{alertStats.cpuAlerts}</p>
                    </div>

                    <div className="alert-stat-card">
                        <h3>RAM Alerts</h3>
                        <p>{alertStats.ramAlerts}</p>
                    </div>

                    <div className="alert-stat-card">
                        <h3>Disk Alerts</h3>
                        <p>{alertStats.diskAlerts}</p>
                    </div>

                    <div className="alert-stat-card">
                        <h3>GPU Alerts</h3>
                        <p>{alertStats.gpuAlerts}</p>
                    </div>

                    <div className="alert-stat-card">
                        <h3>High Severity</h3>
                        <p>{alertStats.highSeverityAlerts}</p>
                    </div>

                </div>

                <div className="alert-actions">

                    <button
                        onClick={() => {
                            getAlerts()
                            getAlertStatistics()
                        }}
                    >
                        Refresh Alerts
                    </button>

                    <button
                        onClick={clearAllAlerts}
                    >
                        Clear All Alerts
                    </button>

                </div>

                <div className="alert-history">

                    <h3>Alert History</h3>

                    {alerts.length === 0 ? (

                        <p className="success">
                            ✓ No alerts available.
                        </p>

                    ) : (

                        <table>

                            <thead>

                                <tr>
                                    <th>ID</th>
                                    <th>Resource</th>
                                    <th>Usage</th>
                                    <th>Severity</th>
                                    <th>Message</th>
                                    <th>Time</th>
                                    <th>Action</th>
                                </tr>

                            </thead>

                            <tbody>

                                {alerts.map((item) => (

                                    <tr key={item.id}>

                                        <td>
                                            {item.id}
                                        </td>

                                        <td>
                                            {item.resource}
                                        </td>

                                        <td>
                                            {item.usage}%
                                        </td>

                                        <td>
                                            {item.severity}
                                        </td>

                                        <td>
                                            {item.message}
                                        </td>

                                        <td>
                                            {item.time}
                                        </td>

                                        <td>

                                            <button
                                                onClick={() =>
                                                    deleteAlert(item.id)
                                                }
                                            >
                                                Delete
                                            </button>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    )}

                </div>

            </div>

        </div>

    )
}

export default Infrastructure