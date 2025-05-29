import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import { routes } from "./routes";

export const PlaygroundLayout = () => {
  return (
    <div>
      <header>
        <h1>Bileşenler</h1>
      </header>

      <aside>
        <nav>
          <ul>
            {routes.map((route) => (
              <li key={route.path}>
                <Link to={route.path}>{route.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main>
        <Outlet />
      </main>
    </div>
  );
};
