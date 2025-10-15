const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const { dot } = require('node:test/reporters');

dotenv.config();

const app = express();

const PORT = 3000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/chat', async (req, res) => {
    try{
        const {question} = req.body;

        if (!question) {
            return res.json({
                error: true,
                message: 'Please enter a question.'
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemnini-1.5-flash" });

        const result = await model.generateContent(question);
        const response = await result.response;
        const aiResponse = response.text();

        res.json({
            success: true,
            message: aiResponse
        });
    }catch(error){
        console.error('Error:',error);
        res.json({
            error: true,
            message: 'Sorry, something went wrong. Please try again later.'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);

    if(!process.env.GEMINI_API_KEY) {
        console.error('Warning: Please add your GEMINI_API_KEY to the .env file');
    }
    else{
        console.log('API Key found. Ready to Chat!');
    }
});