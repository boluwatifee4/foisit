import React from 'react';
import { AssistantProvider, useAssistant, AssistantActivator } from '@foisit/react-wrapper';

const config = {
  activationCommand: 'react',
  fallbackResponse: 'Sorry, I didn’t understand that.',
  commands: [
    {
      command: 'turn red',
      action: () => (document.body.style.backgroundColor = 'red'),
    },
    {
      command: 'turn blue',
      action: () => (document.body.style.backgroundColor = 'blue'),
    },
    {
      command: 'remove background',
      action: () => (document.body.style.backgroundColor = 'transparent'),
    },
    {
      command: 'show alert',
      action: () => alert('Assistant executed the "show alert" command'),
    },
  ],
};

const App: React.FC = () => {
  return (
    <AssistantProvider config={config}>
      <div style={styles.appContainer}>
        <Header />
        <ControlPanel />
      </div>
    </AssistantProvider>
  );
};

const Header: React.FC = () => (
  <header style={styles.header}>
    <h1>Foisit React Assistant</h1>
    <p>Activate the assistant with "{config.activationCommand}" or use the controls below.</p>
  </header>
);

const ControlPanel: React.FC = () => {
  const assistant = useAssistant();
  const [log, setLog] = React.useState<string[]>([]);

  const addLog = (message: string) => {
    setLog((prev) => [message, ...prev]);
  };

  const handleAddCommand = () => {
    assistant.addCommand('sleep', () => {
      assistant.stopListening();
    });
    addLog('Command "sleep" added.');
  };

  const handleReactivate = () => {
    // assistant.reactivate();
    assistant.startListening();
    addLog('Assistant reactivated.');
  };

  const handleClearLog = () => {
    setLog([]);
  };

  return (
    <main style={styles.controlPanel}>
      <div style={styles.buttonsContainer}>
        <button onClick={handleAddCommand} style={styles.button}>
          Add "Sleep" Command
        </button>
        <button onClick={handleReactivate} style={styles.button}>
          Reactivate Assistant
        </button>
        <button onClick={handleClearLog} style={styles.button}>
          Clear Log
        </button>
      </div>

      <AssistantActivator label="Activate Assistant" />

      <div style={styles.logContainer}>
        <h3>Execution Log:</h3>
        {log.length > 0 ? (
          <ul style={styles.logList}>
            {log.map((entry, index) => (
              <li key={index}>{entry}</li>
            ))}
          </ul>
        ) : (
          <p>No logs yet. Interact with the assistant!</p>
        )}
      </div>
    </main>
  );
};

const styles = {
  appContainer: {
    fontFamily: 'Arial, sans-serif',
    margin: '0 auto',
    padding: '20px',
    maxWidth: '600px',
    textAlign: 'center' as const,
  },
  header: {
    backgroundColor: '#4a90e2',
    color: 'white',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  controlPanel: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#f9f9f9',
  },
  buttonsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap' as const,
  },
  button: {
    padding: '10px 15px',
    fontSize: '14px',
    backgroundColor: '#4a90e2',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  logContainer: {
    marginTop: '20px',
    textAlign: 'left' as const,
  },
  logList: {
    padding: '0',
    margin: '0',
    listStyle: 'none',
  },
};

export default App;
