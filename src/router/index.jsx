import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home/Home';
import Login from '../pages/Login/Login';
import Detail from '../pages/Detail/Detail';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { 
        index: true, 
        element: <Home /> 
      },
      { 
        path: '*', 
        element: <div>Not Found</div> 
      }
    ]
  },
  {
    path: '/detail/:id',
    element: <Detail />
  },
  {
    path: '/login',
    element: <Login />
  }
]);

export default router;
