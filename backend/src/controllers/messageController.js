const messageService = require('../model/MessageService');

/**
 * Handles the creation of a new message.
 * * This method extracts the message text from the request body and delegates 
 * the creation process to the MessageService. It ensures that the response 
 * is formatted correctly for the client-side View.
 * * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function for error handling.
 * @returns {Promise<void>} Sends a 201 Created response with the message data.
 */

exports.postMessage = async (req, res, next) => {
    try {
        const { text } = req.body;
        const result = await messageService.sendMessage(text);
        
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        next(error); // Centralized error handling in app.js
    }
};


/**
 * Retrieves a list of recent messages.
 * * Interacts with the MessageService to fetch domain data and returns it to the View.
 * * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {Promise<void>} Sends a 200 OK response with an array of messages.
 */

exports.getMessages = async (req, res, next) => {
  try {
    const messages = await messageService.getRecentMessages();
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};