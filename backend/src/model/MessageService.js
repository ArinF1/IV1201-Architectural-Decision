const messageRepo = require('../integration/repositories/messageRepo');

const { sequelize } = require('../integration/db');

class MessageService {
 
    /**
     * function to send a message via message repository, it creates a new message record
     */
    async sendMessage(text) {
        return await sequelize.transaction(async (t) => {
            if (!text || text.trim().length === 0) {
                throw new Error("Message content cannot be empty");
            }

            const messageData = await messageRepo.createMessage(text, t); // Passes the transaction object
            return messageData;
        });
    }

    /**
     * function to get recent messages via message repository tht lists the last 50 messages
     */
    async getRecentMessages() {
        return await messageRepo.listMessages(50);
          const err = new Error("Message content cannot be empty");
            err.status = 400;
  throw err;
    }
}

module.exports = new MessageService();