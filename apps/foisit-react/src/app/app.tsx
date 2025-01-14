import React from 'react';
import { AssistantProvider, useAssistant, AssistantActivator } from '@foisit/react-wrapper';

const config = {
  activationCommand: 'hi', // Activation word
  fallbackResponse: 'Sorry, I didn’t understand that.',
  commands: [
    { command: 'show profile', action: () => console.log('Showing profile...') },
    { command: 'log out', action: () => console.log('Logging out...') },
  ],
};

const App: React.FC = () => {
  const assistant = useAssistant();

  const handleAddCommand = () => {
    assistant.addCommand('make red', () => {
      console.log('Turning red...');
      document.body.style.backgroundColor = 'red';
    });
  };

  const handleReactivate = () => {
    assistant.reactivate(); // Manually reactivate the assistant
  };

  return (
    <AssistantProvider config={config}>
      <div>
        <h1>Foisit React Demo</h1>

        {/* Button to add a new command */}
        <button onClick={handleAddCommand}>Add Command</button>

        {/* Button to manually reactivate assistant */}
        <button onClick={handleReactivate}>Reactivate Assistant</button>

        {/* Optional Assistant Activator */}
        <AssistantActivator label="Activate Assistant" />
      </div>
    </AssistantProvider>
  );
};

export default App;
