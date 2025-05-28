import { ACCESS_TOKEN } from "../constants";
import { api } from "../api/api";

export default async function fetchUsers() {
  const token = localStorage.getItem(ACCESS_TOKEN);
  if (!token) return null;

  try {
    // Nuk vendosim headers këtu sepse api i vendos automatikisht
    const response = await api.get("/api/users");
    return response.data;
  } catch (error) {
    console.error("Fetch users failed:", error.response?.data || error.message);
    return null;
  }
}
