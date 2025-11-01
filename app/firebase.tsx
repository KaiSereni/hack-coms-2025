import { initializeApp } from "firebase/app";
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";


const firebaseConfig = {
    apiKey: "AIzaSyCqcfidsth0fe_tyZpKxG2-QfZlcHReRfM",
    authDomain: "ka1-tech.firebaseapp.com",
    projectId: "ka1-tech",
    storageBucket: "ka1-tech.firebasestorage.app",
    messagingSenderId: "455926417655",
    appId: "1:455926417655:web:2e3e897d530457e8386bf2",
    measurementId: "G-0RXE39K2XZ"
};

export type UserTrashInfo = {
    "num_trash_bins": number,
    "region": string,
    "comments": string
}
export type BinInfo = {
    "title": string,
    "description": string,
    "count": number
}

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);
// const analytics = getAnalytics(app);

if (typeof window !== "undefined" && process.env.NODE_ENV == "development") {
    connectFunctionsEmulator(functions, "localhost", 5001);
}

export function get_bin_plan_callable() {
    return httpsCallable<UserTrashInfo, BinInfo[]>(functions, "bin_plan");
}

export function get_identify_trash_callable() {
    return httpsCallable<{
        "bins_info": BinInfo[], 
        "base64_image": string
    }, {
        "title": string, 
        "more_info": string
    }>(functions, "identify_trash");
}