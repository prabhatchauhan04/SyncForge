import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import Signup from './components/SignUp';
import Login from './components/Login';
import Editor from './components/Editor';
import LandingPage from './components/LandingPage';
import { RouterProvider, createBrowserRouter, createRoutesFromElements, Route} from 'react-router-dom'; // Import required functions/components from React Router for routing setup



const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path='/' element={<App />}>
            <Route index element={<LandingPage />} /> {/* When the URL is exactly '/', show the <LandingPage /> component. because it's inside a parent route with path '/', we use index to mean the default child route. */}
            <Route path='signup' element={<Signup />} /> 
            <Route path='login' element={<Login />} />
            <Route path='editor/:id' element={<Editor />} />
        </Route>
    )
);

/*
This can also be done : 
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/editor/:id" element={<Editor />} />
    </>
  )
);
*/



createRoot(document.getElementById('root')).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>,
)
