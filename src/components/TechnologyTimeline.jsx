import React from "react"
import "./TechnologyTimeline.css"

function TechnologyTimeline() {

    const technologies = [
        {
            year: "Before 2000",
            title: "Physical Servers",
            icon: "🖥️",
            problem: "Servers were expensive and resources were often underused.",
            solution: "Applications were directly installed and operated on physical machines.",
            example: "A company purchases one physical server for each major application.",
            next: "Organizations needed better resource utilization."
        },
        {
            year: "2000s",
            title: "Virtual Machines",
            icon: "💻",
            problem: "Physical servers were not being fully utilized.",
            solution: "Virtualization allowed multiple virtual machines to run on one physical server.",
            example: "One physical server can run separate Linux and Windows virtual machines.",
            next: "Organizations wanted flexible infrastructure without managing all hardware themselves."
        },
        {
            year: "2010s",
            title: "Cloud Computing",
            icon: "☁️",
            problem: "Buying and maintaining physical infrastructure was expensive and slow.",
            solution: "Cloud platforms provided computing resources on demand.",
            example: "A student can create a virtual server in the cloud without buying physical hardware.",
            next: "Applications became larger and needed easier deployment."
        },
        {
            year: "2010s",
            title: "Containers",
            icon: "📦",
            problem: "Applications behaved differently across development and production environments.",
            solution: "Containers package applications together with their dependencies.",
            example: "A Spring Boot application can run inside a container with the same environment everywhere.",
            next: "Organizations needed to manage large numbers of containers."
        },
        {
            year: "Late 2010s",
            title: "Kubernetes",
            icon: "☸️",
            problem: "Managing hundreds or thousands of containers manually became difficult.",
            solution: "Kubernetes automates container deployment, scaling and management.",
            example: "Kubernetes can automatically create additional application instances when demand increases.",
            next: "AI and machine learning workloads required specialized infrastructure."
        },
        {
            year: "2020s",
            title: "AI / GPU Infrastructure",
            icon: "🤖",
            problem: "AI models require large amounts of computing power and memory.",
            solution: "GPU-based infrastructure accelerates AI model training and inference.",
            example: "Multiple GPUs can be used to train a large machine learning or deep learning model.",
            next: "Modern infrastructure increasingly combines cloud, containers, Kubernetes and AI."
        }
    ]

    return (
        <div className="timeline-page">

            <div className="timeline-header">

                <h1>
                    🚀 Technology Evolution Timeline
                </h1>

                <p>
                    Understand how infrastructure evolved and why each technology was introduced.
                </p>

            </div>

            <div className="timeline">

                {technologies.map((technology, index) => (

                    <div
                        className={`timeline-item ${index % 2 === 0 ? "left" : "right"}`}
                        key={technology.title}
                    >

                        <div className="timeline-content">

                            <div className="timeline-icon">
                                {technology.icon}
                            </div>

                            <span className="timeline-year">
                                {technology.year}
                            </span>

                            <h2>
                                {technology.title}
                            </h2>

                            <div className="timeline-section">

                                <h3>
                                    ❓ Problem
                                </h3>

                                <p>
                                    {technology.problem}
                                </p>

                            </div>

                            <div className="timeline-section">

                                <h3>
                                    💡 Solution
                                </h3>

                                <p>
                                    {technology.solution}
                                </p>

                            </div>

                            <div className="timeline-section">

                                <h3>
                                    🌍 Real-World Example
                                </h3>

                                <p>
                                    {technology.example}
                                </p>

                            </div>

                            <div className="timeline-next">

                                <strong>
                                    ➡️ Why the next technology?
                                </strong>

                                <p>
                                    {technology.next}
                                </p>

                            </div>

                        </div>

                    </div>

                ))}

            </div>

            <div className="timeline-footer">

                <h2>
                    🧠 Learn → Understand → Experiment → Use AI Assistance
                </h2>

                <p>
                    Infrastructure technology continues to evolve as new problems appear.
                    Understanding this evolution helps students understand modern AI infrastructure.
                </p>

            </div>

        </div>
    )
}

export default TechnologyTimeline