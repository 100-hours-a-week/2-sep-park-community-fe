let API_URL;



if (typeof window !== "undefined") {
    // 브라우저 환경
    API_URL =
        window.location.hostname === "localhost"
            ? "http://localhost:4000"
            : "http://43.200.178.50:4000";
} else {
    // Node.js 환경
    API_URL =
        process.env.NODE_ENV === "development"
            ? "http://localhost:4000"
            : "http://43.200.178.50:4000";
}

export default API_URL;