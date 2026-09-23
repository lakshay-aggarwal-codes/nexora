import { useEffect, useState } from "react";
import Home from "./pages/home";
import getCurrentUser from "./features/getCurrentUser";
import { useDispatch } from "react-redux";
import { setUserdata } from "./redux/userSlice";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../utils/firebase.js";

function App() {
  const dispatch = useDispatch();
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    console.log("APP: Firebase auth listener started");

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("APP: Firebase auth state changed");
      console.log("APP: Firebase user:", firebaseUser);

      try {
        if (firebaseUser) {
          console.log("APP: Firebase user exists");
          console.log("APP: Getting current backend user...");

          const data = await getCurrentUser();

          console.log("APP: /api/me response:", data);

          dispatch(setUserdata(data));
        } else {
          console.log("APP: No Firebase user");

          dispatch(setUserdata(null));
        }
      } catch (error) {
        console.error("APP: Auth error:", error);

        dispatch(setUserdata(null));
      } finally {
        console.log("APP: Authentication check finished");

        setAuthLoading(false);
      }
    });

    return () => {
      console.log("APP: Firebase auth listener unsubscribed");
      unsubscribe();
    };
  }, [dispatch]);

  if (authLoading) {
    console.log("APP: Still checking authentication...");

    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  console.log("APP: Rendering Home");

  return <Home />;
}

export default App;