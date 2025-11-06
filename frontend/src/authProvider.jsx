import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { addUser, removeUser } from "./utils/Redux/userSlice";

export default function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreUser = async () => {
      try {
        const res = await fetch("http://localhost:3000/auth/me", {
          credentials: "include"
        });

        if (!res.ok) throw new Error("Not logged in");
        
        const user = await res.json();
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
