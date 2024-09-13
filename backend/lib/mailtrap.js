import { MailtrapClient } from "mailtrap"; // Ensure the correct package
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Access Mailtrap API token
const TOKEN = process.env.MAILTRAP_TOKEN;
if (!TOKEN) {
    throw new Error("MAILTRAP_TOKEN is not defined in the environment variables");
}

// Initialize Mailtrap Client
export const mailtrapClient = new MailtrapClient({
	token: TOKEN,
});

// Define email sender details
export const sender = {
	email: process.env.EMAIL_FROM,
	name: process.env.EMAIL_FROM_NAME,
};

// Check if EMAIL_FROM and EMAIL_FROM_NAME are correctly set
if (!sender.email || !sender.name) {
    throw new Error("EMAIL_FROM or EMAIL_FROM_NAME is not defined in the environment variables");
}
