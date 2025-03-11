"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeyAuth = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const API_SECRET_KEY = process.env.API_SECRET_KEY;
/**
 * Middleware to verify the API key in the request header
 *
 * This middleware checks for a valid API key in the x-api-key header.
 * If the key is missing or invalid, the request is rejected with a 401 status.
*/
const apiKeyAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    // Check if API key exists in the environment variables
    if (!API_SECRET_KEY) {
        console.error('API_SECRET_KEY is not defined in the environment variables');
        res.status(500).json({
            error: 'Server configuration error. API secret key is not configured.'
        });
        return;
    }
    // Check if API key is provided in the request
    if (!apiKey) {
        res.status(401).json({
            error: 'Access denied.'
        });
        return;
    }
    // Check if the provided API key is valid
    if (apiKey !== API_SECRET_KEY) {
        res.status(401).json({
            error: 'Access denied. Invalid API key.'
        });
        return;
    }
    next();
};
exports.apiKeyAuth = apiKeyAuth;
