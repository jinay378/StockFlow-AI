import { useEffect, useState } from "react";
import api from "../services/api";

function HomePage() {

    const [message, setMessage] = useState("");

    useEffect(() => {

        api.get("/")
            .then(res => {
                setMessage(res.data.message);
            });

    }, []);

    return (

        <div style={{padding:40}}>

            <h1>StockFlow AI</h1>

            <h2>{message}</h2>

        </div>

    );

}

export default HomePage;