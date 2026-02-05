const applicationService = require('../model/ApplicationService');

/**
 * Handles the creation of a new application.
 * * This method extracts the application text from the request body and delegates 
 * the creation process to the ApplicationService. It ensures that the response 
 * is formatted correctly for the client-side View.
 * * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function for error handling.
 * @returns {Promise<void>} Sends a 201 Created response with the application data.
 */

exports.postApplication = async (req, res, next) => {
    try {
        const { text } = req.body;
        const result = await applicationService.sendApplication(text);
        
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        next(error); // Centralized error handling in app.js
    }
};


/**
 * Retrieves a list of recent Applications.
 * * Interacts with the ApplicationService to fetch domain data and returns it to the View.
 * * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {Promise<void>} Sends a 200 OK response with an array of applications.
 */

exports.getApplications = async (req, res, next) => {
  try {
    const applications = await applicationService.getRecentApplications();
    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
};