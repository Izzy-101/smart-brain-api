
const { ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");

const stub = ClarifaiStub.grpc();
// This will be used by every Clarifai endpoint call
const metadata = new grpc.Metadata();
metadata.set("authorization", "Key " + process.env.API_KEY);
const setupClarifai = async (imageUrl) => {
    const USER_ID = process.env.USER_ID; 
    const APP_ID = process.env.APP_ID; 
    const MODEL_ID = 'face-detection'; 

    return new Promise((resolve, reject) => {
        stub.PostModelOutputs(
            {
                user_app_id: {
                    user_id: USER_ID,
                    app_id: APP_ID
                },
                model_id: MODEL_ID,
                inputs: [
                    {
                        data: {
                            image: {
                                url: imageUrl,
                                allow_duplicate_url: true
                            }
                        }
                    }
                ]
            },
            metadata,
            (err, response) => {
                if (err) {
                    return reject(`Clarifai API error: ${err.message}`);
                }
                if (response.status.code !== 10000) {
                    return reject(`Clarifai API returned error: ${response.status.description}`);
                }
                resolve(response);
            }
        );
    });
};

const handleApiCall = (req, res) => {
    setupClarifai(req.body.input)
     .then(data => {
         res.json(data)
    })
    .catch(err => res.status(400).json('unable to work with API'))
}
  
const handleImage = (req, res, db) => {
    const { id } = req.body;
    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0].entries);
    })
    .catch(err => res.status(400).json('unable to get entries'))
}

module.exports = {
    handleImage,
    handleApiCall
};