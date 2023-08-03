import React, { Suspense, lazy, useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
// import { getButtonsData } from "./Server/getButtons";
import { getUsersData } from "./Server/getUsersData";
import {
    AddButton,
    Footer,
    Landing,
    Loader,
    Login,
    Main,
    Navbar,
    Score,
    ExploreButtons,
} from "./components";
import ErrorPage from "./components/ErrorPage/404Error";
import SuspenseLoader from "./components/SuspenseLoader/SuspenseLoader";
import GoToTop from "./components/Top/GoToTop";
import UserProfile from "./components/UserProfile/UserProfile";
import About from "./pages/AboutUs/About";

// changes by aditya

import { db } from "./firebase/auth";
import {
    collection,
    getDocs,
    limit,
    query,
    startAfter,
    orderBy,
    startAt,
    getCountFromServer,
} from "firebase/firestore";

// changes by aditya

const ShowCode = lazy(() => import("./components/ShowCode/ShowCode"));

const App = ({ modeToggleFunc, modeToggle }) => {
    const [loading, setLoading] = useState(false);
    const [toggleMode, setToggleMode] = useState(true);

    const location = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

    const [buttonsData, setButtonsData] = useState([]);
    const [usersData, setUsersData] = useState([]);

    // changes by aditya
    const [lastButton, setLastButton] = useState();
    const [totalBtn, setTotalBtn] = useState();

    // const BUTTONS_CACHE_KEY = "buttonsData";
    const getButtonsData = async () => {
        // const cachedData = localStorage.getItem(BUTTONS_CACHE_KEY);
        // if (cachedData) {
        //     return JSON.parse(cachedData);
        // }

        // const buttonCollectionRef = collection(db, "buttons");
        // const data = await getDocs(buttonCollectionRef);

        const buttonCollectionRef = collection(db, "buttons");
        let snapshot = query(
            buttonCollectionRef,
            orderBy("likeCounter", "desc"),
            limit(6)
        );
        const data = await getDocs(snapshot);

        const buttonsData = data.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
        }));

        const cnt = await getCountFromServer(buttonCollectionRef);
        buttonsData.map((item) => {
            console.log("id:", item.githubUsername);
        });
        console.log("count: " + cnt.data().count);
        setTotalBtn(cnt.data().count);

        const lastBtn = data?.docs[data.docs.length - 1];
        setLastButton(lastBtn);
        // localStorage.setItem(BUTTONS_CACHE_KEY, JSON.stringify(buttonsData));
        return buttonsData;
    };

    const getMoreButtonsData = async () => {
        // const cachedData = localStorage.getItem(BUTTONS_CACHE_KEY);
        // if (cachedData) {
        //     return JSON.parse(cachedData);
        // }

        // const buttonCollectionRef = collection(db, "buttons");
        // const data = await getDocs(buttonCollectionRef);

        const buttonCollectionRef = collection(db, "buttons");
        let snapshot = query(
            buttonCollectionRef,
            orderBy("likeCounter", "desc"),
            limit(6),
            startAfter(lastButton)
        );
        const data = await getDocs(snapshot);

        const newBtn = data.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
        }));

        const lastBtn = data?.docs[data.docs.length - 1];
        setLastButton(lastBtn);
        // localStorage.setItem(BUTTONS_CACHE_KEY, JSON.stringify(buttonsData));
        setButtonsData([...buttonsData, ...newBtn]);
        buttonsData.map((item) => {
            console.log("id:", item.githubUsername);
        });
    };

    // changes by aditya

    useEffect(() => {
        async function fetchData() {
            try {
                const buttonsData = await getButtonsData();
                const usersData = await getUsersData();
                setButtonsData(buttonsData);
                setUsersData(usersData);
            } catch (error) {
                console.log("Error fetching data:", error);
            }
        }
        fetchData();
    }, []);

    const routes = [
        {
            path: "/",
            element: (
                <>
                    <Landing
                        modeToggle={toggleMode}
                        modeToggleFunc={setToggleMode}
                    />
                    <Main
                        modeToggle={toggleMode}
                        modeToggleFunc={setToggleMode}
                        buttonsData={buttonsData}
                        fetchMoreData={getMoreButtonsData}
                        setButtonsData={setButtonsData}
                        totalBtn={totalBtn}
                    />
                </>
            ),
        },
        {
            path: "/about",
            element: <About modeToggle={toggleMode} />,
        },
        {
            path: "/show/:id",
            element: (
                <Suspense fallback={<SuspenseLoader />}>
                    <ShowCode />
                </Suspense>
            ),
        },
        {
            path: "/add",
            element: <AddButton />,
        },
        // {
        //   path: "/login",
        //   element: <Login />,
        // },
        {
            path: "/user/:userId",
            element: <UserProfile modeToggle={toggleMode} />,
        },
        {
            path: "/leaderboard",
            element: <Score buttonsData={buttonsData} usersData={usersData} />,
        },
        {
            path: "/explore",
            element: (
                <ExploreButtons data={buttonsData} toggleMode={toggleMode} />
            ),
        },
        {
            path: "*",
            element: <ErrorPage modeToggleFunc={modeToggle} />,
        },
    ];

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 500);
    }, []);

    return (
        <>
            {loading ? (
                <Loader />
            ) : (
                <div className={`${toggleMode ? "dark" : "light"}`}>
                    <Navbar
                        modeToggle={toggleMode}
                        modeToggleFunc={setToggleMode}
                    />
                    <Routes>
                        {routes.map((route, index) => (
                            <Route
                                key={index}
                                path={route.path}
                                element={route.element}
                            />
                        ))}
                    </Routes>
                    <GoToTop />
                    <Footer modeToggle={toggleMode} />
                </div>
            )}
        </>
    );
};

export default App;
