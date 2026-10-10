import "bulmaswatch/superhero/bulmaswatch.min.css";
import "@fortawesome/fontawesome-free/css/fontawesome.min.css";
import "@fortawesome/fontawesome-free/css/solid.min.css";
import "./App.css";
import { Provider } from "react-redux";
import { store } from "./state";
import CellList from "./components/cell-list";
import { TopMenu } from "./components/top-menu";

function App() {
  return (
    <Provider store={store}>
      <div className="app">
        <TopMenu />
        <CellList />
      </div>
    </Provider>
  );
}

export default App;
