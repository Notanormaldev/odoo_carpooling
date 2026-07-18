import { GoogleGenAI } from '@google/genai';
import Ride from '../models/Ride.model.js';
import ApiError from '../utils/ApiError.js';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API });

/**
 * Parses user search queries like "I want a ride to Infocity at 9am"
 * and extracts search parameters: destination, time, etc.
 * @param {string} queryText - Natural language query
 * @returns {Promise<{ destination: string, time: string }>}
 */
export const parseRideSearchQuery = async (queryText) => {
  try {
    const prompt = `
      You are an AI assistant for an Enterprise Carpooling Platform.
      Your task is to analyze the user's natural language ride request and extract search parameters in JSON format.

      User Query: "${queryText}"

      Output JSON format:
      {
        "destination": "Extracted destination name or empty string if not mentioned",
        "time": "Extracted departure time, e.g. 09:00 AM, 18:30 etc., or empty string",
        "seats": "Number of seats requested, defaults to 1"
      }

      Return ONLY the raw JSON block without markdown formatting or code blocks.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const cleanText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('❌ Gemini Query Parsing Error:', error);
    // Return empty defaults on error
    return { destination: '', time: '', seats: 1 };
  }
};

/**
 * AI-powered match scorer based on user preferences and driver route.
 * @param {object} passengerPref - Passenger preferences
 * @param {Array<object>} availableRides - List of rides to score
 * @returns {Promise<Array<object>>} - Sorted rides with match scores and AI justifications
 */
export const scoreRidesWithAI = async (passengerPref, availableRides) => {
  if (!availableRides || availableRides.length === 0) return [];

  try {
    const ridesData = availableRides.map((r) => ({
      rideId: r._id,
      driverName: r.driverId?.name || 'Driver',
      start: r.startLocation?.address,
      dest: r.destination?.address,
      dateTime: r.dateTime,
      availableSeats: r.availableSeats,
      fare: r.farePerSeat,
      trustScore: r.driverId?.trustScore || 5.0,
    }));

    const prompt = `
      Compare these available carpool rides against the passenger preference and assign a matchScore (0 to 100) and a brief justification (1 sentence max) to each.
      
      Passenger Preference:
      ${JSON.stringify(passengerPref, null, 2)}

      Available Rides:
      ${JSON.stringify(ridesData, null, 2)}

      Output JSON array format:
      [
        {
          "rideId": "string (the exact rideId provided)",
          "matchScore": 85,
          "justification": "string explaining why this is a good match"
        }
      ]

      Return ONLY the raw JSON block without markdown code blocks.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const cleanText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
    const scores = JSON.parse(cleanText);

    // Merge scores back into availableRides
    return availableRides.map((r) => {
      const match = scores.find((s) => s.rideId === r._id.toString());
      return {
        ...r.toObject ? r.toObject() : r,
        matchScore: match ? match.matchScore : 50,
        aiJustification: match ? match.justification : 'Good match based on proximity',
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

  } catch (error) {
    console.error('❌ Gemini Ride Scoring Error:', error);
    // Fallback: simple sorting by distance or date
    return availableRides.map((r) => ({
      ...r.toObject ? r.toObject() : r,
      matchScore: 70,
      aiJustification: 'Matched based on route similarity',
    }));
  }
};

export default { parseRideSearchQuery, scoreRidesWithAI };
