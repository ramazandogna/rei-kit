import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PlaygroundLayout } from "./PlaygroundLayout";
import { routes } from "./routes";

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PlaygroundLayout />}>
          {routes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
