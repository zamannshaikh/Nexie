const  { GoogleGenAI } =require("@google/genai")

const ai = new GoogleGenAI({});


async function generateResponse(chatHistory) {
    console.log("prompt Received in AI services : ",chatHistory)

    const response = await ai.models.generateContent({
         model: "gemini-2.5-flash",
    contents: chatHistory
    })
    return response.text;
}


async function generateVector(content) {
    const response = await ai.models.embedContent({
        model:"gemini-embedding-001",
        contents: content,
        config:{
            outputDimensionality:768
        }
    })
    return response.embeddings[0].values
    
}




module.exports={generateResponse,generateVector};