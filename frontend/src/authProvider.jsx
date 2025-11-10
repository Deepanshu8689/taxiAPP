import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { addUser, removeUser } from "./utils/Redux/userSlice";
import { Navigate } from "react-router-dom";

export default function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreUser = async () => {
      try {
        const res = await fetch("http://localhost:3000/auth/me", {
          credentials: "include"
        });

        if (res.status === 403) {
          console.log("Not logged in")
        }
        
        const user = await res.json();
        if(!user){
          console.log("No user found")
        }
        dispatch(addUser(user));
      } catch (error) {
        dispatch(removeUser());
      } finally {
        setLoading(false);
      }
    };

    restoreUser();
  }, []);

  if (loading) return <div>Loading...</div>;

  return children; // render app once user state resolved
}
