import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../styles/login.css";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";

export default function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch()
    const [emailId, setEmailId] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            if (!emailId || !password) {
                alert("All fields are required")
                return
            }

            const res = await fetch("http://localhost:3000/auth/login", {
                method: "Post",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ emailId, password })
            })
            const data = await res.json()
            console.log("data: ", data)
            if(data.statusCode === 500){
                throw new Error(data.message)
            }
            
            dispatch(addUser(data.user))
            if(data.user.role === 'driver'){
                navigate('/driver-homepage')
            }
            else{
                navigate('/ride-request')
            }

            // navigate('/')
        } catch (error) {
            console.log("error in Login: ", error)
            throw error
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={emailId}
                    onChange={(e) => setEmailId(e.target.value)}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
            </form>
            <p>
                Don’t have an account?{" "}
                <span onClick={() => navigate("/signup")} className="link">
                    Sign Up
                </span>
            </p>
        </div>
    );
}
