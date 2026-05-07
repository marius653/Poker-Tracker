import { Component } from 'react';

export default class RoundPanelErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, info) {
    console.error('Rundepanelet krasjet:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="round-error-panel">
          <h2>Rundevinduet stoppet</h2>
          <p>
            Noe gikk galt i rundepanelet. Timeren kjører fortsatt, og du kan gå
            tilbake til timeren eller reloade siden.
          </p>

          <pre>{String(this.state.error?.message || this.state.error || 'Ukjent feil')}</pre>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Prøv igjen
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
