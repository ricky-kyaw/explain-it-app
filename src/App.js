import React, { useState } from 'react';
import { Amplify } from 'aws-amplify';
import { post } from 'aws-amplify/api';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';

import awsExports from './aws-exports';
Amplify.configure(awsExports);

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App({ signOut, user }) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const apiName = 'api00ac01aa';

  const handleExplain = async (e) => {
    e.preventDefault();
    if (!prompt) return;
    setLoading(true);
    setResponse('');

    try {
      const restOperation = post({
        apiName: apiName,
        path: '/explain',
        options: { body: { prompt } }
      });
      const { body } = await restOperation.response;
      const jsonResponse = await body.json();
      const aiResponse = jsonResponse.response;
      
      setResponse(aiResponse);
      const newHistoryItem = { prompt: prompt, response: aiResponse };
      setHistory([newHistoryItem, ...history]);

    } catch (error) {
      console.error('error explaining prompt', error);
      setResponse('Sorry, an error occurred. Check the browser console and Lambda logs.');
    } finally {
      setLoading(false);
      setPrompt('');
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Explain It!
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Hello, {user.signInDetails?.loginId}
          </Typography>
          <Button color="inherit" onClick={signOut}>Sign out</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper component="form" onSubmit={handleExplain} sx={{ p: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What complex topic do you want explained simply?"
            variant="outlined"
            label="Your Topic"
          />
          <Button 
            type="submit" 
            disabled={loading} 
            variant="contained" 
            size="large"
            sx={{ mt: 2, width: '100%' }}
          >
            {loading ? <CircularProgress size={24} /> : 'Explain It to Me'}
          </Button>
        </Paper>

        {response && (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h5" gutterBottom>Explanation:</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{response}</Typography>
          </Paper>
        )}

        <Box sx={{ mt: 5 }}>
          <Typography variant="h4" gutterBottom>History</Typography>
          {history.map((item, index) => (
            <Paper key={index} sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" component="p"><strong>You asked:</strong> {item.prompt}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}><strong>It said:</strong> {item.response}</Typography>
            </Paper>
          ))}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default withAuthenticator(App, {
  loginMechanisms: ['email'],
  signUpAttributes: ['email'],
});
