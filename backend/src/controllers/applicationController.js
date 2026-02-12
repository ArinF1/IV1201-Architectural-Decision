const applicationService = require('../model/service/ApplicationService');
const decisionMakingService = require('../model/service/DecisionMakingService');

/**
 * Handles the creation of a new application.
 * Extracts application data from request body including person_id, competencies, and availabilities.
 * 
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function for error handling.
 * @returns {Promise<void>} Sends a 201 Created response with the application data.
 */
exports.postApplication = async (req, res, next) => {
    try {
        const person_id = req.user.id; // From the JWT authentication token
        const {  competencies, availabilities } = req.body;
        const result = await applicationService.sendApplication({
            person_id,
            competencies,
            availabilities,
        });
        
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

/**
 * Retrieves a list of recent applications with full details.
 * 
 * @param {import('express').Request} req - The Express request object.
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

/**
 * Retrieves all available competencies.
 * 
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {Promise<void>} Sends a 200 OK response with an array of competencies.
 */
exports.getCompetencies = async (req, res, next) => {
    try {
        const competencies = await applicationService.getCompetencies();
        res.status(200).json({ success: true, data: competencies });
    } catch (error) {
        next(error);
    }
};

/**
 * Processes all unhandled applications with automated decision-making.
 * 
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 * @returns {Promise<void>} Sends a 200 OK response with processing results.
 */
exports.autoProcessApplications = async (req, res, next) => {
    try {
        const result = await decisionMakingService.processUnhandledApplications();
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};