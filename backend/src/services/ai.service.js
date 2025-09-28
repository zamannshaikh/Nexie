const  { GoogleGenAI } =require("@google/genai")

const ai = new GoogleGenAI({});


async function generateResponse(propmt) {
    console.log("prompt Received in AI services : ",propmt)

    const response = await ai.models.generateContent({
         model: "gemini-2.5-flash",
    contents: propmt
    })
    return response.text;
}




module.exports=generateResponse;