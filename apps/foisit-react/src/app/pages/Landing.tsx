// apps/foisit-react/src/app/pages/Landing.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssistant } from '@foisit/react-wrapper';
import '../showcase.css';

const callDevAssistant = async (
  code: string,
  question: string
): Promise<string> => {
  try {
    const res = await fetch(import.meta.env.VITE_DEV_ASSISTANT_PROXY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, question }),
    });

    if (!res.ok) {
      throw new Error(`Dev assistant HTTP error: ${res.status}`);
    }

    const data = (await res.json()) as { answer?: string; message?: string };
    return (
      data.answer || data.message || 'Dev assistant did not return a response.'
    );
  } catch (err) {
    console.error('callDevAssistant failed:', err);
    throw err;
  }
};

const Landing = () => {
  const navigate = useNavigate();
  const assistant = useAssistant();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('foisit-theme', newTheme);
  };

  useEffect(() => {
    // Load saved theme
    const savedTheme = localStorage.getItem('foisit-theme') as
      | 'light'
      | 'dark'
      | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  useEffect(() => {
    // Add landing-specific commands using assistant API
    if (!assistant) return;

    assistant.addCommand({
      command: 'change theme',
      description: 'Switch between light and dark mode',
      action: async () => {
        toggleTheme();
        return `Theme switched to ${
          theme === 'light' ? 'dark' : 'light'
        } mode.`;
      },
    });

    assistant.addCommand({
      command: 'go to playground',
      description: 'Navigate to the interactive playground',
      action: async () => {
        window.location.href = '/playground';
        window.scrollTo(0, 0);
        return 'Navigating to playground...';
      },
    });

    assistant.addCommand({
      id: 'dev_assistant',
      command: 'dev assistant',
      description:
        'Get help with Foisit development questions and code issues (demo only on this site)',
      parameters: [
        {
          name: 'question',
          description: 'Your question about Foisit',
          required: true,
          type: 'string',
        },
        {
          name: 'code',
          description: 'Optional code snippet to analyze',
          required: false,
          type: 'string',
        },
      ],
      action: async (params: any) => {
        try {
          const response = await callDevAssistant(
            params?.code || '',
            params?.question
          );
          return response;
        } catch (error) {
          return { type: 'error', message: `Dev assistant error: ${error}` };
        }
      },
    });

    // Demo commands for use cases
    assistant.addCommand({
      id: 'transfer_money',
      command: 'transfer money',
      description: 'Demo: Transfer money to an account',
      parameters: [
        { name: 'amount', type: 'number', required: true },
        { name: 'toAccount', type: 'string', required: true },
      ],
      critical: true,
      action: async (params: any) => {
        return `Demo: Would transfer $${params.amount} to ${params.toAccount} after confirmation.`;
      },
    });

    assistant.addCommand({
      id: 'book_appointment',
      command: 'book appointment',
      description: 'Demo: Book an appointment',
      parameters: [
        { name: 'patientName', type: 'string', required: true },
        { name: 'date', type: 'date', required: true },
        { name: 'timeSlot', type: 'string', required: true },
      ],
      action: async (params: any) => {
        return `Demo: Appointment booked for ${params.patientName} on ${params.date} at ${params.timeSlot}.`;
      },
    });

    assistant.addCommand({
      id: 'print_shipping_label',
      command: 'print shipping label',
      description: 'Demo: Print shipping label for an order',
      parameters: [{ name: 'orderId', type: 'string', required: true }],
      macro: true,
      action: async (params: any) => {
        return `Demo: Shipping label generated for order #${params.orderId}.`;
      },
    });

    // Cleanup
    return () => {
      assistant.removeCommand('change theme');
      assistant.removeCommand('go to playground');
      assistant.removeCommand('dev assistant');
      assistant.removeCommand('transfer money');
      assistant.removeCommand('book appointment');
      assistant.removeCommand('print shipping label');
    };
  }, []);

  // FinTech code example
  const fintechCode = `// Add a transfer command with built-in safety guardrails
assistant.addCommand({
  // The phrase users will say to trigger this command
  command: 'transfer money',

  // Define required parameters with type validation
  parameters: [
    { name: 'amount', type: 'number', required: true },
    { name: 'toAccount', type: 'string', required: true }
  ],

  // Critical flag halts execution and shows confirmation UI
  critical: true,

  // Your business logic executes only after user confirms
  action: async (params) => {
    await bankingAPI.transfer(params.amount, params.toAccount);
    return \`Transferred $\${params.amount} to \${params.toAccount}\`;
  }
});`;

  // HealthTech code example
  const healthtechCode = `// Add an appointment booking command with auto-forms
assistant.addCommand({
  // Natural language trigger phrase
  command: 'book appointment',

  // When required params are missing, Foisit auto-renders a form
  parameters: [
    { name: 'patientName', type: 'string', required: true },
    { name: 'date', type: 'date', required: true },
    { name: 'timeSlot', type: 'string', required: true }
  ],

  // Action runs once all parameters are collected
  action: async (params) => {
    const appt = await scheduler.book(params);
    return \`Appointment booked for \${params.patientName} on \${params.date}\`;
  }
});`;

  // E-Commerce code example
  const ecommerceCode = `// Add a fast-path command that bypasses AI processing
assistant.addCommand({
  // Exact match triggers instant execution (no LLM call)
  command: 'print shipping label',

  // Parameters extracted via regex for O(1) latency
  parameters: [
    { name: 'orderId', type: 'string', required: true }
  ],

  // Macro mode: bypasses AI for high-frequency actions
  macro: true,

  // Executes immediately without AI interpretation delay
  action: async (params) => {
    const label = await fulfillment.generateLabel(params.orderId);
    window.open(label.pdfUrl, '_blank');
    return \`Label generated for order #\${params.orderId}\`;
  }
});`;

  return (
    <div className="landing-container">
      {/* HERO SECTION */}
      <section
        className="hero"
        style={{ textAlign: 'center', padding: '120px 8% 80px 8%' }}
      >
        <div className="container">
          <div
            className="hero-badge"
            style={{
              display: 'inline-block',
              background: 'rgba(99, 102, 241, 0.1)',
              color: 'var(--accent)',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '24px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            REACT Enterprise SDK
          </div>
          <h1
            className="hero-title"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: '700',
              marginBottom: '24px',
              lineHeight: '1.2',
            }}
          >
            Control Any UI with{' '}
            <span className="gradient-text">Natural Language</span>
          </h1>
          <p
            className="hero-subtitle"
            style={{
              fontSize: '1.25rem',
              color: 'var(--text-secondary)',
              marginBottom: '48px',
              maxWidth: '720px',
              margin: '0 auto 48px auto',
              lineHeight: '1.7',
            }}
          >
            Your users shouldn't need to hunt through menus, forms, buttons and
            multiple inner pages for your important features. Foisit lets them
            describe what they want in plain English, and your app just does it.
          </p>

          <div
            className="live-demo-box"
            style={{
              background: 'var(--bg-alt)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '32px',
              margin: '40px auto',
              maxWidth: '560px',
            }}
          >
            <div
              className="demo-label"
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Try it now on this page
            </div>
            <p
              style={{
                fontSize: '1.1rem',
                color: 'var(--text)',
                marginBottom: '20px',
                lineHeight: '1.6',
              }}
            >
              This page can switch between light and dark themes using plain
              language. Click the button below to open the assistant, then tell
              it in your own words what theme you want — for example,
              <strong style={{ color: 'var(--accent)' }}>
                {' '}
                "switch to dark theme"
              </strong>{' '}
              or
              <strong style={{ color: 'var(--accent)' }}>
                {' '}
                "go back to light"
              </strong>
              .
            </p>
            <button
              className="demo-btn primary"
              onClick={() => assistant && assistant.toggle()}
              style={{
                padding: '16px 32px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                background: 'var(--accent)',
                color: 'white',
                transition: 'all 0.2s',
              }}
            >
              Open the assistant
            </button>
          </div>

          <div
            className="hero-links"
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginTop: '32px',
            }}
          >
            <a
              href="https://www.npmjs.com/package/@foisit/react-wrapper"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-block',
                padding: '14px 28px',
                borderRadius: '8px',
                backgroundColor: 'var(--accent)',
                color: 'white',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.2s',
              }}
            >
              View on npm
            </a>
            <button
              onClick={() => {
                navigate('/playground');
                window.scrollTo(0, 0);
              }}
              style={{
                display: 'inline-block',
                padding: '14px 28px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Try the Playground
            </button>
            <a
              href="#use-cases"
              style={{
                display: 'inline-block',
                padding: '14px 28px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.2s',
              }}
            >
              See Use Cases
            </a>
            <a
              href="https://ng-foisit-demo.netlify.app/"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.2s',
              }}
            >
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQudh5nycYRnJoOsDYIMdoSkkyBLyrovgIEJw&s"
                alt="Angular"
                style={{ width: '20px', height: '20px', objectFit: 'contain' }}
              />
              View Angular Wrapper
            </a>
            <a
              href="https://foisit-vue-demo.netlify.app/"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.2s',
              }}
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Vue.js_Logo_2.svg/960px-Vue.js_Logo_2.svg.png"
                alt="Vue"
                style={{ width: '20px', height: '20px', objectFit: 'contain' }}
              />
              View Vue Wrapper
            </a>
          </div>
        </div>
      </section>

      {/* INDUSTRY USE CASES */}
      <section
        id="use-cases"
        className="section"
        style={{ padding: '100px 8%', backgroundColor: 'var(--bg-alt)' }}
      >
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2
              style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                fontWeight: '700',
                marginBottom: '16px',
                color: 'var(--text)',
              }}
            >
              Works With Any Application
            </h2>
            <p
              style={{
                fontSize: '1.1rem',
                color: 'var(--text-secondary)',
                maxWidth: '700px',
                margin: '0 auto',
                lineHeight: '1.7',
              }}
            >
              From banking platforms to healthcare systems to e-commerce stores
              — if your app has actions, Foisit can make them voice and text
              accessible. Here are just a few examples:
            </p>
          </div>

          <div
            className="use-case-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '32px',
            }}
          >
            {/* FinTech Card */}
            <div
              className="use-case-card"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '32px',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    background: 'rgba(99, 102, 241, 0.1)',
                    color: 'var(--accent)',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                  }}
                >
                  FinTech
                </span>
              </div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: 'var(--text)',
                }}
              >
                Banking & Finance
              </h3>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  marginBottom: '16px',
                  lineHeight: '1.6',
                }}
              >
                User says:{' '}
                <strong>"Transfer fifty thousand to my savings account"</strong>
              </p>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  marginBottom: '20px',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                }}
              >
                The assistant parses the amount, identifies the target account,
                and because this is a critical action, displays a confirmation
                dialog before executing. No accidental transfers.
              </p>
              <pre
                className="code-block"
                style={{
                  background: '#1e1e2e',
                  borderRadius: '8px',
                  padding: '16px',
                  fontSize: '12px',
                  overflow: 'auto',
                  marginBottom: '20px',
                  color: '#cdd6f4',
                  textAlign: 'left',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                <code style={{ color: '#cdd6f4' }}>{fintechCode}</code>
              </pre>
              <button
                onClick={() =>
                  assistant &&
                  assistant.runCommand({
                    commandId: 'transfer_money',
                    params: { amount: null, toAccount: null },
                    openOverlay: true,
                    showInvocation: true,
                  })
                }
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--accent)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Try Demo Now
              </button>
            </div>

            {/* HealthTech Card */}
            <div
              className="use-case-card"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '32px',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    background: 'rgba(34, 197, 94, 0.1)',
                    color: '#22c55e',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                  }}
                >
                  HealthTech
                </span>
              </div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: 'var(--text)',
                }}
              >
                Healthcare & Scheduling
              </h3>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  marginBottom: '16px',
                  lineHeight: '1.6',
                }}
              >
                User says: <strong>"Book an appointment for Sarah"</strong>
              </p>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  marginBottom: '20px',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                }}
              >
                The assistant detects missing required fields (date, time) and
                automatically renders a form inside the chat widget. No
                back-and-forth. No confusion. Just a clean UI.
              </p>
              <pre
                className="code-block"
                style={{
                  background: '#1e1e2e',
                  borderRadius: '8px',
                  padding: '16px',
                  fontSize: '12px',
                  overflow: 'auto',
                  marginBottom: '20px',
                  color: '#cdd6f4',
                  textAlign: 'left',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                <code style={{ color: '#cdd6f4' }}>{healthtechCode}</code>
              </pre>
              <button
                onClick={() =>
                  assistant &&
                  assistant.runCommand({
                    commandId: 'book_appointment',
                    params: {
                      patientName: null,
                      date: null,
                      timeSlot: null,
                    },
                    openOverlay: true,
                    showInvocation: true,
                  })
                }
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--accent)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Try Demo Now
              </button>
            </div>

            {/* E-Commerce Card */}
            <div
              className="use-case-card"
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '32px',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    background: 'rgba(249, 115, 22, 0.1)',
                    color: '#f97316',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                  }}
                >
                  E-Commerce
                </span>
              </div>
              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '12px',
                  color: 'var(--text)',
                }}
              >
                Logistics & Fulfillment
              </h3>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  marginBottom: '16px',
                  lineHeight: '1.6',
                }}
              >
                User says:{' '}
                <strong>"Print shipping label for order 12345"</strong>
              </p>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  marginBottom: '20px',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                }}
              >
                For high-frequency actions, Foisit can bypass the AI entirely
                using macro mode. The command executes instantly with zero
                latency — perfect for support teams.
              </p>
              <pre
                className="code-block"
                style={{
                  background: '#1e1e2e',
                  borderRadius: '8px',
                  padding: '16px',
                  fontSize: '12px',
                  overflow: 'auto',
                  marginBottom: '20px',
                  color: '#cdd6f4',
                  textAlign: 'left',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                <code style={{ color: '#cdd6f4' }}>{ecommerceCode}</code>
              </pre>
              <button
                onClick={() =>
                  assistant &&
                  assistant.runCommand({
                    commandId: 'print_shipping_label',
                    params: { orderId: null },
                    openOverlay: true,
                    showInvocation: true,
                  })
                }
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--accent)',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Try Demo Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* DEV ASSISTANT SECTION */}
      <section className="section" style={{ padding: '100px 8%' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '64px',
              alignItems: 'center',
            }}
          >
            <div>
              <div
                className="section-badge"
                style={{
                  display: 'inline-block',
                  background: 'rgba(99, 102, 241, 0.1)',
                  color: 'var(--accent)',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '20px',
                }}
              >
                Built-in Dev Tools
              </div>
              <h2
                style={{
                  fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                  fontWeight: '700',
                  marginBottom: '16px',
                  color: 'var(--text)',
                }}
              >
                Need Help Integrating Foisit?
              </h2>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  lineHeight: '1.7',
                  marginBottom: '24px',
                }}
              >
                If you're stuck, open the assistant for troubleshooting, code
                snippets, and personalized commands — right in this demo.
              </p>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  lineHeight: '1.7',
                  marginBottom: '24px',
                }}
              >
                Type a question like:{' '}
                <em>"How do I add file upload to a command?"</em> — and get an
                immediate, contextual answer right inside the widget.
              </p>
              <button
                className="demo-btn primary"
                onClick={() =>
                  assistant &&
                  assistant.runCommand({
                    commandId: 'dev_assistant',
                    params: {
                      question: null,
                      code: null,
                    },
                    openOverlay: true,
                    showInvocation: true,
                  })
                }
                style={{
                  padding: '14px 28px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: 'var(--accent)',
                  color: 'white',
                  marginBottom: '24px',
                }}
              >
                Try out Dev Assistant
              </button>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li
                  style={{ padding: '8px 0', color: 'var(--text-secondary)' }}
                >
                  Ask about command configuration
                </li>
                <li
                  style={{ padding: '8px 0', color: 'var(--text-secondary)' }}
                >
                  Get code snippets and examples
                </li>
                <li
                  style={{ padding: '8px 0', color: 'var(--text-secondary)' }}
                >
                  Troubleshoot integration issues
                </li>
                <li
                  style={{ padding: '8px 0', color: 'var(--text-secondary)' }}
                >
                  Learn about advanced features
                </li>
              </ul>
            </div>
            <div
              style={{
                background: 'var(--bg-alt)',
                borderRadius: '16px',
                padding: '32px',
              }}
            >
              <div
                style={{
                  marginBottom: '16px',
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                }}
              >
                Example conversation:
              </div>
              <div
                style={{
                  background: 'var(--bg)',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '12px',
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    marginBottom: '4px',
                  }}
                >
                  You:
                </div>
                <div style={{ color: 'var(--text)' }}>
                  "How do I make a command show a confirmation before running?"
                </div>
              </div>
              <div
                style={{
                  background: 'var(--bg)',
                  borderRadius: '8px',
                  padding: '16px',
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    color: 'var(--accent)',
                    marginBottom: '4px',
                  }}
                >
                  Dev Assistant:
                </div>
                <div
                  style={{
                    color: 'var(--text)',
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                  }}
                >
                  Add the{' '}
                  <code
                    style={{
                      background: 'var(--bg-alt)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    critical: true
                  </code>{' '}
                  property to your command config. This will display a
                  confirmation dialog before the action executes...
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUPPORT ASSISTANT SECTION */}
      <section
        className="section"
        style={{ padding: '100px 8%', backgroundColor: 'var(--bg-alt)' }}
      >
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div
              className="section-badge"
              style={{
                display: 'inline-block',
                background: 'rgba(99, 102, 241, 0.1)',
                color: 'var(--accent)',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '20px',
              }}
            >
              Customer Support
            </div>
            <h2
              style={{
                fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                fontWeight: '700',
                marginBottom: '16px',
                color: 'var(--text)',
              }}
            >
              Turn Your Assistant Into a Support Agent
            </h2>
            <p
              style={{
                fontSize: '1.1rem',
                color: 'var(--text-secondary)',
                maxWidth: '700px',
                margin: '0 auto',
                lineHeight: '1.7',
              }}
            >
              Feed your assistant with product knowledge, FAQs, and support
              policies. It can answer customer questions, escalate issues to
              human agents, and even trigger backend actions — all from natural
              conversation.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '32px',
            }}
          >
            <div
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '24px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(99, 102, 241, 0.1)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  color: 'var(--accent)',
                  fontSize: '20px',
                  fontWeight: '700',
                }}
              >
                Q
              </div>
              <h4
                style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: 'var(--text)',
                }}
              >
                Answer Questions Instantly
              </h4>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                }}
              >
                Feed your knowledge base, FAQs, or documentation. Users get
                immediate, accurate answers without waiting for a human.
              </p>
            </div>

            <div
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '24px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(249, 115, 22, 0.1)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  color: '#f97316',
                  fontSize: '20px',
                  fontWeight: '700',
                }}
              >
                !
              </div>
              <h4
                style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: 'var(--text)',
                }}
              >
                Escalate When Needed
              </h4>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                }}
              >
                Define escalation triggers. When a user says "speak to a human"
                or the assistant can't resolve an issue, route to your support
                team automatically.
              </p>
            </div>

            <div
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '24px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(34, 197, 94, 0.1)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  color: '#22c55e',
                  fontSize: '20px',
                  fontWeight: '700',
                }}
              >
                A
              </div>
              <h4
                style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: 'var(--text)',
                }}
              >
                Take Action on Behalf of Users
              </h4>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                }}
              >
                "Cancel my subscription" or "Refund my last order" — the
                assistant can execute real actions, not just provide canned
                responses.
              </p>
            </div>
          </div>

          <div style={{ marginTop: '48px', textAlign: 'center' }}>
            <pre
              style={{
                display: 'inline-block',
                background: '#1e1e2e',
                borderRadius: '8px',
                padding: '20px 32px',
                fontSize: '13px',
                color: '#cdd6f4',
                textAlign: 'left',
                maxWidth: '100%',
                overflow: 'auto',
              }}
            >
              <code
                style={{ color: '#cdd6f4' }}
              >{`// Example: Escalate to human support
assistant.addCommand({
  command: 'speak to human',
  description: 'Connect user with a live support agent',
  action: async () => {
    await supportAPI.createTicket({ priority: 'high' });
    return 'Connecting you with a support agent now...';
  }
});`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* CTO SECTION */}
      <section className="section" style={{ padding: '100px 8%' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '64px',
              alignItems: 'start',
            }}
          >
            <div>
              <div
                className="section-badge"
                style={{
                  display: 'inline-block',
                  background: 'rgba(99, 102, 241, 0.1)',
                  color: 'var(--accent)',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '20px',
                }}
              >
                For Technical Leaders
              </div>
              <h2
                style={{
                  fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                  fontWeight: '700',
                  marginBottom: '16px',
                  color: 'var(--text)',
                }}
              >
                Enterprise-Ready from Day One
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
                We know you've seen libraries that promise easy integration but
                end up breaking your existing styles, leaking state, or
                requiring a complete architecture overhaul. Foisit is different.
              </p>
            </div>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '20px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: 'var(--accent)',
                    fontWeight: '600',
                  }}
                >
                  1
                </div>
                <div>
                  <h4
                    style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      marginBottom: '4px',
                      color: 'var(--text)',
                    }}
                  >
                    Complete Style Isolation
                  </h4>
                  <p
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem',
                      lineHeight: '1.5',
                    }}
                  >
                    Renders in its own DOM scope with scoped CSS variables. Your
                    Tailwind, Bootstrap, or custom styles remain untouched.
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '20px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: 'var(--accent)',
                    fontWeight: '600',
                  }}
                >
                  2
                </div>
                <div>
                  <h4
                    style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      marginBottom: '4px',
                      color: 'var(--text)',
                    }}
                  >
                    Zero State Pollution
                  </h4>
                  <p
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem',
                      lineHeight: '1.5',
                    }}
                  >
                    Uses React Context internally. Your Redux, Zustand, or MobX
                    stores stay clean. No global side effects.
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '20px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: 'var(--accent)',
                    fontWeight: '600',
                  }}
                >
                  3
                </div>
                <div>
                  <h4
                    style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      marginBottom: '4px',
                      color: 'var(--text)',
                    }}
                  >
                    Secure by Default
                  </h4>
                  <p
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem',
                      lineHeight: '1.5',
                    }}
                  >
                    API keys never reach the browser. All AI processing routes
                    through your own backend proxy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          textAlign: 'center',
          padding: '100px 8%',
          background:
            'linear-gradient(180deg, var(--bg-alt) 0%, var(--bg) 100%)',
        }}
      >
        <div className="container">
          <h2
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: '700',
              marginBottom: '16px',
              color: 'var(--text)',
            }}
          >
            Add Natural Language to Your App Today
          </h2>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '1.1rem',
              marginBottom: '32px',
              maxWidth: '600px',
              margin: '0 auto 32px auto',
            }}
          >
            Install in seconds. Configure in minutes and progressively. Ship
            features your users will actually use.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '48px',
            }}
          >
            <a
              href="https://www.npmjs.com/package/@foisit/react-wrapper"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-block',
                padding: '16px 32px',
                borderRadius: '8px',
                backgroundColor: 'var(--accent)',
                color: 'white',
                textDecoration: 'none',
                fontSize: '18px',
                fontWeight: '600',
                transition: 'all 0.2s',
              }}
            >
              Get Started on npm
            </a>
            <button
              onClick={() => navigate('/playground')}
              style={{
                padding: '16px 32px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Try Interactive Examples
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '24px',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '24px',
            }}
          >
            <a
              href="https://github.com/AstroBookings/foisit"
              target="_blank"
              rel="noreferrer"
              style={{
                color: 'var(--text-secondary)',
                transition: 'color 0.2s',
              }}
              title="View on GitHub"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
          </div>

          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            <p style={{ marginBottom: '8px' }}>
              <code
                style={{
                  background: 'var(--bg-alt)',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                }}
              >
                npm install @foisit/react-wrapper
              </code>
            </p>
            <p style={{ marginTop: '16px' }}>
              Questions? Reach out at{' '}
              <a
                href="mailto:boluwatifee4@gmail.com"
                style={{ color: 'var(--accent)', textDecoration: 'none' }}
              >
                boluwatifee4@gmail.com
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
