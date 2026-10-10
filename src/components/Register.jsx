import { useState } from "react"
import "./Register.css"
import axios from "axios"
import { useNavigate } from "react-router-dom"

function Register() {

    const navigate = useNavigate()

    const [user, setUser] = useState({
        name: "",
        email: "",
        password: ""
    })

    function handleChange(e) {
        setUser({
            ...user,
            [e.target.name]: e.target.value
        })
    }

    async function submit() {

        try {

            const response = await axios.post(
                "http://localhost:8081/users/register",
                user
            )

            console.log(response.data)

            alert("User registered successfully")

            navigate("/login")

        } catch (err) {

            console.log(err)

            alert("User Registration Failed")
        }
    }

    return (
        <div className="Third-div">

            <h1>Create Account</h1>

            <h3>Name</h3>

            <input
                type="text"
                name="name"
                value={user.name}
                onChange={handleChange}
            />

            <h3>Email</h3>

            <input
                type="email"
                name="email"
                value={user.email}
                onChange={handleChange}
            />

            <h3>Password</h3>

            <input
                type="password"
                name="password"
                value={user.password}
                onChange={handleChange}
            />

            <br />

            <button onClick={submit}>
                Register
            </button>

            <br />

            <a href="/login">
                Already have an account? Login
            </a>

        </div>
    )
}

export default Register