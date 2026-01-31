const {Message} = require("../db"); // Imports the Message model

/**
 * Creates a new message in the database with the provided text.
 * @param text - The text content of the message to be created.
 *  @return The created message instance.
 * async function because it involves db operations, inherently asynchronous.
 *  */

async function createMessage(text) {
    const created = await Message.create({ text });
    return created;
}

/**
 * Lists messages from the database, ordered by creation date descending.
 * @param limit - The maximum number of messages retrieved is 50.
 * @return An array of message instances.
 * async function because it involves db operations, inherently asynchronous.
 * *  */

async function listMessages(limit = 50) {
    const rows = await Message.findAll({ 
        order: [['createdAt', 'DESC']], // Orders messages by creation date descending
        limit, // calls limit param
    });
    return rows;
}

module.exports = {
    createMessage,
    listMessages,
};