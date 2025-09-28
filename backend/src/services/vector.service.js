const {Pinecone}= require("@pinecone-database/pinecone");

const pc = new Pinecone({ apiKey:process.env.PINECONE_API_KEY});


const gptIndex=pc.Index('gpt-clone');


async function createMemory({vectors,metadata,messageId}) {
    await gptIndex.upsert([{
        id:messageId,
        values:vectors,
        metadata
    }])
    
}



async function queryMemory({queryVector,limit,metadata}) {
    const data= await gptIndex.query({
        vector:queryVector,
        topK:limit,
        filter:metadata?{metadata}:undefined

    })

    return data.matches;
    
}



module.exports={createMemory,queryMemory}