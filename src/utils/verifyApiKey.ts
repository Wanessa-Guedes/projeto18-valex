

function verifyKey (apiKey: string) {
    if(!apiKey){
        throw{
            type: "NOT FOUND"
        }
    }
}

export const verifyApiKey = {
    verifyKey
}