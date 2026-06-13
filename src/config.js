export const AUTH_URL = window.ENV?.VITE_AUTH_SERVICE_URL || import.meta.env.VITE_AUTH_SERVICE_URL || "http://localhost:8787";

export const CRUD_URL = window.ENV?.VITE_CRUD_SERVICE_URL || import.meta.env.VITE_CRUD_SERVICE_URL || "http://localhost:8788";
