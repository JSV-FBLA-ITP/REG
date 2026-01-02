import { GoogleGenAI } from "@google/genai";

/* --- 0. SETUP AI --- */
const API_KEY = "AIzaSyBjPG57WFi9iZU2lBPZj8uPLkym_hzG77s"; 
const genAI = new GoogleGenAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });