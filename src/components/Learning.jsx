import { useEffect, useState } from "react"
import "./Learning.css"
import API_URL from "../api"

const TOTAL_MODULES = 6
const USER_ID = Number(localStorage.getItem("userId"))

function Learning() {
    const [modules, setModules] = useState([])
    const [selectedModule, setSelectedModule] = useState(null)

    const [cpuUsage, setCpuUsage] = useState(40)
    const [ramUsage, setRamUsage] = useState(50)

    const [vmCount, setVmCount] = useState(2)
    const [vmCpu, setVmCpu] = useState(20)
    const [vmRam, setVmRam] = useState(20)

    const [cloudInstances, setCloudInstances] = useState(2)
    const [cloudCpu, setCloudCpu] = useState(20)
    const [cloudRam, setCloudRam] = useState(20)

    const [containerCount, setContainerCount] = useState(2)
    const [containerWorkload, setContainerWorkload] = useState(40)

    const [podCount, setPodCount] = useState(2)
    const [podWorkload, setPodWorkload] = useState(30)
    const [replicaCount, setReplicaCount] = useState(2)

    const [aiWorkload, setAiWorkload] = useState(40)
    const [gpuUsage, setGpuUsage] = useState(50)
    const [gpuMemory, setGpuMemory] = useState(40)
    const [inferenceRequests, setInferenceRequests] = useState(30)

    const [selectedTopic, setSelectedTopic] = useState(null)

    const [completedModules, setCompletedModules] = useState([])

    useEffect(() => {
        fetch(`${API_URL}/learning`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to load learning modules")
                }

                return response.json()
            })
            .then(data => {
                setModules(data)
            })
            .catch(error => {
                console.error("Error loading learning modules:", error)
            })
    }, [])

    useEffect(() => {

        if (!USER_ID) {
            console.error("User ID not found. Please login again.")
            return
        }

        fetch(`${API_URL}/learning-progress/${USER_ID}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to load learning progress")
                }

                return response.json()
            })
            .then(data => {

                const completedIds = data
                    .filter(progress => progress.completed)
                    .map(progress => progress.moduleId)

                setCompletedModules(completedIds)
            })
            .catch(error => {
                console.error(
                    "Error loading learning progress:",
                    error
                )
            })

    }, [])

    const toggleModuleCompletion = (moduleId) => {

        if (!USER_ID) {
            alert("User ID not found. Please login again.")
            return
        }

        const isCompleted = completedModules.includes(moduleId)

        if (isCompleted) {

            fetch(
                `${API_URL}/learning-progress/${USER_ID}/${moduleId}`,
                {
                    method: "DELETE"
                }
            )
                .then(response => {

                    if (!response.ok) {
                        throw new Error("Failed to delete progress")
                    }

                    setCompletedModules(previous =>
                        previous.filter(id => id !== moduleId)
                    )
                })
                .catch(error => {

                    console.error(
                        "Error removing learning progress:",
                        error
                    )

                })

        } else {

            fetch(`${API_URL}/learning-progress`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    userId: USER_ID,
                    moduleId: moduleId,
                    completed: true
                })

            })
                .then(response => {

                    if (!response.ok) {
                        throw new Error("Failed to save progress")
                    }

                    return response.json()

                })
                .then(() => {

                    setCompletedModules(previous => [
                        ...previous,
                        moduleId
                    ])

                })
                .catch(error => {

                    console.error(
                        "Error saving learning progress:",
                        error
                    )

                })
        }
    }

    const progressPercentage = Math.round(
        (completedModules.length / TOTAL_MODULES) * 100
    )

    const getServerStatus = () => {

        if (cpuUsage > 80 || ramUsage > 80) {
            return "HIGH RESOURCE USAGE"
        }

        return "RUNNING"
    }

    const getVMStatus = () => {

        const totalCpu = vmCount * vmCpu
        const totalRam = vmCount * vmRam

        if (totalCpu > 100 || totalRam > 100) {
            return "RESOURCE OVERLOAD"
        }

        if (totalCpu > 75 || totalRam > 75) {
            return "HIGH RESOURCE USAGE"
        }

        return "RESOURCE BALANCED"
    }

    const getVMExplanation = () => {

        const totalCpu = vmCount * vmCpu
        const totalRam = vmCount * vmRam

        if (totalCpu > 100 || totalRam > 100) {
            return "The virtual machines require more resources than the physical server can provide."
        }

        if (totalCpu > 75 || totalRam > 75) {
            return "The physical server is handling a high virtual machine workload."
        }

        return "The physical server has enough resources to handle the virtual machines."
    }

    const getCloudStatus = () => {

        const totalCpu = cloudInstances * cloudCpu
        const totalRam = cloudInstances * cloudRam

        if (totalCpu > 100 || totalRam > 100) {
            return "RESOURCE OVERLOAD"
        }

        if (totalCpu > 75 || totalRam > 75) {
            return "HIGH RESOURCE USAGE"
        }

        return "RESOURCE AVAILABLE"
    }

    const getCloudExplanation = () => {

        const totalCpu = cloudInstances * cloudCpu
        const totalRam = cloudInstances * cloudRam

        if (totalCpu > 100 || totalRam > 100) {
            return "The requested cloud resources are higher than the available capacity."
        }

        if (totalCpu > 75 || totalRam > 75) {
            return "Cloud resources are being heavily used. Additional resources may be required."
        }

        return "Cloud resources are available and the workload can run normally."
    }

    const getContainerStatus = () => {

        const totalWorkload = containerCount * containerWorkload

        if (totalWorkload > 100) {
            return "HIGH WORKLOAD"
        }

        if (totalWorkload > 75) {
            return "SCALING RECOMMENDED"
        }

        return "RUNNING"
    }

    const getContainerExplanation = () => {

        const totalWorkload = containerCount * containerWorkload

        if (totalWorkload > 100) {
            return "The application workload is greater than the current container capacity. More containers are required."
        }

        if (totalWorkload > 75) {
            return "The containers are handling a high workload. Adding another container can distribute the workload."
        }

        return "The containers can handle the current application workload."
    }

    const getKubernetesStatus = () => {

        const totalWorkload = podCount * podWorkload

        if (replicaCount < podCount) {
            return "INSUFFICIENT REPLICAS"
        }

        if (totalWorkload > 100) {
            return "HIGH WORKLOAD"
        }

        if (totalWorkload > 75) {
            return "SCALING RECOMMENDED"
        }

        return "CLUSTER RUNNING"
    }

    const getKubernetesExplanation = () => {

        const totalWorkload = podCount * podWorkload

        if (replicaCount < podCount) {
            return "The requested number of pods is greater than the configured replicas. Kubernetes should scale the deployment."
        }

        if (totalWorkload > 100) {
            return "The pods are receiving a very high workload. More replicas should be created to distribute the workload."
        }

        if (totalWorkload > 75) {
            return "The cluster is handling a high workload. Increasing replicas can improve workload distribution."
        }

        return "The Kubernetes cluster has enough replicas to handle the current workload."
    }

    const getServiceStatus = () => {

        if (replicaCount === 0) {
            return "SERVICE UNAVAILABLE"
        }

        if (replicaCount < podCount) {
            return "SERVICE AT RISK"
        }

        return "SERVICE AVAILABLE"
    }

    const getAIStatus = () => {

        if (gpuUsage > 85 || gpuMemory > 85) {
            return "GPU RESOURCE CRITICAL"
        }

        if (inferenceRequests > 80 && gpuUsage > 70) {
            return "HIGH AI WORKLOAD"
        }

        if (
            aiWorkload > 80 ||
            gpuUsage > 75 ||
            gpuMemory > 75
        ) {
            return "HIGH RESOURCE USAGE"
        }

        return "AI SYSTEM RUNNING"
    }

    const getAIRecommendation = () => {

        if (gpuUsage > 85) {
            return "GPU usage is very high. Consider adding another GPU or reducing the AI workload."
        }

        if (gpuMemory > 85) {
            return "GPU memory usage is very high. Optimize the model or use a GPU with more memory."
        }

        if (inferenceRequests > 80) {
            return "Inference demand is high. Consider adding GPU resources or deploying additional model replicas."
        }

        if (aiWorkload > 80) {
            return "AI model workload is high. Consider distributing the workload across additional GPU resources."
        }

        return "AI infrastructure is operating normally. Continue monitoring GPU resources."
    }

    const getAIExplanation = () => {

        if (gpuUsage > 85 || gpuMemory > 85) {
            return "The AI workload is putting significant pressure on GPU resources."
        }

        if (inferenceRequests > 80 && gpuUsage > 70) {
            return "A high number of inference requests is increasing GPU demand."
        }

        return "The GPU has enough capacity to handle the current AI workload."
    }

    const topicDescriptions = {

        "What is a physical server?":
            "A physical server is a real computer that provides CPU, RAM, storage and networking resources.",

        "CPU and RAM":
            "CPU processes instructions and performs calculations. RAM temporarily stores data and programs that are currently being used.",

        "Storage":
            "Storage keeps data permanently. Common storage technologies include HDDs and SSDs.",

        "Networking":
            "Networking allows servers to communicate with users, applications and other computers.",

        "Server maintenance":
            "Server maintenance includes monitoring hardware, updating software, checking storage and replacing faulty components."
    }

    return (

        <div className="learning-page">

            <div className="learning-header">

                <h1>Learning Modules</h1>

                <p>
                    Learn infrastructure technologies step by step
                    from physical servers to modern AI infrastructure.
                </p>

            </div>

            <div className="learning-progress">

                <div className="progress-header">

                    <h2>📊 Learning Progress</h2>

                    <strong>
                        {progressPercentage}% Complete
                    </strong>

                </div>

                <div className="progress-bar">

                    <div
                        className="progress-fill"
                        style={{
                            width: `${progressPercentage}%`
                        }}
                    ></div>

                </div>

                <p>
                    {completedModules.length} of {TOTAL_MODULES} modules completed
                </p>

            </div>

            <div className="learning-grid">

                {modules.map(module => (

                    <div
                        className="learning-card"
                        key={module.id}
                        onClick={() => {

                            setSelectedModule(module)
                            setSelectedTopic(null)

                        }}
                    >

                        <div className="learning-icon">
                            {module.icon}
                        </div>

                        <h2>{module.title}</h2>

                        <strong>{module.level}</strong>

                        <p>{module.description}</p>

                        <span>
                            {completedModules.includes(module.id)
                                ? "✅ Completed"
                                : "→"}
                        </span>

                        <button
                            className="completion-button"
                            onClick={(event) => {

                                event.stopPropagation()

                                toggleModuleCompletion(module.id)

                            }}
                        >

                            {completedModules.includes(module.id)
                                ? "Mark as Incomplete"
                                : "Mark as Completed"}

                        </button>

                    </div>

                ))}

            </div>

            {selectedModule && (

                <div className="learning-details">

                    <h1>
                        {selectedModule.icon} {selectedModule.title}
                    </h1>

                    <strong>{selectedModule.level}</strong>

                    {selectedModule.title === "Physical Servers" && (

                        <>

                            <section>

                                <h2>📖 What is it?</h2>

                                <p>{selectedModule.what}</p>

                            </section>

                            <section>

                                <h2>🌍 Real-World Example</h2>

                                <p>{selectedModule.exampleText}</p>

                            </section>

                            <section>

                                <h2>⚠️ Problem</h2>

                                <p>{selectedModule.problem}</p>

                            </section>

                            <section>

                                <h2>💡 Solution</h2>

                                <p>{selectedModule.solution}</p>

                            </section>

                            <section>

                                <h2>⚙️ How Does It Work?</h2>

                                <p>{selectedModule.working}</p>

                            </section>

                            <section>

                                <h2>📌 What You Will Learn</h2>

                                <p>Click a topic to learn more.</p>

                                <div className="topic-list">

                                    {selectedModule.topics &&
                                        selectedModule.topics
                                            .split("|")
                                            .map(topic => (

                                                <button
                                                    key={topic}
                                                    onClick={() =>
                                                        setSelectedTopic(topic)
                                                    }
                                                >
                                                    ✓ {topic} →
                                                </button>

                                            ))}

                                </div>

                                {selectedTopic &&
                                    topicDescriptions[selectedTopic] && (

                                        <div className="topic-explanation">

                                            <h3>{selectedTopic}</h3>

                                            <p>
                                                {topicDescriptions[selectedTopic]}
                                            </p>

                                        </div>

                                    )}

                            </section>

                            <section>

                                <h2>🖥️ Physical Server Simulation</h2>

                                <p>
                                    Experiment with CPU and RAM usage and
                                    observe how the server responds.
                                </p>

                                <label>
                                    CPU Usage: {cpuUsage}%
                                </label>

                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={cpuUsage}
                                    onChange={e =>
                                        setCpuUsage(Number(e.target.value))
                                    }
                                />

                                <label>
                                    RAM Usage: {ramUsage}%
                                </label>

                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={ramUsage}
                                    onChange={e =>
                                        setRamUsage(Number(e.target.value))
                                    }
                                />

                                <div className="simulation-status">

                                    <h3>Server Status</h3>

                                    <strong>
                                        {getServerStatus()}
                                    </strong>

                                    <p>
                                        {getServerStatus() === "RUNNING"
                                            ? "The server is operating normally."
                                            : "The server is experiencing high resource usage."}
                                    </p>

                                </div>

                            </section>

                            <section>

                                <h2>🎯 Key Takeaway</h2>

                                <p>{selectedModule.takeaway}</p>

                            </section>

                        </>

                    )}

                    {selectedModule.title === "Virtual Machines" && (

                        <>

                            <section>

                                <h2>📖 What is a Virtual Machine?</h2>

                                <p>
                                    A virtual machine is a software-based
                                    computer that runs on a physical server.
                                    Multiple virtual machines can share the
                                    resources of one physical server.
                                </p>

                            </section>

                            <section>

                                <h2>💻 Virtual Machine Simulation</h2>

                                <p>
                                    Experiment with multiple virtual machines
                                    and observe how they consume CPU and RAM.
                                </p>

                                <div className="vm-control">

                                    <label>
                                        Number of VMs: {vmCount}
                                    </label>

                                    <input
                                        type="range"
                                        min="1"
                                        max="5"
                                        value={vmCount}
                                        onChange={e =>
                                            setVmCount(Number(e.target.value))
                                        }
                                    />

                                </div>

                                <div className="vm-control">

                                    <label>
                                        CPU per VM: {vmCpu}%
                                    </label>

                                    <input
                                        type="range"
                                        min="10"
                                        max="50"
                                        value={vmCpu}
                                        onChange={e =>
                                            setVmCpu(Number(e.target.value))
                                        }
                                    />

                                </div>

                                <div className="vm-control">

                                    <label>
                                        RAM per VM: {vmRam}%
                                    </label>

                                    <input
                                        type="range"
                                        min="10"
                                        max="50"
                                        value={vmRam}
                                        onChange={e =>
                                            setVmRam(Number(e.target.value))
                                        }
                                    />

                                </div>

                                <div className="vm-results">

                                    <h3>Virtual Machine Resources</h3>

                                    <p>
                                        Number of VMs:
                                        <strong> {vmCount}</strong>
                                    </p>

                                    <p>
                                        Total CPU:
                                        <strong>
                                            {" "}{vmCount * vmCpu}%
                                        </strong>
                                    </p>

                                    <p>
                                        Total RAM:
                                        <strong>
                                            {" "}{vmCount * vmRam}%
                                        </strong>
                                    </p>

                                    <h3>Resource Status</h3>

                                    <strong>
                                        {getVMStatus()}
                                    </strong>

                                    <p>
                                        {getVMExplanation()}
                                    </p>

                                </div>

                            </section>

                            <section>

                                <h2>🎯 Key Takeaway</h2>

                                <p>
                                    Virtual machines allow multiple systems
                                    to share one physical server, but the
                                    available CPU and RAM must be managed
                                    carefully.
                                </p>

                            </section>

                        </>

                    )}

                    {selectedModule.title === "Cloud Computing" && (

                        <>

                            <section>

                                <h2>📖 What is Cloud Computing?</h2>

                                <p>
                                    Cloud computing provides computing
                                    resources such as CPU, RAM, storage and
                                    networking through the internet.
                                </p>

                            </section>

                            <section>

                                <h2>🌍 Real-World Example</h2>

                                <p>
                                    A college website can use cloud servers
                                    instead of purchasing and maintaining
                                    its own physical servers.
                                </p>

                            </section>

                            <section>

                                <h2>⚠️ Problem with Traditional Infrastructure</h2>

                                <p>
                                    Buying physical servers requires high
                                    upfront cost and organizations must
                                    maintain the hardware themselves.
                                </p>

                            </section>

                            <section>

                                <h2>💡 Cloud Solution</h2>

                                <p>
                                    Cloud platforms allow organizations to
                                    request computing resources when they
                                    need them and scale resources based on
                                    demand.
                                </p>

                            </section>

                            <section>

                                <h2>☁️ Cloud Resource Simulation</h2>

                                <p>
                                    Change the number of cloud instances and
                                    resources to understand how cloud
                                    infrastructure handles workloads.
                                </p>

                                <div className="vm-control">

                                    <label>
                                        Number of Instances:
                                        {" "}{cloudInstances}
                                    </label>

                                    <input
                                        type="range"
                                        min="1"
                                        max="5"
                                        value={cloudInstances}
                                        onChange={e =>
                                            setCloudInstances(
                                                Number(e.target.value)
                                            )
                                        }
                                    />

                                </div>

                                <div className="vm-control">

                                    <label>
                                        CPU per Instance:
                                        {" "}{cloudCpu}%
                                    </label>

                                    <input
                                        type="range"
                                        min="10"
                                        max="50"
                                        value={cloudCpu}
                                        onChange={e =>
                                            setCloudCpu(
                                                Number(e.target.value)
                                            )
                                        }
                                    />

                                </div>

                                <div className="vm-control">

                                    <label>
                                        RAM per Instance:
                                        {" "}{cloudRam}%
                                    </label>

                                    <input
                                        type="range"
                                        min="10"
                                        max="50"
                                        value={cloudRam}
                                        onChange={e =>
                                            setCloudRam(
                                                Number(e.target.value)
                                            )
                                        }
                                    />

                                </div>

                                <div className="vm-results">

                                    <h3>Cloud Resources</h3>

                                    <p>
                                        Instances:
                                        <strong> {cloudInstances}</strong>
                                    </p>

                                    <p>
                                        Total CPU:
                                        <strong>
                                            {" "}{cloudInstances * cloudCpu}%
                                        </strong>
                                    </p>

                                    <p>
                                        Total RAM:
                                        <strong>
                                            {" "}{cloudInstances * cloudRam}%
                                        </strong>
                                    </p>

                                    <h3>Cloud Status</h3>

                                    <strong>
                                        {getCloudStatus()}
                                    </strong>

                                    <p>
                                        {getCloudExplanation()}
                                    </p>

                                </div>

                            </section>

                            <section>

                                <h2>📈 Understanding Scalability</h2>

                                <p>
                                    One of the major advantages of cloud
                                    computing is scalability. When demand
                                    increases, additional computing resources
                                    can be provisioned.
                                </p>

                            </section>

                            <section>

                                <h2>🎯 Key Takeaway</h2>

                                <p>
                                    Cloud computing makes computing resources
                                    available on demand and allows
                                    infrastructure to scale according to
                                    workload requirements.
                                </p>

                            </section>

                        </>

                    )}

                    {selectedModule.title === "Containers" && (

                        <>

                            <section>

                                <h2>📖 What is a Container?</h2>

                                <p>
                                    A container packages an application
                                    together with the dependencies it needs
                                    to run. This helps the application run
                                    consistently across different environments.
                                </p>

                            </section>

                            <section>

                                <h2>🌍 Real-World Example</h2>

                                <p>
                                    A developer can package a web application
                                    inside a container and run the same
                                    container on a laptop, server or cloud
                                    platform.
                                </p>

                            </section>

                            <section>

                                <h2>⚠️ Problem</h2>

                                <p>
                                    Applications can behave differently when
                                    moved between environments because
                                    dependencies and configurations may differ.
                                </p>

                            </section>

                            <section>

                                <h2>💡 Container Solution</h2>

                                <p>
                                    Containers package the application and
                                    its required dependencies together,
                                    making deployment more consistent.
                                </p>

                            </section>

                            <section>

                                <h2>📦 Container Deployment Simulation</h2>

                                <p>
                                    Increase the number of containers and
                                    change the application workload to
                                    understand container scaling.
                                </p>

                                <div className="vm-control">

                                    <label>
                                        Number of Containers:
                                        {" "}{containerCount}
                                    </label>

                                    <input
                                        type="range"
                                        min="1"
                                        max="5"
                                        value={containerCount}
                                        onChange={e =>
                                            setContainerCount(
                                                Number(e.target.value)
                                            )
                                        }
                                    />

                                </div>

                                <div className="vm-control">

                                    <label>
                                        Application Workload:
                                        {" "}{containerWorkload}%
                                    </label>

                                    <input
                                        type="range"
                                        min="10"
                                        max="50"
                                        value={containerWorkload}
                                        onChange={e =>
                                            setContainerWorkload(
                                                Number(e.target.value)
                                            )
                                        }
                                    />

                                </div>

                                <div className="vm-results">

                                    <h3>Container Resources</h3>

                                    <p>
                                        Number of Containers:
                                        <strong>
                                            {" "}{containerCount}
                                        </strong>
                                    </p>

                                    <p>
                                        Workload per Container:
                                        <strong>
                                            {" "}{containerWorkload}%
                                        </strong>
                                    </p>

                                    <p>
                                        Total Workload:
                                        <strong>
                                            {" "}
                                            {containerCount *
                                                containerWorkload}%
                                        </strong>
                                    </p>

                                    <h3>Deployment Status</h3>

                                    <strong>
                                        {getContainerStatus()}
                                    </strong>

                                    <p>
                                        {getContainerExplanation()}
                                    </p>

                                </div>

                            </section>

                            <section>

                                <h2>🚀 Why Containers Are Useful</h2>

                                <p>
                                    Containers are lightweight and portable.
                                    They make it easier to package, deploy and
                                    move applications between environments.
                                </p>

                            </section>

                            <section>

                                <h2>🎯 Key Takeaway</h2>

                                <p>
                                    Containers package applications and their
                                    dependencies together, making deployment
                                    more consistent and portable.
                                </p>

                            </section>

                        </>

                    )}

                    {selectedModule.title === "Kubernetes" && (

                        <>

                            <section>

                                <h2>📖 What is Kubernetes?</h2>

                                <p>
                                    Kubernetes is a container orchestration
                                    platform. It helps manage, deploy,
                                    scale and monitor containerized
                                    applications.
                                </p>

                            </section>

                            <section>

                                <h2>⚠️ Problem</h2>

                                <p>
                                    Managing many containers manually becomes
                                    difficult. Containers need to be deployed,
                                    monitored, restarted and scaled.
                                </p>

                            </section>

                            <section>

                                <h2>💡 Kubernetes Solution</h2>

                                <p>
                                    Kubernetes automatically manages
                                    containers across a cluster of machines.
                                    It can maintain replicas and distribute
                                    workloads.
                                </p>

                            </section>

                            <section>

                                <h2>☸️ Kubernetes Simulation</h2>

                                <p>
                                    Experiment with pods, replicas and
                                    application workload.
                                </p>

                                <div className="vm-control">

                                    <label>
                                        Number of Pods:
                                        {" "}{podCount}
                                    </label>

                                    <input
                                        type="range"
                                        min="1"
                                        max="5"
                                        value={podCount}
                                        onChange={e =>
                                            setPodCount(
                                                Number(e.target.value)
                                            )
                                        }
                                    />

                                </div>

                                <div className="vm-control">

                                    <label>
                                        Workload per Pod:
                                        {" "}{podWorkload}%
                                    </label>

                                    <input
                                        type="range"
                                        min="10"
                                        max="50"
                                        value={podWorkload}
                                        onChange={e =>
                                            setPodWorkload(
                                                Number(e.target.value)
                                            )
                                        }
                                    />

                                </div>

                                <div className="vm-control">

                                    <label>
                                        Desired Replicas:
                                        {" "}{replicaCount}
                                    </label>

                                    <input
                                        type="range"
                                        min="0"
                                        max="5"
                                        value={replicaCount}
                                        onChange={e =>
                                            setReplicaCount(
                                                Number(e.target.value)
                                            )
                                        }
                                    />

                                </div>

                                <div className="vm-results">

                                    <h3>Cluster Information</h3>

                                    <p>
                                        Pods:
                                        <strong>
                                            {" "}{podCount}
                                        </strong>
                                    </p>

                                    <p>
                                        Workload per Pod:
                                        <strong>
                                            {" "}{podWorkload}%
                                        </strong>
                                    </p>

                                    <p>
                                        Total Workload:
                                        <strong>
                                            {" "}
                                            {podCount * podWorkload}%
                                        </strong>
                                    </p>

                                    <p>
                                        Desired Replicas:
                                        <strong>
                                            {" "}{replicaCount}
                                        </strong>
                                    </p>

                                    <h3>Cluster Status</h3>

                                    <strong>
                                        {getKubernetesStatus()}
                                    </strong>

                                    <p>
                                        {getKubernetesExplanation()}
                                    </p>

                                </div>

                            </section>

                            <section>

                                <h2>🔁 Replication</h2>

                                <p>
                                    Replicas are copies of an application
                                    running as multiple pods. If one pod
                                    fails, another replica can continue
                                    serving the application.
                                </p>

                            </section>

                            <section>

                                <h2>🌐 Kubernetes Service</h2>

                                <p>
                                    A Kubernetes Service provides a stable way
                                    for users and applications to access pods.
                                </p>

                                <div className="vm-results">

                                    <h3>Service Status</h3>

                                    <strong>
                                        {getServiceStatus()}
                                    </strong>

                                    <p>
                                        Kubernetes uses services to provide
                                        network access to running pods.
                                    </p>

                                </div>

                            </section>

                            <section>

                                <h2>🎯 Key Takeaway</h2>

                                <p>
                                    Kubernetes automates container
                                    deployment, scaling, replication and
                                    service management.
                                </p>

                            </section>

                        </>

                    )}

                    {selectedModule.title === "AI & GPU Infrastructure" && (

                        <>

                            <section>

                                <h2>🤖 What is AI Infrastructure?</h2>

                                <p>
                                    AI infrastructure provides the computing
                                    resources required to train and run
                                    artificial intelligence models.
                                </p>

                            </section>

                            <section>

                                <h2>🎮 Why Do AI Systems Need GPUs?</h2>

                                <p>
                                    AI models perform large numbers of
                                    mathematical operations. GPUs can process
                                    many operations in parallel, making them
                                    useful for AI model training and inference.
                                </p>

                            </section>

                            <section>

                                <h2>🌍 Real-World Example</h2>

                                <p>
                                    An AI application may use GPUs to process
                                    image recognition, language models,
                                    recommendation systems or other machine
                                    learning workloads.
                                </p>

                            </section>

                            <section>

                                <h2>⚠️ AI Infrastructure Problem</h2>

                                <p>
                                    AI workloads can consume large amounts of
                                    GPU computing power and GPU memory.
                                    Increasing inference requests can also
                                    increase resource usage.
                                </p>

                            </section>

                            <section>

                                <h2>💡 AI Infrastructure Solution</h2>

                                <p>
                                    Infrastructure monitoring can track GPU
                                    usage, GPU memory, AI workload and
                                    inference requests so resources can be
                                    managed effectively.
                                </p>

                            </section>

                            <section>

                                <h2>🤖 AI Infrastructure Simulation</h2>

                                <p>
                                    Change the AI workload, GPU usage,
                                    GPU memory and inference requests to
                                    understand how an AI system behaves.
                                </p>

                                <div className="vm-control">

                                    <label>
                                        AI Model Workload:
                                        {" "}{aiWorkload}%
                                    </label>

                                    <input
                                        type="range"
                                        min="10"
                                        max="100"
                                        value={aiWorkload}
                                        onChange={e =>
                                            setAiWorkload(
                                                Number(e.target.value)
                                            )
                                        }
                                    />

                                </div>

                                <div className="vm-control">

                                    <label>
                                        GPU Usage:
                                        {" "}{gpuUsage}%
                                    </label>

                                    <input
                                        type="range"
                                        min="10"
                                        max="100"
                                        value={gpuUsage}
                                        onChange={e =>
                                            setGpuUsage(
                                                Number(e.target.value)
                                            )
                                        }
                                    />

                                </div>

                                <div className="vm-control">

                                    <label>
                                        GPU Memory:
                                        {" "}{gpuMemory}%
                                    </label>

                                    <input
                                        type="range"
                                        min="10"
                                        max="100"
                                        value={gpuMemory}
                                        onChange={e =>
                                            setGpuMemory(
                                                Number(e.target.value)
                                            )
                                        }
                                    />

                                </div>

                                <div className="vm-control">

                                    <label>
                                        Inference Requests:
                                        {" "}{inferenceRequests}%
                                    </label>

                                    <input
                                        type="range"
                                        min="10"
                                        max="100"
                                        value={inferenceRequests}
                                        onChange={e =>
                                            setInferenceRequests(
                                                Number(e.target.value)
                                            )
                                        }
                                    />

                                </div>

                                <div className="vm-results">

                                    <h3>AI Infrastructure Metrics</h3>

                                    <p>
                                        AI Workload:
                                        <strong>
                                            {" "}{aiWorkload}%
                                        </strong>
                                    </p>

                                    <p>
                                        GPU Usage:
                                        <strong>
                                            {" "}{gpuUsage}%
                                        </strong>
                                    </p>

                                    <p>
                                        GPU Memory:
                                        <strong>
                                            {" "}{gpuMemory}%
                                        </strong>
                                    </p>

                                    <p>
                                        Inference Requests:
                                        <strong>
                                            {" "}{inferenceRequests}%
                                        </strong>
                                    </p>

                                    <h3>AI System Status</h3>

                                    <strong>
                                        {getAIStatus()}
                                    </strong>

                                    <p>
                                        {getAIExplanation()}
                                    </p>

                                </div>

                            </section>

                            <section>

                                <h2>🧠 AI Infrastructure Recommendation</h2>

                                <div className="vm-results">

                                    <p>
                                        {getAIRecommendation()}
                                    </p>

                                </div>

                            </section>

                            <section>

                                <h2>📊 Training vs Inference</h2>

                                <p>
                                    <strong>Training</strong> is the process
                                    of teaching an AI model using data.
                                </p>

                                <p>
                                    <strong>Inference</strong> is when a
                                    trained AI model receives new input and
                                    produces a prediction or response.
                                </p>

                            </section>

                            <section>

                                <h2>🎯 Key Takeaway</h2>

                                <p>
                                    AI infrastructure combines powerful
                                    computing resources, GPUs, memory,
                                    networking and monitoring systems to
                                    support AI model training and inference.
                                </p>

                            </section>

                        </>

                    )}

                </div>

            )}

        </div>
    )
}

export default Learning