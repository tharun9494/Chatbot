import React, { useState, useRef } from 'react';
import axios from 'axios';
import './ChatInterface.css';

const ImageUploader = () => {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthesisRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setImageUrl(URL.createObjectURL(file)); // To display the selected image
  };

  const handleUpload = async () => {
    if (!image) {
      console.log("No image selected");
      return;
    }

    const formData = new FormData();
    formData.append('image', image);
    formData.append('question', question); // Add question to the form data if needed

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/generate-caption/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log("Backend response:", response.data);
      setAnswer(response.data.answer); // Display answer if the question was asked
    } catch (error) {
      console.error('Error uploading image', error);
    }
  };

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  // Function to speak the generated description using the Web Speech API
  const startSpeaking = (text) => {
    if ('speechSynthesis' in window && text) {
      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = 'en-US'; // You can adjust the language here
      window.speechSynthesis.speak(speech);
      speechSynthesisRef.current = speech; // Store the speech instance for control
      setIsSpeaking(true);

      // Listen for the end event to reset the state
      speech.onend = () => {
        setIsSpeaking(false);
      };
    } else {
      console.error('Text-to-Speech not supported.');
    }
  };

  const stopSpeaking = () => {
    if (speechSynthesisRef.current && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop the speech
      setIsSpeaking(false);
    }
  };

  const handleSpeechToggle = () => {
    if (isSpeaking) {
      stopSpeaking(); // If currently speaking, stop
    } else {
      startSpeaking(answer); // If not speaking, start
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-output">
        <div className="image-and-description">
          <div className="description-container">
            <h3>Generated Description:</h3>
            {imageUrl && (
              <img src={imageUrl} alt="Uploaded" className="uploaded-image" />
            )}
            {answer && (
              <div className="response-message">
                <p>{answer}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="message-box">
        <img 
          src="https://t4.ftcdn.net/jpg/04/81/13/43/360_F_481134373_0W4kg2yKeBRHNEklk4F9UXtGHdub3tYk.jpg" 
          alt="Upload" 
          width="30" 
          height="37" 
          className="upload-logo" 
        />
        <input 
          type="file" 
          onChange={handleImageChange} 
          className="image-input1" 
        />
        <input 
          type="text" 
          placeholder="Ask a question about the image" 
          className="image-input" 
          value={question} 
          onChange={handleQuestionChange} 
        />
        <button onClick={handleUpload} className="send-button">Generate</button>
      </div>

      {answer && (
        <div className="audio-control">
          <button onClick={handleSpeechToggle} className="speech-button">
            {isSpeaking ? 'Stop Speaking' : 'Play Description'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;