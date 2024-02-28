const { express } = require('express');
const { Eudcational, validateContent } = require('../models/Educational');

// Controller to create content by type (educational or faq)
const createContentByType = async (req, res) => {
    try {
        const userId = req.userId;

        const { type } = req.query;
        const { title, description } = req.body;
       
       
        // Validate the content data
        const { error } = validateContent({ title, description, type });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Create content based on the specified type
        const newContent = await Eudcational.create({
            title,
            description,
            type,
        });

        res.status(201).json(newContent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating content' });
    }
};



// Controller to get content by type (educational or faq)
const getContentByType = async (req, res) => {
    try {
        const { type } = req.query;

        // Validate the type parameter
        const validTypes = ['educational', 'faq'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ message: 'Invalid content type' });
        }

        // Fetch content based on the specified type
        const content = await Eudcational.find({ type });

        res.status(200).json(content);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching content' });
    }
};
module.exports = {
    createContentByType,
    getContentByType,
};
