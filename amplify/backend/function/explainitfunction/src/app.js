/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/




const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");

const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

// Corrected: Automatically uses the function's region
const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION });

app.post('/explain', async function(req, res) {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  const bedrockParams = {
    modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
    contentType: 'application/json',
    accept: '*/*',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 300,
      messages: [{ role: 'user', content: `Explain "${prompt}" to me as if I were five years old.` }],
    }),
  };

  try {
    const command = new InvokeModelCommand(bedrockParams);
    const bedrockResponse = await client.send(command);
    const decodedResponseBody = new TextDecoder().decode(bedrockResponse.body);
    const responseBody = JSON.parse(decodedResponseBody);
    res.json({ success: 'Explanation generated!', response: responseBody.content[0].text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to invoke model' });
  }
});

app.listen(3000, function() { console.log("App started"); });
module.exports = app;
