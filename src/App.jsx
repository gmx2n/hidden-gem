import { Route, Routes } from "react-router";
import Layout from "./components/layout";
import LoginPage from "./pages/login";
import HomePage from "./pages/home";
import PostForm from "./pages/post-form";
import PostViewPage from "./pages/post-view";
import MapPage from "./pages/map";
import ProfilePage from "./pages/profile";



export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route index element={<HomePage />} />
        <Route path="/create-post" element={<PostForm />} />
        <Route path="/posts/:postId" element={<PostViewPage />} />
        <Route path="/map" element={<MapPage />}/>
        <Route path="/profile" element={<ProfilePage />}/>
      </Route>
    </Routes>
  );


}

