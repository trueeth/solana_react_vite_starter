import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ContentContainer } from "./components/ContentContainer";
import { ContextProvider } from "./contexts/ContextProvider";
import NotificationList from "./components/Notification";
import { AppBar } from "./components/AppBar";
import { HomeView } from "./views";

function App() {

  return (
    <>
      <ContextProvider>
        <BrowserRouter>
          <div className="flex flex-col h-screen">
            <NotificationList />
            <AppBar />
            <ContentContainer>
              <Routes>
                <Route>
                  <Route path="/" element={<HomeView />} />
                </Route>
              </Routes>
            </ContentContainer>
          </div>
        </BrowserRouter>
      </ContextProvider>
    </>
  )
}

export default App
