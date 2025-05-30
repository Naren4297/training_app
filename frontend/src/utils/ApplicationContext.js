import React, {useContext, useState} from "react"

const AppContext = React.createContext();
const AppUpdateContext = React.createContext();

export function useAppContext(){
    return useContext(AppContext);
}

export function useAppUpdateContext(){
    return useContext(AppUpdateContext);
}

export const ContextProvider = ({children}) => {
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const setCookie = (key,value) => {
        document.cookie = `${key}=${value}; max-age=3600`
    };

    const userDetailsCookie = getCookie('userDetails');
    let userDetailsParsed = userDetailsCookie ? JSON.parse(userDetailsCookie) : null;

    if(!userDetailsParsed){
userDetailsParsed = {state:{}}
    }
    const[context, setContext] = useState(userDetailsParsed);

    function updateContext(state){
        setContext(state);
        // const newContext = { ...context };
        // Object.keys(state).forEach(key=>{
        // if(state[key]!==newContext[key]) newContext[key]=state[key];
        // setContext(newContext);
        // // setCookie('userDetails',JSON.stringify(newContext));
        // })
    }

    return (
        <AppContext.Provider value={context}>
            <AppUpdateContext.Provider value={updateContext}>
            {children}
            </AppUpdateContext.Provider>
        </AppContext.Provider>
    )

}
